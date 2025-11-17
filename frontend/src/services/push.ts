/**
 * Push Notification Service
 * Handles web push notification subscriptions and management
 */

import { API_URL } from '../config/api';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export type PushSubscriptionData = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Workers not supported');
    }

    if (!('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
    } catch (error) {
      console.error('Failed to get service worker registration:', error);
      throw error;
    }
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Check current notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Convert VAPID public key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(token: string): Promise<PushSubscriptionData> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    // Check permission
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Subscribe to push service
    const subscription = await this.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Convert subscription to our format
    const subscriptionData = this.subscriptionToData(subscription);

    // Send subscription to backend
    await this.sendSubscriptionToBackend(token, subscriptionData);

    return subscriptionData;
  }

  /**
   * Convert PushSubscription to our data format
   */
  private subscriptionToData(subscription: PushSubscription): PushSubscriptionData {
    const key = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    if (!key || !auth) {
      throw new Error('Invalid subscription keys');
    }

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(key),
        auth: this.arrayBufferToBase64(auth),
      },
    };
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Send subscription to backend
   */
  private async sendSubscriptionToBackend(
    token: string,
    subscription: PushSubscriptionData
  ): Promise<void> {
    const response = await fetch(`${API_URL}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to subscribe to push notifications';
      try {
        const data = await response.json();
        errorMessage = data.error?.message || data.error || data.message || errorMessage;
      } catch {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(token: string): Promise<void> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    // Get current subscription
    const subscription = await this.registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe from push service
      await subscription.unsubscribe();

      // Notify backend
      await this.removeSubscriptionFromBackend(token, subscription.endpoint);
    }
  }

  /**
   * Remove subscription from backend
   */
  private async removeSubscriptionFromBackend(
    token: string,
    endpoint: string
  ): Promise<void> {
    const response = await fetch(`${API_URL}/api/push/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to unsubscribe from push notifications';
      try {
        const data = await response.json();
        errorMessage = data.error?.message || data.error || data.message || errorMessage;
      } catch {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * Check if user is currently subscribed
   */
  async isSubscribed(): Promise<boolean> {
    if (!this.registration) {
      try {
        await this.initialize();
      } catch {
        return false;
      }
    }

    if (!this.registration) {
      return false;
    }

    const subscription = await this.registration.pushManager.getSubscription();
    return subscription !== null;
  }

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      return null;
    }

    return await this.registration.pushManager.getSubscription();
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    token: string,
    preferences: {
      follows?: boolean;
      comments?: boolean;
      videos?: boolean;
    }
  ): Promise<void> {
    const response = await fetch(`${API_URL}/api/push/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update preferences';
      try {
        const data = await response.json();
        errorMessage = data.error?.message || data.error || data.message || errorMessage;
      } catch {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(token: string): Promise<{
    follows: boolean;
    comments: boolean;
    videos: boolean;
  }> {
    const response = await fetch(`${API_URL}/api/push/preferences`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to get preferences';
      try {
        const data = await response.json();
        errorMessage = data.error?.message || data.error || data.message || errorMessage;
      } catch {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  /**
   * Test push notification
   */
  async testNotification(token: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/push/test`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to send test notification';
      try {
        const data = await response.json();
        errorMessage = data.error?.message || data.error || data.message || errorMessage;
      } catch {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }
  }
}

export const pushService = new PushNotificationService();


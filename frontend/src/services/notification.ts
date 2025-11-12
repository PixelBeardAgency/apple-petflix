import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class NotificationService {
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async getNotifications(limit: number = 20, offset: number = 0, unreadOnly: boolean = false) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in to view notifications');
    }

    const response = await fetch(
      `${API_URL}/api/notifications?limit=${limit}&offset=${offset}&unreadOnly=${unreadOnly}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get notifications');
    }

    return response.json();
  }

  async markAsRead(notificationId: string) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in');
    }

    const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to mark notification as read');
    }

    return response.json();
  }

  async markAllAsRead() {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error('You must be logged in');
    }

    const response = await fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to mark all as read');
    }

    return response.json();
  }

  async getUnreadCount(): Promise<number> {
    const token = await this.getAuthToken();
    if (!token) {
      return 0;
    }

    const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.count;
  }
}

export const notificationService = new NotificationService();


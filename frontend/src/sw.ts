/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);

// Clean up old caches
cleanupOutdatedCaches();

// Handle navigation requests with app shell
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
});
registerRoute(navigationRoute);

// API calls - Network first with cache fallback
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 5, // 5 minutes
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
    networkTimeoutSeconds: 10,
  })
);

// Supabase API
registerRoute(
  ({ url }) => url.origin.includes('supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24, // 1 day
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
    networkTimeoutSeconds: 10,
  })
);

// YouTube thumbnails
registerRoute(
  ({ url }) => url.origin === 'https://i.ytimg.com',
  new CacheFirst({
    cacheName: 'youtube-thumbnails',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// External images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// =====================================================
// PUSH NOTIFICATION HANDLERS
// =====================================================

/**
 * Handle push notification received
 */
self.addEventListener('push', (event: PushEvent) => {
  console.log('Push notification received:', event);

  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (error) {
    console.error('Failed to parse push notification data:', error);
    notificationData = {
      title: 'Petflix',
      body: event.data.text(),
    };
  }

  const { title, body, icon, badge, url, tag } = notificationData;

  const options: NotificationOptions = {
    body: body || 'You have a new notification',
    icon: icon || '/icons/icon-192x192.png',
    badge: badge || '/icons/icon-96x96.png',
    tag: tag || 'petflix-notification',
    data: {
      url: url || '/',
      timestamp: Date.now(),
    },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title || 'Petflix', options)
  );
});

/**
 * Handle notification click
 */
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  // Handle action buttons
  if (event.action === 'dismiss') {
    // Just close the notification
    return;
  }

  // Open the URL (view action or click on notification body)
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }

        // Open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

/**
 * Handle notification close
 */
self.addEventListener('notificationclose', (event: NotificationEvent) => {
  console.log('Notification closed:', event);
  
  // Track notification dismissal if needed
  const dismissalData = {
    timestamp: Date.now(),
    tag: event.notification.tag,
  };

  // Could send analytics here
  console.log('Notification dismissed:', dismissalData);
});

/**
 * Handle push subscription change
 */
self.addEventListener('pushsubscriptionchange', (event: any) => {
  console.log('Push subscription changed:', event);

  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: event.oldSubscription?.options.applicationServerKey,
      })
      .then((subscription) => {
        console.log('Re-subscribed to push notifications:', subscription);
        
        // Send new subscription to backend
        // This would need the auth token which we don't have in SW context
        // The app should detect this and re-subscribe
      })
      .catch((error) => {
        console.error('Failed to re-subscribe:', error);
      })
  );
});

// Skip waiting and claim clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});


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
  console.log('[Service Worker] Push notification received:', event);
  console.log('[Service Worker] Has data:', !!event.data);

  if (!event.data) {
    console.log('[Service Worker] Push event but no data');
    return;
  }

  let notificationData;
  try {
    const rawData = event.data.text();
    console.log('[Service Worker] Raw push data:', rawData);
    notificationData = JSON.parse(rawData);
    console.log('[Service Worker] Parsed notification data:', notificationData);
  } catch (error) {
    console.error('[Service Worker] Failed to parse push notification data:', error);
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
    requireInteraction: false,
  } as NotificationOptions;

  console.log('[Service Worker] Showing notification:', title, options);

  event.waitUntil(
    self.registration.showNotification(title || 'Petflix', options)
      .then(() => {
        console.log('[Service Worker] Notification displayed successfully');
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to show notification:', error);
      })
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
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList: readonly WindowClient[]) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }

        // Open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
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
  console.log('[Service Worker] Push subscription changed:', event);
  
  // Note: We can't re-subscribe here because we don't have access to the VAPID key
  // or auth token in the service worker context.
  // The application should detect this and prompt the user to re-enable notifications.
  console.log('[Service Worker] Subscription changed - user should re-enable notifications in app');
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


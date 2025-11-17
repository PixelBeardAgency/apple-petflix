import 'dotenv/config';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../services/logger';

const router = Router();

// Create Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Configure web-push
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@petflix.app';

// Validate VAPID keys are configured
if (!vapidPublicKey || !vapidPrivateKey) {
  logger.error('VAPID keys not configured!', {
    hasPublicKey: !!vapidPublicKey,
    hasPrivateKey: !!vapidPrivateKey,
  });
} else {
  logger.info('VAPID keys configured successfully');
}

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

/**
 * POST /api/push/subscribe
 * Subscribe to push notifications
 */
router.post('/subscribe', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { endpoint, keys } = req.body;

    logger.info('Push subscription request received', {
      userId,
      hasEndpoint: !!endpoint,
      hasKeys: !!keys,
      hasP256dh: !!keys?.p256dh,
      hasAuth: !!keys?.auth,
    });

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      logger.error('Invalid subscription data', {
        endpoint: !!endpoint,
        keys: !!keys,
        p256dh: !!keys?.p256dh,
        auth: !!keys?.auth,
        bodyKeys: Object.keys(req.body),
      });
      throw new AppError('Invalid subscription data. Missing endpoint or keys.', 400);
    }

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .single();

    if (existing) {
      logger.info(`User ${userId} already has subscription for this endpoint`);
      res.json({ message: 'Already subscribed' });
      return;
    }

    // Insert new subscription
    const { error } = await supabase.from('push_subscriptions').insert({
      user_id: userId,
      endpoint,
      p256dh_key: keys.p256dh,
      auth_key: keys.auth,
    });

    if (error) {
      logger.error('Failed to save push subscription:', error);
      throw new AppError('Failed to subscribe', 500);
    }

    logger.info(`User ${userId} subscribed to push notifications`);
    res.json({ message: 'Subscribed successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/push/unsubscribe
 * Unsubscribe from push notifications
 */
router.post('/unsubscribe', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { endpoint } = req.body;

    if (!endpoint) {
      throw new AppError('Endpoint is required', 400);
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint);

    if (error) {
      logger.error('Failed to remove push subscription:', error);
      throw new AppError('Failed to unsubscribe', 500);
    }

    logger.info(`User ${userId} unsubscribed from push notifications`);
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/push/preferences
 * Get notification preferences
 */
router.get('/preferences', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Get preferences from profiles table (we'll add these columns)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('notification_follows, notification_comments, notification_videos')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Failed to get preferences:', error);
      throw new AppError('Failed to get preferences', 500);
    }

    res.json({
      follows: profile?.notification_follows ?? true,
      comments: profile?.notification_comments ?? true,
      videos: profile?.notification_videos ?? true,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/push/preferences
 * Update notification preferences
 */
router.put('/preferences', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { follows, comments, videos } = req.body;

    const updates: any = {};
    if (follows !== undefined) updates.notification_follows = follows;
    if (comments !== undefined) updates.notification_comments = comments;
    if (videos !== undefined) updates.notification_videos = videos;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      logger.error('Failed to update preferences:', error);
      throw new AppError('Failed to update preferences', 500);
    }

    logger.info(`User ${userId} updated notification preferences`);
    res.json({ message: 'Preferences updated' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/push/test
 * Send a test notification
 */
router.post('/test', authenticateUser, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    logger.info(`Test notification requested by user ${userId}`);

    // Get user subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      logger.error('Failed to get subscriptions:', error);
      throw new AppError('Failed to send notification', 500);
    }

    logger.info(`Found ${subscriptions?.length || 0} subscriptions for user ${userId}`);

    if (!subscriptions || subscriptions.length === 0) {
      throw new AppError('No active subscriptions found. Please enable push notifications first.', 400);
    }

    const payload = JSON.stringify({
      title: 'Test Notification',
      body: 'This is a test notification from Petflix!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url: '/feed',
    });

    logger.info(`Sending test notification to ${subscriptions.length} subscription(s)`);

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush
          .sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh_key,
                auth: sub.auth_key,
              },
            },
            payload
          )
          .then(() => {
            logger.info(`Successfully sent to ${sub.endpoint}`);
            return { success: true, endpoint: sub.endpoint };
          })
          .catch((err) => {
            logger.error(`Failed to send to ${sub.endpoint}:`, {
              error: err.message,
              statusCode: err.statusCode,
              body: err.body,
            });
            // Remove invalid subscriptions
            if (err.statusCode === 410) {
              supabase.from('push_subscriptions').delete().eq('id', sub.id);
              logger.info(`Removed invalid subscription ${sub.id}`);
            }
            return { success: false, endpoint: sub.endpoint, error: err.message };
          })
      )
    );

    const successCount = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failCount = results.length - successCount;

    logger.info(`Test notification results: ${successCount} successful, ${failCount} failed`);

    if (successCount === 0) {
      throw new AppError('Failed to send notification to any subscription. Check browser console for errors.', 500);
    }

    res.json({ 
      message: `Test notification sent to ${successCount} device(s)`,
      details: {
        total: results.length,
        successful: successCount,
        failed: failCount,
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Send notification to user (internal function)
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  url: string,
  type: 'follow' | 'comment' | 'video'
) {
  try {
    // Get user preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('notification_follows, notification_comments, notification_videos')
      .eq('id', userId)
      .single();

    // Check if user wants this type of notification
    if (type === 'follow' && profile?.notification_follows === false) return;
    if (type === 'comment' && profile?.notification_comments === false) return;
    if (type === 'video' && profile?.notification_videos === false) return;

    // Get user subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url,
      tag: `petflix-${type}`,
    });

    // Send to all subscriptions
    const promises = subscriptions.map((sub) =>
      webpush
        .sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh_key,
              auth: sub.auth_key,
            },
          },
          payload
        )
        .catch((err) => {
          logger.error(`Failed to send push to ${sub.endpoint}:`, err);
          // Remove invalid subscriptions (410 Gone)
          if (err.statusCode === 410) {
            supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }
        })
    );

    await Promise.all(promises);
    logger.info(`Push notification sent to user ${userId}: ${title}`);
  } catch (error) {
    logger.error('Failed to send push notification:', error);
  }
}

export default router;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/notification';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { EmptyState } from '../components/EmptyState';
import { formatRelativeTime } from '../lib/utils';
import { Bell, Settings } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  content: string;
  read: boolean;
  created_at: string;
  related_user?: {
    id: string;
    username: string;
    profile_picture_url?: string;
  };
  related_video?: {
    id: string;
    title: string;
  };
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await notificationService.getNotifications(50, 0);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.related_video) {
      return `/video/${notification.related_video.id}`;
    }
    if (notification.related_user) {
      return `/profile/${notification.related_user.id}`;
    }
    return '#';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <div className="flex gap-2">
            <Link to="/notification-settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            {notifications.some((n) => !n.read) && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Card className="mb-4 border-destructive">
            <CardContent className="p-4 text-destructive">{error}</CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="You'll see notifications here when someone likes, comments, or follows you."
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${
                  !notification.read ? 'bg-muted/50' : ''
                }`}
              >
                <CardContent className="p-4">
                  <Link
                    to={getNotificationLink(notification)}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    className="block hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-start space-x-3">
                      {notification.related_user && (
                        <img
                          src={
                            notification.related_user.profile_picture_url ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.related_user.id}`
                          }
                          alt={notification.related_user.username}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          {notification.related_user && (
                            <span className="font-semibold">
                              {notification.related_user.username}
                            </span>
                          )}{' '}
                          {notification.content}
                        </p>
                        {notification.related_video && (
                          <p className="text-sm text-muted-foreground mt-1">
                            "{notification.related_video.title}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


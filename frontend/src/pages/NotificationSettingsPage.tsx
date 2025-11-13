import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { pushService } from '../services/push';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function NotificationSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState({
    follows: true,
    comments: true,
    videos: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Check if subscribed
      const subscribed = await pushService.isSubscribed();
      setIsSubscribed(subscribed);

      // Load preferences if subscribed
      if (subscribed) {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        
        if (token) {
          const prefs = await pushService.getPreferences(token);
          setPreferences(prefs);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;

    setSubscribing(true);
    setError(null);
    setSuccess(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      await pushService.subscribe(token);
      setIsSubscribed(true);
      setSuccess('Successfully subscribed to push notifications!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) return;

    setSubscribing(true);
    setError(null);
    setSuccess(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      await pushService.unsubscribe(token);
      setIsSubscribed(false);
      setSuccess('Successfully unsubscribed from push notifications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
    } finally {
      setSubscribing(false);
    }
  };

  const handlePreferenceChange = async (key: keyof typeof preferences, value: boolean) => {
    if (!user || !isSubscribed) return;

    setPreferences((prev) => ({ ...prev, [key]: value }));
    setError(null);
    setSuccess(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      await pushService.updatePreferences(token, { [key]: value });
      setSuccess('Preferences updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      // Revert on error
      setPreferences((prev) => ({ ...prev, [key]: !value }));
    }
  };

  const handleTestNotification = async () => {
    if (!user || !isSubscribed) return;

    setError(null);
    setSuccess(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      await pushService.testNotification(token);
      setSuccess('Test notification sent! Check your notifications.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test notification');
    }
  };

  const permissionStatus = pushService.getPermissionStatus();
  const isSupported = pushService.isSupported();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Notification Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your push notification preferences
            </p>
          </div>

          {!isSupported && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">
                  Push notifications are not supported in your browser.
                </p>
              </CardContent>
            </Card>
          )}

          {isSupported && permissionStatus === 'denied' && (
            <Card className="border-yellow-500">
              <CardContent className="pt-6">
                <p className="text-yellow-600 dark:text-yellow-500 mb-2">
                  You have blocked notifications for this site.
                </p>
                <p className="text-sm text-muted-foreground">
                  To enable notifications, please change your browser settings and reload the page.
                </p>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="p-4 rounded-md bg-destructive/15 text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-md bg-green-500/15 text-green-600 dark:text-green-500">
              {success}
            </div>
          )}

          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Loading settings...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Subscription Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {isSubscribed ? (
                      <Bell className="h-5 w-5 text-primary" />
                    ) : (
                      <BellOff className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span>Push Notifications</span>
                  </CardTitle>
                  <CardDescription>
                    {isSubscribed
                      ? 'You are subscribed to push notifications'
                      : 'Subscribe to receive notifications on this device'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isSubscribed ? (
                    <>
                      <Button
                        onClick={handleUnsubscribe}
                        disabled={subscribing}
                        variant="destructive"
                        className="w-full sm:w-auto"
                      >
                        {subscribing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Unsubscribing...
                          </>
                        ) : (
                          <>
                            <BellOff className="h-4 w-4 mr-2" />
                            Unsubscribe
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleTestNotification}
                        variant="outline"
                        className="w-full sm:w-auto sm:ml-2"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Send Test Notification
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleSubscribe}
                      disabled={subscribing || !isSupported || permissionStatus === 'denied'}
                      className="w-full sm:w-auto"
                    >
                      {subscribing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <Bell className="h-4 w-4 mr-2" />
                          Enable Notifications
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              {isSubscribed && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Types</CardTitle>
                    <CardDescription>
                      Choose which notifications you want to receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">New Followers</p>
                        <p className="text-sm text-muted-foreground">
                          When someone follows you
                        </p>
                      </div>
                      <Button
                        variant={preferences.follows ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePreferenceChange('follows', !preferences.follows)}
                      >
                        {preferences.follows ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Comments</p>
                        <p className="text-sm text-muted-foreground">
                          When someone comments on your video
                        </p>
                      </div>
                      <Button
                        variant={preferences.comments ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePreferenceChange('comments', !preferences.comments)}
                      >
                        {preferences.comments ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">New Videos</p>
                        <p className="text-sm text-muted-foreground">
                          When people you follow share videos
                        </p>
                      </div>
                      <Button
                        variant={preferences.videos ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePreferenceChange('videos', !preferences.videos)}
                      >
                        {preferences.videos ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>About Push Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    • Push notifications work even when Petflix is not open
                  </p>
                  <p>
                    • Notifications are sent to this device only
                  </p>
                  <p>
                    • You can unsubscribe at any time
                  </p>
                  <p>
                    • Some browsers may require HTTPS to support push notifications
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}


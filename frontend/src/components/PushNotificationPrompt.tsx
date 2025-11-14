import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { pushService } from '../services/push';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function PushNotificationPrompt() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkShouldShow();
  }, [user]);

  const checkShouldShow = async () => {
    if (!user) {
      setShow(false);
      return;
    }

    // Don't show if notifications not supported
    if (!pushService.isSupported()) {
      setShow(false);
      return;
    }

    // Don't show if user already made a decision
    const dismissed = localStorage.getItem('push-prompt-dismissed');
    if (dismissed === 'true') {
      setShow(false);
      return;
    }

    // Don't show if permission already granted or denied
    const permission = pushService.getPermissionStatus();
    if (permission !== 'default') {
      setShow(false);
      return;
    }

    // Check if already subscribed
    const subscribed = await pushService.isSubscribed();
    if (subscribed) {
      setShow(false);
      return;
    }

    // Show after 30 seconds on the site
    const timer = setTimeout(() => {
      setShow(true);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  };

  const handleEnable = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Get user token (from Supabase session)
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      const token = data?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      await pushService.subscribe(token);
      setShow(false);
      localStorage.setItem('push-prompt-dismissed', 'true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable notifications');
      console.error('Failed to enable push notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('push-prompt-dismissed', 'true');
    
    // Allow showing again after 7 days
    setTimeout(() => {
      localStorage.removeItem('push-prompt-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Enable Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            Stay updated with notifications when:
          </CardDescription>
          
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Someone follows you</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Someone comments on your video</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>People you follow share new videos</span>
            </li>
          </ul>

          {error && (
            <div className="p-2 rounded-md bg-destructive/15 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={handleEnable}
              disabled={loading}
              className="flex-1"
            >
              <Bell className="h-4 w-4 mr-2" />
              {loading ? 'Enabling...' : 'Enable'}
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1"
            >
              <BellOff className="h-4 w-4 mr-2" />
              Not Now
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You can change this anytime in your profile settings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


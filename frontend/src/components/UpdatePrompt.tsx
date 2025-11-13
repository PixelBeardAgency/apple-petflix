import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('SW Registered:', registration);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm animate-in slide-in-from-left">
      <div className="bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
        <div className="flex items-start space-x-3">
          <RefreshCw className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Update Available</h4>
            <p className="text-sm opacity-90 mb-3">
              A new version of Petflix is available. Reload to update.
            </p>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => updateServiceWorker(true)}
              >
                Reload Now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setNeedRefresh(false)}
                className="text-primary-foreground hover:text-primary-foreground/80"
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


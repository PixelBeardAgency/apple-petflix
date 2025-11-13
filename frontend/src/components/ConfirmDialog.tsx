import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="max-w-md mx-4 shadow-2xl">
        <CardHeader>
          <div className="flex items-start space-x-3">
            {variant === 'destructive' && (
              <div className="rounded-full bg-destructive/15 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            )}
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription className="mt-2">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import type { TutorialStep } from '../services/onboarding';

interface TutorialOverlayProps {
  step: TutorialStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function TutorialOverlay({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
}: TutorialOverlayProps) {
  const [targetPosition, setTargetPosition] = useState<DOMRect | null>(null);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isCenterStep = step.position === 'center' || !step.target;

  useEffect(() => {
    if (step.target && !isCenterStep) {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition(rect);
        
        // Highlight style
        setHighlightStyle({
          position: 'fixed',
          top: `${rect.top - 8}px`,
          left: `${rect.left - 8}px`,
          width: `${rect.width + 16}px`,
          height: `${rect.height + 16}px`,
          border: '3px solid hsl(var(--primary))',
          borderRadius: '8px',
          pointerEvents: 'none',
          zIndex: 60,
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        });

        // Tooltip position based on step.position
        const tooltipPos = calculateTooltipPosition(rect, step.position);
        setTooltipStyle(tooltipPos);
      } else {
        // Element not found, show in center
        setCenterPosition();
      }
    } else {
      setCenterPosition();
    }
  }, [step, isCenterStep]);

  const setCenterPosition = () => {
    setTargetPosition(null);
    setTooltipStyle({
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 60,
    });
  };

  const calculateTooltipPosition = (rect: DOMRect, position?: string): React.CSSProperties => {
    const padding = 16;
    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 60,
    };

    switch (position) {
      case 'top':
        style.bottom = `${window.innerHeight - rect.top + padding}px`;
        style.left = `${rect.left + rect.width / 2}px`;
        style.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        style.top = `${rect.bottom + padding}px`;
        style.left = `${rect.left + rect.width / 2}px`;
        style.transform = 'translateX(-50%)';
        break;
      case 'left':
        style.right = `${window.innerWidth - rect.left + padding}px`;
        style.top = `${rect.top + rect.height / 2}px`;
        style.transform = 'translateY(-50%)';
        break;
      case 'right':
        style.left = `${rect.right + padding}px`;
        style.top = `${rect.top + rect.height / 2}px`;
        style.transform = 'translateY(-50%)';
        break;
      default:
        // Default to bottom
        style.top = `${rect.bottom + padding}px`;
        style.left = `${rect.left + rect.width / 2}px`;
        style.transform = 'translateX(-50%)';
    }

    return style;
  };

  const handleAction = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <>
      {/* Overlay backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onSkip} />

      {/* Highlight box (if target exists) */}
      {targetPosition && <div style={highlightStyle} />}

      {/* Spotlight effect */}
      {targetPosition && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: targetPosition.top - 8,
            left: targetPosition.left - 8,
            width: targetPosition.width + 16,
            height: targetPosition.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            borderRadius: '8px',
          }}
        />
      )}

      {/* Tutorial card */}
      <div style={tooltipStyle}>
        <Card className="w-96 max-w-[calc(100vw-2rem)] shadow-2xl border-2">
          <CardHeader className="relative pb-3">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={onSkip}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="pr-8">
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <CardDescription className="mt-1">{step.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    index <= currentStepIndex
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                disabled={isFirstStep}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <span className="text-sm text-muted-foreground px-2">
                {currentStepIndex + 1} / {totalSteps}
              </span>

              {isLastStep ? (
                <Button
                  size="sm"
                  onClick={handleAction}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-1" />
                  {step.action || 'Finish'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleAction}
                  className="flex-1"
                >
                  {step.action || 'Next'}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>

            {/* Skip button */}
            {!isLastStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="w-full"
              >
                Skip Tour
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}


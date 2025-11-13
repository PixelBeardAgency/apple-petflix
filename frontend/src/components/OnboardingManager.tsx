import React, { useState, useEffect } from 'react';
import { WelcomeModal } from './WelcomeModal';
import { TutorialOverlay } from './TutorialOverlay';
import { onboardingService } from '../services/onboarding';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function OnboardingManager() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Only show onboarding for logged-in users
    if (!user) {
      setShowWelcome(false);
      setShowTutorial(false);
      return;
    }

    // Check if we should show onboarding
    const shouldShow = onboardingService.shouldShowOnboarding();
    
    if (shouldShow) {
      // Small delay before showing welcome
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleStartTutorial = () => {
    setShowWelcome(false);
    onboardingService.markWelcomeShown();
    onboardingService.startTutorial();
    
    // Small delay to let welcome modal close
    setTimeout(() => {
      setShowTutorial(true);
      setCurrentStep(0);
    }, 300);
  };

  const handleSkipWelcome = () => {
    setShowWelcome(false);
    onboardingService.markWelcomeShown();
    onboardingService.skipTutorial();
    
    // Sync to backend
    syncProgress();
  };

  const handleNextStep = () => {
    const nextStep = onboardingService.nextStep();
    setCurrentStep(nextStep);
  };

  const handlePreviousStep = () => {
    const prevStep = onboardingService.previousStep();
    setCurrentStep(prevStep);
  };

  const handleSkipTutorial = () => {
    setShowTutorial(false);
    onboardingService.skipTutorial();
    syncProgress();
  };

  const handleCompleteTutorial = () => {
    setShowTutorial(false);
    onboardingService.completeTutorial();
    syncProgress();
  };

  const syncProgress = async () => {
    if (!user) return;

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      
      if (token) {
        await onboardingService.syncProgress(token);
      }
    } catch (error) {
      console.error('Failed to sync onboarding progress:', error);
    }
  };

  const steps = onboardingService.getTutorialSteps();
  const step = steps[currentStep];

  if (!user) return null;

  return (
    <>
      {showWelcome && (
        <WelcomeModal
          onStartTutorial={handleStartTutorial}
          onSkip={handleSkipWelcome}
        />
      )}

      {showTutorial && step && (
        <TutorialOverlay
          step={step}
          currentStepIndex={currentStep}
          totalSteps={steps.length}
          onNext={handleNextStep}
          onPrevious={handlePreviousStep}
          onSkip={handleSkipTutorial}
          onComplete={handleCompleteTutorial}
        />
      )}
    </>
  );
}


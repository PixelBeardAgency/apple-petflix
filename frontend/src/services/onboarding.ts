/**
 * Onboarding Service
 * Manages user onboarding and tutorial progress
 */

import { API_URL } from '../config/api';
import { tutorialService } from './tutorial';

export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string; // Optional action button text
};

export type OnboardingProgress = {
  welcomeShown: boolean;
  tutorialCompleted: boolean;
  currentStep: number;
  completedSteps: string[];
  skipped: boolean;
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Petflix! 🐾',
    description: 'Let\'s take a quick tour to help you get started with discovering and sharing adorable pet videos.',
    position: 'center',
    action: 'Start Tour',
  },
  {
    id: 'search',
    title: 'Search for Videos',
    description: 'Use the search feature to find your favorite pet videos from YouTube. Try searching for "cute cats" or "funny dogs"!',
    target: '[data-onboarding="search"]',
    position: 'bottom',
  },
  {
    id: 'share',
    title: 'Share Videos',
    description: 'Found a video you love? Share it with the community! Click here to share a YouTube video link.',
    target: '[data-onboarding="share"]',
    position: 'bottom',
  },
  {
    id: 'feed',
    title: 'Your Feed',
    description: 'See videos shared by people you follow. Your feed will be empty until you follow other users.',
    target: '[data-onboarding="feed"]',
    position: 'bottom',
  },
  {
    id: 'profile',
    title: 'Your Profile',
    description: 'Customize your profile, manage your settings, and see your shared videos.',
    target: '[data-onboarding="profile"]',
    position: 'bottom',
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    description: 'You\'re ready to explore Petflix! Start by searching for videos or following other pet lovers.',
    position: 'center',
    action: 'Get Started',
  },
];

class OnboardingService {
  private readonly STORAGE_KEY = 'petflix-onboarding';

  /**
   * Get tutorial steps
   */
  getTutorialSteps(): TutorialStep[] {
    return TUTORIAL_STEPS;
  }

  /**
   * Get onboarding progress from localStorage
   */
  getProgress(): OnboardingProgress {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // If parsing fails, return default
      }
    }

    return {
      welcomeShown: false,
      tutorialCompleted: false,
      currentStep: 0,
      completedSteps: [],
      skipped: false,
    };
  }

  /**
   * Save onboarding progress
   */
  saveProgress(progress: OnboardingProgress): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
  }

  /**
   * Check if user should see onboarding
   * Now checks backend first, falls back to localStorage
   */
  async shouldShowOnboarding(): Promise<boolean> {
    try {
      // Try to get status from backend
      const status = await tutorialService.getStatus();
      return !status.completed && !status.skipped;
    } catch (error) {
      // Fall back to localStorage if backend fails (user might not be logged in)
      const progress = this.getProgress();
      return !progress.welcomeShown && !progress.skipped;
    }
  }

  /**
   * Synchronous version for immediate checks
   */
  shouldShowOnboardingSync(): boolean {
    const progress = this.getProgress();
    return !progress.welcomeShown && !progress.skipped;
  }

  /**
   * Mark welcome as shown
   */
  markWelcomeShown(): void {
    const progress = this.getProgress();
    progress.welcomeShown = true;
    this.saveProgress(progress);
  }

  /**
   * Start tutorial
   */
  startTutorial(): void {
    const progress = this.getProgress();
    progress.currentStep = 0;
    progress.completedSteps = [];
    this.saveProgress(progress);
  }

  /**
   * Go to next tutorial step
   */
  nextStep(): number {
    const progress = this.getProgress();
    const currentStepId = TUTORIAL_STEPS[progress.currentStep]?.id;
    
    if (currentStepId && !progress.completedSteps.includes(currentStepId)) {
      progress.completedSteps.push(currentStepId);
    }

    progress.currentStep += 1;

    if (progress.currentStep >= TUTORIAL_STEPS.length) {
      progress.tutorialCompleted = true;
      progress.currentStep = TUTORIAL_STEPS.length - 1;
    }

    this.saveProgress(progress);
    return progress.currentStep;
  }

  /**
   * Go to previous tutorial step
   */
  previousStep(): number {
    const progress = this.getProgress();
    progress.currentStep = Math.max(0, progress.currentStep - 1);
    this.saveProgress(progress);
    return progress.currentStep;
  }

  /**
   * Skip tutorial
   */
  skipTutorial(): void {
    const progress = this.getProgress();
    progress.skipped = true;
    progress.tutorialCompleted = true;
    this.saveProgress(progress);
    
    // Sync to backend
    tutorialService.skip().catch(err => {
      console.error('Failed to sync skip to backend:', err);
    });
  }

  /**
   * Complete tutorial
   */
  completeTutorial(): void {
    const progress = this.getProgress();
    progress.tutorialCompleted = true;
    progress.currentStep = TUTORIAL_STEPS.length - 1;
    this.saveProgress(progress);
    
    // Sync to backend
    tutorialService.complete().catch(err => {
      console.error('Failed to sync complete to backend:', err);
    });
  }

  /**
   * Reset onboarding (for testing)
   */
  async reset(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    
    // Reset on backend too
    try {
      await tutorialService.reset();
    } catch (err) {
      console.error('Failed to reset tutorial on backend:', err);
    }
  }

  /**
   * Check if tutorial is completed
   */
  isTutorialCompleted(): boolean {
    const progress = this.getProgress();
    return progress.tutorialCompleted;
  }

  /**
   * Get current step
   */
  getCurrentStep(): TutorialStep | null {
    const progress = this.getProgress();
    return TUTORIAL_STEPS[progress.currentStep] || null;
  }

  /**
   * Save onboarding progress to backend (optional)
   */
  async syncProgress(token: string): Promise<void> {
    const progress = this.getProgress();
    
    try {
      await fetch(`${API_URL}/api/users/onboarding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: progress.tutorialCompleted,
          skipped: progress.skipped,
        }),
      });
    } catch (error) {
      console.error('Failed to sync onboarding progress:', error);
      // Don't throw - this is optional
    }
  }
}

export const onboardingService = new OnboardingService();


import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 * These tests capture screenshots and compare them to baseline images
 * to detect unintended visual changes
 * 
 * First run: npx playwright test --update-snapshots
 * Subsequent runs: npx playwright test
 */

test.describe('Visual Regression Tests', () => {
  test('Landing page should match snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('landing-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Search page should match snapshot', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('search-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Login page should match snapshot', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Dark mode should match snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Toggle to dark mode
    const themeButton = page.locator('button').filter({ hasText: /theme|dark|light/i }).first();
    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('dark-mode.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });

  test('Empty state should match snapshot', async ({ page }) => {
    await page.goto('/playlists');
    await page.waitForLoadState('networkidle');
    
    // Look for empty state
    const emptyState = page.getByText(/no.*playlist/i);
    if (await emptyState.isVisible()) {
      await expect(page).toHaveScreenshot('empty-state.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });

  test('Mobile viewport should match snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('mobile-landing.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Tablet viewport should match snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('tablet-landing.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});


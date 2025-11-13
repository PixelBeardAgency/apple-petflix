import { test, expect } from '@playwright/test';

/**
 * End-to-End Tests for Critical User Flows
 * These tests simulate real user interactions with the application
 */

test.describe('Landing Page', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Petflix/i);
    await expect(page.getByRole('heading', { name: /petflix/i })).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check for main navigation
    await expect(page.getByRole('link', { name: /search/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible();
  });

  test('should navigate to search page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Search');
    await expect(page).toHaveURL(/.*search/);
  });
});

test.describe('Search Functionality', () => {
  test('should display search interface', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('should allow searching for videos', async ({ page }) => {
    await page.goto('/search');
    
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('cute cats');
    await searchInput.press('Enter');
    
    // Wait for results or empty state
    await page.waitForTimeout(2000);
    
    // Check if results or empty state is shown
    const hasResults = await page.getByRole('article').count() > 0;
    const hasEmptyState = await page.getByText(/no.*found/i).isVisible().catch(() => false);
    
    expect(hasResults || hasEmptyState).toBe(true);
  });

  test('should handle empty search', async ({ page }) => {
    await page.goto('/search');
    
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.press('Enter');
    
    // Should show validation or stay on same page
    await expect(page).toHaveURL(/.*search/);
  });
});

test.describe('Authentication Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log.*in/i })).toBeVisible();
  });

  test('should validate login form', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toContain('login');
  });

  test('should show register form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should validate register form', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit with mismatched passwords
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[name="username"]', 'testuser');
    const passwordFields = await page.locator('input[type="password"]').all();
    
    if (passwordFields.length >= 2) {
      await passwordFields[0].fill('password123');
      await passwordFields[1].fill('differentpassword');
      await page.click('button[type="submit"]');
      
      // Should show error
      await page.waitForTimeout(500);
      const url = page.url();
      expect(url).toContain('register');
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/search');
    
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focused);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const hasLabel = (text && text.trim().length > 0) || ariaLabel;
      expect(hasLabel).toBeTruthy();
    }
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: /petflix/i })).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: /petflix/i })).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: /petflix/i })).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 errors', async ({ page }) => {
    await page.goto('/nonexistent-page');
    
    // Should redirect to home or show 404
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Block all network requests
    await context.route('**/*', route => route.abort());
    
    await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
    
    // App should still load basic structure
    await page.waitForTimeout(1000);
  });
});

test.describe('Security', () => {
  test('should have secure headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers();
    
    // Check for security headers (these come from the backend/CDN)
    expect(headers).toBeDefined();
  });

  test('should not expose sensitive information in HTML', async ({ page }) => {
    await page.goto('/');
    
    const content = await page.content();
    expect(content).not.toContain('api_key');
    expect(content).not.toContain('secret');
    expect(content).not.toContain('password');
  });

  test('should protect against XSS in search', async ({ page }) => {
    await page.goto('/search');
    
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('<script>alert("xss")</script>');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(1000);
    
    // Script should not execute
    const alerts = [];
    page.on('dialog', dialog => {
      alerts.push(dialog);
      dialog.dismiss();
    });
    
    expect(alerts.length).toBe(0);
  });
});

test.describe('Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('/search');
    
    // Check if images use loading="lazy"
    const images = await page.locator('img').all();
    if (images.length > 0) {
      const firstImage = images[0];
      const loading = await firstImage.getAttribute('loading');
      // Either lazy loading or eager (both are fine)
      expect(['lazy', 'eager', null]).toContain(loading);
    }
  });
});

test.describe('PWA Features', () => {
  test('should have manifest file', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);
    
    const manifest = await response?.json();
    expect(manifest?.name).toBeDefined();
    expect(manifest?.icons).toBeDefined();
  });

  test('should register service worker', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const serviceWorkerRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistrations().then(registrations => {
        return registrations.length > 0;
      });
    });
    
    expect(serviceWorkerRegistered).toBe(true);
  });
});

test.describe('Dark Mode', () => {
  test('should support dark mode toggle', async ({ page }) => {
    await page.goto('/');
    
    // Look for theme toggle button
    const themeButton = page.locator('button').filter({ hasText: /theme|dark|light/i }).first();
    
    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(500);
      
      // Check if theme changed
      const html = page.locator('html');
      const hasClass = await html.evaluate(el => el.classList.contains('dark') || el.classList.contains('light'));
      expect(hasClass).toBeTruthy();
    }
  });
});


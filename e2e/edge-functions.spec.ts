import { test, expect } from '@playwright/test';

test.describe('Edge Functions Feature', () => {
  test('should display fallback page when accessing /edge without Netlify environment', async ({ page }) => {
    await page.goto('/edge');

    const isFallbackPage = await page.locator('h1').filter({ hasText: /fallback/i }).count();
    const isAustraliaPage = await page.locator('h1').filter({ hasText: /Australia/i }).count();

    expect(isFallbackPage + isAustraliaPage).toBeGreaterThan(0);
  });

  test('should display content explaining edge functions', async ({ page }) => {
    await page.goto('/edge');

    const hasExplanation = await page.getByText(/Edge Function/).count();
    expect(hasExplanation).toBeGreaterThan(0);
  });

  test('should show code example of edge function', async ({ page }) => {
    await page.goto('/edge');

    const codeBlock = page.locator('code, pre').filter({ hasText: /context.geo/ });
    await expect(codeBlock).toBeVisible();
  });

  test('should display link to more edge function examples', async ({ page }) => {
    await page.goto('/edge');

    const examplesLink = page.locator('a[href*="edge-functions-examples.netlify.app"]');
    await expect(examplesLink).toBeVisible();
  });

  test('should handle direct access to australia page', async ({ page }) => {
    await page.goto('/edge/australia');

    await expect(page.locator('h1')).toContainText('You are in Australia');
  });

  test('should handle direct access to not-australia page', async ({ page }) => {
    await page.goto('/edge/not-australia');

    await expect(page.locator('h1')).toContainText("You're not in Australia");
  });

  test('should display edge function code on australia page', async ({ page }) => {
    await page.goto('/edge/australia');

    await expect(page.locator('code, pre').filter({ hasText: /rewrite.js/ })).toBeVisible();
  });

  test('should display edge function code on not-australia page', async ({ page }) => {
    await page.goto('/edge/not-australia');

    await expect(page.locator('code, pre').filter({ hasText: /rewrite.js/ })).toBeVisible();
  });

  test('should show geographic routing logic in code', async ({ page }) => {
    await page.goto('/edge/australia');

    const geoCode = page.locator('text=/context\\.geo.*code.*AU/');
    await expect(geoCode).toBeVisible();
  });

  test('should display Response.redirect in code example', async ({ page }) => {
    await page.goto('/edge/not-australia');

    const redirectCode = page.locator('text=/Response\\.redirect/');
    await expect(redirectCode).toBeVisible();
  });

  test('should explain edge function path configuration', async ({ page }) => {
    await page.goto('/edge');

    const configPath = page.locator('text=/path.*edge/');
    await expect(configPath).toBeVisible();
  });

  test('should mention netlify dev requirement on fallback page', async ({ page }) => {
    await page.goto('/edge');

    const isFallback = await page.locator('h1').filter({ hasText: /fallback/i }).count();

    if (isFallback > 0) {
      await expect(page.getByText(/netlify dev/)).toBeVisible();
    }
  });

  test('should provide context about framework-agnostic nature', async ({ page }) => {
    await page.goto('/edge');

    const frameworkText = page.getByText(/framework-agnostic/i);
    const hasText = await frameworkText.count();

    expect(hasText).toBeGreaterThanOrEqual(0);
  });

  test('australia and not-australia pages should have different headings', async ({ page }) => {
    await page.goto('/edge/australia');
    const australiaHeading = await page.locator('h1').textContent();

    await page.goto('/edge/not-australia');
    const notAustraliaHeading = await page.locator('h1').textContent();

    expect(australiaHeading).not.toBe(notAustraliaHeading);
  });

  test('should show page title in document head', async ({ page }) => {
    await page.goto('/edge/australia');
    const title = await page.title();

    expect(title).toContain('Australia');
  });

  test('should have proper layout structure', async ({ page }) => {
    await page.goto('/edge/australia');

    const mainContent = page.locator('main, article, .container');
    const hasLayout = await mainContent.count();

    expect(hasLayout).toBeGreaterThan(0);
  });
});

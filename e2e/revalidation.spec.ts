import { test, expect } from '@playwright/test';

test.describe('Revalidation Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/revalidation');
  });

  test('should display page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Revalidating Server Content');
  });

  test('should display explanation about cache tags', async ({ page }) => {
    await expect(page.getByText(/server-rendered page/)).toBeVisible();
    await expect(page.getByText(/Cache-Tag/)).toBeVisible();
  });

  test('should display invalidate tag button', async ({ page }) => {
    const invalidateButton = page.locator('button.revalidate-button');
    await expect(invalidateButton).toBeVisible();
    await expect(invalidateButton).toContainText('Invalidate tag:');
  });

  test('should display reload page button', async ({ page }) => {
    const reloadButton = page.getByRole('button', { name: 'Reload page' });
    await expect(reloadButton).toBeVisible();
  });

  test('should show one of the expected cache tags on button', async ({ page }) => {
    const invalidateButton = page.locator('button.revalidate-button');
    const buttonText = await invalidateButton.textContent();

    const expectedTags = ['/revalidation', 'cats-related', 'all-pets-related'];
    const hasExpectedTag = expectedTags.some((tag) => buttonText.includes(tag));

    expect(hasExpectedTag).toBeTruthy();
  });

  test('should have data-tag attribute on invalidate button', async ({ page }) => {
    const invalidateButton = page.locator('button.revalidate-button');
    const dataTag = await invalidateButton.getAttribute('data-tag');

    expect(dataTag).toBeTruthy();
    expect(['/revalidation', 'cats-related', 'all-pets-related']).toContain(dataTag);
  });

  test('should display timestamp showing when page was rendered', async ({ page }) => {
    const timestampRegex = /\d{2}\s+\w{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2}/;
    const timestamp = page.locator('text=' + timestampRegex);

    await expect(timestamp).toBeVisible();
  });

  test('should display cache headers in code block', async ({ page }) => {
    await expect(page.locator('code').filter({ hasText: /Cache-Control/ })).toBeVisible();
    await expect(page.locator('code').filter({ hasText: /Cache-Tag/ })).toBeVisible();
  });

  test('should trigger alert when invalidate button is clicked', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toContain('Invalidated tag:');
      await dialog.accept();
    });

    const invalidateButton = page.locator('button.revalidate-button');
    await invalidateButton.click();

    await page.waitForTimeout(500);
  });

  test('should make POST request to revalidate API when button clicked', async ({ page }) => {
    let apiCalled = false;

    page.on('request', (request) => {
      if (request.url().includes('/api/revalidate') && request.method() === 'POST') {
        apiCalled = true;
      }
    });

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    const invalidateButton = page.locator('button.revalidate-button');
    await invalidateButton.click();

    await page.waitForTimeout(500);

    expect(apiCalled).toBeTruthy();
  });

  test('should reload page when reload button is clicked', async ({ page }) => {
    const initialUrl = page.url();

    const reloadButton = page.getByRole('button', { name: 'Reload page' });

    await Promise.all([
      page.waitForLoadState('networkidle'),
      reloadButton.click(),
    ]);

    expect(page.url()).toBe(initialUrl);
  });

  test('should display explanation about stale-while-revalidate', async ({ page }) => {
    await expect(page.getByText(/stale-while-revalidate/)).toBeVisible();
  });

  test('should mention purge API in documentation', async ({ page }) => {
    const purgeApiLink = page.locator('a[href*="caching"]').filter({ hasText: /purge API/i });
    await expect(purgeApiLink).toBeVisible();
  });

  test('should show different timestamp on page reload', async ({ page }) => {
    const timestampLocator = page.locator('code').filter({ hasText: /last created at/ }).first();
    const initialTimestamp = await timestampLocator.textContent();

    await page.reload();
    await page.waitForLoadState('networkidle');

    const newTimestamp = await timestampLocator.textContent();

    expect(newTimestamp).not.toBe(initialTimestamp);
  });
});

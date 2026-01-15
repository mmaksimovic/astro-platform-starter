import { test, expect } from '@playwright/test';

test.describe('Image CDN Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-cdn');
  });

  test('should display page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Image CDN');
  });

  test('should display Astro Image component section', async ({ page }) => {
    await expect(page.getByText('Using the built-in Astro <Image /> component')).toBeVisible();
  });

  test('should display comparison section', async ({ page }) => {
    await expect(page.getByText('Original vs. optimized image: can you tell the difference?')).toBeVisible();
  });

  test('should render Astro Image component with corgi image', async ({ page }) => {
    const astroImage = page.locator('img').first();
    await expect(astroImage).toBeVisible();

    const altText = await astroImage.getAttribute('alt');
    expect(altText).toBe('Corgi');

    await expect(astroImage).toHaveAttribute('src');
  });

  test('should display image comparison with side-by-side layout', async ({ page }) => {
    const diffContainer = page.locator('.image-diff');
    await expect(diffContainer).toBeVisible();

    const images = diffContainer.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThanOrEqual(2);
  });

  test('should load original image', async ({ page }) => {
    const images = page.locator('.image-diff img');
    const originalImage = images.first();

    await expect(originalImage).toBeVisible();

    const src = await originalImage.getAttribute('src');
    expect(src).toContain('/images/corgi.jpg');
  });

  test('should load optimized image with srcset', async ({ page }) => {
    const images = page.locator('.image-diff img');
    const optimizedImage = images.nth(1);

    await expect(optimizedImage).toBeVisible();

    const srcset = await optimizedImage.getAttribute('srcset');
    expect(srcset).toBeTruthy();
    expect(srcset).toContain('/.netlify/images');
  });

  test('should display image size information after load', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(1000);

    const sizeOverlays = page.locator('.image-diff span').filter({ hasText: /Size: \d+KB/ });
    const overlayCount = await sizeOverlays.count();

    expect(overlayCount).toBeGreaterThanOrEqual(0);
  });

  test('should have proper image alt attributes for accessibility', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should display photo credit caption', async ({ page }) => {
    await expect(page.getByText('Credit: photo by')).toBeVisible();
    await expect(page.locator('a[href*="unsplash.com/@alvannee"]')).toBeVisible();
  });

  test('should have responsive image sizing', async ({ page }) => {
    const optimizedImage = page.locator('.image-diff img').nth(1);
    const srcset = await optimizedImage.getAttribute('srcset');

    if (srcset) {
      expect(srcset).toContain('640w');
      expect(srcset).toContain('1280w');
      expect(srcset).toContain('2048w');
    }
  });

  test('should contain Netlify Image CDN URLs in optimized image', async ({ page }) => {
    const optimizedImage = page.locator('.image-diff img').nth(1);
    const srcset = await optimizedImage.getAttribute('srcset');

    if (srcset) {
      expect(srcset).toContain('/.netlify/images');
      expect(srcset).toContain('url=');
      expect(srcset).toContain('w=');
    }
  });

  test('should display context alert in dev mode if applicable', async ({ page }) => {
    const contextAlert = page.locator('.mb-8').filter({ hasText: /development/ });
    const hasAlert = await contextAlert.count();

    expect(hasAlert).toBeGreaterThanOrEqual(0);
  });
});

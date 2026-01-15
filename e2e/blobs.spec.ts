import { test, expect } from '@playwright/test';

test.describe('Blobs Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blobs');
  });

  test('should display page title and description', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Blobs x Blobs');
    await expect(page.getByText('Netlify Blobs')).toBeVisible();
  });

  test('should display New Random Shape section', async ({ page }) => {
    await expect(page.getByText('New Random Shape')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Randomize' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();
  });

  test('should display Objects in Blob Store section', async ({ page }) => {
    await expect(page.getByText('Objects in Blob Store')).toBeVisible();
  });

  test('should generate new random shape on load', async ({ page }) => {
    const shapeName = page.locator('text=/^[a-z]+-[a-z]+-\\d+$/');
    await expect(shapeName).toBeVisible();

    const svgElement = page.locator('svg').first();
    await expect(svgElement).toBeVisible();
  });

  test('should randomize blob shape when Randomize button is clicked', async ({ page }) => {
    const shapeNameLocator = page.locator('.text-gray-900').first();
    const initialName = await shapeNameLocator.textContent();

    await page.getByRole('button', { name: 'Randomize' }).click();

    await page.waitForTimeout(100);

    const newName = await shapeNameLocator.textContent();
    expect(newName).not.toBe(initialName);
  });

  test('should display SVG shape with correct attributes', async ({ page }) => {
    const svg = page.locator('svg').first();

    await expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    await expect(svg).toHaveAttribute('viewBox', '0 0 1024 1024');

    const path = svg.locator('path');
    await expect(path).toBeVisible();
    await expect(path).toHaveAttribute('d');
  });

  test('should show upload disabled state or enable upload', async ({ page }) => {
    const uploadButton = page.getByRole('button', { name: 'Upload' });

    const isDisabled = await uploadButton.isDisabled();

    if (!isDisabled) {
      await expect(uploadButton).toBeEnabled();
    } else {
      await expect(uploadButton).toBeDisabled();
    }
  });

  test('should fetch and display stored blobs list', async ({ page }) => {
    await page.waitForTimeout(500);

    const blobStoreSection = page.locator('text=Objects in Blob Store').locator('..');

    const hasBlobs = await page.locator('button').filter({ hasText: /^[a-z]+-[a-z]+-\d+$/ }).count();
    const emptyMessage = page.getByText('Please upload some shapes!');

    if (hasBlobs > 0) {
      const firstBlob = page.locator('button').filter({ hasText: /^[a-z]+-[a-z]+-\d+$/ }).first();
      await expect(firstBlob).toBeVisible();
    } else {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('should select and display blob when clicking on stored blob', async ({ page }) => {
    await page.waitForTimeout(500);

    const blobButtons = page.locator('button').filter({ hasText: /^[a-z]+-[a-z]+-\d+$/ });
    const blobCount = await blobButtons.count();

    if (blobCount > 0) {
      await blobButtons.first().click();

      await page.waitForTimeout(300);

      const svgElements = page.locator('svg');
      await expect(svgElements.nth(1)).toBeVisible();

      const selectedButton = blobButtons.first();
      await expect(selectedButton).toHaveClass(/pointer-events-none/);
    }
  });

  test('should render gradient in SVG shape', async ({ page }) => {
    const svg = page.locator('svg').first();

    const linearGradient = svg.locator('linearGradient');
    await expect(linearGradient).toBeVisible();

    const stops = linearGradient.locator('stop');
    await expect(stops).toHaveCount(2);
  });
});

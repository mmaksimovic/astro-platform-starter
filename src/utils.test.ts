import { describe, it, expect, vi, beforeEach } from 'vitest';
import { randomInt, uniqueName, generateBlob, cacheHeaders } from './utils';

describe('randomInt', () => {
  it('returns a number within the specified range', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('returns the same value when min equals max', () => {
    const result = randomInt(5, 5);
    expect(result).toBe(5);
  });

  it('handles negative numbers', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomInt(-10, -1);
      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(-1);
    }
  });

  it('handles range crossing zero', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomInt(-5, 5);
      expect(result).toBeGreaterThanOrEqual(-5);
      expect(result).toBeLessThanOrEqual(5);
    }
  });

  it('handles large numbers', () => {
    for (let i = 0; i < 20; i++) {
      const result = randomInt(1000, 9999);
      expect(result).toBeGreaterThanOrEqual(1000);
      expect(result).toBeLessThanOrEqual(9999);
    }
  });

  it('returns boundary values inclusively', () => {
    const results = new Set<number>();
    for (let i = 0; i < 100; i++) {
      results.add(randomInt(1, 2));
    }
    expect(results.has(1)).toBe(true);
    expect(results.has(2)).toBe(true);
  });
});

describe('uniqueName', () => {
  it('generates a name with adjective-animal-number pattern', () => {
    const name = uniqueName();
    const parts = name.split('-');

    expect(parts).toHaveLength(3);
    expect(parts[0]).toBeTruthy();
    expect(parts[1]).toBeTruthy();
    expect(parts[2]).toBeTruthy();
  });

  it('generates a name with a number suffix between 100 and 999', () => {
    const name = uniqueName();
    const parts = name.split('-');
    const number = parseInt(parts[2], 10);

    expect(number).toBeGreaterThanOrEqual(100);
    expect(number).toBeLessThanOrEqual(999);
  });

  it('generates unique names on successive calls', () => {
    const names = new Set<string>();
    for (let i = 0; i < 50; i++) {
      names.add(uniqueName());
    }

    expect(names.size).toBeGreaterThan(40);
  });

  it('generates names with lowercase letters and hyphens only', () => {
    const name = uniqueName();
    expect(name).toMatch(/^[a-z]+-[a-z]+-\d{3}$/);
  });

  it('generates names with exactly three hyphens', () => {
    const name = uniqueName();
    const hyphenCount = (name.match(/-/g) || []).length;
    expect(hyphenCount).toBe(2);
  });
});

describe('generateBlob', () => {
  it('generates a blob with default parameters', () => {
    const result = generateBlob();

    expect(result).toHaveProperty('parameters');
    expect(result).toHaveProperty('svgPath');
    expect(result.parameters).toHaveProperty('seed');
    expect(result.parameters).toHaveProperty('size');
    expect(result.parameters).toHaveProperty('edges');
    expect(result.parameters).toHaveProperty('growth');
    expect(result.parameters).toHaveProperty('name');
    expect(result.parameters).toHaveProperty('colors');
  });

  it('generates a blob with default size of 512', () => {
    const result = generateBlob();
    expect(result.parameters.size).toBe(512);
  });

  it('generates edges within default range (3-20)', () => {
    for (let i = 0; i < 20; i++) {
      const result = generateBlob();
      expect(result.parameters.edges).toBeGreaterThanOrEqual(3);
      expect(result.parameters.edges).toBeLessThanOrEqual(20);
    }
  });

  it('generates growth within default range (2-9)', () => {
    for (let i = 0; i < 20; i++) {
      const result = generateBlob();
      expect(result.parameters.growth).toBeGreaterThanOrEqual(2);
      expect(result.parameters.growth).toBeLessThanOrEqual(9);
    }
  });

  it('generates a unique name following the pattern', () => {
    const result = generateBlob();
    expect(result.parameters.name).toMatch(/^[a-z]+-[a-z]+-\d{3}$/);
  });

  it('generates colors as an array of two hex strings', () => {
    const result = generateBlob();
    expect(Array.isArray(result.parameters.colors)).toBe(true);
    expect(result.parameters.colors).toHaveLength(2);
    expect(result.parameters.colors[0]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(result.parameters.colors[1]).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('accepts custom parameters and merges with defaults', () => {
    const customParams = {
      size: 256,
      edges: 7,
      growth: 5
    };
    const result = generateBlob(customParams);

    expect(result.parameters.size).toBe(256);
    expect(result.parameters.edges).toBe(7);
    expect(result.parameters.growth).toBe(5);
    expect(result.parameters.name).toBeTruthy();
    expect(result.parameters.colors).toBeTruthy();
  });

  it('accepts partial parameters', () => {
    const result = generateBlob({ size: 1024 });
    expect(result.parameters.size).toBe(1024);
    expect(result.parameters.edges).toBeGreaterThanOrEqual(3);
    expect(result.parameters.edges).toBeLessThanOrEqual(20);
  });

  it('accepts custom name parameter', () => {
    const customName = 'custom-blob-name';
    const result = generateBlob({ name: customName });
    expect(result.parameters.name).toBe(customName);
  });

  it('accepts custom colors parameter', () => {
    const customColors = ['#FF0000', '#00FF00'];
    const result = generateBlob({ colors: customColors });
    expect(result.parameters.colors).toEqual(customColors);
  });

  it('generates svgPath as a non-empty string', () => {
    const result = generateBlob();
    expect(typeof result.svgPath).toBe('string');
    expect(result.svgPath.length).toBeGreaterThan(0);
  });

  it('generates a seed value', () => {
    const result = generateBlob();
    expect(result.parameters.seed).toBeTruthy();
    expect(typeof result.parameters.seed).toBe('string');
  });

  it('handles seed parameter correctly', () => {
    const customSeed = 'test-seed-123';
    const result1 = generateBlob({ seed: customSeed });
    const result2 = generateBlob({ seed: customSeed });

    expect(result1.svgPath).toBe(result2.svgPath);
  });

  it('handles undefined parameters', () => {
    const result = generateBlob(undefined);
    expect(result).toHaveProperty('parameters');
    expect(result).toHaveProperty('svgPath');
  });

  it('handles empty object parameter', () => {
    const result = generateBlob({});
    expect(result.parameters.size).toBe(512);
    expect(result.parameters.edges).toBeGreaterThanOrEqual(3);
  });

  it('handles boundary values for edges', () => {
    const result1 = generateBlob({ edges: 3 });
    expect(result1.parameters.edges).toBe(3);

    const result2 = generateBlob({ edges: 50 });
    expect(result2.parameters.edges).toBe(50);
  });

  it('handles boundary values for growth', () => {
    const result1 = generateBlob({ growth: 1 });
    expect(result1.parameters.growth).toBe(1);

    const result2 = generateBlob({ growth: 10 });
    expect(result2.parameters.growth).toBe(10);
  });

  it('handles boundary values for size', () => {
    const result1 = generateBlob({ size: 100 });
    expect(result1.parameters.size).toBe(100);

    const result2 = generateBlob({ size: 1024 });
    expect(result2.parameters.size).toBe(1024);
  });

  it('handles negative size values', () => {
    const result = generateBlob({ size: -100 });
    expect(result.parameters.size).toBe(-100);
    expect(result).toHaveProperty('svgPath');
  });

  it('handles negative edges values', () => {
    const result = generateBlob({ edges: -5 });
    expect(result.parameters.edges).toBe(-5);
  });

  it('handles negative growth values', () => {
    const result = generateBlob({ growth: -3 });
    expect(result.parameters.growth).toBe(-3);
  });

  it('handles zero values', () => {
    const result = generateBlob({ size: 0, edges: 0, growth: 0 });
    expect(result.parameters.size).toBe(0);
    expect(result.parameters.edges).toBe(0);
    expect(result.parameters.growth).toBe(0);
  });

  it('handles extremely large values', () => {
    const result = generateBlob({ size: 10000, edges: 100, growth: 50 });
    expect(result.parameters.size).toBe(10000);
    expect(result.parameters.edges).toBe(100);
    expect(result.parameters.growth).toBe(50);
  });

  it('handles null colors parameter', () => {
    const result = generateBlob({ colors: null });
    expect(result.parameters.colors).toBe(null);
  });
});

describe('cacheHeaders', () => {
  it('generates correct headers with default max age (365 days)', () => {
    const headers = cacheHeaders();

    expect(headers).toHaveProperty('Cache-Control');
    expect(headers).toHaveProperty('Netlify-CDN-Cache-Control');
    expect(headers['Cache-Control']).toBe('public, max-age=0, must-revalidate');
    expect(headers['Netlify-CDN-Cache-Control']).toBe('public, max-age=31536000, must-revalidate');
  });

  it('calculates max-age correctly for custom days', () => {
    const headers = cacheHeaders(30);
    const expectedSeconds = 30 * 86_400;

    expect(headers['Netlify-CDN-Cache-Control']).toBe(`public, max-age=${expectedSeconds}, must-revalidate`);
  });

  it('handles zero days', () => {
    const headers = cacheHeaders(0);
    expect(headers['Netlify-CDN-Cache-Control']).toBe('public, max-age=0, must-revalidate');
  });

  it('handles single day', () => {
    const headers = cacheHeaders(1);
    expect(headers['Netlify-CDN-Cache-Control']).toBe('public, max-age=86400, must-revalidate');
  });

  it('handles 7 days (one week)', () => {
    const headers = cacheHeaders(7);
    expect(headers['Netlify-CDN-Cache-Control']).toBe('public, max-age=604800, must-revalidate');
  });

  it('does not include Cache-Tag header when no tags provided', () => {
    const headers = cacheHeaders();
    expect(headers).not.toHaveProperty('Cache-Tag');
  });

  it('does not include Cache-Tag header when empty array provided', () => {
    const headers = cacheHeaders(365, []);
    expect(headers).not.toHaveProperty('Cache-Tag');
  });

  it('includes Cache-Tag header with single tag', () => {
    const headers = cacheHeaders(365, ['blob']);
    expect(headers).toHaveProperty('Cache-Tag');
    expect(headers['Cache-Tag']).toBe('blob');
  });

  it('includes Cache-Tag header with multiple tags', () => {
    const headers = cacheHeaders(365, ['blob', 'image', 'user-123']);
    expect(headers).toHaveProperty('Cache-Tag');
    expect(headers['Cache-Tag']).toBe('blob,image,user-123');
  });

  it('handles cache tags without max age parameter', () => {
    const headers = cacheHeaders(undefined, ['tag1', 'tag2']);
    expect(headers['Cache-Tag']).toBe('tag1,tag2');
    expect(headers['Netlify-CDN-Cache-Control']).toBe('public, max-age=31536000, must-revalidate');
  });

  it('always sets browser cache to revalidate immediately', () => {
    const headers1 = cacheHeaders(1);
    const headers2 = cacheHeaders(365);
    const headers3 = cacheHeaders(1000);

    expect(headers1['Cache-Control']).toBe('public, max-age=0, must-revalidate');
    expect(headers2['Cache-Control']).toBe('public, max-age=0, must-revalidate');
    expect(headers3['Cache-Control']).toBe('public, max-age=0, must-revalidate');
  });

  it('handles negative days', () => {
    const headers = cacheHeaders(-10);
    const expectedSeconds = -10 * 86_400;
    expect(headers['Netlify-CDN-Cache-Control']).toBe(`public, max-age=${expectedSeconds}, must-revalidate`);
  });

  it('handles large number of days', () => {
    const headers = cacheHeaders(3650); // 10 years
    const expectedSeconds = 3650 * 86_400;
    expect(headers['Netlify-CDN-Cache-Control']).toBe(`public, max-age=${expectedSeconds}, must-revalidate`);
  });

  it('handles fractional days', () => {
    const headers = cacheHeaders(0.5); // 12 hours
    const expectedSeconds = 0.5 * 86_400;
    expect(headers['Netlify-CDN-Cache-Control']).toBe(`public, max-age=${expectedSeconds}, must-revalidate`);
  });

  it('returns an object with string values', () => {
    const headers = cacheHeaders(30, ['tag']);

    Object.values(headers).forEach(value => {
      expect(typeof value).toBe('string');
    });
  });

  it('handles special characters in cache tags', () => {
    const headers = cacheHeaders(365, ['blob:123', 'user@email', 'tag-with-dash']);
    expect(headers['Cache-Tag']).toBe('blob:123,user@email,tag-with-dash');
  });

  it('handles undefined cache tags parameter', () => {
    const headers = cacheHeaders(30, undefined);
    expect(headers).not.toHaveProperty('Cache-Tag');
  });
});

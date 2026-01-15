import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShapePreview from './ShapePreview.tsx';
import * as utils from '../../../utils';
import type { BlobProps } from '../../../types';

vi.mock('../../../utils', async () => {
  const actual = await vi.importActual('../../../utils');
  return {
    ...actual,
    randomInt: vi.fn(),
  };
});

describe('ShapePreview Component', () => {
  const mockBlobProps: BlobProps = {
    svgPath: 'M10,10 L20,20 L30,10 Z',
    parameters: {
      seed: 12345,
      size: 512,
      edges: 5,
      growth: 7,
      name: 'test-blob',
      colors: ['#2E3192', '#1BFFFF'],
    },
  };

  beforeEach(() => {
    vi.mocked(utils.randomInt).mockReturnValue(50000000);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('SVG Rendering', () => {
    it('should render an SVG element', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render with correct viewBox based on size parameter', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 512 512');
    });

    it('should render with 100% width', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '100%');
    });

    it('should render the SVG path with correct d attribute', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('d', 'M10,10 L20,20 L30,10 Z');
    });

    it('should have correct xmlns attribute', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });
  });

  describe('Gradient Rendering', () => {
    it('should render a linear gradient definition', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const gradient = container.querySelector('linearGradient');
      expect(gradient).toBeInTheDocument();
    });

    it('should have a unique gradient ID', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const gradient = container.querySelector('linearGradient');
      expect(gradient).toHaveAttribute('id', 'gradient-50000000');
    });

    it('should call randomInt to generate gradient ID', () => {
      render(<ShapePreview {...mockBlobProps} />);
      expect(utils.randomInt).toHaveBeenCalledWith(10_000_000, 100_000_000);
    });

    it('should render gradient with vertical direction (top to bottom)', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const gradient = container.querySelector('linearGradient');
      expect(gradient).toHaveAttribute('x1', '0%');
      expect(gradient).toHaveAttribute('y1', '0%');
      expect(gradient).toHaveAttribute('x2', '0%');
      expect(gradient).toHaveAttribute('y2', '100%');
    });

    it('should render two gradient stops', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const stops = container.querySelectorAll('stop');
      expect(stops).toHaveLength(2);
    });

    it('should render first gradient stop with correct color', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const stops = container.querySelectorAll('stop');
      expect(stops[0]).toHaveAttribute('offset', '0%');
      expect(stops[0]).toHaveStyle({ stopColor: '#2E3192' });
    });

    it('should render second gradient stop with correct color', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const stops = container.querySelectorAll('stop');
      expect(stops[1]).toHaveAttribute('offset', '100%');
      expect(stops[1]).toHaveStyle({ stopColor: '#1BFFFF' });
    });

    it('should apply gradient fill to path', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('fill', 'url(#gradient-50000000)');
    });
  });

  describe('Different Size Parameters', () => {
    it('should render with size 256', () => {
      const props = {
        ...mockBlobProps,
        parameters: { ...mockBlobProps.parameters, size: 256 },
      };
      const { container } = render(<ShapePreview {...props} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 256 256');
    });

    it('should render with size 1024', () => {
      const props = {
        ...mockBlobProps,
        parameters: { ...mockBlobProps.parameters, size: 1024 },
      };
      const { container } = render(<ShapePreview {...props} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 1024 1024');
    });

    it('should render with minimum size', () => {
      const props = {
        ...mockBlobProps,
        parameters: { ...mockBlobProps.parameters, size: 100 },
      };
      const { container } = render(<ShapePreview {...props} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
    });
  });

  describe('Different Color Parameters', () => {
    it('should render with different gradient colors', () => {
      const props = {
        ...mockBlobProps,
        parameters: {
          ...mockBlobProps.parameters,
          colors: ['#FF0000', '#00FF00'],
        },
      };
      const { container } = render(<ShapePreview {...props} />);
      const stops = container.querySelectorAll('stop');
      expect(stops[0]).toHaveStyle({ stopColor: '#FF0000' });
      expect(stops[1]).toHaveStyle({ stopColor: '#00FF00' });
    });

    it('should handle hex colors with lowercase', () => {
      const props = {
        ...mockBlobProps,
        parameters: {
          ...mockBlobProps.parameters,
          colors: ['#abc123', '#def456'],
        },
      };
      const { container } = render(<ShapePreview {...props} />);
      const stops = container.querySelectorAll('stop');
      expect(stops[0]).toHaveStyle({ stopColor: '#abc123' });
      expect(stops[1]).toHaveStyle({ stopColor: '#def456' });
    });

    it('should handle multiple color arrays', () => {
      const colorSets = [
        ['#93A5CF', '#E4EfE9'],
        ['#BFF098', '#6FD6FF'],
        ['#A1C4FD', '#C2E9FB'],
      ];

      colorSets.forEach((colors) => {
        const props = {
          ...mockBlobProps,
          parameters: { ...mockBlobProps.parameters, colors },
        };
        const { container } = render(<ShapePreview {...props} />);
        const stops = container.querySelectorAll('stop');
        expect(stops[0]).toHaveStyle({ stopColor: colors[0] });
        expect(stops[1]).toHaveStyle({ stopColor: colors[1] });
      });
    });
  });

  describe('Different SVG Paths', () => {
    it('should render with simple path', () => {
      const props = {
        ...mockBlobProps,
        svgPath: 'M0,0 L100,100',
      };
      const { container } = render(<ShapePreview {...props} />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('d', 'M0,0 L100,100');
    });

    it('should render with complex path', () => {
      const complexPath = 'M100,100 Q150,50 200,100 T300,100';
      const props = {
        ...mockBlobProps,
        svgPath: complexPath,
      };
      const { container } = render(<ShapePreview {...props} />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('d', complexPath);
    });

    it('should render with circular path', () => {
      const circularPath = 'M50,50 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0';
      const props = {
        ...mockBlobProps,
        svgPath: circularPath,
      };
      const { container } = render(<ShapePreview {...props} />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('d', circularPath);
    });

    it('should render with empty path', () => {
      const props = {
        ...mockBlobProps,
        svgPath: '',
      };
      const { container } = render(<ShapePreview {...props} />);
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('d', '');
    });
  });

  describe('Unique Gradient IDs', () => {
    it('should generate different gradient IDs for multiple instances', () => {
      let callCount = 0;
      vi.mocked(utils.randomInt).mockImplementation(() => {
        callCount++;
        return 10000000 + callCount;
      });

      const { container: container1 } = render(<ShapePreview {...mockBlobProps} />);
      const { container: container2 } = render(<ShapePreview {...mockBlobProps} />);

      const gradient1 = container1.querySelector('linearGradient');
      const gradient2 = container2.querySelector('linearGradient');

      expect(gradient1?.getAttribute('id')).not.toBe(gradient2?.getAttribute('id'));
    });

    it('should use gradient ID in path fill reference', () => {
      vi.mocked(utils.randomInt).mockReturnValue(87654321);
      const { container } = render(<ShapePreview {...mockBlobProps} />);

      const gradient = container.querySelector('linearGradient');
      const path = container.querySelector('path');

      const gradientId = gradient?.getAttribute('id');
      const pathFill = path?.getAttribute('fill');

      expect(pathFill).toBe(`url(#${gradientId})`);
    });
  });

  describe('All Parameters Combined', () => {
    it('should render correctly with all custom parameters', () => {
      const customProps: BlobProps = {
        svgPath: 'M50,10 L90,90 L10,90 Z',
        parameters: {
          seed: 99999,
          size: 768,
          edges: 8,
          growth: 5,
          name: 'custom-shape',
          colors: ['#FF6B6B', '#4ECDC4'],
        },
      };

      const { container } = render(<ShapePreview {...customProps} />);
      const svg = container.querySelector('svg');
      const path = container.querySelector('path');
      const stops = container.querySelectorAll('stop');

      expect(svg).toHaveAttribute('viewBox', '0 0 768 768');
      expect(path).toHaveAttribute('d', 'M50,10 L90,90 L10,90 Z');
      expect(stops[0]).toHaveStyle({ stopColor: '#FF6B6B' });
      expect(stops[1]).toHaveStyle({ stopColor: '#4ECDC4' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle parameters with edge values', () => {
      const edgeProps: BlobProps = {
        svgPath: 'M0,0',
        parameters: {
          seed: 0,
          size: 1,
          edges: 3,
          growth: 1,
          name: '',
          colors: ['#000000', '#FFFFFF'],
        },
      };

      const { container } = render(<ShapePreview {...edgeProps} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 1 1');
    });

    it('should render defs element inside SVG', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const defs = container.querySelector('defs');
      expect(defs).toBeInTheDocument();
      expect(defs?.parentElement?.tagName).toBe('svg');
    });

    it('should render gradient inside defs element', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const gradient = container.querySelector('linearGradient');
      expect(gradient?.parentElement?.tagName).toBe('defs');
    });

    it('should render path outside defs element', () => {
      const { container } = render(<ShapePreview {...mockBlobProps} />);
      const path = container.querySelector('path');
      expect(path?.parentElement?.tagName).toBe('svg');
    });
  });

  describe('Component Reusability', () => {
    it('should render multiple instances with different props', () => {
      const props1: BlobProps = {
        svgPath: 'M10,10 L20,20',
        parameters: {
          seed: 1,
          size: 256,
          edges: 5,
          growth: 5,
          name: 'blob-1',
          colors: ['#AA0000', '#00AA00'],
        },
      };

      const props2: BlobProps = {
        svgPath: 'M30,30 L40,40',
        parameters: {
          seed: 2,
          size: 512,
          edges: 7,
          growth: 8,
          name: 'blob-2',
          colors: ['#0000AA', '#AAAA00'],
        },
      };

      const { container: container1 } = render(<ShapePreview {...props1} />);
      const { container: container2 } = render(<ShapePreview {...props2} />);

      const svg1 = container1.querySelector('svg');
      const svg2 = container2.querySelector('svg');

      expect(svg1).toHaveAttribute('viewBox', '0 0 256 256');
      expect(svg2).toHaveAttribute('viewBox', '0 0 512 512');
    });
  });
});

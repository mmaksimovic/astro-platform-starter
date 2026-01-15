import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import StoredShapes from './StoredShapes.tsx';
import * as utils from '../../../utils';
import type { BlobProps } from '../../../types';

vi.mock('../../../utils', async () => {
  const actual = await vi.importActual('../../../utils');
  return {
    ...actual,
    generateBlob: vi.fn(),
  };
});

describe('StoredShapes Component', () => {
  const mockBlobData: BlobProps = {
    svgPath: 'M10,10 L20,20',
    parameters: {
      seed: 12345,
      size: 512,
      edges: 5,
      growth: 7,
      name: 'test-blob-123',
      colors: ['#2E3192', '#1BFFFF'],
    },
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.mocked(utils.generateBlob).mockReturnValue(mockBlobData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the component with title', () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: [] }),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);
      expect(screen.getByText('Objects in Blob Store')).toBeInTheDocument();
    });

    it('should fetch blob keys on mount', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: ['blob-1', 'blob-2'] }),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/blobs', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
      });
    });
  });

  describe('Blob List Loading', () => {
    it('should display empty state when no blobs exist', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: [] }),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('Please upload some shapes!')).toBeInTheDocument();
      });
    });

    it('should display list of blob keys when available', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: ['blob-1', 'blob-2', 'blob-3'] }),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('blob-1')).toBeInTheDocument();
        expect(screen.getByText('blob-2')).toBeInTheDocument();
        expect(screen.getByText('blob-3')).toBeInTheDocument();
      });
    });

    it('should render blob names as buttons', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: ['blob-1', 'blob-2'] }),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'blob-1' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'blob-2' })).toBeInTheDocument();
      });
    });

    it('should refetch keys when lastMutationTime changes', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ keys: ['blob-1'] }),
      } as Response);

      const { rerender } = render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      rerender(<StoredShapes lastMutationTime={1000} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Selection Interaction', () => {
    it('should fetch blob details when a blob is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ keys: ['blob-1', 'blob-2'] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ blob: mockBlobData.parameters }),
        } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('blob-1')).toBeInTheDocument();
      });

      const blobButton = screen.getByRole('button', { name: 'blob-1' });
      await user.click(blobButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/blob/?key=blob-1',
          { method: 'GET' }
        );
      });
    });

    it('should display blob preview after selection', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ keys: ['blob-1'] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ blob: mockBlobData.parameters }),
        } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('blob-1')).toBeInTheDocument();
      });

      const blobButton = screen.getByRole('button', { name: 'blob-1' });
      await user.click(blobButton);

      await waitFor(() => {
        expect(utils.generateBlob).toHaveBeenCalledWith(mockBlobData.parameters);
      });
    });

    it('should highlight selected blob button', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ keys: ['blob-1', 'blob-2'] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ blob: mockBlobData.parameters }),
        } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('blob-1')).toBeInTheDocument();
      });

      const blobButton = screen.getByRole('button', { name: 'blob-1' });
      await user.click(blobButton);

      await waitFor(() => {
        expect(blobButton).toHaveClass('pointer-events-none');
      });
    });

    it('should allow selecting different blobs sequentially', async () => {
      const user = userEvent.setup();
      const blob2Data = { ...mockBlobData.parameters, name: 'blob-2' };

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ keys: ['blob-1', 'blob-2'] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ blob: mockBlobData.parameters }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ blob: blob2Data }),
        } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('blob-1')).toBeInTheDocument();
      });

      const blob1Button = screen.getByRole('button', { name: 'blob-1' });
      await user.click(blob1Button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/blob/?key=blob-1', { method: 'GET' });
      });

      const blob2Button = screen.getByRole('button', { name: 'blob-2' });
      await user.click(blob2Button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/blob/?key=blob-2', { method: 'GET' });
      });
    });
  });

  describe('Error States', () => {
    it('should handle error fetching blob list', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      consoleLogSpy.mockRestore();
    });

    it('should handle error fetching individual blob', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ keys: ['blob-1'] }),
        } as Response)
        .mockRejectedValueOnce(new Error('Blob not found'));

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('blob-1')).toBeInTheDocument();
      });

      const blobButton = screen.getByRole('button', { name: 'blob-1' });

      await expect(async () => {
        await user.click(blobButton);
      }).rejects.toThrow('Blob not found');
    });

    it('should handle API response without keys property', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('Please upload some shapes!')).toBeInTheDocument();
      });
    });

    it('should handle API response without blob property', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ keys: ['blob-1'] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('blob-1')).toBeInTheDocument();
      });

      const blobButton = screen.getByRole('button', { name: 'blob-1' });
      await user.click(blobButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      expect(utils.generateBlob).not.toHaveBeenCalled();
    });

    it('should handle empty keys array', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: [] }),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('Please upload some shapes!')).toBeInTheDocument();
      });
    });

    it('should handle null keys', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: null }),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('Please upload some shapes!')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State Display', () => {
    it('should show empty state message when keys array is empty', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: [] }),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('Please upload some shapes!')).toBeInTheDocument();
      });
    });

    it('should not show blob preview in empty state', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: [] }),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
      });
    });

    it('should transition from empty to populated state', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ keys: [] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ keys: ['new-blob'] }),
        } as Response);

      const { rerender } = render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('Please upload some shapes!')).toBeInTheDocument();
      });

      rerender(<StoredShapes lastMutationTime={1000} />);

      await waitFor(() => {
        expect(screen.getByText('new-blob')).toBeInTheDocument();
        expect(screen.queryByText('Please upload some shapes!')).not.toBeInTheDocument();
      });
    });
  });

  describe('Console Logging', () => {
    it('should log when fetching keys', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: [] }),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('Fetching keys...');
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe('Preview Visibility', () => {
    it('should not show preview initially', () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: ['blob-1'] }),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      const previewContainer = document.querySelector('.aspect-square');
      expect(previewContainer).not.toBeInTheDocument();
    });

    it('should show preview after blob is selected', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ keys: ['blob-1'] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ blob: mockBlobData.parameters }),
        } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('blob-1')).toBeInTheDocument();
      });

      const blobButton = screen.getByRole('button', { name: 'blob-1' });
      await user.click(blobButton);

      await waitFor(() => {
        const previewContainer = document.querySelector('.aspect-square');
        expect(previewContainer).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Blobs', () => {
    it('should handle large list of blobs', async () => {
      const keys = Array.from({ length: 50 }, (_, i) => `blob-${i}`);
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys }),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('blob-0')).toBeInTheDocument();
        expect(screen.getByText('blob-49')).toBeInTheDocument();
      });
    });

    it('should handle blob names with special characters', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: ['blob-with-dashes', 'blob_with_underscores', 'blob.with.dots'] }),
      } as Response);

      render(<StoredShapes lastMutationTime={0} />);

      await waitFor(() => {
        expect(screen.getByText('blob-with-dashes')).toBeInTheDocument();
        expect(screen.getByText('blob_with_underscores')).toBeInTheDocument();
        expect(screen.getByText('blob.with.dots')).toBeInTheDocument();
      });
    });
  });
});

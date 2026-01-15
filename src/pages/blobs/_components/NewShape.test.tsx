import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import NewShape from './NewShape.tsx';
import * as utils from '../../../utils';
import type { BlobProps } from '../../../types';

vi.mock('../../../utils', async () => {
  const actual = await vi.importActual('../../../utils');
  return {
    ...actual,
    generateBlob: vi.fn(),
    uploadDisabled: false,
  };
});

describe('NewShape Component', () => {
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

  const mockSetLastMutationTime = vi.fn();

  beforeEach(() => {
    vi.mocked(utils.generateBlob).mockReturnValue(mockBlobData);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the component with title', () => {
      render(<NewShape />);
      expect(screen.getByText('New Random Shape')).toBeInTheDocument();
    });

    it('should generate initial blob on mount', () => {
      render(<NewShape />);
      expect(utils.generateBlob).toHaveBeenCalledTimes(1);
    });

    it('should display blob name', async () => {
      render(<NewShape />);
      await waitFor(() => {
        expect(screen.getByText('test-blob-123')).toBeInTheDocument();
      });
    });

    it('should render randomize and upload buttons', () => {
      render(<NewShape />);
      expect(screen.getByRole('button', { name: /randomize/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    });
  });

  describe('Randomize Button', () => {
    it('should generate new blob when randomize button is clicked', async () => {
      const user = userEvent.setup();
      render(<NewShape />);

      const newBlobData: BlobProps = {
        ...mockBlobData,
        parameters: { ...mockBlobData.parameters, name: 'new-blob-456' },
      };
      vi.mocked(utils.generateBlob).mockReturnValue(newBlobData);

      const randomizeButton = screen.getByRole('button', { name: /randomize/i });
      await user.click(randomizeButton);

      await waitFor(() => {
        expect(screen.getByText('new-blob-456')).toBeInTheDocument();
      });
      expect(utils.generateBlob).toHaveBeenCalledTimes(2);
    });

    it('should reset upload state when randomize is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      } as Response);

      render(<NewShape setLastMutationTime={mockSetLastMutationTime} />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(uploadButton).toBeDisabled();
      });

      const randomizeButton = screen.getByRole('button', { name: /randomize/i });
      await user.click(randomizeButton);

      await waitFor(() => {
        expect(uploadButton).not.toBeDisabled();
      });
    });

    it('should be enabled at all times', () => {
      render(<NewShape />);
      const randomizeButton = screen.getByRole('button', { name: /randomize/i });
      expect(randomizeButton).not.toBeDisabled();
    });
  });

  describe('Upload Functionality', () => {
    it('should call API with correct data when upload is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Upload successful' }),
      } as Response);

      render(<NewShape setLastMutationTime={mockSetLastMutationTime} />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/blobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockBlobData.parameters),
        });
      });
    });

    it('should update lastMutationTime after successful upload', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Upload successful' }),
      } as Response);

      render(<NewShape setLastMutationTime={mockSetLastMutationTime} />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(mockSetLastMutationTime).toHaveBeenCalledWith(expect.any(Number));
      });
    });

    it('should mark as uploaded after successful upload', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Upload successful' }),
      } as Response);

      render(<NewShape setLastMutationTime={mockSetLastMutationTime} />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      expect(uploadButton).not.toBeDisabled();

      await user.click(uploadButton);

      await waitFor(() => {
        expect(uploadButton).toBeDisabled();
      });
    });

    it('should handle upload without setLastMutationTime prop', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Upload successful' }),
      } as Response);

      render(<NewShape />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Disabled States', () => {
    it('should disable upload button when uploadDisabled is true', () => {
      vi.mocked(utils, true).uploadDisabled = true;
      render(<NewShape />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      expect(uploadButton).toBeDisabled();
    });

    it('should disable upload button when blob data is not available', () => {
      vi.mocked(utils.generateBlob).mockReturnValue(undefined as any);
      render(<NewShape />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      expect(uploadButton).toBeDisabled();
    });

    it('should disable upload button after successful upload', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      } as Response);

      render(<NewShape />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(uploadButton).toBeDisabled();
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle fetch failure gracefully', async () => {
      const user = userEvent.setup();
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Upload failed' }),
      } as Response);

      render(<NewShape setLastMutationTime={mockSetLastMutationTime} />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      consoleLogSpy.mockRestore();
    });

    it('should handle network error gracefully', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<NewShape setLastMutationTime={mockSetLastMutationTime} />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });

      await expect(async () => {
        await user.click(uploadButton);
      }).rejects.toThrow('Network error');
    });

    it('should handle API response without message', async () => {
      const user = userEvent.setup();
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      render(<NewShape setLastMutationTime={mockSetLastMutationTime} />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      expect(consoleLogSpy).not.toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it('should still update wasUploaded state even on API error', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error' }),
      } as Response);

      render(<NewShape setLastMutationTime={mockSetLastMutationTime} />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(uploadButton).toBeDisabled();
      });
    });
  });

  describe('Multiple Interactions', () => {
    it('should allow multiple randomize clicks', async () => {
      const user = userEvent.setup();
      render(<NewShape />);

      const randomizeButton = screen.getByRole('button', { name: /randomize/i });

      await user.click(randomizeButton);
      await user.click(randomizeButton);
      await user.click(randomizeButton);

      expect(utils.generateBlob).toHaveBeenCalledTimes(4);
    });

    it('should handle randomize after upload', async () => {
      const user = userEvent.setup();
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      } as Response);

      render(<NewShape />);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      const randomizeButton = screen.getByRole('button', { name: /randomize/i });

      await user.click(uploadButton);
      await waitFor(() => expect(uploadButton).toBeDisabled());

      await user.click(randomizeButton);
      await waitFor(() => expect(uploadButton).not.toBeDisabled());
    });
  });
});

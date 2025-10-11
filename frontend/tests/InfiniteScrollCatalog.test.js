import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InfiniteScrollCatalog from '../InfiniteScrollCatalog';

// Mock fetch
global.fetch = jest.fn();

describe('InfiniteScrollCatalog', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders catalog header', () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], page: 1, limit: 20 })
      });

    render(<InfiniteScrollCatalog />);
    expect(screen.getByText('FreshLook Catalogus')).toBeInTheDocument();
  });

  it('fetches and displays outfits', async () => {
    const mockOutfits = [
      { id: 1, title: 'Test Outfit', price: 99.99, style_name: 'Casual' }
    ];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockOutfits, page: 1, limit: 20 })
      });

    render(<InfiniteScrollCatalog />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Outfit')).toBeInTheDocument();
    });
  });

  it('filters outfits by style', async () => {
    const mockStyles = [{ id: 1, name: 'Casual' }];
    const mockOutfits = [
      { id: 1, title: 'Casual Outfit', price: 99.99, style_name: 'Casual' }
    ];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStyles
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockOutfits, page: 1, limit: 20 })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockOutfits, page: 1, limit: 20 })
      });

    render(<InfiniteScrollCatalog />);
    
    await waitFor(() => {
      const styleSelect = screen.getByLabelText('Filter op stijl');
      fireEvent.change(styleSelect, { target: { value: 'Casual' } });
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('style=Casual')
    );
  });
});

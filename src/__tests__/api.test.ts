import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addEntry } from '../api';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('addEntry', () => {
  it('sends POST request with correct body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: '123' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const data = { name: 'Alice' };
    const result = await addEntry('Customer Details', data);

    expect(mockFetch).toHaveBeenCalledWith('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('Customer Details'),
    });
    expect(result.id).toBe('123');
    expect(result.form).toBe('Customer Details');
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
    }));

    await expect(addEntry('test', {})).rejects.toThrow('HTTP 400');
  });
});

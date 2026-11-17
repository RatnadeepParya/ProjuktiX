import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '../lib/api-client';

describe('API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('provides methods for core platform endpoints', () => {
    expect(typeof apiClient.getTechnologies).toBe('function');
    expect(typeof apiClient.getTechnology).toBe('function');
    expect(typeof apiClient.getCourses).toBe('function');
    expect(typeof apiClient.getChapters).toBe('function');
    expect(typeof apiClient.getLessons).toBe('function');
    expect(typeof apiClient.getLesson).toBe('function');
    expect(typeof apiClient.getAssessment).toBe('function');
    expect(typeof apiClient.submitAssessment).toBe('function');
    expect(typeof apiClient.getExercises).toBe('function');
    expect(typeof apiClient.submitExercise).toBe('function');
    expect(typeof apiClient.verifyCertificate).toBe('function');
    expect(typeof apiClient.getAdminDashboard).toBe('function');
  });

  it('correctly constructs query parameters for technology filtering', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
        pagination: { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 },
      }),
    });
    globalThis.fetch = fetchMock;

    await apiClient.getTechnologies({ domain: 'databases', search: 'oracle' });

    expect(fetchMock).toHaveBeenCalled();
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('domain=databases');
    expect(calledUrl).toContain('search=oracle');
  });

  it('throws an error when response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ success: false, error: { message: 'Technology not found' } }),
    });
    globalThis.fetch = fetchMock;

    await expect(apiClient.getTechnology('unknown-tech')).rejects.toThrow('Technology not found');
  });
});

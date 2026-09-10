/**
 * useApi<T> — generic data-fetching hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => getDashboardSummary());
 */
import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../services/types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: any[] = [],
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      setError({
        statusCode: err?.statusCode ?? 0,
        message: err?.message ?? 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}

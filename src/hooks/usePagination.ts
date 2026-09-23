/**
 * usePagination — reusable pagination state for FlatLists and tables.
 *
 * Manages: page, pageSize, hasNextPage, load-more trigger.
 * Works with any data-fetching function that accepts (offset, limit).
 */
import { useState, useCallback, useRef } from 'react';

interface UsePaginationOptions<T> {
  fetchFn: (offset: number, limit: number) => Promise<T[]>;
  pageSize?: number;
}

export function usePagination<T>({ fetchFn, pageSize = 20 }: UsePaginationOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

  const loadPage = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    if (!reset && !hasMore) return;

    loadingRef.current = true;
    if (reset) {
      setRefreshing(true);
      offsetRef.current = 0;
    } else {
      setLoading(true);
    }

    try {
      const offset = reset ? 0 : offsetRef.current;
      const data = await fetchFn(offset, pageSize);
      const newItems = data ?? [];

      setItems(prev => (reset ? newItems : [...prev, ...newItems]));
      setHasMore(newItems.length === pageSize);
      offsetRef.current = offset + newItems.length;
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load data');
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchFn, pageSize, hasMore]);

  const refresh = useCallback(() => loadPage(true), [loadPage]);
  const loadMore = useCallback(() => loadPage(false), [loadPage]);

  // Initial load
  const initialized = useRef(false);
  if (!initialized.current) {
    initialized.current = true;
    loadPage(true);
  }

  return { items, loading, refreshing, error, hasMore, refresh, loadMore };
}

/**
 * useSearch — debounced search hook.
 *
 * Returns a debounced value that updates 300ms after the user stops typing.
 * Use `query` for display, `debouncedQuery` for API calls.
 */
import { useState, useEffect } from 'react';

export function useSearch(delay = 300) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);
    return () => clearTimeout(timer);
  }, [query, delay]);

  const clear = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  return { query, setQuery, debouncedQuery, clear };
}

/**
 * filterBySearch — utility to filter an array using a search query
 * across multiple string fields.
 */
export function filterBySearch<T>(
  items: T[],
  query: string,
  getFields: (item: T) => string[]
): T[] {
  if (!query.trim()) return items;
  const lower = query.toLowerCase();
  return items.filter(item =>
    getFields(item).some(field => field?.toLowerCase().includes(lower))
  );
}

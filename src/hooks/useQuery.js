import { useState, useEffect, useCallback } from 'react';

export function useQuery(queryFn, deps = [], { skip = false } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    if (skip) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await queryFn();
      // Support both { data, error } (Supabase) and plain values
      if (result && typeof result === 'object' && 'error' in result) {
        if (result.error) throw result.error;
        setData(result.data);
      } else {
        setData(result);
      }
    } catch (e) {
      setError(e.message ?? String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, skip]);

  useEffect(() => { execute(); }, [execute]);

  return { data, loading, error, refetch: execute };
}

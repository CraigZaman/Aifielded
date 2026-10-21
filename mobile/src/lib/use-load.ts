import { useCallback, useEffect, useRef, useState } from 'react';

export function useLoad<T>(load: () => Promise<T>, dependencies: readonly unknown[]) {
  const key = JSON.stringify(dependencies);
  const keyRef = useRef(key);
  const loadRef = useRef(load);
  const requestRef = useRef(0);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    const requestedKey = keyRef.current;
    const request = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await loadRef.current();
      if (request === requestRef.current && requestedKey === keyRef.current) setData(result);
    } catch (cause) {
      if (request === requestRef.current && requestedKey === keyRef.current) setError(cause instanceof Error ? cause.message : 'Could not load this screen.');
    } finally {
      if (request === requestRef.current && requestedKey === keyRef.current) setLoading(false);
    }
  }, []);
  useEffect(() => { loadRef.current = load; }, [load]);
  useEffect(() => {
    // A changed query key invalidates any response still in flight.
    keyRef.current = key;
    requestRef.current += 1;
    const task = setTimeout(() => { void refresh(); }, 0);
    return () => { clearTimeout(task); requestRef.current += 1; };
  }, [key, refresh]);
  return { data, loading, error, refresh };
}

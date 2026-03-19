import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for polling an async function at a regular interval.
 *
 * @param {Function} fetchFn - Async function that returns data. Receives no arguments.
 * @param {number} [intervalMs=10000] - Polling interval in milliseconds.
 * @param {boolean} [enabled=true] - Whether polling is active.
 * @returns {{ data: any, loading: boolean, error: string|null, lastUpdated: Date|null, refresh: Function }}
 */
const usePolling = (fetchFn, intervalMs = 10000, enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const fetchRef = useRef(fetchFn);
  const mountedRef = useRef(true);

  // Keep fetchFn ref up to date without re-triggering the effect
  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  const doFetch = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const result = await fetchRef.current();
      if (mountedRef.current) {
        setData(result);
        setError(null);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || "Fetch failed");
        console.error("Polling error:", err);
      }
    } finally {
      if (mountedRef.current && isInitial) setLoading(false);
    }
  }, []);

  // Initial fetch + interval setup
  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Initial fetch
    doFetch(true);

    // Set up interval
    intervalRef.current = setInterval(() => doFetch(false), intervalMs);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs, enabled, doFetch]);

  const refresh = useCallback(() => doFetch(false), [doFetch]);

  return { data, loading, error, lastUpdated, refresh };
};

export default usePolling;

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  timeout?: number;
  retry?: number;
}

/**
 * Hook para manejar carga de datos asincrónica con mejor control de errores
 */
export const useAsyncData = <T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
  options: UseAsyncDataOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);

  const { onSuccess, onError, timeout = 15000, retry = 2 } = options;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Crear promise con timeout
      const timeoutPromise = new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      );

      const result = await Promise.race([fetcher(), timeoutPromise]);

      if (isMountedRef.current) {
        setData(result);
        onSuccess?.(result);
        retryCountRef.current = 0;
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        
        if (retryCountRef.current < retry) {
          retryCountRef.current++;
          // Retry con delay
          setTimeout(fetchData, 1000 * retryCountRef.current);
        } else {
          setError(errorMessage);
          onError?.(err);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, timeout, retry, onSuccess, onError]);

  useEffect(() => {
    isMountedRef.current = true;
    retryCountRef.current = 0;
    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

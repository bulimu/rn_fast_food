import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface UseAppwriteOption<T, P extends Record<string, string | number>> {
  fn : (params: P) => Promise<T>;
  params?: P;
  skip?: boolean;
}

interface UseAppwriteReturn<T, P> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: (newParams?: P) => Promise<void>;
}

const useAppwrite = <T, P extends Record<string, string | number>>({
  fn,
  params = {} as P,
  skip = false,
}: UseAppwriteOption<T, P>): UseAppwriteReturn<T, P> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(!skip);

  const fetchData = useCallback(async (fetchParams: P) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn({ ...fetchParams });
      setData(result);
    } catch (err: unknown) {
       const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(new Error(errorMessage));
        Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
    
  }, [fn]);

  useEffect(() => {
        if (!skip) {
            fetchData(params);
        }
    }, [fetchData, params, skip]);

    const refetch = async (newParams?: P) => await fetchData(newParams!);

  return { data, error, loading, refetch };
}

export default useAppwrite;
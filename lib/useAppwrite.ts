import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useCallback, useEffect, useState } from 'react';


interface UseAppwriteQueryOptions<T, P extends Record<string, any>> 
  extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  fn: (params: P) => Promise<T>;
  params?: P;
  queryKey: (string | number | boolean | null | undefined)[];
}

export const useAppwriteQuery = <T, P extends Record<string, any>>({
  fn,
  params = {} as P,
  queryKey,
  enabled = true,
  ...queryOptions
}: UseAppwriteQueryOptions<T, P>) => {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => fn(params),
    enabled,
    ...queryOptions,
  });
};


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
    }, [fetchData, JSON.stringify(params), skip]);

    const refetch = async (newParams?: P) => await fetchData(newParams!);

  return { data, error, loading, refetch };
}

export default useAppwrite;
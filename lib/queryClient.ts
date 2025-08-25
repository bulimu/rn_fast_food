import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5minutes stale time
      
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection time
      refetchOnWindowFocus: false, // disable refetch on window focus
      retry: 3, // 
    },
  },
});

import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance configured for high performance and UX.
 * 
 * Performance tuning:
 * - staleTime: 2 minutes (prevents spamming API when navigating between tabs)
 * - gcTime: 10 minutes (keeps unused cache in memory for smooth transitions)
 * - refetchOnWindowFocus: false (avoids disruptive background refetches while working)
 * - retry: Smart retry policy (skips retrying 401/403/404 client errors)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        // Never retry unauthorized, forbidden, or not found errors
        if (status === 401 || status === 403 || status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});

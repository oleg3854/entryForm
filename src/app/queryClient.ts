import { QueryClient } from '@tanstack/react-query';

// Create a query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on failure by default
      retry: false,
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
      // Consider data stale after 5 minutes
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      // Don't retry mutations (especially for auth)
      retry: false,
    },
  },
});

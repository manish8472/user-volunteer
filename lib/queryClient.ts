import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Default options for all queries and mutations
const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: how long data is considered fresh (5 minutes)
    staleTime: 5 * 60 * 1000,
    
    // Cache time: how long inactive data stays in cache (10 minutes)
    gcTime: 10 * 60 * 1000, // Previously called cacheTime
    
    // Retry failed requests 3 times with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus in production for fresh data
    refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Throw errors in render for error boundaries to catch
    throwOnError: false,
  },
  mutations: {
    // Retry mutations once on failure
    retry: 1,
    
    // Throw errors for error boundaries
    throwOnError: false,
  },
};

// Create and export the query client instance
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Helper function to create a new query client (useful for testing)
export const createQueryClient = (overrides?: DefaultOptions) => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...queryConfig.queries,
        ...overrides?.queries,
      },
      mutations: {
        ...queryConfig.mutations,
        ...overrides?.mutations,
      },
    },
  });
};

export default queryClient;

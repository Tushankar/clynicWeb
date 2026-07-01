import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api/client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry auth/permission/not-found — only transient failures.
        if (error instanceof ApiError && error.status < 500 && error.status !== 0) return false;
        return failureCount < 2;
      },
    },
  },
});

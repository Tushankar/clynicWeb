import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api/client';
import { toastApiError } from './toast';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry client errors (4xx: auth/permission/not-found/validation).
        // Network drops (status 0, from apiFetch) and server errors (5xx) are transient — retry up to the limit.
        if (error instanceof ApiError && error.status !== 0 && error.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      // Default error handler: any mutation that omits its own onError still
      // surfaces a readable toast (offline message for network drops, server
      // message otherwise) instead of failing silently.
      onError: (error) => toastApiError(error),
    },
  },
});

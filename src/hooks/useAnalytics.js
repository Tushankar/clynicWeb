import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

/** Clinic-scoped owner analytics (Premium). Optional { from, to, branchId }. */
export function useAnalytics(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'overview', params],
    queryFn: () => api.get('/api/analytics/overview', { params }),
  });
}

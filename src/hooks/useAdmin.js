import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

/** 403 for non-super-admins → query errors (retry off); the UI hides the area. */
export function useIsSuperAdmin() {
  return useQuery({ queryKey: ['admin', 'me'], queryFn: () => api.get('/api/admin/me'), retry: false });
}

export function useAdminAnalytics() {
  return useQuery({ queryKey: ['admin', 'analytics'], queryFn: () => api.get('/api/admin/analytics'), retry: false });
}

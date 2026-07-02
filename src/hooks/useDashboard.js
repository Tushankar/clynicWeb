import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useRole } from './useRole';
import { useBranch } from '@/context/BranchContext';

/**
 * Dashboard home summary — KPIs (+trends/sparklines), weekly series, demographics,
 * live queue, today's appointments, activity feed, doctor availability, AI suggestions.
 * One clinic-scoped call; refetches every 60s so the home screen stays fresh.
 */
export function useDashboard() {
  const { clinicId } = useRole();
  const { branchId } = useBranch();
  return useQuery({
    queryKey: ['dashboard', 'summary', clinicId, branchId],
    queryFn: () => api.get('/api/dashboard/summary', { params: branchId ? { branchId } : {} }),
    enabled: !!clinicId,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

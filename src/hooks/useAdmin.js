import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

/** 403 for non-super-admins → query errors (retry off); the UI hides the area. */
export function useIsSuperAdmin() {
  return useQuery({ queryKey: ['admin', 'me'], queryFn: () => api.get('/api/admin/me'), retry: false });
}

export function useAdminAnalytics() {
  return useQuery({ queryKey: ['admin', 'analytics'], queryFn: () => api.get('/api/admin/analytics'), retry: false });
}

/** Per-clinic operational list (plan, subscription status, dues, activity). */
export function useAdminClinics() {
  return useQuery({ queryKey: ['admin', 'clinics'], queryFn: () => api.get('/api/admin/clinics'), retry: false });
}

/** Platform-owner override: force a clinic's plan (support / manual provisioning). */
export function useSetClinicPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clinicId, plan }) => api.post(`/api/admin/clinics/${clinicId}/plan`, { plan }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'clinics'] });
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
  });
}

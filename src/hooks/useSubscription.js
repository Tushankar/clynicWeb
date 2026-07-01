import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useSubscription() {
  return useQuery({ queryKey: ['subscription'], queryFn: () => api.get('/api/subscription') });
}

export function useChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan) => api.post('/api/subscription/change', { plan }),
    onSuccess: () => {
      // Refresh plan gating everywhere (nav, FeatureGate) + subscription view.
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

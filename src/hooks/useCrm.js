import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useCrmSummary() {
  return useQuery({ queryKey: ['crm', 'summary'], queryFn: () => api.get('/api/crm/summary') });
}

export function useCrmSegment(key) {
  return useQuery({
    queryKey: ['crm', 'segment', key],
    queryFn: () => api.get(`/api/crm/segment/${key}`),
    enabled: !!key,
  });
}

export function useReengage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patientId) => api.post(`/api/crm/patients/${patientId}/reengage`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm'] }),
  });
}

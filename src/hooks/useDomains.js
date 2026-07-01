import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useDomains() {
  return useQuery({ queryKey: ['domains'], queryFn: () => api.get('/api/domains') });
}

function useDomainMutation(fn) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }) });
}

export const useAddDomain = () => useDomainMutation((domain) => api.post('/api/domains', { domain }));
export const useVerifyDomain = () => useDomainMutation((id) => api.post(`/api/domains/${id}/verify`));
export const useRemoveDomain = () => useDomainMutation((id) => api.del(`/api/domains/${id}`));

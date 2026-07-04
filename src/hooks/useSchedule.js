import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

/** Availability blocks (time off), cancellation waitlist, and treatment recalls (§5.20–5.22). */

// ---- Time off / availability blocks ----
export function useBlocks(params) {
  return useQuery({ queryKey: ['availability-blocks', params], queryFn: () => api.get('/api/availability', { params }) });
}
export function useCreateBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/api/availability', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability-blocks'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
export function useRemoveBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.del(`/api/availability/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability-blocks'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

// ---- Waitlist ----
export function useWaitlist(params, opts = {}) {
  return useQuery({ queryKey: ['waitlist', params], queryFn: () => api.get('/api/waitlist', { params }), ...opts });
}
export function useSetWaitlistStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => api.patch(`/api/waitlist/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['waitlist'] }),
  });
}

// ---- Recalls ----
export function useRecalls(params) {
  return useQuery({ queryKey: ['recalls', params], queryFn: () => api.get('/api/recalls', { params }) });
}
export function useCreateRecall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/api/recalls', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recalls'] }),
  });
}
export function useCancelRecall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/api/recalls/${id}/cancel`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recalls'] }),
  });
}

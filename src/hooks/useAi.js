import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useAiDrafts(status = 'pending_review') {
  return useQuery({ queryKey: ['ai', 'drafts', status], queryFn: () => api.get('/api/ai/drafts', { params: { status } }) });
}

export function useAiFaq() {
  return useMutation({ mutationFn: (question) => api.post('/api/ai/faq', { question }) });
}

export function useAiSearch() {
  return useMutation({ mutationFn: (q) => api.get('/api/ai/search', { params: { q } }) });
}

export function useGenerateVisitSummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, appointmentId }) => api.post('/api/ai/visit-summary', { patientId, appointmentId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai', 'drafts'] }),
  });
}

function useDraftAction(fn) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ['ai', 'drafts'] }) });
}

export const useApproveDraft = () => useDraftAction(({ id, editedContent }) => api.post(`/api/ai/drafts/${id}/approve`, { editedContent }));
export const useRejectDraft = () => useDraftAction((id) => api.post(`/api/ai/drafts/${id}/reject`));

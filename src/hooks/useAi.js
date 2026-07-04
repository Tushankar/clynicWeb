import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useAiDrafts(status = 'pending_review', patientId, opts = {}) {
  return useQuery({
    queryKey: ['ai', 'drafts', status, patientId || null],
    queryFn: () => api.get('/api/ai/drafts', { params: { status, patientId } }),
    ...opts,
  });
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
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      // Approving creates a real ClinicalNote → refresh the drafts AND the notes/timeline
      // so the approved summary appears in the patient chart immediately.
      qc.invalidateQueries({ queryKey: ['ai', 'drafts'] });
      qc.invalidateQueries({ queryKey: ['notes'] });
      qc.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export const useApproveDraft = () => useDraftAction(({ id, editedContent }) => api.post(`/api/ai/drafts/${id}/approve`, { editedContent }));
export const useRejectDraft = () => useDraftAction((id) => api.post(`/api/ai/drafts/${id}/reject`));

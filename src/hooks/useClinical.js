import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

// ---- Prescriptions ----
export function usePrescriptions(patientId) {
  return useQuery({
    queryKey: ['prescriptions', patientId],
    queryFn: () => api.get('/api/prescriptions', { params: { patientId } }),
    enabled: !!patientId,
  });
}
function clinicalMutation(fn, keys) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })) });
}
export const useCreatePrescription = () => clinicalMutation((body) => api.post('/api/prescriptions', body), ['prescriptions', 'timeline']);
export const useDeletePrescription = () => clinicalMutation((id) => api.del(`/api/prescriptions/${id}`), ['prescriptions', 'timeline']);
/** Share the prescription with the patient as a tokenized link (§5.23, DOCUMENT_SHARING). */
export const useSharePrescription = () => useMutation({ mutationFn: (id) => api.post(`/api/prescriptions/${id}/share`) });

// ---- Clinical notes ----
export function useNotes(patientId) {
  return useQuery({
    queryKey: ['notes', patientId],
    queryFn: () => api.get('/api/clinical-notes', { params: { patientId } }),
    enabled: !!patientId,
  });
}
export const useCreateNote = () => clinicalMutation((body) => api.post('/api/clinical-notes', body), ['notes', 'timeline']);
export const useDeleteNote = () => clinicalMutation((id) => api.del(`/api/clinical-notes/${id}`), ['notes', 'timeline']);

// ---- Timeline ----
export function useTimeline(patientId) {
  return useQuery({
    queryKey: ['timeline', patientId],
    queryFn: () => api.get(`/api/patients/${patientId}/timeline`),
    enabled: !!patientId,
  });
}

// ---- Lab requests ----
export function useLabs(patientId) {
  return useQuery({
    queryKey: ['labs', patientId],
    queryFn: () => api.get('/api/lab-requests', { params: { patientId } }),
    enabled: !!patientId,
  });
}
export const useCreateLab = () => clinicalMutation((body) => api.post('/api/lab-requests', body), ['labs', 'timeline']);
export const useSetLabStatus = () => clinicalMutation(({ id, status }) => api.patch(`/api/lab-requests/${id}/status`, { status }), ['labs', 'timeline']);

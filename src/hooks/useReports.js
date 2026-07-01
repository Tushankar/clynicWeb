import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiUpload, API_URL } from '@/lib/api/client';

export function useReports(patientId) {
  return useQuery({
    queryKey: ['reports', patientId],
    queryFn: () => api.get('/api/reports', { params: { patientId } }),
    enabled: !!patientId,
  });
}

export function useUploadReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, type, title, file }) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('patientId', patientId);
      if (type) fd.append('type', type);
      if (title) fd.append('title', title);
      return apiUpload('/api/reports', fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      qc.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.del(`/api/reports/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      qc.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}

/** Fetch a short-lived signed URL then open the private file (no public URL exists). */
export async function openReport(id) {
  const { path } = await api.get(`/api/reports/${id}/signed-url`);
  window.open(`${API_URL}${path}`, '_blank', 'noopener');
}

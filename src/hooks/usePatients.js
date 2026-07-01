import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function usePatients(search) {
  return useQuery({
    queryKey: ['patients', search || ''],
    queryFn: () => api.get('/api/patients', { params: { search, limit: 100 } }),
    placeholderData: keepPreviousData,
  });
}

export function usePatientDetail(id) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => api.get(`/api/patients/${id}/detail`),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/api/patients', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/api/patients/${id}`, body),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      qc.invalidateQueries({ queryKey: ['patient', v.id] });
    },
  });
}

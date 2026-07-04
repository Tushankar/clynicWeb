import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useDoctors(activeOnly = true) {
  return useQuery({
    queryKey: ['doctors', activeOnly],
    queryFn: () => api.get('/api/doctors', { params: { activeOnly } }),
  });
}

/**
 * Owner: add a new practitioner directly — name, specialization, fee, and the weekly working
 * hours that generate bookable slots. This is what makes a clinic bookable; without at least one
 * doctor there are no slots, no online booking, and no public-site content.
 */
export function useCreateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/api/doctors', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctors'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

/**
 * Owner: update an EXISTING practitioner's profile — consultation fee, specialization,
 * bookable status, and weekly hours. Their leave lives on the Time Off page.
 */
export function useUpdateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/api/doctors/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctors'] });
      qc.invalidateQueries({ queryKey: ['slots'] }); // a fee/status change affects booking
    },
  });
}

/** Owner: clinic team members, for linking a doctor to a login account (drives the doctor dashboard). */
export function useStaffDirectory(enabled = true) {
  return useQuery({
    queryKey: ['staff-directory'],
    queryFn: () => api.get('/api/doctors/staff-directory'),
    enabled,
    staleTime: 60_000,
  });
}

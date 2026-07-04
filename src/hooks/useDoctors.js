import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useDoctors(activeOnly = true) {
  return useQuery({
    queryKey: ['doctors', activeOnly],
    queryFn: () => api.get('/api/doctors', { params: { activeOnly } }),
  });
}

/**
 * Owner: update an EXISTING practitioner's profile — consultation fee, specialization,
 * bookable status. Practitioners themselves are added as staff via Clerk (the team), and
 * their leave lives on the Time Off page; this only edits the doctor's clinic profile.
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

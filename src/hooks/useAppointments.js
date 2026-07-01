import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useAppointments(params) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => api.get('/api/appointments', { params }),
  });
}

export function useSlots(doctorId, date) {
  return useQuery({
    queryKey: ['slots', doctorId, date],
    queryFn: () => api.get('/api/appointments/slots', { params: { doctorId, date } }),
    enabled: !!doctorId && !!date,
  });
}

function useApptMutation(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['queue'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

export const useBookAppointment = () => useApptMutation((body) => api.post('/api/appointments', body));
export const useWalkIn = () => useApptMutation((body) => api.post('/api/appointments/walk-in', body));
export const useCheckIn = () => useApptMutation((id) => api.post(`/api/appointments/${id}/check-in`));
export const useSetStatus = () => useApptMutation(({ id, status, reason }) => api.patch(`/api/appointments/${id}/status`, { status, reason }));
export const useReschedule = () => useApptMutation(({ id, scheduledAt }) => api.patch(`/api/appointments/${id}/reschedule`, { scheduledAt }));
export const useCancelAppointment = () => useApptMutation(({ id, reason }) => api.post(`/api/appointments/${id}/cancel`, { reason }));

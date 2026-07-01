import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useCurrentDoctor() {
  return useQuery({ queryKey: ['doctors', 'me'], queryFn: () => api.get('/api/doctors/me') });
}

export function useDoctorDashboard({ doctorId, date }) {
  return useQuery({
    queryKey: ['doctor-dashboard', doctorId, date],
    queryFn: () => api.get('/api/doctors/dashboard', { params: { doctorId, date } }),
    enabled: !!doctorId,
  });
}

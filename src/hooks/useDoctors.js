import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useDoctors(activeOnly = true) {
  return useQuery({
    queryKey: ['doctors', activeOnly],
    queryFn: () => api.get('/api/doctors', { params: { activeOnly } }),
  });
}

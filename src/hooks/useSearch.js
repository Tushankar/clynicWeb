import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useSearch(q) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => api.get('/api/search', { params: { q } }),
    enabled: q.trim().length >= 2,
  });
}

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

/** Summary counts of outbound messages, grouped by template (for the cards). */
export function useCommsSummary() {
  return useQuery({ queryKey: ['comms', 'summary'], queryFn: () => api.get('/api/communications/summary') });
}

/** The outbound message log (newest first), optionally filtered by template. */
export function useCommsList({ template } = {}) {
  return useQuery({
    queryKey: ['comms', 'list', template || 'all'],
    queryFn: () => api.get('/api/communications', { params: { template } }),
  });
}

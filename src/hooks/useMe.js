import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { api } from '@/lib/api/client';

/** GET /api/me — backend-derived identity for the active clinic (who/clinic/role/plan). */
export function useMe() {
  const { orgId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['me', orgId],
    queryFn: () => api.get('/api/me'),
    enabled: isLoaded && !!orgId,
  });
}

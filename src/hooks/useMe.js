import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { api } from '@/lib/api/client';

/** GET /api/me — backend-derived identity for the active clinic (who/clinic/role/profile). */
export function useMe() {
  const { orgId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['me', orgId],
    queryFn: () => api.get('/api/me'),
    enabled: isLoaded && !!orgId,
  });
}

/** Owner: update the clinic profile (name/address/phone/gst). Flows to the public website. */
export function useUpdateClinic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch) => api.patch('/api/me/clinic', patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

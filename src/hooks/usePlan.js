import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { api } from '@/lib/api/client';

/**
 * The active clinic's plan + resolved feature flags from GET /api/me/plan.
 * Convenience only — the backend requireFeature middleware is the real lock (hard rule 5).
 */
export function usePlan() {
  const { orgId, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['me', 'plan', orgId],
    queryFn: () => api.get('/api/me/plan'),
    enabled: isLoaded && !!orgId,
  });
}

/** Returns true if the active clinic's plan unlocks `featureKey`. */
export function useFeature(featureKey) {
  const { data } = usePlan();
  return !!data?.features?.[featureKey];
}

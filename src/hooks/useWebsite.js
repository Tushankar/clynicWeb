import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiFetch } from '@/lib/api/client';

/** Owner: read/save the clinic's public-site content (Premium). */
export function useWebsiteContent() {
  return useQuery({ queryKey: ['website'], queryFn: () => api.get('/api/website') });
}

export function useSaveWebsite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content) => api.put('/api/website', { content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website'] }),
  });
}

/** Public: render payload for a clinic's site (no auth). */
export function usePublicSite(slug) {
  return useQuery({
    queryKey: ['public-site', slug],
    queryFn: () => apiFetch(`/api/public/site/${slug}`, { auth: false }),
    enabled: !!slug,
    retry: false,
  });
}

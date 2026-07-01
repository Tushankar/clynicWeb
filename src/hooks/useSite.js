import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';

/**
 * Public website data for a clinic slug (§8.6). No auth — resolves the slug to one clinic and
 * returns its published site config (or { available:false }). Path form: we pass ?slug=.
 */
export function useSite(slug) {
  return useQuery({
    queryKey: ['public-site', slug],
    queryFn: () => apiFetch('/api/public/site', { auth: false, params: { slug } }),
    enabled: !!slug,
    retry: false,
  });
}

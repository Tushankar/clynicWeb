import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

/** Dashboard CMS (§8.6). GET config, then tiered edits (content/theme = CMS_BASIC, pages/reviews/seo = CMS_ADVANCED). */
export function useWebsiteConfig() {
  return useQuery({ queryKey: ['website'], queryFn: () => api.get('/api/website') });
}

function useWebsiteMutation(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      if (data) qc.setQueryData(['website'], data); // server returns fresh config
      qc.invalidateQueries({ queryKey: ['website'] });
    },
  });
}

export const usePublishWebsite = () => useWebsiteMutation((published) => api.post('/api/website/publish', { published }));
export const useUpdateContent = () => useWebsiteMutation((content) => api.put('/api/website/content', { content }));
export const useUpdateTheme = () => useWebsiteMutation(({ template, theme }) => api.put('/api/website/theme', { template, theme }));
export const useUpdateReviews = () => useWebsiteMutation((reviews) => api.put('/api/website/reviews', { reviews }));
export const useUpdateSeo = () => useWebsiteMutation((seo) => api.put('/api/website/seo', { seo }));
export const useCreatePage = () => useWebsiteMutation((page) => api.post('/api/website/pages', page));
export const useUpdatePage = () => useWebsiteMutation(({ slug, ...patch }) => api.put(`/api/website/pages/${slug}`, patch));
export const useDeletePage = () => useWebsiteMutation((slug) => api.del(`/api/website/pages/${slug}`));

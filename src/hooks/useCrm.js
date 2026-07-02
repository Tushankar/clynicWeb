import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiUpload } from '@/lib/api/client';

export function useCrmSummary() {
  return useQuery({ queryKey: ['crm', 'summary'], queryFn: () => api.get('/api/crm/summary') });
}

export function useCrmSegment(key) {
  return useQuery({
    queryKey: ['crm', 'segment', key],
    queryFn: () => api.get(`/api/crm/segment/${key}`),
    enabled: !!key,
  });
}

export function useReengage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patientId) => api.post(`/api/crm/patients/${patientId}/reengage`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm'] }),
  });
}

// ---- Automations control panel (settings + templates + campaigns) ----

export function useCrmSettings() {
  return useQuery({ queryKey: ['crm', 'settings'], queryFn: () => api.get('/api/crm/settings') });
}

export function useUpdateCrmSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch) => api.patch('/api/crm/settings', patch),
    onSuccess: (data) => qc.setQueryData(['crm', 'settings'], data),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, subject, body, imageUrl }) => api.patch(`/api/crm/templates/${kind}`, { subject, body, imageUrl }),
    onSuccess: (data) => {
      qc.setQueryData(['crm', 'settings'], data);
      qc.invalidateQueries({ queryKey: ['crm', 'template-preview'] });
    },
  });
}

/** Edit the email color theme (accent / background / heading / text). Empty '' resets a color. */
export function useUpdateEmailTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (colors) => api.patch('/api/crm/theme', colors),
    onSuccess: (data) => {
      qc.setQueryData(['crm', 'settings'], data);
      qc.invalidateQueries({ queryKey: ['crm', 'template-preview'] });
    },
  });
}

/** Upload a hero image (multipart) for a template. */
export function useUploadTemplateImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, file }) => {
      const fd = new FormData();
      fd.append('image', file);
      return apiUpload(`/api/crm/templates/${kind}/image`, fd);
    },
    onSuccess: (data) => {
      qc.setQueryData(['crm', 'settings'], data);
      qc.invalidateQueries({ queryKey: ['crm', 'template-preview'] });
    },
  });
}

/** Send a rendered template preview to a real address (owner). */
export function useTestTemplate() {
  return useMutation({
    mutationFn: ({ kind, email }) => api.post(`/api/crm/templates/${kind}/test`, { email }),
  });
}

/** The rendered branded HTML for a template (sample patient) — live preview. */
export function useTemplatePreview(kind) {
  return useQuery({
    queryKey: ['crm', 'template-preview', kind],
    queryFn: () => api.get(`/api/crm/templates/${kind}/preview`),
    enabled: !!kind,
  });
}

/** Run the birthday / follow-up campaign for this clinic right now. */
export function useRunCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaign) => api.post('/api/crm/campaigns/run', { campaign }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comms'] }),
  });
}

// ---- WhatsApp (Baileys) channel pairing ----

export function useWhatsappStatus({ poll = false } = {}) {
  return useQuery({
    queryKey: ['whatsapp', 'status'],
    queryFn: () => api.get('/api/whatsapp/status'),
    refetchInterval: poll ? 2500 : false,
    retry: false,
  });
}

export function useWhatsappConnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/whatsapp/connect'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp'] }),
  });
}

export function useWhatsappLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/whatsapp/logout'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp'] }),
  });
}

import { useMutation } from '@tanstack/react-query';
import { API_URL, getAuthToken } from '@/lib/api/client';

/**
 * CSV export (§5.23, owner-only). Fetches the authenticated CSV endpoint and
 * triggers a browser download — apiFetch would JSON-parse, so this goes direct.
 */
async function downloadCsv(entity, params = {}) {
  const token = await getAuthToken();
  const url = new URL(`${API_URL}/api/export/${entity}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) {
    let message = `Export failed (${res.status})`;
    try {
      message = (await res.json())?.message || message;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${entity}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

export function useExportCsv() {
  return useMutation({ mutationFn: ({ entity, params }) => downloadCsv(entity, params) });
}

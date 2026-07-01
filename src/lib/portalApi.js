// Patient-portal API client. Uses a patient session token (localStorage), NOT Clerk.
const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
const KEY = 'clinic_portal_token';

export const getPortalToken = () => localStorage.getItem(KEY);
export const setPortalToken = (t) => (t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY));

export async function portalFetch(path, { method = 'GET', body, auth = true } = {}) {
  const token = auth ? getPortalToken() : null;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText);
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function portalUpload(path, formData) {
  const token = getPortalToken();
  const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: formData });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(data?.message || res.statusText);
  return data;
}

export { API_URL };

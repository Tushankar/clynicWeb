// Storefront API client (Ultra Premium, UP-D) — the PUBLIC pharmacy store lives outside
// the Clerk-authed app. Patients authenticate with a lightweight email-OTP session token
// (NOT a Clerk token), scoped per clinic slug. This module owns that token + the three
// request shapes the storefront needs:
//   • storePublic  — unauthenticated browse (categories, products, search) + OTP endpoints.
//   • storeAuthed  — patient order endpoints, carrying the OTP token as a Bearer header.
//   • storeUpload  — multipart prescription upload, same Bearer header (apiUpload attaches the
//                    Clerk token instead, so the store needs its own uploader).
import { apiFetch, API_URL, ApiError } from '@/lib/api/client';

const tokenKey = (slug) => `clynic_store_token_${slug}`;
const patientKey = (slug) => `clynic_store_patient_${slug}`;

/* ------------------------------ session (per slug) ------------------------------ */

export function getStoreToken(slug) {
  try {
    return localStorage.getItem(tokenKey(slug)) || null;
  } catch {
    return null;
  }
}

export function getStorePatient(slug) {
  try {
    const raw = localStorage.getItem(patientKey(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoreSession(slug, token, patient) {
  try {
    if (token) localStorage.setItem(tokenKey(slug), token);
    if (patient) localStorage.setItem(patientKey(slug), JSON.stringify(patient));
  } catch {
    /* storage unavailable (private mode) — the token still lives in memory for this tab */
  }
  notifyAuth();
}

export function clearStoreSession(slug) {
  try {
    localStorage.removeItem(tokenKey(slug));
    localStorage.removeItem(patientKey(slug));
  } catch {
    /* ignore */
  }
  notifyAuth();
}

// Tiny pub/sub so the navbar / orders page re-render on login & logout (useSyncExternalStore).
const authListeners = new Set();
function notifyAuth() {
  authListeners.forEach((fn) => fn());
}
export function subscribeStoreAuth(fn) {
  authListeners.add(fn);
  return () => authListeners.delete(fn);
}

/* --------------------------------- requests --------------------------------- */

/** Public browse call — base `/api/public/c/${slug}/store`. `path` is appended ('' for home). */
export function storePublic(slug, path = '', opts = {}) {
  return apiFetch(`/api/public/c/${slug}/store${path}`, { ...opts, auth: false });
}

/** Patient order call — base `/api/store`. Attaches the OTP token as a Bearer header. */
export function storeAuthed(slug, path, { method = 'GET', body, params } = {}) {
  const token = getStoreToken(slug);
  return apiFetch(`/api/store${path}`, {
    method,
    body,
    params,
    auth: false,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

/** Multipart upload to `/api/store${path}` with the patient Bearer header (mirrors apiUpload). */
export async function storeUpload(slug, path, formData) {
  const token = getStoreToken(slug);
  let res;
  try {
    res = await fetch(`${API_URL}${`/api/store${path}`}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  } catch {
    throw new ApiError(0, 'You appear to be offline. Check your connection and try again.');
  }
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) throw new ApiError(res.status, data?.message || res.statusText, data);
  return data;
}

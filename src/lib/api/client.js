// Single API client for clinic-api (section 8.5).
// Attaches the Clerk session token to every request and centralizes errors.
// All calls go through apiFetch — never call fetch() directly elsewhere.

// API base URL: VITE_API_BASE_URL preferred (VITE_API_URL kept for back-compat).
const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Socket.IO endpoint (live queue). Defaults to the API origin unless VITE_SOCKET_URL is set.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

// The Clerk session token is only available via the useAuth() hook, so a small
// bridge component (ApiTokenBridge) registers a getter here at app start.
let tokenGetter = async () => null;
export function setTokenGetter(fn) {
  tokenGetter = fn;
}
/** Current Clerk session token (for the Socket.IO handshake). */
export function getAuthToken() {
  return tokenGetter();
}

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message || `Request failed (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function buildUrl(path, params) {
  const url = new URL(path.startsWith('http') ? path : `${API_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

export async function apiFetch(path, { method = 'GET', body, params, headers = {}, auth = true } = {}) {
  const token = auth ? await tokenGetter() : null;
  let res;
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers: {
        'content-type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    // fetch() rejects (TypeError) only on a network-level failure: offline, DNS,
    // connection drop, blocked request. Surface it as a status-0 ApiError so callers
    // and the queryClient retry guard can treat it as a transient network error.
    throw new ApiError(0, 'You appear to be offline. Check your connection and try again.');
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new ApiError(res.status, data?.message || res.statusText, data);
  }
  return data;
}

// Multipart upload (FormData). Lets the browser set the multipart boundary —
// do NOT set content-type here. Attaches the Clerk token like apiFetch.
export async function apiUpload(path, formData, { method = 'POST' } = {}) {
  const token = await tokenGetter();
  let res;
  try {
    res = await fetch(buildUrl(path), {
      method,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
  } catch {
    // Network-level failure (see apiFetch) — surface as a status-0 ApiError.
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

// Convenience verbs.
export const api = {
  get: (path, opts) => apiFetch(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => apiFetch(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => apiFetch(path, { ...opts, method: 'PATCH', body }),
  put: (path, body, opts) => apiFetch(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => apiFetch(path, { ...opts, method: 'DELETE' }),
};

export { API_URL, SOCKET_URL };

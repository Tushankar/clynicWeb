import { useCallback, useSyncExternalStore } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  storePublic,
  storeAuthed,
  storeUpload,
  getStoreToken,
  getStorePatient,
  setStoreSession,
  clearStoreSession,
  subscribeStoreAuth,
} from '@/lib/storeClient';
import { collectPayment } from '@/lib/payments/razorpayCheckout';

/**
 * Storefront data layer (Ultra Premium, UP-D). Public browse queries hit
 * `/api/public/c/:slug/store`; patient order queries hit `/api/store` with the OTP Bearer.
 * All keys are namespaced under ['store', slug] so a login/logout or order mutation can
 * invalidate the whole tenant sub-tree at once.
 */

/* ---------------------------------- session ---------------------------------- */

export function useStoreSession(slug) {
  const token = useSyncExternalStore(
    useCallback((cb) => subscribeStoreAuth(cb), []),
    useCallback(() => getStoreToken(slug), [slug]),
    useCallback(() => getStoreToken(slug), [slug])
  );
  return { token, isAuthed: !!token, patient: getStorePatient(slug) };
}

export function useStoreLogout(slug) {
  const qc = useQueryClient();
  return useCallback(() => {
    clearStoreSession(slug);
    qc.removeQueries({ queryKey: ['store', slug, 'orders'] });
    qc.removeQueries({ queryKey: ['store', slug, 'order'] });
  }, [qc, slug]);
}

/* --------------------------------- browse (public) --------------------------------- */

export function useStoreHome(slug) {
  return useQuery({
    queryKey: ['store', slug, 'home'],
    queryFn: () => storePublic(slug, ''),
    enabled: !!slug,
    retry: false,
  });
}

export function useStoreCategory(slug, catSlug) {
  return useQuery({
    queryKey: ['store', slug, 'category', catSlug],
    queryFn: () => storePublic(slug, `/category/${catSlug}`),
    enabled: !!slug && !!catSlug,
    retry: false,
  });
}

export function useStoreSymptom(slug, tag) {
  return useQuery({
    queryKey: ['store', slug, 'symptom', tag],
    queryFn: () => storePublic(slug, `/symptoms/${encodeURIComponent(tag)}`),
    enabled: !!slug && !!tag,
    retry: false,
  });
}

export function useStoreSearch(slug, q) {
  return useQuery({
    queryKey: ['store', slug, 'search', q],
    queryFn: () => storePublic(slug, '/search', { params: { q } }),
    enabled: !!slug && !!q,
    retry: false,
  });
}

export function useStoreProduct(slug, id) {
  return useQuery({
    queryKey: ['store', slug, 'medicine', id],
    queryFn: () => storePublic(slug, `/medicine/${id}`),
    enabled: !!slug && !!id,
    retry: false,
  });
}

/* -------------------------------- orders (patient) -------------------------------- */

export function useMyOrders(slug) {
  const { token } = useStoreSession(slug);
  return useQuery({
    queryKey: ['store', slug, 'orders'],
    queryFn: () => storeAuthed(slug, '/orders'),
    enabled: !!slug && !!token,
    retry: false,
  });
}

export function useMyOrder(slug, id) {
  const { token } = useStoreSession(slug);
  return useQuery({
    queryKey: ['store', slug, 'order', id],
    queryFn: () => storeAuthed(slug, `/orders/${id}`),
    enabled: !!slug && !!id && !!token,
    retry: false,
  });
}

/* --------------------------------- mutations --------------------------------- */

export function useRequestOtp(slug) {
  return useMutation({
    mutationFn: (email) => storePublic(slug, '/otp/request', { method: 'POST', body: { email } }),
  });
}

export function useVerifyOtp(slug) {
  return useMutation({
    mutationFn: ({ email, code, name }) =>
      storePublic(slug, '/otp/verify', { method: 'POST', body: { email, code, name } }),
    onSuccess: (res) => {
      if (res?.token) setStoreSession(slug, res.token, res.patient);
    },
  });
}

export function useCreateOrder(slug) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => storeAuthed(slug, '/orders', { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['store', slug, 'orders'] }),
  });
}

export function useUploadPrescription(slug) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, file }) => {
      const fd = new FormData();
      fd.append('file', file);
      return storeUpload(slug, `/orders/${orderId}/prescription`, fd);
    },
    onSuccess: (_res, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['store', slug, 'order', orderId] });
      qc.invalidateQueries({ queryKey: ['store', slug, 'orders'] });
    },
  });
}

/**
 * Pay for an order. The server tells us which gateway is live via `order.driver`:
 * `mock` (dev) → sign server-side; `razorpay` (prod) → open the real checkout. Either way the
 * proof is verified server-side by /verify-payment. Reuses the shared collectPayment helper.
 */
export function usePayOrder(slug) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, storeName, patient }) => {
      const order = await storeAuthed(slug, `/orders/${orderId}/pay-order`, { method: 'POST' });
      const proof = await collectPayment(order, {
        name: storeName || 'Pharmacy order',
        description: 'Medicine order',
        prefill: { name: patient?.name, email: patient?.email },
        mockSign: (oid) =>
          storeAuthed(slug, `/orders/${orderId}/mock-sign`, { method: 'POST', body: { orderId: oid } }),
      });
      return storeAuthed(slug, `/orders/${orderId}/verify-payment`, { method: 'POST', body: proof });
    },
    onSuccess: (_res, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['store', slug, 'order', orderId] });
      qc.invalidateQueries({ queryKey: ['store', slug, 'orders'] });
    },
  });
}

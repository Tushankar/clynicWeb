import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { collectPayment } from '@/lib/payments/razorpayCheckout';

export function useInvoices(params) {
  return useQuery({ queryKey: ['invoices', params], queryFn: () => api.get('/api/invoices', { params }) });
}
export function useInvoice(id) {
  return useQuery({ queryKey: ['invoice', id], queryFn: () => api.get(`/api/invoices/${id}`), enabled: !!id });
}

function billingMutation(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoice'] });
    },
  });
}

export const useCreateInvoice = () => billingMutation((body) => api.post('/api/invoices', body));
export const useRecordPayment = () => billingMutation(({ id, ...body }) => api.post(`/api/invoices/${id}/payments`, body));
export const useRefund = () => billingMutation(({ id, ...body }) => api.post(`/api/invoices/${id}/refund`, body));

/**
 * Pay an invoice online. PRODUCTION: open Razorpay checkout (checkout.js) → it returns
 * {order_id, payment_id, signature} which we POST to /payments/verify (server verifies).
 * DEV (mock driver): the mock gateway signs server-side via /payments/mock-sign so the
 * flow completes — verification still happens server-side, exactly as in production.
 */
export function usePayOnline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceId) => {
      const order = await api.post(`/api/payments/invoice/${invoiceId}/order`);
      const proof = await collectPayment(order, {
        name: 'Invoice payment',
        mockSign: (orderId) => api.post('/api/payments/mock-sign', { orderId }),
      });
      return api.post('/api/payments/verify', proof);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoice'] });
    },
  });
}

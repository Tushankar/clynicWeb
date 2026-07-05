import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiUpload } from '@/lib/api/client';

/**
 * Pharmacy & Vendor module (Ultra Premium, UP-A) — medicine catalog + inventory batches.
 * All calls go through the plan-gated /api/pharmacy routes (403 for non-Ultra clinics).
 * Mutations invalidate the whole ['pharmacy'] tree so availability (which depends on
 * batches) and the summary refetch together.
 */

/* --------------------------------- Medicines --------------------------------- */

export function useMedicines(params) {
  return useQuery({ queryKey: ['pharmacy', 'medicines', params], queryFn: () => api.get('/api/pharmacy/medicines', { params }) });
}
export function useMedicineMeta() {
  return useQuery({ queryKey: ['pharmacy', 'medicine-meta'], queryFn: () => api.get('/api/pharmacy/medicines/meta'), staleTime: Infinity });
}
export function useCreateMedicine() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body) => api.post('/api/pharmacy/medicines', body), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useUpdateMedicine() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...body }) => api.patch(`/api/pharmacy/medicines/${id}`, body), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useRemoveMedicine() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => api.del(`/api/pharmacy/medicines/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useUploadMedicineImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiUpload(`/api/pharmacy/medicines/${id}/image`, fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }),
  });
}

/* --------------------------------- Inventory --------------------------------- */

export function useInventorySummary() {
  return useQuery({ queryKey: ['pharmacy', 'inventory-summary'], queryFn: () => api.get('/api/pharmacy/inventory/summary') });
}
export function useBatches(params) {
  return useQuery({ queryKey: ['pharmacy', 'batches', params], queryFn: () => api.get('/api/pharmacy/inventory/batches', { params }) });
}
export function useCreateBatch() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body) => api.post('/api/pharmacy/inventory/batches', body), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useUpdateBatch() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...body }) => api.patch(`/api/pharmacy/inventory/batches/${id}`, body), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useRemoveBatch() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => api.del(`/api/pharmacy/inventory/batches/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}

/* --------------------------------- Suppliers (UP-B) --------------------------------- */

export function useSuppliers(params) {
  return useQuery({ queryKey: ['pharmacy', 'suppliers', params], queryFn: () => api.get('/api/pharmacy/suppliers', { params }) });
}
export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body) => api.post('/api/pharmacy/suppliers', body), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...body }) => api.patch(`/api/pharmacy/suppliers/${id}`, body), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useRemoveSupplier() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => api.del(`/api/pharmacy/suppliers/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}

/* ------------------------------ Purchase orders (UP-B) ------------------------------ */

export function usePurchaseOrders(params) {
  return useQuery({ queryKey: ['pharmacy', 'purchase-orders', params], queryFn: () => api.get('/api/pharmacy/purchase-orders', { params }) });
}
export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body) => api.post('/api/pharmacy/purchase-orders', body), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useUpdatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...body }) => api.patch(`/api/pharmacy/purchase-orders/${id}`, body), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useSetPurchaseOrderStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }) => api.post(`/api/pharmacy/purchase-orders/${id}/status`, { status }), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useReceivePurchaseOrder() {
  const qc = useQueryClient();
  // Receiving creates inventory batches + a purchase expense → invalidate the whole pharmacy tree.
  return useMutation({ mutationFn: ({ id, items }) => api.post(`/api/pharmacy/purchase-orders/${id}/receive`, { items }), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useRemovePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => api.del(`/api/pharmacy/purchase-orders/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}

/* --------------------------------- Expenses (UP-B) ---------------------------------- */

export function usePharmacyExpenses(params) {
  return useQuery({ queryKey: ['pharmacy', 'expenses', params], queryFn: () => api.get('/api/pharmacy/expenses', { params }) });
}
export function usePharmacyExpenseMeta() {
  return useQuery({ queryKey: ['pharmacy', 'expense-meta'], queryFn: () => api.get('/api/pharmacy/expenses/meta'), staleTime: Infinity });
}
export function useCreatePharmacyExpense() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body) => api.post('/api/pharmacy/expenses', body), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useRemovePharmacyExpense() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => api.del(`/api/pharmacy/expenses/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}

/* --------------------------- Dispensing & dosage (UP-C) --------------------------- */

export function useDispenses(params) {
  return useQuery({ queryKey: ['pharmacy', 'dispenses', params], queryFn: () => api.get('/api/pharmacy/dispenses', { params }) });
}
export function useDosageSchedules(patientId) {
  return useQuery({ queryKey: ['pharmacy', 'dosage', patientId], queryFn: () => api.get('/api/pharmacy/dosage', { params: { patientId } }), enabled: !!patientId });
}
export function useDispense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/api/pharmacy/dispense', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pharmacy'] }); // stock / dispenses / dosage / summary
      qc.invalidateQueries({ queryKey: ['invoices'] }); // a GST invoice was created
      qc.invalidateQueries({ queryKey: ['timeline'] }); // dispense appears on the patient timeline
    },
  });
}

/* ------------------------------- Reports (UP-E) ------------------------------- */

export function usePharmacyReports(params) {
  return useQuery({ queryKey: ['pharmacy', 'reports', params], queryFn: () => api.get('/api/pharmacy/reports', { params }) });
}

/* ------------------------------- Store orders (UP-D) ------------------------------- */

export function useStoreOrders(params) {
  return useQuery({ queryKey: ['pharmacy', 'store-orders', params], queryFn: () => api.get('/api/pharmacy/orders', { params }) });
}
export function useStoreOrder(id) {
  return useQuery({ queryKey: ['pharmacy', 'store-order', id], queryFn: () => api.get(`/api/pharmacy/orders/${id}`), enabled: !!id });
}
export function useVerifyStoreOrder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => api.post(`/api/pharmacy/orders/${id}/verify`), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useRejectStoreOrder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, reason }) => api.post(`/api/pharmacy/orders/${id}/reject`, { reason }), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useFulfillStoreOrder() {
  const qc = useQueryClient();
  // Fulfilling dispenses stock → invalidate the whole pharmacy tree (inventory + summary).
  return useMutation({ mutationFn: (id) => api.post(`/api/pharmacy/orders/${id}/fulfill`), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useCancelStoreOrder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, reason }) => api.post(`/api/pharmacy/orders/${id}/cancel`, { reason }), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}

/* ------------------------------ Store categories (UP-D) ------------------------------ */

export function useStoreCategories(params) {
  return useQuery({ queryKey: ['pharmacy', 'store-categories', params], queryFn: () => api.get('/api/pharmacy/store-categories', { params }) });
}
export function useCreateStoreCategory() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body) => api.post('/api/pharmacy/store-categories', body), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useUpdateStoreCategory() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...body }) => api.patch(`/api/pharmacy/store-categories/${id}`, body), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useRemoveStoreCategory() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id) => api.del(`/api/pharmacy/store-categories/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }) });
}
export function useUploadStoreCategoryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiUpload(`/api/pharmacy/store-categories/${id}/image`, fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacy'] }),
  });
}

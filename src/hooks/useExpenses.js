import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

/** Expense tracking (§5.23, Premium) — powers the Billing → Expenses tab + P&L. */

export function useExpenses(params) {
  return useQuery({ queryKey: ['expenses', params], queryFn: () => api.get('/api/expenses', { params }) });
}
export function useExpenseCategories() {
  return useQuery({ queryKey: ['expense-categories'], queryFn: () => api.get('/api/expenses/categories'), staleTime: Infinity });
}
export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/api/expenses', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
export function useRemoveExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.del(`/api/expenses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

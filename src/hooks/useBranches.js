import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useBranches() {
  return useQuery({ queryKey: ['branches'], queryFn: () => api.get('/api/branches') });
}

function useBranchMutation(fn) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }) });
}

export const useCreateBranch = () => useBranchMutation((body) => api.post('/api/branches', body));
export const useUpdateBranch = () => useBranchMutation(({ id, ...body }) => api.patch(`/api/branches/${id}`, body));
export const useDeleteBranch = () => useBranchMutation((id) => api.del(`/api/branches/${id}`));

/** The clinic's primary branch id (queue/TV are branch-scoped — hard rule 8). */
export function usePrimaryBranch() {
  const q = useBranches();
  const items = q.data?.items || [];
  const primary = items.find((b) => b.isPrimary) || items[0] || null;
  return { branch: primary, branchId: primary?._id || null, ...q };
}

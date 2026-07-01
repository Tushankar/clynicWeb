import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useBranches } from '@/hooks/useBranches';
import { useFeature } from '@/hooks/usePlan';

/**
 * Active-branch selection for the whole app shell (Phase 4 multi-branch).
 *
 * - `branchId === null` means "All branches" — the centralized owner view (only
 *   offered to Premium clinics with >1 branch). Branch-scoped lists omit the filter.
 * - Single-branch clinics (or non-Premium) are pinned to their one branch, so behaviour
 *   is identical to before multi-branch. Tenant isolation is unaffected — the backend
 *   always scopes to clinicId regardless of the branch filter.
 */
const BranchContext = createContext(null);

const storageKey = (orgId) => `clinic-os:branch:${orgId || 'none'}`;

export function BranchProvider({ children }) {
  const { orgId } = useAuth();
  const { data } = useBranches();
  const branches = data?.items || [];
  const multiBranch = useFeature('MULTI_BRANCH') && branches.length > 1;
  const primary = branches.find((b) => b.isPrimary) || branches[0] || null;

  const [selected, setSelected] = useState(null); // null = All branches

  // Restore the persisted selection once branches load (per clinic).
  useEffect(() => {
    if (!branches.length) return;
    const saved = localStorage.getItem(storageKey(orgId));
    if (saved === 'all') setSelected(null);
    else if (saved && branches.some((b) => b._id === saved)) setSelected(saved);
    else setSelected(multiBranch ? null : primary?._id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, data]);

  const setBranchId = (id) => {
    setSelected(id);
    localStorage.setItem(storageKey(orgId), id === null ? 'all' : id);
  };

  const value = useMemo(
    () => ({
      branches,
      multiBranch,
      // The active branch filter for branch-scoped list queries (null = all branches).
      branchId: multiBranch ? selected : primary?._id || null,
      // A concrete branch for inherently single-branch surfaces (queue/TV): never null.
      resolvedBranchId: (multiBranch ? selected : null) || primary?._id || null,
      setBranchId,
      primaryBranchId: primary?._id || null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [branches, multiBranch, selected, primary?._id]
  );

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function useBranch() {
  return useContext(BranchContext) || { branches: [], multiBranch: false, branchId: null, resolvedBranchId: null, setBranchId: () => {}, primaryBranchId: null };
}

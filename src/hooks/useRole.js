import { useAuth } from '@clerk/clerk-react';
import { normalizeRole } from '@/lib/utils';

/**
 * The signed-in staff member's role for the active clinic (owner/doctor/receptionist),
 * derived from the Clerk org role. Used to filter nav and gate actions in the UI.
 */
export function useRole() {
  const { orgRole, isLoaded, orgId, userId } = useAuth();
  return { role: normalizeRole(orgRole), clinicId: orgId, userId, isLoaded };
}

export function useHasRole(...allowed) {
  const { role } = useRole();
  return allowed.flat().includes(role);
}

import { ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRole } from '@/hooks/useRole';

/**
 * Client-side role guard for owner-only pages. The backend requireRole middleware is the real
 * lock (a non-owner still gets 403 from the API); this just replaces the resulting raw error /
 * misleading "upgrade your plan" wall with a clear "this is for owners" message when someone
 * reaches the URL directly.
 */
export function RoleGate({ roles = ['owner'], children }) {
  const { role } = useRole();
  if (!role) return null; // role still resolving — avoid a flash of the denied state
  if (roles.includes(role)) return children;
  return (
    <Card className="flex flex-col items-center px-6 py-16 text-center">
      <ShieldAlert className="h-10 w-10 text-muted-foreground" />
      <h3 className="mt-3 text-base font-medium text-foreground">This area is for clinic owners</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        You don’t have permission to view this page. Ask the clinic owner if you need access.
      </p>
    </Card>
  );
}

export default RoleGate;

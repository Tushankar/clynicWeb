import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setTokenGetter } from '@/lib/api/client';

/**
 * Registers Clerk's session-token getter with the API client so apiFetch() can
 * attach a Bearer token from anywhere (including React Query functions outside
 * the component tree). Renders nothing.
 */
export default function ApiTokenBridge() {
  const { getToken } = useAuth();
  useEffect(() => {
    setTokenGetter(() => getToken());
    return () => setTokenGetter(async () => null);
  }, [getToken]);
  return null;
}

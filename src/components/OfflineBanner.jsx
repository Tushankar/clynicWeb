import { useEffect, useState } from 'react';

/**
 * OfflineBanner — unobtrusive fixed top banner shown only while the browser is
 * offline. Initializes from navigator.onLine and tracks window online/offline
 * events (listeners cleaned up on unmount). Renders nothing when online.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    // Re-sync in case connectivity changed before this mounted.
    setOffline(!navigator.onLine);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[100] bg-warning px-4 py-2 text-center text-sm font-medium text-warning-foreground shadow-sm"
    >
      You&apos;re offline — changes may not save. We&apos;ll reconnect automatically.
    </div>
  );
}

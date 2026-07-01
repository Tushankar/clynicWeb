import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { API_URL } from '@/lib/api/client';
import { getSocket } from '@/hooks/useQueue';

/**
 * Waiting-room TV display (public route /tv/:slug). No auth: gets a display-safe
 * snapshot (tokens + first names) and live updates via Socket.IO. High-contrast,
 * very large tokens, minimal chrome — readable across the room.
 */
export default function TvDisplayPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clinicName, setClinicName] = useState('');
  const [snapshot, setSnapshot] = useState({ nowServing: [], waiting: [] });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let active = true;
    let socket;
    let clinicId;
    let branchId;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/c/${slug}/queue`);
        if (!res.ok) throw new Error('Clinic not found');
        const data = await res.json();
        if (!active) return;
        clinicId = data.clinicId;
        branchId = data.branchId;
        setClinicName(data.clinicName || '');
        setSnapshot(data.snapshot || { nowServing: [], waiting: [] });
        setLoading(false);

        socket = getSocket();
        const join = () => socket.emit('queue:join', { clinicId, branchId });
        if (socket.connected) join();
        socket.on('connect', join);
        socket.on('queue:update', (snap) => active && setSnapshot(snap));
      } catch (e) {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
      if (socket) {
        socket.off('queue:update');
        socket.off('connect');
        if (clinicId && branchId) socket.emit('queue:leave', { clinicId, branchId });
      }
    };
  }, [slug]);

  const serving = snapshot.nowServing || [];
  const waiting = snapshot.waiting || [];

  return (
    <div className="flex min-h-screen flex-col bg-foreground p-6 text-background sm:p-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xl font-semibold sm:text-2xl">
          <Logo className="h-9" />
          {clinicName || 'Clinic'}
        </div>
        <div className="tabular text-2xl font-semibold sm:text-3xl">
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-2xl opacity-70">Loading queue…</div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center text-2xl text-destructive">{error}</div>
      ) : (
        <main className="grid flex-1 gap-8 py-8 lg:grid-cols-3">
          {/* Now serving */}
          <section className="lg:col-span-2 flex flex-col">
            <h2 className="text-lg font-medium uppercase tracking-wide text-background/60">Now serving</h2>
            {serving.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-background/15 text-3xl text-background/50">
                Please wait to be called
              </div>
            ) : (
              <div className="mt-4 grid flex-1 content-start gap-5 sm:grid-cols-2">
                {serving.map((e) => (
                  <div key={e.id || e.token} className="rounded-2xl border border-primary/40 bg-primary/10 p-6 text-center">
                    <div className="text-7xl font-bold tabular text-primary sm:text-8xl">{e.token}</div>
                    <div className="mt-2 truncate text-2xl font-medium">{e.name}</div>
                    <div className="text-lg text-background/60">{e.doctorName || ''}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Up next */}
          <section className="flex flex-col">
            <h2 className="text-lg font-medium uppercase tracking-wide text-background/60">Up next</h2>
            {waiting.length === 0 ? (
              <div className="mt-4 flex flex-1 items-center justify-center rounded-2xl border border-background/15 text-xl text-background/40">
                No one waiting
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {waiting.slice(0, 8).map((e) => (
                  <li key={e.id} className="flex items-center gap-4 rounded-xl border border-background/15 px-4 py-3">
                    <span className="flex h-12 w-16 items-center justify-center rounded-lg bg-background/10 text-2xl font-semibold tabular">
                      {e.token}
                    </span>
                    <span className="truncate text-xl">{e.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      )}

      <footer className="text-center text-sm text-background/40">Live · updates automatically</footer>
    </div>
  );
}

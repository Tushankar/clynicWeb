import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFeature } from '@/hooks/usePlan';
import { useSearch } from '@/hooks/useSearch';
import { fmtDateTime } from '@/lib/format';

/** Gmail-style global search (top bar). Plan-gated — hidden unless UNIVERSAL_SEARCH unlocked. */
export function GlobalSearch() {
  const allowed = useFeature('UNIVERSAL_SEARCH');
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isFetching } = useSearch(debounced);
  if (!allowed) return null;

  const patients = data?.patients || [];
  const appts = data?.appointments || [];
  const show = open && debounced.trim().length >= 2;

  const goPatient = (id) => {
    navigate(`/patients/${id}`);
    setOpen(false);
    setQ('');
  };

  return (
    <div
      className="relative w-full max-w-md"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Search patients, phone, condition…"
        className="pl-9"
        aria-label="Universal search"
      />
      {show && (
        <div className="absolute z-50 mt-1 max-h-96 w-full overflow-auto rounded-md border bg-popover shadow-md">
          {patients.length === 0 && appts.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">{isFetching ? 'Searching…' : 'No results'}</div>
          ) : (
            <>
              {patients.length > 0 && (
                <Group title="Patients">
                  {patients.map((p) => (
                    <button key={p._id} onMouseDown={() => goPatient(p._id)} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-caption text-muted-foreground">{p.phone || p.patientCode}</span>
                    </button>
                  ))}
                </Group>
              )}
              {appts.length > 0 && (
                <Group title="Appointments">
                  {appts.map((a) => (
                    <button key={a._id} onMouseDown={() => goPatient(a.patientId)} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent">
                      <span>{a.patientName} · {a.doctorName}</span>
                      <span className="text-caption text-muted-foreground">{fmtDateTime(a.scheduledAt)}</span>
                    </button>
                  ))}
                </Group>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div className="py-1">
      <div className="px-3 py-1 text-caption font-medium uppercase tracking-wide text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

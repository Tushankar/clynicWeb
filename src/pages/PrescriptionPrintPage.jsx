import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useMe } from '@/hooks/useMe';
import { fmtDateTime } from '@/lib/format';

/** Printable prescription (standalone, no app shell). Authenticated via RequireAuth. */
export default function PrescriptionPrintPage() {
  const { id } = useParams();
  const clinic = useMe().data?.clinic;
  const { data: rx, isLoading, isError } = useQuery({
    queryKey: ['prescription', id],
    queryFn: () => api.get(`/api/prescriptions/${id}`),
  });

  useEffect(() => {
    if (rx) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [rx]);

  if (isLoading) return <Centered>Loading…</Centered>;
  if (isError || !rx) return <Centered>Prescription not found.</Centered>;

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 text-foreground">
      <div className="mb-6 flex items-start justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-semibold">{clinic?.name || 'Clinic'}</h1>
          <p className="text-sm text-muted-foreground">Prescription</p>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-md border px-3 py-1.5 text-sm print:hidden"
        >
          <Printer className="mr-1 inline h-4 w-4" /> Print
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-muted-foreground">Patient: </span><span className="font-medium">{rx.patientName || '—'}</span></div>
        <div><span className="text-muted-foreground">Date: </span>{fmtDateTime(rx.createdAt)}</div>
        <div><span className="text-muted-foreground">Doctor: </span>{rx.doctorName || '—'}</div>
        {rx.diagnosis && <div><span className="text-muted-foreground">Diagnosis: </span>{rx.diagnosis}</div>}
      </div>

      <div className="mb-2 text-2xl font-serif">℞</div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2">Medicine</th><th>Dose</th><th>Frequency</th><th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {rx.items.map((it, i) => (
            <tr key={i} className="border-b">
              <td className="py-2 font-medium">{it.drug}</td><td>{it.dose || '—'}</td><td>{it.frequency || '—'}</td><td>{it.duration || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {rx.notes && <p className="mt-4 text-sm"><span className="text-muted-foreground">Advice: </span>{rx.notes}</p>}

      <div className="mt-16 text-right text-sm">
        <div className="inline-block border-t px-8 pt-1">{rx.doctorName || 'Doctor'}</div>
      </div>
    </div>
  );
}

function Centered({ children }) {
  return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{children}</div>;
}

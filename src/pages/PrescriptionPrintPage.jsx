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
      {/* Clinic identity + prescriber credentials. A prescription in India is not a valid document
          without the prescriber's medical-council registration number, and neither that nor the
          clinic's contact details were printed. The credentials are snapshotted onto the
          prescription at issue time, so an old Rx shows what was true when it was written. */}
      <div className="mb-6 flex items-start justify-between gap-6 border-b pb-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">{clinic?.name || 'Clinic'}</h1>
          {clinic?.address && <p className="mt-0.5 text-xs text-muted-foreground">{clinic.address}</p>}
          {clinic?.phone && <p className="text-xs text-muted-foreground">Phone: {clinic.phone}</p>}
          <p className="mt-1 text-sm text-muted-foreground">Prescription</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-medium">{rx.doctorName || 'Doctor'}</div>
          {rx.doctorQualifications && <div className="text-xs text-muted-foreground">{rx.doctorQualifications}</div>}
          {rx.doctorRegistrationNumber
            ? <div className="text-xs text-muted-foreground">Reg. No: <span className="font-mono">{rx.doctorRegistrationNumber}</span></div>
            : <div className="text-xs text-amber-600 print:hidden">No registration number on file — add it to the doctor’s profile.</div>}
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
        <div className="inline-block border-t px-8 pt-1">
          <div className="font-medium">{rx.doctorName || 'Doctor'}</div>
          {rx.doctorQualifications && <div className="text-xs text-muted-foreground">{rx.doctorQualifications}</div>}
          {rx.doctorRegistrationNumber && (
            <div className="text-xs text-muted-foreground">Reg. No: <span className="font-mono">{rx.doctorRegistrationNumber}</span></div>
          )}
          <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">Signature</div>
        </div>
      </div>
    </div>
  );
}

function Centered({ children }) {
  return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{children}</div>;
}

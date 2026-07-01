import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusBadge, LoadingSkeleton, EmptyState } from '@/components/primitives';
import { usePatientDetail } from '@/hooks/usePatients';
import { useHasRole } from '@/hooks/useRole';
import { fmtDate, fmtDateTime, ageFromDob } from '@/lib/format';
import { Pencil, CalendarClock, AlertCircle } from 'lucide-react';

export function PatientDetailDialog({ patientId, open, onOpenChange, onEdit }) {
  const { data, isLoading, isError, error, refetch } = usePatientDetail(open ? patientId : null);
  const canEdit = useHasRole('owner', 'doctor', 'receptionist');
  const patient = data?.patient;
  const visits = data?.visits || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{patient?.name || 'Patient'}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <LoadingSkeleton lines={6} />
        ) : isError ? (
          <div className="flex flex-col items-center py-8 text-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="mt-2 text-sm text-muted-foreground">{error?.message || 'Could not load patient.'}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          patient && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                <Field label="Patient code" value={patient.patientCode} mono />
                <Field label="Phone" value={patient.phone} />
                <Field label="Email" value={patient.email} />
                <Field label="Age" value={ageFromDob(patient.dob) ?? '—'} />
                <Field label="DOB" value={patient.dob ? fmtDate(patient.dob) : '—'} />
                <Field label="Gender" value={patient.gender} className="capitalize" />
                <Field label="Visits" value={patient.visitCount ?? visits.length} />
                <Field label="Last visit" value={patient.lastVisitAt ? fmtDate(patient.lastVisitAt) : '—'} />
              </div>
              {(patient.bloodGroup || patient.allergies?.length || patient.currentMedications?.length || patient.medicalHistory) && (
                <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Field label="Blood group" value={patient.bloodGroup} />
                  </div>
                  {patient.allergies?.length > 0 && <Chips label="Allergies" items={patient.allergies} tone="destructive" />}
                  {patient.currentMedications?.length > 0 && <Chips label="Current meds" items={patient.currentMedications} />}
                  {patient.medicalHistory && (
                    <div>
                      <div className="text-caption text-muted-foreground">Medical history</div>
                      <p className="whitespace-pre-wrap">{patient.medicalHistory}</p>
                    </div>
                  )}
                </div>
              )}

              {patient.notes && (
                <div className="rounded-md bg-muted/50 p-3 text-sm">
                  <span className="text-muted-foreground">Notes: </span>
                  {patient.notes}
                </div>
              )}

              <Separator />

              <div>
                <h4 className="mb-2 text-sm font-medium">Visit history</h4>
                {visits.length === 0 ? (
                  <EmptyState icon={CalendarClock} title="No visits yet" description="Appointments will appear here once booked." />
                ) : (
                  <ul className="space-y-2">
                    {visits.map((v) => (
                      <li key={v._id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                        <div className="min-w-0">
                          <div className="font-medium">{fmtDateTime(v.scheduledAt)}</div>
                          <div className="text-caption text-muted-foreground">
                            {v.doctorName || 'Doctor'} · token {v.tokenNumber ?? '—'}
                          </div>
                        </div>
                        <StatusBadge status={v.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {canEdit && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => onEdit(patient)}>
                    <Pencil className="h-4 w-4" /> Edit patient
                  </Button>
                </div>
              )}
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, mono, className }) {
  return (
    <div>
      <div className="text-caption text-muted-foreground">{label}</div>
      <div className={`font-medium ${mono ? 'font-mono text-xs' : ''} ${className || ''}`}>{value || '—'}</div>
    </div>
  );
}

function Chips({ label, items, tone }) {
  return (
    <div>
      <div className="text-caption text-muted-foreground">{label}</div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span
            key={i}
            className={`rounded-full px-2 py-0.5 text-xs ${tone === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'}`}
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

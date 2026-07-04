import { Link } from 'react-router-dom';
import {
  Phone, MessageCircle, CalendarDays, Clock, Hash, NotebookPen, ReceiptText, LogIn,
  CalendarClock, XCircle, Check, ExternalLink, Ban, Globe, Footprints, PhoneCall,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/primitives';
import { PaymentBadge } from './PaymentBadge';
import { fmtDate, fmtDateTime, fmtTime } from '@/lib/format';
import { cn } from '@/lib/utils';

const inr = (v) => `₹${(Math.round((v ?? 0) * 100) / 100).toLocaleString('en-IN')}`;
const digits = (s) => String(s || '').replace(/[^+\d]/g, '');

const SOURCE_META = {
  online: { label: 'Online booking', icon: Globe },
  walkin: { label: 'Walk-in', icon: Footprints },
  phone: { label: 'Phone', icon: PhoneCall },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle },
};

// The forward path an appointment moves along (negative ends handled separately).
const STEPS = [
  { key: 'booked', label: 'Booked' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'checked_in', label: 'Checked in' },
  { key: 'in_consultation', label: 'In consult' },
  { key: 'completed', label: 'Completed' },
];

function StatusTimeline({ status }) {
  if (status === 'cancelled' || status === 'no_show') {
    return (
      <div className={cn('flex items-center gap-2 rounded-xl border px-3.5 py-3 text-sm font-medium', status === 'cancelled' ? 'border-destructive/20 bg-destructive/5 text-destructive' : 'border-amber-200 bg-amber-50 text-amber-700')}>
        {status === 'cancelled' ? <XCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
        {status === 'cancelled' ? 'This appointment was cancelled.' : 'Marked as a no-show.'}
      </div>
    );
  }
  const currentIdx = STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        return (
          <div key={s.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold', done ? 'bg-primary text-primary-foreground' : current ? 'bg-primary/15 text-primary ring-2 ring-primary' : 'bg-muted text-muted-foreground')}>
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={cn('whitespace-nowrap text-[10.5px] font-medium', current ? 'text-foreground' : 'text-muted-foreground')}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <span className={cn('mx-1 h-0.5 flex-1 rounded-full', i < currentIdx ? 'bg-primary' : 'bg-muted')} />}
          </div>
        );
      })}
    </div>
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

/**
 * Appointment detail — everything in one place: patient contact (tap-to-call / WhatsApp),
 * doctor, timing + how it was booked, token, reason, the money picture, and the status
 * timeline. Front-desk actions (check-in / reschedule / cancel) are surfaced when relevant.
 */
export function AppointmentDetailDialog({ appointment: a, open, onOpenChange, canManage, onCheckIn, onReschedule, onCancel }) {
  if (!a) return null;
  const src = SOURCE_META[a.source] || { label: a.source || '—', icon: CalendarDays };
  const phone = digits(a.patientPhone);
  const b = a.billing;
  const active = ['booked', 'confirmed'].includes(a.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3 pr-6">
            <span className="truncate">{a.patientName || 'Appointment'}</span>
            <StatusBadge status={a.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* contact quick actions */}
          {a.patientPhone && (
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <a href={`tel:${phone}`}><Phone className="h-4 w-4" /> Call</a>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <a href={`https://wa.me/${phone.replace(/^\+/, '')}`} target="_blank" rel="noreferrer noopener"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              </Button>
            </div>
          )}

          {/* timeline */}
          <StatusTimeline status={a.status} />

          {/* details */}
          <div className="divide-y rounded-xl border px-3.5">
            <InfoRow icon={CalendarDays} label="Appointment">
              <span className="font-medium">{fmtDate(a.scheduledAt)}</span> · {fmtTime(a.scheduledAt)}
              {a.durationMinutes ? <span className="text-muted-foreground"> · {a.durationMinutes} min</span> : null}
            </InfoRow>
            <InfoRow icon={Clock} label="Doctor">{a.doctorName || '—'}</InfoRow>
            <InfoRow icon={src.icon} label="Booked via">
              {src.label}
              {a.createdAt ? <span className="text-muted-foreground"> · on {fmtDateTime(a.createdAt)}</span> : null}
            </InfoRow>
            {a.tokenNumber != null && (
              <InfoRow icon={Hash} label="Token"><span className="font-mono">#{a.tokenNumber}</span></InfoRow>
            )}
            {a.reason && <InfoRow icon={NotebookPen} label="Reason for visit">{a.reason}</InfoRow>}
          </div>

          {/* money */}
          {b && (
            <div className="rounded-xl border p-3.5">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><ReceiptText className="h-4 w-4 text-muted-foreground" /> Payment</p>
                <PaymentBadge billing={b} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/40 py-2">
                  <p className="text-[11px] text-muted-foreground">Fee</p>
                  <p className="text-sm font-semibold tabular">{inr(b.fee)}</p>
                </div>
                <div className="rounded-lg bg-muted/40 py-2">
                  <p className="text-[11px] text-muted-foreground">Paid</p>
                  <p className="text-sm font-semibold tabular text-success">{inr(b.paid)}</p>
                </div>
                <div className="rounded-lg bg-muted/40 py-2">
                  <p className="text-[11px] text-muted-foreground">Due</p>
                  <p className={cn('text-sm font-semibold tabular', b.due > 0 ? 'text-warning' : 'text-foreground')}>{inr(b.due)}</p>
                </div>
              </div>
              <div className="mt-3">
                {b.invoiceId ? (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={`/invoice/${b.invoiceId}`} target="_blank" rel="noreferrer noopener"><ExternalLink className="h-4 w-4" /> View invoice</a>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/dashboard/billing"><ReceiptText className="h-4 w-4" /> Go to billing</Link>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* actions */}
          {canManage && active && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="flex-1" onClick={() => onCheckIn?.(a)}><LogIn className="h-4 w-4" /> Check in</Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onReschedule?.(a)}><CalendarClock className="h-4 w-4" /> Reschedule</Button>
              <Button size="sm" variant="ghost" className="flex-1 text-destructive hover:text-destructive" onClick={() => onCancel?.(a)}><XCircle className="h-4 w-4" /> Cancel</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

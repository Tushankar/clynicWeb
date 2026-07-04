import { useRef, useState } from 'react';
import { ListChecks, Megaphone, Tv, Check, SkipForward, Clock3, Users, QrCode, Download } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { PageHeader, StatCard, EmptyState, LoadingSkeleton } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useRole } from '@/hooks/useRole';
import { useMe } from '@/hooks/useMe';
import { useFeature } from '@/hooks/usePlan';
import { usePrimaryBranch } from '@/hooks/useBranches';
import { useQueue, useCallNext, useCompleteEntry, useSkipEntry } from '@/hooks/useQueue';
import { toast, toastApiError } from '@/lib/toast';

export default function QueuePage() {
  const { clinicId } = useRole();
  const { branchId } = usePrimaryBranch();
  const slug = useMe().data?.clinic?.slug;
  const hasSelfCheckin = useFeature('SELF_CHECKIN');
  const [qrOpen, setQrOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useQueue(branchId, clinicId);

  const callNext = useCallNext();
  const complete = useCompleteEntry();
  const skip = useSkipEntry();

  const snap = data || { nowServing: [], waiting: [], counts: { waiting: 0, serving: 0 } };

  const doCall = async () => {
    try {
      await callNext.mutateAsync({ branchId });
      toast.success('Called next patient');
    } catch (err) {
      toastApiError(err);
    }
  };
  const wrap = (fn, ok) => async (id) => {
    try {
      await fn.mutateAsync(id);
      toast.success(ok);
    } catch (err) {
      toastApiError(err);
    }
  };
  const doComplete = wrap(complete, 'Marked complete');
  const doSkip = wrap(skip, 'Skipped');

  const openTv = () => slug && window.open(`/tv/${slug}`, '_blank', 'noopener');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live queue"
        description="Call patients in and keep the waiting-room TV in sync."
        actions={
          <>
            {hasSelfCheckin && (
              <Button variant="outline" onClick={() => setQrOpen(true)} disabled={!slug}>
                <QrCode className="h-4 w-4" /> Check-in QR
              </Button>
            )}
            <Button variant="outline" onClick={openTv} disabled={!slug}>
              <Tv className="h-4 w-4" /> Open TV display
            </Button>
            <Button onClick={doCall} disabled={callNext.isPending || (snap.waiting?.length || 0) === 0}>
              <Megaphone className="h-4 w-4" /> Call next
            </Button>
          </>
        }
      />

      {hasSelfCheckin && slug && <CheckinQrDialog open={qrOpen} onOpenChange={setQrOpen} slug={slug} />}

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <StatCard label="Waiting" value={snap.counts?.waiting ?? 0} icon={Users} loading={isLoading} />
        <StatCard label="In consultation" value={snap.counts?.serving ?? 0} icon={Clock3} loading={isLoading} />
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={5} />
      ) : isError ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-destructive">{error?.message || 'Could not load the queue.'}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Now serving */}
          <section>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">Now serving</h2>
            {snap.nowServing.length === 0 ? (
              <Card className="p-6 text-sm text-muted-foreground">No one is being seen right now.</Card>
            ) : (
              <div className="space-y-3">
                {snap.nowServing.map((e) => (
                  <Card key={e.id || e.token} className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-14 items-center justify-center rounded-lg bg-primary/10 text-xl font-semibold font-mono text-primary">
                        {e.token}
                      </span>
                      <div>
                        <div className="font-medium">{e.name}</div>
                        <div className="text-caption text-muted-foreground">{e.doctorName || '—'}</div>
                      </div>
                    </div>
                    {e.id && (
                      <Button size="sm" variant="outline" onClick={() => doComplete(e.id)}>
                        <Check className="h-4 w-4" /> Complete
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Waiting */}
          <section>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">Waiting ({snap.waiting.length})</h2>
            {snap.waiting.length === 0 ? (
              <div className="rounded-lg border border-dashed">
                <EmptyState icon={ListChecks} title="Queue is empty" description="Check patients in from Appointments to fill the queue." />
              </div>
            ) : (
              <ol className="space-y-2">
                {snap.waiting.map((e, i) => (
                  <li key={e.id} className="glass-card flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm text-muted-foreground tabular">{i + 1}</span>
                      <span className="flex h-9 w-12 items-center justify-center rounded-md bg-muted text-sm font-semibold font-mono">{e.token}</span>
                      <div>
                        <div className="text-sm font-medium">{e.name}</div>
                        <div className="text-caption text-muted-foreground">~{e.waitMinutes} min · {e.doctorName || '—'}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => doSkip(e.id)}>
                      <SkipForward className="h-4 w-4" /> Skip
                    </Button>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

/**
 * Self check-in QR (§5.24, Premium): print/stick this at the entrance — patients scan,
 * enter their phone, and join the live queue without touching the front desk.
 */
function CheckinQrDialog({ open, onOpenChange, slug }) {
  const url = `${window.location.origin}/c/${slug}/checkin`;
  const canvasWrapRef = useRef(null);

  const download = () => {
    const canvas = canvasWrapRef.current?.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `self-checkin-${slug}.png`;
    a.click();
    toast.success('QR poster downloaded — print it at any size');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Self check-in QR</DialogTitle>
          <DialogDescription>
            Stick this at the entrance. Patients scan it, enter their phone number, and join the live queue — no front-desk stop.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <span className="rounded-2xl border bg-white p-4">
            <QRCodeSVG value={url} size={192} />
          </span>
          <p className="break-all text-center font-mono text-[11px] text-muted-foreground">{url}</p>
          {/* Hi-res canvas twin used only for the PNG download. */}
          <div ref={canvasWrapRef} className="hidden" aria-hidden="true">
            <QRCodeCanvas value={url} size={1024} includeMargin />
          </div>
          <div className="flex w-full gap-2">
            <Button className="flex-1" onClick={download}>
              <Download className="h-4 w-4" /> Download PNG
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => window.open(url, '_blank', 'noopener')}>
              Open page
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

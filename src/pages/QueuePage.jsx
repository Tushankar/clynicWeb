import { ListChecks, Megaphone, Tv, Check, SkipForward, Clock3, Users } from 'lucide-react';
import { PageHeader, StatCard, EmptyState, LoadingSkeleton } from '@/components/primitives';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRole } from '@/hooks/useRole';
import { useMe } from '@/hooks/useMe';
import { usePrimaryBranch } from '@/hooks/useBranches';
import { useQueue, useCallNext, useCompleteEntry, useSkipEntry } from '@/hooks/useQueue';
import { toast, toastApiError } from '@/lib/toast';

export default function QueuePage() {
  const { clinicId } = useRole();
  const { branchId } = usePrimaryBranch();
  const slug = useMe().data?.clinic?.slug;
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
            <Button variant="outline" onClick={openTv} disabled={!slug}>
              <Tv className="h-4 w-4" /> Open TV display
            </Button>
            <Button onClick={doCall} disabled={callNext.isPending || (snap.waiting?.length || 0) === 0}>
              <Megaphone className="h-4 w-4" /> Call next
            </Button>
          </>
        }
      />

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
                      <span className="flex h-12 w-14 items-center justify-center rounded-lg bg-primary/10 text-xl font-semibold tabular text-primary">
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
                  <li key={e.id} className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm text-muted-foreground tabular">{i + 1}</span>
                      <span className="flex h-9 w-12 items-center justify-center rounded-md bg-muted text-sm font-semibold tabular">{e.token}</span>
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

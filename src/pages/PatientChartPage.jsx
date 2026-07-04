import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Printer, Trash2, Pill, FileText, FlaskConical, CalendarClock, Share2 } from 'lucide-react';
import { PageHeader, EmptyState, LoadingSkeleton } from '@/components/primitives';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FeatureGate } from '@/components/FeatureGate';
import { PrescriptionEditorDialog } from '@/components/chart/PrescriptionEditorDialog';
import { ReportsTab } from '@/components/chart/ReportsTab';
import { TimelineTab } from '@/components/chart/TimelineTab';
import { PatientFormDialog } from '@/components/patients/PatientFormDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { usePatientDetail } from '@/hooks/usePatients';
import { usePrescriptions, useDeletePrescription, useSharePrescription, useNotes, useCreateNote, useLabs, useCreateLab, useSetLabStatus } from '@/hooks/useClinical';
import { useGenerateVisitSummary, useAiDrafts, useApproveDraft, useRejectDraft } from '@/hooks/useAi';
import { useCreateRecall } from '@/hooks/useSchedule';
import { useSetStatus } from '@/hooks/useAppointments';
import { useFeature } from '@/hooks/usePlan';
import { Sparkles, Check, X, ShieldAlert, CalendarPlus, CheckCircle2 } from 'lucide-react';
import { useHasRole } from '@/hooks/useRole';
import { fmtDate, fmtDateTime, ageFromDob } from '@/lib/format';
import { toast, toastApiError } from '@/lib/toast';

const LAB_STATUS = ['requested', 'collected', 'completed', 'cancelled'];

export default function PatientChartPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = usePatientDetail(id);
  const patient = data?.patient;
  const visits = data?.visits || [];

  const isClinician = useHasRole('owner', 'doctor', 'receptionist');
  const hasRecalls = useFeature('RECALLS');
  const setStatus = useSetStatus();
  // The visit in progress right now (if any) — lets the doctor close it out from the chart instead
  // of walking back to the Live Queue.
  const activeVisit = visits.find((v) => v.status === 'in_consultation');

  const completeVisit = async () => {
    try {
      await setStatus.mutateAsync({ id: activeVisit._id, status: 'completed' });
      toast.success('Visit completed');
      refetch();
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={patient?.name || 'Patient'}
        description={patient ? `${patient.patientCode}${ageFromDob(patient.dob) != null ? ` · ${ageFromDob(patient.dob)}y` : ''} · ${patient.phone || 'no phone'}` : ''}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/dashboard/patients')}><ArrowLeft className="h-4 w-4" /> Patients</Button>
            {patient && activeVisit && (
              <Button onClick={completeVisit} disabled={setStatus.isPending}><CheckCircle2 className="h-4 w-4" /> Complete visit</Button>
            )}
            {patient && isClinician && hasRecalls && (
              <Button variant="outline" onClick={() => setFollowUpOpen(true)}><CalendarPlus className="h-4 w-4" /> Follow-up</Button>
            )}
            {patient && <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" /> Edit</Button>}
          </>
        }
      />

      {isLoading ? (
        <LoadingSkeleton lines={6} />
      ) : isError ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-destructive">{error?.message || 'Could not load patient.'}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
        </Card>
      ) : (
        patient && (
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="labs">Lab requests</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview"><OverviewTab patient={patient} visits={visits} /></TabsContent>
            <TabsContent value="timeline"><FeatureGate feature="PATIENT_TIMELINE"><TimelineTab patientId={id} /></FeatureGate></TabsContent>
            <TabsContent value="prescriptions"><FeatureGate feature="PRESCRIPTIONS"><PrescriptionsTab patientId={id} /></FeatureGate></TabsContent>
            <TabsContent value="notes"><FeatureGate feature="PRESCRIPTIONS"><NotesTab patientId={id} /></FeatureGate></TabsContent>
            <TabsContent value="labs"><FeatureGate feature="PRESCRIPTIONS"><LabsTab patientId={id} /></FeatureGate></TabsContent>
            <TabsContent value="reports"><FeatureGate feature="REPORT_UPLOADS"><ReportsTab patientId={id} /></FeatureGate></TabsContent>
          </Tabs>
        )
      )}

      <PatientFormDialog open={editOpen} onOpenChange={setEditOpen} patient={patient} />
      {patient && <FollowUpDialog open={followUpOpen} onOpenChange={setFollowUpOpen} patientId={id} patientName={patient.name} />}
    </div>
  );
}

const FOLLOWUP_INTERVALS = [
  { label: 'In 2 weeks', weeks: 2 },
  { label: 'In 1 month', weeks: 4 },
  { label: 'In 3 months', weeks: 13 },
  { label: 'In 6 months', weeks: 26 },
  { label: 'In 1 year', weeks: 52 },
];

/** Schedule a treatment recall (follow-up) straight from the chart — reachable by doctors, who
 * previously had no UI to set one. Rides the existing recall automation (reminder on due date). */
function FollowUpDialog({ open, onOpenChange, patientId, patientName }) {
  const create = useCreateRecall();
  const [label, setLabel] = useState('');
  const [weeks, setWeeks] = useState(13);

  useEffect(() => {
    if (open) { setLabel(''); setWeeks(13); }
  }, [open]);

  const submit = async () => {
    const dueDate = new Date(Date.now() + Number(weeks) * 7 * 86400000).toISOString();
    try {
      await create.mutateAsync({ patientId, label: label.trim() || 'Follow-up visit', dueDate });
      toast.success('Follow-up scheduled');
      onOpenChange(false);
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Schedule follow-up</DialogTitle>
          <DialogDescription>A reminder goes to {patientName || 'the patient'} on the due date so they book their return visit.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">What for?</span>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. 6-month cleaning, review results" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">When</span>
            <Select value={String(weeks)} onValueChange={(v) => setWeeks(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FOLLOWUP_INTERVALS.map((i) => <SelectItem key={i.weeks} value={String(i.weeks)}>{i.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={create.isPending}>{create.isPending ? 'Scheduling…' : 'Schedule'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OverviewTab({ patient, visits }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Medical details</h3>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Field label="Blood group" value={patient.bloodGroup} />
          <Field label="DOB" value={patient.dob ? fmtDate(patient.dob) : '—'} />
          <Field label="Gender" value={patient.gender} className="capitalize" />
          <Field label="Email" value={patient.email} />
        </dl>
        {patient.allergies?.length > 0 && <Chips label="Allergies" items={patient.allergies} tone="destructive" />}
        {patient.currentMedications?.length > 0 && <Chips label="Current meds" items={patient.currentMedications} />}
        {patient.medicalHistory && (
          <div className="mt-3">
            <div className="text-caption text-muted-foreground">Medical history</div>
            <p className="whitespace-pre-wrap text-sm">{patient.medicalHistory}</p>
          </div>
        )}
        {patient.notes && (
          <div className="mt-3 rounded-md bg-muted/50 p-2 text-sm"><span className="text-muted-foreground">Notes: </span>{patient.notes}</div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Visit history</h3>
        {visits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No visits yet.</p>
        ) : (
          <ul className="space-y-2">
            {visits.slice(0, 12).map((v) => (
              <li key={v._id} className="flex items-center justify-between gap-2 text-sm">
                <span>{fmtDateTime(v.scheduledAt)} · {v.doctorName || '—'}</span>
                <span className="text-muted-foreground">{v.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function PrescriptionsTab({ patientId }) {
  const canManage = useHasRole('owner', 'doctor');
  const hasDocSharing = useFeature('DOCUMENT_SHARING');
  const { data, isLoading, isError, error, refetch } = usePrescriptions(patientId);
  const del = useDeletePrescription();
  const shareRx = useSharePrescription();
  const [open, setOpen] = useState(false);
  const items = data?.items || [];

  const remove = async (rx) => {
    try { await del.mutateAsync(rx._id); toast.success('Prescription deleted'); } catch (e) { toastApiError(e); }
  };
  const share = async (rx) => {
    try {
      const res = await shareRx.mutateAsync(rx._id);
      try { await navigator.clipboard.writeText(res.url); } catch { /* clipboard unavailable */ }
      toast.success(res.sent.length ? `Prescription sent via ${res.sent.join(' + ')}` : 'Share link copied — no reachable channel on file');
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canManage && <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New prescription</Button>}
      </div>
      {isLoading ? <LoadingSkeleton lines={4} /> : isError ? <ErrorBox error={error} onRetry={refetch} /> : items.length === 0 ? (
        <Empty icon={Pill} title="No prescriptions" />
      ) : (
        items.map((rx) => (
          <Card key={rx._id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{fmtDateTime(rx.createdAt)} {rx.diagnosis ? `· ${rx.diagnosis}` : ''}</div>
                <div className="text-caption text-muted-foreground">{rx.doctorName}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => window.open(`/rx/${rx._id}`, '_blank', 'noopener')}><Printer className="h-4 w-4" /> Print</Button>
                {hasDocSharing && (
                  <Button variant="ghost" size="sm" onClick={() => share(rx)} disabled={shareRx.isPending}>
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                )}
                {canManage && <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => remove(rx)}><Trash2 className="h-4 w-4" /></Button>}
              </div>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {rx.items.map((it, i) => (
                <li key={i} className="flex flex-wrap gap-x-2 text-muted-foreground">
                  <span className="font-medium text-foreground">{it.drug}</span>
                  {it.dose && <span>· {it.dose}</span>}{it.frequency && <span>· {it.frequency}</span>}{it.duration && <span>· {it.duration}</span>}
                </li>
              ))}
            </ul>
          </Card>
        ))
      )}
      <PrescriptionEditorDialog open={open} onOpenChange={setOpen} patientId={patientId} />
    </div>
  );
}

const DRAFT_KIND_LABEL = {
  visit_summary: 'Visit summary',
  symptom_intake: 'Symptom intake',
  clinical_note: 'Clinical note',
};

/**
 * A pending AI draft, shown inline in the patient chart so the doctor can review, edit,
 * and approve it right where it belongs (hard rule 2: nothing enters the record until a
 * doctor approves — approval creates the real clinical note and this card disappears).
 */
function AiDraftCard({ draft }) {
  const approve = useApproveDraft();
  const reject = useRejectDraft();
  const [text, setText] = useState(draft.content || '');

  const doApprove = async () => {
    if (!text.trim()) return;
    try {
      await approve.mutateAsync({ id: draft._id, editedContent: text });
      toast.success('Approved — saved to clinical notes');
    } catch (e) {
      toastApiError(e);
    }
  };
  const doReject = async () => {
    try {
      await reject.mutateAsync(draft._id);
      toast.success('Draft discarded');
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Card className="border-violet-300/50 bg-violet-50/40 p-4 dark:bg-violet-500/5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-foreground">AI draft · {DRAFT_KIND_LABEL[draft.kind] || 'Draft'}</span>
        <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-violet-600">Needs review</span>
        {draft.flagged && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700">
            <ShieldAlert className="h-3 w-3" /> Flagged
          </span>
        )}
      </div>

      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="mt-3 bg-background" />

      {draft.disclaimer && <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{draft.disclaimer}</p>}

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={doReject} disabled={reject.isPending || approve.isPending}>
          <X className="h-4 w-4" /> Discard
        </Button>
        <Button size="sm" onClick={doApprove} disabled={!text.trim() || approve.isPending || reject.isPending}>
          <Check className="h-4 w-4" /> {approve.isPending ? 'Approving…' : 'Approve & save'}
        </Button>
      </div>
    </Card>
  );
}

function NotesTab({ patientId }) {
  const canManage = useHasRole('owner', 'doctor');
  const hasAi = useFeature('AI_FEATURES');
  const { data, isLoading, isError, error, refetch } = useNotes(patientId);
  const create = useCreateNote();
  const genSummary = useGenerateVisitSummary();
  // Pending AI drafts for THIS patient — surfaced inline (doctor/owner only, AI plans only).
  // The request is already patient-scoped; the extra filter guarantees another patient's
  // draft can never render here (e.g. from a stale cache while switching patients).
  const draftsQ = useAiDrafts('pending_review', patientId, { enabled: hasAi && canManage && !!patientId });
  const drafts = (draftsQ.data?.items || []).filter((d) => String(d.patientId) === String(patientId));
  const [content, setContent] = useState('');
  const items = data?.items || [];

  const add = async () => {
    if (!content.trim()) return;
    try { await create.mutateAsync({ patientId, content }); setContent(''); toast.success('Note added'); } catch (e) { toastApiError(e); }
  };

  const draftSummary = async () => {
    try {
      await genSummary.mutateAsync({ patientId });
      toast.success('AI draft created below — review, edit, and approve it');
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <div className="space-y-3">
      {canManage && (
        <Card className="p-4">
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a clinical note…" />
          <div className="mt-2 flex justify-end gap-2">
            {hasAi && (
              <Button variant="outline" size="sm" onClick={draftSummary} disabled={genSummary.isPending} title="Generate an AI visit-summary draft for your review">
                <Sparkles className="h-4 w-4" /> {genSummary.isPending ? 'Drafting…' : 'AI draft summary'}
              </Button>
            )}
            <Button size="sm" onClick={add} disabled={!content.trim() || create.isPending}>Add note</Button>
          </div>
        </Card>
      )}

      {/* Pending AI drafts — review before they enter the record (rule 2). */}
      {drafts.map((d) => <AiDraftCard key={d._id} draft={d} />)}

      {isLoading ? <LoadingSkeleton lines={3} /> : isError ? <ErrorBox error={error} onRetry={refetch} /> : items.length === 0 ? (
        drafts.length === 0 ? <Empty icon={FileText} title="No clinical notes" /> : null
      ) : (
        items.map((n) => (
          <Card key={n._id} className="p-4">
            <div className="text-caption text-muted-foreground">{fmtDateTime(n.createdAt)} {n.doctorName ? `· ${n.doctorName}` : ''}</div>
            <p className="mt-1 whitespace-pre-wrap text-sm">{n.content}</p>
          </Card>
        ))
      )}
    </div>
  );
}

function LabsTab({ patientId }) {
  const canManage = useHasRole('owner', 'doctor');
  const { data, isLoading, isError, error, refetch } = useLabs(patientId);
  const create = useCreateLab();
  const setStatus = useSetLabStatus();
  const [tests, setTests] = useState('');
  const items = data?.items || [];

  const add = async () => {
    const arr = tests.split(',').map((t) => t.trim()).filter(Boolean);
    if (!arr.length) return;
    try { await create.mutateAsync({ patientId, tests: arr }); setTests(''); toast.success('Lab request raised'); } catch (e) { toastApiError(e); }
  };

  return (
    <div className="space-y-3">
      {canManage && (
        <Card className="p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={tests} onChange={(e) => setTests(e.target.value)} placeholder="Tests, comma-separated (CBC, X-ray chest…)" />
            <Button onClick={add} disabled={!tests.trim() || create.isPending}>Raise request</Button>
          </div>
        </Card>
      )}
      {isLoading ? <LoadingSkeleton lines={3} /> : isError ? <ErrorBox error={error} onRetry={refetch} /> : items.length === 0 ? (
        <Empty icon={FlaskConical} title="No lab requests" />
      ) : (
        items.map((lab) => (
          <Card key={lab._id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <div className="text-sm font-medium">{lab.tests.join(', ')}</div>
              <div className="text-caption text-muted-foreground">{fmtDateTime(lab.createdAt)}</div>
            </div>
            {canManage ? (
              <Select value={lab.status} onValueChange={(v) => setStatus.mutate({ id: lab._id, status: v })}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>{LAB_STATUS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <span className="text-sm capitalize text-muted-foreground">{lab.status}</span>
            )}
          </Card>
        ))
      )}
    </div>
  );
}

// ---- small helpers ----
function Field({ label, value, className }) {
  return (
    <div>
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className={`font-medium ${className || ''}`}>{value || '—'}</dd>
    </div>
  );
}
function Chips({ label, items, tone }) {
  return (
    <div className="mt-3">
      <div className="text-caption text-muted-foreground">{label}</div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span key={i} className={`rounded-full px-2 py-0.5 text-xs ${tone === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'}`}>{it}</span>
        ))}
      </div>
    </div>
  );
}
function Empty({ icon, title }) {
  return <div className="rounded-lg border border-dashed"><EmptyState icon={icon} title={title} description="Nothing here yet." /></div>;
}
function ErrorBox({ error, onRetry }) {
  return (
    <Card className="p-6 text-center">
      <p className="text-sm text-destructive">{error?.message || 'Could not load.'}</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>Retry</Button>
    </Card>
  );
}

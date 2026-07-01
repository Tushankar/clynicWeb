import { useState } from 'react';
import { Sparkles, Search, MessageCircleQuestion, ClipboardCheck, Check, X, AlertTriangle } from 'lucide-react';
import { PageHeader, EmptyState, LoadingSkeleton } from '@/components/primitives';
import { FeatureGate } from '@/components/FeatureGate';
import { AiDisclaimer } from '@/components/ai/AiDisclaimer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useHasRole } from '@/hooks/useRole';
import { useAiDrafts, useAiFaq, useAiSearch, useApproveDraft, useRejectDraft } from '@/hooks/useAi';
import { toast, toastApiError } from '@/lib/toast';

export default function AiPage() {
  return (
    <FeatureGate feature="AI_FEATURES">
      <AiInner />
    </FeatureGate>
  );
}

function AiInner() {
  const canReview = useHasRole('owner', 'doctor');
  return (
    <div className="space-y-6">
      <PageHeader title="AI assistant" description="Collects symptoms, answers FAQs, drafts summaries for your review, and powers smart search." />
      <AiDisclaimer />
      <Tabs defaultValue={canReview ? 'review' : 'search'}>
        <TabsList>
          {canReview && <TabsTrigger value="review"><ClipboardCheck className="mr-1.5 h-4 w-4" /> Review drafts</TabsTrigger>}
          <TabsTrigger value="search"><Search className="mr-1.5 h-4 w-4" /> Smart search</TabsTrigger>
          <TabsTrigger value="faq"><MessageCircleQuestion className="mr-1.5 h-4 w-4" /> Ask</TabsTrigger>
        </TabsList>
        {canReview && <TabsContent value="review"><ReviewDrafts /></TabsContent>}
        <TabsContent value="search"><SmartSearch /></TabsContent>
        <TabsContent value="faq"><AskFaq /></TabsContent>
      </Tabs>
    </div>
  );
}

// ---- Doctor approval queue (rule 2: clinical AI needs explicit approval) ----
function ReviewDrafts() {
  const { data, isLoading, isError, error, refetch } = useAiDrafts('pending_review');
  const drafts = data?.items || [];
  if (isLoading) return <LoadingSkeleton lines={6} />;
  if (isError) return <ErrorCard message={error?.message} onRetry={refetch} />;
  if (!drafts.length) return <EmptyState icon={ClipboardCheck} title="Nothing to review" description="AI symptom intakes and visit-summary drafts awaiting approval appear here." />;
  return <div className="space-y-4">{drafts.map((d) => <DraftCard key={d._id} draft={d} />)}</div>;
}

const KIND_LABEL = { symptom_intake: 'Symptom intake', visit_summary: 'Visit summary', clinical_note: 'Clinical note' };

function DraftCard({ draft }) {
  const [text, setText] = useState(draft.content);
  const approve = useApproveDraft();
  const reject = useRejectDraft();

  const doApprove = async () => {
    try {
      await approve.mutateAsync({ id: draft._id, editedContent: text });
      toast.success('Approved — saved to the patient record by you');
    } catch (e) {
      toastApiError(e);
    }
  };
  const doReject = async () => {
    try {
      await reject.mutateAsync(draft._id);
      toast.success('Draft rejected — nothing saved');
    } catch (e) {
      toastApiError(e);
    }
  };

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{KIND_LABEL[draft.kind] || draft.kind}</Badge>
        {draft.flagged && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Flagged for review</Badge>}
        <span className="ml-auto text-xs text-muted-foreground">{draft.model}</span>
      </div>
      <AiDisclaimer text={draft.disclaimer} />
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="font-mono text-xs" />
      <p className="text-xs text-muted-foreground">You are the author of what you approve. Edit freely before saving; rejecting saves nothing.</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={doReject} disabled={reject.isPending}><X className="h-4 w-4" /> Reject</Button>
        <Button onClick={doApprove} disabled={approve.isPending}><Check className="h-4 w-4" /> Approve &amp; save</Button>
      </div>
    </Card>
  );
}

// ---- Semantic search (retrieval only) ----
function SmartSearch() {
  const [q, setQ] = useState('');
  const search = useAiSearch();
  const results = search.data?.results || [];
  const run = (e) => {
    e.preventDefault();
    if (q.trim()) search.mutate(q.trim());
  };
  return (
    <div className="space-y-4">
      <form onSubmit={run} className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search records by symptom, condition, drug, name…" />
        <Button type="submit" disabled={search.isPending}><Search className="h-4 w-4" /> Search</Button>
      </form>
      {search.isPending && <LoadingSkeleton lines={4} />}
      {search.isSuccess && !results.length && <EmptyState icon={Search} title="No matches" description="Try a different term — a symptom, condition, medicine, or patient name." />}
      <div className="space-y-2">
        {results.map((r) => (
          <Card key={`${r.type}-${r.id}`} className="flex items-center gap-3 p-3 text-sm">
            <Badge variant="secondary" className="capitalize">{r.type}</Badge>
            <span className="font-medium">{r.label}</span>
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{r.snippet}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---- FAQ (logistics only) ----
function AskFaq() {
  const [q, setQ] = useState('');
  const faq = useAiFaq();
  const run = (e) => {
    e.preventDefault();
    if (q.trim()) faq.mutate(q.trim());
  };
  return (
    <div className="space-y-4">
      <form onSubmit={run} className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. What are the consultation fees? Where are you located?" />
        <Button type="submit" disabled={faq.isPending}>Ask</Button>
      </form>
      {faq.isPending && <LoadingSkeleton lines={2} />}
      {faq.isError && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{faq.error?.message || 'Could not get an answer. Try again.'}</p>}
      {faq.data && (
        <Card className="space-y-3 p-4">
          <p className="whitespace-pre-wrap text-sm">{faq.data.answer}</p>
          <AiDisclaimer text={faq.data.disclaimer} />
        </Card>
      )}
      <p className="text-xs text-muted-foreground">This is the same assistant patients can use on your booking page — it only shares clinic information and never gives medical advice.</p>
    </div>
  );
}

function ErrorCard({ message, onRetry }) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">{message || 'Something went wrong.'}</p>
      <Button variant="outline" className="mt-3" onClick={onRetry}>Retry</Button>
    </Card>
  );
}

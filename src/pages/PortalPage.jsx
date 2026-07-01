import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Stethoscope, LogOut, CalendarDays, Pill, Receipt, FileText, ListChecks, Upload, Eye, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { fmtDateTime, fmtDate } from '@/lib/format';
import { portalFetch, portalUpload, getPortalToken, setPortalToken, API_URL } from '@/lib/portalApi';
import { collectPayment } from '@/lib/payments/razorpayCheckout';

/** Patient PWA portal (mobile-first, email-OTP session). Public route /portal/:slug. */
export default function PortalPage() {
  const { slug } = useParams();
  const [token, setToken] = useState(getPortalToken());
  return (
    <div className="min-h-screen bg-muted/40 px-4 py-6">
      <div className="mx-auto w-full max-w-md">
        {token ? <PortalHome slug={slug} onLogout={() => { setPortalToken(null); setToken(null); }} /> : <PortalLogin slug={slug} onLoggedIn={(t) => { setPortalToken(t); setToken(t); }} />}
      </div>
    </div>
  );
}

function PortalLogin({ slug, onLoggedIn }) {
  const [stage, setStage] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const request = async () => {
    setErr(null); setBusy(true);
    try {
      const res = await portalFetch(`/api/portal/c/${slug}/login/request`, { method: 'POST', body: { email }, auth: false });
      setDevCode(res.devCode || null);
      setStage('code');
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const verify = async () => {
    setErr(null); setBusy(true);
    try {
      const res = await portalFetch(`/api/portal/c/${slug}/login/verify`, { method: 'POST', body: { email, code }, auth: false });
      onLoggedIn(res.token);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-2 text-lg font-semibold"><Stethoscope className="h-6 w-6 text-primary" /> Patient portal</header>
      <Card>
        <CardContent className="space-y-4 py-6">
          {err && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
          {stage === 'email' ? (
            <>
              <p className="text-sm text-muted-foreground">Sign in with the email on your clinic record.</p>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
              <Button className="w-full" onClick={request} disabled={!email || busy}>{busy ? 'Sending…' : 'Send code'}</Button>
            </>
          ) : (
            <>
              {devCode && <p className="text-caption text-muted-foreground">Dev code: <span className="font-mono font-medium">{devCode}</span></p>}
              <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" placeholder="6-digit code" />
              <Button className="w-full" onClick={verify} disabled={!code || busy}>{busy ? 'Verifying…' : 'Sign in'}</Button>
            </>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-caption text-muted-foreground">Need to book? Visit /c/{slug}</p>
    </div>
  );
}

function usePortal(path) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const reload = () => {
    setState((s) => ({ ...s, loading: true }));
    portalFetch(path).then((data) => setState({ loading: false, error: null, data })).catch((e) => setState({ loading: false, error: e.message, data: null }));
  };
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [path]);
  return { ...state, reload };
}

function PortalHome({ slug, onLogout }) {
  const me = usePortal('/api/portal/me');
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold"><Stethoscope className="h-5 w-5 text-primary" /> {me.data?.name || 'My health'}</div>
        <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="h-4 w-4" /> Sign out</Button>
      </header>

      <Tabs defaultValue="visits">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="rx">Prescriptions</TabsTrigger>
          <TabsTrigger value="bills">Invoices</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
        </TabsList>
        <TabsContent value="visits"><VisitsTab /></TabsContent>
        <TabsContent value="rx"><RxTab /></TabsContent>
        <TabsContent value="bills"><InvoicesTab /></TabsContent>
        <TabsContent value="reports"><ReportsTab /></TabsContent>
        <TabsContent value="queue"><QueueTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function List({ q, render, empty }) {
  if (q.loading) return <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>;
  if (q.error) return <p className="py-6 text-center text-sm text-destructive">{q.error}</p>;
  const items = q.data?.items || [];
  if (items.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  return <div className="space-y-2">{items.map(render)}</div>;
}

function VisitsTab() {
  const q = usePortal('/api/portal/appointments');
  return <List q={q} empty="No visits yet." render={(a) => (
    <Card key={a._id} className="flex items-center gap-3 p-3"><CalendarDays className="h-4 w-4 text-muted-foreground" />
      <div className="text-sm"><div className="font-medium">{fmtDateTime(a.scheduledAt)}</div><div className="text-caption text-muted-foreground">{a.doctorName} · {a.status}{a.prepaid ? ' · paid' : ''}</div></div>
    </Card>
  )} />;
}

function RxTab() {
  const q = usePortal('/api/portal/prescriptions');
  return <List q={q} empty="No prescriptions yet." render={(rx) => (
    <Card key={rx._id} className="p-3">
      <div className="flex items-center gap-2 text-sm font-medium"><Pill className="h-4 w-4 text-primary" /> {fmtDate(rx.createdAt)} · {rx.doctorName}</div>
      <ul className="mt-1 pl-6 text-sm text-muted-foreground">{rx.items.map((it, i) => <li key={i}>{it.drug} {it.dose} {it.frequency} {it.duration}</li>)}</ul>
    </Card>
  )} />;
}

function InvoicesTab() {
  const q = usePortal('/api/portal/invoices');
  const [paying, setPaying] = useState(null);
  const pay = async (inv) => {
    setPaying(inv._id);
    try {
      const order = await portalFetch(`/api/portal/invoices/${inv._id}/pay-order`, { method: 'POST' });
      const proof = await collectPayment(order, {
        name: 'Invoice payment',
        mockSign: (orderId) => portalFetch('/api/portal/payments/mock-sign', { method: 'POST', body: { orderId } }),
      });
      await portalFetch('/api/portal/payments/verify', { method: 'POST', body: proof });
      q.reload();
    } catch (e) {
      alert(e.message); // eslint-disable-line no-alert
    } finally {
      setPaying(null);
    }
  };
  return <List q={q} empty="No invoices yet." render={(inv) => (
    <Card key={inv._id} className="p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2"><Receipt className="h-4 w-4 text-muted-foreground" /> {inv.invoiceNumber}</span>
        <span className="font-medium tabular">₹{inv.total}</span>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-caption capitalize text-muted-foreground">{inv.status.replace('_', ' ')} · paid ₹{inv.amountPaid}</span>
        {inv.amountPaid < inv.total && (
          <Button size="sm" onClick={() => pay(inv)} disabled={paying === inv._id}><CreditCard className="h-4 w-4" /> {paying === inv._id ? 'Paying…' : 'Pay'}</Button>
        )}
      </div>
    </Card>
  )} />;
}

function ReportsTab() {
  const q = usePortal('/api/portal/reports');
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const view = async (id) => {
    try { const { path } = await portalFetch(`/api/portal/reports/${id}/signed-url`); window.open(`${API_URL}${path}`, '_blank', 'noopener'); }
    catch (e) { alert(e.message); } // eslint-disable-line no-alert
  };
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { const fd = new FormData(); fd.append('file', file); fd.append('type', 'other'); await portalUpload('/api/portal/reports', fd); if (fileRef.current) fileRef.current.value = ''; q.reload(); }
    catch (err) { alert(err.message); } // eslint-disable-line no-alert
    finally { setBusy(false); }
  };
  return (
    <div className="space-y-3">
      <Card className="p-3">
        <label className="flex items-center gap-2 text-sm font-medium"><Upload className="h-4 w-4" /> Upload a report</label>
        <input ref={fileRef} type="file" accept=".pdf,image/*" onChange={upload} disabled={busy} className="mt-2 block w-full text-sm" />
      </Card>
      <List q={q} empty="No reports yet." render={(r) => (
        <Card key={r._id} className="flex items-center justify-between p-3 text-sm">
          <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> {r.title || r.originalName}</span>
          <Button variant="ghost" size="sm" onClick={() => view(r._id)}><Eye className="h-4 w-4" /> View</Button>
        </Card>
      )} />
    </div>
  );
}

function QueueTab() {
  const q = usePortal('/api/portal/queue');
  const snap = q.data || { nowServing: [], waiting: [] };
  if (q.loading) return <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>;
  return (
    <div className="space-y-3">
      <Card className="p-4 text-center">
        <div className="text-caption uppercase tracking-wide text-muted-foreground">Now serving</div>
        <div className="text-4xl font-bold tabular text-primary">{snap.nowServing?.[0]?.token ?? '—'}</div>
      </Card>
      <Card className="p-3">
        <div className="mb-1 flex items-center gap-2 text-sm font-medium"><ListChecks className="h-4 w-4" /> Waiting ({snap.waiting?.length || 0})</div>
        {(snap.waiting || []).slice(0, 8).map((w) => <div key={w.id} className="flex justify-between py-1 text-sm"><span className="tabular">{w.token}</span><span className="text-muted-foreground">~{w.waitMinutes}m</span></div>)}
      </Card>
    </div>
  );
}

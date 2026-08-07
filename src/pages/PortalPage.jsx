import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  LogOut, CalendarDays, Pill, Receipt, FileText, ListChecks, Upload, User,
  Activity, Bell, CheckCircle2, ChevronRight, CreditCard, Sparkles, TrendingUp, HeartHandshake, ShieldAlert, Info
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { fmtDateTime, fmtDate, inr } from '@/lib/format';
import { portalFetch, portalUpload, getPortalToken, setPortalToken, API_URL } from '@/lib/portalApi';
import { collectPayment } from '@/lib/payments/razorpayCheckout';
import { useSite } from '@/hooks/useSite';
import { deriveModel } from '@/components/site/templates/premium-signature/lib';
import Navbar from '@/components/site/templates/premium-signature/sections/Navbar';
import Footer from '@/components/site/templates/premium-signature/sections/Footer';
import { PmxStyles } from '@/components/site/templates/premium-signature/styles';

export default function PortalPage() {
  const { slug } = useParams();
  const [token, setToken] = useState(getPortalToken());
  const { data } = useSite(slug);
  const site = data?.available ? data.site : null;
  const m = useMemo(() => site ? deriveModel(site, slug) : null, [site, slug]);

  if (token) {
    return (
      <div className="pmx min-h-screen overflow-x-clip bg-[#F8FAFB] text-[#0B1220] antialiased">
        <PmxStyles />
        <PortalHome slug={slug} onLogout={() => { setPortalToken(null); setToken(null); }} />
      </div>
    );
  }

  return (
    <div className="pmx min-h-screen overflow-x-clip bg-white text-[#0B1220] antialiased">
      <PmxStyles />
      {m && <Navbar m={m} solid={true} basePath={`/c/${slug}`} />}
      <PortalLogin slug={slug} m={m} onLoggedIn={(t) => { setPortalToken(t); setToken(t); }} />
      {m && <Footer m={m} />}
    </div>
  );
}

/* ─────────────────────────  LOGIN SCREEN  ───────────────────────── */

function PortalLogin({ slug, m, onLoggedIn }) {
  // The portal belongs to the CLINIC, not to Clynic the platform — show its logo and name.
  const clinicName = m?.name || 'Your clinic';
  const clinicLogo = m?.theme?.logoUrl || '';
  const tagline = m?.hero?.tagline || 'Personalized care, advanced medicine';

  const [stage, setStage] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState(null);
  // Shared-contact disambiguation (stage 'who').
  const [candidates, setCandidates] = useState([]);
  const [selectionToken, setSelectionToken] = useState(null);
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
      // A shared household phone/email can map to several people. Rather than guess (which used to
      // land the wrong person in someone else's chart), the server asks which one is signing in.
      if (res.needsSelection) {
        setCandidates(res.candidates || []);
        setSelectionToken(res.selectionToken);
        setStage('who');
        return;
      }
      onLoggedIn(res.token);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const choose = async (patientId) => {
    setErr(null); setBusy(true);
    try {
      const res = await portalFetch(`/api/portal/c/${slug}/login/select`, { method: 'POST', body: { selectionToken, patientId }, auth: false });
      onLoggedIn(res.token);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen w-full relative select-none font-sans overflow-hidden">
      {/* ──── FULL-PAGE BACKGROUND IMAGE ──── */}
      <img
        src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1920&q=80"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay for text visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/30 to-slate-900/10 z-[1]" />

      {/* ──── CONTENT LAYER (sits on top of the image) ──── */}
      <div className="relative z-10 min-h-screen w-full flex items-center justify-between px-8 md:px-16 lg:px-24 pt-24 md:pt-28 pb-12">
        {/* LEFT SIDE — Brand text overlaid on the image */}
        <div className="hidden md:flex flex-col justify-between h-full max-w-md py-4">
          {/* Brand — the clinic's own logo when it has one, else its name in the brand lockup */}
          <div className="flex items-center gap-3 mb-auto">
            {clinicLogo ? (
              <img src={clinicLogo} alt={`${clinicName} logo`} className="h-11 w-auto max-w-[200px] object-contain brightness-0 invert drop-shadow-md" />
            ) : (
              <>
                <Logo mark className="h-11 w-11 shrink-0 drop-shadow-md" alt="" />
                <div className="min-w-0">
                  <div className="text-[22px] font-black tracking-tight text-white leading-tight drop-shadow-md line-clamp-2">{clinicName}</div>
                  <div className="text-[10px] font-bold tracking-[.18em] text-[#7BDED0] uppercase mt-0.5 line-clamp-1">{tagline}</div>
                </div>
              </>
            )}
          </div>

          {/* Hero text */}
          <div className="mt-auto">
            <h1 className="text-[36px] font-extrabold leading-[1.12] tracking-tight text-white drop-shadow-lg">
              Your Journey to Wellness<br />Begins Here.
            </h1>
            <p className="mt-4 text-[15px] font-medium leading-relaxed text-white/80 max-w-sm">
              Securely access your health records, book appointments, and connect with your care team at {clinicName}.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE — Floating glassmorphic card on top of the image */}
        <div className="w-full md:w-auto md:ml-auto">
          <div className="w-full max-w-[420px] mx-auto md:mx-0 bg-white/40 backdrop-blur-xl rounded-[28px] border border-white/50 shadow-[0_20px_60px_-12px_rgba(14,140,114,0.15),inset_0_1px_0_0_rgba(255,255,255,0.7)] p-8 sm:p-10 flex flex-col gap-5">
            {/* Mobile-only brand header */}
            <div className="flex items-center gap-2 justify-center mb-1 md:hidden">
              <svg className="h-8 w-8 shrink-0" viewBox="0 0 100 100" fill="none">
                <path d="M40 10h20v35h35v20H60v35H40V65H5V45h35V10z" fill="#1B6DB5" />
                <path d="M47 18v30H17v4h30v30h6V52h30v-4H53V18h-6z" fill="#0BB89F" />
              </svg>
              <span className="text-[16px] font-black text-[#0F2E4A]">CLYNIC</span>
            </div>

            {/* Title */}
            <div className="text-center space-y-1.5">
              <h2 className="text-[22px] font-extrabold text-[#1A1A2E] tracking-tight">Sign In to Your Account</h2>
              <p className="text-[12.5px] text-slate-600 font-semibold leading-snug">
                Access your Clynic profile and manage<br className="hidden sm:block" /> your care.
              </p>
            </div>

            {err && (
              <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-bold text-red-500 text-center backdrop-blur-sm">{err}</p>
            )}

            {stage === 'who' ? (
              /* Shared phone/email: several people are registered on this contact. Ask which one
                 is signing in rather than guessing — guessing put a family member in the wrong
                 person's medical record. */
              <div className="space-y-3">
                <p className="text-[13px] font-semibold text-slate-700">
                  This contact is registered for more than one person. Who is signing in?
                </p>
                <div className="space-y-2">
                  {candidates.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => choose(c.id)}
                      disabled={busy}
                      className="w-full h-[46px] px-4 flex items-center justify-between bg-white/60 border border-white/60 rounded-xl text-[13px] font-semibold text-slate-700 hover:border-[#0E8C72] hover:bg-white/80 transition disabled:opacity-50"
                    >
                      <span>{c.name}</span>
                      <span className="text-[#0E8C72]">Continue</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => { setStage('email'); setCode(''); setCandidates([]); setSelectionToken(null); }}
                  className="text-[12px] font-bold text-slate-500 hover:underline"
                >
                  Use a different email or number
                </button>
              </div>
            ) : (
              <>
            {/* Email field */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input
                type="text"
                value={email}
                disabled={stage === 'code'}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or Patient ID"
                className="w-full h-[46px] pl-11 pr-4 bg-white/60 border border-white/60 rounded-xl text-[13px] font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0E8C72] focus:ring-1 focus:ring-[#0E8C72]/30 focus:bg-white/80 transition disabled:bg-white/30 disabled:text-slate-400"
              />
            </div>

            {/* OTP code — only once a code has been sent.
                A Password field and a "Forgot Password?" link used to sit here. Neither did
                anything: this portal authenticates by one-time code, and `password` was never sent
                anywhere. They invited patients to type a password that would be ignored, and to
                click a recovery link that led nowhere. */}
            {stage === 'code' && (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  onKeyDown={(e) => { if (e.key === 'Enter' && code && !busy) verify(); }}
                  className="w-full h-[46px] pl-11 pr-20 bg-white/60 border border-white/60 rounded-xl text-[13px] font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0E8C72] focus:ring-1 focus:ring-[#0E8C72]/30 focus:bg-white/80 transition"
                />
                <button type="button" onClick={request} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0E8C72] text-[12px] font-bold hover:underline">Resend</button>
              </div>
            )}

            {/* Dev code */}
            {stage === 'code' && devCode && (
              <div className="rounded-lg bg-teal-50 border border-teal-200 px-4 py-2 text-[11px] font-bold text-[#0E8C72] flex items-center justify-between">
                <span>Dev Code:</span>
                <span className="font-mono text-sm tracking-widest">{devCode}</span>
              </div>
            )}

            {/* Sign In */}
            <button
              onClick={stage === 'email' ? request : verify}
              disabled={(stage === 'email' ? !email : !code) || busy}
              className="group/btn relative w-full h-[46px] text-white rounded-full text-[14px] font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer overflow-hidden shadow-[0_6px_16px_-4px_rgba(14,140,114,0.45)] hover:shadow-[0_10px_24px_-6px_rgba(14,140,114,0.55)] bg-[#0E8C72] hover:bg-[#074C3D]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full" />
              <span className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] rounded-full pointer-events-none" />
              <span className="relative z-10">{busy ? 'Processing…' : 'Sign In'}</span>
            </button>

            {/* A "Remember Me" checkbox used to sit here. It was never read — the session token is
                always persisted — so unchecking it changed nothing. Removed rather than lie. */}
              </>
            )}

            {/* Footer */}
            <p className="text-center text-[12.5px] font-semibold text-slate-600">
              New to Clynic? <a href={`/c/${slug}`} className="text-[#0E8C72] font-bold hover:underline">Book your Appointment</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────  PORTAL HOME  ───────────────────────── */

function usePortal(path) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const reload = () => {
    setState((s) => ({ ...s, loading: true }));
    portalFetch(path).then((data) => setState({ loading: false, error: null, data })).catch((e) => setState({ loading: false, error: e.message, data: null }));
  };
  useEffect(() => { reload(); }, [path]);
  return { ...state, reload };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function PortalHome({ slug, onLogout }) {
  const me = usePortal('/api/portal/me');
  const appointments = usePortal('/api/portal/appointments');
  const prescriptions = usePortal('/api/portal/prescriptions');
  const invoices = usePortal('/api/portal/invoices');
  const reports = usePortal('/api/portal/reports');
  const queue = usePortal('/api/portal/queue');

  const [tab, setTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  if (me.loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFB]">
        <div className="flex flex-col items-center justify-center gap-4 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 p-12 shadow-md">
          <Logo className="h-8 animate-pulse text-[#0E8C72]" />
          <span className="text-xs font-bold tracking-wide text-slate-400">Loading your profile…</span>
        </div>
      </div>
    );
  }

  const patientName = me.data?.name || 'Valued Patient';
  const patientEmail = me.data?.email || 'patient@clynic.com';

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity },
    { key: 'visits', label: 'Visits', icon: CalendarDays },
    { key: 'rx', label: 'Prescriptions', icon: Pill },
    { key: 'bills', label: 'Invoices', icon: Receipt },
    { key: 'reports', label: 'Reports', icon: FileText },
    { key: 'queue', label: 'Queue', icon: ListChecks }
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      {/* Brand Logo Header */}
      <div className="flex h-16 items-center border-b px-5 select-none">
        <Logo className="h-7 text-[#0E8C72]" />
      </div>

      {/* Patient Profile Card (like switcher) */}
      <div className="px-3 pt-4">
        <div className="flex items-center gap-3 rounded-xl border bg-slate-50 px-3.5 py-3 select-none">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0E8C72]/10 text-[#0E8C72] font-black text-sm uppercase">
            {patientName.slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-slate-800 leading-tight">{patientName}</p>
            <p className="truncate text-[10.5px] text-slate-400 font-semibold mt-0.5">{patientEmail}</p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 px-3 py-6 select-none">
        {menuItems.map((item) => {
          const isActive = tab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                setTab(item.key);
                setMobileOpen(false);
              }}
              className={`w-full group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-[#0E8C72]/10 text-[#0E8C72]' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#0E8C72]" />}
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1 text-left truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Sign Out */}
      <div className="border-t p-3 select-none">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200/50 bg-red-50/50 hover:bg-red-50 text-red-600 text-xs font-extrabold transition cursor-pointer active:scale-95"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex bg-[#F8FAFB] w-full text-slate-700 min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 border-r bg-white h-screen sticky top-0 shadow-xs">
        <SidebarContent />
      </aside>

      {/* Mobile drawer slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[260px] border-r bg-white shadow-xl animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main container */}
      <div className="flex-1 flex flex-col min-h-screen relative w-full">
        {/* Decorative ambient gradients */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-[#0BB89F]/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-[#0BB89F]/5 blur-[100px] pointer-events-none" />

        {/* Mobile TopBar Header */}
        <header className="lg:hidden h-16 bg-white border-b px-5 flex items-center justify-between sticky top-0 z-40 select-none shadow-xs">
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <Logo className="h-6 text-[#0E8C72]" />
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0E8C72]/10 text-[#0E8C72] font-black text-xs uppercase">
            {patientName.slice(0, 2)}
          </span>
        </header>

        {/* Content area */}
        <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          <div className="relative min-h-[400px]">
            {tab === 'dashboard' && (
              <DashboardTab 
                slug={slug}
                me={me} 
                appointments={appointments} 
                prescriptions={prescriptions} 
                invoices={invoices} 
                reports={reports} 
                queue={queue}
                setTab={setTab}
              />
            )}
            {tab === 'visits' && <VisitsTab q={appointments} />}
            {tab === 'rx' && <RxTab q={prescriptions} />}
            {tab === 'bills' && <InvoicesTab q={invoices} />}
            {tab === 'reports' && <ReportsTab q={reports} />}
            {tab === 'queue' && <QueueTab q={queue} />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────  TAB PANELS  ───────────────────────── */

const CARD = "bg-white/50 backdrop-blur-md rounded-[24px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02),inset_0_1px_0_0_rgba(255,255,255,0.7)]";
const CARD_HOVER = CARD + " hover:shadow-[0_12px_32px_rgba(14,140,114,0.08)] transition-all duration-300";
const ICON_BOX = "h-10 w-10 rounded-xl bg-[#0BB89F]/10 flex items-center justify-center text-[#0E8C72] shrink-0";

function List({ q, render, empty }) {
  if (q.loading) return <p className="py-12 text-center text-xs font-bold text-slate-400">Loading…</p>;
  if (q.error) return <p className="py-12 text-center text-xs font-bold text-red-500 bg-red-50 rounded-2xl border border-red-100">{q.error}</p>;
  const items = q.data?.items || [];
  if (!items.length) return <p className="py-12 text-center text-xs font-bold text-slate-400 bg-white/20 rounded-2xl border border-white/50">{empty}</p>;
  return <div className="space-y-3.5">{items.map(render)}</div>;
}

/* ──── DASHBOARD TAB ──── */
function DashboardTab({ slug, me, appointments, prescriptions, invoices, reports, queue, setTab }) {
  const patientName = me.data?.name || 'Valued Patient';
  
  // Computations
  const now = new Date();
  const visitsList = appointments.data?.items || [];
  const nextVisit = useMemo(() => {
    return visitsList.find(a => new Date(a.scheduledAt) > now && ['booked', 'confirmed'].includes(a.status));
  }, [visitsList, now]);

  const rxList = useMemo(() => {
    return prescriptions.data?.items || [];
  }, [prescriptions.data]);

  const unpaidInvoices = useMemo(() => {
    const list = invoices.data?.items || [];
    return list.filter(inv => inv && inv.amountPaid !== undefined && inv.total !== undefined && inv.amountPaid < inv.total);
  }, [invoices.data]);

  const unpaidAmount = useMemo(() => {
    return unpaidInvoices.reduce((s, inv) => s + ((inv.total || 0) - (inv.amountPaid || 0)), 0);
  }, [unpaidInvoices]);

  const rxCount = rxList.length;
  const reportsCount = reports.data?.items?.length || 0;
  
  const token = queue.data?.you?.token;
  const position = queue.data?.you?.position;

  return (
    <div className="space-y-6">
      {/* Welcome Hero block */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0E8C72] to-[#0A6A56] p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-white/10 blur-[60px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <span className="text-[12.5px] font-bold text-teal-100 tracking-wider uppercase">{greeting()},</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Welcome back, {patientName} 👋
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-teal-50 font-semibold max-w-xl">
              All systems are operating normally. Manage your appointments, view medical reports, pay bills, and monitor your token position live.
            </p>
          </div>
          <div className="shrink-0 flex gap-2">
            <Link 
              to={`/c/${slug}/book`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-[#0E8C72] text-xs font-black shadow-md hover:bg-teal-50 transition active:scale-95 cursor-pointer"
            >
              <CalendarDays className="h-4 w-4" /> Book Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* KPI 1: Next Visit */}
        <div className={`${CARD} p-4 flex flex-col justify-between h-[115px]`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Next Visit</span>
            <div className="h-8 w-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#0E8C72]"><CalendarDays className="h-4.5 w-4.5" /></div>
          </div>
          <div>
            <p className="text-[13px] font-extrabold text-[#1A1A2E] leading-tight truncate">
              {nextVisit ? fmtDateTime(nextVisit.scheduledAt) : 'No upcoming visits'}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{nextVisit ? nextVisit.doctorName : 'Schedule one above'}</p>
          </div>
        </div>

        {/* KPI 2: Active Rx */}
        <div className={`${CARD} p-4 flex flex-col justify-between h-[115px]`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Prescriptions</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Pill className="h-4.5 w-4.5" /></div>
          </div>
          <div>
            <p className="text-[18px] font-extrabold text-[#1A1A2E] leading-none">{rxCount}</p>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">Active medication lists</p>
          </div>
        </div>

        {/* KPI 3: Unpaid Bills */}
        <div className={`${CARD} p-4 flex flex-col justify-between h-[115px]`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Bills</span>
            <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500"><Receipt className="h-4.5 w-4.5" /></div>
          </div>
          <div>
            <p className="text-[18px] font-extrabold text-[#1A1A2E] leading-none">{inr(unpaidAmount)}</p>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">{unpaidInvoices.length} invoices to clear</p>
          </div>
        </div>

        {/* KPI 4: Queue token */}
        <div className={`${CARD} p-4 flex flex-col justify-between h-[115px]`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Queue Token</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600"><ListChecks className="h-4.5 w-4.5" /></div>
          </div>
          <div>
            <p className="text-[18px] font-extrabold text-[#1A1A2E] leading-none">
              {token ? `#${token}` : '—'}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">
              {token ? `Queue position #${position}` : 'No active token'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Left column: Appointments & Queue */}
        <div className="md:col-span-2 space-y-5">
          {/* Active Queue card */}
          {token && (
            <div className="bg-[#0BB89F]/10 border border-[#0BB89F]/25 rounded-[24px] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] flex items-center justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-black"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" /></span> Live Queue Pass</span>
                <p className="text-xs font-bold text-[#0E8C72] mt-1">
                  You are checked in. Position <span className="font-extrabold text-[#1A1A2E]">#{position}</span> in line. Estimated wait <span className="font-extrabold text-[#1A1A2E]">{queue.data?.you?.waitMinutes} minutes</span>.
                </p>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#0E8C72]">Token</div>
                <div className="text-3xl font-black font-mono text-[#0E8C72]">#{token}</div>
              </div>
            </div>
          )}

          {/* Visits card */}
          <div className={`${CARD} p-5 flex flex-col`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/40 mb-3.5">
              <h3 className="text-[14px] font-extrabold text-[#1A1A2E] flex items-center gap-2"><CalendarDays className="h-4.5 w-4.5 text-[#0E8C72]" /> Recent & Scheduled Visits</h3>
              <button onClick={() => setTab('visits')} className="text-xs font-bold text-[#0E8C72] flex items-center gap-0.5 hover:underline">View all <ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
            <div className="space-y-3">
              {appointments.loading ? (
                <p className="text-center text-xs font-bold text-slate-400 py-6">Loading visits…</p>
              ) : visitsList.length === 0 ? (
                <p className="text-center text-xs font-bold text-slate-400 py-6">No appointment history</p>
              ) : (
                visitsList.slice(0, 3).map((a) => (
                  <div key={a._id} className="flex items-center justify-between p-3.5 bg-white/40 hover:bg-white/70 rounded-2xl border border-white/30 transition shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#0E8C72]"><CalendarDays className="h-4 w-4" /></div>
                      <div>
                        <p className="text-xs font-extrabold text-[#1A1A2E]">{fmtDateTime(a.scheduledAt)}</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">{a.doctorName} · {a.prepaid ? 'Prepaid' : 'Pay at Clinic'}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold capitalize ${a.status === 'confirmed' || a.status === 'booked' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Prescriptions card */}
          <div className={`${CARD} p-5`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/40 mb-3.5">
              <h3 className="text-[14px] font-extrabold text-[#1A1A2E] flex items-center gap-2"><Pill className="h-4.5 w-4.5 text-[#0E8C72]" /> Active Prescriptions</h3>
              <button onClick={() => setTab('rx')} className="text-xs font-bold text-[#0E8C72] flex items-center gap-0.5 hover:underline">View all <ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
            <div className="space-y-3">
              {prescriptions.loading ? (
                <p className="text-center text-xs font-bold text-slate-400 py-6">Loading prescriptions…</p>
              ) : rxList.length === 0 ? (
                <p className="text-center text-xs font-bold text-slate-400 py-6">No prescription records</p>
              ) : (
                rxList.slice(0, 2).map((rx) => (
                  <div key={rx._id} className="p-4 bg-white/40 hover:bg-white/70 rounded-2xl border border-white/30 transition shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-extrabold text-[#1A1A2E]">{rx.doctorName}</p>
                      <p className="text-[9.5px] text-slate-400 font-bold">{fmtDate(rx.createdAt)}</p>
                    </div>
                    <ul className="space-y-1.5">
                      {(rx.items || []).slice(0, 3).map((it, i) => (
                        <li key={i} className="text-[11.5px] text-slate-600 font-semibold flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0E8C72]" />
                          <span>{it.drug} — <span className="text-slate-400 font-medium text-[10.5px]">{it.dose} | {it.frequency}</span></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: Billing & Reports */}
        <div className="space-y-5">
          {/* Pending Bills / Invoices */}
          <div className={`${CARD} p-5 flex flex-col`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/40 mb-3.5">
              <h3 className="text-[14px] font-extrabold text-[#1A1A2E] flex items-center gap-2"><Receipt className="h-4.5 w-4.5 text-[#0E8C72]" /> Billing Summary</h3>
              <button onClick={() => setTab('bills')} className="text-xs font-bold text-[#0E8C72] flex items-center gap-0.5 hover:underline">View all <ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
            <div className="space-y-3 flex-1">
              {invoices.loading ? (
                <p className="text-center text-xs font-bold text-slate-400 py-6">Loading billing…</p>
              ) : unpaidInvoices.length === 0 ? (
                <p className="text-center text-xs font-bold text-slate-400 py-6">All invoices are paid! Thank you.</p>
              ) : (
                unpaidInvoices.slice(0, 2).map((inv) => (
                  <div key={inv._id} className="p-3.5 bg-white/40 hover:bg-white/70 rounded-2xl border border-white/30 transition shadow-xs flex flex-col justify-between min-h-[96px]">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-extrabold text-[#1A1A2E]">{inv.invoiceNumber}</p>
                        <p className="text-[10px] text-slate-500 font-semibold capitalize mt-0.5">{inv.status?.replace('_', ' ') || 'Unpaid'}</p>
                      </div>
                      <span className="text-[14px] font-extrabold text-[#0E8C72]">{inr(inv.total)}</span>
                    </div>
                    <button 
                      onClick={() => setTab('bills')} 
                      className="w-full mt-3 py-1.5 bg-[#0E8C72] hover:bg-[#074C3D] text-white rounded-full text-[10.5px] font-bold transition shadow-xs active:scale-95 cursor-pointer text-center"
                    >
                      Pay Bill
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Medical Reports */}
          <div className={`${CARD} p-5 flex flex-col`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/40 mb-3.5">
              <h3 className="text-[14px] font-extrabold text-[#1A1A2E] flex items-center gap-2"><FileText className="h-4.5 w-4.5 text-[#0E8C72]" /> Reports & Records</h3>
              <button onClick={() => setTab('reports')} className="text-xs font-bold text-[#0E8C72] flex items-center gap-0.5 hover:underline">View all <ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
            <div className="space-y-3">
              {reports.loading ? (
                <p className="text-center text-xs font-bold text-slate-400 py-6">Loading reports…</p>
              ) : reportsCount === 0 ? (
                <p className="text-center text-xs font-bold text-slate-400 py-6">No reports uploaded</p>
              ) : (
                (reports.data?.items || []).slice(0, 3).map((r) => (
                  <div key={r._id} className="flex items-center justify-between p-3.5 bg-white/40 hover:bg-white/70 rounded-2xl border border-white/30 transition shadow-xs">
                    <span className="text-xs font-bold text-slate-700 truncate pr-2 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-[#0E8C72] shrink-0" />
                      {r.title || r.originalName}
                    </span>
                    <button 
                      onClick={() => {
                        portalFetch(`/api/portal/reports/${r._id}/signed-url`).then(({ path }) => {
                          window.open(`${API_URL}${path}`, '_blank', 'noopener');
                        }).catch(e => alert(e.message));
                      }} 
                      className="px-3 py-1 border border-slate-200/80 rounded-full text-[10px] font-bold text-slate-700 bg-white/60 hover:bg-white transition cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──── VISITS TAB ──── */
function VisitsTab({ q }) {
  return (
    <div className="space-y-4">
      <div className={`${CARD} p-5`}>
        <h3 className="text-[14px] font-extrabold text-[#1A1A2E] flex items-center gap-2 mb-1"><CalendarDays className="h-4.5 w-4.5 text-[#0E8C72]" /> Appointment Bookings</h3>
        <p className="text-[11px] text-slate-500 font-semibold">View your completed, scheduled, or cancelled clinical visits.</p>
      </div>
      <List q={q} empty="No visits scheduled yet." render={(a) => (
        <div key={a._id} className={`flex items-center justify-between p-4 ${CARD_HOVER}`}>
          <div className="flex items-center gap-3">
            <div className={ICON_BOX}><CalendarDays className="h-5 w-5" /></div>
            <div>
              <h4 className="text-[13px] font-extrabold text-[#1A1A2E] leading-tight">{fmtDateTime(a.scheduledAt)}</h4>
              <p className="text-[10px] text-slate-500 font-bold mt-1 capitalize">
                Doctor: {a.doctorName} · {a.prepaid ? 'Prepaid online' : 'Pay at counter'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${a.status === 'confirmed' || a.status === 'booked' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {a.status}
            </span>
          </div>
        </div>
      )} />
    </div>
  );
}

/* ──── PRESCRIPTIONS TAB ──── */
function RxTab({ q }) {
  return (
    <div className="space-y-4">
      <div className={`${CARD} p-5`}>
        <h3 className="text-[14px] font-extrabold text-[#1A1A2E] flex items-center gap-2 mb-1"><Pill className="h-4.5 w-4.5 text-[#0E8C72]" /> Medical Prescriptions</h3>
        <p className="text-[11px] text-slate-500 font-semibold">Keep track of medications prescribed by your clinic doctors.</p>
      </div>
      <List q={q} empty="No prescriptions recorded yet." render={(rx) => (
        <div key={rx._id} className={`p-5 ${CARD}`}>
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/40 mb-3.5">
            <div className="h-9 w-9 rounded-xl bg-[#0BB89F]/10 flex items-center justify-center text-[#0E8C72] shrink-0"><Pill className="h-4.5 w-4.5" /></div>
            <div>
              <h4 className="text-[13.5px] font-extrabold text-[#1A1A2E] leading-none">{rx.doctorName}</h4>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Prescribed on {fmtDate(rx.createdAt)}</p>
            </div>
          </div>
          <ul className="space-y-2.5 pl-1">
            {rx.items.map((it, i) => (
              <li key={i} className="text-[12.5px] text-slate-600 font-bold flex items-start gap-2">
                <span className="text-[#0E8C72] font-black">•</span>
                <span>{it.drug} — <span className="text-slate-400 font-medium text-[11px]">{it.dose} | {it.frequency} | {it.duration}</span></span>
              </li>
            ))}
          </ul>
        </div>
      )} />
    </div>
  );
}

/* ──── INVOICES TAB ──── */
function InvoicesTab({ q }) {
  const [paying, setPaying] = useState(null);
  const pay = async (inv) => {
    setPaying(inv._id);
    try {
      const order = await portalFetch(`/api/portal/invoices/${inv._id}/pay-order`, { method: 'POST' });
      const proof = await collectPayment(order, { 
        name: 'Invoice payment', 
        mockSign: (orderId) => portalFetch('/api/portal/payments/mock-sign', { method: 'POST', body: { orderId } }) 
      });
      await portalFetch('/api/portal/payments/verify', { method: 'POST', body: proof });
      q.reload();
    } catch (e) { 
      alert(e.message); 
    } finally { 
      setPaying(null); 
    }
  };

  return (
    <div className="space-y-4">
      <div className={`${CARD} p-5`}>
        <h3 className="text-[14px] font-extrabold text-[#1A1A2E] flex items-center gap-2 mb-1"><Receipt className="h-4.5 w-4.5 text-[#0E8C72]" /> Invoice Records</h3>
        <p className="text-[11px] text-slate-500 font-semibold">Review your invoices, payments, and pay outstanding dues.</p>
      </div>
      <List q={q} empty="No invoices issued yet." render={(inv) => (
        <div key={inv._id} className={`p-5 ${CARD}`}>
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-200/40">
            <span className="flex items-center gap-2 text-[13px] font-extrabold text-[#1A1A2E]">
              <Receipt className="h-4.5 w-4.5 text-[#0E8C72]" /> {inv.invoiceNumber}
            </span>
            <span className="text-[16px] font-black text-[#0E8C72]">{inr(inv.total)}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11.5px] font-bold text-slate-500 capitalize">
              Status: <span className="text-[#1A1A2E] font-extrabold">{inv.status.replace('_', ' ')}</span> · Paid {inr(inv.amountPaid)}
            </span>
            {inv.amountPaid < inv.total && (
              <button 
                onClick={() => pay(inv)} 
                disabled={paying === inv._id} 
                className="px-4 py-2 bg-[#0E8C72] hover:bg-[#074C3D] text-white rounded-full text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {paying === inv._id ? 'Paying…' : 'Pay Now'}
              </button>
            )}
          </div>
        </div>
      )} />
    </div>
  );
}

/* ──── REPORTS TAB ──── */
function ReportsTab({ q }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  
  const view = async (id) => {
    try {
      const { path } = await portalFetch(`/api/portal/reports/${id}/signed-url`);
      window.open(`${API_URL}${path}`, '_blank', 'noopener');
    } catch (e) {
      alert(e.message);
    }
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'other');
      await portalUpload('/api/portal/reports', fd);
      if (fileRef.current) fileRef.current.value = '';
      q.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div className={`${CARD} flex flex-col items-center justify-center border-dashed border-[#0E8C72]/30 hover:border-[#0E8C72]/60 transition-colors py-6 p-5`}>
        <Upload className="h-6 w-6 text-[#0E8C72] mb-2" />
        <span className="text-xs font-extrabold text-[#1A1A2E] mb-1">Upload Medical Report</span>
        <span className="text-[10px] text-slate-500 font-semibold mb-3">PDF or Images up to 5MB</span>
        <input 
          ref={fileRef} 
          type="file" 
          accept=".pdf,image/*" 
          onChange={upload} 
          disabled={busy} 
          className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-[#0BB89F]/10 file:text-[#0E8C72] hover:file:bg-[#0BB89F]/20 file:cursor-pointer transition-colors" 
        />
      </div>

      {/* Reports List */}
      <List q={q} empty="No reports uploaded yet." render={(r) => (
        <div key={r._id} className={`flex items-center justify-between p-4 ${CARD_HOVER}`}>
          <span className="flex items-center gap-2.5 text-[12.5px] font-bold text-slate-700 truncate pr-4">
            <FileText className="h-4.5 w-4.5 text-[#0E8C72] shrink-0" /> 
            {r.title || r.originalName}
          </span>
          <button 
            onClick={() => view(r._id)} 
            className="px-4 py-1.5 border border-slate-200/80 rounded-full text-[11px] font-bold text-slate-700 bg-white/40 hover:bg-white transition-colors cursor-pointer"
          >
            View
          </button>
        </div>
      )} />
    </div>
  );
}

/* ──── QUEUE TAB ──── */
function QueueTab({ q }) {
  const snap = q.data || { nowServing: [], waiting: [] };
  if (q.loading) return <p className="py-12 text-center text-xs font-bold text-slate-400">Loading queue status…</p>;
  const you = snap.you;

  return (
    <div className="space-y-4">
      {/* Top Welcome banner */}
      <div className={`${CARD} p-5`}>
        <h3 className="text-[14px] font-extrabold text-[#1A1A2E] flex items-center gap-2 mb-1"><ListChecks className="h-4.5 w-4.5 text-[#0E8C72]" /> Live Clinic Queue</h3>
        <p className="text-[11px] text-slate-500 font-semibold">Monitor the check-in queue, active serving tokens, and estimated waiting times in real-time.</p>
      </div>

      {/* Main Ticket */}
      {you && (
        <div className="bg-[#0BB89F]/10 border border-[#0BB89F]/25 rounded-[24px] p-6 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#0E8C72]">Your Check-In Token</div>
          <div className="text-5xl font-black font-mono text-[#0E8C72] my-2">#{you.token}</div>
          {you.position === 0 ? (
            <p className="text-xs font-extrabold text-[#0E8C72]">It's your turn — please enter the consultation room.</p>
          ) : (
            <p className="text-xs font-semibold text-slate-600">
              Position <span className="font-extrabold text-[#1A1A2E]">#{you.position}</span> in line · Estimated wait: <span className="font-extrabold text-[#1A1A2E]">{you.waitMinutes}m</span>
            </p>
          )}
        </div>
      )}

      {/* Grid counters */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`${CARD} p-5 text-center`}>
          <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500">Now Serving</div>
          <div className="text-3xl font-black font-mono text-[#0E8C72] mt-1.5">{snap.nowServing?.[0]?.token ?? '—'}</div>
        </div>
        <div className={`${CARD} p-5 text-center`}>
          <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500">Patients Waiting</div>
          <div className="text-3xl font-black font-mono text-[#0E8C72] mt-1.5">{snap.waiting?.length || 0}</div>
        </div>
      </div>

      {/* Live queue list */}
      <div className={`${CARD} p-5`}>
        <div className="mb-3.5 flex items-center gap-2 text-xs font-extrabold text-[#1A1A2E]">
          <Activity className="h-4 w-4 text-[#0E8C72]" /> Next in Line
        </div>
        <div className="divide-y divide-slate-200/40">
          {(snap.waiting || []).slice(0, 8).map((w) => (
            <div key={w.id} className="flex justify-between py-2.5 text-xs font-semibold">
              <span className="font-mono text-[#1A1A2E]">Patient Token #{w.token}</span>
              <span className="text-slate-500">~{w.waitMinutes}m wait</span>
            </div>
          ))}
          {(!snap.waiting || !snap.waiting.length) && (
            <div className="text-center text-[11px] text-slate-400 font-semibold py-4">No patients waiting in queue</div>
          )}
        </div>
      </div>
    </div>
  );
}

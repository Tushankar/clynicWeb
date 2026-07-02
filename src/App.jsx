import { Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientChartPage from './pages/PatientChartPage';
import AppointmentsPage from './pages/AppointmentsPage';
import QueuePage from './pages/QueuePage';
import MessagesPage from './pages/MessagesPage';
import BillingPage from './pages/BillingPage';
import InvoicePrintPage from './pages/InvoicePrintPage';
import PortalPage from './pages/PortalPage';
import PlanPage from './pages/PlanPage';
import AdminPage from './pages/AdminPage';
import BranchesPage from './pages/BranchesPage';
import CrmPage from './pages/CrmPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AiPage from './pages/AiPage';
import WebsitePage from './pages/WebsitePage';
import DoctorsPage from './pages/DoctorsPage';
import WalkInsPage from './pages/WalkInsPage';
import SettingsPage from './pages/SettingsPage';
import PublicSitePage from './pages/PublicSitePage';
import PublicCustomPage from './pages/PublicCustomPage';
import PublicBookingPage from './pages/PublicBookingPage';
import TvDisplayPage from './pages/TvDisplayPage';
import PrescriptionPrintPage from './pages/PrescriptionPrintPage';
import RequireAuth from './components/RequireAuth';

export default function App() {
  return (
    <Routes>
      {/* Public (no app shell, no Clerk) */}
      <Route path="/sign-in/*" element={<SignInPage />} />
      {/* Platform root = the flagship clinic's public website (§5.19). PublicSitePage falls
          back to VITE_MAIN_SITE_SLUG when no :slug param is present. */}
      <Route path="/" element={<PublicSitePage />} />
      {/* Every other clinic's website (§8.6): /c/:slug is the site; booking + pages beneath it */}
      <Route path="/c/:slug" element={<PublicSitePage />} />
      <Route path="/c/:slug/book" element={<PublicBookingPage />} />
      <Route path="/c/:slug/p/:pageSlug" element={<PublicCustomPage />} />
      <Route path="/tv/:slug" element={<TvDisplayPage />} />
      <Route path="/portal/:slug" element={<PortalPage />} />
      {/* Standalone printable (auth-gated, no shell) */}
      <Route path="/rx/:id" element={<RequireAuth><PrescriptionPrintPage /></RequireAuth>} />
      <Route path="/invoice/:id" element={<RequireAuth><InvoicePrintPage /></RequireAuth>} />

      {/* Authenticated staff area (Clerk-gated, inside the app shell) — lives under /dashboard */}
      <Route path="/dashboard" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="doctor" element={<DoctorDashboardPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="walk-ins" element={<WalkInsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/:id" element={<PatientChartPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="plan" element={<PlanPage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="crm" element={<CrmPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="ai" element={<AiPage />} />
        <Route path="website" element={<WebsitePage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="messages" element={<MessagesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

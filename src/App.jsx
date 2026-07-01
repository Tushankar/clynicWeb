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
import PublicSitePage from './pages/PublicSitePage';
import PublicBookingPage from './pages/PublicBookingPage';
import TvDisplayPage from './pages/TvDisplayPage';
import PrescriptionPrintPage from './pages/PrescriptionPrintPage';
import RequireAuth from './components/RequireAuth';

export default function App() {
  return (
    <Routes>
      {/* Public (no app shell, no Clerk) */}
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/c/:slug" element={<PublicBookingPage />} />
      <Route path="/site/:slug" element={<PublicSitePage />} />
      <Route path="/tv/:slug" element={<TvDisplayPage />} />
      <Route path="/portal/:slug" element={<PortalPage />} />
      {/* Standalone printable (auth-gated, no shell) */}
      <Route path="/rx/:id" element={<RequireAuth><PrescriptionPrintPage /></RequireAuth>} />
      <Route path="/invoice/:id" element={<RequireAuth><InvoicePrintPage /></RequireAuth>} />

      {/* Authenticated staff area (Clerk-gated, inside the app shell) */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/doctor" element={<DoctorDashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:id" element={<PatientChartPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/crm" element={<CrmPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/ai" element={<AiPage />} />
        <Route path="/website" element={<WebsitePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/messages" element={<MessagesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

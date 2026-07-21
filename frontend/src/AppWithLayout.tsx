import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { EventsPage } from './pages/EventsPage';
import { RegistrationsPage } from './pages/RegistrationsPage';
import { AttendeesPage } from './pages/AttendeesPage';
import { LoginPage } from './pages/LoginPage';
import { RootState } from './store/store';

// Lazy load additional pages
const FeedbackPage = lazy(() => import('./pages/FeedbackPage').then(m => ({ default: m.FeedbackPage })));
const CertificatesPage = lazy(() => import('./pages/CertificatesPage').then(m => ({ default: m.CertificatesPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Super Admin Pages
const SystemHealth = lazy(() => import('./pages/roles/superAdmin/SystemHealth').then(m => ({ default: m.SystemHealth })));
const SuperAdminUserManagement = lazy(() => import('./pages/roles/superAdmin/UserManagement').then(m => ({ default: m.UserManagement })));
const AuditLogs = lazy(() => import('./pages/roles/superAdmin/AuditLogs').then(m => ({ default: m.AuditLogs })));
const SystemSettings = lazy(() => import('./pages/roles/superAdmin/SystemSettings').then(m => ({ default: m.SystemSettings })));
const DatabaseHealth = lazy(() => import('./pages/roles/superAdmin/DatabaseHealth').then(m => ({ default: m.DatabaseHealth })));

// Admin Pages
const AdminEventManagement = lazy(() => import('./pages/roles/admin/EventManagement').then(m => ({ default: m.EventManagement })));
const ApprovalQueue = lazy(() => import('./pages/roles/admin/ApprovalQueue').then(m => ({ default: m.ApprovalQueue })));
const AdminReports = lazy(() => import('./pages/roles/admin/Reports').then(m => ({ default: m.Reports })));
const RolePermissions = lazy(() => import('./pages/roles/admin/RolePermissions').then(m => ({ default: m.RolePermissions })));

// Division Manager Pages
const TeamManagement = lazy(() => import('./pages/roles/divisionManager/TeamManagement').then(m => ({ default: m.TeamManagement })));
const BudgetTracking = lazy(() => import('./pages/roles/divisionManager/BudgetTracking').then(m => ({ default: m.BudgetTracking })));
const DivisionEvents = lazy(() => import('./pages/roles/divisionManager/DivisionEvents').then(m => ({ default: m.DivisionEvents })));

// Event Organizer Pages
const RegistrationManagement = lazy(() => import('./pages/roles/eventOrganizer/RegistrationManagement').then(m => ({ default: m.RegistrationManagement })));
const AttendanceTracking = lazy(() => import('./pages/roles/eventOrganizer/AttendanceTracking').then(m => ({ default: m.AttendanceTracking })));

// Employee Pages
const MyEvents = lazy(() => import('./pages/roles/employee/MyEvents').then(m => ({ default: m.MyEvents })));

// Volunteer Pages
const Opportunities = lazy(() => import('./pages/roles/volunteer/Opportunities').then(m => ({ default: m.Opportunities })));

// Speaker Pages
const MyEngagements = lazy(() => import('./pages/roles/speaker/MyEngagements').then(m => ({ default: m.MyEngagements })));

// Sponsor Pages
const Sponsorships = lazy(() => import('./pages/roles/sponsor/Sponsorships').then(m => ({ default: m.Sponsorships })));

// External User Pages
const MyRegistrations = lazy(() => import('./pages/roles/externalUser/MyRegistrations').then(m => ({ default: m.MyRegistrations })));

// Customer Support Pages
const TicketManagement = lazy(() => import('./pages/roles/customerSupport/TicketManagement').then(m => ({ default: m.TicketManagement })));

function LoadingSpinner() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}

function ProtectedRoutes() {
  const hasSelectedRole = useSelector((state: RootState) => state.ui.hasSelectedRole);

  if (!hasSelectedRole) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/registrations" element={<RegistrationsPage />} />
          <Route path="/attendees" element={<AttendeesPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Super Admin Routes */}
          <Route path="/role/superAdmin/systemHealth" element={<SystemHealth />} />
          <Route path="/role/superAdmin/userManagement" element={<SuperAdminUserManagement />} />
          <Route path="/role/superAdmin/auditLogs" element={<AuditLogs />} />
          <Route path="/role/superAdmin/systemSettings" element={<SystemSettings />} />
          <Route path="/role/superAdmin/databaseHealth" element={<DatabaseHealth />} />

          {/* Admin Routes */}
          <Route path="/role/admin/eventManagement" element={<AdminEventManagement />} />
          <Route path="/role/admin/approvalQueue" element={<ApprovalQueue />} />
          <Route path="/role/admin/reports" element={<AdminReports />} />
          <Route path="/role/admin/rolePermissions" element={<RolePermissions />} />

          {/* Division Manager Routes */}
          <Route path="/role/divisionManager/teamManagement" element={<TeamManagement />} />
          <Route path="/role/divisionManager/budgetTracking" element={<BudgetTracking />} />
          <Route path="/role/divisionManager/divisionEvents" element={<DivisionEvents />} />

          {/* Event Organizer Routes */}
          <Route path="/role/eventOrganizer/registrationManagement" element={<RegistrationManagement />} />
          <Route path="/role/eventOrganizer/attendanceTracking" element={<AttendanceTracking />} />

          {/* Employee Routes */}
          <Route path="/role/employee/myEvents" element={<MyEvents />} />

          {/* Volunteer Routes */}
          <Route path="/role/volunteer/opportunities" element={<Opportunities />} />

          {/* Speaker Routes */}
          <Route path="/role/speaker/myEngagements" element={<MyEngagements />} />

          {/* Sponsor Routes */}
          <Route path="/role/sponsor/sponsorships" element={<Sponsorships />} />

          {/* External User Routes */}
          <Route path="/role/externalUser/myRegistrations" element={<MyRegistrations />} />

          {/* Customer Support Routes */}
          <Route path="/role/customerSupport/ticketManagement" element={<TicketManagement />} />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export function AppWithLayout() {
  const basename = process.env.NODE_ENV === 'production' ? '/Stakeholder_Platform_POC' : '/';

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/landing" element={<LoginPage />} />
        <Route path="*" element={<ProtectedRoutes />} />
      </Routes>
    </Router>
  );
}

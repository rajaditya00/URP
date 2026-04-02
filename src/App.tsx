import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPortal from './pages/LoginPortal';
import Signup from './pages/Signup';
import UniversityPortal from './pages/UniversityPortal';
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import UniversityLogin from './pages/UniversityLogin';
import UniAdminDashboard from './pages/UniAdminDashboard';

import Dashboard from './pages/Dashboard';
import Academic from './pages/Academic';
import NonAcademic from './pages/NonAcademic';
import InternshipStartup from './pages/InternshipStartup';
import Placement from './pages/Placement';
import Examination from './pages/Examination';
import Notices from './pages/Notices';
import Colleges from './pages/Colleges';

// New Features
import StudentPortal from './pages/StudentPortal';
import FacultyDirectory from './pages/FacultyDirectory';
import ResearchHub from './pages/ResearchHub';
import Facilities from './pages/Facilities';
import Grievance from './pages/Grievance';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPortal />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/portal/:uniSlug" element={<UniversityPortal />} />
      <Route path="/system-admin" element={<SystemAdminDashboard />} />
      <Route path="/university-login" element={<UniversityLogin />} />
      <Route path="/uni-admin/dashboard" element={<UniAdminDashboard />} />

      {/* Protected Routes (Require Authentication in Real App) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/academic" element={<Academic />} />
        <Route path="/non-academic" element={<NonAcademic />} />
        <Route path="/internships-startups" element={<InternshipStartup />} />
        <Route path="/placement" element={<Placement />} />
        <Route path="/examination" element={<Examination />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/colleges" element={<Colleges />} />

        {/* New Feature Routes */}
        <Route path="/student-portal" element={<StudentPortal />} />
        <Route path="/faculty-directory" element={<FacultyDirectory />} />
        <Route path="/research-hub" element={<ResearchHub />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/grievance" element={<Grievance />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import Layout from './components/Layout/Layout';
import LandingPage from './pages/LandingPage';
import Signup from './pages/Signup';
import UniversityPortal from './pages/UniversityPortal';
import SystemAdminDashboard from './pages/SystemAdminDashboard';

import UniAdminDashboard from './pages/UniAdminDashboard';
import CollegeAdminDashboard from './pages/CollegeAdminDashboard';
import FacultySelfDashboard from './pages/FacultySelfDashboard';
import StudentSelfDashboard from './pages/StudentSelfDashboard';
import MemberProfilePage from './pages/MemberProfilePage';
import StudentNoticesPage from './pages/StudentNoticesPage';
import DepartmentDetailDashboard from './pages/DepartmentDetailDashboard';

import Academic from './pages/Academic';
import NonAcademic from './pages/NonAcademic';
import InternshipStartup from './pages/InternshipStartup';
import Placement from './pages/Placement';
import Examination from './pages/Examination';
import Notices from './pages/Notices';
import Colleges from './pages/Colleges';

// New Features
import FacultyDirectory from './pages/FacultyDirectory';
import ResearchHub from './pages/ResearchHub';
import Grievance from './pages/Grievance';
import ELearning from './pages/ELearning';
import CourseDetail from './pages/CourseDetail';

// AuthModal is decoupled intentionally from global blocking

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/portal/:uniSlug" element={<UniversityPortal />} />
        <Route path="/system-admin" element={<SystemAdminDashboard />} />
        <Route path="/university-login" element={<Navigate to="/" replace />} />
        <Route path="/uni-admin/dashboard" element={<UniAdminDashboard />} />
        <Route path="/college-admin/dashboard" element={<CollegeAdminDashboard />} />
        <Route path="/faculty-dashboard" element={<FacultySelfDashboard />} />
        <Route path="/student-portal" element={<StudentSelfDashboard />} />
        <Route path="/college-admin/student/:id" element={<MemberProfilePage />} />
        <Route path="/college-admin/faculty/:id" element={<MemberProfilePage />} />
        <Route path="/college-admin/department/:deptName" element={<DepartmentDetailDashboard />} />
        <Route path="/student-notices" element={<StudentNoticesPage />} />

        {/* Protected Routes (Require Authentication in Real App) */}
        <Route element={<Layout />}>
          <Route path="/academic" element={<Academic />} />
          <Route path="/non-academic" element={<NonAcademic />} />
          <Route path="/internships-startups" element={<InternshipStartup />} />
          <Route path="/placement" element={<Placement />} />
          <Route path="/examination" element={<Examination />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/colleges" element={<Colleges />} />

          {/* New Feature Routes */}
          <Route path="/faculty-directory" element={<FacultyDirectory />} />
          <Route path="/research-hub" element={<ResearchHub />} />
          <Route path="/grievance" element={<Grievance />} />
          <Route path="/e-learning" element={<ELearning />} />
          <Route path="/e-learning/:courseId" element={<CourseDetail />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

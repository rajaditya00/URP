import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  Rocket,
  Briefcase,
  FileText,
  BellRing,
  LibraryBig,
  UserCheck,
  SearchCheck,
  Microscope,
  CalendarCheck,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

const coreNav = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/academic', label: 'Academic Dept', icon: <GraduationCap size={18} /> },
  { path: '/non-academic', label: 'Non-Academic', icon: <Building2 size={18} /> },
  { path: '/internships-startups', label: 'Internships & Startups', icon: <Rocket size={18} /> },
  { path: '/placement', label: 'Placement', icon: <Briefcase size={18} /> },
  { path: '/examination', label: 'Examination Control', icon: <FileText size={18} /> },
  { path: '/notices', label: 'Notices & Announcements', icon: <BellRing size={18} /> },
  { path: '/colleges', label: 'Affiliated Colleges', icon: <LibraryBig size={18} /> },
];

const featureNav = [
  { path: '/student-portal', label: 'Student Portal', icon: <UserCheck size={18} /> },
  { path: '/faculty-directory', label: 'Faculty Directory', icon: <SearchCheck size={18} /> },
  { path: '/research-hub', label: 'Research Hub', icon: <Microscope size={18} /> },
  { path: '/facilities', label: 'Book Facilities', icon: <CalendarCheck size={18} /> },
  { path: '/grievance', label: 'Grievances', icon: <AlertTriangle size={18} /> },
];

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen flex flex-col border-r border-border-color bg-bg-primary flex-shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-border-color flex-shrink-0">
        <div className="w-8 h-8 rounded-md bg-accent-primary flex items-center justify-center flex-shrink-0">
          <LibraryBig size={18} color="#fff" />
        </div>
        <span className="text-base font-bold text-text-primary tracking-tight">
          Lumina <span className="text-accent-primary font-medium">URP</span>
        </span>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 px-2">Core Modules</p>
          <nav className="space-y-0.5">
            {coreNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150 group
                  ${isActive
                    ? 'bg-accent-primary text-white font-semibold'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-accent-primary'} transition-colors`}>
                      {item.icon}
                    </span>
                    <span className="whitespace-nowrap flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="text-white/70 flex-shrink-0" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 px-2">Features</p>
          <nav className="space-y-0.5">
            {featureNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150 group
                  ${isActive
                    ? 'bg-accent-primary text-white font-semibold'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-accent-primary'} transition-colors`}>
                      {item.icon}
                    </span>
                    <span className="whitespace-nowrap flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="text-white/70 flex-shrink-0" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-border-color flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-bg-secondary cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            A
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">Admin User</p>
            <p className="text-xs text-text-muted truncate">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

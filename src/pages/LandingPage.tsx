import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChevronRight, Shield, Globe, Zap, Database, LibraryBig, CheckCircle2,
    BookOpen, Users, BarChart3, FileText, GraduationCap, Building2,
    Calendar, Award, ClipboardList, Microscope, DollarSign, Bus,
    HeartPulse, Wifi, LayoutDashboard, Bell, Settings, HelpCircle,
    BookMarked, Video, Download, Phone, Mail, MapPin, ExternalLink,
    ChevronDown, School, Landmark, Trophy, Briefcase, Star,
    Lock, ShieldCheck, Eye, EyeOff, Loader2, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Nav dropdown data ─────────────────────────────────────────

const navData = {
    Solutions: {
        sections: [
            {
                heading: 'Academic Management',
                items: [
                    { icon: <GraduationCap size={16} />, label: 'Student Lifecycle Management', desc: 'Admissions to alumni — full journey', href: '/student-portal' },
                    { icon: <BookOpen size={16} />, label: 'Curriculum & Course Planning', desc: 'Design syllabi, map credits & outcomes', href: '/academic' },
                    { icon: <Calendar size={16} />, label: 'Timetable & Scheduling', desc: 'Auto conflict-free schedule generation', href: '/academic' },
                    { icon: <ClipboardList size={16} />, label: 'Attendance Tracking', desc: 'Biometric, manual & online attendance', href: '/academic' },
                    { icon: <FileText size={16} />, label: 'Examination Management', desc: 'Forms, hall tickets, results & re-evals', href: '/examination' },
                    { icon: <Award size={16} />, label: 'Grades & Transcripts', desc: 'GPA/CGPA, degree certificates, marksheets', href: '/examination' },
                ],
            },
            {
                heading: 'Administration & Finance',
                items: [
                    { icon: <DollarSign size={16} />, label: 'Fee Management', desc: 'Dues, receipts, waivers & scholarships', href: '/dashboard' },
                    { icon: <Users size={16} />, label: 'HR & Payroll', desc: 'Staff records, payroll & attendance', href: '/faculty-directory' },
                    { icon: <Building2 size={16} />, label: 'Infrastructure & Assets', desc: 'Classrooms, labs, equipment tracking', href: '/facilities' },
                    { icon: <Bus size={16} />, label: 'Transport Management', desc: 'Route, vehicle & pass management', href: '/facilities' },
                    { icon: <HeartPulse size={16} />, label: 'Health & Wellness Center', desc: 'Medical records, appointments & reports', href: '/facilities' },
                    { icon: <Shield size={16} />, label: 'Compliance & Accreditation', desc: 'NAAC, NBA docs & audit trail', href: '/dashboard' },
                ],
            },
            {
                heading: 'Growth & Engagement',
                items: [
                    { icon: <Briefcase size={16} />, label: 'Placement & Internships', desc: 'Drives, offers, recruiter portal', href: '/placement' },
                    { icon: <Microscope size={16} />, label: 'Research & Innovation Hub', desc: 'Projects, grants, patents & publications', href: '/research-hub' },
                    { icon: <BarChart3 size={16} />, label: 'Analytics & IQAC Reporting', desc: 'Course outcomes, pass %, dashboards', href: '/dashboard' },
                    { icon: <Bell size={16} />, label: 'Notices & Communication', desc: 'Circular, SMS, email, in-app alerts', href: '/notices' },
                    { icon: <Trophy size={16} />, label: 'Student Achievements', desc: 'Awards, extracurriculars, sports records', href: '/student-portal' },
                    { icon: <Globe size={16} />, label: 'Alumni Network', desc: 'Directory, donations, mentorship', href: '/dashboard' },
                ],
            },
        ],
    },
    Modules: {
        sections: [
            {
                heading: 'Core Modules',
                items: [
                    { icon: <LayoutDashboard size={16} />, label: 'Dashboard & Analytics', href: '/dashboard' },
                    { icon: <GraduationCap size={16} />, label: 'Academics & Curriculum', href: '/academic' },
                    { icon: <FileText size={16} />, label: 'Examination Control', href: '/examination' },
                    { icon: <Award size={16} />, label: 'Results & Grading', href: '/examination' },
                    { icon: <ClipboardList size={16} />, label: 'Admit Cards & Forms', href: '/examination' },
                    { icon: <Calendar size={16} />, label: 'Exam Scheduling', href: '/examination' },
                ],
            },
            {
                heading: 'Student Services',
                items: [
                    { icon: <BookMarked size={16} />, label: 'Student Portal', href: '/student-portal' },
                    { icon: <DollarSign size={16} />, label: 'Fee & Scholarship', href: '/dashboard' },
                    { icon: <Bus size={16} />, label: 'Transport & Hostel', href: '/facilities' },
                    { icon: <HeartPulse size={16} />, label: 'Health Center', href: '/facilities' },
                    { icon: <Shield size={16} />, label: 'Grievance Redressal', href: '/grievance' },
                    { icon: <Trophy size={16} />, label: 'Co-curricular Activities', href: '/student-portal' },
                ],
            },
            {
                heading: 'Staff & Admin',
                items: [
                    { icon: <Users size={16} />, label: 'Faculty Directory', href: '/faculty-directory' },
                    { icon: <Briefcase size={16} />, label: 'Placement & Careers', href: '/placement' },
                    { icon: <Microscope size={16} />, label: 'Research Hub', href: '/research-hub' },
                    { icon: <Building2 size={16} />, label: 'Non-Academic Facilities', href: '/facilities' },
                    { icon: <Bell size={16} />, label: 'Notices & Circulars', href: '/notices' },
                    { icon: <BarChart3 size={16} />, label: 'IQAC & Reports', href: '/dashboard' },
                ],
            },
        ],
    },
    Colleges: {
        sections: [
            {
                heading: 'By Type',
                items: [
                    { icon: <School size={16} />, label: 'Autonomous Colleges', href: '/colleges' },
                    { icon: <Landmark size={16} />, label: 'Affiliated Colleges', href: '/colleges' },
                    { icon: <GraduationCap size={16} />, label: 'Deemed Universities', href: '/colleges' },
                    { icon: <Building2 size={16} />, label: 'Institutes of Technology', href: '/colleges' },
                    { icon: <Microscope size={16} />, label: 'Research Institutes', href: '/colleges' },
                    { icon: <Globe size={16} />, label: 'Distance Learning Centers', href: '/colleges' },
                ],
            },
            {
                heading: 'By Stream',
                items: [
                    { icon: <Database size={16} />, label: 'Engineering & Technology', href: '/colleges' },
                    { icon: <HeartPulse size={16} />, label: 'Medical & Pharmacy', href: '/colleges' },
                    { icon: <BarChart3 size={16} />, label: 'Management & Commerce', href: '/colleges' },
                    { icon: <BookOpen size={16} />, label: 'Arts, Science & Humanities', href: '/colleges' },
                    { icon: <Zap size={16} />, label: 'Law & Legal Studies', href: '/colleges' },
                    { icon: <Star size={16} />, label: 'Architecture & Design', href: '/colleges' },
                ],
            },
            {
                heading: 'Quick Access',
                items: [
                    { icon: <MapPin size={16} />, label: 'Find Colleges Near You', href: '/colleges' },
                    { icon: <Trophy size={16} />, label: 'Top Ranked Colleges', href: '/colleges' },
                    { icon: <ExternalLink size={16} />, label: 'Add Your College', href: '/colleges' },
                    { icon: <Settings size={16} />, label: 'College Admin Login', href: '/login' },
                ],
            },
        ],
    },
    Resources: {
        sections: [
            {
                heading: 'Learn',
                items: [
                    { icon: <BookOpen size={16} />, label: 'Documentation & Guides', href: '/dashboard' },
                    { icon: <Video size={16} />, label: 'Video Tutorials', href: '/dashboard' },
                    { icon: <BookMarked size={16} />, label: 'Knowledge Base & FAQs', href: '/dashboard' },
                    { icon: <Download size={16} />, label: 'Brochures & Data Sheets', href: '/dashboard' },
                    { icon: <Wifi size={16} />, label: 'Webinars & Live Sessions', href: '/dashboard' },
                    { icon: <Award size={16} />, label: 'Certification Programs', href: '/dashboard' },
                ],
            },
            {
                heading: 'Support',
                items: [
                    { icon: <HelpCircle size={16} />, label: 'Help Center & Ticketing', href: '/grievance' },
                    { icon: <Phone size={16} />, label: 'Call Support (24/7)', href: '/dashboard' },
                    { icon: <Mail size={16} />, label: 'Email Our Team', href: '/dashboard' },
                    { icon: <Users size={16} />, label: 'Community Forum', href: '/dashboard' },
                    { icon: <Shield size={16} />, label: 'Security & Compliance', href: '/dashboard' },
                    { icon: <Settings size={16} />, label: 'API & Integrations', href: '/dashboard' },
                ],
            },
            {
                heading: 'Company',
                items: [
                    { icon: <Building2 size={16} />, label: 'About All Campus Digital', href: '/dashboard' },
                    { icon: <Briefcase size={16} />, label: 'Careers', href: '/dashboard' },
                    { icon: <Globe size={16} />, label: 'Blog & Case Studies', href: '/dashboard' },
                    { icon: <Phone size={16} />, label: 'Contact Sales', href: '/dashboard' },
                ],
            },
        ],
    },
};

type NavKey = keyof typeof navData;

// ── Mega Dropdown ─────────────────────────────────────────────
const MegaMenu = ({ item }: { item: NavKey }) => {
    const data = navData[item];
    return (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50 w-max max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-xl p-8"
            style={{ minWidth: '680px' }}>
            <div className={`grid gap-8`} style={{ gridTemplateColumns: `repeat(${data.sections.length}, 1fr)` }}>
                {data.sections.map((sec) => (
                    <div key={sec.heading}>
                        <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-100">{sec.heading}</p>
                        <ul className="space-y-1.5">
                            {sec.items.map((it) => (
                                <li key={it.label}>
                                    <Link to={it.href} className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 group transition-all">
                                        <span className="text-slate-400 group-hover:text-slate-900 mt-0.5 flex-shrink-0 transition-colors">{it.icon}</span>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors leading-tight">{it.label}</p>
                                            {'desc' in it && <p className="text-xs font-medium text-slate-500 mt-1 leading-tight">{(it as { desc: string }).desc}</p>}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Nav Item with dropdown ────────────────────────────────────
const NavItem = ({ label }: { label: NavKey }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onClick={() => setOpen(o => !o)}
                className={`text-sm font-bold flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${open ? 'text-slate-900 bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                {label}
                <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
                    <MegaMenu item={label} />
                </div>
            )}
        </div>
    );
};

// ── Static data for rest of page ─────────────────────────────
const features = [
    { icon: <Shield size={24} className="text-slate-700" />, title: 'Zero-Trust Security', desc: 'Bank-grade encryption, strict RBAC, and automated compliance auditing to protect institutional data.' },
    { icon: <Zap size={24} className="text-slate-700" />, title: 'Real-Time Sync', desc: 'Eliminate silos. Instantaneous synchronization across departments, faculties, and global affiliated colleges.' },
    { icon: <Database size={24} className="text-slate-700" />, title: 'Unified Academic Core', desc: 'A single, immutable source of truth for curriculum mapping, examinations, and operational reporting.' },
    { icon: <Globe size={24} className="text-slate-700" />, title: 'Borderless Ecosystem', desc: 'Deploy on-premise or in the cloud. Manage multiple affiliated campuses across different regions effortlessly.' },
];

const stakeholders = [
    { icon: <Landmark size={28} className="text-slate-800" />, title: 'Chancellors & Admins', desc: 'Attain global visibility with real-time analytics, compliance tracking, and absolute governance across all campuses.' },
    { icon: <Briefcase size={28} className="text-slate-800" />, title: 'Faculty & Deans', desc: 'Automate grading, streamline curriculum design, and manage student mentorship without administrative friction.' },
    { icon: <GraduationCap size={28} className="text-slate-800" />, title: 'Students & Alumni', desc: 'Access a deeply personalized portal for grades, classes, e-learning modules, and exclusive placement drives.' }
];

const modules = [
    { icon: <BookOpen size={20} className="text-slate-700" />, label: 'Academics & Core' },
    { icon: <Users size={20} className="text-slate-700" />, label: 'Faculty & HR' },
    { icon: <BarChart3 size={20} className="text-slate-700" />, label: 'Placements & CR' },
    { icon: <FileText size={20} className="text-slate-700" />, label: 'Examinations' },
    { icon: <Globe size={20} className="text-slate-700" />, label: 'College Networks' },
    { icon: <Shield size={20} className="text-slate-700" />, label: 'Compliance & IQAC' },
];

const demoCredentials = {
    university: {
        email: 'rajaditya.addy00@gmail.com',
        password: 'password123',
        label: 'University Admin',
        roleName: 'SUPER_ADMIN',
        icon: <Landmark size={18} />,
        accent: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-950/20',
        border: 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10',
        badge: 'bg-slate-100 text-slate-900 border-slate-200',
        glow: 'from-slate-500/20 via-zinc-500/10 to-neutral-500/20',
        desc: 'Central command for university compliance & operations.',
        roleTitle: 'EMS University Governance'
    },
    college: {
        email: 'adityarajbandhu00@gmail.com',
        password: 'password123',
        label: 'College Console',
        roleName: 'COLLEGE',
        icon: <Building2 size={18} />,
        accent: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
        border: 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        glow: 'from-emerald-500/20 via-teal-500/10 to-green-500/20',
        desc: 'Admin dashboard for affiliated principals & registrars.',
        roleTitle: 'EMS College Administration'
    },
    faculty: {
        email: 'rajaditya.add0@gmail.com',
        password: 'password123',
        label: 'Faculty & Staff',
        roleName: 'PROFESSOR',
        icon: <Users size={18} />,
        accent: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
        border: 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10',
        badge: 'bg-blue-50 text-blue-700 border-blue-100',
        glow: 'from-blue-500/20 via-indigo-500/10 to-cyan-500/20',
        desc: 'Curriculum planner & grading tool for educators.',
        roleTitle: 'EMS Academic Faculty'
    },
    student: {
        email: 'rajad00@gmail.com',
        password: 'password123',
        label: 'Student Portal',
        roleName: 'STUDENT',
        icon: <GraduationCap size={18} />,
        accent: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20',
        border: 'border-slate-200 focus:border-purple-500 focus:ring-purple-500/10',
        badge: 'bg-purple-50 text-purple-700 border-purple-100',
        glow: 'from-purple-500/20 via-violet-500/10 to-fuchsia-500/20',
        desc: 'Personal portal for class records, grades & SWAYAM courses.',
        roleTitle: 'EMS Student Lifecycle'
    }
};

// ── Page ──────────────────────────────────────────────────────
const LandingPage = () => {
    const navigate = useNavigate();
    const { login: performLogin } = useAuth();

    // Toggle between login widget and module grid showcase
    const [activePanel, setActivePanel] = useState<'login' | 'modules'>('login');

    // Quick Login states
    const [loginRole, setLoginRole] = useState<'university' | 'college' | 'faculty' | 'student'>('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const handleRoleChange = (role: 'university' | 'college' | 'faculty' | 'student') => {
        setLoginRole(role);
        setLoginError('');
        setEmail('');
        setPassword('');
    };

    const handleAutoFill = () => {
        const creds = demoCredentials[loginRole];
        setEmail(creds.email);
        setPassword(creds.password);
        setLoginError('');
    };

    const handleQuickLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        if (!email || !password) {
            setLoginError('Please enter both Email/Login ID and Password.');
            return;
        }
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setLoginError(data.msg || 'Invalid credentials. Please check your email and password.');
                setLoading(false);
                return;
            }

            performLogin(data.token, data.user);

            if (data.user.mustChangePassword) {
                navigate('/login');
                return;
            }

            // Route based on role
            if (data.user.role === 'SYSTEM_ADMIN') navigate('/system-admin');
            else if (data.user.role === 'SUPER_ADMIN') navigate('/uni-admin/dashboard');
            else if (data.user.role === 'COLLEGE' || data.user.role === 'COLLEGE_ADMIN') navigate('/college-admin/dashboard');
            else if (data.user.role === 'PROFESSOR' || data.user.role === 'STAFF') navigate('/faculty-dashboard'); 
            else navigate('/student-portal');

        } catch (err) {
            setLoginError('Cannot connect to server. Make sure backend is running on port 5000.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-body text-slate-900 overflow-x-hidden relative selection:bg-slate-200">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3.5 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                            <LibraryBig size={18} color="#ffffff" />
                        </div>
                        <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                            All Campus Digital
                        </span>
                    </div>

                    {/* Nav items */}
                    <div className="hidden md:flex items-center gap-2">
                        {(Object.keys(navData) as NavKey[]).map(item => (
                            <NavItem key={item} label={item} />
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-5">
                        <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                            Sign In
                        </Link>
                        <Link to="/signup" className="text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:-translate-y-0.5 transition-transform hidden sm:block">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <main>
                <section className="relative pt-20 pb-28 lg:pt-32 lg:pb-40 border-b border-slate-100">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 max-w-2xl relative z-10">
                            <div className="inline-flex items-center gap-2.5 mb-8 border border-slate-200 text-slate-600 text-xs font-extrabold uppercase tracking-widest px-4 py-2 rounded-full">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-600"></span>
                                </span>
                                The Operating System for Higher Education
                            </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight">
                                Unify your entire university.<br />
                                Scale without limits.
                            </h1>
                            <p className="text-slate-600 text-xl font-medium leading-relaxed mb-12 max-w-xl">
                                All Campus Digital replaces fragmented legacy systems with a single, intelligent platform. Seamlessly orchestrate academics, examinations, faculty administration, and student success—from a single campus to a global institutional network.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-5">
                                <a href="#pricing" className="flex items-center justify-center px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:-translate-y-1 transition-transform text-lg">
                                    View Pricing Plans
                                </a>
                                <Link to="/login" className="flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:border-slate-300 hover:-translate-y-1 transition-all text-lg">
                                    View Live Demo
                                </Link>
                            </div>
                            <div className="mt-14 flex flex-wrap gap-8 border-t border-slate-200 pt-8">
                                {['No setup fees', '99.9% uptime SLA', '24/7 Priority Support'].map(item => (
                                    <div key={item} className="flex items-center gap-2.5 text-sm text-slate-600 font-extrabold">
                                        <CheckCircle2 size={18} className="text-slate-900" />{item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Direct Access Login Console Panel */}
                        <div className="flex-1 w-full relative z-10 max-w-lg mx-auto lg:max-w-none">
                            <div className="relative w-full border border-slate-200 rounded-[40px] bg-slate-50/70 backdrop-blur-md p-6 sm:p-8 overflow-hidden shadow-xl transition-all duration-500">
                                {/* Ambient Glow Background that changes based on selected role */}
                                <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br ${activePanel === 'login' ? demoCredentials[loginRole].glow : 'from-slate-500/20 to-neutral-500/10'} blur-3xl opacity-60 transition-all duration-1000`} />
                                <div className={`absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-gradient-to-tr ${activePanel === 'login' ? demoCredentials[loginRole].glow : 'from-slate-500/20 to-neutral-500/10'} blur-3xl opacity-60 transition-all duration-1000`} />

                                {/* Panel Switcher (Toggle Pill) */}
                                <div className="relative z-10 flex justify-center mb-6">
                                    <div className="bg-slate-200/60 p-1 rounded-2xl flex gap-1 border border-slate-300/40">
                                        <button
                                            type="button"
                                            onClick={() => setActivePanel('login')}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 ${activePanel === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                        >
                                            <ShieldCheck size={14} /> Secure Portal Login
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActivePanel('modules')}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 ${activePanel === 'modules' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                        >
                                            <LayoutDashboard size={14} /> Explore Modules
                                        </button>
                                    </div>
                                </div>

                                {activePanel === 'login' ? (
                                    /* LOGIN CONSOLE */
                                    <div className="relative z-10 animate-fade-in flex flex-col h-full">
                                        <div className="mb-4 text-center sm:text-left">
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Direct Access Console</h3>
                                            <p className="text-slate-500 text-xs font-semibold">Select your role to sign in instantly.</p>
                                        </div>

                                        {/* Horizontal Tabs */}
                                        <div className="grid grid-cols-4 gap-1.5 mb-5">
                                            {(Object.keys(demoCredentials) as Array<keyof typeof demoCredentials>).map((role) => {
                                                const isActive = loginRole === role;
                                                const cred = demoCredentials[role];
                                                let activeTabStyle = '';
                                                if (role === 'university') activeTabStyle = 'bg-slate-900 text-white shadow-md border-slate-900';
                                                else if (role === 'college') activeTabStyle = 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-md border-emerald-600';
                                                else if (role === 'faculty') activeTabStyle = 'bg-blue-600 text-white shadow-blue-500/20 shadow-md border-blue-600';
                                                else activeTabStyle = 'bg-purple-600 text-white shadow-purple-500/20 shadow-md border-purple-600';

                                                return (
                                                    <button
                                                        key={role}
                                                        type="button"
                                                        onClick={() => handleRoleChange(role)}
                                                        className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border transition-all duration-300 ${
                                                            isActive
                                                                ? activeTabStyle
                                                                : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-600'
                                                        }`}
                                                    >
                                                        <span className="mb-1 shrink-0">{cred.icon}</span>
                                                        <span className="text-[10px] font-black tracking-tight leading-none text-center">
                                                            {role === 'university' ? 'Uni Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Dynamic Premium Role Identity Badge (matching user image spec) */}
                                        <div className="mb-4 py-3.5 px-4 rounded-3xl bg-[#132240] text-white border border-white/10 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                                            {/* Subtle internal abstract circles */}
                                            <div className="absolute -right-4 -top-4 w-12 h-12 rounded-full bg-white/5 animate-pulse" />
                                            <div className="absolute -left-4 -bottom-4 w-12 h-12 rounded-full bg-white/5" />
                                            
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300/80 mb-1.5">YOUR ROLE</span>
                                            <div className="px-6 py-1.5 border border-white/20 rounded-full bg-white/5 text-xs font-bold text-white shadow-inner whitespace-nowrap">
                                                {demoCredentials[loginRole].roleTitle}
                                            </div>
                                        </div>

                                        {/* Helper for credentials */}
                                        <div className="mb-4 bg-white/70 border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between text-xs transition-all duration-300">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${demoCredentials[loginRole].badge}`}>
                                                        {demoCredentials[loginRole].label}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-[11px] font-semibold truncate leading-tight">
                                                    {demoCredentials[loginRole].desc}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAutoFill}
                                                className="shrink-0 ml-2 px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all hover:scale-105"
                                            >
                                                Demo Account
                                            </button>
                                        </div>

                                        {loginError && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                                                <span>{loginError}</span>
                                            </div>
                                        )}

                                        {/* Form */}
                                        <form onSubmit={handleQuickLogin} className="space-y-3.5">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email / Login ID</label>
                                                <div className="relative">
                                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                        {demoCredentials[loginRole].icon}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="name@university.edu or ID"
                                                        className={`w-full h-11 pl-10 pr-4 bg-white/80 border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${demoCredentials[loginRole].border}`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                        <Lock size={16} />
                                                    </span>
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        required
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className={`w-full h-11 pl-10 pr-10 bg-white/80 border rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${demoCredentials[loginRole].border}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className={`w-full h-11 mt-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 ${demoCredentials[loginRole].accent} disabled:opacity-60 disabled:cursor-not-allowed`}
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 size={14} className="animate-spin" />
                                                        Authenticating...
                                                    </>
                                                ) : (
                                                    <>
                                                        Sign In to Portal
                                                        <ArrowRight size={14} />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    /* MODULES SHOWCASE GRID */
                                    <div className="relative z-10 animate-fade-in grid grid-cols-2 gap-4 h-full">
                                        {modules.map((mod, i) => (
                                            <div
                                                key={i}
                                                className={`border border-slate-200 rounded-3xl p-5 flex flex-col gap-3 items-start transition-all hover:bg-slate-100 ${
                                                    i === 1 ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-md shadow-slate-950/20' : 'bg-white'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                                    i === 1 ? 'bg-white/10' : 'bg-slate-50 border border-slate-200 text-slate-900'
                                                }`}>
                                                    {i === 1 ? <BookOpen size={20} className="text-white" /> : mod.icon}
                                                </div>
                                                <span className={`text-xs font-black tracking-tight ${i === 1 ? 'text-white' : 'text-slate-900'}`}>
                                                    {mod.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Built For Every Stakeholder */}
                <section className="py-24 bg-slate-50 border-b border-slate-200 relative">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Built for Every Stakeholder</h2>
                            <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                                A platform that doesn't just digitize records, but actively enhances the day-to-day experience of everyone on campus.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {stakeholders.map((s, i) => (
                                <div key={i} className="text-center group">
                                    <div className="w-20 h-20 mx-auto rounded-3xl bg-white border border-slate-200 flex items-center justify-center mb-8 transition-transform duration-300">
                                        {s.icon}
                                    </div>
                                    <h3 className="text-xl font-extrabold text-slate-900 mb-4 tracking-tight">{s.title}</h3>
                                    <p className="text-slate-600 font-medium leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="max-w-7xl mx-auto px-6 lg:px-12 py-32">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Enterprise-Grade Infrastructure</h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">Architected for security, scale, and interoperability across every institutional workflow.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="p-8 border border-slate-200 rounded-[32px] bg-white hover:border-slate-300 hover:bg-slate-50 transition-all duration-300">
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 border border-slate-200">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900 mb-4 tracking-tight">{f.title}</h3>
                                <p className="text-slate-600 text-sm font-medium leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-32 border-t border-slate-200 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Scalable Infrastructure</h2>
                            <p className="text-slate-600 font-medium max-w-2xl mx-auto text-lg leading-relaxed">Start with a robust foundation that fits your current campus footprint, and scale seamlessly as your student body and affiliations grow.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Starter Plan */}
                            <div className="border border-slate-200 rounded-[32px] bg-white p-10 flex flex-col">
                                <h3 className="text-2xl font-extrabold text-slate-900">Starter Plan</h3>
                                <p className="text-sm font-medium text-slate-500 mt-3 mb-8 leading-relaxed">Ideal for small or emerging standalone colleges.</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-extrabold text-slate-900">Free</span>
                                    <span className="text-slate-400 font-bold"> /year</span>
                                </div>
                                <ul className="space-y-5 mb-12 flex-1">
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> Up to 1,000 Students</li>
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> Core Academic Modules</li>
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> Standard Examination Setup</li>
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> Email Support</li>
                                </ul>
                                <div className="mt-auto space-y-4">
                                    <Link to="/signup?plan=starter&duration=yearly" className="w-full block text-center py-4 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all text-sm">
                                        Select Yearly
                                    </Link>
                                    <Link to="/signup?plan=starter&duration=5year" className="w-full block text-center py-4 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all text-sm">
                                        Select 5 Year
                                    </Link>
                                </div>
                            </div>

                            {/* Autonomous College */}
                            <div className="border-2 border-slate-900 rounded-[32px] bg-white p-10 flex flex-col relative transform md:-translate-y-6 shadow-xl">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white text-[11px] font-extrabold uppercase tracking-widest px-5 py-2 rounded-full">
                                    Most Popular
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-900">Autonomous College</h3>
                                <p className="text-sm font-medium text-slate-500 mt-3 mb-8 leading-relaxed">For established mid-sized universities and institutes.</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-extrabold text-slate-900">$2,499</span>
                                    <span className="text-slate-400 font-bold"> /year</span>
                                </div>
                                <ul className="space-y-5 mb-12 flex-1">
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> Up to 5,000 Students</li>
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> All Core & Advanced Modules</li>
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> Placements & Alumni Network</li>
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> Real-time Analytics Dashboard</li>
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> Priority 24/7 Support</li>
                                </ul>
                                <div className="mt-auto space-y-4">
                                    <Link to="/signup?plan=autonomous&duration=yearly" className="w-full block text-center py-4 rounded-2xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all text-sm">
                                        Select Yearly
                                    </Link>
                                    <Link to="/signup?plan=autonomous&duration=5year" className="w-full block text-center py-4 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all text-sm">
                                        Select 5 Year
                                    </Link>
                                </div>
                            </div>

                            {/* Enterprise Plan */}
                            <div className="border border-slate-200 rounded-[32px] bg-white p-10 flex flex-col">
                                <h3 className="text-2xl font-extrabold text-slate-900">Enterprises</h3>
                                <p className="text-sm font-medium text-slate-500 mt-3 mb-8 leading-relaxed">For massive multi-campus university ecosystems.</p>
                                <div className="mb-8">
                                    <span className="text-5xl font-extrabold text-slate-900">Custom</span>
                                </div>
                                <ul className="space-y-5 mb-12 flex-1">
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> Unlimited Students</li>
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> Full Suite Access</li>
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> Custom API Integrations</li>
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> Dedicated Account Manager</li>
                                    <li className="flex gap-4 text-sm font-bold text-slate-700"><CheckCircle2 size={20} className="text-slate-900 flex-shrink-0" /> On-Premise Deployment Option</li>
                                </ul>
                                <div className="mt-auto">
                                    <Link to="/signup?plan=enterprise&duration=custom" className="w-full block text-center py-4 rounded-2xl bg-white border-2 border-slate-200 text-slate-900 font-extrabold hover:bg-slate-50 transition-all text-sm">
                                        Contact Sales Team
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-slate-900 border-t border-slate-800">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-32 text-center relative z-10">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 tracking-tight">Empower your campus with a unified operating system.</h2>
                        <p className="text-slate-400 font-medium mb-12 max-w-3xl mx-auto text-xl leading-relaxed">Eliminate data silos, automate administrative workflows, and deliver a frictionless digital experience for your students and faculty. Deploy your entire institutional infrastructure in weeks, not years.</p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                            <Link to="/signup" className="inline-block px-12 py-5 bg-white text-slate-900 font-extrabold text-lg rounded-2xl hover:-translate-y-1 transition-transform">
                                Request Enterprise Access
                            </Link>
                            <Link to="/login" className="inline-block px-12 py-5 border border-slate-700 text-white font-extrabold text-lg rounded-2xl hover:bg-slate-800 hover:-translate-y-1 transition-transform">
                                Sign In to Portal
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-white py-12 text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <LibraryBig size={20} className="text-slate-400" />
                    <span className="text-lg font-extrabold text-slate-400 tracking-tight">All Campus Digital</span>
                </div>
                <p className="text-slate-500 text-sm font-bold tracking-wide">© {new Date().getFullYear()} All Campus Digital System. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;

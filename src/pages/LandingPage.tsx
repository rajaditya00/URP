import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChevronRight, Shield, Globe, Zap, Database, LibraryBig, CheckCircle2,
    BookOpen, Users, BarChart3, FileText, GraduationCap, Building2,
    Calendar, Award, ClipboardList, Microscope, DollarSign, Bus,
    HeartPulse, Wifi, LayoutDashboard, Bell, Settings, HelpCircle,
    BookMarked, Video, Download, Phone, Mail, MapPin, ExternalLink,
    ChevronDown, School, Landmark, Trophy, Briefcase, Star,
} from 'lucide-react';

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
                    { icon: <Building2 size={16} />, label: 'About Lumina URP', href: '/dashboard' },
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
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-max max-w-5xl bg-white border border-border-color rounded-xl shadow-2xl p-6"
            style={{ minWidth: '680px' }}>
            <div className={`grid gap-8`} style={{ gridTemplateColumns: `repeat(${data.sections.length}, 1fr)` }}>
                {data.sections.map((sec) => (
                    <div key={sec.heading}>
                        <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 pb-2 border-b border-border-color">{sec.heading}</p>
                        <ul className="space-y-1">
                            {sec.items.map((it) => (
                                <li key={it.label}>
                                    <Link to={it.href} className="w-full text-left flex items-start gap-2.5 px-2 py-2 rounded-md hover:bg-[#f0f6ff] group transition-colors">
                                        <span className="text-text-muted group-hover:text-accent-primary mt-0.5 flex-shrink-0 transition-colors">{it.icon}</span>
                                        <div>
                                            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors leading-tight">{it.label}</p>
                                            {'desc' in it && <p className="text-xs text-text-muted mt-0.5 leading-tight">{(it as { desc: string }).desc}</p>}
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
                className={`text-sm font-medium flex items-center gap-1 px-1 py-2 transition-colors ${open ? 'text-accent-primary' : 'text-text-secondary hover:text-accent-primary'}`}>
                {label}
                <ChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
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
    { icon: <Shield size={22} className="text-accent-primary" />, title: 'Enterprise Security', desc: 'Bank-grade encryption protecting sensitive student and faculty data.' },
    { icon: <Zap size={22} className="text-accent-primary" />, title: 'Real-Time Sync', desc: 'Instant updates across all departments, faculties, and affiliated colleges.' },
    { icon: <Database size={22} className="text-accent-primary" />, title: 'Unified Data', desc: 'A single source of truth for academics, finance, and operations.' },
    { icon: <Globe size={22} className="text-accent-primary" />, title: 'Global Access', desc: 'Manage your entire university ecosystem from anywhere in the world.' },
];

const modules = [
    { icon: <BookOpen size={20} className="text-accent-primary" />, label: 'Academics' },
    { icon: <Users size={20} className="text-accent-primary" />, label: 'Faculty Directory' },
    { icon: <BarChart3 size={20} className="text-accent-primary" />, label: 'Placements' },
    { icon: <FileText size={20} className="text-accent-primary" />, label: 'Examinations' },
    { icon: <Globe size={20} className="text-accent-primary" />, label: 'Colleges' },
    { icon: <Shield size={20} className="text-accent-primary" />, label: 'Grievances' },
];

// ── Page ──────────────────────────────────────────────────────
const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg-primary font-body text-text-primary overflow-x-hidden">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border-color">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3.5 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center">
                            <LibraryBig size={18} color="#ffffff" />
                        </div>
                        <span className="text-lg font-bold text-text-primary tracking-tight">
                            Lumina <span className="text-accent-primary font-medium">URP</span>
                        </span>
                    </div>

                    {/* Nav items */}
                    <div className="hidden md:flex items-center gap-1">
                        {(Object.keys(navData) as NavKey[]).map(item => (
                            <NavItem key={item} label={item} />
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors px-3 py-2">
                            Sign In
                        </Link>
                        <Link to="/signup" className="px-4 py-2 rounded-md bg-accent-primary text-white text-sm font-semibold hover:bg-[#1661a3] transition-colors shadow-sm">
                            Sign up now
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <main>
                <section className="bg-bg-secondary border-b border-border-color">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 max-w-2xl">
                            <div className="inline-flex items-center gap-2 mb-6 border border-accent-primary/30 bg-accent-primary/5 text-accent-primary text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary inline-block"></span>
                                University Resource Planning v2.0
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-text-primary leading-tight mb-6">
                                University resource planning,<br />
                                <span className="text-accent-primary">mapped to real operations</span>
                            </h1>
                            <p className="text-text-secondary text-lg leading-relaxed mb-10 max-w-xl">
                                Lumina URP is structured around the actual sequence of university operations, supporting each stage from student enrollment and planning through examination, quality control, and placement.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/signup" className="flex items-center justify-center px-7 py-3 rounded-md bg-accent-primary text-white font-semibold hover:bg-[#1661a3] transition-colors shadow-sm">
                                    Get started free
                                </Link>
                                <button className="px-7 py-3 rounded-md border border-border-highlight text-text-primary font-semibold hover:bg-bg-tertiary transition-colors">
                                    View demo
                                </button>
                            </div>
                            <div className="mt-10 flex flex-wrap gap-6">
                                {['No setup fees', '99.9% uptime SLA', '24/7 Support'].map(item => (
                                    <div key={item} className="flex items-center gap-2 text-sm text-text-secondary font-medium">
                                        <CheckCircle2 size={16} className="text-status-success" />{item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Module grid panel */}
                        <div className="flex-1 w-full hidden lg:block">
                            <div className="relative w-full aspect-[4/3] border border-border-color rounded-lg bg-bg-primary shadow-sm p-6 overflow-hidden">
                                <div className="grid grid-cols-3 gap-4 h-full">
                                    {modules.map((mod, i) => (
                                        <div key={i} className={`border border-border-color rounded-md p-4 flex flex-col gap-3 items-start ${i === 1 ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-primary'}`}>
                                            <div className={`w-8 h-8 rounded flex items-center justify-center ${i === 1 ? 'bg-white/20' : 'bg-bg-secondary border border-border-color'}`}>
                                                {i === 1 ? <BookOpen size={16} className="text-white" /> : mod.icon}
                                            </div>
                                            <span className={`text-xs font-bold ${i === 1 ? 'text-white' : 'text-text-secondary'}`}>{mod.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 border-b border-border-color">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-text-primary mb-4">Everything you need to manage a university</h2>
                        <p className="text-text-secondary max-w-xl mx-auto">One centralized platform for all departments, role levels, and institutional workflows.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="p-6 border border-border-color rounded-lg bg-bg-primary hover:border-accent-primary/40 hover:shadow-sm transition-all group">
                                <div className="w-10 h-10 rounded-md border border-border-color bg-bg-secondary flex items-center justify-center mb-5 group-hover:border-accent-primary/30 transition-colors">
                                    {f.icon}
                                </div>
                                <h3 className="text-base font-bold text-text-primary mb-2">{f.title}</h3>
                                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-accent-primary">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Ready to digitize your university?</h2>
                        <p className="text-white/80 mb-8 max-w-lg mx-auto">Join hundreds of institutions already using Lumina URP to streamline their operations.</p>
                        <Link to="/signup" className="inline-block px-8 py-3.5 bg-white text-accent-primary font-bold rounded-md hover:bg-bg-secondary transition-colors shadow-sm">
                            Sign in to your portal
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border-color bg-bg-primary py-8 text-center text-text-muted text-sm">
                <p>© {new Date().getFullYear()} Lumina URP System. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;

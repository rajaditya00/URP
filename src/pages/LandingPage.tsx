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

// ── Page ──────────────────────────────────────────────────────
const LandingPage = () => {
    const navigate = useNavigate();

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

                        {/* Module grid panel */}
                        <div className="flex-1 w-full hidden lg:block relative z-10">
                            <div className="relative w-full aspect-[4/3] border border-slate-200 rounded-[40px] bg-slate-50 p-10 overflow-hidden">
                                <div className="grid grid-cols-3 gap-6 h-full">
                                    {modules.map((mod, i) => (
                                        <div key={i} className={`border border-slate-200 rounded-3xl p-6 flex flex-col gap-4 items-start transition-all hover:bg-slate-100 ${i === 1 ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800' : 'bg-white'}`}>
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${i === 1 ? 'bg-white/10' : 'bg-slate-50 border border-slate-200 text-slate-900'}`}>
                                                {i === 1 ? <BookOpen size={24} className="text-white" /> : mod.icon}
                                            </div>
                                            <span className={`text-sm font-extrabold tracking-tight ${i === 1 ? 'text-white' : 'text-slate-900'}`}>{mod.label}</span>
                                        </div>
                                    ))}
                                </div>
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

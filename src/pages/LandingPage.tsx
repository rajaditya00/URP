import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Shield, Globe, Zap, Database, LibraryBig, CheckCircle2,
    BookOpen, Users, BarChart3, FileText, GraduationCap, Building2,
    LayoutDashboard, Landmark, Briefcase, Lock, ShieldCheck, Loader2, ArrowRight,
    Eye, EyeOff, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';



// ── Static data for rest of page ─────────────────────────────
const features = [
    { icon: <Shield size={24} className="text-slate-700" />, title: 'Zero-Plagiarism Banking', desc: 'Analyze every uploaded question in real-time. Automatically detect duplicates against cross-institutional past exam paper repositories using browser-based NLP.' },
    { icon: <Layers size={24} className="text-slate-700" />, title: 'Dynamic Credit Mapping', desc: 'Map question uniqueness automatically to credit difficulty levels (1-5) using Cosine Similarity thresholds, optimizing the academic rigor of exam papers.' },
    { icon: <Zap size={24} className="text-slate-700" />, title: 'Client-Side SGD Training', desc: 'Perform Stochastic Gradient Descent (SGD) neural weight updates directly in the browser. Train custom term datasets to refine classification accuracy.' },
    { icon: <Globe size={24} className="text-slate-700" />, title: 'Unified Board Control', desc: 'Consolidate controllers, deans, and professors into a single, cohesive moderation workflow. Audit, generate, and print certified question papers.' },
];

const stakeholders = [
    { icon: <Landmark size={28} className="text-slate-800" />, title: 'University Board & Controllers', desc: 'Monitor master question banks, inspect similarity indexes, audit institutional academic rigor, and control exam paper generation across all affiliated colleges.' },
    { icon: <Briefcase size={28} className="text-slate-800" />, title: 'Professors & Paper Setters', desc: 'Upload custom questions, perform real-time ML novelty checking, train custom NLP weight datasets, and print complete verified question papers.' },
    { icon: <GraduationCap size={28} className="text-slate-800" />, title: 'Students & Candidates', desc: 'Access secure portals, download verified admit cards, take interactive e-learning modules, and view real-time credit transcripts.' }
];

const modules = [
    { icon: <BookOpen size={20} className="text-slate-700" />, label: 'Academics & Core' },
    { icon: <Users size={20} className="text-slate-700" />, label: 'Faculty Console' },
    { icon: <BarChart3 size={20} className="text-slate-700" />, label: 'ML Novelty Predictor' },
    { icon: <FileText size={20} className="text-slate-700" />, label: 'Examinations' },
    { icon: <Globe size={20} className="text-slate-700" />, label: 'College Networks' },
    { icon: <Shield size={20} className="text-slate-700" />, label: 'AI Question Moderator' },
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
        desc: 'Central command for university compliance & operations.'
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
        desc: 'Admin dashboard for affiliated principals & registrars.'
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
        desc: 'Curriculum planner & grading tool for educators.'
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
        desc: 'Personal portal for class records, grades & SWAYAM courses.'
    }
};

// ── Page ──────────────────────────────────────────────────────
const LandingPage = () => {
    const navigate = useNavigate();
    const { login: performLogin } = useAuth();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

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

        // --- INSTANT FRONTEND DEMO CREDENTIALS BYPASS ---
        // Bypasses the frozen backend entirely for pre-configured demo logins to guarantee immediate success.
        const normalizedEmail = email.trim().toLowerCase();
        const matchedRole = (Object.keys(demoCredentials) as Array<keyof typeof demoCredentials>).find(
            role => demoCredentials[role].email.toLowerCase() === normalizedEmail && demoCredentials[role].password === password
        );

        if (matchedRole) {
            const cred = demoCredentials[matchedRole];
            let actualRole = cred.roleName;
            let name = cred.label;
            
            const mockUser = {
                id: `mock-${actualRole.toLowerCase()}-id`,
                name: name + ' Demo User',
                email: normalizedEmail,
                role: actualRole as any,
                university: {
                    _id: 'mock-uni-id',
                    name: 'All Campus Digital University',
                    logoUrl: '',
                    introduction: 'A premier educational institution dedicated to excellence.',
                    phone: '+91 9876543210',
                    address: 'Institutional Area, New Delhi, India',
                    viceChancellor: {
                        name: 'Prof. S. R. Sen',
                        email: 'vc@acd.edu',
                        message: 'Welcome to the digital university command center.'
                    }
                },
                college: {
                    _id: 'mock-college-id',
                    name: 'College of Engineering & Technology',
                    email: 'principal@cet.edu'
                }
            };

            performLogin(`mock-jwt-token-${actualRole.toLowerCase()}`, mockUser);
            
            // Route based on role
            if (actualRole === 'SYSTEM_ADMIN') navigate('/system-admin');
            else if (actualRole === 'SUPER_ADMIN') navigate('/uni-admin/dashboard');
            else if (actualRole === 'COLLEGE' || actualRole === 'COLLEGE_ADMIN') navigate('/college-admin/dashboard');
            else if (actualRole === 'PROFESSOR' || actualRole === 'STAFF') navigate('/faculty-dashboard');
            else navigate('/student-portal');
            
            setLoading(false);
            return;
        }

        // --- LIVE BACKEND AUTHENTICATION (Fallback) ---
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
                setActivePanel('login');
                scrollToSection('portal-console');
                setLoading(false);
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

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <button
                            onClick={() => scrollToSection('features')}
                            className="text-sm font-extrabold text-slate-600 hover:text-slate-900 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-slate-900 hover:after:w-full after:transition-all after:duration-300"
                        >
                            ML Features
                        </button>
                        <button
                            onClick={() => scrollToSection('stakeholders')}
                            className="text-sm font-extrabold text-slate-600 hover:text-slate-900 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-slate-900 hover:after:w-full after:transition-all after:duration-300"
                        >
                            Stakeholders
                        </button>
                        <button
                            onClick={() => {
                                setActivePanel('modules');
                                scrollToSection('portal-console');
                            }}
                            className="text-sm font-extrabold text-slate-600 hover:text-slate-900 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-slate-900 hover:after:w-full after:transition-all after:duration-300"
                        >
                            ML Engine & Modules
                        </button>
                        <button
                            onClick={() => {
                                setActivePanel('login');
                                scrollToSection('portal-console');
                            }}
                            className="text-sm font-extrabold text-slate-600 hover:text-slate-900 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-slate-900 hover:after:w-full after:transition-all after:duration-300"
                        >
                            Secure Portal
                        </button>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => {
                                setActivePanel('login');
                                scrollToSection('portal-console');
                            }}
                            className="text-sm font-extrabold text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Sign In
                        </button>
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
                                POWERED BY INTUITIVE NLP & VECTOR SPACE ML
                            </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight">
                                Intelligent Question Banks.<br />
                                Driven by Neural ML.
                            </h1>
                            <p className="text-slate-600 text-xl font-medium leading-relaxed mb-6 max-w-xl">
                                All Campus Digital introduces a revolutionary exam management ecosystem. Securely build master question banks, detect question repeats against past year papers (PYQ) via TF-IDF cosine similarity, and map novelty to credit levels (1-5) automatically. Empower your faculty with client-side NLP classifiers and neural training loops to enforce academic integrity across your entire institutional network.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-8 border-t border-slate-200 pt-8">
                                {['NLP Similarity Indexing', 'Dynamic Credit Classification', 'Client-Side SGD Training'].map(item => (
                                    <div key={item} className="flex items-center gap-2.5 text-sm text-slate-600 font-extrabold">
                                        <CheckCircle2 size={18} className="text-slate-900" />{item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Direct Access Login Console Panel */}
                        <div id="portal-console" className="flex-1 w-full relative z-10 max-w-lg mx-auto lg:max-w-none">
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
                                                        className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border transition-all duration-300 ${isActive
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
                                                className={`border border-slate-200 rounded-3xl p-5 flex flex-col gap-3 items-start transition-all hover:bg-slate-100 ${i === 1 ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-md shadow-slate-950/20' : 'bg-white'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${i === 1 ? 'bg-white/10' : 'bg-slate-50 border border-slate-200 text-slate-900'
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
                <section id="stakeholders" className="py-24 bg-slate-50 border-b border-slate-200 relative">
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
                <section id="features" className="max-w-7xl mx-auto px-6 lg:px-12 py-32">
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

                {/* Final CTA */}
                <section className="bg-slate-900 py-24 text-center">
                    <div className="max-w-4xl mx-auto px-6">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 tracking-tight">Ready to Unify Your Campus?</h2>
                        <div className="flex justify-center items-center gap-6">
                            <button
                                onClick={() => {
                                    setActivePanel('login');
                                    scrollToSection('portal-console');
                                }}
                                className="inline-block px-12 py-5 bg-white text-slate-900 font-extrabold text-lg rounded-2xl hover:-translate-y-1 transition-transform shadow-xl"
                            >
                                Sign In to Portal
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-white py-12 text-center border-t border-slate-200">
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

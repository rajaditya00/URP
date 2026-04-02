import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    LibraryBig, GraduationCap, Building2, UserCircle2, ArrowRight,
    ShieldCheck, Mail, Lock, ChevronLeft, BookOpen, BarChart3, FileText, Users
} from 'lucide-react';

type LoginTier = 'Admin' | 'College' | 'Staff' | 'Student' | null;

const tiers = [
    {
        id: 'Admin' as LoginTier,
        icon: <ShieldCheck size={24} className="text-accent-primary" />,
        title: 'University Admin',
        desc: 'Supreme access for managing affiliated colleges and university-wide data.',
        tag: 'Top-level',
    },
    {
        id: 'College' as LoginTier,
        icon: <Building2 size={24} className="text-accent-primary" />,
        title: 'College Console',
        desc: 'Portal for Principals and Registrars to manage institutional operations.',
        tag: 'Institutional',
    },
    {
        id: 'Staff' as LoginTier,
        icon: <UserCircle2 size={24} className="text-accent-primary" />,
        title: 'Faculty & Staff',
        desc: 'Portal for HODs, Professors, and Examination Controllers.',
        tag: 'Role-based',
    },
    {
        id: 'Student' as LoginTier,
        icon: <GraduationCap size={24} className="text-accent-primary" />,
        title: 'Student Portal',
        desc: 'Personalized dashboard for timetables, grades, and campus services.',
        tag: 'Student',
    },
];

const highlights = [
    { icon: <BookOpen size={18} />, label: 'Academics & Curriculum' },
    { icon: <FileText size={18} />, label: 'Examinations & Results' },
    { icon: <BarChart3 size={18} />, label: 'Placements & Internships' },
    { icon: <Users size={18} />, label: 'Faculty & Staff Directory' },
];

const LoginPortal = () => {
    const [selectedTier, setSelectedTier] = useState<LoginTier>(null);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex font-body">

            {/* Left Panel — Brand Illustration */}
            <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-accent-primary flex-col justify-between p-12 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-bg-tertiary pointer-events-none"></div>
                <div className="absolute -bottom-32 -right-20 w-[30rem] h-[30rem] rounded-full bg-bg-tertiary pointer-events-none"></div>

                <Link to="/" className="flex items-center gap-3 z-10 relative">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                        <LibraryBig size={20} className="text-accent-primary" />
                    </div>
                    <span className="text-white text-xl font-bold tracking-tight">CampusCore <span className="font-light opacity-80">URP</span></span>
                </Link>

                <div className="z-10 relative">
                    <h2 className="text-white text-4xl font-bold leading-tight mb-6">
                        Introducing<br />
                        <span className="font-light opacity-90">a new era of</span><br />
                        University Management
                    </h2>
                    <p className="text-white/70 text-base leading-relaxed mb-10 max-w-sm">
                        Engineered for universities starting with a single campus or scaling across the country. One platform. Every operation.
                    </p>

                    <div className="space-y-3">
                        {highlights.map((h, i) => (
                            <div key={i} className="flex items-center gap-3 text-white/80 text-sm font-medium">
                                <div className="w-8 h-8 rounded-md bg-bg-tertiary/80 flex items-center justify-center flex-shrink-0">
                                    {h.icon}
                                </div>
                                {h.label}
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-white/40 text-xs z-10 relative">© {new Date().getFullYear()} CampusCore URP System</p>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex flex-col bg-bg-primary">
                {/* Top bar */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-border-color lg:hidden">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center">
                            <LibraryBig size={18} color="#fff" />
                        </div>
                        <span className="font-bold text-text-primary">CampusCore URP</span>
                    </Link>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
                    {!selectedTier ? (
                        /* Tier Selection */
                        <div className="w-full max-w-lg animate-slide-up">
                            <div className="mb-10">
                                <h1 className="text-3xl font-bold text-text-primary mb-2">Select your portal</h1>
                                <p className="text-text-secondary">Choose your access level to sign in.</p>
                            </div>

                            <div className="space-y-3">
                                {tiers.map(tier => (
                                    <button
                                        key={tier.id}
                                        onClick={() => setSelectedTier(tier.id)}
                                        className="w-full flex items-center gap-5 p-5 border border-border-color rounded-lg bg-bg-primary hover:border-accent-primary hover:bg-bg-secondary transition-all text-left group"
                                    >
                                        <div className="w-11 h-11 rounded-md border border-border-color bg-bg-secondary flex items-center justify-center flex-shrink-0 group-hover:border-accent-primary/30 transition-colors">
                                            {tier.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-semibold text-text-primary text-sm">{tier.title}</span>
                                                <span className="text-[10px] font-bold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-sm uppercase tracking-wider">{tier.tag}</span>
                                            </div>
                                            <p className="text-text-secondary text-xs leading-relaxed">{tier.desc}</p>
                                        </div>
                                        <ArrowRight size={16} className="text-text-muted group-hover:text-accent-primary flex-shrink-0 transition-colors" />
                                    </button>
                                ))}
                            </div>

                            <p className="mt-8 text-center text-text-secondary text-sm">
                                Need help?{' '}
                                <a href="#" className="text-accent-primary font-semibold hover:underline">Contact your administrator</a>
                            </p>
                        </div>
                    ) : (
                        /* Login Form */
                        <div className="w-full max-w-md animate-slide-up">
                            <button
                                onClick={() => setSelectedTier(null)}
                                className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 text-sm font-medium transition-colors"
                            >
                                <ChevronLeft size={16} /> Back to portal selection
                            </button>

                            <div className="mb-8">
                                <div className="mb-5">
                                    {tiers.find(t => t.id === selectedTier)?.icon}
                                </div>
                                <h2 className="text-2xl font-bold text-text-primary mb-1">
                                    {tiers.find(t => t.id === selectedTier)?.title}
                                </h2>
                                <p className="text-text-secondary text-sm">Sign in to access your dashboard.</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-1.5">Email address *</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="name@university.edu"
                                            className="w-full pl-10 pr-4 py-3 border border-border-color rounded-md text-text-primary text-sm bg-bg-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-sm font-semibold text-text-primary">Password *</label>
                                        <a href="#" className="text-xs text-accent-primary hover:underline font-medium">Forgot password?</a>
                                    </div>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-4 py-3 border border-border-color rounded-md text-text-primary text-sm bg-bg-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-colors"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-md bg-accent-primary text-white font-semibold text-sm hover:bg-[#1661a3] transition-colors shadow-sm"
                                >
                                    Sign In
                                </button>

                                <p className="text-center text-xs text-text-muted pt-2 flex items-center justify-center gap-1.5">
                                    <ShieldCheck size={13} className="text-status-success" />
                                    Secured by CampusCore Enterprise Security
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPortal;

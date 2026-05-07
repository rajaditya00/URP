import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LibraryBig, GraduationCap, Building2, UserCircle2, ArrowRight,
    ShieldCheck, Mail, Lock, ChevronLeft, BookOpen, BarChart3, FileText, Users
} from 'lucide-react';

type LoginTier = 'Admin' | 'College' | 'Staff' | 'Student' | null;

const tiers = [
    {
        id: 'Admin' as LoginTier,
        icon: <ShieldCheck className="w-6 h-6 text-[#0f172a]" />,
        title: 'University Admin',
        desc: 'Supreme access for managing affiliated colleges and university-wide data.',
        tag: 'Top-level',
        theme: {
            btn: 'bg-gradient-to-r from-[#0f172a] to-[#334155] shadow-slate-900/30 hover:shadow-slate-900/40 hover:from-[#020617] hover:to-[#1e293b]',
            text: 'text-[#0f172a]',
            ring: 'focus:ring-[#0f172a]/20 focus:border-[#0f172a]',
            iconBg: 'bg-slate-100',
            tagBg: 'bg-slate-100 text-[#0f172a]'
        },
        highlights: [
            { icon: <ShieldCheck className="w-5 h-5" />, label: 'Secure Governance' },
            { icon: <Building2 className="w-5 h-5" />, label: 'Affiliated College Oversight' },
            { icon: <BarChart3 className="w-5 h-5" />, label: 'System-wide Analytics' },
        ]
    },
    {
        id: 'College' as LoginTier,
        icon: <Building2 className="w-6 h-6 text-[#059669]" />,
        title: 'College Console',
        desc: 'Portal for Principals and Registrars to manage institutional operations.',
        tag: 'Institutional',
        theme: {
            btn: 'bg-gradient-to-r from-[#059669] to-[#047857] shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:from-[#047857] hover:to-[#065f46]',
            text: 'text-[#059669]',
            ring: 'focus:ring-[#059669]/20 focus:border-[#059669]',
            iconBg: 'bg-emerald-50',
            tagBg: 'bg-emerald-100 text-[#059669]'
        },
        highlights: [
            { icon: <Users className="w-5 h-5" />, label: 'Faculty & Student Management' },
            { icon: <FileText className="w-5 h-5" />, label: 'Department Coordination' },
            { icon: <BookOpen className="w-5 h-5" />, label: 'Academic Administration' },
        ]
    },
    {
        id: 'Staff' as LoginTier,
        icon: <UserCircle2 className="w-6 h-6 text-[#2563eb]" />,
        title: 'Faculty & Staff',
        desc: 'Portal for HODs, Professors, and Examination Controllers.',
        tag: 'Role-based',
        theme: {
            btn: 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] shadow-blue-500/30 hover:shadow-blue-500/40 hover:from-[#1d4ed8] hover:to-[#1e3a8a]',
            text: 'text-[#2563eb]',
            ring: 'focus:ring-[#2563eb]/20 focus:border-[#2563eb]',
            iconBg: 'bg-blue-50',
            tagBg: 'bg-blue-100 text-[#2563eb]'
        },
        highlights: [
            { icon: <BookOpen className="w-5 h-5" />, label: 'Course & Curriculum Design' },
            { icon: <FileText className="w-5 h-5" />, label: 'Result & Examination Processing' },
            { icon: <Users className="w-5 h-5" />, label: 'Student Mentorship' },
        ]
    },
    {
        id: 'Student' as LoginTier,
        icon: <GraduationCap className="w-6 h-6 text-[#7c3aed]" />,
        title: 'Student Portal',
        desc: 'Personalized dashboard for timetables, grades, and campus services.',
        tag: 'Student',
        theme: {
            btn: 'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] shadow-purple-500/30 hover:shadow-purple-500/40 hover:from-[#6d28d9] hover:to-[#4c1d95]',
            text: 'text-[#7c3aed]',
            ring: 'focus:ring-[#7c3aed]/20 focus:border-[#7c3aed]',
            iconBg: 'bg-purple-50',
            tagBg: 'bg-purple-100 text-[#7c3aed]'
        },
        highlights: [
            { icon: <BookOpen className="w-5 h-5" />, label: 'Timetables & E-Learning' },
            { icon: <FileText className="w-5 h-5" />, label: 'Grades & Academic Records' },
            { icon: <LibraryBig className="w-5 h-5" />, label: 'Campus Services' },
        ]
    },
];

const highlights = [
    { icon: <BookOpen className="w-5 h-5" />, label: 'Academics & Curriculum' },
    { icon: <FileText className="w-5 h-5" />, label: 'Examinations & Results' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Placements & Internships' },
    { icon: <Users className="w-5 h-5" />, label: 'Faculty & Staff Directory' },
];

const LoginPortal = () => {
    const [selectedTier, setSelectedTier] = useState<LoginTier>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Forgot password states
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpToken, setOtpToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const activeTheme = selectedTier ? tiers.find(t => t.id === selectedTier)?.theme : null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.msg || 'Invalid credentials. Please check your email and password.');
                setLoading(false);
                return;
            }

            login(data.token, data.user);
            
            // Route based on role
            if (data.user.role === 'SUPER_ADMIN') navigate('/uni-admin/dashboard');
            else if (data.user.role === 'COLLEGE' || data.user.role === 'COLLEGE_ADMIN') navigate('/college-admin/dashboard');
            else navigate('/student-portal');
            
        } catch (err) {
            setError('Cannot connect to server. Make sure the backend is running on port 5000.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (!email) return setError('Please enter your email address to reset your password.');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.msg);
            } else {
                setSuccessMsg(data.msg);
                setOtpSent(true);
            }
        } catch (err) {
            setError('Cannot connect to server.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (newPassword !== confirmNewPassword) return setError('New passwords do not match.');
        if (newPassword.length < 6) return setError('New password must be at least 6 characters.');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpToken, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.msg);
            } else {
                setSuccessMsg(data.msg);
                setOtpSent(false);
                setIsForgotPassword(false);
                setOtpToken('');
                setNewPassword('');
                setConfirmNewPassword('');
                setPassword('');
            }
        } catch (err) {
            setError('Cannot connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen font-body flex items-center justify-center p-4 sm:p-8 bg-[#f4f4f5] relative overflow-hidden">
            {/* Decorative Ambient Background */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-cyan-500/20 blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/4"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-blue-500/20 via-indigo-500/20 to-cyan-500/20 blur-3xl opacity-60 translate-x-1/3 translate-y-1/3"></div>

            {/* Main Application Container */}
            <div className="flex w-full max-w-[1100px] bg-white rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] overflow-hidden relative z-10 min-h-[650px] border border-slate-100/50">
                
                {/* Left Branding Panel */}
                <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-[#0a2540] to-[#1e3a5f] p-10 flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
                    
                    <Link to="/" className="relative z-10 flex items-center gap-2.5 mb-10 opacity-80 hover:opacity-100 transition-opacity w-fit">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white/20 backdrop-blur-md">
                            <LibraryBig className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white text-sm font-bold tracking-widest uppercase">All Campus Digital</span>
                    </Link>
                    
                    <div className="relative z-10 flex-1 flex flex-col justify-center">
                        <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight drop-shadow-sm">
                            Unify your campus.<br/>
                            <span className="text-blue-300">Empower your institution.</span>
                        </h2>
                        <p className="text-white/80 text-sm font-medium tracking-wide leading-relaxed max-w-sm mb-12">
                            A centralized, intelligent platform designed to seamlessly scale from a single college campus to a nationwide university network. One unified system. Every operation.
                        </p>

                        <div className="space-y-4">
                            {(selectedTier ? tiers.find(t => t.id === selectedTier)?.highlights : highlights)?.map((h, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors shadow-sm">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner text-blue-300">
                                        {h.icon}
                                    </div>
                                    <div className="flex items-center h-10">
                                        <h3 className="text-white font-semibold text-sm">{h.label}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel — Form */}
                <div className="flex-1 flex flex-col p-8 sm:p-12 relative bg-white overflow-y-auto">
                    {/* Top bar for mobile */}
                    <div className="flex items-center justify-between mb-8 lg:hidden">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center shadow-md">
                                <LibraryBig size={18} color="#fff" />
                            </div>
                            <span className="font-bold text-slate-800 tracking-tight">All Campus Digital</span>
                        </Link>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
                        {!selectedTier ? (
                            /* Tier Selection */
                            <div className="w-full animate-fade-in">
                                <div className="mb-8 text-center sm:text-left">
                                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Select your portal</h1>
                                    <p className="text-slate-500 text-sm font-medium">Choose your access level to sign in with your issued credentials.</p>
                                </div>

                                <div className="space-y-3">
                                    {tiers.map(tier => (
                                        <button
                                            key={tier.id}
                                            onClick={() => { setSelectedTier(tier.id); setError(''); }}
                                            className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-inner ${tier.theme.iconBg}`}>
                                                {tier.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-900 text-sm">{tier.title}</span>
                                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${tier.theme.tagBg}`}>{tier.tag}</span>
                                                </div>
                                                <p className="text-slate-500 text-xs font-medium leading-relaxed">{tier.desc}</p>
                                            </div>
                                            <ArrowRight size={18} className="text-slate-300 group-hover:text-slate-600 flex-shrink-0 transition-colors" />
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8 text-center space-y-2 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <ShieldCheck className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                        Credentials are issued by your administrator. Contact them if you haven't received yours.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Login Form */
                            <div className="w-full animate-fade-in">
                                <button
                                    onClick={() => {
                                        if (isForgotPassword) {
                                            setIsForgotPassword(false);
                                            setOtpSent(false);
                                            setError('');
                                            setSuccessMsg('');
                                        } else {
                                            setSelectedTier(null);
                                            setError('');
                                            setSuccessMsg('');
                                        }
                                    }}
                                    className="flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-8 text-sm font-bold transition-colors uppercase tracking-widest"
                                >
                                    <ChevronLeft size={16} /> {isForgotPassword ? 'Back to login' : 'Back to selection'}
                                </button>

                                <div className="mb-8 text-center sm:text-left">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-inner mx-auto sm:mx-0 ${activeTheme?.iconBg}`}>
                                        {tiers.find(t => t.id === selectedTier)?.icon}
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                                        {tiers.find(t => t.id === selectedTier)?.title}
                                    </h2>
                                    <p className="text-slate-500 text-sm font-medium">Sign in with your issued credentials.</p>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl font-bold mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                        {error}
                                    </div>
                                )}

                                {successMsg && (
                                    <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl font-bold mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        {successMsg}
                                    </div>
                                )}

                                {isForgotPassword ? (
                                    !otpSent ? (
                                        <form onSubmit={handleForgotPassword} className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Email address *</label>
                                                <div className="relative">
                                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        placeholder="name@university.edu"
                                                        className={`w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${activeTheme?.ring}`}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className={`w-full h-12 rounded-xl text-white font-bold text-sm transition-all shadow-md ${activeTheme?.btn} disabled:opacity-60 disabled:cursor-not-allowed`}
                                            >
                                                {loading ? 'Sending OTP...' : 'Send OTP via Email'}
                                            </button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleResetPassword} className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Enter 6-Digit OTP *</label>
                                                <div className="relative">
                                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={otpToken}
                                                        onChange={e => setOtpToken(e.target.value)}
                                                        placeholder="••••••"
                                                        className={`w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold tracking-widest text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${activeTheme?.ring}`}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">New Password *</label>
                                                <div className="relative">
                                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="password"
                                                        required
                                                        value={newPassword}
                                                        onChange={e => setNewPassword(e.target.value)}
                                                        placeholder="At least 6 characters"
                                                        className={`w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${activeTheme?.ring}`}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Confirm New Password *</label>
                                                <div className="relative">
                                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="password"
                                                        required
                                                        value={confirmNewPassword}
                                                        onChange={e => setConfirmNewPassword(e.target.value)}
                                                        placeholder="Re-enter new password"
                                                        className={`w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${activeTheme?.ring}`}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className={`w-full h-12 rounded-xl text-white font-bold text-sm transition-all shadow-md ${activeTheme?.btn} disabled:opacity-60 disabled:cursor-not-allowed`}
                                            >
                                                {loading ? 'Verifying & Resetting...' : 'Verify OTP & Reset Password'}
                                            </button>
                                        </form>
                                    )
                                ) : (
                                    <form onSubmit={handleLogin} className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Email / Login ID *</label>
                                            <div className="relative">
                                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    placeholder="name@university.edu or ID"
                                                    className={`w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${activeTheme?.ring}`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest">Password *</label>
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }}
                                                    className={`text-xs font-bold hover:underline ${activeTheme?.text}`}
                                                >
                                                    Forgot Password?
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className={`w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 ${activeTheme?.ring}`}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`w-full h-12 mt-2 rounded-xl text-white font-bold text-sm transition-all shadow-md ${activeTheme?.btn} disabled:opacity-60 disabled:cursor-not-allowed`}
                                        >
                                            {loading ? 'Authenticating...' : 'Secure Sign In'}
                                        </button>

                                        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 flex items-center justify-center gap-1.5">
                                            <ShieldCheck size={14} className="text-slate-400" />
                                            Enterprise Security
                                        </p>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPortal;

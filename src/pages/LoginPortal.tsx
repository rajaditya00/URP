import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LibraryBig, GraduationCap, Building2, UserCircle2, ShieldCheck, Mail, Lock, Eye, EyeOff, Grid
} from 'lucide-react';

type LoginTier = 'Admin' | 'College' | 'Staff' | 'Student';

const tiers = [
    {
        id: 'Admin' as LoginTier,
        icon: <ShieldCheck className="w-5 h-5" />,
        title: 'Uni Admin',
        badge: 'UNIVERSITY ADMIN',
        desc: 'Central command for university compliance & operations.',
        demoEmail: 'rajaditya.addy00@gmail.com',
        demoPass: 'admin12345',
        role: 'SUPER_ADMIN',
        theme: 'from-[#0f172a] to-[#1e293b]'
    },
    {
        id: 'College' as LoginTier,
        icon: <Building2 className="w-5 h-5" />,
        title: 'College',
        badge: 'COLLEGE ADMIN',
        desc: 'Portal for Principals to manage institutional operations.',
        demoEmail: 'principal@cet.edu',
        demoPass: 'college12345',
        role: 'COLLEGE',
        theme: 'from-[#059669] to-[#047857]'
    },
    {
        id: 'Staff' as LoginTier,
        icon: <UserCircle2 className="w-5 h-5" />,
        title: 'Faculty',
        badge: 'FACULTY & STAFF',
        desc: 'Portal for HODs, Professors, and Lecturers.',
        demoEmail: 'faculty@cet.edu',
        demoPass: 'faculty12345',
        role: 'PROFESSOR',
        theme: 'from-[#2563eb] to-[#1d4ed8]'
    },
    {
        id: 'Student' as LoginTier,
        icon: <GraduationCap className="w-5 h-5" />,
        title: 'Student',
        badge: 'STUDENT PORTAL',
        desc: 'Personalized dashboard for grades and records.',
        demoEmail: 'student@cet.edu',
        demoPass: 'student12345',
        role: 'STUDENT',
        theme: 'from-[#7c3aed] to-[#6d28d9]'
    }
];

const LoginPortal = () => {
    const [selectedTier, setSelectedTier] = useState<LoginTier>('Admin');
    const [activeSection, setActiveSection] = useState<'login' | 'explore'>('login');
    const [email, setEmail] = useState('rajaditya.addy00@gmail.com');
    const [password, setPassword] = useState('admin12345');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const currentTier = tiers.find(t => t.id === selectedTier) || tiers[0];

    // Automatically update fields when switching tabs
    const handleTierChange = (tierId: LoginTier) => {
        if (loading) return; // Prevent changing tier during login authentication
        setSelectedTier(tierId);
        setError('');
        setSuccessMsg('');
        const tier = tiers.find(t => t.id === tierId);
        if (tier) {
            setEmail(tier.demoEmail);
            setPassword(tier.demoPass);
        }
    };

    // Inject demo credentials
    const injectDemo = () => {
        if (loading) return;
        setEmail(currentTier.demoEmail);
        setPassword(currentTier.demoPass);
        setError('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const normalizedEmail = email.trim().toLowerCase();
        const matchedTier = tiers.find(t => t.demoEmail.toLowerCase() === normalizedEmail && password === t.demoPass);
        const isUniAdminDemo = normalizedEmail === 'rajaditya.addy00@gmail.com' && password === 'admin12345';

        // --- INSTANT FRONTEND DEMO CREDENTIALS BYPASS ---
        // Bypasses the frozen backend entirely for pre-configured demo logins to guarantee immediate success.
        if (isUniAdminDemo || matchedTier) {
            const mockUser = isUniAdminDemo ? {
                id: 'mock-super-admin-id',
                name: 'Aditya Raj',
                email: 'rajaditya.addy00@gmail.com',
                role: 'SUPER_ADMIN' as const,
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
                }
            } : {
                id: `mock-${matchedTier!.id.toLowerCase()}-id`,
                name: `${matchedTier!.title} Demo User`,
                email: matchedTier!.demoEmail,
                role: matchedTier!.role as any,
                university: {
                    _id: 'mock-uni-id',
                    name: 'All Campus Digital University',
                    logoUrl: '',
                    introduction: 'A premier educational institution dedicated to excellence.',
                    phone: '+91 9876543210',
                    address: 'Institutional Area, New Delhi, India'
                },
                college: {
                    _id: 'mock-college-id',
                    name: 'College of Engineering & Technology',
                    email: 'principal@cet.edu'
                }
            };

            login(isUniAdminDemo ? 'mock-jwt-token-super' : `mock-jwt-token-${matchedTier!.id.toLowerCase()}`, mockUser);
            setSuccessMsg(`Offline Bypass: Authenticated as ${isUniAdminDemo ? 'University Admin' : matchedTier!.title}!`);
            setTimeout(() => {
                redirectBasedOnRole(mockUser.role);
            }, 600);
            return;
        }

        // --- LIVE BACKEND AUTHENTICATION (with fast timeout) ---
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);

            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await res.json();

            if (res.ok) {
                login(data.token, data.user);
                setSuccessMsg('Authenticated successfully! Redirecting...');
                setTimeout(() => {
                    redirectBasedOnRole(data.user.role);
                }, 800);
                return;
            } else {
                setError(data.msg || 'Invalid credentials.');
            }
        } catch (err: any) {
            console.warn('Backend server connection failed or timed out.');
            setError('Auth server took too long to respond. Please click the DEMO ACCOUNT button to log in offline.');
        } finally {
            setLoading(false);
        }
    };

    const redirectBasedOnRole = (role: string) => {
        if (role === 'SYSTEM_ADMIN') navigate('/system-admin');
        else if (role === 'SUPER_ADMIN') navigate('/uni-admin/dashboard');
        else if (role === 'COLLEGE' || role === 'COLLEGE_ADMIN') navigate('/college-admin/dashboard');
        else if (role === 'PROFESSOR' || role === 'STAFF') navigate('/faculty-dashboard');
        else navigate('/student-portal');
    };

    return (
        <div className="min-h-screen font-body flex items-center justify-center p-4 sm:p-8 bg-[#f4f4f5] relative overflow-hidden">
            {/* Ambient Gradients */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-3xl -translate-x-1/2 -translate-y-1/4"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="w-full max-w-[620px] bg-white rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden relative z-10 transition-all duration-300">
                {/* Loader Overlay (Blur mechanism) */}
                {loading && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[4px] z-50 flex flex-col items-center justify-center animate-fade-in">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-bold text-slate-800 tracking-wider uppercase">Authenticating Portal Securely...</p>
                    </div>
                )}

                {/* Inner Content Card */}
                <div className={`p-8 sm:p-10 transition-all duration-300 ${loading ? 'blur-[2px] pointer-events-none' : ''}`}>
                    {/* Secure Portal vs Explore Switcher */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50">
                            <button
                                onClick={() => setActiveSection('login')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${activeSection === 'login'
                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                <ShieldCheck size={14} className={activeSection === 'login' ? 'text-indigo-600' : ''} />
                                Secure Portal Login
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-all uppercase tracking-wider"
                            >
                                <Grid size={14} />
                                Explore Modules
                            </button>
                        </div>
                    </div>

                    {/* Console Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Direct Access Console</h1>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Select your role to sign in instantly.</p>
                    </div>

                    {/* Horizontal Role Selector Tabs */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        {tiers.map(tier => {
                            const isActive = selectedTier === tier.id;
                            return (
                                <button
                                    key={tier.id}
                                    type="button"
                                    onClick={() => handleTierChange(tier.id)}
                                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl border font-bold text-xs transition-all duration-200 ${isActive
                                            ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-sm'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                                        }`}
                                >
                                    <span className={isActive ? 'text-indigo-400' : 'text-slate-400'}>{tier.icon}</span>
                                    <span>{tier.title}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Info Alert Box with Demo Injection */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-2xl mb-6 gap-3">
                        <div className="min-w-0">
                            <span className="inline-block text-[9px] font-black text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                                {currentTier.badge}
                            </span>
                            <p className="text-slate-500 text-xs font-medium truncate">{currentTier.desc}</p>
                        </div>
                        <button
                            type="button"
                            onClick={injectDemo}
                            className="bg-[#0f172a] hover:bg-slate-800 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all uppercase tracking-wider flex-shrink-0 shadow-sm border border-slate-900"
                        >
                            Demo Account
                        </button>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl font-bold mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                            <p>{error}</p>
                        </div>
                    )}

                    {successMsg && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl font-bold mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                            <p>{successMsg}</p>
                        </div>
                    )}

                    {/* Login Fields Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Email / Login ID</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@university.edu or ID"
                                    className="w-full h-12 pl-11 pr-4 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-12 pl-11 pr-12 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-12 bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all duration-200 mt-4 uppercase tracking-wider border border-slate-900 flex items-center justify-center gap-2"
                        >
                            <ShieldCheck size={14} />
                            Secure Sign In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPortal;

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GraduationCap, FileText, CheckCircle, Users, Monitor, ShieldCheck, LayoutDashboard, MapPin, Building, Building2 } from 'lucide-react';

type View = 'login' | 'forgot' | 'reset';

const UniversityLogin = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const uniId = searchParams.get('university');
    const collegeId = searchParams.get('college');
    const role = searchParams.get('role');
    const [uniData, setUniData] = useState<any>(null);
    const [view, setView] = useState<View>('login');

    // Login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Forgot / Reset state
    const [fpEmail, setFpEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (uniId) {
            fetch(`http://localhost:5000/api/university/${uniId}`)
                .then(r => r.json())
                .then(d => { if (d.name) setUniData(d); });
        }
    }, [uniId]);

    const clearMessages = () => { setError(''); setSuccess(''); };

    // ---- LOGIN ----
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('cc_token', data.token);
                localStorage.setItem('cc_user', JSON.stringify(data.user));
                if (data.user.role === 'SUPER_ADMIN') navigate('/uni-admin/dashboard');
                else if (data.user.role === 'COLLEGE' || data.user.role === 'COLLEGE_ADMIN') navigate('/college-admin/dashboard');
                else navigate('/student-portal');
            } else {
                setError(data.message || 'Invalid credentials. Please try again.');
            }
        } catch { setError('Unable to reach the server.'); }
        finally { setLoading(false); }
    };

    // ---- FORGOT PASSWORD ----
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: fpEmail })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('A 6-digit reset code has been sent to your email.');
                setView('reset');
            } else {
                setError(data.message || 'Could not process request.');
            }
        } catch { setError('Unable to reach the server.'); }
        finally { setLoading(false); }
    };

    // ---- RESET PASSWORD ----
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: fpEmail, otp, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Password updated! Redirecting to login...');
                setTimeout(() => { setView('login'); clearMessages(); }, 2000);
            } else {
                setError(data.message || 'Reset failed. Invalid or expired code.');
            }
        } catch { setError('Unable to reach the server.'); }
        finally { setLoading(false); }
    };

    const logoSrc = uniData?.logoUrl ? `http://localhost:5000/${uniData.logoUrl?.replace(/^\/+/g, '')}` : null;
    const uniInitial = uniData?.name?.charAt(0) || 'C';
    const rawUniName = uniData?.name || 'All Campus Digital';
    const uniName = rawUniName.charAt(0).toUpperCase() + rawUniName.slice(1);

    const getThemeConfig = () => {
        switch (role) {
            case 'student':
                return {
                    idLabel: 'Student ID',
                    idPlaceholder: 'e.g. STU-2023-8472',
                    title: 'Student Portal',
                    subtitle: 'Manage your academic journey, view grades, and access campus resources securely.',
                    bgGlow: 'from-sky-500/30 via-blue-500/20 to-cyan-500/30',
                    leftPanel: 'from-[#003366] to-[#00509e]',
                    primaryBtn: 'bg-gradient-to-r from-[#0284c7] to-[#0369a1] shadow-blue-500/30 hover:shadow-blue-500/40 hover:from-[#0369a1] hover:to-[#075985]',
                    accentText: 'text-[#0284c7]',
                    ringFocus: 'focus:ring-[#0284c7]/20 focus:border-[#0284c7]',
                    features: [
                        { icon: <GraduationCap className="w-5 h-5 text-cyan-300" />, label: 'Academic Records', desc: 'Real-time access to grades and transcripts.' },
                        { icon: <FileText className="w-5 h-5 text-cyan-300" />, label: 'Course Enrollment', desc: 'Seamlessly register for upcoming semesters.' },
                        { icon: <CheckCircle className="w-5 h-5 text-cyan-300" />, label: 'Examination & Results', desc: 'Instant updates on your academic performance.' },
                    ]
                };
            case 'faculty':
                return {
                    idLabel: 'Faculty ID',
                    idPlaceholder: 'e.g. FAC-83921',
                    title: 'Faculty Portal',
                    subtitle: 'Empower your teaching. Manage courses, assess students, and track attendance.',
                    bgGlow: 'from-indigo-500/30 via-purple-500/20 to-violet-500/30',
                    leftPanel: 'from-[#2e1065] to-[#4c1d95]',
                    primaryBtn: 'bg-gradient-to-r from-[#4f46e5] to-[#6d28d9] shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:from-[#4338ca] hover:to-[#5b21b6]',
                    accentText: 'text-[#4f46e5]',
                    ringFocus: 'focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]',
                    features: [
                        { icon: <Users className="w-5 h-5 text-purple-300" />, label: 'Class Management', desc: 'Organize your curriculum and schedules.' },
                        { icon: <FileText className="w-5 h-5 text-purple-300" />, label: 'Student Assessment', desc: 'Efficiently grade and evaluate submissions.' },
                        { icon: <Monitor className="w-5 h-5 text-purple-300" />, label: 'Research Tracking', desc: 'Log publications and research grants.' },
                    ]
                };
            case 'college':
                return {
                    idLabel: 'College Admin ID',
                    idPlaceholder: 'e.g. MIOT412',
                    title: 'College Admin Portal',
                    subtitle: 'Manage faculty, students, departments, and institutional operations.',
                    bgGlow: 'from-emerald-500/30 via-teal-500/20 to-green-500/30',
                    leftPanel: 'from-[#064e3b] to-[#065f46]',
                    primaryBtn: 'bg-gradient-to-r from-[#059669] to-[#047857] shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:from-[#047857] hover:to-[#065f46]',
                    accentText: 'text-[#059669]',
                    ringFocus: 'focus:ring-[#059669]/20 focus:border-[#059669]',
                    features: [
                        { icon: <Building2 className="w-5 h-5 text-emerald-300" />, label: 'Faculty Management', desc: 'Manage faculty profiles, positions, and special roles.' },
                        { icon: <Users className="w-5 h-5 text-emerald-300" />, label: 'Student Directory', desc: 'Enroll students and track academic progress.' },
                        { icon: <ShieldCheck className="w-5 h-5 text-emerald-300" />, label: 'Department Control', desc: 'Manage departments and administrative roles.' },
                    ]
                };
            default: // Admin
                return {
                    idLabel: 'University ID',
                    idPlaceholder: 'e.g. UN847261',
                    title: 'Administration Portal',
                    subtitle: 'Centralized control for institutional operations, compliance, and user governance.',
                    bgGlow: 'from-slate-500/30 via-gray-400/20 to-zinc-500/30',
                    leftPanel: 'from-[#0f172a] to-[#1e293b]',
                    primaryBtn: 'bg-gradient-to-r from-[#0f172a] to-[#334155] shadow-slate-900/30 hover:shadow-slate-900/40 hover:from-[#020617] hover:to-[#1e293b]',
                    accentText: 'text-[#0f172a]',
                    ringFocus: 'focus:ring-[#0f172a]/20 focus:border-[#0f172a]',
                    features: [
                        { icon: <ShieldCheck className="w-5 h-5 text-slate-300" />, label: 'Secure Governance', desc: 'Manage access control and institutional policies.' },
                        { icon: <LayoutDashboard className="w-5 h-5 text-slate-300" />, label: 'College Management', desc: 'Oversee affiliated institutions globally.' },
                        { icon: <CheckCircle className="w-5 h-5 text-slate-300" />, label: 'System Analytics', desc: 'High-level insights into university health.' },
                    ]
                };
        }
    };

    const theme = getThemeConfig();

    return (
        <div className="min-h-screen font-body flex items-center justify-center p-4 sm:p-8 bg-[#f4f4f5] relative overflow-hidden">
            {/* Decorative Ambient Background */}
            <div className={`absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br ${theme.bgGlow} blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/4 transition-colors duration-1000`}></div>
            <div className={`absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tl ${theme.bgGlow} blur-3xl opacity-60 translate-x-1/3 translate-y-1/3 transition-colors duration-1000`}></div>

            {/* Main Application Container */}
            <div className="flex w-full max-w-[1100px] bg-white rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] overflow-hidden relative z-10 min-h-[650px] border border-slate-100/50">
                
                {/* Left Branding Panel */}
                <div className={`hidden lg:flex w-[45%] bg-gradient-to-br ${theme.leftPanel} p-10 flex-col relative overflow-hidden transition-colors duration-700`}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
                    
                    {/* Top small university logo and name */}
                    <div className="relative z-10 flex items-center gap-2.5 mb-10 opacity-80 hover:opacity-100 transition-opacity">
                        {logoSrc ? (
                            <img src={logoSrc} alt="logo" className="h-6 w-auto object-contain drop-shadow-md" />
                        ) : (
                            <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white/10">
                                {uniInitial}
                            </div>
                        )}
                        <span className="text-white text-xs font-bold tracking-widest uppercase">{uniName}</span>
                    </div>
                    
                    <div className="relative z-10 flex-1">
                        {(role === 'student' || role === 'faculty') ? (
                            <div className="animate-fade-in">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-lg">
                                    <Building className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight leading-tight drop-shadow-sm">College of Engineering & Technology</h2>
                                <p className="text-white/80 text-sm font-medium tracking-wide flex items-center gap-1.5 mb-6">
                                    <MapPin className="w-4 h-4 text-white/70" /> Affiliated Campus Location
                                </p>
                                <p className="text-white/70 text-sm font-medium leading-relaxed max-w-sm mb-8">{theme.subtitle}</p>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                {logoSrc ? (
                                    <img src={logoSrc} alt="logo" className="h-16 w-auto mb-8 object-contain drop-shadow-md" />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold text-white mb-8 shadow-lg">
                                        {uniInitial}
                                    </div>
                                )}
                                <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight drop-shadow-sm">
                                    {role === 'college' && collegeId ? collegeId : uniName}
                                </h2>
                                <p className="text-white/80 text-base font-medium tracking-wide leading-relaxed max-w-sm mb-8">{theme.subtitle}</p>
                            </div>
                        )}

                        <div className="space-y-3 mt-auto">
                            {theme.features.map((m, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors shadow-sm">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner">
                                        {m.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-sm mb-1">{m.label}</h3>
                                        <p className="text-white/60 text-xs leading-relaxed">{m.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-16 relative bg-white">
                    <div className="w-full max-w-[380px]">
                        
                        {/* Mobile Header */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                                {logoSrc ? <img src={logoSrc} alt="logo" className="h-5 object-contain" /> : <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">{uniInitial}</div>}
                                <span className="text-xs font-bold tracking-widest uppercase text-slate-500">{uniName}</span>
                            </div>
                            
                            {(role === 'student' || role === 'faculty') ? (
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 mb-1">College of Eng. & Tech</h2>
                                    <p className="text-slate-500 text-xs flex items-center justify-center gap-1"><MapPin className="w-3 h-3"/> Campus Location</p>
                                </div>
                            ) : (
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    {role === 'college' && collegeId ? collegeId : uniName}
                                </h2>
                            )}
                        </div>

                        {/* Alerts */}
                        {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium shadow-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{error}</div>}
                        {success && <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-medium shadow-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}

                        {/* ---- LOGIN VIEW ---- */}
                        {view === 'login' && (
                            <div className="animate-fade-in">
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{theme.title}</h2>
                                <p className="text-slate-500 text-sm mb-10 font-medium">Please enter your credentials to access your account.</p>
                                
                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">{theme.idLabel}</label>
                                        <input type="text" required value={email} onChange={e => setEmail(e.target.value)} placeholder={theme.idPlaceholder}
                                            className={`w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-4 ${theme.ringFocus}`} />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Password</label>
                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                                                placeholder="Your secure password"
                                                className={`w-full h-12 px-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-4 ${theme.ringFocus}`} />
                                            <button type="button" onClick={() => setShowPassword(p => !p)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider transition-colors">
                                                {showPassword ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end pt-1">
                                        <button type="button" onClick={() => { clearMessages(); setView('forgot'); }}
                                            className={`text-sm font-semibold transition-colors hover:underline ${theme.accentText}`}>
                                            Forgot Password?
                                        </button>
                                    </div>
                                    
                                    <button type="submit" disabled={loading}
                                        className={`w-full h-12 rounded-xl text-white font-bold tracking-wide transition-all duration-300 hover:-translate-y-0.5 shadow-lg ${theme.primaryBtn} disabled:opacity-60 disabled:hover:translate-y-0 mt-4`}>
                                        {loading ? 'Authenticating...' : 'Sign In'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* ---- FORGOT PASSWORD VIEW ---- */}
                        {view === 'forgot' && (
                            <div className="animate-fade-in">
                                <button onClick={() => { clearMessages(); setView('login'); }} className={`text-sm font-bold mb-8 flex items-center gap-1.5 transition-colors ${theme.accentText} hover:underline`}>
                                    ← Back to Login
                                </button>
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Reset Password</h2>
                                <p className="text-slate-500 text-sm mb-10 font-medium">Enter your registered email address to receive a 6-digit verification code.</p>
                                
                                <form onSubmit={handleForgotPassword} className="space-y-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Registered Email</label>
                                        <input type="email" required value={fpEmail} onChange={e => setFpEmail(e.target.value)} placeholder="name@university.edu"
                                            className={`w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-4 ${theme.ringFocus}`} />
                                    </div>
                                    <button type="submit" disabled={loading}
                                        className={`w-full h-12 rounded-xl text-white font-bold tracking-wide transition-all duration-300 hover:-translate-y-0.5 shadow-lg ${theme.primaryBtn} disabled:opacity-60`}>
                                        {loading ? 'Sending Code...' : 'Send Reset Code'}
                                    </button>
                                </form>
                                <div className="text-center mt-8">
                                    <button onClick={() => { clearMessages(); setView('reset'); }} className={`text-sm font-semibold transition-colors hover:underline ${theme.accentText}`}>
                                        Already have a reset code?
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ---- RESET PASSWORD VIEW ---- */}
                        {view === 'reset' && (
                            <div className="animate-fade-in">
                                <button onClick={() => { clearMessages(); setView('forgot'); }} className={`text-sm font-bold mb-8 flex items-center gap-1.5 transition-colors ${theme.accentText} hover:underline`}>
                                    ← Back
                                </button>
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Set New Password</h2>
                                <p className="text-slate-500 text-sm mb-8 font-medium">Enter the 6-digit code sent to your email along with your new password.</p>
                                
                                <form onSubmit={handleResetPassword} className="space-y-5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Email Address</label>
                                        <input type="email" required value={fpEmail} onChange={e => setFpEmail(e.target.value)} placeholder="name@university.edu"
                                            className={`w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-4 ${theme.ringFocus}`} />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Verification Code</label>
                                        <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6}
                                            className={`w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm tracking-widest font-mono text-center text-slate-900 outline-none transition-all focus:bg-white focus:ring-4 ${theme.ringFocus}`} />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">New Password</label>
                                        <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters"
                                            className={`w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-4 ${theme.ringFocus}`} />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Confirm Password</label>
                                        <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password"
                                            className={`w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-4 ${theme.ringFocus}`} />
                                    </div>
                                    <button type="submit" disabled={loading}
                                        className={`w-full h-12 rounded-xl text-white font-bold tracking-wide transition-all duration-300 hover:-translate-y-0.5 shadow-lg ${theme.primaryBtn} disabled:opacity-60 mt-4`}>
                                        {loading ? 'Updating Password...' : 'Confirm New Password'}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="text-center mt-12">
                            <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400">
                                Powered by <span className={theme.accentText}>All Campus Digital</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversityLogin;

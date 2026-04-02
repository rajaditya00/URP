import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

type View = 'login' | 'forgot' | 'reset';

const UniversityLogin = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const uniId = searchParams.get('university');
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
                else if (data.user.role === 'COLLEGE_ADMIN') navigate('/college-admin/dashboard');
                else navigate('/student-portal');
            } else {
                setError(data.message || 'Invalid credentials. Please try again.');
            }
        } catch { setError('Unable to reach the server. Please check your connection.'); }
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
                setSuccess('A 6-digit reset code has been sent to your email. Check your inbox.');
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
                setError(data.message || 'Reset failed. The code may have expired.');
            }
        } catch { setError('Unable to reach the server.'); }
        finally { setLoading(false); }
    };

    const logoSrc = uniData?.logoUrl ? `http://localhost:5000/${uniData.logoUrl}` : null;
    const uniInitial = uniData?.name?.charAt(0) || 'C';
    const uniName = uniData?.name || 'CampusCore URP';

    return (
        <div className="min-h-screen font-body flex">
            {/* Left branding panel */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#1e3a5f] to-[#0f2238] flex-col items-center justify-center p-16 text-white">
                <div className="max-w-sm text-center">
                    {logoSrc
                        ? <img src={logoSrc} alt="logo" className="h-24 w-auto mx-auto mb-8 object-contain" />
                        : <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-5xl font-bold mx-auto mb-8">{uniInitial}</div>
                    }
                    <h1 className="text-3xl font-bold mb-3">{uniName}</h1>
                    <p className="text-white/60 text-sm">University Resource Portal — Sign in to access your authorized modules</p>
                    <div className="mt-12 grid grid-cols-2 gap-4 text-left">
                        {[
                            { label: 'Examination Control', desc: 'Manage results, forms, scheduling' },
                            { label: 'College Management', desc: 'Affiliated colleges & their access' },
                            { label: 'Student Verification', desc: 'Exam form approvals & records' },
                            { label: 'Notices & Placement', desc: 'Announcements and job drives' },
                        ].map((m, i) => (
                            <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <p className="font-semibold text-sm mb-1">{m.label}</p>
                                <p className="text-white/50 text-xs">{m.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center px-6 bg-[#f8fafc]">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        {logoSrc ? <img src={logoSrc} alt="logo" className="h-16 mx-auto object-contain mb-3" />
                            : <div className="w-16 h-16 rounded-full bg-[#1e3a5f] text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3">{uniInitial}</div>}
                        <h2 className="text-xl font-bold text-text-primary">{uniName}</h2>
                    </div>

                    {/* Alerts */}
                    {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
                    {success && <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm font-medium">{success}</div>}

                    {/* ---- LOGIN VIEW ---- */}
                    {view === 'login' && (
                        <>
                            <h2 className="text-2xl font-bold text-text-primary mb-1">Sign in to your portal</h2>
                            <p className="text-text-secondary text-sm mb-8">Use your registration email and the password you set during signup</p>
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-text-primary mb-1.5 uppercase tracking-wider">Email / UserID</label>
                                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@university.edu"
                                        className="w-full h-12 px-4 border border-[#D0D5DD] rounded-lg outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 text-sm bg-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-primary mb-1.5 uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                                            placeholder="Your generated or updated password"
                                            className="w-full h-12 px-4 pr-12 border border-[#D0D5DD] rounded-lg outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 text-sm bg-white" />
                                        <button type="button" onClick={() => setShowPassword(p => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs font-semibold">
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" onClick={() => { clearMessages(); setView('forgot'); }}
                                        className="text-xs text-[#3b82f6] hover:underline font-medium">
                                        Forgot Password?
                                    </button>
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full h-12 bg-[#1e3a5f] text-white font-bold rounded-lg hover:bg-[#162d4a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ---- FORGOT PASSWORD VIEW ---- */}
                    {view === 'forgot' && (
                        <>
                            <button onClick={() => { clearMessages(); setView('login'); }} className="text-xs text-[#3b82f6] hover:underline font-medium mb-6 flex items-center gap-1">
                                ← Back to Login
                            </button>
                            <h2 className="text-2xl font-bold text-text-primary mb-1">Reset your password</h2>
                            <p className="text-text-secondary text-sm mb-8">Enter your registered email address. We will send you a 6-digit reset code.</p>
                            <form onSubmit={handleForgotPassword} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-text-primary mb-1.5 uppercase tracking-wider">Registered Email</label>
                                    <input type="email" required value={fpEmail} onChange={e => setFpEmail(e.target.value)} placeholder="admin@university.edu"
                                        className="w-full h-12 px-4 border border-[#D0D5DD] rounded-lg outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 text-sm bg-white" />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full h-12 bg-[#1e3a5f] text-white font-bold rounded-lg hover:bg-[#162d4a] transition-colors disabled:opacity-60">
                                    {loading ? 'Sending...' : 'Send Reset Code'}
                                </button>
                            </form>
                            <div className="text-center mt-6">
                                <button onClick={() => { clearMessages(); setView('reset'); }} className="text-xs text-text-muted hover:text-[#3b82f6]">
                                    Already have a reset code? Enter it here
                                </button>
                            </div>
                        </>
                    )}

                    {/* ---- RESET PASSWORD VIEW ---- */}
                    {view === 'reset' && (
                        <>
                            <button onClick={() => { clearMessages(); setView('forgot'); }} className="text-xs text-[#3b82f6] hover:underline font-medium mb-6 flex items-center gap-1">
                                ← Back
                            </button>
                            <h2 className="text-2xl font-bold text-text-primary mb-1">Enter your new password</h2>
                            <p className="text-text-secondary text-sm mb-8">Enter the 6-digit code from your email and set a new password.</p>
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-text-primary mb-1.5 uppercase tracking-wider">Email Address</label>
                                    <input type="email" required value={fpEmail} onChange={e => setFpEmail(e.target.value)} placeholder="admin@university.edu"
                                        className="w-full h-12 px-4 border border-[#D0D5DD] rounded-lg outline-none focus:border-[#1e3a5f] text-sm bg-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-primary mb-1.5 uppercase tracking-wider">6-Digit Reset Code</label>
                                    <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} placeholder="e.g. 847261" maxLength={6}
                                        className="w-full h-12 px-4 border border-[#D0D5DD] rounded-lg outline-none focus:border-[#1e3a5f] text-sm bg-white tracking-widest font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-primary mb-1.5 uppercase tracking-wider">New Password</label>
                                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters"
                                        className="w-full h-12 px-4 border border-[#D0D5DD] rounded-lg outline-none focus:border-[#1e3a5f] text-sm bg-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-primary mb-1.5 uppercase tracking-wider">Confirm New Password</label>
                                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password"
                                        className="w-full h-12 px-4 border border-[#D0D5DD] rounded-lg outline-none focus:border-[#1e3a5f] text-sm bg-white" />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full h-12 bg-[#16a34a] text-white font-bold rounded-lg hover:bg-[#15803d] transition-colors disabled:opacity-60">
                                    {loading ? 'Updating...' : 'Set New Password'}
                                </button>
                            </form>
                        </>
                    )}

                    <p className="text-center text-xs text-text-muted mt-10">
                        Powered by <span className="font-semibold text-[#1e3a5f]">CampusCore URP</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UniversityLogin;

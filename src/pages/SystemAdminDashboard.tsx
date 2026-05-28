import BASE_URL from '../config/api';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ShieldCheck, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

const SystemAdminDashboard = () => {
    const { user, login } = useAuth();

    // ── Credential login state ──────────────────────────────
    const [email, setEmail] = useState('');
    const [securityCode, setSecurityCode] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const isEmailValid = email === (import.meta.env.VITE_ADMIN_EMAIL || 'rajaditya.addy00@gmail.com');
    const isCodeValid = securityCode === (import.meta.env.VITE_ADMIN_SECURITY_CODE || 'admin123');

    // ── Dashboard data state ────────────────────────────────
    const [tab, setTab] = useState<'pending' | 'verified'>('pending');
    const [pendingUnis, setPendingUnis] = useState<any[]>([]);
    const [verifiedUnis, setVerifiedUnis] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Ref to auto‑focus the security code field when email becomes valid
    const codeInputRef = useRef<HTMLInputElement>(null);
    const handleLogin = useCallback(async () => {
        if (!email || !securityCode) {
            setStatusMsg({ text: 'Please enter your email and security code.', type: 'error' });
            return;
        }
        setLoginLoading(true);
        setStatusMsg(null);
        try {
            const res = await fetch(BASE_URL + '/api/auth/system-admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, securityCode }),
            });
            const data = await res.json();
            if (res.ok) {
                login(data.token, data.user);
            } else {
                setStatusMsg({ text: data.msg || 'Invalid credentials.', type: 'error' });
            }
        } catch {
            setStatusMsg({ text: 'Cannot connect to server. Is the backend running?', type: 'error' });
        } finally {
            setLoginLoading(false);
        }
    }, [email, securityCode, login]);

    // ── Auto-login Trigger ──────────────────────────────────
    useEffect(() => {
        // Auto‑focus the security code input as soon as a valid email is entered
        if (isEmailValid) {
            setTimeout(() => codeInputRef.current?.focus(), 50);
        }
        if (isEmailValid && isCodeValid && !loginLoading && !statusMsg) {
            handleLogin();
        }
    }, [isEmailValid, isCodeValid, handleLogin, loginLoading, statusMsg]);


    const fetchAll = async () => {
        setLoading(true);
        try {
            const [pRes, vRes] = await Promise.all([
                fetch(BASE_URL + '/api/university/pending'),
                fetch(BASE_URL + '/api/university/verified'),
            ]);
            const pData = await pRes.json();
            const vData = await vRes.json();
            if (Array.isArray(pData)) setPendingUnis(pData);
            if (Array.isArray(vData)) setVerifiedUnis(vData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleVerify = async (id: string, name: string) => {
        const confirmCheck = window.confirm(`Verify "${name}" and dispatch credentials to their registered email?`);
        if (!confirmCheck) return;
        try {
            const res = await fetch(`${BASE_URL}/api/university/${id}/validate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                alert(`✅ "${name}" verified! Credentials dispatched via email.`);
                await fetchAll();
                setTab('verified');
            } else {
                const data = await res.json();
                alert(data.message || 'Verification error');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to server');
        }
    };

    // ===================== LOGIN GATE =====================
    if (user?.role !== 'SYSTEM_ADMIN') {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-body p-4 relative">
                <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-white px-8 py-7 text-center border-b border-slate-100">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <ShieldCheck className="w-7 h-7 text-slate-700" />
                        </div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">System Administration</h1>
                        <p className="text-slate-500 text-xs font-medium mt-1.5 uppercase tracking-widest">Secure Access Portal</p>
                    </div>

                    <div className="p-8 space-y-5">
                        {/* Status message */}
                        {statusMsg && (
                            <div className={`text-xs font-bold p-3 rounded-xl border flex items-center gap-2 ${statusMsg.type === 'error' ? 'text-red-700 bg-red-50 border-red-200' : 'text-green-700 bg-green-50 border-green-200'}`}>
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{statusMsg.text}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Administrator Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') codeInputRef.current?.focus(); }}
                                    placeholder="admin@intelliq.edu"
                                    className={`w-full pl-11 pr-10 py-3 bg-slate-50 border ${isEmailValid ? 'border-green-400 focus:border-green-400 focus:ring-green-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'} rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-4 outline-none transition-all`}
                                />
                                {isEmailValid && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Code */}
                        <div
                            style={{
                                maxHeight: isEmailValid ? '120px' : '0px',
                                opacity: isEmailValid ? 1 : 0,
                                overflow: 'hidden',
                                transition: 'max-height 0.35s ease, opacity 0.3s ease',
                                visibility: isEmailValid ? 'visible' : 'hidden'
                            }}
                        >
                            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Security Code</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    ref={codeInputRef}
                                    type="password"
                                    value={securityCode}
                                    onChange={e => setSecurityCode(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                    placeholder="••••••••"
                                    className={`w-full pl-11 pr-10 py-3 bg-slate-50 border ${isCodeValid ? 'border-green-400 focus:border-green-400 focus:ring-green-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'} rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-4 outline-none transition-all`}
                                />
                                {isCodeValid && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Loading Indicator for Auto-Login */}
                        <div className="h-6 flex items-center justify-center">
                            {loginLoading ? (
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold animate-pulse">
                                    <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                    Authenticating...
                                </div>
                            ) : (
                                <p className="text-[10px] text-slate-400">Authorised personnel only. All access is logged.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center font-body">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                <p className="text-text-muted text-sm">Loading registrations...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] font-body">
            {/* Header */}
            <div className="bg-white border-b border-border-color shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                                Portal Owner · Verification Center
                            </h1>
                            <p className="text-text-secondary text-sm mt-1">
                                Review applications, validate documents, and dispatch university credentials.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="text-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-amber-700 font-bold text-lg leading-none">{pendingUnis.length}</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wide mt-1">Pending</p>
                            </div>
                            <div className="text-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-700 font-bold text-lg leading-none">{verifiedUnis.length}</p>
                                <p className="text-green-600 text-[10px] font-semibold uppercase tracking-wide mt-1">Verified</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-6 bg-[#f1f5f9] p-1 rounded-lg w-fit">
                        {(['pending', 'verified'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all capitalize ${tab === t
                                    ? 'bg-white shadow-sm text-text-primary'
                                    : 'text-text-muted hover:text-text-secondary'
                                    }`}
                            >
                                {t === 'pending' ? `Pending (${pendingUnis.length})` : `Verified (${verifiedUnis.length})`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

                {/* PENDING TAB */}
                {tab === 'pending' && (
                    pendingUnis.length === 0 ? (
                        <div className="bg-white p-16 rounded-xl text-center border border-border-color shadow-sm">
                            <div className="text-5xl mb-4">🎉</div>
                            <h3 className="text-lg font-bold text-text-primary mb-2">Queue is Empty</h3>
                            <p className="text-text-secondary">No pending university applications at this time.</p>
                        </div>
                    ) : (
                        pendingUnis.map(uni => (
                            <div key={uni._id} className="bg-white rounded-xl shadow-sm border border-border-color hover:shadow-md transition-shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-border-color flex items-center justify-between bg-amber-50">
                                    <div className="flex items-center gap-3">
                                        {uni.logoUrl
                                            ? <img src={`${BASE_URL}/${uni.logoUrl?.replace(/^\/+/g, '')}`} alt="logo" className="h-9 w-9 object-contain rounded border bg-white p-0.5" />
                                            : <div className="h-9 w-9 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-sm">{uni.name?.charAt(0)}</div>
                                        }
                                        <div>
                                            <h2 className="font-bold text-text-primary">{uni.name}</h2>
                                            <p className="text-xs text-text-muted">Submitted {new Date(uni.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-wider border border-amber-200">Awaiting Verification</span>
                                </div>

                                <div className="p-6 flex flex-col md:flex-row gap-8">
                                    {/* University Details */}
                                    <div className="flex-1">
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
                                            <div><p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Email</p><p className="font-medium text-text-primary">{uni.email}</p></div>
                                            <div><p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Phone</p><p className="font-medium text-text-primary">{uni.phone}</p></div>
                                            <div><p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Location</p><p className="font-medium text-text-primary">{uni.state}, {uni.country}</p></div>
                                            <div><p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Plan</p><p className="font-medium text-text-primary capitalize">{uni.plan} · {uni.duration}</p></div>
                                            <div className="col-span-2"><p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Address</p><p className="font-medium text-text-primary">{uni.address}</p></div>
                                        </div>

                                        {/* Document Actions */}
                                        <div className="flex flex-wrap gap-3">
                                            {uni.affiliationDocUrl ? (
                                                <a
                                                    href={`${BASE_URL}/${uni.affiliationDocUrl?.replace(/^\/+/g, '')}`}
                                                    target="_blank" rel="noreferrer" download
                                                    className="inline-flex items-center gap-2 px-4 py-2 border border-[#3b82f6] text-[#3b82f6] hover:bg-[#eff6ff] rounded-lg text-sm font-semibold transition-colors"
                                                >
                                                    📄 View / Download Affiliation Doc
                                                </a>
                                            ) : (
                                                <span className="text-sm text-red-500 font-medium">⚠️ No affiliation document attached</span>
                                            )}
                                            {uni.affiliationDocBase64 && (
                                                <button
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = uni.affiliationDocBase64;
                                                        link.download = `${uni.name}_affiliation_doc`;
                                                        link.click();
                                                    }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 border border-[#7c3aed] text-[#7c3aed] hover:bg-[#f5f3ff] rounded-lg text-sm font-semibold transition-colors"
                                                >
                                                    ⬇️ Download (Base64 String)
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Panel */}
                                    <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-border-color pt-6 md:pt-0 md:pl-8">
                                        <div className="bg-[#f8fafc] rounded-lg p-4 text-sm space-y-2 border border-border-color">
                                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Media Submitted</p>
                                            <div className="flex justify-between"><span>Departments</span><span className="font-semibold">{uni.departmentImages?.length || 0}</span></div>
                                            <div className="flex justify-between"><span>Labs</span><span className="font-semibold">{uni.labImages?.length || 0}</span></div>
                                            <div className="flex justify-between"><span>Sports</span><span className="font-semibold">{uni.sportsImages?.length || 0}</span></div>
                                            <div className="flex justify-between"><span>Auditorium</span><span className="font-semibold">{uni.auditoriumImages?.length || 0}</span></div>
                                        </div>
                                        <button
                                            onClick={() => handleVerify(uni._id, uni.name)}
                                            className="w-full py-3 bg-[#16a34a] text-white font-bold rounded-lg hover:bg-[#15803d] transition-all shadow-sm hover:shadow active:scale-[0.98]"
                                        >
                                            Verify & Dispatch Credentials
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                )}

                {/* VERIFIED TAB */}
                {tab === 'verified' && (
                    verifiedUnis.length === 0 ? (
                        <div className="bg-white p-16 rounded-xl text-center border border-border-color shadow-sm">
                            <h3 className="text-lg font-bold text-text-primary mb-2">No Verified Universities Yet</h3>
                            <p className="text-text-secondary">Approve pending applications to see them here.</p>
                        </div>
                    ) : (
                        verifiedUnis.map(uni => (
                            <div key={uni._id} className="bg-white rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-shadow overflow-hidden">
                                <div className="px-6 py-4 border-b border-green-100 flex items-center justify-between bg-green-50">
                                    <div className="flex items-center gap-3">
                                        {uni.logoUrl
                                            ? <img src={`${BASE_URL}/${uni.logoUrl?.replace(/^\/+/g, '')}`} alt="logo" className="h-9 w-9 object-contain rounded border bg-white p-0.5" />
                                            : <div className="h-9 w-9 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold text-sm">{uni.name?.charAt(0)}</div>
                                        }
                                        <div>
                                            <h2 className="font-bold text-text-primary">{uni.name}</h2>
                                            <p className="text-xs text-text-muted">Active since {new Date(uni.updatedAt || uni.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full uppercase tracking-wider border border-green-200">✓ Verified & Active</span>
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* University Details */}
                                    <div className="md:col-span-2 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                                        <div><p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Email</p><p className="font-medium text-text-primary">{uni.email}</p></div>
                                        <div><p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Phone</p><p className="font-medium text-text-primary">{uni.phone}</p></div>
                                        <div><p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Location</p><p className="font-medium text-text-primary">{uni.state}, {uni.country}</p></div>
                                        <div><p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Plan</p><p className="font-medium text-text-primary capitalize">{uni.plan} · {uni.duration}</p></div>
                                        <div><p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Registered Email</p><p className="font-medium text-text-primary">{uni.email}</p></div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Portal Link</p>
                                            <a href={`/login`} target="_blank" rel="noreferrer" className="text-[#3b82f6] hover:underline text-xs font-medium">View Portal (Login)</a>
                                        </div>
                                    </div>

                                    {/* Super Admin Account Box */}
                                    <div className="bg-[#f0fdf4] border border-green-200 rounded-xl p-5">
                                        <p className="text-[10px] uppercase tracking-wider text-green-700 font-bold mb-3">Super Admin Credentials</p>
                                        {uni.adminUser ? (
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <p className="text-[10px] font-bold text-green-600 uppercase mb-0.5">Admin Name</p>
                                                    <p className="font-semibold text-text-primary">{uni.adminUser.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-green-600 uppercase mb-0.5">Login ID (Branded Uni ID)</p>
                                                    <p className="font-semibold text-text-primary break-all">{uni.generatedCredential}</p>
                                                </div>
                                                <div className="pt-2 border-t border-green-200 text-[#15803d]">
                                                    <p className="text-[10px] uppercase font-bold tracking-tight mb-1">Login Password</p>
                                                    <p className="font-mono text-sm font-bold text-[#16a34a] break-all">{uni.generatedPassword || 'Not Available'}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-text-muted">No admin account found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
};

export default SystemAdminDashboard;
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';

const SystemAdminDashboard = () => {
    const { user, login } = useAuth();
    
    const [email, setEmail] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpToken, setOtpToken] = useState('');
    const [waitMsg, setWaitMsg] = useState('');

    const [tab, setTab] = useState<'pending' | 'verified'>('pending');
    const [pendingUnis, setPendingUnis] = useState<any[]>([]);
    const [verifiedUnis, setVerifiedUnis] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [pRes, vRes] = await Promise.all([
                fetch('http://localhost:5000/api/university/pending'),
                fetch('http://localhost:5000/api/university/verified'),
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
            const res = await fetch(`http://localhost:5000/api/university/${id}/validate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                alert(`✅ "${name}" verified! Credentials dispatched via email.`);
                await fetchAll(); // Refresh both queues
                setTab('verified'); // Switch to verified tab
            } else {
                const data = await res.json();
                alert(data.message || 'Verification error');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to server');
        }
    };

    if (user?.role !== 'SYSTEM_ADMIN') {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-body p-4">
               <div className="bg-white p-8 rounded-xl shadow-lg border border-border-color max-w-md w-full animate-slide-up text-center">
                  <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent-primary">
                     <Lock size={28} />
                  </div>
                  <h1 className="text-2xl font-bold text-text-primary mb-2">System Admin Locked</h1>
                  <p className="text-sm text-text-secondary mb-6">Enter your administrator email to receive a secure OTP code.</p>
                  
                  {waitMsg && <p className="text-xs font-bold text-[#16a34a] bg-[#f0fdf4] p-3 rounded-lg border border-[#bbf7d0] mb-4">{waitMsg}</p>}

                  {!otpSent ? (
                     <div className="space-y-4 text-left">
                        <div>
                          <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Admin Email</label>
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 bg-bg-secondary border border-border-color rounded-lg text-sm" placeholder="admin@system.com" />
                        </div>
                        <button onClick={async () => {
                            if(!email) return alert('Enter email');
                            const res = await fetch('http://localhost:5000/api/auth/system-admin/send-otp', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
                            });
                            const data = await res.json();
                            alert(data.msg);
                            setOtpSent(true);
                            setWaitMsg('OTP generated successfully. (If disconnected, look at the running Terminal logs to view the OTP key natively).');
                        }} className="w-full py-2.5 bg-text-primary hover:bg-black text-white font-bold text-sm rounded-lg transition-colors">
                           Request OTP Code
                        </button>
                     </div>
                  ) : (
                     <div className="space-y-4 text-left">
                        <div>
                          <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Enter 6-Digit OTP</label>
                          <input type="text" value={otpToken} onChange={e => setOtpToken(e.target.value)} className="w-full px-4 py-2 bg-bg-secondary border border-border-color rounded-lg text-sm tracking-[0.2em] font-mono font-bold text-center" placeholder="• • • • • •" />
                        </div>
                        <button onClick={async () => {
                            const res = await fetch('http://localhost:5000/api/auth/system-admin/verify-otp', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp: otpToken })
                            });
                            const data = await res.json();
                            if(res.ok) {
                                login(data.token, data.user);
                            } else {
                                alert(data.msg);
                            }
                        }} className="w-full py-2.5 bg-accent-primary hover:bg-accent-secondary text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                           <Mail size={16} /> Verify & Access Dashboard
                        </button>
                     </div>
                  )}
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
                                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all capitalize ${
                                    tab === t
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
                                            ? <img src={`http://localhost:5000/${uni.logoUrl}`} alt="logo" className="h-9 w-9 object-contain rounded border bg-white p-0.5" />
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
                                                    href={`http://localhost:5000/${uni.affiliationDocUrl}`}
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
                                            ? <img src={`http://localhost:5000/${uni.logoUrl}`} alt="logo" className="h-9 w-9 object-contain rounded border bg-white p-0.5" />
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
                                        <div><p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Branded University ID</p><p className="font-mono text-xs text-[#1e3a5f] font-bold break-all">{uni.generatedCredential || 'Not Generated'}</p></div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Portal Link</p>
                                            <a href={`/portal/${encodeURIComponent(uni.name)}`} target="_blank" rel="noreferrer" className="text-[#3b82f6] hover:underline text-xs font-medium">View Portal</a>
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
                                                    <p className="text-[10px] font-bold text-green-600 uppercase mb-0.5">Login Email (UserID)</p>
                                                    <p className="font-semibold text-text-primary break-all">{uni.adminUser.email}</p>
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

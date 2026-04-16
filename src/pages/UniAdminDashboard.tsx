import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';

type College = {
    _id: string;
    name: string;
    address: string;
    email: string;
    phone: string;
    principalName: string;
    adminUser?: { email: string; name: string } | null;
    generatedCredential?: string;
    generatedPassword?: string;
    modules: {
        examination: boolean;
        addQuestions: boolean;
        verifyStudentForms: boolean;
        placement: boolean;
        grievance: boolean;
        notices: boolean;
    };
};

const MODULE_LIST = [
    { key: 'examination', label: 'Examination Controller', desc: 'Access to Examination module' },
    { key: 'addQuestions', label: 'Add Questions', desc: 'Add questions to question bank' },
    { key: 'verifyStudentForms', label: 'Verify Student Forms', desc: 'Approve/reject exam enrollment forms' },
    { key: 'placement', label: 'Placement Module', desc: 'Access to placement drives & listings' },
    { key: 'grievance', label: 'Grievance Module', desc: 'Handle student complaints' },
    { key: 'notices', label: 'Notices', desc: 'Post announcements and circulars' },
];

const UniAdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [uniData, setUniData] = useState<any>(null);
    const [colleges, setColleges] = useState<College[]>([]);
    const [notices, setNotices] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'colleges' | 'modules' | 'notices' | 'results'>('notices');
    const [showAddCollege, setShowAddCollege] = useState(false);
    const [editingCollege, setEditingCollege] = useState<College | null>(null);
    const [newCollege, setNewCollege] = useState({ name: '', address: '', email: '', phone: '', principalName: '' });

    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [lastCredentials, setLastCredentials] = useState<{ email: string; password: string; collegeId?: string } | null>(null);

    const [newNotice, setNewNotice] = useState({ title: '', description: '' });
    const [newNoticePdf, setNewNoticePdf] = useState<File | null>(null);
    const [newResult, setNewResult] = useState({ title: '', semester: '', link: '', description: '' });

    const token = localStorage.getItem('cc_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    useEffect(() => {
        const stored = localStorage.getItem('cc_user');
        if (!stored || !token) { navigate('/university-login'); return; }
        const u = JSON.parse(stored);
        if (u.role !== 'SUPER_ADMIN') { navigate('/university-login'); return; }
        setUser(u);
        setUniData(u.university);
        loadColleges();
        loadNotices();
        loadResults();
    }, []);

    const loadNotices = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/notice', { headers });
            const data = await res.json();
            if (Array.isArray(data)) setNotices(data);
        } catch (e) { console.error('Failed to load notices', e); }
    };

    const loadResults = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/result', { headers });
            const data = await res.json();
            if (Array.isArray(data)) setResults(data);
        } catch (e) { console.error('Failed to load results', e); }
    };

    const loadColleges = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/college', { headers });
            const data = await res.json();
            if (Array.isArray(data)) setColleges(data);
        } catch (e) { console.error(e); }
    };

    const handleAddCollege = async () => {
        if (!newCollege.name || !newCollege.email) {
            showToast('College name and email are required');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('http://localhost:5000/api/college', {
                method: 'POST', headers, body: JSON.stringify(newCollege)
            });
            const data = await res.json();
            if (res.ok) {
                await loadColleges();
                setNewCollege({ name: '', address: '', email: '', phone: '', principalName: '' });
                setShowAddCollege(false);
                // Show the dispatched credentials
                if (data.credentials) {
                    setLastCredentials(data.credentials);
                }
                showToast('College added & credentials dispatched via email!');
            } else {
                showToast(data.error || 'Failed to add college');
            }
        } catch { showToast('Server connection failed'); } finally { setSaving(false); }
    };

    const handleToggleModule = async (college: College, moduleKey: string, val: boolean) => {
        try {
            const updated = { ...college, modules: { ...college.modules, [moduleKey]: val } };
            const res = await fetch(`http://localhost:5000/api/college/${college._id}`, {
                method: 'PUT', headers, body: JSON.stringify({ modules: updated.modules })
            });
            if (res.ok) {
                setColleges(prev => prev.map(c => c._id === college._id ? { ...c, modules: updated.modules } : c));
                showToast(`${val ? 'Granted' : 'Revoked'} access`);
            }
        } catch { }
    };

    const handleDeleteCollege = async (id: string) => {
        if (!window.confirm('Remove this college and its admin account?')) return;
        await fetch(`http://localhost:5000/api/college/${id}`, { method: 'DELETE', headers });
        setColleges(prev => prev.filter(c => c._id !== id));
        showToast('College removed');
    };

    const handleGenerateCredentials = async (id: string, collegeName: string) => {
        if (!window.confirm(`Generate new login credentials for ${collegeName} and immediately email them to the college admin?`)) return;
        setSaving(true);
        try {
            const res = await fetch(`http://localhost:5000/api/college/${id}/credentials`, { method: 'POST', headers });
            const data = await res.json();
            if (res.ok) {
                await loadColleges();
                if (data.credentials) {
                    setLastCredentials(data.credentials);
                }
                showToast('Credentials successfully generated & dispatched!');
            } else {
                showToast(data.message || data.error || 'Failed to generate credentials');
            }
        } catch { showToast('Server connection failed'); } finally { setSaving(false); }
    };

    const handleAddNotice = async () => {
        if (!newNotice.title || !newNotice.description) return showToast('Title and Description are required');
        setSaving(true);
        try {
            const form = new FormData();
            form.append('title', newNotice.title);
            form.append('description', newNotice.description);
            if (newNoticePdf) form.append('noticePdf', newNoticePdf);

            const fetchHeaders = new Headers();
            fetchHeaders.append('Authorization', `Bearer ${token}`);

            const res = await fetch('http://localhost:5000/api/notice', {
                method: 'POST', headers: fetchHeaders, body: form
            });
            if (res.ok) {
                await loadNotices();
                setNewNotice({ title: '', description: '' });
                setNewNoticePdf(null);
                showToast('Notice announced!');
            }
        } catch { showToast('Server error'); } finally { setSaving(false); }
    };

    const handleDeleteNotice = async (id: string) => {
        if (!window.confirm('Delete this notice?')) return;
        await fetch(`http://localhost:5000/api/notice/${id}`, { method: 'DELETE', headers });
        await loadNotices(); showToast('Notice deleted');
    };

    const handleAddResult = async () => {
        if (!newResult.title || !newResult.semester || !newResult.link) return showToast('Fill all required fields');
        setSaving(true);
        try {
            const res = await fetch('http://localhost:5000/api/result', {
                method: 'POST', headers, body: JSON.stringify(newResult)
            });
            if (res.ok) {
                await loadResults();
                setNewResult({ title: '', semester: '', link: '', description: '' });
                showToast('Result published!');
            }
        } catch { showToast('Server error'); } finally { setSaving(false); }
    };

    const handleDeleteResult = async (id: string) => {
        if (!window.confirm('Delete this result record?')) return;
        await fetch(`http://localhost:5000/api/result/${id}`, { method: 'DELETE', headers });
        await loadResults(); showToast('Result deleted');
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-body">
            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-[#16a34a] text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in">
                    {toast}
                </div>
            )}

            {/* Credential Dispatch Modal */}
            {lastCredentials && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up border border-green-200">
                        <div className="p-6 text-center border-b border-green-100 bg-green-50">
                            <div className="w-12 h-12 bg-[#16a34a] rounded-xl mx-auto flex items-center justify-center mb-4">
                                <span className="text-white text-xl">✓</span>
                            </div>
                            <h2 className="text-xl font-bold text-text-primary">Credentials Dispatched!</h2>
                            <p className="text-sm text-text-secondary mt-1">The following credentials have been emailed to the college.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-[#f8fafc] border border-border-color rounded-xl p-4 space-y-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">College ID</p>
                                    <p className="font-mono text-sm font-bold text-text-primary break-all">{lastCredentials.collegeId || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Login Email</p>
                                    <p className="font-mono text-sm font-bold text-text-primary break-all">{lastCredentials.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-0.5">Generated Password</p>
                                    <p className="font-mono text-sm font-bold text-[#16a34a] break-all">{lastCredentials.password}</p>
                                </div>
                            </div>
                            <p className="text-xs text-text-muted text-center">These credentials have also been printed to the backend terminal.</p>
                            <button
                                onClick={() => setLastCredentials(null)}
                                className="w-full py-2.5 bg-text-primary text-white font-bold text-sm rounded-lg hover:bg-black transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            <ChangePassword isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} tokenOverride={token} />

            {/* Header */}
            <header className="bg-white border-b border-border-color sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {uniData?.logoUrl
                            ? <img src={`http://localhost:5000/${uniData.logoUrl}`} alt="logo" className="h-9 max-w-20 object-contain" />
                            : <div className="w-9 h-9 rounded-full bg-[#1e3a5f] text-white font-bold text-sm flex items-center justify-center">{uniData?.name?.charAt(0)}</div>
                        }
                        <div>
                            <p className="font-bold text-text-primary text-sm leading-none">{uniData?.name}</p>
                            <p className="text-text-muted text-xs mt-0.5">Super Administrator</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to={`/portal/${encodeURIComponent(uniData?.name || '')}`} target="_blank" className="text-xs text-[#3b82f6] hover:underline font-medium">View Portal</Link>
                        <button onClick={() => setShowChangePassword(true)} className="text-xs text-text-muted hover:text-accent-primary font-medium">Change Password</button>
                        <button onClick={() => { localStorage.clear(); navigate('/university-login'); }} className="text-xs text-text-muted hover:text-red-500 font-medium">Logout</button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* SUBSCRIPTION BANNER */}
                <div className="mb-8 bg-gradient-to-r from-[#1e3a5f] to-[#2a4d7c] rounded-xl border border-[#162d4a] p-6 shadow-lg flex items-center justify-between text-white">
                    <div>
                        <p className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-1">Active Subscription Plan</p>
                        <h2 className="text-3xl font-bold capitalize flex items-center gap-2">
                            <span className="text-yellow-400">★</span>
                            <h2 className="text-yellow-400"> {uniData?.plan || 'Pending'}</h2>
                        </h2>
                    </div>
                    <div className="text-right bg-white/10 px-5 py-3 rounded-lg border border-white/20 backdrop-blur-sm">
                        <p className="text-blue-100 text-[10px] uppercase tracking-widest font-bold mb-0.5">Validity</p>
                        <p className="text-lg font-bold capitalize">{uniData?.duration || '-'}</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 bg-white border border-border-color rounded-xl p-1 w-fit mb-8 shadow-sm">
                    {(['notices', 'results', 'colleges', 'modules'] as const).map(t => (
                        <button key={t} onClick={() => setActiveTab(t)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === t ? 'bg-[#1e3a5f] text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
                            {t === 'colleges' ? `Colleges (${colleges.length})` : t === 'modules' ? 'Module Authority' : t}
                        </button>
                    ))}
                </div>

                {/* COLLEGES TAB */}
                {activeTab === 'colleges' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-text-primary">Affiliated Colleges</h2>
                            <button onClick={() => setShowAddCollege(true)} className="px-4 py-2 bg-[#1e3a5f] text-white font-semibold text-sm rounded-lg hover:bg-[#162d4a] transition-colors">
                                + Add College
                            </button>
                        </div>

                        {/* Add College Form */}
                        {showAddCollege && (
                            <div className="bg-white rounded-xl border border-border-color p-6 mb-6 shadow-sm">
                                <h3 className="font-bold text-text-primary mb-4">New College Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { label: 'College Name *', key: 'name' },
                                        { label: 'Principal Name', key: 'principalName' },
                                        { label: 'College Email *', key: 'email', placeholder: 'admin@college.edu — credentials will be sent here' },
                                        { label: 'Phone', key: 'phone' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{f.label}</label>
                                            <input
                                                value={(newCollege as any)[f.key]}
                                                onChange={e => setNewCollege(p => ({ ...p, [f.key]: e.target.value }))}
                                                placeholder={(f as any).placeholder || ''}
                                                className="w-full h-10 px-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]/10 outline-none"
                                            />
                                        </div>
                                    ))}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Full Address</label>
                                        <textarea value={newCollege.address} onChange={e => setNewCollege(p => ({ ...p, address: e.target.value }))}
                                            className="w-full h-20 px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] focus:ring-1 outline-none resize-none" />
                                    </div>
                                </div>
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-xs text-blue-700 font-medium">
                                        📧 A login password will be auto-generated and emailed to the college email address above.
                                    </p>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button onClick={handleAddCollege} disabled={saving}
                                        className="px-5 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#162d4a] disabled:opacity-60">
                                        {saving ? 'Creating & Sending...' : 'Create College & Dispatch Credentials'}
                                    </button>
                                    <button onClick={() => setShowAddCollege(false)} className="px-5 py-2 border border-border-color text-text-secondary text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
                                </div>
                            </div>
                        )}

                        {colleges.length === 0 ? (
                            <div className="bg-white rounded-xl border border-border-color p-12 text-center">
                                <p className="font-bold text-text-primary mb-1">No colleges added yet</p>
                                <p className="text-text-secondary text-sm">Click "Add College" to register your affiliated colleges. Credentials will be auto-generated and emailed.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {colleges.map(c => (
                                    <div key={c._id} className="bg-white rounded-xl border border-border-color p-5 shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold text-text-primary">{c.name}</h3>

                                                {c.address && <p className="text-xs text-text-secondary mt-1">{c.address}</p>}
                                                {c.principalName && <p className="text-xs text-text-muted mt-0.5">Principal: {c.principalName}</p>}
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button onClick={() => { setActiveTab('modules'); setEditingCollege(c); }}
                                                    className="px-3 py-1.5 border border-[#3b82f6] text-[#3b82f6] text-xs font-semibold rounded-lg hover:bg-[#eff6ff] transition-colors">
                                                    Manage Modules
                                                </button>
                                                <button onClick={() => handleDeleteCollege(c._id)}
                                                    className="px-3 py-1.5 border border-red-200 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                        {/* Credential Info */}
                                        {c.adminUser && (
                                            <div className="mt-3 pt-3 border-t border-border-color flex flex-col gap-2 text-xs">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-text-muted w-24">College ID:</span>
                                                    <span className="font-mono font-semibold text-[#1e3a5f]">{c.generatedCredential || <span className="text-gray-400 italic">Not available</span>}</span>
                                                    {(c.generatedCredential && c.generatedPassword) ? (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold text-[10px] uppercase tracking-wide">Credentials Dispatched</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-bold text-[10px] uppercase tracking-wide">Legacy College</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-text-muted w-24">Admin Login:</span>
                                                    <span className="font-mono font-semibold text-text-primary">{c.adminUser.email}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-text-muted w-24">Password:</span>
                                                    <span className="font-mono font-semibold text-[#16a34a]">{c.generatedPassword ? c.generatedPassword : <span className="text-gray-400 italic">Not available</span>}</span>
                                                    {(!c.generatedCredential || !c.generatedPassword) && (
                                                        <button 
                                                            onClick={() => handleGenerateCredentials(c._id, c.name)} 
                                                            disabled={saving}
                                                            className="ml-auto px-3 py-1 bg-[#1e3a5f] text-white rounded font-bold text-[10px] uppercase tracking-wide hover:bg-[#162d4a] transition-colors disabled:opacity-50"
                                                        >
                                                            Generate & Dispatch Credentials
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* MODULES TAB */}
                {activeTab === 'modules' && (
                    <div>
                        <h2 className="text-xl font-bold text-text-primary mb-6">Module Authority per College</h2>
                        {colleges.length === 0 ? (
                            <div className="bg-white rounded-xl border border-border-color p-12 text-center">
                                <p className="font-bold text-text-primary">No colleges registered yet</p>
                                <button onClick={() => setActiveTab('colleges')} className="mt-3 text-sm text-[#3b82f6] hover:underline">Add a college first</button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {colleges.map(college => (
                                    <div key={college._id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${editingCollege?._id === college._id ? 'border-[#1e3a5f] ring-2 ring-[#1e3a5f]/10' : 'border-border-color'}`}>
                                        <div className="px-6 py-4 border-b border-border-color bg-[#f8fafc] flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-text-primary">{college.name}</h3>
                                                {college.address && <p className="text-xs text-text-muted mt-0.5">{college.address}</p>}
                                            </div>
                                            <span className="text-xs font-semibold text-text-muted">
                                                {Object.values(college.modules).filter(Boolean).length} / {MODULE_LIST.length} modules active
                                            </span>
                                        </div>
                                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {MODULE_LIST.map(m => {
                                                const enabled = college.modules[m.key as keyof typeof college.modules];
                                                return (
                                                    <div key={m.key} onClick={() => handleToggleModule(college, m.key, !enabled)}
                                                        className={`border rounded-xl p-4 cursor-pointer transition-all select-none ${enabled ? 'border-[#16a34a] bg-green-50' : 'border-border-color bg-white hover:border-gray-300'}`}>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="font-semibold text-sm text-text-primary">{m.label}</p>
                                                                <p className="text-xs text-text-muted mt-1">{m.desc}</p>
                                                            </div>
                                                            {/* Toggle */}
                                                            <div className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 flex items-center ${enabled ? 'bg-[#16a34a]' : 'bg-gray-200'}`}>
                                                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* NOTICES TAB */}
                {activeTab === 'notices' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-border-color p-6 shadow-sm">
                            <h3 className="font-bold text-text-primary mb-4">Publish New Notice</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Title *</label>
                                    <input value={newNotice.title} onChange={e => setNewNotice(p => ({ ...p, title: e.target.value }))} className="w-full h-10 px-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Attach PDF (Optional)</label>
                                    <input type="file" accept="application/pdf" onChange={e => setNewNoticePdf(e.target.files?.[0] || null)} className="w-full h-10 px-3 py-1.5 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Description *</label>
                                    <textarea value={newNotice.description} onChange={e => setNewNotice(p => ({ ...p, description: e.target.value }))} rows={4} className="w-full p-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none" />
                                </div>
                            </div>
                            <button onClick={handleAddNotice} disabled={saving} className="px-5 py-2.5 bg-[#1e3a5f] text-white font-semibold text-sm rounded-lg hover:bg-[#162d4a] transition-colors">{saving ? 'Publishing...' : 'Publish Global Notice'}</button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {notices.map(n => (
                                <div key={n._id} className="bg-white rounded-xl border border-border-color p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-text-primary text-lg">{n.title}</h4>
                                            <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded uppercase">Global Broadcast</span>
                                        </div>
                                        <p className="text-xs text-text-muted mb-3">{new Date(n.createdAt).toLocaleString()}</p>
                                        <p className="text-sm text-text-secondary mb-3">{n.description}</p>
                                        {n.pdfUrl && (
                                            <a href={`http://localhost:5000/${n.pdfUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-200">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                                View PDF Attachment
                                            </a>
                                        )}
                                    </div>
                                    <button onClick={() => handleDeleteNotice(n._id)} className="text-sm text-red-500 font-medium hover:underline flex-shrink-0">Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* RESULTS TAB */}
                {activeTab === 'results' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-border-color p-6 shadow-sm">
                            <h3 className="font-bold text-text-primary mb-4">Publish Exam Result</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Title *</label>
                                    <input placeholder="e.g. B.Tech Semester 4 Final" value={newResult.title} onChange={e => setNewResult(p => ({ ...p, title: e.target.value }))} className="w-full h-10 px-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Semester *</label>
                                    <input placeholder="Sem 4" value={newResult.semester} onChange={e => setNewResult(p => ({ ...p, semester: e.target.value }))} className="w-full h-10 px-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none" />
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Result Link URL *</label>
                                    <input placeholder="https://university.edu/results/123" value={newResult.link} onChange={e => setNewResult(p => ({ ...p, link: e.target.value }))} className="w-full h-10 px-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none" />
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Description</label>
                                    <textarea value={newResult.description} onChange={e => setNewResult(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full p-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none" />
                                </div>
                            </div>
                            <button onClick={handleAddResult} disabled={saving} className="px-5 py-2.5 bg-[#1e3a5f] text-white font-semibold text-sm rounded-lg hover:bg-[#162d4a] transition-colors">{saving ? 'Publishing...' : 'Publish Result'}</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {results.map(r => (
                                <div key={r._id} className="bg-white rounded-xl border border-border-color p-5 flex flex-col justify-between">
                                    <div className="mb-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-bold text-text-primary text-md">{r.title}</h4>
                                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded uppercase">{r.semester}</span>
                                        </div>
                                        <p className="text-xs text-text-muted mb-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                                        <p className="text-sm text-text-secondary">{r.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <a href={r.link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#1e3a5f] hover:underline">View Portal Link →</a>
                                        <button onClick={() => handleDeleteResult(r._id)} className="text-xs text-red-500 font-medium hover:underline">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UniAdminDashboard;

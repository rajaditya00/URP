import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

type College = {
    _id: string;
    name: string;
    address: string;
    email: string;
    phone: string;
    principalName: string;
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
    const [activeTab, setActiveTab] = useState<'overview' | 'colleges' | 'modules'>('overview');
    const [showAddCollege, setShowAddCollege] = useState(false);
    const [editingCollege, setEditingCollege] = useState<College | null>(null);
    const [newCollege, setNewCollege] = useState({ name: '', address: '', email: '', phone: '', principalName: '' });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    const token = localStorage.getItem('cc_token');
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    useEffect(() => {
        const stored = localStorage.getItem('cc_user');
        if (!stored || !token) { navigate('/university-login'); return; }
        const u = JSON.parse(stored);
        if (u.role !== 'SUPER_ADMIN') { navigate('/university-login'); return; }
        setUser(u);
        setUniData(u.university);
        loadColleges();
    }, []);

    const loadColleges = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/college', { headers });
            const data = await res.json();
            if (Array.isArray(data)) setColleges(data);
        } catch (e) { console.error(e); }
    };

    const handleAddCollege = async () => {
        if (!newCollege.name) return;
        setSaving(true);
        try {
            const res = await fetch('http://localhost:5000/api/college', {
                method: 'POST', headers, body: JSON.stringify(newCollege)
            });
            if (res.ok) {
                await loadColleges();
                setNewCollege({ name: '', address: '', email: '', phone: '', principalName: '' });
                setShowAddCollege(false);
                showToast('College added successfully!');
            }
        } catch { } finally { setSaving(false); }
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
        if (!window.confirm('Remove this college?')) return;
        await fetch(`http://localhost:5000/api/college/${id}`, { method: 'DELETE', headers });
        setColleges(prev => prev.filter(c => c._id !== id));
        showToast('College removed');
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-body">
            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-[#16a34a] text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in">
                    {toast}
                </div>
            )}

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
                        <button onClick={() => { localStorage.clear(); navigate('/university-login'); }} className="text-xs text-text-muted hover:text-red-500 font-medium">Logout</button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tab Navigation */}
                <div className="flex gap-1 bg-white border border-border-color rounded-xl p-1 w-fit mb-8 shadow-sm">
                    {(['overview', 'colleges', 'modules'] as const).map(t => (
                        <button key={t} onClick={() => setActiveTab(t)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === t ? 'bg-[#1e3a5f] text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
                            {t === 'colleges' ? `Colleges (${colleges.length})` : t === 'modules' ? 'Module Authority' : 'Overview'}
                        </button>
                    ))}
                </div>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                            {[
                                { label: 'Total Colleges', value: colleges.length },
                                { label: 'Plan', value: uniData?.plan || '-' },
                                { label: 'Duration', value: uniData?.duration || '-' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white rounded-xl border border-border-color p-6 shadow-sm">
                                    <p className="text-text-muted text-xs uppercase tracking-wider font-bold">{s.label}</p>
                                    <p className="text-3xl font-bold text-text-primary mt-2 capitalize">{s.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white rounded-xl border border-border-color p-6 shadow-sm">
                            <h3 className="font-bold text-text-primary mb-4">University Information</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                <div><p className="text-text-muted text-xs font-bold uppercase mb-0.5">Registered Email</p><p className="font-medium">{uniData?.email}</p></div>
                                <div><p className="text-text-muted text-xs font-bold uppercase mb-0.5">Phone</p><p className="font-medium">{uniData?.phone}</p></div>
                                <div><p className="text-text-muted text-xs font-bold uppercase mb-0.5">State</p><p className="font-medium">{uniData?.state}</p></div>
                                <div><p className="text-text-muted text-xs font-bold uppercase mb-0.5">Country</p><p className="font-medium">{uniData?.country}</p></div>
                                <div className="col-span-2"><p className="text-text-muted text-xs font-bold uppercase mb-0.5">Address</p><p className="font-medium">{uniData?.address}</p></div>
                            </div>
                        </div>
                    </div>
                )}

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
                                        { label: 'Email', key: 'email' },
                                        { label: 'Phone', key: 'phone' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{f.label}</label>
                                            <input
                                                value={(newCollege as any)[f.key]}
                                                onChange={e => setNewCollege(p => ({ ...p, [f.key]: e.target.value }))}
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
                                <div className="flex gap-3 mt-4">
                                    <button onClick={handleAddCollege} disabled={saving}
                                        className="px-5 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#162d4a] disabled:opacity-60">
                                        {saving ? 'Saving...' : 'Save College'}
                                    </button>
                                    <button onClick={() => setShowAddCollege(false)} className="px-5 py-2 border border-border-color text-text-secondary text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
                                </div>
                            </div>
                        )}

                        {colleges.length === 0 ? (
                            <div className="bg-white rounded-xl border border-border-color p-12 text-center">
                                <p className="font-bold text-text-primary mb-1">No colleges added yet</p>
                                <p className="text-text-secondary text-sm">Click "Add College" to register your affiliated colleges.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {colleges.map(c => (
                                    <div key={c._id} className="bg-white rounded-xl border border-border-color p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-text-primary">{c.name}</h3>
                                            {c.principalName && <p className="text-xs text-text-muted mt-0.5">Principal: {c.principalName}</p>}
                                            {c.address && <p className="text-xs text-text-secondary mt-1">{c.address}</p>}
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
            </div>
        </div>
    );
};

export default UniAdminDashboard;

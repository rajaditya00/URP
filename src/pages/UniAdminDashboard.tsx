import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';
import QuestionBank from '../components/Examination/QuestionBank';

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
    const [activeTab, setActiveTab] = useState<'colleges' | 'questionbank' | 'notices' | 'results'>('questionbank');
    const [editUni, setEditUni] = useState({ introduction: '', phone: '', address: '' });
    const [editLeadership, setEditLeadership] = useState({
        chancellor: { name: '', email: '', message: '' },
        viceChancellor: { name: '', email: '', message: '' }
    });
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

    const token = localStorage.getItem('urp_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    useEffect(() => {
        const stored = localStorage.getItem('urp_user');
        if (!stored || !token) { navigate('/login'); return; }
        const u = JSON.parse(stored);
        if (u.role !== 'SUPER_ADMIN') { navigate('/login'); return; }
        setUser(u);
        setUniData(u.university);

        // Initialize form states
        setEditUni({
            introduction: u.university?.introduction || '',
            phone: u.university?.phone || '',
            address: u.university?.address || ''
        });
        setEditLeadership({
            chancellor: {
                name: u.university?.chancellor?.name || '',
                email: u.university?.chancellor?.email || '',
                message: u.university?.chancellor?.message || ''
            },
            viceChancellor: {
                name: u.university?.viceChancellor?.name || '',
                email: u.university?.viceChancellor?.email || '',
                message: u.university?.viceChancellor?.message || ''
            }
        });

        loadColleges();
        loadNotices();
        loadResults();
    }, []);

    const handleUpdateDetails = async (type: 'overview' | 'leadership') => {
        setSaving(true);
        try {
            const body = type === 'overview' ? editUni : editLeadership;
            const res = await fetch(`http://localhost:5000/api/university/${uniData._id}/details`, {
                method: 'PUT', headers, body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                setUniData(data);
                // Update local storage user object
                const u = { ...user, university: data };
                localStorage.setItem('urp_user', JSON.stringify(u));
                setUser(u);
                showToast(`${type === 'overview' ? 'University Profile' : 'Leadership Details'} Updated Successfully!`);
            } else {
                showToast(data.message || 'Update failed');
            }
        } catch { showToast('Server error during update'); } finally { setSaving(false); }
    };

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
        <div className="min-h-screen flex flex-col bg-[#f8fafc] font-body h-screen">
            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-[110] bg-[#16a34a] text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in">
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

            <ChangePassword isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} tokenOverride={token} />

            {/* Header */}
            <header className="bg-white border-b border-border-color sticky top-0 z-40 shadow-sm flex-shrink-0">
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        {uniData?.logoUrl
                            ? <img src={`http://localhost:5000/${uniData.logoUrl?.replace(/^\/+/, '')}`} alt="logo" className="h-9 max-w-20 object-contain" />
                            : <div className="w-9 h-9 rounded-full bg-[#1e3a5f] text-white font-bold text-sm flex items-center justify-center">{uniData?.name?.charAt(0)}</div>
                        }
                        <div>
                            <p className="font-bold text-text-primary text-sm leading-none">{uniData?.name}</p>
                            <p className="text-text-muted text-xs mt-0.5">Super Administrator Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to={`/portal/${encodeURIComponent(uniData?.name || '')}`} target="_blank" className="text-xs text-[#3b82f6] hover:underline font-medium">View Portal</Link>
                        <button onClick={() => setShowChangePassword(true)} className="text-xs text-text-muted hover:text-accent-primary font-medium">Change Password</button>
                        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 font-bold transition-colors">Logout</button>
                    </div>
                </div>
            </header>

            {/* HORIZONTAL NAVIGATION */}
            <div className="bg-white border-b border-border-color sticky top-16 z-30 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6">
                    <div className="flex space-x-1 overflow-x-auto no-scrollbar">
                        <button onClick={() => setActiveTab('questionbank')} className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'questionbank' ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'}`}>
                            <span>🧠 Master Question Bank</span>
                            <span className="ml-2 bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-bold">AI</span>
                        </button>
                        <button onClick={() => setActiveTab('notices')} className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'notices' ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'}`}>
                            <span>📢 Notices</span>
                        </button>
                        <button onClick={() => setActiveTab('results')} className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'results' ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'}`}>
                            <span>📊 Results</span>
                        </button>
                        <button onClick={() => setActiveTab('colleges')} className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'colleges' ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'}`}>
                            <span>🏛 Colleges & Authority</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 max-w-[1600px] w-full mx-auto overflow-hidden">
                {/* MAIN CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-8 relative">



                    {/* NOTICES TAB */}
                    {activeTab === 'notices' && (
                        <div className="max-w-5xl animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* NOTICES */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl border border-border-color p-6 shadow-sm">
                                    <h3 className="font-bold text-text-primary mb-4">Publish Global Notice</h3>
                                    <div className="space-y-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Title *</label>
                                            <input value={newNotice.title} onChange={e => setNewNotice(p => ({ ...p, title: e.target.value }))} className="w-full h-10 px-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Attach PDF (Optional)</label>
                                            <input type="file" accept="application/pdf" onChange={e => setNewNoticePdf(e.target.files?.[0] || null)} className="w-full h-10 px-3 py-1.5 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Description *</label>
                                            <textarea value={newNotice.description} onChange={e => setNewNotice(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full p-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none" />
                                        </div>
                                    </div>
                                    <button onClick={handleAddNotice} disabled={saving} className="w-full py-2.5 bg-[#1e3a5f] text-white font-semibold text-sm rounded-lg hover:bg-[#162d4a] transition-colors">{saving ? 'Publishing...' : 'Publish Notice'}</button>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-text-muted uppercase text-xs tracking-wider">Recent Notices</h4>
                                    {notices.map(n => (
                                        <div key={n._id} className="bg-white rounded-xl border border-border-color p-4 shadow-sm relative">
                                            <button onClick={() => handleDeleteNotice(n._id)} className="absolute top-4 right-4 text-xs text-red-500 font-medium hover:underline">Delete</button>
                                            <h4 className="font-bold text-text-primary pr-12">{n.title}</h4>
                                            <p className="text-xs text-text-muted my-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                                            <p className="text-sm text-text-secondary mt-2">{n.description}</p>
                                            {n.pdfUrl && (
                                                <a href={`http://localhost:5000/${n.pdfUrl?.replace(/^\/+/, '')}`} target="_blank" rel="noreferrer" className="inline-block mt-3 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-200">
                                                    📄 View PDF
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RESULTS TAB */}
                    {activeTab === 'results' && (
                        <div className="max-w-5xl animate-fade-in space-y-6">
                                <div className="bg-white rounded-xl border border-border-color p-6 shadow-sm">
                                    <h3 className="font-bold text-text-primary mb-4">Publish Exam Result</h3>
                                    <div className="space-y-4 mb-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Title *</label>
                                                <input placeholder="e.g. B.Tech Sem 4" value={newResult.title} onChange={e => setNewResult(p => ({ ...p, title: e.target.value }))} className="w-full h-10 px-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Semester *</label>
                                                <input placeholder="Sem 4" value={newResult.semester} onChange={e => setNewResult(p => ({ ...p, semester: e.target.value }))} className="w-full h-10 px-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Result Link URL *</label>
                                            <input placeholder="https://..." value={newResult.link} onChange={e => setNewResult(p => ({ ...p, link: e.target.value }))} className="w-full h-10 px-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Description</label>
                                            <textarea value={newResult.description} onChange={e => setNewResult(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full p-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none" />
                                        </div>
                                    </div>
                                    <button onClick={handleAddResult} disabled={saving} className="w-full py-2.5 bg-[#1e3a5f] text-white font-semibold text-sm rounded-lg hover:bg-[#162d4a] transition-colors">{saving ? 'Publishing...' : 'Publish Result'}</button>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-text-muted uppercase text-xs tracking-wider">Published Results</h4>
                                    {results.map(r => (
                                        <div key={r._id} className="bg-white rounded-xl border border-border-color p-4 shadow-sm flex flex-col">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-text-primary text-sm">{r.title}</h4>
                                                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block">{r.semester}</span>
                                                </div>
                                                <button onClick={() => handleDeleteResult(r._id)} className="text-xs text-red-500 font-medium hover:underline">Remove</button>
                                            </div>
                                            <a href={r.link} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#1e3a5f] hover:underline mt-3">View Portal Link →</a>
                                        </div>
                                    ))}
                                </div>
                        </div>
                    )}

                    {/* COLLEGES TAB */}
                    {activeTab === 'colleges' && (
                        <div className="max-w-6xl animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-text-primary">Affiliated Colleges & Authority</h2>
                                <button onClick={() => setShowAddCollege(true)} className="px-4 py-2 bg-[#1e3a5f] text-white font-semibold text-sm rounded-lg hover:bg-[#162d4a] transition-colors">
                                    + Register New College
                                </button>
                            </div>

                            {showAddCollege && (
                                <div className="bg-white rounded-xl border border-[#1e3a5f] ring-4 ring-[#1e3a5f]/10 p-6 mb-8 shadow-sm">
                                    <h3 className="font-bold text-text-primary mb-4 text-lg">New College Registration</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { label: 'College Name *', key: 'name' },
                                            { label: 'Principal Name', key: 'principalName' },
                                            { label: 'College Email *', key: 'email', placeholder: 'admin@college.edu — credentials sent here' },
                                            { label: 'Phone', key: 'phone' },
                                        ].map(f => (
                                            <div key={f.key}>
                                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{f.label}</label>
                                                <input
                                                    value={(newCollege as any)[f.key]}
                                                    onChange={e => setNewCollege(p => ({ ...p, [f.key]: e.target.value }))}
                                                    placeholder={(f as any).placeholder || ''}
                                                    className="w-full h-10 px-3 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none"
                                                />
                                            </div>
                                        ))}
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Full Address</label>
                                            <textarea value={newCollege.address} onChange={e => setNewCollege(p => ({ ...p, address: e.target.value }))}
                                                className="w-full h-20 px-3 py-2 border border-[#D0D5DD] rounded-lg text-sm focus:border-[#1e3a5f] outline-none resize-none" />
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                                        <span className="text-xl">📧</span>
                                        <p className="text-xs text-blue-700 font-medium">A login password will be auto-generated and emailed to the college admin address above.</p>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button onClick={handleAddCollege} disabled={saving}
                                            className="px-6 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-lg hover:bg-[#162d4a]">
                                            {saving ? 'Creating & Sending...' : 'Create College & Dispatch Credentials'}
                                        </button>
                                        <button onClick={() => setShowAddCollege(false)} className="px-6 py-2.5 border border-border-color text-text-secondary text-sm font-bold rounded-lg hover:bg-gray-50">Cancel</button>
                                    </div>
                                </div>
                            )}

                            {colleges.length === 0 ? (
                                <div className="bg-white rounded-xl border border-border-color p-12 text-center shadow-sm">
                                    <div className="text-4xl mb-4">🏫</div>
                                    <p className="font-bold text-text-primary text-lg mb-1">No colleges added yet</p>
                                    <p className="text-text-secondary text-sm">Click "Register New College" to add affiliations.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {colleges.map(c => (
                                        <div key={c._id} className="bg-white rounded-xl border border-border-color overflow-hidden shadow-sm">
                                            {/* Header */}
                                            <div className="px-6 py-4 bg-[#f8fafc] border-b border-border-color flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h3 className="font-bold text-text-primary text-lg">{c.name}</h3>
                                                    {c.principalName && <p className="text-xs text-text-secondary mt-0.5">Principal: {c.principalName}</p>}
                                                </div>
                                                <button onClick={() => handleDeleteCollege(c._id)} className="px-3 py-1.5 border border-red-200 text-red-500 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                                                    Remove College
                                                </button>
                                            </div>

                                            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                {/* Credentials Panel */}
                                                <div className="lg:col-span-1 border-r border-border-color pr-6">
                                                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Login Credentials</h4>
                                                    {c.adminUser ? (
                                                        <div className="space-y-3 text-sm">
                                                            <div>
                                                                <p className="text-[10px] text-text-muted font-bold uppercase">College ID</p>
                                                                <p className="font-mono font-bold text-[#1e3a5f]">{c.generatedCredential || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-text-muted font-bold uppercase">Admin Email</p>
                                                                <p className="font-mono font-semibold text-text-primary">{c.adminUser.email}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-text-muted font-bold uppercase">Password</p>
                                                                <p className="font-mono font-bold text-[#16a34a]">{c.generatedPassword || 'N/A'}</p>
                                                            </div>
                                                            {(!c.generatedCredential || !c.generatedPassword) && (
                                                                <button onClick={() => handleGenerateCredentials(c._id, c.name)} disabled={saving} className="mt-2 w-full py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded font-bold text-[10px] uppercase hover:bg-blue-100 transition-colors">
                                                                    Generate Credentials
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-red-500">No admin account found.</p>
                                                    )}

                                                    <div className="mt-6 pt-4 border-t border-slate-100">
                                                        <a href={`/login`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full text-center py-2.5 bg-[#1e3a5f] text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#162d4a] transition-all shadow-sm">
                                                            <span>Login to Admin Portal</span>
                                                            <span>↗</span>
                                                        </a>
                                                    </div>
                                                </div>

                                                {/* Module Authority Panel */}
                                                <div className="lg:col-span-2">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Module Authority Overrides</h4>
                                                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded-full">{Object.values(c.modules).filter(Boolean).length} Active</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {MODULE_LIST.map(m => {
                                                            const enabled = c.modules[m.key as keyof typeof c.modules];
                                                            return (
                                                                <div key={m.key} onClick={() => handleToggleModule(c, m.key, !enabled)} className={`border rounded-xl p-3 cursor-pointer transition-colors select-none flex items-center justify-between gap-2 ${enabled ? 'border-[#16a34a] bg-green-50' : 'border-border-color hover:border-gray-300'}`}>
                                                                    <div>
                                                                        <p className="font-bold text-xs text-text-primary leading-tight">{m.label}</p>
                                                                        <p className="text-[10px] text-text-muted mt-0.5 leading-tight truncate">{m.desc}</p>
                                                                    </div>
                                                                    <div className={`w-8 h-5 rounded-full transition-colors flex-shrink-0 flex items-center ${enabled ? 'bg-[#16a34a]' : 'bg-gray-200'}`}>
                                                                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform mx-1 ${enabled ? 'translate-x-3' : 'translate-x-0'}`} />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* QUESTION BANK TAB */}
                    {activeTab === 'questionbank' && (
                        <div className="animate-fade-in max-w-[1450px] mx-auto space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-color pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-text-primary">Master Question Bank Repository</h2>
                                    <p className="text-sm text-text-secondary mt-1">Cross-institutional question bank powered by trained neural novelty prediction models.</p>
                                </div>
                                <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 self-start sm:self-center">
                                    🎓 Role Scope: University Exam Controller
                                </div>
                            </div>
                            <QuestionBank role="SUPER_ADMIN" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UniAdminDashboard;

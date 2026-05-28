import BASE_URL from '../config/api';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    BookOpen, Bell, FileText, Globe, Award, ShieldCheck,
    Calendar, Sparkles, Trophy, CheckCircle2, ChevronRight, Info, AlertTriangle, List, Check,
    Plus, Trash2, Shield, Lock, Key, Server, Upload, Send, School, Building, Loader2
} from 'lucide-react';
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


const DEFAULT_MOCK_NOTICES = [
    {
        _id: 'mock-notice-1',
        title: 'Revised End-Semester Exam Schedule 2026',
        createdAt: new Date().toISOString(),
        description: 'The controller of examinations has released the revised academic guidelines and timetables for the upcoming semester examinations. Department deans should ensure compliance.'
    },
    {
        _id: 'mock-notice-2',
        title: "Bloom's Taxonomy Credit Directives",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        description: "University-wide guidelines are now active requiring all question paper setters to align exam papers with IntelliQ Bloom's cognitive rigor mapping (Levels 1–5)."
    },
    {
        _id: 'mock-notice-3',
        title: 'Centralized PYQ Database Integration',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        description: 'Mock data and live exam history vectors have been successfully indexed. Novelty checking modules are now fully operational for affiliated college paper setters.'
    }
];

const MODULE_LIST = [
    { key: 'examination', label: 'Examination Controller', desc: 'Access to Examination module' },
    { key: 'addQuestions', label: 'Add Questions', desc: 'Add questions to question bank' },
    { key: 'verifyStudentForms', label: 'Verify Student Forms', desc: 'Approve/reject exam enrollment forms' },
    { key: 'placement', label: 'Placement Module', desc: 'Access to placement drives & listings' },
    { key: 'grievance', label: 'Grievance Module', desc: 'Handle student complaints' },
    { key: 'notices', label: 'Notices', desc: 'Post announcements and circulars' },
];

const MODULE_ICON_MAP = {
    examination: ShieldCheck,
    addQuestions: BookOpen,
    verifyStudentForms: CheckCircle2,
    placement: Trophy,
    grievance: AlertTriangle,
    notices: Bell,
};

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

    const [newNotice, setNewNotice] = useState({ title: '', description: '', type: 'Important' });
    const [newNoticePdf, setNewNoticePdf] = useState<File | null>(null);
    const [newResult, setNewResult] = useState({ title: '', semester: '', link: '', linkText: '', description: '' });

    // Faculty Question Bank Directives & Rankings State
    const [minQuestions, setMinQuestions] = useState<number>(() => {
        return Number(localStorage.getItem('urp_min_questions') || '15');
    });
    const [deadlineDate, setDeadlineDate] = useState<string>(() => {
        return localStorage.getItem('urp_deadline_date') || '2026-06-15';
    });
    const [directiveActive, setDirectiveActive] = useState<boolean>(() => {
        return localStorage.getItem('urp_directive_active') !== 'false';
    });
    const [directiveMessage, setDirectiveMessage] = useState<string>(() => {
        return localStorage.getItem('urp_directive_message') || '';
    });
    const [editingDirectives, setEditingDirectives] = useState(false);
    const [inputMinQuestions, setInputMinQuestions] = useState(minQuestions);
    const [inputDeadlineDate, setInputDeadlineDate] = useState(deadlineDate);
    const [inputDirectiveActive, setInputDirectiveActive] = useState(directiveActive);
    const [inputDirectiveMessage, setInputDirectiveMessage] = useState(directiveMessage);

    const [professorsList, setProfessorsList] = useState<any[]>(() => {
        const stored = localStorage.getItem('urp_professors_credits');
        let list = [];
        if (stored) {
            try {
                list = JSON.parse(stored);
            } catch (e) {
                list = [];
            }
        }

        const defaultList = [
            { id: '1', name: 'Dr. Vijay Kumar', subject: 'CS601 (Computer Networks)', submitted: 18, approved: 18, novel: 6, dept: 'Computer Science', credits: 150 },
            { id: '2', name: 'Prof. Ashish Kumar', subject: 'CS602 (DBMS)', submitted: 16, approved: 15, novel: 4, dept: 'Computer Science', credits: 115 },
            { id: '3', name: 'Dr. Dipak Kumar Chaudhary', subject: 'CS603 (Operating Systems)', submitted: 12, approved: 12, novel: 1, dept: 'Computer Science', credits: 70 },
            { id: '4', name: 'Prof. Shweta Kumari', subject: 'CS604 (Cloud Computing)', submitted: 10, approved: 8, novel: 0, dept: 'Computer Science', credits: 40 },
            { id: '5', name: 'Dr. Nancy Priya', subject: 'CS605 (Software Engineering)', submitted: 15, approved: 14, novel: 3, dept: 'Computer Science', credits: 100 }
        ];

        if (!list || list.length === 0) {
            return defaultList;
        }

        // Migrate any old names in local storage
        const nameMap: Record<string, string> = {
            'Dr. Alan Turing': 'Dr. Vijay Kumar',
            'Prof. Grace Hopper': 'Prof. Ashish Kumar',
            'Dr. Linus Torvalds': 'Dr. Dipak Kumae Chaudhary',
            'Prof. Satya Nadella': 'Prof. Shweta Kumari',
            'Dr. Margaret Hamilton': 'Dr. Nancy Priya'
        };

        let modified = false;
        const migratedList = list.map((p: any) => {
            if (nameMap[p.name]) {
                modified = true;
                return { ...p, name: nameMap[p.name] };
            }
            return p;
        });

        if (modified) {
            localStorage.setItem('urp_professors_credits', JSON.stringify(migratedList));
        }

        return migratedList;
    });

    useEffect(() => {
        localStorage.setItem('urp_professors_credits', JSON.stringify(professorsList));
    }, [professorsList]);

    const calculateProfessorRank = (novelCount: number) => {
        if (novelCount >= 5) return { tier: 'Platinum Scholar', color: 'bg-indigo-50 border-indigo-100 text-indigo-700', icon: '🏆' };
        if (novelCount >= 3) return { tier: 'Gold Contributor', color: 'bg-amber-50 border-amber-100 text-amber-700', icon: '⭐' };
        if (novelCount >= 1) return { tier: 'Expert Scholar', color: 'bg-blue-50 border-blue-100 text-blue-700', icon: '📘' };
        return { tier: 'Associate Contributor', color: 'bg-slate-50 border-slate-100 text-slate-500', icon: '👤' };
    };

    const handleSaveDirectives = () => {
        setMinQuestions(inputMinQuestions);
        setDeadlineDate(inputDeadlineDate);
        setDirectiveActive(inputDirectiveActive);
        setDirectiveMessage(inputDirectiveMessage);
        localStorage.setItem('urp_min_questions', String(inputMinQuestions));
        localStorage.setItem('urp_deadline_date', inputDeadlineDate);
        localStorage.setItem('urp_directive_active', String(inputDirectiveActive));
        localStorage.setItem('urp_directive_message', inputDirectiveMessage);
        setEditingDirectives(false);
        window.dispatchEvent(new Event('storage_local'));
        showToast(inputDirectiveActive ? 'Professor question directives broadcasted!' : 'Professor directives suspended/deactivated!');
    };

    const handleApproveProfessorQuestions = (profId: string) => {
        setProfessorsList(prev => prev.map(p => {
            if (p.id === profId) {
                const diff = p.submitted - p.approved;
                if (diff <= 0) return p;
                const newApproved = p.submitted;
                let currentCredits = p.credits !== undefined ? p.credits : (p.approved * 5 + p.novel * 10);
                currentCredits += (diff * 4); // Add +4 credits per question approved via ledger
                showToast(`Questions approved. Credits updated for ${p.name}!`);
                return { ...p, approved: newApproved, credits: currentCredits };
            }
            return p;
        }));
    };

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
            const res = await fetch(`${BASE_URL}/api/university/${uniData._id}/details`, {
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
            const res = await fetch(BASE_URL + '/api/notice', { headers });
            const data = await res.json();
            if (Array.isArray(data)) {
                if (data.length > 0) {
                    setNotices(data);
                } else {
                    setNotices(DEFAULT_MOCK_NOTICES);
                }
            } else {
                setNotices(DEFAULT_MOCK_NOTICES);
            }
        } catch (e) {
            console.error('Failed to load notices', e);
            setNotices(DEFAULT_MOCK_NOTICES);
        }
    };

    const loadResults = async () => {
        try {
            const res = await fetch(BASE_URL + '/api/result', { headers });
            const data = await res.json();
            if (Array.isArray(data)) setResults(data);
        } catch (e) { console.error('Failed to load results', e); }
    };

    const loadColleges = async () => {
        try {
            const res = await fetch(BASE_URL + '/api/college', { headers });
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
            const res = await fetch(BASE_URL + '/api/college', {
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
            const res = await fetch(`${BASE_URL}/api/college/${college._id}`, {
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
        await fetch(`${BASE_URL}/api/college/${id}`, { method: 'DELETE', headers });
        setColleges(prev => prev.filter(c => c._id !== id));
        showToast('College removed');
    };

    const handleGenerateCredentials = async (id: string, collegeName: string) => {
        if (!window.confirm(`Generate new login credentials for ${collegeName} and immediately email them to the college admin?`)) return;
        setSaving(true);
        try {
            const res = await fetch(`${BASE_URL}/api/college/${id}/credentials`, { method: 'POST', headers });
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
            form.append('type', newNotice.type || 'Important');
            if (newNoticePdf) form.append('noticePdf', newNoticePdf);

            const fetchHeaders = new Headers();
            fetchHeaders.append('Authorization', `Bearer ${token}`);

            const res = await fetch(BASE_URL + '/api/notice', {
                method: 'POST', headers: fetchHeaders, body: form
            });
            if (res.ok) {
                await loadNotices();
                setNewNotice({ title: '', description: '', type: 'Important' });
                setNewNoticePdf(null);
                showToast('Notice announced!');
            }
        } catch { showToast('Server error'); } finally { setSaving(false); }
    };

    const handleDeleteNotice = async (id: string) => {
        if (!window.confirm('Delete this notice?')) return;
        await fetch(`${BASE_URL}/api/notice/${id}`, { method: 'DELETE', headers });
        await loadNotices(); showToast('Notice deleted');
    };

    const handleAddResult = async () => {
        if (!newResult.title || !newResult.semester || !newResult.link) return showToast('Fill all required fields');
        setSaving(true);
        try {
            const body = {
                ...newResult,
                linkText: newResult.linkText || 'View Result Document'
            };
            const res = await fetch(BASE_URL + '/api/result', {
                method: 'POST', headers, body: JSON.stringify(body)
            });
            if (res.ok) {
                await loadResults();
                setNewResult({ title: '', semester: '', link: '', linkText: '', description: '' });
                showToast('Result published!');
            }
        } catch { showToast('Server error'); } finally { setSaving(false); }
    };

    const handleDeleteResult = async (id: string) => {
        if (!window.confirm('Delete this result record?')) return;
        await fetch(`${BASE_URL}/api/result/${id}`, { method: 'DELETE', headers });
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
            <header className="bg-gradient-to-r from-[#111c2e]/90 via-[#1a2d48]/85 to-[#1c3254]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.15)] flex-shrink-0">
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between w-full relative">
                    <div className="flex items-center gap-4">
                        {uniData?.logoUrl
                            ? <img src={`${BASE_URL}/${uniData.logoUrl?.replace(/^\/+/, '')}`} alt="logo" className="h-9 max-w-20 object-contain" />
                            : <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm flex items-center justify-center shadow-inner">{uniData?.name?.charAt(0)}</div>
                        }
                        <div>
                            <p className="font-bold text-white text-sm leading-none">{uniData?.name}</p>
                            <p className="text-slate-300 text-[10px] font-medium mt-1 uppercase tracking-wider">Super Administrator Dashboard</p>
                        </div>
                    </div>

                    {/* Middle Role Scope Section */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-white/15 rounded-full shadow-[0_2px_12px_rgba(99,102,241,0.15)] text-[10px] font-black uppercase tracking-wider text-white">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                        Role Scope: University Exam Controller
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to={`/portal/${encodeURIComponent(uniData?.name || '')}`} target="_blank" className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-white font-bold transition-all shadow-sm">View Portal</Link>
                        <button onClick={() => setShowChangePassword(true)} className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-white font-bold transition-all shadow-sm">Change Password</button>
                        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-xs px-4 py-1.5 bg-red-500/25 border border-red-500/35 text-red-200 rounded-xl hover:bg-red-500/35 hover:text-white font-bold transition-all shadow-sm">Logout</button>
                    </div>
                </div>
            </header>

            {/* HORIZONTAL NAVIGATION */}
            <div className="bg-[#16253c]/90 backdrop-blur-md border-b border-white/5 sticky top-16 z-30 shadow-[0_10px_35px_rgba(0,0,0,0.1)]">
                <div className="max-w-[1600px] mx-auto px-6">
                    <div className="flex space-x-1 overflow-x-auto no-scrollbar">
                        <button onClick={() => setActiveTab('questionbank')} className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'questionbank' ? 'border-sky-400 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'}`}>
                            <BookOpen size={16} className={activeTab === 'questionbank' ? 'text-sky-300' : 'text-slate-400'} />
                            <span>Master Question Bank</span>
                            <span className="ml-1 bg-indigo-500/20 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded font-bold border border-indigo-500/30">AI</span>
                        </button>
                        <button onClick={() => setActiveTab('notices')} className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'notices' ? 'border-sky-400 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'}`}>
                            <Bell size={16} className={activeTab === 'notices' ? 'text-sky-300' : 'text-slate-400'} />
                            <span>Notices</span>
                        </button>
                        <button onClick={() => setActiveTab('results')} className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'results' ? 'border-sky-400 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'}`}>
                            <FileText size={16} className={activeTab === 'results' ? 'text-sky-300' : 'text-slate-400'} />
                            <span>Results</span>
                        </button>
                        <button onClick={() => setActiveTab('colleges')} className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'colleges' ? 'border-sky-400 text-sky-300' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'}`}>
                            <Globe size={16} className={activeTab === 'colleges' ? 'text-sky-300' : 'text-slate-400'} />
                            <span>Colleges & Authority</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 w-full mx-auto overflow-hidden">
                {/* MAIN CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-8 relative">



                    {/* NOTICES TAB */}
                    {activeTab === 'notices' && (
                        <div className="w-full animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: Form Card */}
                            <div className="glass-card-premium p-6 h-fit">
                                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Bell size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#1e3a5f] text-base leading-none">Publish Global Notice</h3>
                                        <p className="text-[10px] text-text-muted mt-1">Broadcast official announcements to all portals</p>
                                    </div>
                                </div>
                                <div className="space-y-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <FileText size={12} className="text-[#1e3a5f]/60" /> Title *
                                        </label>
                                        <input value={newNotice.title} onChange={e => setNewNotice(p => ({ ...p, title: e.target.value }))} className="w-full h-10 px-3.5 bg-white/60 border border-slate-200 rounded-xl text-sm focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all placeholder:text-slate-450" placeholder="Enter circular title..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <Sparkles size={12} className="text-[#1e3a5f]/60" /> Notice Category / Tag *
                                        </label>
                                        <select
                                            value={newNotice.type || 'Important'}
                                            onChange={e => setNewNotice(p => ({ ...p, type: e.target.value }))}
                                            className="w-full h-10 px-3.5 bg-white/60 border border-slate-200 rounded-xl text-sm focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all font-semibold text-slate-700 cursor-pointer"
                                        >
                                            <option value="Important">Important Notices</option>
                                            <option value="Alert">Alert Notices</option>
                                            <option value="General">General Notices</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <Upload size={12} className="text-[#1e3a5f]/60" /> Attach PDF (Optional)
                                        </label>
                                        <div className="relative">
                                            <input type="file" id="notice-pdf" accept="application/pdf" onChange={e => setNewNoticePdf(e.target.files?.[0] || null)} className="hidden" />
                                            <label htmlFor="notice-pdf" className="flex items-center justify-between w-full h-10 px-3.5 border border-slate-200 rounded-xl text-sm bg-white/60 hover:bg-white cursor-pointer transition-all hover:border-[#1e3a5f] group">
                                                <span className="text-slate-500 text-xs truncate max-w-[250px]">
                                                    {newNoticePdf ? `📄 ${newNoticePdf.name}` : 'Select university circular PDF...'}
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#1e3a5f] bg-[#1e3a5f]/5 group-hover:bg-[#1e3a5f]/10 px-2.5 py-1 rounded-lg transition-colors">
                                                    <Upload size={10} /> Browse
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <Info size={12} className="text-[#1e3a5f]/60" /> Description *
                                        </label>
                                        <textarea value={newNotice.description} onChange={e => setNewNotice(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full p-3.5 bg-white/60 border border-slate-200 rounded-xl text-sm focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all placeholder:text-slate-450 resize-none" placeholder="Enter announcement body text..." />
                                    </div>
                                </div>
                                <button onClick={handleAddNotice} disabled={saving} className="w-full py-3 bg-gradient-to-r from-[#1e3a5f] to-[#2b4b7a] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-indigo-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    {saving ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Publishing announcement...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={14} />
                                            <span>Publish Global Notice</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Right Column: Recent Notices List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-200/50 pb-2.5">
                                    <h4 className="font-bold text-[#1e3a5f] text-sm tracking-wide">Recent Broadcasts</h4>
                                    <button
                                        onClick={() => navigate('/notices')}
                                        className="text-[10px] font-black text-indigo-600 hover:text-indigo-850 uppercase tracking-widest flex items-center gap-0.5 hover:underline"
                                    >
                                        View Notice Board →
                                    </button>
                                </div>
                                {notices.slice(0, 3).map(n => (
                                    <div key={n._id} className="glass-card-premium p-5 relative">
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">Global Circular</span>
                                            <button onClick={() => handleDeleteNotice(n._id)} className="text-xs text-red-500 hover:text-red-750 font-black transition-colors flex items-center gap-1">
                                                <Trash2 size={11} /> Delete
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-text-primary text-base mb-1">{n.title}</h4>
                                        <p className="text-[10px] text-text-muted font-semibold flex items-center gap-1 mb-3">
                                            <Calendar size={11} /> {new Date(n.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-text-secondary leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 mb-3">{n.description}</p>
                                        {n.pdfUrl && (
                                            <a href={`${BASE_URL}/${n.pdfUrl?.replace(/^\/+/, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold border border-red-200/60 transition-colors shadow-sm">
                                                <span>📄</span>
                                                <span>View Attachment PDF</span>
                                            </a>
                                        )}
                                    </div>
                                ))}
                                {notices.length > 3 && (
                                    <button
                                        onClick={() => navigate('/notices')}
                                        className="w-full py-3 bg-white/60 hover:bg-white border border-slate-200/50 hover:border-slate-300 rounded-2xl text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-all cursor-pointer text-center shadow-sm"
                                    >
                                        Show More Notices ({notices.length - 3} older circulars)
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* RESULTS TAB */}
                    {activeTab === 'results' && (
                        <div className="w-full animate-fade-in space-y-6">
                            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:bg-white/85 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Award size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#1e3a5f] text-base leading-none">Publish Exam Result</h3>
                                        <p className="text-[10px] text-text-muted mt-1">Publish semester sheets and links to portals</p>
                                    </div>
                                </div>
                                <div className="space-y-4 mb-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Trophy size={12} className="text-[#1e3a5f]/60" /> Title *
                                            </label>
                                            <input placeholder="e.g. B.Tech Sem 4" value={newResult.title} onChange={e => setNewResult(p => ({ ...p, title: e.target.value }))} className="w-full h-10 px-3.5 bg-white/60 border border-slate-200 rounded-xl text-sm focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all placeholder:text-slate-450" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Calendar size={12} className="text-[#1e3a5f]/60" /> Semester *
                                            </label>
                                            <select
                                                value={newResult.semester}
                                                onChange={e => setNewResult(p => ({ ...p, semester: e.target.value }))}
                                                className="w-full h-10 px-3.5 bg-white/60 border border-slate-200 rounded-xl text-sm focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all font-semibold text-slate-700 cursor-pointer"
                                            >
                                                <option value="">Select Semester</option>
                                                <option value="Semester 1">Semester 1 (First Year)</option>
                                                <option value="Semester 2">Semester 2 (First Year)</option>
                                                <option value="Semester 3">Semester 3 (Second Year)</option>
                                                <option value="Semester 4">Semester 4 (Second Year)</option>
                                                <option value="Semester 5">Semester 5 (Third Year)</option>
                                                <option value="Semester 6">Semester 6 (Third Year)</option>
                                                <option value="Semester 7">Semester 7 (Final Year)</option>
                                                <option value="Semester 8">Semester 8 (Final Year)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Globe size={12} className="text-[#1e3a5f]/60" /> Result Link URL *
                                            </label>
                                            <input placeholder="https://..." value={newResult.link} onChange={e => setNewResult(p => ({ ...p, link: e.target.value }))} className="w-full h-10 px-3.5 bg-white/60 border border-slate-200 rounded-xl text-sm focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all placeholder:text-slate-450" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <FileText size={12} className="text-[#1e3a5f]/60" /> Link Text Label *
                                            </label>
                                            <input placeholder="e.g. View Grade Sheet Document" value={newResult.linkText} onChange={e => setNewResult(p => ({ ...p, linkText: e.target.value }))} className="w-full h-10 px-3.5 bg-white/60 border border-slate-200 rounded-xl text-sm focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all placeholder:text-slate-450" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <Info size={12} className="text-[#1e3a5f]/60" /> Description
                                        </label>
                                        <textarea value={newResult.description} onChange={e => setNewResult(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full p-3.5 bg-white/60 border border-slate-200 rounded-xl text-sm focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all placeholder:text-slate-450 resize-none" placeholder="Enter optional result details..." />
                                    </div>
                                </div>
                                <button onClick={handleAddResult} disabled={saving} className="w-full py-3 bg-gradient-to-r from-[#1e3a5f] to-[#2b4b7a] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-indigo-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    {saving ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Publishing result links...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Award size={14} />
                                            <span>Publish Semester Result</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-text-muted uppercase text-xs tracking-wider">Published Results</h4>
                                {results.map(r => (
                                    <div key={r._id} className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/50 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col transition-all hover:bg-white hover:shadow-[0_8px_25px_rgb(0,0,0,0.05)] hover:border-slate-300/60">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                                    <Trophy size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-text-primary text-base">{r.title}</h4>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-[9px] bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black px-2 py-0.5 rounded shadow-[0_2px_8px_rgba(59,130,246,0.15)] uppercase">{r.semester}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteResult(r._id)} className="text-xs text-red-500 hover:text-red-750 font-black transition-colors flex items-center gap-1">
                                                <Trash2 size={11} /> Remove
                                            </button>
                                        </div>
                                        {r.description && <p className="text-xs text-text-secondary mt-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">{r.description}</p>}
                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center">
                                            <a href={r.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1e3a5f]/5 text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white rounded-xl text-xs font-bold transition-all border border-[#1e3a5f]/10 shadow-sm">
                                                <span>{r.linkText || 'View Portal Link'} 🔗</span>
                                                <ChevronRight size={13} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* COLLEGES TAB */}
                    {activeTab === 'colleges' && (
                        <div className="w-full animate-fade-in">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-50/50 backdrop-blur-sm border border-slate-200/50 p-6 rounded-3xl shadow-sm">
                                <div>
                                    <h2 className="text-2xl font-black text-[#1e3a5f] font-heading flex items-center gap-2">
                                        <School className="text-[#1e3a5f]" /> Affiliated Colleges & Authority
                                    </h2>
                                    <p className="text-xs text-text-muted mt-1">Manage partner universities, active module scopes, and administrator accounts</p>
                                </div>
                                <button onClick={() => setShowAddCollege(true)} className="px-5 py-2.5 bg-gradient-to-r from-[#1e3a5f] to-[#2d4d7c] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-indigo-950/15 active:scale-[0.97] transition-all flex items-center gap-1.5">
                                    <Plus size={14} /> Register New College
                                </button>
                            </div>

                            {showAddCollege && (
                                <div className="bg-white/65 backdrop-blur-md rounded-2xl border border-[#1e3a5f]/30 ring-4 ring-[#1e3a5f]/5 p-6 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)]">
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
                                <div className="bg-white/65 backdrop-blur-md rounded-3xl border border-slate-200/50 p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                                    <div className="text-4xl mb-4">🏫</div>
                                    <p className="font-bold text-text-primary text-lg mb-1">No colleges added yet</p>
                                    <p className="font-black text-text-primary text-xl mb-1">No colleges added yet</p>
                                    <p className="text-text-secondary text-sm uppercase font-bold tracking-wider">Click "Register New College" to add affiliations.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {colleges.map(c => (
                                        <div key={c._id} className="bg-white/75 backdrop-blur-md rounded-3xl border border-slate-200/50 overflow-hidden shadow-[0_10px_35px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_45px_rgb(0,0,0,0.06)] hover:bg-white/85 transition-all mb-8">
                                            {/* Header */}
                                            <div className="px-6 py-5 bg-slate-50/50 backdrop-blur-sm border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f]">
                                                        <School size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-text-primary text-base">{c.name}</h3>
                                                        {c.principalName && <p className="text-xs text-text-secondary mt-0.5 font-medium flex items-center gap-1">Principal: <span className="font-bold text-[#1e3a5f]">{c.principalName}</span></p>}
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteCollege(c._id)} className="px-3.5 py-2 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all flex items-center gap-1">
                                                    <Trash2 size={12} /> Remove College
                                                </button>
                                            </div>

                                            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                {/* Credentials Panel */}
                                                <div className="lg:col-span-1 lg:border-r border-slate-200/50 pr-6 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-1.5">
                                                            <Lock size={12} className="text-text-muted" /> Login Credentials
                                                        </h4>
                                                        {c.adminUser ? (
                                                            <div className="space-y-4 text-sm bg-slate-50/50 backdrop-blur-sm border border-slate-200/40 p-4 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                                                                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/50">
                                                                    <div>
                                                                        <p className="text-[9px] text-text-muted font-black uppercase tracking-wider">College ID</p>
                                                                        <p className="font-mono font-bold text-[#1e3a5f] mt-0.5 text-xs">{c.generatedCredential || 'N/A'}</p>
                                                                    </div>
                                                                    <div className="w-7 h-7 rounded-lg bg-[#1e3a5f]/5 flex items-center justify-center text-[#1e3a5f]/70">
                                                                        <Building size={14} />
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/50">
                                                                    <div>
                                                                        <p className="text-[9px] text-text-muted font-black uppercase tracking-wider">Admin Email</p>
                                                                        <p className="font-mono font-bold text-text-primary mt-0.5 text-xs truncate max-w-[150px]">{c.adminUser.email}</p>
                                                                    </div>
                                                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600/70">
                                                                        <Globe size={14} />
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-[9px] text-text-muted font-black uppercase tracking-wider">Password</p>
                                                                        <p className="font-mono font-black text-emerald-600 mt-0.5 text-xs">{c.generatedPassword || 'N/A'}</p>
                                                                    </div>
                                                                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600/70">
                                                                        <Key size={14} />
                                                                    </div>
                                                                </div>
                                                                {(!c.generatedCredential || !c.generatedPassword) && (
                                                                    <button onClick={() => handleGenerateCredentials(c._id, c.name)} disabled={saving} className="mt-2 w-full py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded font-bold text-[10px] uppercase hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
                                                                        <Key size={12} /> Generate Credentials
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 bg-red-50/50 border border-red-200/50 rounded-2xl text-center text-xs text-red-500 font-bold flex items-center gap-1 justify-center">
                                                                <AlertTriangle size={14} /> No admin account found.
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-6">
                                                        <a href={`/login`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full text-center py-3 bg-[#1e3a5f] hover:bg-[#152c4a] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all">
                                                            <span>Login to Admin Portal</span>
                                                            <ChevronRight size={14} />
                                                        </a>
                                                    </div>
                                                </div>

                                                {/* Module Authority Panel */}
                                                <div className="lg:col-span-2">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                            <Server size={12} className="text-text-muted" /> Module Authority Overrides
                                                        </h4>
                                                        <span className="text-[10px] font-black bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/25 px-2.5 py-0.5 rounded-full">{Object.values(c.modules).filter(Boolean).length} Active</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {MODULE_LIST.map(m => {
                                                            const enabled = c.modules[m.key as keyof typeof c.modules];
                                                            const IconComponent = MODULE_ICON_MAP[m.key as keyof typeof MODULE_ICON_MAP] || Info;
                                                            return (
                                                                <div key={m.key} onClick={() => handleToggleModule(c, m.key, !enabled)} className={`border rounded-2xl p-3.5 cursor-pointer transition-all select-none flex items-center justify-between gap-3 ${enabled ? 'border-emerald-500/30 bg-emerald-50/40 backdrop-blur-sm shadow-[0_2px_10px_rgba(16,185,129,0.06)]' : 'border-slate-200 bg-white/40 backdrop-blur-sm hover:bg-white/80 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)]'}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${enabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                                            <IconComponent size={15} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-xs text-text-primary leading-tight">{m.label}</p>
                                                                            <p className="text-[10px] text-text-muted mt-0.5 leading-tight max-w-[150px] truncate">{m.desc}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`w-8 h-5 rounded-full transition-colors flex-shrink-0 flex items-center ${enabled ? 'bg-[#16a34a]' : 'bg-slate-200'}`}>
                                                                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform mx-1 ${enabled ? 'translate-x-3.5' : 'translate-x-0'}`} />
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
                            </div>

                            {/* Professor Directives & Contribution Ledger */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Side: Directive Broadcast Control */}
                                <div className="lg:col-span-4 bg-white rounded-2xl border border-border-color p-5 shadow-sm space-y-4 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                                <Bell size={14} className="text-indigo-600 animate-pulse" /> Faculty Directives Broadcast
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (editingDirectives) {
                                                        handleSaveDirectives();
                                                    } else {
                                                        setInputMinQuestions(minQuestions);
                                                        setInputDeadlineDate(deadlineDate);
                                                        setInputDirectiveActive(directiveActive);
                                                        setInputDirectiveMessage(directiveMessage);
                                                        setEditingDirectives(true);
                                                    }
                                                }}
                                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wider cursor-pointer"
                                            >
                                                {editingDirectives ? 'Broadcast Now' : 'Edit Directive'}
                                            </button>
                                        </div>

                                        {editingDirectives ? (
                                            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                                                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Directive Status</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setInputDirectiveActive(!inputDirectiveActive)}
                                                        className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border transition-colors ${inputDirectiveActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}
                                                    >
                                                        {inputDirectiveActive ? 'Active (ON)' : 'Suspended (OFF)'}
                                                    </button>
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Minimum Questions Per Course</label>
                                                    <input
                                                        type="number"
                                                        value={inputMinQuestions}
                                                        onChange={e => setInputMinQuestions(Math.max(1, Number(e.target.value)))}
                                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-500 outline-none text-slate-800"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Submission Deadline</label>
                                                    <input
                                                        type="date"
                                                        value={inputDeadlineDate}
                                                        onChange={e => setInputDeadlineDate(e.target.value)}
                                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-500 outline-none text-slate-800"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Custom Message / Announcement (Optional)</label>
                                                    <textarea
                                                        value={inputDirectiveMessage}
                                                        onChange={e => setInputDirectiveMessage(e.target.value)}
                                                        placeholder="Enter custom text to override the default countdown guidelines banner..."
                                                        rows={2}
                                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-500 outline-none text-slate-800 resize-none"
                                                    />
                                                </div>
                                                <div className="flex gap-2 pt-1">
                                                    <button onClick={handleSaveDirectives} className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors">Save</button>
                                                    <button onClick={() => setEditingDirectives(false)} className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-slate-100">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Min Target</span>
                                                        <span className="text-sm font-black text-slate-900">{minQuestions} Qs / course</span>
                                                    </div>
                                                    <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Deadline</span>
                                                        <span className="text-xs font-bold text-indigo-600">{new Date(deadlineDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/40 rounded-xl">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Broadcast Status</span>
                                                    {directiveActive ? (
                                                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[8px] font-black uppercase tracking-wider rounded-md">ACTIVE</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[8px] font-black uppercase tracking-wider rounded-md">OFF / SUSPENDED</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Notification Banner Preview */}
                                        <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-4 space-y-2">
                                            <span className="text-[8px] font-black bg-indigo-200 text-indigo-700 border border-indigo-300 px-2 py-0.5 rounded uppercase tracking-widest inline-block">
                                                Active Professor Banner Preview
                                            </span>
                                            <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                                                {directiveActive ? (
                                                    directiveMessage ? (
                                                        <>📢 <strong>CONTROLLER DIRECTIVE:</strong> {directiveMessage}</>
                                                    ) : (
                                                        <>📢 <strong>CONTROLLER DIRECTIVE:</strong> All affiliated course instructors are requested to submit a minimum of <strong>{minQuestions} questions</strong> before <strong>{new Date(deadlineDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</strong>. Each accepted submission adds academic credits matching its AI novelty level.</>
                                                    )
                                                ) : (
                                                    <span className="text-rose-600 font-bold">❌ DIRECTIVE INACTIVE: Professor banner and deadline notifications are currently suspended.</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-indigo-50/30 p-2.5 rounded-lg border border-indigo-100/40">
                                        <Info size={12} className="text-indigo-500" />
                                        <span>Accepted questions automatically credit the Professor profile on acceptance.</span>
                                    </div>
                                </div>

                                {/* Right Side: Faculty Rankings & Credits Tracker */}
                                <div className="lg:col-span-8 bg-white rounded-2xl border border-border-color p-5 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                            <Trophy size={14} className="text-amber-500 animate-pulse" /> Faculty Question Contribution Ledger
                                        </h3>
                                        <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[8px] font-black uppercase tracking-wider rounded-md">
                                            Credits & Novelty Rankings Active
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[9px]">
                                                    <th className="pb-2.5">Faculty Member</th>
                                                    <th className="pb-2.5">Course Subject</th>
                                                    <th className="pb-2.5 text-center">Submission Status</th>
                                                    <th className="pb-2.5 text-center">Highly Novel</th>
                                                    <th className="pb-2.5">Rank Tier</th>
                                                    <th className="pb-2.5 text-right">Credits Earned</th>
                                                    <th className="pb-2.5 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {professorsList.map((prof: any) => {
                                                    const rank = calculateProfessorRank(prof.novel);
                                                    const targetMet = prof.submitted >= minQuestions;
                                                    const credits = prof.credits !== undefined ? prof.credits : (prof.approved * 5 + prof.novel * 10);
                                                    const pending = prof.submitted - prof.approved;

                                                    return (
                                                        <tr key={prof.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="py-3 font-bold text-slate-900">{prof.name}</td>
                                                            <td className="py-3 text-slate-500 font-medium">{prof.subject}</td>
                                                            <td className="py-3">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span className={`text-[10px] font-black ${targetMet ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                                        {prof.submitted} / {minQuestions} Qs
                                                                    </span>
                                                                    <div className="w-20 bg-slate-100 rounded-full h-1 overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full ${targetMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                                            style={{ width: `${Math.min(100, (prof.submitted / minQuestions) * 100)}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 text-center font-black text-indigo-600">{prof.novel}</td>
                                                            <td className="py-3">
                                                                <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider flex items-center gap-1 w-max ${rank.color}`}>
                                                                    <span>{rank.icon}</span> <span>{rank.tier}</span>
                                                                </span>
                                                            </td>
                                                            <td className="py-3 text-right font-black text-slate-900">
                                                                {credits} pts
                                                            </td>
                                                            <td className="py-3 text-center">
                                                                {pending > 0 ? (
                                                                    <button
                                                                        onClick={() => handleApproveProfessorQuestions(prof.id)}
                                                                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9px] font-black uppercase tracking-wider cursor-pointer"
                                                                    >
                                                                        Approve {pending}
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 flex items-center justify-center gap-0.5">
                                                                        <CheckCircle2 size={10} /> Sync'd
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
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

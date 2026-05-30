import BASE_URL from '../config/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';
import { Users, GraduationCap, Building, LayoutDashboard, CheckCircle, Search, Plus, X, MoreVertical, Layers, Megaphone, Bell, Calendar, Clock, Trash, Mail, Phone, MapPin, Award, BookOpen } from 'lucide-react';
import QuestionBank from '../components/Examination/QuestionBank';

const DEPARTMENTS = ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Business Administration'];
const FACULTY_POSITIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Guest Faculty'];
const SPECIAL_ROLES = ['None', 'Head of Department (HOD)', 'Examination Controller', 'Dean of Academics', 'Placement Coordinator'];

type Faculty = { id: string; name: string; email: string; mobile?: string; department: string; position: string; specialRole: string; status: 'Active' | 'On Leave'; generatedPassword?: string };
type Student = { id: string; name: string; email: string; rollNo: string; registrationNo?: string; department: string; semester: string; batch?: string; status: 'Active' | 'Graduated'; address?: string; fatherName?: string; motherName?: string; gender?: string; dob?: string; casteCategory?: string; mobile?: string; aadharNo?: string; programme?: string; mentor?: { id?: string; _id?: string; name: string; email: string; department?: string; position?: string; }; };

const CollegeAdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'faculty' | 'students' | 'departments' | 'examination'>('overview');
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [toast, setToast] = useState('');

    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastCredentials, setLastCredentials] = useState<{ email: string, password: string, role: string } | null>(null);

    const [showAddFaculty, setShowAddFaculty] = useState(false);
    const [newFaculty, setNewFaculty] = useState<Partial<Faculty>>({ name: '', email: '', mobile: '', department: DEPARTMENTS[0], position: FACULTY_POSITIONS[0], specialRole: 'None', status: 'Active' });

    const [showAddStudent, setShowAddStudent] = useState(false);
    const [newStudent, setNewStudent] = useState<Partial<Student>>({ name: '', email: '', rollNo: '', registrationNo: '', department: DEPARTMENTS[0], semester: 'Sem 1', batch: '2023-2027', status: 'Active', programme: '', fatherName: '', motherName: '', gender: 'Male', dob: '', casteCategory: 'General', mobile: '', aadharNo: '', address: '' });

    const [studentSearch, setStudentSearch] = useState('');
    const [filterBatch, setFilterBatch] = useState('All');
    const [filterSemester, setFilterSemester] = useState('All');
    const [filterDept, setFilterDept] = useState('All');

    // Notices State
    const [notices, setNotices] = useState<any[]>(() => {
        const stored = localStorage.getItem('urp_notices');
        return stored ? JSON.parse(stored) : [];
    });
    const [newNoticeTitle, setNewNoticeTitle] = useState('');
    const [newNoticeDesc, setNewNoticeDesc] = useState('');
    const [newNoticePdf, setNewNoticePdf] = useState<{ name: string; dataUrl: string } | null>(null);
    const [noticePdfLoading, setNoticePdfLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem('urp_notices', JSON.stringify(notices));
    }, [notices]);

    const handleNoticePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') return showToastMsg('Only PDF files are allowed.');
        setNoticePdfLoading(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setNewNoticePdf({ name: file.name, dataUrl: ev.target?.result as string });
            setNoticePdfLoading(false);
        };
        reader.readAsDataURL(file);
    };

    const handlePublishNotice = () => {
        if (!newNoticeTitle || !newNoticeDesc) return showToastMsg('Title and description are required.');
        const newNotice = { id: Date.now().toString(), title: newNoticeTitle, desc: newNoticeDesc, date: new Date().toLocaleDateString(), type: 'General', pdfName: newNoticePdf?.name || null, pdfDataUrl: newNoticePdf?.dataUrl || null };
        setNotices([newNotice, ...notices]);
        setNewNoticeTitle('');
        setNewNoticeDesc('');
        setNewNoticePdf(null);
        showToastMsg('Notice published to student portals!');
    };

    const loadMembers = async (searchVal = '', batchVal = 'All', semesterVal = 'All', deptVal = 'All') => {
        try {
            const token = localStorage.getItem('urp_token');
            let url = BASE_URL + '/api/members?';
            if (searchVal.trim()) url += `search=${encodeURIComponent(searchVal.trim())}&`;
            if (batchVal !== 'All') url += `batch=${encodeURIComponent(batchVal)}&`;
            if (semesterVal !== 'All') url += `semester=${encodeURIComponent(semesterVal)}&`;
            if (deptVal !== 'All') url += `department=${encodeURIComponent(deptVal)}&`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setFaculties(data.filter(m => m.role === 'PROFESSOR').map(m => ({
                    id: m._id, name: m.name, email: m.email,
                    department: m.department || 'Not Assigned',
                    position: m.position || 'Professor',
                    specialRole: m.specialRole || 'None',
                    status: 'Active',
                    generatedPassword: m.generatedPassword
                })));
                setStudents(data.filter(m => m.role === 'STUDENT').map(m => ({
                    id: m._id, name: m.name, email: m.email,
                    rollNo: m.rollNo || 'N/A',
                    registrationNo: m.registrationNo || 'N/A',
                    department: m.department || 'Not Assigned',
                    semester: m.semester || 'Sem 1',
                    batch: m.batch || 'Batch N/A',
                    status: 'Active',
                    mentor: m.mentor // Dynamic assigned mentor object
                })));
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const stored = localStorage.getItem('urp_user');
        if (!stored) { navigate('/login'); return; }
        const u = JSON.parse(stored);
        if (u.role !== 'COLLEGE' && u.role !== 'COLLEGE_ADMIN') { navigate('/login'); return; }
        setUser(u);
    }, [navigate]);

    useEffect(() => {
        if (user) {
            loadMembers(studentSearch, filterBatch, filterSemester, filterDept);
        }
    }, [user, studentSearch, filterBatch, filterSemester, filterDept]);

    const [expandedDept, setExpandedDept] = useState<string | null>(null);
    const [allottingStudentId, setAllottingStudentId] = useState<string | null>(null);

    const [deptModalTab, setDeptModalTab] = useState<'schedule' | 'directory'>('schedule');
    const [schedules, setSchedules] = useState<any[]>([]);
    const [activeSemTab, setActiveSemTab] = useState<string>('Sem 1');
    const [showAddSchedule, setShowAddSchedule] = useState<boolean>(false);
    const [newSchedule, setNewSchedule] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'Class' as 'Class' | 'Exam' | 'Sessional' | 'Holiday'
    });
    const [scheduleLoading, setScheduleLoading] = useState<boolean>(false);
    const [deptStudentSearch, setDeptStudentSearch] = useState<string>('');

    const loadDeptSchedules = async (deptName: string) => {
        setScheduleLoading(true);
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(`${BASE_URL}/api/members/schedules/${encodeURIComponent(deptName)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setSchedules(data);
                }
            }
        } catch (e) {
            console.error('Failed to load schedules:', e);
        } finally {
            setScheduleLoading(false);
        }
    };

    useEffect(() => {
        if (expandedDept) {
            loadDeptSchedules(expandedDept);
            setDeptModalTab('schedule');
            setDeptStudentSearch('');
            setShowAddSchedule(false);
        }
    }, [expandedDept]);

    const handleAddScheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSchedule.title.trim()) return showToastMsg('❌ Title is required');
        if (!expandedDept) return;

        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(BASE_URL + '/api/members/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    department: expandedDept,
                    semester: activeSemTab,
                    ...newSchedule
                })
            });
            if (res.ok) {
                showToastMsg('✅ Schedule entry successfully posted!');
                setNewSchedule({ title: '', description: '', date: '', time: '', type: 'Class' });
                setShowAddSchedule(false);
                await loadDeptSchedules(expandedDept);
            } else {
                showToastMsg('❌ Failed to post schedule');
            }
        } catch (e) {
            console.error(e);
            showToastMsg('❌ Connection error posting schedule');
        }
    };

    const handleDeleteSchedule = async (scheduleId: string) => {
        if (!window.confirm('Are you sure you want to delete this schedule entry?')) return;
        if (!expandedDept) return;
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(`${BASE_URL}/api/members/schedules/${scheduleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                showToastMsg('🗑 Schedule removed');
                await loadDeptSchedules(expandedDept);
            } else {
                showToastMsg('❌ Deletion failed');
            }
        } catch (e) {
            console.error(e);
            showToastMsg('❌ Server error removing schedule');
        }
    };

    const showToastMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const deptProfessors = expandedDept ? faculties.filter(f => f.department === expandedDept) : [];

    const handleAddFaculty = async () => {
        if (!newFaculty.name || !newFaculty.email) return showToastMsg('Name and Email are required.');
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(BASE_URL + '/api/members/professor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newFaculty)
            });
            const data = await res.json();
            if (res.ok) {
                await loadMembers();
                setShowAddFaculty(false);
                setNewFaculty({ name: '', email: '', department: DEPARTMENTS[0], position: FACULTY_POSITIONS[0], specialRole: 'None', status: 'Active' });
                showToastMsg('Faculty member added & credentials dispatched!');
                if (data.credentials) setLastCredentials({ ...data.credentials, role: 'Professor' });
            } else {
                showToastMsg(data.error || 'Failed to add faculty');
            }
        } catch { showToastMsg('Server connection failed'); }
    };

    const handleAddStudent = async () => {
        if (!newStudent.name || !newStudent.rollNo || !newStudent.email) return showToastMsg('Name, Email and Roll Number are required.');
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(BASE_URL + '/api/members/student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newStudent)
            });
            const data = await res.json();
            if (res.ok) {
                await loadMembers();
                setShowAddStudent(false);
                setNewStudent({ name: '', email: '', rollNo: '', department: DEPARTMENTS[0], semester: 'Sem 1', batch: '2023-2027', status: 'Active' });
                showToastMsg('Student added & credentials dispatched!');
                if (data.credentials) setLastCredentials({ ...data.credentials, role: 'Student' });
            } else {
                showToastMsg(data.error || 'Failed to add student');
            }
        } catch { showToastMsg('Server connection failed'); }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f4f4f5] font-body">
            {toast && (
                <div className="fixed top-4 right-4 z-[110] bg-[#16a34a] text-white px-5 py-3 rounded-lg shadow-xl text-sm font-bold animate-fade-in flex items-center gap-2 border border-[#14532d]/20">
                    <CheckCircle className="w-4 h-4" /> {toast}
                </div>
            )}

            {lastCredentials && (
                <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-scale-in">
                        <button onClick={() => setLastCredentials(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-inner"><CheckCircle className="w-6 h-6" /></div>
                        <h3 className="text-xl font-extrabold text-center text-slate-800 mb-2">{lastCredentials.role} Added!</h3>
                        <p className="text-center text-xs font-medium text-slate-500 mb-6 leading-relaxed">Auto-generated login credentials have been immediately dispatched to the user's email address.</p>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                            <div>
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Login Email</p>
                                <p className="font-mono font-bold text-slate-700">{lastCredentials.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Generated Password</p>
                                <p className="font-mono font-extrabold text-[#16a34a] text-lg bg-green-100/50 px-2 py-1 rounded inline-block">{lastCredentials.password}</p>
                            </div>
                        </div>
                        <button onClick={() => setLastCredentials(null)} className="mt-6 w-full py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#162d4a] transition-all shadow-md">Done</button>
                    </div>
                </div>
            )}

            <ChangePassword isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

            {/* HEADER */}
            <header className="sticky top-0 z-40 text-white overflow-hidden flex-shrink-0" style={{
                background: 'linear-gradient(135deg, rgba(10,18,50,0.94) 0%, rgba(20,40,90,0.90) 45%, rgba(15,25,70,0.94) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.40), 0 1px 0 rgba(255,255,255,0.05) inset',
            }}>
                {/* Glass ambient light blobs */}
                <div className="absolute -top-10 left-1/3 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)' }} />
                <div className="absolute -top-6 right-1/4 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)' }} />
                <div className="absolute top-1/2 left-0 w-24 h-24 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,209,197,0.08) 0%, transparent 70%)' }} />
                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.4) 25%, rgba(167,139,250,0.55) 50%, rgba(56,189,248,0.4) 75%, transparent 100%)' }} />

                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between w-full relative z-10">
                    <div className="flex items-center gap-3">
                        {user?.college?.logoUrl ? (
                            <img src={`${BASE_URL}/${user.college.logoUrl.replace(/^\/+/, '')}`} alt="college-logo" className="w-10 h-10 rounded-xl object-contain bg-white p-1 shadow-md border border-white/20" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{
                                background: 'linear-gradient(135deg, rgba(56,189,248,0.75) 0%, rgba(59,130,246,0.85) 100%)',
                                border: '1px solid rgba(147,210,255,0.3)',
                                boxShadow: '0 0 16px rgba(56,189,248,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
                            }}>
                                <Building className="text-white w-5 h-5" />
                            </div>
                        )}
                        <div>
                            <p className="font-extrabold text-sm tracking-wide" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>{user?.college?.name || 'College Administrator Portal'}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(147,210,255,0.65)' }}>Management Dashboard</p>
                        </div>
                    </div>

                    {/* Role Indicator in the Middle — white glass pill */}
                    <div className="hidden lg:flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2 z-10">
                        <span className="text-[9px] font-black tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(196,212,255,0.7)' }}>Access Role</span>
                        <div className="px-4 py-1.5 rounded-xl" style={{
                            background: 'rgba(255,255,255,0.13)',
                            border: '1px solid rgba(255,255,255,0.22)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.18)'
                        }}>
                            <span className="text-[12px] font-black tracking-wide text-white">EMS College Administration</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowChangePassword(true)}
                            className="text-xs font-bold transition-all hover:scale-105"
                            style={{ color: 'rgba(203,213,225,0.8)' }}
                        >Change Password</button>
                        <button onClick={() => { localStorage.clear(); navigate('/login'); }}
                            className="text-xs px-4 py-2 font-bold rounded-lg transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.18)',
                                backdropFilter: 'blur(8px)',
                                color: 'rgba(226,232,240,0.9)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                            }}
                        >Secure Logout</button>
                    </div>
                </div>
            </header>

            {/* HORIZONTAL NAVIGATION */}
            <div className="sticky top-16 z-30" style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid rgba(203,213,225,0.5)',
                boxShadow: '0 4px 24px rgba(30,58,95,0.08)'
            }}>
                <div className="max-w-[1600px] mx-auto px-6">
                    <div className="flex space-x-1 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
                            { id: 'examination', label: 'Examination Mgmt', icon: <Layers className="w-4 h-4" /> },
                            { id: 'faculty', label: 'Faculty & Staff', icon: <Users className="w-4 h-4" /> },
                            { id: 'students', label: 'Student Directory', icon: <GraduationCap className="w-4 h-4" /> },
                            { id: 'departments', label: 'Departments', icon: <Building className="w-4 h-4" /> },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                className="flex items-center gap-2 px-5 py-[14px] text-sm whitespace-nowrap transition-all relative"
                                style={{
                                    color: activeTab === tab.id ? '#1e3a5f' : '#64748b',
                                    borderBottom: activeTab === tab.id ? '2px solid #1e3a5f' : '2px solid transparent',
                                    fontWeight: activeTab === tab.id ? 800 : 600,
                                }}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 max-w-[1600px] w-full mx-auto bg-white mt-4 sm:rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 mb-12" style={{ minHeight: 0 }}>
                {/* MAIN CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-8 relative bg-white min-h-[500px]">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="animate-fade-in">
                            <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-slate-800 rounded-3xl p-8 text-white shadow-2xl mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                {/* Atmospheric orbs */}
                                <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                                <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>
                                
                                <div className="relative z-10 max-w-3xl space-y-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[9px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                            Partner Campus Console
                                        </span>
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-350 text-[9px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                                            Affiliated to {user?.university?.name || 'IntelliQ University'}
                                        </span>
                                    </div>
                                    
                                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                                        Welcome to {user?.college?.name || 'your Management Portal'}
                                    </h2>
                                    <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed max-w-2xl">
                                        Overview Command Center. View real-time institutional metrics, dispatch faculty credentials, register students, and publish department notices effortlessly.
                                    </p>
                                </div>

                                <div className="relative z-10 bg-slate-900/60 border border-slate-800 rounded-2xl p-4.5 shrink-0 hidden lg:block text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Security Access Ledger</p>
                                    <p className="text-xs font-bold mt-1 text-slate-300">Node ID: <span className="font-mono text-blue-400">{user?.college?.generatedCredential || 'CL-9201'}</span></p>
                                    <div className="flex items-center gap-1.5 justify-end mt-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Secure Connection</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110"></div>
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><Users className="w-7 h-7" /></div>
                                        <p className="text-5xl font-black text-slate-900 mb-2">{faculties.length}</p>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Faculty</p>
                                    </div>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110"></div>
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><GraduationCap className="w-7 h-7" /></div>
                                        <p className="text-5xl font-black text-slate-900 mb-2">{students.length}</p>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Students</p>
                                    </div>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110"></div>
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><Building className="w-7 h-7" /></div>
                                        <p className="text-5xl font-black text-slate-900 mb-2">{DEPARTMENTS.length}</p>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Departments</p>
                                    </div>
                                </div>
                            </div>

                            {/* EMS Feature Overviews & Core Capabilities */}
                            <div className="mt-8">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#1e3a5f] animate-pulse"></span>
                                    Integrated Institutional Modules & Features
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        {
                                            icon: <Layers className="w-5 h-5 text-blue-600" />,
                                            title: "Examination Control",
                                            desc: "Coordinate sessional exams, register semester enrollment papers, and monitor university-aligned evaluation tracks.",
                                            bg: "bg-blue-50 border-blue-100"
                                        },
                                        {
                                            icon: <Users className="w-5 h-5 text-emerald-600" />,
                                            title: "Faculty Planning",
                                            desc: "Register educators, assign custom HOD privileges, allot student mentors, and review academic performance logs.",
                                            bg: "bg-emerald-50 border-emerald-100"
                                        },
                                        {
                                            icon: <Building className="w-5 h-5 text-purple-600" />,
                                            title: "Dynamic Departments",
                                            desc: "Plan class curriculums, organize student profiles, and update semester-wise batch schedules in real-time.",
                                            bg: "bg-purple-50 border-purple-100"
                                        },
                                        {
                                            icon: <Megaphone className="w-5 h-5 text-rose-600" />,
                                            title: "Direct Broadcasting",
                                            desc: "Broadcast immediate notices, attach official documents, and deliver instant alerts directly to student and faculty portals.",
                                            bg: "bg-rose-50 border-rose-100"
                                        }
                                    ].map((feat, i) => (
                                        <div key={i} className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-150 group-hover:bg-[#1e3a5f] transition-all duration-300" />
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 border ${feat.bg} group-hover:scale-105 transition-transform`}>
                                                {feat.icon}
                                            </div>
                                            <h4 className="font-extrabold text-slate-800 text-sm mb-2 group-hover:text-[#1e3a5f] transition-colors">{feat.title}</h4>
                                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">{feat.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center"><Megaphone className="w-5 h-5" /></div>
                                    <div>
                                        <h3 className="font-black text-lg text-slate-900">Publish Notice</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Broadcast to all students</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1 space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Notice Title *</label>
                                            <input value={newNoticeTitle} onChange={e => setNewNoticeTitle(e.target.value)} placeholder="E.g., Semester Exam Schedule" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">PDF Attachment <span className="text-slate-400 normal-case font-semibold tracking-normal">(optional)</span></label>
                                            <label className={`flex items-center gap-3 h-11 px-4 rounded-xl border cursor-pointer transition-all text-sm font-semibold ${newNoticePdf ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-rose-300 hover:bg-rose-50/50'
                                                }`}>
                                                <input type="file" accept="application/pdf" className="hidden" onChange={handleNoticePdfUpload} />
                                                {noticePdfLoading ? (
                                                    <span className="text-xs text-slate-400">Reading…</span>
                                                ) : newNoticePdf ? (
                                                    <span className="truncate text-xs">{newNoticePdf.name}</span>
                                                ) : (
                                                    <span className="text-xs">Upload PDF notice…</span>
                                                )}
                                            </label>
                                            {newNoticePdf && (
                                                <button onClick={() => setNewNoticePdf(null)} className="mt-1 text-[10px] text-rose-500 hover:text-rose-700 font-bold">✕ Remove PDF</button>
                                            )}
                                        </div>
                                        <div>
                                            <button onClick={handlePublishNotice} className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                                                <Bell className="w-4 h-4" /> Broadcast Notice
                                            </button>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Detailed Description *</label>
                                        <textarea value={newNoticeDesc} onChange={e => setNewNoticeDesc(e.target.value)} placeholder="Type the full notice announcement here..." className="w-full h-[148px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none transition-all resize-none"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FACULTY TAB */}
                    {activeTab === 'faculty' && (
                        <div className="animate-fade-in flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty & Staff Management</h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Organize educators, assign hierarchical positions, and manage special roles.</p>
                                </div>
                                <button onClick={() => setShowAddFaculty(!showAddFaculty)} className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white font-bold text-sm rounded-xl hover:bg-[#162d4a] transition-all shadow-md hover:-translate-y-0.5">
                                    <Plus className="w-4 h-4" /> {showAddFaculty ? 'Close Form' : 'Add New Faculty'}
                                </button>
                            </div>

                            {showAddFaculty && (
                                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#1e3a5f]"></div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-5">Register New Faculty Member</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Full Name *</label>
                                            <input value={newFaculty.name} onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="Dr. John Doe" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Email Address *</label>
                                            <input value={newFaculty.email} onChange={e => setNewFaculty({ ...newFaculty, email: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="john.doe@college.edu" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Department</label>
                                            <select value={newFaculty.department} onChange={e => setNewFaculty({ ...newFaculty, department: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Academic Position</label>
                                            <select value={newFaculty.position} onChange={e => setNewFaculty({ ...newFaculty, position: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                                                {FACULTY_POSITIONS.map(p => <option key={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Phone / Mobile No.</label>
                                            <input value={newFaculty.mobile || ''} onChange={e => setNewFaculty({ ...newFaculty, mobile: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="10-digit mobile number" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Special Administrative Role</label>
                                            <select value={newFaculty.specialRole} onChange={e => setNewFaculty({ ...newFaculty, specialRole: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                                                {SPECIAL_ROLES.map(r => <option key={r}>{r}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                        <button onClick={() => setShowAddFaculty(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">Cancel</button>
                                        <button onClick={handleAddFaculty} className="flex items-center gap-2 px-6 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#162d4a] transition-all shadow-md hover:-translate-y-0.5 cursor-pointer">
                                            <CheckCircle className="w-4 h-4 text-emerald-400" /> Register Faculty Member
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="relative w-64">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input placeholder="Search faculty..." className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-sm focus:border-[#1e3a5f] outline-none" />
                                    </div>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Name & Email</th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Department</th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Position & Roles</th>
                                                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Status</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {faculties.map(f => (
                                                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-900">{f.name}</p>
                                                        <p className="text-xs text-slate-500 font-medium">{f.email}</p>
                                                        {f.generatedPassword && (
                                                            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-md text-[10px] text-amber-700 font-medium">
                                                                <span className="font-bold">Initial Pass:</span>
                                                                <span className="font-mono bg-amber-100/60 px-1 rounded font-bold">{f.generatedPassword}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{f.department}</td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-semibold text-slate-800">{f.position}</p>
                                                        {f.specialRole !== 'None' && <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider border border-indigo-100">{f.specialRole}</span>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${f.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{f.status}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => navigate(`/college-admin/faculty/${f.id}`)}
                                                            className="text-xs font-bold text-[#1e3a5f] hover:underline"
                                                        >
                                                            View Profile
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {faculties.length === 0 && (
                                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium text-sm">No faculty records found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STUDENTS TAB */}
                    {activeTab === 'students' && (
                        <div className="animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Directory</h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Manage enrollments, academic progression, and student data.</p>
                                </div>
                                <button onClick={() => setShowAddStudent(!showAddStudent)} className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white font-bold text-sm rounded-xl hover:bg-[#162d4a] transition-all shadow-md hover:-translate-y-0.5">
                                    <Plus className="w-4 h-4" /> {showAddStudent ? 'Close Form' : 'Enroll Student'}
                                </button>
                            </div>

                            {showAddStudent && (
                                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#16a34a]"></div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-1">Register New Student</h3>
                                    <p className="text-xs text-slate-400 mb-5">Fill all personal and academic details for official records.</p>

                                    {/* Section: Academic Details */}
                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 border-b pb-1 border-slate-100">Academic Details</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Full Name *</label>
                                            <input value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="Student Name" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Email Address *</label>
                                            <input value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="student@college.edu" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Programme / Course</label>
                                            <input value={newStudent.programme || ''} onChange={e => setNewStudent({ ...newStudent, programme: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="B.Tech" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">College Roll No. *</label>
                                            <input value={newStudent.rollNo} onChange={e => setNewStudent({ ...newStudent, rollNo: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-mono" placeholder="CS-2023-001" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Univ Registration No.</label>
                                            <input value={newStudent.registrationNo || ''} onChange={e => setNewStudent({ ...newStudent, registrationNo: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-mono" placeholder="REG-89234" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Branch / Department</label>
                                            <select value={newStudent.department} onChange={e => setNewStudent({ ...newStudent, department: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all">
                                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Semester</label>
                                            <select value={newStudent.semester} onChange={e => setNewStudent({ ...newStudent, semester: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all">
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s}>Sem {s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Sessional Batch *</label>
                                            <select value={newStudent.batch || '2023-2027'} onChange={e => setNewStudent({ ...newStudent, batch: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all cursor-pointer">
                                                <option value="2023-2027">Batch 2023-2027</option>
                                                <option value="2022-2026">Batch 2022-2026</option>
                                                <option value="2021-2025">Batch 2021-2025</option>
                                                <option value="2020-2024">Batch 2020-2024</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">College (Auto)</label>
                                            <input disabled value={user?.college?.name || 'Default by Credential'} className="w-full h-11 px-4 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">University (Auto)</label>
                                            <input disabled value={user?.university?.name || 'Default by Credential'} className="w-full h-11 px-4 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed outline-none" />
                                        </div>
                                    </div>

                                    {/* Section: Personal Details */}
                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 border-b pb-1 border-slate-100">Personal Details</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Father's Name</label>
                                            <input value={newStudent.fatherName || ''} onChange={e => setNewStudent({ ...newStudent, fatherName: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="Father's Full Name" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Mother's Name</label>
                                            <input value={newStudent.motherName || ''} onChange={e => setNewStudent({ ...newStudent, motherName: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="Mother's Full Name" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Gender</label>
                                            <select value={newStudent.gender || 'Male'} onChange={e => setNewStudent({ ...newStudent, gender: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all">
                                                <option>Male</option><option>Female</option><option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Date of Birth</label>
                                            <input type="date" value={newStudent.dob || ''} onChange={e => setNewStudent({ ...newStudent, dob: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Caste Category</label>
                                            <select value={newStudent.casteCategory || 'General'} onChange={e => setNewStudent({ ...newStudent, casteCategory: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all">
                                                <option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Mobile No.</label>
                                            <input value={newStudent.mobile || ''} onChange={e => setNewStudent({ ...newStudent, mobile: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="10-digit mobile" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Aadhar No.</label>
                                            <input value={newStudent.aadharNo || ''} onChange={e => setNewStudent({ ...newStudent, aadharNo: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-mono" placeholder="XXXX XXXX XXXX" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Residential / Permanent Address</label>
                                            <input value={newStudent.address || ''} onChange={e => setNewStudent({ ...newStudent, address: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="Village/Town, District, State – PIN" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => setShowAddStudent(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                                        <button onClick={handleAddStudent} className="px-6 py-2.5 bg-[#16a34a] text-white text-sm font-bold rounded-xl hover:bg-[#15803d] transition-all shadow-md">Enroll Student</button>
                                    </div>
                                </div>
                            )}


                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
                                <div className="flex-1 relative w-full">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input placeholder="Search Roll No, Reg No, or Name..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} className="w-full h-11 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-blue-500/10 transition-all font-bold text-slate-800" />
                                </div>
                                <div className="flex flex-wrap md:flex-nowrap gap-3 w-full lg:w-auto">
                                    <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)} className="w-full md:w-40 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:border-[#1e3a5f] cursor-pointer">
                                        <option value="All">All Batches</option>
                                        <option value="2023-2027">Batch 2023-2027</option>
                                        <option value="2022-2026">Batch 2022-2026</option>
                                        <option value="2021-2025">Batch 2021-2025</option>
                                        <option value="2020-2024">Batch 2020-2024</option>
                                    </select>
                                    <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="w-full md:w-44 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:border-[#1e3a5f] cursor-pointer">
                                        <option value="All">All Departments</option>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} className="w-full md:w-40 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:border-[#1e3a5f] cursor-pointer">
                                        <option value="All">All Semesters</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={`Sem ${s}`}>Semester {s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
                                {students.filter(s =>
                                    (filterSemester === 'All' || s.semester === filterSemester) &&
                                    (filterBatch === 'All' || s.batch === filterBatch) &&
                                    (filterDept === 'All' || s.department === filterDept) &&
                                    (studentSearch === '' || s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()))
                                ).map(s => (
                                    <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-extrabold text-blue-600 text-lg shrink-0 border border-blue-100">{s.name.charAt(0)}</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 leading-tight truncate">{s.name}</h4>
                                                <p className="text-[11px] text-slate-500 font-mono font-bold mt-0.5 tracking-wider truncate">Reg: {s.registrationNo || 'N/A'} • Roll: {s.rollNo}</p>
                                                <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">{s.semester} · {s.department} · {s.batch || 'Batch N/A'}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => navigate(`/college-admin/student/${s.id}`)} className="mt-5 w-full py-2.5 bg-[#1e3a5f] hover:bg-[#162d4a] text-white text-xs font-bold rounded-xl transition-colors shadow-sm">
                                            View Full Profile →
                                        </button>
                                    </div>
                                ))}
                                {students.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-slate-500 font-medium text-sm border-2 border-dashed border-slate-200 rounded-2xl">
                                        No student records found matching the criteria.
                                    </div>
                                )}
                            </div>


                        </div>
                    )}

                    {/* DEPARTMENTS TAB */}
                    {activeTab === 'departments' && (
                        <div className="animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Departments</h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Review student enrollment ratios and allot supervisors.</p>
                                </div>
                                <div className="px-3.5 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-200">
                                    {DEPARTMENTS.length} total departments
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {DEPARTMENTS.map(d => {
                                    const deptStudents = students.filter(s => s.department === d);
                                    const deptFaculty = faculties.filter(f => f.department === d);
                                    const isSelected = expandedDept === d;
                                    return (
                                        <button
                                            type="button"
                                            key={d}
                                            onClick={() => setExpandedDept(d)}
                                            className="w-full text-left bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] duration-200 border-slate-200/80 cursor-pointer outline-none hover:border-[#1e3a5f]/40"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-[#1e3a5f] text-white' : 'bg-blue-50 text-blue-600'}`}>
                                                    <Building className="w-6 h-6" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-slate-100 rounded-lg text-slate-500 border border-slate-200">
                                                    Manage Department
                                                </span>
                                            </div>
                                            <h3 className="font-extrabold text-slate-900 text-lg mb-1 leading-snug">{d}</h3>
                                            <div className="mt-3.5 pt-3.5 border-t border-slate-150/60 flex items-center justify-between">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registry Statistics</div>
                                                <div className="text-[11px] font-black bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1 flex items-center gap-1.5 shadow-inner">
                                                    <span className="text-blue-700" title="Total Students">{deptStudents.length} Students</span>
                                                    <span className="text-slate-350 font-medium">/</span>
                                                    <span className="text-indigo-700" title="Total Faculty">{deptFaculty.length} Faculty</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Unified Department Operations Glassy Modal overlay */}
                            {expandedDept && (
                                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in font-sans">
                                    <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-2xl w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden animate-scale-in relative">
                                        {/* Accent Bar */}
                                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

                                        {/* Header */}
                                        <div className="px-8 pt-8 pb-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                                            <div>
                                                <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100/50 text-indigo-700 rounded-md text-[9px] font-black uppercase tracking-widest shadow-inner">
                                                    Department Management Console
                                                </span>
                                                <h3 className="font-extrabold text-2xl text-slate-950 tracking-tight mt-1.5">{expandedDept} Department</h3>
                                                <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1 tracking-wider leading-none">
                                                    Track Sessional Calendars &bull; View Faculty Directory
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setExpandedDept(null)}
                                                className="w-10 h-10 bg-slate-50 border border-slate-200/80 hover:bg-slate-100 rounded-2xl text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>

                                        {/* Internal Tab Menu */}
                                        <div className="px-8 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                                            <div className="flex gap-2">
                                                {[
                                                    { id: 'schedule', label: 'Sessional Timetable' },
                                                    { id: 'directory', label: 'Faculty Directory' }
                                                ].map(tab => (
                                                    <button
                                                        key={tab.id}
                                                        type="button"
                                                        onClick={() => setDeptModalTab(tab.id as any)}
                                                        className={`px-4.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${deptModalTab === tab.id
                                                            ? 'bg-[#1e3a5f] text-white shadow-sm'
                                                            : 'text-slate-500 hover:text-slate-850 hover:bg-slate-150/40'
                                                            }`}
                                                    >
                                                        {tab.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="text-[10px] font-black bg-slate-150/50 border border-slate-200/80 rounded-xl px-3 py-1 flex items-center gap-1.5 shadow-inner text-slate-650">
                                                <span className="text-blue-700">{students.filter(s => s.department === expandedDept).length} Students</span>
                                                <span className="text-slate-350">/</span>
                                                <span className="text-indigo-700">{faculties.filter(f => f.department === expandedDept).length} Faculty</span>
                                            </div>
                                        </div>

                                        {/* Body Content */}
                                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/20">


                                            {/* TAB 2: SESSIONAL SCHEDULE TIMETABLE */}
                                            {deptModalTab === 'schedule' && (
                                                <div className="space-y-6">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/70 p-5 rounded-2xl shadow-sm">
                                                        <div>
                                                            <h4 className="font-extrabold text-sm text-slate-900 uppercase">Sessional Timeline Posting</h4>
                                                            <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5">Post new classes, mid-term sessionals, and holiday listings</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAddSchedule(!showAddSchedule)}
                                                            className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#122844] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <Plus size={13} /> {showAddSchedule ? 'Close Editor' : 'Post Schedule'}
                                                        </button>
                                                    </div>

                                                    {/* Add Timetable form */}
                                                    {showAddSchedule && (
                                                        <form onSubmit={handleAddScheduleSubmit} className="p-5 bg-white border border-slate-200/70 rounded-2xl space-y-4 shadow-sm animate-scale-in">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 pl-0.5">Schedule Title *</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="e.g. Mid-Term Theory Exam"
                                                                        value={newSchedule.title}
                                                                        onChange={e => setNewSchedule({ ...newSchedule, title: e.target.value })}
                                                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#1e3a5f] focus:bg-white outline-none transition-all"
                                                                        required
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 pl-0.5">Schedule Type</label>
                                                                    <select
                                                                        value={newSchedule.type}
                                                                        onChange={e => setNewSchedule({ ...newSchedule, type: e.target.value as any })}
                                                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#1e3a5f] focus:bg-white outline-none transition-all cursor-pointer"
                                                                    >
                                                                        <option value="Class">Class Session</option>
                                                                        <option value="Exam">Exam Schedule</option>
                                                                        <option value="Sessional">Sessional Deadline</option>
                                                                        <option value="Holiday">Institutional Holiday</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 pl-0.5">Schedule Date</label>
                                                                    <input
                                                                        type="date"
                                                                        value={newSchedule.date}
                                                                        onChange={e => setNewSchedule({ ...newSchedule, date: e.target.value })}
                                                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#1e3a5f] focus:bg-white outline-none transition-all"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 pl-0.5">Timings / Hours</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="e.g. 10:00 AM - 12:30 PM"
                                                                        value={newSchedule.time}
                                                                        onChange={e => setNewSchedule({ ...newSchedule, time: e.target.value })}
                                                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#1e3a5f] focus:bg-white outline-none transition-all"
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 pl-0.5">Description details</label>
                                                                    <textarea
                                                                        placeholder="Details instructions, syllabus coverage..."
                                                                        value={newSchedule.description}
                                                                        onChange={e => setNewSchedule({ ...newSchedule, description: e.target.value })}
                                                                        className="w-full h-16 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#1e3a5f] focus:bg-white outline-none resize-none transition-all"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowAddSchedule(false)}
                                                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
                                                                >
                                                                    Post Event
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )}

                                                    {/* Semesters tabs row */}
                                                    <div className="flex flex-wrap gap-1.5 bg-slate-200/60 p-1 rounded-2xl">
                                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => {
                                                            const semVal = `Sem ${s}`;
                                                            const active = activeSemTab === semVal;
                                                            return (
                                                                <button
                                                                    key={s}
                                                                    type="button"
                                                                    onClick={() => setActiveSemTab(semVal)}
                                                                    className={`flex-1 min-w-[70px] py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${active ? 'bg-[#1e3a5f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-150/30'
                                                                        }`}
                                                                >
                                                                    Sem {s}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Timeline rendered cards */}
                                                    <div className="space-y-4">
                                                        {scheduleLoading ? (
                                                            <div className="py-8 text-center text-slate-400 font-bold uppercase tracking-wider text-xs animate-pulse">
                                                                Loading Schedules...
                                                            </div>
                                                        ) : (
                                                            schedules.filter(s => s.semester === activeSemTab).map(sch => {
                                                                const typeColors: Record<string, string> = {
                                                                    Class: 'bg-blue-50 text-blue-700 border-blue-100',
                                                                    Exam: 'bg-rose-50 text-rose-700 border-rose-100',
                                                                    Sessional: 'bg-amber-50 text-amber-700 border-amber-100',
                                                                    Holiday: 'bg-slate-50 text-slate-650 border-slate-200'
                                                                };
                                                                return (
                                                                    <div key={sch._id} className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4 group hover:shadow-md transition-all">
                                                                        <div className="flex gap-4 items-start">
                                                                            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border shrink-0 tracking-wider text-center ${typeColors[sch.type] || 'bg-slate-50'}`}>
                                                                                {sch.type}
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <h4 className="text-xs font-black text-slate-905">{sch.title}</h4>
                                                                                {sch.description && <p className="text-[10px] font-semibold text-slate-500 leading-relaxed">{sch.description}</p>}
                                                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[9px] font-bold text-slate-400">
                                                                                    {sch.date && (
                                                                                        <span className="flex items-center gap-1">
                                                                                            <Calendar size={10} /> {new Date(sch.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                                        </span>
                                                                                    )}
                                                                                    {sch.time && (
                                                                                        <span className="flex items-center gap-1">
                                                                                            <Clock size={10} /> {sch.time}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeleteSchedule(sch._id)}
                                                                            className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-150 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
                                                                            title="Delete Schedule Entry"
                                                                        >
                                                                            <Trash size={12} />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })
                                                        )}

                                                        {!scheduleLoading && schedules.filter(s => s.semester === activeSemTab).length === 0 && (
                                                            <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                                                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                                                <p className="text-xs font-black uppercase tracking-wider">No Scheduled Timetable Entries</p>
                                                                <p className="text-[9px] text-slate-550 mt-1">Post class sessions, sessional targets, and mid-term timings for {activeSemTab}.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* TAB 3: FACULTY DIRECTORY & HOD */}
                                            {deptModalTab === 'directory' && (
                                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                                    {/* HOD Profile Showcase Card */}
                                                    <div className="lg:col-span-5 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-7 text-white shadow-lg relative overflow-hidden border border-slate-800 flex flex-col justify-between">
                                                        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                                                        <div>
                                                            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
                                                                <div>
                                                                    <span className="px-2.5 py-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded text-[8px] font-black uppercase tracking-widest shadow-md">
                                                                        ACADEMIC CHAIR
                                                                    </span>
                                                                    <h3 className="text-lg font-black tracking-tight mt-1 text-white">Department HOD</h3>
                                                                </div>
                                                                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                                                                    <Award className="text-amber-400 w-5 h-5" />
                                                                </div>
                                                            </div>

                                                            {faculties.filter(f => f.department === expandedDept && f.specialRole === 'Head of Department (HOD)').map(hod => (
                                                                <div key={hod.id} className="space-y-4 animate-fade-in">
                                                                    <div className="flex gap-4 items-center">
                                                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 shadow-md bg-slate-950 flex items-center justify-center font-black text-xl text-indigo-300 shrink-0">
                                                                            {hod.name.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-base font-black tracking-tight leading-tight text-white">{hod.name}</h4>
                                                                            <p className="text-[10px] text-indigo-300 font-extrabold uppercase mt-1 tracking-wider leading-none">
                                                                                {hod.position || 'Professor'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2 pt-4 border-t border-white/5 text-[10px] font-semibold text-slate-350">
                                                                        <div className="flex items-center gap-2.5 truncate">
                                                                            <Mail size={12} className="text-slate-400 shrink-0" />
                                                                            <span>{hod.email}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2.5">
                                                                            <Phone size={12} className="text-slate-400 shrink-0" />
                                                                            <span>{hod.mobile || '+91 98765 43210'}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2.5">
                                                                            <MapPin size={12} className="text-slate-400 shrink-0" />
                                                                            <span>Room 304, Block-B, Academic Complex</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            {faculties.filter(f => f.department === expandedDept && f.specialRole === 'Head of Department (HOD)').length === 0 && (
                                                                <div className="py-8 text-center text-slate-400 space-y-2">
                                                                    <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
                                                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">No designated Head of Department</p>
                                                                    <p className="text-[9px] text-slate-550 max-w-xs mx-auto">Assign a professor to the Head of Department role under the faculty registry tab to populate HOD credentials.</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4 text-[10px] text-slate-300 font-medium leading-relaxed italic shadow-inner mt-6">
                                                            “ Fostering academic excellence, driving cutting-edge research, and mentoring dynamic innovators to construct the software and hardware frameworks of tomorrow. ”
                                                        </div>
                                                    </div>

                                                    {/* Faculty Grid List */}
                                                    <div className="lg:col-span-7 space-y-4">
                                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Faculty & Guides Directory</h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
                                                            {faculties.filter(f => f.department === expandedDept).map(prof => (
                                                                <div key={prof.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-start gap-3 hover:-translate-y-0.5 transition-all">
                                                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-700 text-sm shrink-0">
                                                                        {prof.name.charAt(0)}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <h4 className="font-black text-slate-900 text-xs truncate">{prof.name}</h4>
                                                                        <p className="text-[9px] text-indigo-650 font-extrabold uppercase mt-0.5">{prof.position || 'Professor'}</p>
                                                                        {prof.specialRole !== 'None' && (
                                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 text-[8px] font-black rounded uppercase tracking-wider leading-none">
                                                                                {prof.specialRole}
                                                                            </span>
                                                                        )}
                                                                        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-[9px] font-semibold text-slate-450">
                                                                            <p className="truncate">📧 {prof.email}</p>
                                                                            <p>📞 {prof.mobile || '+91 99887 76655'}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {faculties.filter(f => f.department === expandedDept).length === 0 && (
                                                                <div className="col-span-2 py-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                                    No faculty guides registered under {expandedDept}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* EXAMINATION MANAGEMENT TAB */}
                    {activeTab === 'examination' && (
                        <div className="animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Examination Management</h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Manage question bank, upload questions, and generate question papers.</p>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                                    <Layers className="w-4 h-4 text-amber-600" />
                                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Question Bank & Paper Generator</span>
                                </div>
                            </div>
                            <QuestionBank
                                role={user?.role || 'COLLEGE'}
                                collegeId={user?.college?._id}
                                facultyName={user?.name || 'College Admin'}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollegeAdminDashboard;
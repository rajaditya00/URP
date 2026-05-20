import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';
import { Users, GraduationCap, Building, LayoutDashboard, CheckCircle, Search, Plus, X, MoreVertical, Layers, Megaphone, Bell } from 'lucide-react';
import QuestionBank from '../components/Examination/QuestionBank';

const DEPARTMENTS = ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Business Administration'];
const FACULTY_POSITIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Guest Faculty'];
const SPECIAL_ROLES = ['None', 'Head of Department (HOD)', 'Examination Controller', 'Dean of Academics', 'Placement Coordinator'];

type Faculty = { id: string; name: string; email: string; mobile?: string; department: string; position: string; specialRole: string; status: 'Active' | 'On Leave' };
type Student = { id: string; name: string; email: string; rollNo: string; registrationNo?: string; department: string; semester: string; status: 'Active' | 'Graduated'; address?: string; fatherName?: string; motherName?: string; gender?: string; dob?: string; casteCategory?: string; mobile?: string; aadharNo?: string; programme?: string; };

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
    const [newStudent, setNewStudent] = useState<Partial<Student>>({ name: '', email: '', rollNo: '', registrationNo: '', department: DEPARTMENTS[0], semester: 'Sem 1', status: 'Active', programme: '', fatherName: '', motherName: '', gender: 'Male', dob: '', casteCategory: 'General', mobile: '', aadharNo: '', address: '' });

    const [studentSearch, setStudentSearch] = useState('');
    const [filterBatch, setFilterBatch] = useState('All');
    const [filterSemester, setFilterSemester] = useState('All');

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

    const loadMembers = async () => {
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch('http://localhost:5000/api/members', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setFaculties(data.filter(m => m.role === 'PROFESSOR').map(m => ({
                    id: m._id, name: m.name, email: m.email,
                    department: m.department || 'Not Assigned',
                    position: m.position || 'Professor',
                    specialRole: m.specialRole || 'None',
                    status: 'Active'
                })));
                setStudents(data.filter(m => m.role === 'STUDENT').map(m => ({
                    id: m._id, name: m.name, email: m.email,
                    rollNo: m.rollNo || 'N/A',
                    registrationNo: m.registrationNo || 'N/A',
                    department: m.department || 'Not Assigned',
                    semester: m.semester || 'Sem 1',
                    status: 'Active'
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
        loadMembers();
    }, [navigate]);

    const showToastMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const handleAddFaculty = async () => {
        if (!newFaculty.name || !newFaculty.email) return showToastMsg('Name and Email are required.');
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch('http://localhost:5000/api/members/professor', {
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
            const res = await fetch('http://localhost:5000/api/members/student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newStudent)
            });
            const data = await res.json();
            if (res.ok) {
                await loadMembers();
                setShowAddStudent(false);
                setNewStudent({ name: '', email: '', rollNo: '', department: DEPARTMENTS[0], semester: 'Sem 1', status: 'Active' });
                showToastMsg('Student added & credentials dispatched!');
                if (data.credentials) setLastCredentials({ ...data.credentials, role: 'Student' });
            } else {
                showToastMsg(data.error || 'Failed to add student');
            }
        } catch { showToastMsg('Server connection failed'); }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f4f4f5] font-body h-screen overflow-hidden">
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
            <header className="bg-[#1e3a5f] text-white sticky top-0 z-40 shadow-md flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between w-full relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg border border-blue-300/30">
                            <Building className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-extrabold text-sm tracking-wide">{user?.college?.name || 'College Administrator Portal'}</p>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">Management Dashboard</p>
                        </div>
                    </div>
                    
                    {/* Role Indicator in the Middle */}
                    <div className="hidden lg:flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2 z-10">
                        <span className="text-[9px] text-white/40 font-extrabold tracking-widest uppercase mb-1">Access Role</span>
                        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 px-3.5 py-1 rounded-md backdrop-blur-md shadow-sm">
                            <span className="text-[10px] font-bold text-amber-300 tracking-wider font-mono">EMS College Administration</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <button onClick={() => setShowChangePassword(true)} className="text-xs text-white/80 hover:text-white font-bold transition-colors">Change Password</button>
                        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-xs px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 font-bold transition-colors">Secure Logout</button>
                    </div>
                </div>
            </header>

            {/* HORIZONTAL NAVIGATION */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6">
                    <div className="flex space-x-1 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
                            { id: 'faculty', label: 'Faculty & Staff', icon: <Users className="w-4 h-4" /> },
                            { id: 'students', label: 'Student Directory', icon: <GraduationCap className="w-4 h-4" /> },
                            { id: 'departments', label: 'Departments', icon: <Building className="w-4 h-4" /> },
                            { id: 'examination', label: 'Examination Mgmt', icon: <Layers className="w-4 h-4" /> },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 max-w-[1600px] w-full mx-auto overflow-hidden bg-white mt-4 sm:rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 mb-12">
                {/* MAIN CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-8 relative bg-white min-h-[500px]">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="animate-fade-in">
                            <div className="bg-gradient-to-br from-[#1e3a5f] to-indigo-900 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                                <div className="absolute -right-20 -top-20 w-[300px] h-[300px] bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
                                <div className="relative z-10 max-w-3xl">
                                    <h2 className="text-3xl font-black tracking-tight mb-3 text-white">Welcome to your Management Portal</h2>
                                    <p className="text-blue-100/90 text-base leading-relaxed">
                                        College Overview Dashboard. View key metrics including faculty strength, student enrollment, and active departments at a glance to manage your institutional data effortlessly.
                                    </p>
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
                                            <label className={`flex items-center gap-3 h-11 px-4 rounded-xl border cursor-pointer transition-all text-sm font-semibold ${
                                                newNoticePdf ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-rose-300 hover:bg-rose-50/50'
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
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => setShowAddFaculty(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                                        <button onClick={handleAddFaculty} className="px-6 py-2.5 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#162d4a] transition-all shadow-md">Create Profile</button>
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


                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="flex-1 relative w-full">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input placeholder="Search Reg No, Roll No, or Name..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} className="w-full h-11 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-blue-500/10 transition-all" />
                                </div>
                                <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)} className="w-full md:w-48 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a5f]">
                                    <option value="All">All Batches</option>
                                    <option value="2023-2027">Batch 2023-2027</option>
                                    <option value="2022-2026">Batch 2022-2026</option>
                                    <option value="2021-2025">Batch 2021-2025</option>
                                    <option value="2020-2024">Batch 2020-2024</option>
                                </select>
                                <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} className="w-full md:w-48 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e3a5f]">
                                    <option value="All">All Semesters</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={`Sem ${s}`}>Semester {s}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
                                {students.filter(s =>
                                    (filterSemester === 'All' || s.semester === filterSemester) &&
                                    (studentSearch === '' || s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()))
                                ).map(s => (
                                    <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-extrabold text-blue-600 text-lg shrink-0 border border-blue-100">{s.name.charAt(0)}</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 leading-tight truncate">{s.name}</h4>
                                                <p className="text-[11px] text-slate-500 font-mono font-bold mt-0.5 tracking-wider truncate">Reg: {s.registrationNo || 'N/A'} • Roll: {s.rollNo}</p>
                                                <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">{s.semester} · {s.department}</span>
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
                                    <p className="text-sm font-medium text-slate-500 mt-1">Review the list of established academic departments.</p>
                                </div>
                                <button className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors shadow-sm">
                                    + Create Department
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {DEPARTMENTS.map(d => (
                                    <div key={d} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Building className="w-6 h-6" /></div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-1">{d}</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">Status: Active</p>
                                    </div>
                                ))}
                            </div>
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
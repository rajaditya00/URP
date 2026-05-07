import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';
import { Users, GraduationCap, Building, LayoutDashboard, CheckCircle, Search, Plus, X, MoreVertical, Layers } from 'lucide-react';
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
    const [lastCredentials, setLastCredentials] = useState<{email: string, password: string, role: string} | null>(null);

    const [showAddFaculty, setShowAddFaculty] = useState(false);
    const [newFaculty, setNewFaculty] = useState<Partial<Faculty>>({ name: '', email: '', mobile: '', department: DEPARTMENTS[0], position: FACULTY_POSITIONS[0], specialRole: 'None', status: 'Active' });

    const [showAddStudent, setShowAddStudent] = useState(false);
    const [newStudent, setNewStudent] = useState<Partial<Student>>({ name: '', email: '', rollNo: '', registrationNo: '', department: DEPARTMENTS[0], semester: 'Sem 1', status: 'Active', programme: '', fatherName: '', motherName: '', gender: 'Male', dob: '', casteCategory: 'General', mobile: '', aadharNo: '', address: '' });

    const [studentSearch, setStudentSearch] = useState('');
    const [filterBatch, setFilterBatch] = useState('All');
    const [filterSemester, setFilterSemester] = useState('All');

    const loadMembers = async () => {
        try {
            const token = localStorage.getItem('cc_token');
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
        const stored = localStorage.getItem('cc_user');
        if (!stored) { navigate('/university-login'); return; }
        const u = JSON.parse(stored);
        if (u.role !== 'COLLEGE' && u.role !== 'COLLEGE_ADMIN') { navigate('/university-login'); return; }
        setUser(u);
        loadMembers();
    }, [navigate]);

    const showToastMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const handleAddFaculty = async () => {
        if (!newFaculty.name || !newFaculty.email) return showToastMsg('Name and Email are required.');
        try {
            const token = localStorage.getItem('cc_token');
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
            const token = localStorage.getItem('cc_token');
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
                        <button onClick={() => setLastCredentials(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5"/></button>
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
            <header className="bg-[#1e3a5f] text-white sticky top-0 z-40 shadow-md flex-shrink-0">
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                            <Building className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-extrabold text-sm tracking-wide">{user?.college?.name || 'College Administrator Portal'}</p>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">Management Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <button onClick={() => setShowChangePassword(true)} className="text-xs text-white/80 hover:text-white font-bold transition-colors">Change Password</button>
                        <button onClick={() => { localStorage.clear(); navigate('/university-login'); }} className="text-xs px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 font-bold transition-colors">Secure Logout</button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 max-w-[1600px] w-full mx-auto overflow-hidden bg-white mt-4 sm:rounded-t-2xl shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] border border-slate-200">
                {/* SIDEBAR NAVIGATION */}
                <div className="w-64 bg-[#f8fafc] border-r border-slate-200 flex-shrink-0 py-6 flex flex-col overflow-y-auto z-10">
                    <div className="px-6 pb-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Main Menu</div>
                    
                    {[
                        { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
                        { id: 'faculty', label: 'Faculty & Staff', icon: <Users className="w-4 h-4" /> },
                        { id: 'students', label: 'Student Directory', icon: <GraduationCap className="w-4 h-4" /> },
                        { id: 'departments', label: 'Departments', icon: <Building className="w-4 h-4" /> },
                        { id: 'examination', label: 'Examination Mgmt', icon: <Layers className="w-4 h-4" /> },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} 
                            className={`w-full text-left px-6 py-3 text-sm font-bold transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-white text-[#1e3a5f] border-r-4 border-[#1e3a5f] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-8 relative bg-white">
                    
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">College Overview</h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Users className="w-6 h-6" /></div>
                                    <p className="text-3xl font-extrabold text-slate-800">{faculties.length}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Faculty</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 shadow-sm">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4"><GraduationCap className="w-6 h-6" /></div>
                                    <p className="text-3xl font-extrabold text-slate-800">{students.length}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total Students</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-2xl p-6 shadow-sm">
                                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4"><Building className="w-6 h-6" /></div>
                                    <p className="text-3xl font-extrabold text-slate-800">{DEPARTMENTS.length}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Active Departments</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center max-w-3xl shadow-sm">
                                <h3 className="font-bold text-slate-800 text-lg mb-2">Welcome to your Management Portal</h3>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-xl mx-auto">
                                    Manage your institutional data seamlessly. Add faculty members, assign special roles like Examination Controller, organize students by department, and track your college's academic metrics.
                                </p>
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
                                            <input value={newFaculty.name} onChange={e => setNewFaculty({...newFaculty, name: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="Dr. John Doe" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Email Address *</label>
                                            <input value={newFaculty.email} onChange={e => setNewFaculty({...newFaculty, email: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="john.doe@college.edu" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Department</label>
                                            <select value={newFaculty.department} onChange={e => setNewFaculty({...newFaculty, department: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Academic Position</label>
                                            <select value={newFaculty.position} onChange={e => setNewFaculty({...newFaculty, position: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                                                {FACULTY_POSITIONS.map(p => <option key={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Phone / Mobile No.</label>
                                            <input value={newFaculty.mobile || ''} onChange={e => setNewFaculty({...newFaculty, mobile: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="10-digit mobile number" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Special Administrative Role</label>
                                            <select value={newFaculty.specialRole} onChange={e => setNewFaculty({...newFaculty, specialRole: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
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
                                                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"><MoreVertical className="w-4 h-4" /></button>
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
                                            <input value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="Student Name" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Email Address *</label>
                                            <input value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="student@college.edu" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Programme / Course</label>
                                            <input value={newStudent.programme || ''} onChange={e => setNewStudent({...newStudent, programme: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="B.Tech" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">College Roll No. *</label>
                                            <input value={newStudent.rollNo} onChange={e => setNewStudent({...newStudent, rollNo: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-mono" placeholder="CS-2023-001" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Univ Registration No.</label>
                                            <input value={newStudent.registrationNo || ''} onChange={e => setNewStudent({...newStudent, registrationNo: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-mono" placeholder="REG-89234" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Branch / Department</label>
                                            <select value={newStudent.department} onChange={e => setNewStudent({...newStudent, department: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all">
                                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Semester</label>
                                            <select value={newStudent.semester} onChange={e => setNewStudent({...newStudent, semester: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all">
                                                {[1,2,3,4,5,6,7,8].map(s => <option key={s}>Sem {s}</option>)}
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
                                            <input value={newStudent.fatherName || ''} onChange={e => setNewStudent({...newStudent, fatherName: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="Father's Full Name" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Mother's Name</label>
                                            <input value={newStudent.motherName || ''} onChange={e => setNewStudent({...newStudent, motherName: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="Mother's Full Name" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Gender</label>
                                            <select value={newStudent.gender || 'Male'} onChange={e => setNewStudent({...newStudent, gender: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all">
                                                <option>Male</option><option>Female</option><option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Date of Birth</label>
                                            <input type="date" value={newStudent.dob || ''} onChange={e => setNewStudent({...newStudent, dob: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Caste Category</label>
                                            <select value={newStudent.casteCategory || 'General'} onChange={e => setNewStudent({...newStudent, casteCategory: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all">
                                                <option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Mobile No.</label>
                                            <input value={newStudent.mobile || ''} onChange={e => setNewStudent({...newStudent, mobile: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="10-digit mobile" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Aadhar No.</label>
                                            <input value={newStudent.aadharNo || ''} onChange={e => setNewStudent({...newStudent, aadharNo: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-mono" placeholder="XXXX XXXX XXXX" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Residential / Permanent Address</label>
                                            <input value={newStudent.address || ''} onChange={e => setNewStudent({...newStudent, address: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all" placeholder="Village/Town, District, State – PIN" />
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
                            <QuestionBank />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollegeAdminDashboard;

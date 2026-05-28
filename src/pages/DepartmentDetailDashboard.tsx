import BASE_URL from '../config/api';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    GraduationCap, Phone, Mail, User, Calendar, Clock, Plus, X, Search,
    ArrowLeft, BookOpen, Award, CheckCircle, Trash, Building, ShieldAlert,
    MapPin, Layers
} from 'lucide-react';

type Member = {
    _id: string;
    name: string;
    email: string;
    role?: string;
    profileImage?: string;
    mobile?: string;
    department?: string;
    position?: string;
    specialRole?: string;
    rollNo?: string;
    registrationNo?: string;
    semester?: string;
    batch?: string;
    mentor?: {
        _id?: string;
        id?: string;
        name: string;
        email: string;
    };
};

type Schedule = {
    _id: string;
    semester: string;
    title: string;
    description?: string;
    date?: string;
    time?: string;
    type: 'Class' | 'Exam' | 'Sessional' | 'Holiday';
};

const DepartmentDetailDashboard = () => {
    const { deptName } = useParams<{ deptName: string }>();
    const navigate = useNavigate();

    // Data States
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [toast, setToast] = useState<string>('');

    // Active Selection/Filter States
    const [activeSemTab, setActiveSemTab] = useState<string>('Sem 1');
    const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
    const [allottingStudentId, setAllottingStudentId] = useState<string | null>(null);

    // Schedule Input Form States
    const [showAddSchedule, setShowAddSchedule] = useState<boolean>(false);
    const [newSchedule, setNewSchedule] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'Class' as 'Class' | 'Exam' | 'Sessional' | 'Holiday'
    });

    const triggerToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    // Load College details & members
    const loadDeptData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('urp_token');
            if (!token) { navigate('/login'); return; }

            // Fetch members
            const membersResp = await fetch(BASE_URL + '/api/members', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (membersResp.ok) {
                const data = await membersResp.json();
                if (Array.isArray(data)) {
                    setMembers(data);
                }
            }

            // Fetch schedules
            const schedulesResp = await fetch(`${BASE_URL}/api/members/schedules/${encodeURIComponent(deptName || '')}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (schedulesResp.ok) {
                const data = await schedulesResp.json();
                if (Array.isArray(data)) {
                    setSchedules(data);
                }
            }
        } catch (e) {
            console.error('Failed to load department data', e);
            triggerToast('Connection error loading data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem('urp_user');
        if (!stored) { navigate('/login'); return; }
        const u = JSON.parse(stored);
        if (u.role !== 'COLLEGE' && u.role !== 'COLLEGE_ADMIN') { navigate('/login'); return; }
        setUser(u);
        loadDeptData();
    }, [deptName, navigate]);

    // Derived states
    const deptFaculties = members.filter(m => m.role === 'PROFESSOR' && m.department === deptName);
    const deptStudents = members.filter(m => m.role === 'STUDENT' && m.department === deptName);

    // Identify HOD
    const hod = deptFaculties.find(f => f.specialRole === 'Head of Department (HOD)') || deptFaculties[0];

    // Handle Mentor Allotment
    const handleAssignMentor = async (studentId: string, mentorId: string) => {
        setAllottingStudentId(studentId);
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(BASE_URL + '/api/members/allot-mentor', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ studentId, mentorId })
            });
            if (res.ok) {
                triggerToast('✅ Mentor successfully updated!');
                await loadDeptData(); // Reload to sync
            } else {
                triggerToast('❌ Allotment failed');
            }
        } catch (e) {
            console.error(e);
            triggerToast('❌ Server error assigning mentor');
        } finally {
            setAllottingStudentId(null);
        }
    };

    // Add Timetable/Schedule
    const handleAddScheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSchedule.title.trim()) return triggerToast('Title is required');

        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(BASE_URL + '/api/members/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    department: deptName,
                    semester: activeSemTab,
                    ...newSchedule
                })
            });
            if (res.ok) {
                triggerToast('✅ Schedule entry successfully posted!');
                setNewSchedule({ title: '', description: '', date: '', time: '', type: 'Class' });
                setShowAddSchedule(false);
                await loadDeptData(); // Reload schedules
            } else {
                triggerToast('❌ Failed to post schedule');
            }
        } catch (e) {
            console.error(e);
            triggerToast('❌ Connection error posting schedule');
        }
    };

    // Delete Timetable/Schedule
    const handleDeleteSchedule = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this schedule entry?')) return;
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(`${BASE_URL}/api/members/schedules/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                triggerToast('🗑 Schedule removed');
                await loadDeptData();
            } else {
                triggerToast('❌ Deletion failed');
            }
        } catch (e) {
            console.error(e);
            triggerToast('❌ Server error removing schedule');
        }
    };

    // Filter students by search bar
    const filteredStudents = deptStudents.filter(s =>
        studentSearchQuery === '' ||
        s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        (s.rollNo && s.rollNo.toLowerCase().includes(studentSearchQuery.toLowerCase()))
    );

    // Active semester sessional schedules
    const activeSemSchedules = schedules.filter(s => s.semester === activeSemTab);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-body">
                <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading Department console...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-body flex flex-col">
            {/* Top Toast Alerts */}
            {toast && (
                <div className="fixed top-4 right-4 z-[110] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-black uppercase tracking-wider animate-fade-in flex items-center gap-2 border border-white/10">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-400" /> {toast}
                </div>
            )}

            {/* Header section with CET branding */}
            <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-b border-indigo-950/80 shadow-2xl shrink-0 relative overflow-hidden">
                {/* Decorative ambient elements */}
                <div className="absolute top-0 left-1/4 w-96 h-12 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />

                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => window.close()}
                            className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] text-white flex items-center justify-center transition-all cursor-pointer group"
                            title="Close Window & Return"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <span className="px-2.5 py-0.5 bg-indigo-600/80 backdrop-blur-md border border-indigo-500/30 text-white rounded-md text-[9px] font-black uppercase tracking-widest shadow-inner">
                                CET COLLEGE ADMINISTRATION
                            </span>
                            <h1 className="font-black text-xl tracking-tight leading-tight mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-350">
                                {deptName} Department Portal
                            </h1>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] font-black text-indigo-300 uppercase tracking-widest leading-none">
                            {user?.college?.name || 'College of CET'}
                        </p>
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-1.5 tracking-wider">
                            Academic Management &amp; Mentorship
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto">
                {/* LEFT COLUMN: HOD Intro & Faculty Directory */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Dynamic HOD Profile Showcase Card */}
                    <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden border border-slate-800 group hover:shadow-2xl hover:border-indigo-900/60 transition-all duration-300">
                        {/* Decorative background glows */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
                            <div>
                                <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md">
                                    ACADEMIC HEAD &amp; CHAIR
                                </span>
                                <h3 className="text-xl font-black tracking-tight mt-1.5 text-white">Department HOD</h3>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner hover:scale-105 transition-transform duration-350">
                                <Award className="text-amber-400 w-5.5 h-5.5" />
                            </div>
                        </div>

                        {hod ? (
                            <div className="space-y-6">
                                {/* HOD Profile & Avatar Header Section */}
                                <div className="flex gap-5 items-center flex-wrap sm:flex-nowrap">
                                    <div className="relative group/avatar shrink-0">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-3xl blur opacity-30 group-hover/avatar:opacity-60 transition duration-500" />
                                        <div className="relative w-22 h-22 rounded-3xl overflow-hidden border-2 border-white/20 shadow-md bg-slate-950 flex items-center justify-center">
                                            {hod.profileImage ? (
                                                <img
                                                    src={`${BASE_URL}${hod.profileImage}`}
                                                    alt={hod.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "/hod_avatar_placeholder.png";
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src="/hod_avatar_placeholder.png"
                                                    alt={hod.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black tracking-tight leading-tight text-white">{hod.name}</h4>
                                        <p className="text-[10px] text-indigo-300 font-extrabold uppercase mt-1 tracking-wider leading-none">
                                            {hod.position || 'Professor'}
                                        </p>
                                        <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-slate-400 font-extrabold uppercase">
                                            <Building size={10} className="text-indigo-400" />
                                            <span>Dept. of {deptName}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Departmental Statement */}
                                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4.5 text-[11px] text-slate-350 font-medium leading-relaxed italic shadow-inner">
                                    <span className="absolute -top-3 left-4 text-3xl font-serif text-indigo-400/30 leading-none">“</span>
                                    <p className="pl-2 relative z-10">
                                        Fostering academic excellence, driving cutting-edge research, and mentoring dynamic innovators to construct the software and hardware frameworks of tomorrow.
                                    </p>
                                </div>

                                {/* HOD Detailed Directory Specs */}
                                <div className="space-y-3 pt-4 border-t border-white/5 text-[11px] font-semibold text-slate-300">
                                    <div className="flex items-center gap-3">
                                        <Mail size={13.5} className="text-slate-400" />
                                        <a href={`mailto:${hod.email}`} className="hover:text-indigo-300 transition-colors truncate">
                                            {hod.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone size={13.5} className="text-slate-400" />
                                        <a href={`tel:${hod.mobile || '+919876543210'}`} className="hover:text-indigo-300 transition-colors">
                                            {hod.mobile || '+91 98765 43210'}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin size={13.5} className="text-slate-400" />
                                        <span>Office: Room 304, Block-B, Academic Complex</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock size={13.5} className="text-indigo-400" />
                                        <span className="text-[10px] text-indigo-200">Hours: Mon &amp; Wed, 10:00 AM - 12:30 PM</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <BookOpen size={13.5} className="text-blue-400" />
                                        <span className="text-[10px] text-slate-400">Spec: Advanced Computing &amp; Distributed Systems</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-450">
                                <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-bounce" />
                                <p className="text-xs font-black uppercase tracking-wider text-slate-300">No HOD Designated</p>
                                <p className="text-[9px] text-slate-500 mt-2 max-w-xs mx-auto">Enroll an academic professor and assign them to the Head of Department role to populate HOD credentials.</p>
                            </div>
                        )}
                    </div>

                    {/* Faculty Members Roster Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Faculty & Guides Directory</h3>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                            {deptFaculties.map(prof => (
                                <div key={prof._id} className="bg-white rounded-2xl p-4 border border-slate-250/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-700 shrink-0 text-sm shadow-inner">
                                        {prof.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-slate-900 text-xs truncate leading-snug">{prof.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5">{prof.position || 'Professor'}</p>

                                        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-[9px] font-semibold text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Mail size={10} className="text-slate-400 shrink-0" />
                                                <span className="truncate">{prof.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={10} className="text-slate-400 shrink-0" />
                                                <span>{prof.mobile || '+91 99887 76655'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {deptFaculties.length === 0 && (
                                <div className="py-8 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-450 font-bold text-xs uppercase tracking-widest">
                                    No faculty records found
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Semester Schedules & Student Mentor Allotment */}
                <div className="lg:col-span-8 space-y-8">
                    {/* SCHEDULE MANAGEMENT ACCORDION */}
                    <div className="bg-white border border-slate-250/60 rounded-3xl p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="font-extrabold text-base text-slate-950 uppercase tracking-tight">Sessional Schedule timetable</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage classes, timetables, and semesters</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAddSchedule(!showAddSchedule)}
                                className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#152d4a] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                            >
                                <Plus size={12} /> {showAddSchedule ? 'Close Editor' : 'Post Schedule'}
                            </button>
                        </div>

                        {/* Add Schedule Modal-Form */}
                        {showAddSchedule && (
                            <form onSubmit={handleAddScheduleSubmit} className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-scale-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-0.5">Event / Schedule Title *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Mid-Term Theory Exam"
                                            value={newSchedule.title}
                                            onChange={e => setNewSchedule({ ...newSchedule, title: e.target.value })}
                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-[#1e3a5f] outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-0.5">Classification Type</label>
                                        <select
                                            value={newSchedule.type}
                                            onChange={e => setNewSchedule({ ...newSchedule, type: e.target.value as any })}
                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-[#1e3a5f] outline-none cursor-pointer"
                                        >
                                            <option value="Class">Class Session</option>
                                            <option value="Exam">Exam Schedule</option>
                                            <option value="Sessional">Sessional Deadline</option>
                                            <option value="Holiday">Institutional Holiday</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-0.5">Schedule Date</label>
                                        <input
                                            type="date"
                                            value={newSchedule.date}
                                            onChange={e => setNewSchedule({ ...newSchedule, date: e.target.value })}
                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-[#1e3a5f] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-0.5">Timings / Hours</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 10:00 AM - 12:30 PM"
                                            value={newSchedule.time}
                                            onChange={e => setNewSchedule({ ...newSchedule, time: e.target.value })}
                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-[#1e3a5f] outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 pl-0.5">Description details</label>
                                        <textarea
                                            placeholder="Details instructions, syllabus coverage..."
                                            value={newSchedule.description}
                                            onChange={e => setNewSchedule({ ...newSchedule, description: e.target.value })}
                                            className="w-full h-16 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-[#1e3a5f] outline-none resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddSchedule(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
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

                        {/* Semesters 1 to 8 tabs row */}
                        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl mb-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => {
                                const semVal = `Sem ${s}`;
                                const active = activeSemTab === semVal;
                                return (
                                    <button
                                        key={s}
                                        onClick={() => setActiveSemTab(semVal)}
                                        className={`flex-1 min-w-[70px] py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${active ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                    >
                                        Sem {s}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Timetable/Schedule List render */}
                        <div className="space-y-4">
                            {activeSemSchedules.map(sch => {
                                const typeColors: Record<string, string> = {
                                    Class: 'bg-blue-50 text-blue-700 border-blue-100',
                                    Exam: 'bg-rose-50 text-rose-700 border-rose-100',
                                    Sessional: 'bg-amber-50 text-amber-700 border-amber-100',
                                    Holiday: 'bg-slate-50 text-slate-650 border-slate-200'
                                };
                                return (
                                    <div key={sch._id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4 group hover:shadow-sm transition-all animate-fade-in">
                                        <div className="flex gap-4 items-start">
                                            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border shrink-0 tracking-wider text-center ${typeColors[sch.type] || 'bg-slate-50'}`}>
                                                {sch.type}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-xs font-black text-slate-900">{sch.title}</h4>
                                                {sch.description && <p className="text-[10px] font-semibold text-slate-500 leading-relaxed">{sch.description}</p>}
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-[9px] font-bold text-slate-400">
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
                                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                            title="Delete Schedule Entry"
                                        >
                                            <Trash size={12} />
                                        </button>
                                    </div>
                                );
                            })}

                            {activeSemSchedules.length === 0 && (
                                <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <p className="text-xs font-black uppercase tracking-wider">No Scheduled Timetable Entries</p>
                                    <p className="text-[9px] text-slate-500 mt-1">Post class sessions, sessional targets, and mid-term timings for {activeSemTab}.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MENTOR ALLOTMENT SEARCH-CONSOLE */}
                    <div className="bg-white border border-slate-250/60 rounded-3xl p-6 shadow-sm">
                        <div className="mb-6 pb-4 border-b border-slate-100">
                            <h3 className="font-extrabold text-base text-slate-950 uppercase tracking-tight">Mentorship Roster Registry</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Search department students and allocate faculty guides</p>
                        </div>

                        {/* Roll/Name search bar input */}
                        <div className="relative mb-6">
                            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search students by Roll Number, Name..."
                                value={studentSearchQuery}
                                onChange={e => setStudentSearchQuery(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-250/80 rounded-2xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-[#1e3a5f] outline-none shadow-sm transition-all"
                            />
                        </div>

                        {/* Students list roster table */}
                        <div className="overflow-x-auto border border-slate-200 rounded-2xl overflow-hidden">
                            <table className="w-full border-collapse text-left text-xs font-sans">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Student Details</th>
                                        <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Assigned Guide</th>
                                        <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Allot Mentorship</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.map(student => {
                                        const isAllotting = allottingStudentId === student._id;
                                        return (
                                            <tr key={student._id} className="hover:bg-slate-50/40 transition-colors">
                                                <td className="px-5 py-4">
                                                    <p className="font-black text-slate-900">{student.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">Roll No: {student.rollNo || 'N/A'}</p>
                                                    <span className="inline-block mt-1 px-1.5 py-0.2 bg-slate-100 text-slate-500 text-[8px] font-black rounded uppercase tracking-wider">{student.semester} • {student.batch || 'Batch N/A'}</span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {student.mentor ? (
                                                        <div>
                                                            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100/50 text-indigo-700 rounded-lg text-[10px] font-black uppercase inline-flex items-center gap-1">
                                                                🎓 {student.mentor.name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                            ⚠ Unassigned
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2.5">
                                                        <select
                                                            value={student.mentor?._id || student.mentor?.id || ''}
                                                            disabled={isAllotting}
                                                            onChange={e => handleAssignMentor(student._id, e.target.value)}
                                                            className="h-9 px-2 bg-white border border-slate-250/80 rounded-xl text-[10px] font-black uppercase focus:border-[#1e3a5f] outline-none shadow-sm cursor-pointer"
                                                        >
                                                            <option value="">-- Unassigned --</option>
                                                            {deptFaculties.map(prof => (
                                                                <option key={prof._id} value={prof._id}>
                                                                    {prof.name} ({prof.position || 'Professor'})
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {isAllotting && (
                                                            <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-5 py-10 text-center text-slate-450 font-bold uppercase tracking-widest text-xs">
                                                No matching student roster found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DepartmentDetailDashboard;

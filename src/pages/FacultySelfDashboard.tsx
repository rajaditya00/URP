import BASE_URL from '../config/api';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';
import {
    GraduationCap, BookOpen, Clock, FileText,
    ShieldCheck, Mail, MapPin, User, Users, Calendar, Phone, IdCard, Layers,
    Bell, Award, CheckCircle, XCircle, AlertTriangle, ChevronRight, ChevronLeft,
    Star, TrendingUp, BookMarked, Briefcase, ClipboardList, Plus,
    ChevronDown, ChevronUp, Target, Zap, Info, Check, X, Lock, LogOut, Loader2, Search, MessageSquare, Edit
} from 'lucide-react';
import QuestionBank from '../components/Examination/QuestionBank';

/* ─────────────────────────── MOCK DATA ─────────────────────────── */

const FACULTY_SUBJECTS = [
    { code: 'CS601', name: 'Computer Networks', sem: 'Sem 6', students: 62, progress: 75, lectures: 30, done: 22, assignments: 3, pending: 1 },
    { code: 'CS603', name: 'Operating Systems', sem: 'Sem 6', students: 58, progress: 60, lectures: 28, done: 17, assignments: 2, pending: 1 },
    { code: 'CS405', name: 'Theory of Computation', sem: 'Sem 5', students: 55, progress: 88, lectures: 24, done: 21, assignments: 4, pending: 0 },
];

export const getActiveBatches = () => {
    const curYear = new Date().getFullYear();
    const curMonth = new Date().getMonth();
    const startYear = curMonth >= 6 ? curYear - 3 : curYear - 4;
    return [
        `${startYear}-${String(startYear + 4).slice(-2)}`,
        `${startYear + 1}-${String(startYear + 5).slice(-2)}`,
        `${startYear + 2}-${String(startYear + 6).slice(-2)}`,
        `${startYear + 3}-${String(startYear + 7).slice(-2)}`
    ];
};

const PENDING_APPROVALS = [
    {
        id: 'PA001', type: 'project', student: 'Rahul Verma', rollNo: '21CS045', subject: 'CS601',
        title: 'Network Topology Visualiser', description: 'A React + D3.js tool to visualise OSI model packet flow.',
        submittedOn: '2026-05-20', creditSuggested: 10, status: 'pending'
    },
    {
        id: 'PA002', type: 'assignment', student: 'Priya Nair', rollNo: '21CS067', subject: 'CS603',
        title: 'Memory Management Report', description: 'Comparative study of paging vs segmentation with simulation.',
        submittedOn: '2026-05-21', creditSuggested: 5, status: 'pending'
    },
    {
        id: 'PA003', type: 'project', student: 'Arjun Mehta', rollNo: '21CS012', subject: 'CS405',
        title: 'DFA/NFA Converter', description: 'Web-based automata simulator with step-by-step transitions.',
        submittedOn: '2026-05-22', creditSuggested: 12, status: 'pending'
    },
    {
        id: 'PA004', type: 'assignment', student: 'Sneha Pillai', rollNo: '21CS089', subject: 'CS601',
        title: 'Routing Algorithms Analysis', description: 'Performance benchmarks for Dijkstra vs Bellman-Ford.',
        submittedOn: '2026-05-23', creditSuggested: 5, status: 'pending'
    },
];

/* ─────────────────────────── HELPERS ─────────────────────────── */

const getRankBadge = (novel: number) => {
    if (novel >= 5) return { label: 'Platinum Scholar', bg: 'bg-indigo-100 text-indigo-700 border-indigo-200', iconType: 'trophy' };
    if (novel >= 3) return { label: 'Gold Contributor', bg: 'bg-amber-100 text-amber-700 border-amber-200', iconType: 'star' };
    if (novel >= 1) return { label: 'Expert Scholar', bg: 'bg-blue-100 text-blue-700 border-blue-200', iconType: 'book' };
    return { label: 'Associate', bg: 'bg-slate-100 text-slate-500 border-slate-200', iconType: 'user' };
};

const useCountdown = (targetDate: string) => {
    const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });
    useEffect(() => {
        const tick = () => {
            const diff = new Date(targetDate).getTime() - Date.now();
            if (diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0, expired: true }); return; }
            setTime({
                d: Math.floor(diff / 86400000),
                h: Math.floor((diff % 86400000) / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
                expired: false,
            });
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetDate]);
    return time;
};

/* ─────────────────────────── SUB-COMPONENTS ─────────────────────────── */

const DetailRow = ({ label, value, highlight, icon }: any) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">{icon} {label}</span>
        <span className={`text-sm font-bold ${highlight ? 'text-[#1e3a5f]' : 'text-slate-700'}`}>{value || '—'}</span>
    </div>
);

const CountdownBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center bg-white/10 backdrop-blur border border-white/15 rounded-xl px-2.5 py-1 min-w-[46px] shadow-sm">
        <span className="text-base font-extrabold tabular-nums leading-none text-white">{String(value).padStart(2, '0')}</span>
        <span className="text-[7.5px] font-black uppercase tracking-wider text-white/70 mt-0.5">{label}</span>
    </div>
);

/* ═══════════════════════════ MAIN COMPONENT ═══════════════════════════ */

const FacultySelfDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'questionbank' | 'approvals' | 'mentoring' | 'schedule'>('overview');
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [toast, setToast] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    // Profile edit states
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [editForm, setEditForm] = useState({ mobile: '', dob: '', address: '', aadharNo: '' });
    const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
    const [editProfileSaving, setEditProfileSaving] = useState(false);

    // Mentoring states
    const [mentoredStudents, setMentoredStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [studentProjects, setStudentProjects] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [evaluatingProjectId, setEvaluatingProjectId] = useState<string | null>(null);
    const [evaluationForm, setEvaluationForm] = useState<Record<string, { credits: number; feedback: string }>>({});

    // Approval state
    const [approvals, setApprovals] = useState(PENDING_APPROVALS);
    const [creditInputs, setCreditInputs] = useState<Record<string, number>>(
        Object.fromEntries(PENDING_APPROVALS.map(a => [a.id, a.creditSuggested]))
    );
    const [expandedApproval, setExpandedApproval] = useState<string | null>(null);

    // Class Schedule & Assignments States
    const [classSessions, setClassSessions] = useState<any[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedBulkDates, setSelectedBulkDates] = useState<string[]>([]);
    const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());
    const [customAddDateInput, setCustomAddDateInput] = useState<string>('');
    const [showCalendarInModal, setShowCalendarInModal] = useState<boolean>(false);
    const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
    const [selectedInnerSessionIndex, setSelectedInnerSessionIndex] = useState<number>(0);
    
    const SUBJECTS_BY_DEPT: Record<string, { code: string; name: string; sem: string }[]> = {
        'Computer Science': [
            { code: 'CS601', name: 'Computer Networks', sem: 'Sem 6' },
            { code: 'CS603', name: 'Operating Systems', sem: 'Sem 6' },
            { code: 'CS405', name: 'Theory of Computation', sem: 'Sem 5' }
        ],
        'Electrical Engineering': [
            { code: 'EE-202', name: 'Digital Electronics', sem: 'Sem 4' },
            { code: 'EE-302', name: 'Electric Machines', sem: 'Sem 6' },
            { code: 'EE-311', name: 'Signal Processing', sem: 'Sem 5' }
        ],
        'Mechanical Engineering': [
            { code: 'ME-201', name: 'Thermodynamics', sem: 'Sem 4' },
            { code: 'ME-301', name: 'Heat Transfer', sem: 'Sem 7' },
            { code: 'ME-401', name: 'Fluid Mechanics', sem: 'Sem 7' }
        ],
        'Civil Engineering': [
            { code: 'CE-201', name: 'Fluid Mechanics', sem: 'Sem 3' },
            { code: 'CE-202', name: 'Structural Analysis', sem: 'Sem 4' },
            { code: 'CE-204', name: 'Soil Mechanics', sem: 'Sem 3' }
        ],
        'Chemical Engineering': [
            { code: 'CH-301', name: 'Reaction Engineering', sem: 'Sem 5' },
            { code: 'CH-302', name: 'Mass Transfer', sem: 'Sem 6' },
            { code: 'CH-401', name: 'Reactor Design', sem: 'Sem 8' }
        ],
        'Biotechnology Engineering': [
            { code: 'BT-202', name: 'Molecular Biology', sem: 'Sem 4' },
            { code: 'BT-303', name: 'Bioprocess Technology', sem: 'Sem 5' },
            { code: 'BT-301', name: 'Genetic Engineering', sem: 'Sem 6' }
        ],
        'Aerospace Engineering': [
            { code: 'AE-301', name: 'Aerodynamics', sem: 'Sem 5' },
            { code: 'AE-302', name: 'Aircraft Propulsion', sem: 'Sem 6' },
            { code: 'AE-402', name: 'Flight Control Systems', sem: 'Sem 7' }
        ]
    };

    const getAvailableSubjects = () => {
        const dept = user?.department || 'Computer Science';
        return SUBJECTS_BY_DEPT[dept] || SUBJECTS_BY_DEPT['Computer Science'];
    };

    const formatDateKey = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const [newClassForm, setNewClassForm] = useState({
        semester: 'Sem 6',
        batch: getActiveBatches()[0] || '',
        subject: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        duration: 60,
        topicPlanned: ''
    });
    const [markingCompleteId, setMarkingCompleteId] = useState<string | null>(null);
    const [topicCoveredInput, setTopicCoveredInput] = useState('');
    const [allottingAssignmentId, setAllottingAssignmentId] = useState<string | null>(null);
    const [assignmentForm, setAssignmentForm] = useState({
        title: '',
        description: '',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    });
    const [questionsForSelector, setQuestionsForSelector] = useState<any[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [assignmentsList, setAssignmentsList] = useState<any[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [gradingAssignmentId, setGradingAssignmentId] = useState<string | null>(null);
    const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
    const [gradingForm, setGradingForm] = useState({ grade: 'A', feedback: '' });

    const [currentPlanText, setCurrentPlanText] = useState<string>('');
    const [savingLecturePlan, setSavingLecturePlan] = useState<boolean>(false);

    const handleSaveLecturePlan = async (id: string) => {
        if (!currentPlanText.trim()) {
            triggerToast('⚠️ Lecture plan cannot be empty.');
            return;
        }
        setSavingLecturePlan(true);
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(`{BASE_URL}/api/class-sessions/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ topicPlanned: currentPlanText.trim() })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                triggerToast('📝 Lecture plan updated successfully!');
                fetchClassSessions();
            } else {
                triggerToast(`❌ Error: ${data.error || 'Failed to update plan'}`);
            }
        } catch (err) {
            console.error(err);
            triggerToast('❌ Server communication error');
        } finally {
            setSavingLecturePlan(false);
        }
    };

    const fetchClassSessions = async () => {
        setLoadingSessions(true);
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(BASE_URL + '/api/class-sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const sorted = [...data.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setClassSessions(sorted);
                
                if (sorted.length > 0) {
                    const dates = Array.from(new Set(sorted.map((s: any) => s.date.split('T')[0]))).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                    const todayStr = new Date().toISOString().split('T')[0];
                    const todayIdx = dates.findIndex((d: string) => d === todayStr);
                    if (todayIdx !== -1) {
                        setActiveSlideIndex(todayIdx);
                    } else {
                        const upcomingIdx = dates.findIndex((d: string) => new Date(d).getTime() >= new Date().setHours(0, 0, 0, 0));
                        setActiveSlideIndex(upcomingIdx !== -1 ? upcomingIdx : 0);
                    }
                }
            }
        } catch (err) {
            console.error('Fetch sessions failed:', err);
        } finally {
            setLoadingSessions(false);
        }
    };

    const fetchAssignments = async () => {
        setLoadingAssignments(true);
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(BASE_URL + '/api/assignments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setAssignmentsList(data.data);
            }
        } catch (err) {
            console.error('Fetch assignments failed:', err);
        } finally {
            setLoadingAssignments(false);
        }
    };

    const fetchQuestionsForSelector = async () => {
        try {
            const token = localStorage.getItem('urp_token');
            const dept = user?.department || 'Computer Science';
            const res = await fetch(`{BASE_URL}/api/questions?department=${encodeURIComponent(dept)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setQuestionsForSelector(data.data);
            }
        } catch (err) {
            console.error('Fetch questions failed:', err);
        }
    };

    const handleScheduleClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedBulkDates.length === 0) {
            triggerToast('⚠️ Please select at least one date from the calendar or input a custom one');
            return;
        }

        try {
            const token = localStorage.getItem('urp_token');
            let successCount = 0;

            for (const d of selectedBulkDates) {
                const res = await fetch(BASE_URL + '/api/class-sessions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        department: user?.department || 'Computer Science',
                        semester: newClassForm.semester,
                        batch: newClassForm.batch,
                        subject: newClassForm.subject,
                        date: d,
                        time: newClassForm.time,
                        duration: newClassForm.duration,
                        topicPlanned: newClassForm.topicPlanned
                    })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    successCount++;
                }
            }

            if (successCount > 0) {
                triggerToast(`🚀 ${successCount} class(es) scheduled successfully and students notified!`);
                setShowScheduleModal(false);
                setSelectedBulkDates([]);
                setNewClassForm(prev => ({
                    ...prev,
                    subject: '',
                    batch: getActiveBatches()[0] || '',
                    topicPlanned: ''
                }));
                fetchClassSessions();
            } else {
                triggerToast('❌ Failed to schedule classes on selected dates');
            }
        } catch (err) {
            console.error(err);
            triggerToast('❌ Server communication error');
        }
    };

    const handleMarkCompleteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topicCoveredInput.trim()) {
            triggerToast('⚠️ Please mention the topic taught');
            return;
        }
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(`{BASE_URL}/api/class-sessions/${markingCompleteId}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topicCovered: topicCoveredInput })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                triggerToast('✅ Lecture marked completed. Students notified!');
                setMarkingCompleteId(null);
                setTopicCoveredInput('');
                fetchClassSessions();
            } else {
                triggerToast(`❌ Error: ${data.error || 'Failed to complete session'}`);
            }
        } catch (err) {
            console.error(err);
            triggerToast('❌ Server communication error');
        }
    };

    const handleAllotAssignmentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedQuestions.length === 0) {
            triggerToast('⚠️ Please select at least one question from the bank');
            return;
        }
        if (!assignmentForm.title.trim()) {
            triggerToast('⚠️ Please enter assignment title');
            return;
        }

        const session = classSessions.find(s => s._id === allottingAssignmentId);
        if (!session) return;

        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(BASE_URL + '/api/assignments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: assignmentForm.title,
                    description: assignmentForm.description,
                    dueDate: assignmentForm.dueDate,
                    questions: selectedQuestions,
                    department: session.department,
                    semester: session.semester,
                    classSession: session._id
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                triggerToast('📝 Assignment allotted successfully and students notified!');
                setAllottingAssignmentId(null);
                setAssignmentForm({
                    title: '',
                    description: '',
                    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
                });
                setSelectedQuestions([]);
                fetchAssignments();
            } else {
                triggerToast(`❌ Error: ${data.error || 'Failed to allot assignment'}`);
            }
        } catch (err) {
            console.error(err);
            triggerToast('❌ Server communication error');
        }
    };

    const handleGradeSubmissionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(`{BASE_URL}/api/assignments/${gradingAssignmentId}/grade/${gradingSubmissionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(gradingForm)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                triggerToast('🎯 Submission graded successfully! Student notified.');
                setGradingAssignmentId(null);
                setGradingSubmissionId(null);
                setGradingForm({ grade: 'A', feedback: '' });
                fetchAssignments();
            } else {
                triggerToast(`❌ Error: ${data.error || 'Failed to grade'}`);
            }
        } catch (err) {
            console.error(err);
            triggerToast('❌ Server communication error');
        }
    };

    const handleDeleteClassSession = async (id: string) => {
        const reason = window.prompt('Please enter the reason for cancelling this lecture:');
        if (reason === null) return; // User clicked Cancel
        if (!reason.trim()) {
            triggerToast('⚠️ A reason is required to cancel the class schedule.');
            return;
        }

        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(`{BASE_URL}/api/class-sessions/${id}?reason=${encodeURIComponent(reason.trim())}`, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ reason: reason.trim() })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                triggerToast('🗑️ Class schedule cancelled and students notified.');
                fetchClassSessions();
            } else {
                triggerToast(`❌ Error: ${data.error || 'Failed to delete'}`);
            }
        } catch (err) {
            console.error(err);
            triggerToast('❌ Server communication error');
        }
    };

    // Questions directive (read from localStorage, set by UniAdmin)
    const minQuestions = Number(localStorage.getItem('urp_min_questions') || '15');
    const deadlineDate = localStorage.getItem('urp_deadline_date') || '2026-06-15';
    const countdown = useCountdown(deadlineDate);
    const directiveActive = localStorage.getItem('urp_directive_active') !== 'false';
    const directiveMessage = localStorage.getItem('urp_directive_message') || '';

    // Professors credits dynamic state sync
    const [professorsList, setProfessorsList] = useState<any[]>(() => {
        const stored = localStorage.getItem('urp_professors_credits');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const stored = localStorage.getItem('urp_professors_credits');
            if (stored) {
                setProfessorsList(JSON.parse(stored));
            }
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('storage_local', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('storage_local', handleStorageChange);
        };
    }, []);

    // My submitted questions (mock — pulled from localStorage professors list)
    const myStats = (() => {
        const me = professorsList.find((p: any) => p.name === user?.name);
        return me ? {
            submitted: me.submitted,
            approved: me.approved,
            novel: me.novel,
            credits: me.credits !== undefined ? me.credits : (me.approved * 5 + me.novel * 10)
        } : { submitted: 12, approved: 12, novel: 1, credits: 70 };
    })();

    useEffect(() => {
        const stored = localStorage.getItem('urp_user');
        if (!stored) { navigate('/login'); return; }
        const u = JSON.parse(stored);
        if (u.role !== 'PROFESSOR' && u.role !== 'STAFF') { navigate('/login'); return; }
        setUser(u);
    }, [navigate]);

    const uniqueDates = Array.from(new Set(classSessions.map(s => s.date.split('T')[0]))).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const sessionsForActiveDate = classSessions.filter(s => s.date.split('T')[0] === uniqueDates[activeSlideIndex]);

    useEffect(() => {
        setSelectedInnerSessionIndex(0);
    }, [activeSlideIndex]);

    useEffect(() => {
        const session = sessionsForActiveDate[selectedInnerSessionIndex];
        if (session) {
            setCurrentPlanText(session.topicPlanned || '');
        } else {
            setCurrentPlanText('');
        }
    }, [activeSlideIndex, selectedInnerSessionIndex, classSessions]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) setProfileDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const triggerToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

    const openEditProfile = () => {
        setEditForm({
            mobile: user?.mobile || '',
            dob: user?.dob || '',
            address: user?.address || '',
            aadharNo: user?.aadharNo || ''
        });
        setEditPhotoFile(null);
        setEditProfileOpen(true);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditProfileSaving(true);
        try {
            const token = localStorage.getItem('urp_token');
            const form = new FormData();
            form.append('mobile', editForm.mobile);
            form.append('dob', editForm.dob);
            form.append('address', editForm.address);
            form.append('aadharNo', editForm.aadharNo);
            if (editPhotoFile) {
                form.append('profileImage', editPhotoFile);
            }

            const res = await fetch(BASE_URL + '/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: form
            });

            const data = await res.json();
            if (res.ok && data.user) {
                const updatedUser = { ...user, ...data.user };
                localStorage.setItem('urp_user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                triggerToast('✅ Profile updated successfully!');
                setEditProfileOpen(false);
            } else {
                triggerToast(`❌ ${data.msg || 'Update failed'}`);
            }
        } catch (err) {
            console.error('Profile update failed:', err);
            triggerToast('❌ Server communication error');
        } finally {
            setEditProfileSaving(false);
        }
    };

    const loadMentoredStudents = async () => {
        setLoadingStudents(true);
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(BASE_URL + '/api/projects/mentored-students', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setMentoredStudents(data);
                if (data.length > 0 && !selectedStudent) {
                    setSelectedStudent(data[0]);
                    // Direct fetch for that student
                    const projRes = await fetch(`{BASE_URL}/api/projects/student-projects/${data[0]._id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const projData = await projRes.json();
                    if (projRes.ok && Array.isArray(projData)) {
                        setStudentProjects(projData);
                        const defaults: Record<string, { credits: number; feedback: string }> = {};
                        projData.forEach((p: any) => {
                            defaults[p._id] = {
                                credits: p.skillsCredits || 3,
                                feedback: p.feedback || ''
                            };
                        });
                        setEvaluationForm(defaults);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load mentored students:', e);
        } finally {
            setLoadingStudents(false);
        }
    };

    const loadStudentProjects = async (studentId: string) => {
        setLoadingProjects(true);
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(`{BASE_URL}/api/projects/student-projects/${studentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setStudentProjects(data);
                const defaults: Record<string, { credits: number; feedback: string }> = {};
                data.forEach((p: any) => {
                    defaults[p._id] = {
                        credits: p.skillsCredits || 3,
                        feedback: p.feedback || ''
                    };
                });
                setEvaluationForm(defaults);
            }
        } catch (e) {
            console.error('Failed to load student projects:', e);
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleSelectStudent = (student: any) => {
        setSelectedStudent(student);
        loadStudentProjects(student._id);
    };

    const handleEvaluateProjectClick = async (projectId: string) => {
        const evalData = evaluationForm[projectId];
        if (!evalData) return;
        setEvaluatingProjectId(projectId);
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(BASE_URL + '/api/projects/evaluate', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId,
                    feedback: evalData.feedback,
                    skillsCredits: evalData.credits
                })
            });
            const data = await res.json();
            if (res.ok) {
                setStudentProjects(prev => prev.map(p => p._id === projectId ? data : p));
                triggerToast('✅ Project successfully evaluated & credits awarded!');
            } else {
                triggerToast(`❌ Evaluation failed: ${data.error || 'Server error'}`);
            }
        } catch (e) {
            console.error(e);
            triggerToast('❌ Server communication error');
        } finally {
            setEvaluatingProjectId(null);
        }
    };

    useEffect(() => {
        if (activeTab === 'mentoring') {
            loadMentoredStudents();
        } else if (activeTab === 'schedule') {
            fetchClassSessions();
            fetchAssignments();
            fetchQuestionsForSelector();
        }
    }, [activeTab, user]);

    const handleApprove = (id: string) => {
        const credits = creditInputs[id];
        setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'approved', creditSuggested: credits } : a));
        triggerToast(`✅ Approved! ${credits} credit(s) awarded to student.`);
    };

    const handleReject = (id: string) => {
        setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
        triggerToast('❌ Submission rejected.');
    };

    const pendingCount = approvals.filter(a => a.status === 'pending').length;
    const rank = getRankBadge(myStats.novel);
    const deadlineFmt = new Date(deadlineDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    const progressToMin = Math.min(100, Math.round((myStats.submitted / minQuestions) * 100));

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#f1f5f9] font-body pb-16" style={{ fontFamily: "'Inter', sans-serif" }}>
            <ChangePassword isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

            {editProfileOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md animate-fade-in p-4">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 max-w-md w-full shadow-[0_20px_50px_rgba(30,58,95,0.18)] relative">
                        <button
                            type="button"
                            onClick={() => setEditProfileOpen(false)}
                            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight mb-2 flex items-center gap-2">
                            <User size={20} /> Update Personal Profile
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 pb-2.5 border-b border-slate-100">
                            Modify credentials and institutional photo
                        </p>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            {/* Profile Image upload field */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <Layers size={12} /> Profile Photo
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-xl font-black text-[#1e3a5f] shadow-sm flex-shrink-0">
                                        {editPhotoFile ? (
                                            <img src={URL.createObjectURL(editPhotoFile)} alt="Preview" className="w-full h-full object-cover" />
                                        ) : user?.profileImage ? (
                                            <img src={user.profileImage.startsWith('http') ? user.profileImage : `{BASE_URL}/${user.profileImage}`} alt="Current" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{user?.name?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="relative flex-1">
                                        <input
                                            type="file"
                                            id="edit-photo-input"
                                            accept="image/*"
                                            onChange={e => setEditPhotoFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="edit-photo-input"
                                            className="flex items-center justify-between w-full h-10 px-3.5 border border-slate-200 rounded-xl text-xs bg-white/60 hover:bg-white cursor-pointer transition-all hover:border-[#1e3a5f] group"
                                        >
                                            <span className="text-slate-500 font-semibold truncate max-w-[150px]">
                                                {editPhotoFile ? editPhotoFile.name : 'Choose new photo...'}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-[#1e3a5f] bg-[#1e3a5f]/5 group-hover:bg-[#1e3a5f]/10 px-2.5 py-1.5 rounded-lg transition-colors">
                                                Browse
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Number */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile Number</label>
                                <input
                                    type="text"
                                    value={editForm.mobile}
                                    onChange={e => setEditForm(p => ({ ...p, mobile: e.target.value }))}
                                    placeholder="Enter mobile number..."
                                    className="w-full h-10 px-3.5 bg-white/60 border border-slate-200 rounded-xl text-sm focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all placeholder:text-slate-450 font-semibold"
                                />
                            </div>

                            {/* DOB */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={editForm.dob}
                                    onChange={e => setEditForm(p => ({ ...p, dob: e.target.value }))}
                                    className="w-full h-10 px-3.5 bg-white/60 border border-slate-200 rounded-xl text-sm focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all font-semibold"
                                />
                            </div>

                            {/* Aadhar No */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aadhar Number</label>
                                <input
                                    type="text"
                                    value={editForm.aadharNo}
                                    onChange={e => setEditForm(p => ({ ...p, aadharNo: e.target.value }))}
                                    placeholder="Enter 12-digit Aadhar number..."
                                    className="w-full h-10 px-3.5 bg-white/60 border border-slate-200 rounded-xl text-sm focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all placeholder:text-slate-450 font-semibold"
                                />
                            </div>

                            {/* Residential Address */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Residential Address</label>
                                <textarea
                                    value={editForm.address}
                                    onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))}
                                    placeholder="Enter residential address details..."
                                    rows={2}
                                    className="w-full p-3 bg-white/60 border border-slate-200 rounded-xl text-sm focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all placeholder:text-slate-450 font-semibold resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={editProfileSaving}
                                className="w-full py-3 bg-gradient-to-r from-[#1e3a5f] to-[#254673] text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-indigo-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                            >
                                {editProfileSaving ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" />
                                        <span>Saving Profile...</span>
                                    </>
                                ) : (
                                    <span>Save Profile Changes</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── TOAST ── */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#1e3a5f] text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-fade-in flex items-center gap-2">
                    <Info size={15} /> {toast}
                </div>
            )}

            {/* ══════════ HEADER ══════════ */}
            <header className="sticky top-0 z-50 text-white" style={{
                background: 'linear-gradient(135deg, rgba(15,23,58,0.92) 0%, rgba(30,58,95,0.88) 45%, rgba(20,30,80,0.92) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.05) inset',
            }}>
                {/* Glass light blobs — overflow clipped in their own layer */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-8 left-1/4 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
                    <div className="absolute -top-4 right-1/3 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(79,209,197,0.10) 0%, transparent 70%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.5) 30%, rgba(167,139,250,0.6) 50%, rgba(99,102,241,0.5) 70%, transparent 100%)' }} />
                </div>

                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between w-full relative z-10">
                    {/* Left: Logo + uni name */}
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(79,70,229,0.9) 100%)',
                            border: '1px solid rgba(165,180,252,0.3)',
                            boxShadow: '0 0 12px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
                        }}>
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="font-extrabold text-[13px] leading-tight tracking-wide" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>{user.university?.name || 'Faculty Portal'}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(165,180,252,0.7)' }}>{user.college?.name}</p>
                        </div>
                    </div>

                    {/* Centre: Role Scope — white glass pill */}
                    <div className="flex-1 flex justify-center">
                        <div className="flex flex-col items-center px-5 py-1.5 rounded-xl" style={{
                            background: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.22)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.18)'
                        }}>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(196,212,255,0.75)' }}>Role Scope</p>
                            <p className="text-[13px] font-black tracking-wide leading-tight mt-0.5 text-white">Faculty — {user.department || 'Department'}</p>
                        </div>
                    </div>

                    {/* Right: Notifications + actions */}
                    <div className="flex-1 flex items-center justify-end gap-3">
                        {/* Notification bell */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setNotifOpen(o => !o)}
                                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(8px)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                                }}
                            >
                                <Bell size={16} />
                                {(pendingCount > 0 || true) && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center" style={{ boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}>
                                        {pendingCount + 1}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
                                    <div className="bg-[#1e3a5f] text-white px-4 py-3 flex items-center justify-between">
                                        <span className="font-black text-sm">Notifications</span>
                                        <Bell size={14} />
                                    </div>

                                    {/* Question directive notification */}
                                    {directiveActive && (
                                        <div className="p-4 border-b border-slate-100 bg-amber-50">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <AlertTriangle size={14} className="text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800">Question Bank Directive</p>
                                                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                                        {directiveMessage ? directiveMessage : `Submit minimum ${minQuestions} questions before ${deadlineFmt}. Each accepted question earns academic credits matching its AI novelty level.`}
                                                    </p>
                                                    {!directiveMessage && (
                                                        <div className="flex items-center gap-1.5 mt-2">
                                                            {countdown.expired ? (
                                                                <span className="text-[10px] font-black text-red-600">DEADLINE PASSED</span>
                                                            ) : (
                                                                <span className="text-[10px] font-black text-amber-700">
                                                                    ⏱ {countdown.d}d {countdown.h}h {countdown.m}m remaining
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pending approvals notification */}
                                    {pendingCount > 0 && (
                                        <div className="p-4 border-b border-slate-100 bg-blue-50">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <ClipboardList size={14} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800">Pending Approvals</p>
                                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                                        <strong>{pendingCount}</strong> student submission{pendingCount > 1 ? 's' : ''} awaiting your review.
                                                    </p>
                                                    <button onClick={() => { setActiveTab('approvals'); setNotifOpen(false); }} className="mt-2 text-[10px] font-black text-blue-600 hover:underline">
                                                        Review Now →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="px-4 py-2 text-[10px] text-slate-400 font-bold text-center">
                                        All notifications shown
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Square and rounded space profile trigger dropdown */}
                        <div className="relative flex items-center" ref={profileDropdownRef}>
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer transition-all active:scale-[0.97] hover:scale-[1.02]"
                                title="My Profile Options"
                                style={{
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(8px)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)'
                                }}
                            >
                                {user?.profileImage ? (
                                    <img
                                        src={user.profileImage.startsWith('http') ? user.profileImage : `{BASE_URL}/${user.profileImage}`}
                                        alt={user?.name || 'Profile'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-black text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                                )}
                            </button>

                            {profileDropdownOpen && (
                                <div className="absolute right-0 top-11 w-52 bg-white backdrop-blur-xl border border-slate-200/70 rounded-2xl p-2 shadow-[0_20px_60px_rgba(30,58,95,0.22)] z-[200] animate-fade-in flex flex-col gap-0.5">
                                    <button
                                        onClick={() => { setActiveTab('profile'); setProfileDropdownOpen(false); }}
                                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-[#1e3a5f] rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                                    >
                                        <User size={13} className="text-slate-400" />
                                        <span>My Profile</span>
                                    </button>
                                    <button
                                        onClick={() => { setShowChangePassword(true); setProfileDropdownOpen(false); }}
                                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-[#1e3a5f] rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                                    >
                                        <Lock size={13} className="text-slate-400" />
                                        <span>Change Password</span>
                                    </button>
                                    <div className="h-px bg-slate-100/80 my-1"></div>
                                    <button
                                        onClick={() => { localStorage.clear(); navigate('/login'); }}
                                        className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 hover:text-rose-800 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
                                    >
                                        <LogOut size={13} className="text-rose-500" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ══════════ NAV TABS ══════════ */}
            <div className="sticky top-16 z-30" style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid rgba(203,213,225,0.5)',
                boxShadow: '0 4px 24px rgba(30,58,95,0.08)'
            }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex overflow-x-auto no-scrollbar">
                        {[
                            { id: 'overview', label: 'Dashboard', icon: <TrendingUp size={15} /> },
                            { id: 'schedule', label: 'Class Schedule', icon: <Calendar size={15} /> },
                            { id: 'mentoring', label: 'Student Mentoring', icon: <Users size={15} /> },
                            { id: 'approvals', label: `Approvals${pendingCount > 0 ? ` (${pendingCount})` : ''}`, icon: <ClipboardList size={15} /> },
                            { id: 'questionbank', label: 'Question Bank', icon: <Layers size={15} /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className="flex items-center gap-2 px-5 py-[14px] text-sm font-bold whitespace-nowrap transition-all relative"
                                style={{
                                    color: activeTab === tab.id ? '#1e3a5f' : '#64748b',
                                    borderBottom: activeTab === tab.id ? '2px solid #1e3a5f' : '2px solid transparent',
                                    fontWeight: activeTab === tab.id ? 800 : 600,
                                }}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════ MAIN CONTENT ══════════ */}
            <main className="max-w-7xl mx-auto px-6 py-3 space-y-4">

                {/* ─── QUESTION DEADLINE BANNER (always visible) ─── */}
                {directiveActive && (
                    !countdown.expired ? (
                        <div className="bg-gradient-to-r from-[#0b1528] via-[#0f2244] to-[#183971] border border-blue-950/20 rounded-xl py-2 px-5 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="w-8.5 h-8.5 bg-white/10 border border-white/15 rounded-lg flex items-center justify-center shrink-0">
                                    <Bell size={16} className="text-amber-400 animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-[8.5px] font-black uppercase tracking-[0.22em] text-white/50 leading-none">Controller Directive — Question Bank</p>
                                    <h4 className="font-black text-xs sm:text-sm text-white mt-1.5 leading-tight">
                                        {directiveMessage ? directiveMessage : <>Submit min. <span className="text-amber-400 font-black">{minQuestions} questions</span> before <span className="text-amber-400 font-black">{deadlineFmt}</span></>}
                                    </h4>
                                    <p className="text-[10px] text-white/50 mt-1 leading-none">
                                        {directiveMessage ? 'Official Active Guidelines' : <>Each accepted question → <span className="text-white font-extrabold">academic credits matching AI rating</span></>}
                                    </p>
                                </div>
                            </div>
                            {!directiveMessage && (
                                <div className="flex items-center gap-1.5 self-center shrink-0">
                                    <CountdownBox value={countdown.d} label="Days" />
                                    <span className="text-sm font-black opacity-30 text-white">:</span>
                                    <CountdownBox value={countdown.h} label="Hrs" />
                                    <span className="text-sm font-black opacity-30 text-white">:</span>
                                    <CountdownBox value={countdown.m} label="Min" />
                                    <span className="text-sm font-black opacity-30 text-white">:</span>
                                    <CountdownBox value={countdown.s} label="Sec" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700">
                            <AlertTriangle size={18} />
                            <p className="text-sm font-black">Question bank submission deadline has passed. Contact the Exam Controller.</p>
                        </div>
                    )
                )}

                {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">

                        {/* Top stat cards */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { label: 'Questions Submitted', value: myStats.submitted, sub: `of ${minQuestions} required`, color: 'from-blue-500 to-blue-700', icon: <FileText size={18} /> },
                                { label: 'Questions Approved', value: myStats.approved, sub: 'by Exam Controller', color: 'from-emerald-500 to-emerald-700', icon: <CheckCircle size={18} /> },
                                { label: 'Novel Questions', value: myStats.novel, sub: 'highly unique contributions', color: 'from-amber-500 to-amber-600', icon: <Star size={18} /> },
                                { label: 'Academic Credits', value: `${myStats.credits} pts`, sub: 'real-time merit score', color: 'from-indigo-500 to-purple-600', icon: <Award size={18} /> },
                                { label: 'Pending Approvals', value: pendingCount, sub: 'student submissions', color: 'from-rose-500 to-rose-700', icon: <ClipboardList size={18} /> },
                            ].map(stat => (
                                <div key={stat.label} className={`bg-gradient-to-br ${stat.color} text-white rounded-2xl p-5 shadow-lg`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">{stat.icon}</div>
                                        <span className="text-2xl font-black">{stat.value}</span>
                                    </div>
                                    <p className="font-black text-sm">{stat.label}</p>
                                    <p className="text-[11px] opacity-70 mt-0.5">{stat.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Question progress + rank + subjects grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Question submission progress */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Submission Progress</h3>
                                    <span className="text-[10px] font-black px-2 py-0.5 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-full">{progressToMin}%</span>
                                </div>
                                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${progressToMin >= 100 ? 'bg-emerald-500' : progressToMin >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                        style={{ width: `${progressToMin}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[11px] font-black text-slate-500">
                                    <span>{myStats.submitted} submitted</span>
                                    <span>{minQuestions} required</span>
                                </div>

                                {/* Rank badge */}
                                <div className={`flex items-center gap-3 p-3 rounded-xl border ${rank.bg}`}>
                                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-current/10">
                                        {rank.iconType === 'trophy' && <Award size={16} />}
                                        {rank.iconType === 'star' && <Star size={16} />}
                                        {rank.iconType === 'book' && <BookOpen size={16} />}
                                        {rank.iconType === 'user' && <User size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Your Contribution Rank</p>
                                        <p className="font-black text-sm">{rank.label}</p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 space-y-2">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="font-bold text-slate-500">Academic Credits Earned</span>
                                        <span className="font-black text-emerald-600">+{myStats.approved * 5}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="font-bold text-slate-500">Deadline</span>
                                        <span className="font-black text-slate-700">{deadlineFmt}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="font-bold text-slate-500">Status</span>
                                        <span className={`font-black ${myStats.submitted >= minQuestions ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {myStats.submitted >= minQuestions ? '✓ Requirement Met' : '⚠ In Progress'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Current semester subjects progress */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <BookMarked size={13} /> Current Semester — Teaching Load
                                    </h3>
                                    <span className="text-[10px] font-black text-slate-400">{FACULTY_SUBJECTS.length} subjects</span>
                                </div>
                                <div className="space-y-4">
                                    {FACULTY_SUBJECTS.map(subj => {
                                        const pct = subj.progress;
                                        const color = pct >= 80 ? 'bg-emerald-500' : pct >= 55 ? 'bg-blue-500' : 'bg-amber-500';
                                        const label = pct >= 80 ? 'On Track' : pct >= 55 ? 'In Progress' : 'Needs Attn';
                                        const labelColor = pct >= 80 ? 'text-emerald-600 bg-emerald-50' : pct >= 55 ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50';
                                        return (
                                            <div key={subj.code} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800">{subj.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{subj.code} · {subj.sem} · {subj.students} students</p>
                                                    </div>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${labelColor}`}>{label}</span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-500 w-8 text-right">{pct}%</span>
                                                </div>
                                                <div className="flex gap-4 mt-2 text-[10px] font-bold text-slate-500">
                                                    <span>📖 {subj.done}/{subj.lectures} lectures</span>
                                                    <span>📝 {subj.assignments} assignments</span>
                                                    {subj.pending > 0 && <span className="text-amber-600">⏳ {subj.pending} pending</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Department info card */}
                        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a9e] rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-4">Department & Designation</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Department', value: user.department || 'Computer Science' },
                                    { label: 'Designation', value: user.position || 'Assistant Professor' },
                                    { label: 'Special Role', value: user.specialRole || 'Faculty Coordinator' },
                                    { label: 'Employee Status', value: user.status || 'Active' },
                                ].map(item => (
                                    <div key={item.label}>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{item.label}</p>
                                        <p className="font-black text-sm mt-1">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════════════ PROFILE TAB ══════════════════ */}
                {activeTab === 'profile' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(148,163,184,0.12)] border border-slate-200/60 overflow-hidden transition-all hover:bg-white/80">
                            {/* Banner */}
                            <div className="bg-gradient-to-r from-[#1e3a5f]/95 via-[#254673]/90 to-[#2d4a77]/85 backdrop-blur-md p-8 text-white relative overflow-hidden border-b border-white/10 shadow-[inset_0_-20px_40px_rgba(0,0,0,0.05)]">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <GraduationCap size={120} />
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full">
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center text-4xl font-black shadow-2xl">
                                            {user?.profileImage ? (
                                                <img src={user.profileImage.startsWith('http') ? user.profileImage : `{BASE_URL}/${user.profileImage}`} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{user?.name?.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-black tracking-tight mb-2 text-white">{user.name}</h1>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                                    {user.role}
                                                </span>
                                                <span className="px-3 py-1 bg-blue-400/20 text-blue-200 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-400/20">
                                                    {user.position || 'Professional'}
                                                </span>
                                                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${rank.bg}`}>
                                                    {rank.iconType === 'trophy' && <Award size={11} />}
                                                    {rank.iconType === 'star' && <Star size={11} />}
                                                    {rank.iconType === 'book' && <BookOpen size={11} />}
                                                    {rank.iconType === 'user' && <User size={11} />}
                                                    {rank.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={openEditProfile}
                                        className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-md active:scale-[0.98] hover:scale-[1.02] cursor-pointer shrink-0"
                                    >
                                        Edit Personal Profile
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section className="space-y-6 bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:bg-white/60 transition-all duration-300">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-3">
                                            <Briefcase size={13} className="text-[#1e3a5f]" /> Professional Record
                                        </h3>
                                        <div className="space-y-4">
                                            <DetailRow label="Department" value={user.department} />
                                            <DetailRow label="Designation" value={user.position} highlight />
                                            <DetailRow label="Special Role" value={user.specialRole} />
                                            <DetailRow label="Employee Status" value={user.status || 'Active'} />
                                            <DetailRow label="System ID" value={user.id?.slice(-8).toUpperCase()} />
                                        </div>
                                    </section>
                                    <section className="space-y-6 bg-white/40 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:bg-white/60 transition-all duration-300">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-100 pb-3">
                                            <User size={13} className="text-[#1e3a5f]" /> Personal Information
                                        </h3>
                                        <div className="space-y-4">
                                            <DetailRow icon={<Mail size={11} />} label="Official Email" value={user.email} />
                                            <DetailRow icon={<Phone size={11} />} label="Mobile Number" value={user.mobile} />
                                            <DetailRow icon={<Calendar size={11} />} label="Date of Birth" value={user.dob} />
                                            <DetailRow icon={<IdCard size={11} />} label="Aadhar No" value={user.aadharNo} />
                                            <DetailRow icon={<MapPin size={11} />} label="Residential Address" value={user.address} />
                                        </div>
                                    </section>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 backdrop-blur-sm border-t border-slate-150/40 px-8 py-3 flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
                                <span>EMS Security Level: Verified</span>
                            </div>
                        </div>

                        {/* Contribution summary in profile */}
                        <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 transition-all hover:bg-white/80 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)]">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                <Award size={13} className="text-[#1e3a5f]" /> Academic Contribution Summary
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Questions Submitted', value: myStats.submitted, icon: <FileText size={18} />, color: 'text-blue-600 bg-blue-50/50' },
                                    { label: 'Approved by Controller', value: myStats.approved, icon: <CheckCircle size={18} />, color: 'text-emerald-600 bg-emerald-50/50' },
                                    { label: 'Novel / High-Quality', value: myStats.novel, icon: <Star size={18} />, color: 'text-amber-500 bg-amber-50/50' },
                                ].map(item => (
                                    <div key={item.label} className="text-center p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-slate-200/40 shadow-sm hover:shadow-md hover:bg-white/80 hover:border-slate-200 transition-all duration-300">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 ${item.color}`}>{item.icon}</div>
                                        <div className="text-3xl font-black text-[#1e3a5f]">{item.value}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════════════ CLASS SCHEDULE TAB ══════════════════ */}
                {activeTab === 'schedule' && (
                    <div className="animate-fade-in space-y-5">
                        {/* HEADER + STATS ROW combined */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Class Scheduler & Lecture Logs</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Manage scheduled classes, mark lecture completion topics, and allot assignments</p>
                            </div>
                            <button
                                onClick={() => setShowScheduleModal(true)}
                                className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#2d5a9e] text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-2xl shadow-lg shadow-[#1e3a5f]/15 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer self-start sm:self-auto"
                            >
                                <Plus size={14} /> + Schedule a Class
                            </button>
                        </div>

                        {/* COMPACT STATS ROW */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { icon: <Calendar size={18} />, iconBg: 'bg-blue-50 text-blue-600', value: classSessions.filter(s => s.status === 'scheduled').length, label: 'Scheduled Lectures' },
                                { icon: <CheckCircle size={18} />, iconBg: 'bg-emerald-50 text-emerald-600', value: classSessions.filter(s => s.status === 'completed').length, label: 'Completed Lectures' },
                                { icon: <BookOpen size={18} />, iconBg: 'bg-indigo-50 text-[#1e3a5f]', value: classSessions.length, label: 'Total Lectures' },
                            ].map(stat => (
                                <div key={stat.label} className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/50 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>{stat.icon}</div>
                                    <div className="min-w-0">
                                        <div className="text-xl font-black text-[#1e3a5f]">{stat.value}</div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-tight">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* MAIN GRID: TIMELINE (2col) + ASSIGNMENTS (1col) */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                            <div className="xl:col-span-2 space-y-5">

                                {/* TIMELINE SLIDER CAROUSEL */}
                                <div className="glass-card-premium p-5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                                        <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Clock size={14} /> Date-wise Lecture Schedule
                                        </h3>
                                        {/* Navigation Chevrons */}
                                        {uniqueDates.length > 1 && (
                                            <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200/50 rounded-xl shrink-0">
                                                <button
                                                    type="button"
                                                    disabled={activeSlideIndex === 0}
                                                    onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                                                    className="p-1 rounded-lg hover:bg-white text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                                                >
                                                    <ChevronLeft size={12} />
                                                </button>
                                                <span className="text-[10px] font-black text-slate-500 px-1.5 select-none tabular-nums">
                                                    {activeSlideIndex + 1} / {uniqueDates.length}
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={activeSlideIndex === uniqueDates.length - 1}
                                                    onClick={() => setActiveSlideIndex(prev => Math.min(uniqueDates.length - 1, prev + 1))}
                                                    className="p-1 rounded-lg hover:bg-white text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                                                >
                                                    <ChevronRight size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {loadingSessions ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                            <Loader2 className="animate-spin text-[#1e3a5f] mb-3" size={32} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Loading schedules...</span>
                                        </div>
                                    ) : classSessions.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                            <Calendar className="mx-auto text-slate-300 mb-3" size={40} />
                                            <p className="text-sm font-bold text-slate-700">No classes scheduled yet</p>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Get started by clicking the "Schedule a Class" button above to register your lectures</p>
                                        </div>
                                    ) : (() => {
                                        const activeDateIndex = activeSlideIndex >= uniqueDates.length ? 0 : activeSlideIndex;
                                        const activeDateStr = uniqueDates[activeDateIndex];
                                        if (!activeDateStr) return null;

                                        const sessionsForActiveDate = classSessions.filter(s => s.date.split('T')[0] === activeDateStr);
                                        const activeInnerIndex = selectedInnerSessionIndex >= sessionsForActiveDate.length ? 0 : selectedInnerSessionIndex;
                                        const session = sessionsForActiveDate[activeInnerIndex];
                                        if (!session) return null;

                                        const todayStr = new Date().toISOString().split('T')[0];
                                        const isToday = activeDateStr === todayStr;
                                        const isUpcoming = new Date(activeDateStr).getTime() > new Date().setHours(0, 0, 0, 0) && !isToday;

                                        // Border & Color Scheme logic based on Status
                                        let cardBorder = 'border-slate-200';
                                        let badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                                        let sectionLabel = 'Scheduled Day';

                                        if (isToday) {
                                            cardBorder = 'border-2 border-green-500 bg-green-50/15 shadow-md shadow-green-500/10 ring-2 ring-green-500/10';
                                            badgeStyle = 'bg-green-600 text-white border-green-600';
                                            sectionLabel = "TODAY'S SCHEDULE";
                                        } else if (isUpcoming) {
                                            cardBorder = 'border-2 border-amber-500 bg-amber-50/15 shadow-md shadow-amber-500/10';
                                            badgeStyle = 'bg-amber-600 text-white border-amber-600';
                                            sectionLabel = 'UPCOMING SCHEDULE';
                                        } else if (sessionsForActiveDate.every(s => s.status === 'completed')) {
                                            cardBorder = 'border-emerald-250 bg-emerald-50/10 shadow-sm';
                                            badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                            sectionLabel = 'COMPLETED SCHEDULE';
                                        } else if (sessionsForActiveDate.every(s => s.status === 'cancelled')) {
                                            cardBorder = 'border-rose-350 bg-rose-50/10 shadow-sm';
                                            badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
                                            sectionLabel = 'CANCELLED SCHEDULE';
                                        } else {
                                            cardBorder = 'border-slate-300 bg-slate-50/10 shadow-sm';
                                            badgeStyle = 'bg-slate-100 text-slate-700 border-slate-250';
                                            sectionLabel = 'ARCHIVED SCHEDULE';
                                        }

                                        return (
                                            <div className="animate-scale-up">
                                                {/* Active Class Card */}
                                                <div className={`border rounded-3xl p-5 transition-all duration-300 relative ${cardBorder}`}>
                                                    {isToday && sessionsForActiveDate.some(s => s.status === 'scheduled') && (
                                                        <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                                        </span>
                                                    )}

                                                    {/* Card Header showing Date + Badge */}
                                                    <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200/60">
                                                        <div>
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Lecture Log</span>
                                                            <h4 className="text-base font-black text-[#1e3a5f] uppercase tracking-tight mt-0.5">
                                                                {new Date(activeDateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                            </h4>
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border shrink-0 shadow-sm ${badgeStyle}`}>
                                                            {sectionLabel}
                                                        </span>
                                                    </div>

                                                    {/* Split Layout: List left, Details right */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                                                        
                                                        {/* LEFT PANEL: DAILY TIMELINE LIST */}
                                                        <div className="lg:col-span-1">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#1e3a5f]/60 block border-b border-slate-100 pb-1.5 mb-2">
                                                                Classes ({sessionsForActiveDate.length})
                                                            </span>
                                                            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-thin max-h-[360px] lg:overflow-y-auto">
                                                                {sessionsForActiveDate.map((s, idx) => {
                                                                    const innerIsSelected = idx === activeInnerIndex;
                                                                    const innerIsCompleted = s.status === 'completed';
                                                                    const innerIsCancelled = s.status === 'cancelled';
                                                                    let innerStatusColor = 'bg-amber-400';
                                                                    let innerStatusText = 'Upcoming';
                                                                    let innerBg = innerIsSelected
                                                                        ? 'bg-[#1e3a5f]/5 border-[#1e3a5f] shadow-sm'
                                                                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300';
                                                                    if (innerIsCompleted) { innerStatusColor = 'bg-emerald-500'; innerStatusText = 'Done'; }
                                                                    else if (innerIsCancelled) { innerStatusColor = 'bg-rose-500'; innerStatusText = 'Cancelled'; }
                                                                    return (
                                                                        <button
                                                                            key={s._id}
                                                                            onClick={() => setSelectedInnerSessionIndex(idx)}
                                                                            type="button"
                                                                            className={`w-full text-left p-2.5 rounded-xl border transition-all duration-200 cursor-pointer min-w-[180px] lg:min-w-0 flex flex-col gap-1.5 ${innerBg}`}
                                                                        >
                                                                            <div className="flex items-start justify-between gap-1">
                                                                                <span className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-tight leading-tight line-clamp-2">{s.subject}</span>
                                                                                <span className="text-[9px] font-bold text-slate-400 shrink-0 tabular-nums">{s.time}</span>
                                                                            </div>
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-[8px] font-bold text-slate-400 uppercase">{s.semester} · {s.batch || 'All'}</span>
                                                                                <span className="flex items-center gap-1">
                                                                                    <span className={`w-1.5 h-1.5 rounded-full ${innerStatusColor}`}></span>
                                                                                    <span className="text-[8px] font-extrabold uppercase text-slate-500">{innerStatusText}</span>
                                                                                </span>
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* RIGHT PANEL: SELECTED CLASS DETAILS */}
                                                        <div className="lg:col-span-2 bg-white/70 border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
                                                            {(() => {
                                                                const isSessionCompleted = session.status === 'completed';
                                                                const isSessionCancelled = session.status === 'cancelled';
                                                                const isSessionUpcoming = new Date(session.date).getTime() > new Date().setHours(0,0,0,0) && session.date.split('T')[0] !== todayStr;
                                                                const isPast = new Date(activeDateStr).getTime() < new Date().setHours(0, 0, 0, 0);
                                                                const hasAssignment = assignmentsList.some(a => String(a.classSession?._id || a.classSession) === String(session._id));
                                                                return (
                                                                    <div>
                                                                        {/* Detail Panel Header */}
                                                                        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                                                                            <div className="min-w-0">
                                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{session.semester} · {session.batch || 'All'} · {session.department}</span>
                                                                                <h5 className="text-sm font-black text-[#1e3a5f] uppercase tracking-tight truncate">{session.subject}</h5>
                                                                            </div>
                                                                            <span className={`text-[8px] font-extrabold uppercase px-2.5 py-1 rounded-lg border shrink-0 ${
                                                                                isSessionCompleted 
                                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                                                    : isSessionCancelled 
                                                                                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                                                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                                                            }`}>
                                                                                {session.time} · {session.duration}m
                                                                            </span>
                                                                        </div>

                                                                        <div className="p-4 space-y-3">
                                                                        {/* Key Specs Row */}
                                                                        <div className="grid grid-cols-3 gap-2">
                                                                            {[
                                                                                { label: 'Time · Duration', value: `${session.time} / ${session.duration}m` },
                                                                                { label: 'Audience', value: `${session.semester} · ${session.batch || 'All'}` },
                                                                                { label: 'Assignment', value: hasAssignment ? '✓ Allotted' : 'None' },
                                                                            ].map(spec => (
                                                                                <div key={spec.label} className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                                                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">{spec.label}</span>
                                                                                    <div className="text-slate-700 font-extrabold text-[10px] truncate">{spec.value}</div>
                                                                                </div>
                                                                            ))}
                                                                        </div>

                                                                        {/* Lecture Plan Objectives */}
                                                                        <div className="space-y-1.5">
                                                                            <span className="font-black text-[#1e3a5f] uppercase tracking-widest text-[8px] block">Lecture Plan & Objectives</span>
                                                                            <div className="relative group/textarea bg-white border border-slate-200/80 rounded-xl overflow-hidden">
                                                                                {isSessionCompleted ? (
                                                                                    <div className="p-3">
                                                                                        <span className="font-black text-emerald-700 uppercase tracking-widest text-[8px] block mb-1">Lecture Completed</span>
                                                                                        <p className="font-extrabold text-slate-800 text-xs leading-relaxed bg-emerald-50/20 border border-emerald-100/50 p-2.5 rounded-xl">
                                                                                            <span className="text-emerald-700">“{session.topicCovered || 'No topics logged.'}”</span>
                                                                                        </p>
                                                                                    </div>
                                                                                ) : isSessionCancelled ? (
                                                                                    <div className="p-3">
                                                                                        <span className="font-black text-rose-700 uppercase tracking-widest text-[8px] block mb-1">Cancellation Reason</span>
                                                                                        <p className="font-semibold text-rose-700 bg-rose-50/50 border border-rose-100 p-2.5 rounded-xl leading-relaxed text-xs">
                                                                                            “{session.cancellationReason || 'No reason specified.'}”
                                                                                        </p>
                                                                                    </div>
                                                                                ) : (
                                                                                    <>
                                                                                        <textarea
                                                                                            value={currentPlanText}
                                                                                            onChange={e => setCurrentPlanText(e.target.value)}
                                                                                            placeholder="Enter planned topics and lecture objectives..."
                                                                                            className="w-full text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50/30 focus:bg-white border-0 rounded-xl p-2.5 pr-20 outline-none transition-all leading-relaxed resize-none"
                                                                                            rows={2}
                                                                                        />
                                                                                        {currentPlanText !== (session.topicPlanned || '') && (
                                                                                            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5 animate-scale-up z-10">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => setCurrentPlanText(session.topicPlanned || '')}
                                                                                                    className="bg-slate-50 hover:bg-slate-200/80 text-slate-700 font-extrabold uppercase text-[9px] tracking-wider px-2.5 py-1.5 rounded-lg transition-all border border-slate-200/60 shadow-sm cursor-pointer"
                                                                                                >
                                                                                                    Reset
                                                                                                </button>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={async () => {
                                                                                                        setSavingLecturePlan(true);
                                                                                                        try {
                                                                                                            const token = localStorage.getItem('urp_token');
                                                                                                            const res = await fetch(`{BASE_URL}/api/class-sessions/${session._id}`, {
                                                                                                                method: 'PUT',
                                                                                                                headers: {
                                                                                                                    'Content-Type': 'application/json',
                                                                                                                    'Authorization': `Bearer ${token}`
                                                                                                                },
                                                                                                                body: JSON.stringify({ topicPlanned: currentPlanText.trim() })
                                                                                                            });
                                                                                                            const data = await res.json();
                                                                                                            if (res.ok && data.success) {
                                                                                                                triggerToast('📝 Lecture plan saved successfully!');
                                                                                                                fetchClassSessions();
                                                                                                            } else {
                                                                                                                triggerToast(`❌ Error: ${data.error || 'Failed to update plan'}`);
                                                                                                            }
                                                                                                        } catch (err) {
                                                                                                            console.error(err);
                                                                                                            triggerToast('❌ Server communication error');
                                                                                                        } finally {
                                                                                                            setSavingLecturePlan(false);
                                                                                                        }
                                                                                                    }}
                                                                                                    disabled={savingLecturePlan || !currentPlanText.trim()}
                                                                                                    className="flex items-center gap-1 bg-[#1e3a5f] hover:bg-[#2d5a9e] text-white font-extrabold uppercase text-[9px] tracking-wider px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
                                                                                                >
                                                                                                    {savingLecturePlan ? (
                                                                                                        <>
                                                                                                            <Loader2 className="animate-spin" size={10} /> Saving
                                                                                                        </>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            <Check size={10} /> Save
                                                                                                        </>
                                                                                                    )}
                                                                                                </button>
                                                                                            </div>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        </div>{/* end p-4 space-y-3 */}

                                                                        {/* Card Actions Footer */}
                                                                        <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                                                                            {!isSessionCompleted && !isSessionCancelled ? (
                                                                                <div className="flex items-center gap-4">
                                                                                    <button
                                                                                        onClick={() => handleDeleteClassSession(session._id)}
                                                                                        className="text-rose-600 hover:text-rose-800 font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
                                                                                    >
                                                                                        Cancle the session
                                                                                    </button>
                                                                                    {!isPast && (
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setNewClassForm(prev => ({
                                                                                                    ...prev,
                                                                                                    subject: session.subject,
                                                                                                    semester: session.semester,
                                                                                                    batch: session.batch || 'All'
                                                                                                }));
                                                                                                setShowScheduleModal(true);
                                                                                            }}
                                                                                            className="text-[#1e3a5f] hover:text-[#2d5a9e] font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
                                                                                        >
                                                                                            + Add Class
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex items-center gap-4">
                                                                                    {isSessionCancelled ? (
                                                                                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-500/80 select-none bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 shadow-sm">
                                                                                            🚫 Lecture Session Cancelled
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 select-none bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 shadow-sm">
                                                                                            ✅ Lecture Session Completed
                                                                                        </span>
                                                                                    )}
                                                                                    {!isPast && (
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setNewClassForm(prev => ({
                                                                                                    ...prev,
                                                                                                    subject: session.subject,
                                                                                                    semester: session.semester,
                                                                                                    batch: session.batch || 'All'
                                                                                                }));
                                                                                                setShowScheduleModal(true);
                                                                                            }}
                                                                                            className="text-[#1e3a5f] hover:text-[#2d5a9e] font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer bg-slate-100/85 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg"
                                                                                        >
                                                                                            + Add Class
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                            
                                                                            {!isSessionCompleted && !isSessionCancelled && (
                                                                                <div className="flex items-center gap-2">
                                                                                    {!hasAssignment && (
                                                                                        <button
                                                                                            disabled={isSessionUpcoming}
                                                                                            onClick={() => {
                                                                                                setAllottingAssignmentId(session._id);
                                                                                                setSelectedQuestions([]);
                                                                                            }}
                                                                                            className={`bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold uppercase text-[10px] tracking-wider px-3.5 py-2 rounded-xl transition-all border border-purple-150 ${isSessionUpcoming ? 'opacity-50 cursor-not-allowed hover:bg-purple-50' : 'cursor-pointer'}`}
                                                                                        >
                                                                                            Allot Assignment
                                                                                        </button>
                                                                                    )}
                                                                                    <button
                                                                                        disabled={isSessionUpcoming}
                                                                                        onClick={() => {
                                                                                            setMarkingCompleteId(session._id);
                                                                                            setTopicCoveredInput(session.topicPlanned || '');
                                                                                        }}
                                                                                        className={`bg-green-600 hover:bg-green-700 text-white font-extrabold uppercase text-[10px] tracking-wider px-4 py-2 rounded-xl shadow transition-all ${isSessionUpcoming ? 'opacity-50 cursor-not-allowed hover:bg-green-600' : 'cursor-pointer'}`}
                                                                                    >
                                                                                        Mark Complete
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Dots Navigation indicators */}
                                                {uniqueDates.length > 1 && (
                                                    <div className="flex justify-center gap-1.5 pt-3">
                                                        {uniqueDates.map((dStr, idx) => {
                                                            const isTodaySlide = dStr === todayStr;
                                                            return (
                                                                <button
                                                                    key={dStr}
                                                                    type="button"
                                                                    onClick={() => setActiveSlideIndex(idx)}
                                                                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                                                        idx === activeSlideIndex 
                                                                            ? 'w-5 bg-[#1e3a5f]' 
                                                                            : isTodaySlide
                                                                                ? 'w-1.5 bg-green-500 hover:bg-green-600'
                                                                                : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                                                                    }`}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: ASSIGNMENTS REGISTRY */}
                            <div className="space-y-5">
                                <div className="glass-card-premium p-5">
                                    <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <ClipboardList size={14} /> Assignments Registry
                                    </h3>

                                    {loadingAssignments ? (
                                        <div className="flex items-center justify-center py-6 text-slate-400">
                                            <Loader2 className="animate-spin text-[#1e3a5f] mr-2" size={20} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Loading...</span>
                                        </div>
                                    ) : assignmentsList.length === 0 ? (
                                        <p className="text-xs text-slate-400 font-bold py-6 text-center">No assignments allotted yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {assignmentsList.map((assignment) => (
                                                <div key={assignment._id} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/40 rounded-2xl p-4 transition-all duration-300">
                                                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                                                        <div>
                                                            <span className="text-[8px] font-black text-purple-600 uppercase tracking-widest block">{assignment.semester} • {assignment.department}</span>
                                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight mt-0.5">{assignment.title}</h4>
                                                        </div>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                    </div>

                                                    <p className="text-[11px] text-slate-500 font-medium mb-3">{assignment.description || 'No description.'}</p>
                                                    
                                                    {/* QUESTIONS COUNT */}
                                                    <div className="text-[9px] font-black text-[#1e3a5f] uppercase tracking-wider mb-3">
                                                        📚 Questions Selected: {assignment.questions?.length || 0}
                                                    </div>

                                                    {/* SUBMISSIONS EXPANDABLE CONTAINER */}
                                                    <div className="border-t border-slate-200/50 pt-2 space-y-2">
                                                        <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Submissions ({assignment.submissions?.length || 0})</h5>
                                                        
                                                        {assignment.submissions?.length === 0 ? (
                                                            <p className="text-[10px] text-slate-400 italic">No submissions yet.</p>
                                                        ) : (
                                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                                {assignment.submissions.map((sub: any) => (
                                                                    <div key={sub._id} className="bg-white border border-slate-150 rounded-xl p-2.5 shadow-sm text-[11px]">
                                                                        <div className="flex items-center justify-between font-extrabold text-slate-700 mb-1">
                                                                            <span>{sub.student?.name} <span className="font-medium text-slate-400">({sub.student?.rollNo})</span></span>
                                                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                                                sub.grade === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-150' : 'bg-green-50 text-green-600 border border-green-150'
                                                                            }`}>
                                                                                Grade: {sub.grade}
                                                                            </span>
                                                                        </div>

                                                                        {sub.answers && sub.answers.length > 0 && (
                                                                            <div className="space-y-1 my-1.5 bg-slate-50 rounded-lg p-2 border border-slate-100">
                                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Student Answers:</span>
                                                                                {sub.answers.map((ans: string, idx: number) => (
                                                                                    <div key={idx} className="text-slate-600">
                                                                                        <strong>Q{idx + 1}:</strong> {ans}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        {sub.submittedText && (
                                                                            <p className="text-slate-500 font-medium my-1"><strong className="text-slate-600">Notes:</strong> {sub.submittedText}</p>
                                                                        )}

                                                                        {sub.feedback && (
                                                                            <p className="text-indigo-600 font-bold bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100 text-[10px] mt-1.5"><strong className="uppercase tracking-widest text-[8px] text-indigo-400 block mb-0.5">Your Feedback:</strong> {sub.feedback}</p>
                                                                        )}

                                                                        {sub.grade === 'Pending' && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setGradingAssignmentId(assignment._id);
                                                                                    setGradingSubmissionId(sub._id);
                                                                                    setGradingForm({ grade: 'A', feedback: '' });
                                                                                }}
                                                                                className="mt-2 text-indigo-600 hover:text-indigo-800 font-black uppercase text-[8px] tracking-wider transition-colors cursor-pointer"
                                                                            >
                                                                                Grade Submission
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SCHEDULE CLASS MODAL */}
                        {showScheduleModal && (
                            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-[#1e3a5f]/40 backdrop-blur-md" onClick={() => setShowScheduleModal(false)} />
                                <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[32px] max-w-lg w-full max-h-[82vh] flex flex-col p-6 shadow-2xl relative overflow-hidden animate-scale-up">
                                    <button onClick={() => setShowScheduleModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer z-10">
                                        <X size={20} />
                                    </button>
                                    <div className="shrink-0 mb-3">
                                        <h3 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight mb-1">Schedule Class</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule a date-wise lecture and notify the students</p>
                                    </div>

                                    <form onSubmit={handleScheduleClass} className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2 scrollbar-thin">
                                        {/* 1. SUBJECT SELECTION */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Predefined Subject</label>
                                                <select
                                                    value={newClassForm.subject}
                                                    required
                                                    onChange={e => {
                                                        const available = getAvailableSubjects();
                                                        const selected = available.find(sub => sub.name === e.target.value);
                                                        setNewClassForm(prev => ({
                                                            ...prev,
                                                            subject: e.target.value,
                                                            semester: selected ? selected.sem : prev.semester
                                                        }));
                                                    }}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none"
                                                >
                                                    <option value="">-- Choose Subject --</option>
                                                    {getAvailableSubjects().map(sub => (
                                                        <option key={sub.code} value={sub.name}>{sub.code} - {sub.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest block mb-1">Subject Code</label>
                                                <span className="bg-slate-100 border border-slate-200 text-[#1e3a5f] rounded-xl px-4 py-2.5 text-xs font-bold block select-none truncate">
                                                    {(() => {
                                                        const available = getAvailableSubjects();
                                                        const match = available.find(sub => sub.name === newClassForm.subject);
                                                        return match ? match.code : 'Select subject';
                                                    })()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* SEMESTER & BATCH SELECTION */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Semester</label>
                                                <select
                                                    value={newClassForm.semester}
                                                    required
                                                    onChange={e => setNewClassForm(prev => ({ ...prev, semester: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none"
                                                >
                                                    {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'].map(sem => (
                                                        <option key={sem} value={sem}>{sem}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Batch</label>
                                                <select
                                                    value={newClassForm.batch}
                                                    required
                                                    onChange={e => setNewClassForm(prev => ({ ...prev, batch: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none"
                                                >
                                                    {getActiveBatches().map(b => (
                                                        <option key={b} value={b}>{b}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* 2. TIME & DURATION */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Time</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. 10:00 AM"
                                                    value={newClassForm.time}
                                                    onChange={e => setNewClassForm(prev => ({ ...prev, time: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Duration (Mins)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    placeholder="60"
                                                    value={newClassForm.duration}
                                                    onChange={e => setNewClassForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* 3. LECTURE PLAN / OBJECTIVES */}
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Lecture Plan / Objectives</label>
                                            <textarea
                                                rows={2}
                                                placeholder="e.g. Lecture covers subnetting, CIDR notation, and practical IPv6 routing examples."
                                                value={newClassForm.topicPlanned}
                                                onChange={e => setNewClassForm(prev => ({ ...prev, topicPlanned: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none"
                                            />
                                        </div>

                                        {/* 4. TOGGLE CALENDAR GRID BUTTON */}
                                        <div className="pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowCalendarInModal(prev => !prev)}
                                                className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 text-[#1e3a5f] border border-[#1e3a5f]/15 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                                            >
                                                📅 {showCalendarInModal ? 'Hide Calendar Grid' : 'Choose Dates from Monthly Grid'}
                                            </button>
                                        </div>

                                        {/* COMPACT MONTHLY GRID CALENDAR */}
                                        {showCalendarInModal && (
                                            <div className="bg-[#1e3a5f]/5 border border-slate-200/60 rounded-2xl p-3.5 space-y-3 animate-scale-up">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-black text-[#1e3a5f] uppercase tracking-wider">
                                                        {currentCalendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const d = new Date(currentCalendarMonth);
                                                                d.setMonth(d.getMonth() - 1);
                                                                setCurrentCalendarMonth(d);
                                                            }}
                                                            className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-[#1e3a5f] transition-all cursor-pointer"
                                                        >
                                                            <ChevronLeft size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const d = new Date(currentCalendarMonth);
                                                                d.setMonth(d.getMonth() + 1);
                                                                setCurrentCalendarMonth(d);
                                                            }}
                                                            className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-[#1e3a5f] transition-all cursor-pointer"
                                                        >
                                                            <ChevronRight size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-slate-400 uppercase tracking-widest">
                                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                                        <span key={day}>{day}</span>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-7 gap-1 justify-items-center">
                                                    {(() => {
                                                        const year = currentCalendarMonth.getFullYear();
                                                        const month = currentCalendarMonth.getMonth();
                                                        const firstDayIndex = new Date(year, month, 1).getDay();
                                                        const totalDays = new Date(year, month + 1, 0).getDate();

                                                        const cells = [];
                                                        for (let i = 0; i < firstDayIndex; i++) {
                                                            cells.push(<div key={`pad-${i}`} className="w-7 h-7" />);
                                                        }
                                                        for (let d = 1; d <= totalDays; d++) {
                                                            const dayDate = new Date(year, month, d);
                                                            const formatted = formatDateKey(dayDate);
                                                            const isSelected = selectedBulkDates.includes(formatted);
                                                            const isToday = formatDateKey(new Date()) === formatted;
                                                            const isPast = dayDate.getTime() < new Date().setHours(0, 0, 0, 0);

                                                            cells.push(
                                                                <button
                                                                    key={d}
                                                                    type="button"
                                                                    disabled={isPast}
                                                                    onClick={() => {
                                                                        if (isSelected) {
                                                                            setSelectedBulkDates(prev => prev.filter(x => x !== formatted));
                                                                        } else {
                                                                            setSelectedBulkDates(prev => [...prev, formatted].sort());
                                                                        }
                                                                    }}
                                                                    className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-[10px] transition-all ${
                                                                        isPast
                                                                            ? 'text-slate-300 opacity-30 blur-[1px] cursor-not-allowed hover:bg-transparent pointer-events-none'
                                                                            : isSelected 
                                                                                ? 'bg-[#1e3a5f] text-white shadow shadow-[#1e3a5f]/25 scale-110 cursor-pointer' 
                                                                                : isToday 
                                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer' 
                                                                                    : 'hover:bg-slate-200/60 text-slate-700 cursor-pointer'
                                                                    }`}
                                                                >
                                                                    {d}
                                                                </button>
                                                            );
                                                        }
                                                        return cells;
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {/* SELECTED CLASS DATES */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Selected Class Dates ({selectedBulkDates.length})</label>
                                            <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border border-slate-200 rounded-2xl max-h-24 overflow-y-auto">
                                                {selectedBulkDates.map(d => (
                                                    <span key={d} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl px-2 py-0.5 text-[9px] font-black shadow-sm">
                                                        {new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedBulkDates(prev => prev.filter(x => x !== d))}
                                                            className="text-blue-500 hover:text-blue-750 font-black focus:outline-none cursor-pointer"
                                                        >
                                                            &times;
                                                        </button>
                                                    </span>
                                                ))}
                                                {selectedBulkDates.length === 0 && (
                                                    <span className="text-[10px] text-slate-400 italic font-semibold px-1 py-0.5">No dates selected yet. Choose from the grid above or add manually.</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* MANUAL DATE FIELD BACKUP */}
                                        <div className="flex gap-2 items-end pt-0.5">
                                            <div className="flex-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Or Add Specific Date Manually</label>
                                                <input
                                                    type="date"
                                                    min={new Date().toISOString().split('T')[0]}
                                                    value={customAddDateInput}
                                                    onChange={e => setCustomAddDateInput(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!customAddDateInput) return;
                                                    const chosenDate = new Date(customAddDateInput);
                                                    chosenDate.setHours(0,0,0,0);
                                                    const today = new Date();
                                                    today.setHours(0,0,0,0);
                                                    if (chosenDate.getTime() < today.getTime()) {
                                                        triggerToast('⚠️ Cannot schedule lectures on past dates');
                                                        return;
                                                    }
                                                    if (selectedBulkDates.includes(customAddDateInput)) {
                                                        triggerToast('⚠️ Date already added');
                                                        return;
                                                    }
                                                    setSelectedBulkDates(prev => [...prev, customAddDateInput].sort());
                                                    setCustomAddDateInput('');
                                                }}
                                                className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all border border-slate-800 cursor-pointer shadow-sm"
                                            >
                                                + Add Date
                                            </button>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-[#1e3a5f] hover:bg-[#2d5a9e] text-white font-black text-xs uppercase tracking-widest py-3 rounded-2xl shadow-lg transition-all cursor-pointer mt-4"
                                        >
                                            Schedule Class ({selectedBulkDates.length} Date(s))
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* MARK LECTURE COMPLETE MODAL */}
                        {markingCompleteId && (
                            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-[#1e3a5f]/40 backdrop-blur-md" onClick={() => setMarkingCompleteId(null)} />
                                <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[32px] max-w-md w-full p-8 shadow-2xl relative animate-scale-up">
                                    <button onClick={() => setMarkingCompleteId(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer">
                                        <X size={20} />
                                    </button>
                                    <h3 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight mb-2">Lecture Finished</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Mention the exact topic covered today to notify students</p>

                                    <form onSubmit={handleMarkCompleteSubmit} className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Topic Completed Today</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. IPv6 Subnetting & Header Formats"
                                                value={topicCoveredInput}
                                                onChange={e => setTopicCoveredInput(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest py-3 rounded-2xl shadow transition-all cursor-pointer mt-4"
                                        >
                                            Submit Completed Topic
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* ALLOT ASSIGNMENT MODAL WITH QUESTION BANK SELECTOR */}
                        {allottingAssignmentId && (
                            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-[#1e3a5f]/40 backdrop-blur-md" onClick={() => setAllottingAssignmentId(null)} />
                                <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[32px] max-w-2xl w-full p-8 shadow-2xl relative animate-scale-up flex flex-col max-h-[85vh]">
                                    <button onClick={() => setAllottingAssignmentId(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer">
                                        <X size={20} />
                                    </button>
                                    <h3 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight mb-1">Allot Assignment</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Compile assignments by selecting questions from the department question bank</p>

                                    <form onSubmit={handleAllotAssignmentSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assignment Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Computer Networks HW 1"
                                                    value={assignmentForm.title}
                                                    onChange={e => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Due Date</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={assignmentForm.dueDate}
                                                    onChange={e => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Instructions / Description</label>
                                            <textarea
                                                rows={2}
                                                placeholder="Instructions for answering questions..."
                                                value={assignmentForm.description}
                                                onChange={e => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-extrabold text-[#1e3a5f]">Select Questions from Central Question Bank</label>
                                            {questionsForSelector.length === 0 ? (
                                                <p className="text-xs text-slate-400 italic py-2">No question bank questions found for your department.</p>
                                            ) : (
                                                <div className="space-y-3 max-h-60 overflow-y-auto border border-slate-200/50 rounded-2xl p-4 bg-slate-50/50">
                                                    {questionsForSelector.map(q => (
                                                        <label key={q._id} className="flex items-start gap-3 p-3 bg-white border border-slate-150 rounded-xl cursor-pointer hover:border-slate-300 transition-all select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedQuestions.includes(q._id)}
                                                                onChange={e => {
                                                                    if (e.target.checked) {
                                                                        setSelectedQuestions(prev => [...prev, q._id]);
                                                                    } else {
                                                                        setSelectedQuestions(prev => prev.filter(id => id !== q._id));
                                                                    }
                                                                }}
                                                                className="mt-1"
                                                            />
                                                            <div className="text-xs">
                                                                <p className="font-extrabold text-slate-800">{q.text}</p>
                                                                <div className="flex gap-2 mt-1.5">
                                                                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-150">{q.code}</span>
                                                                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-150">Marks: {q.marks}</span>
                                                                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-150">{q.difficulty}</span>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-[#1e3a5f] hover:bg-[#2d5a9e] text-white font-black text-xs uppercase tracking-widest py-3 rounded-2xl shadow transition-all cursor-pointer mt-4"
                                        >
                                            Allot Assignment ({selectedQuestions.length} Selected)
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* GRADING SUBMISSION MODAL */}
                        {gradingSubmissionId && (
                            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-[#1e3a5f]/40 backdrop-blur-md" onClick={() => { setGradingAssignmentId(null); setGradingSubmissionId(null); }} />
                                <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[32px] max-w-md w-full p-8 shadow-2xl relative animate-scale-up flex flex-col">
                                    <button onClick={() => { setGradingAssignmentId(null); setGradingSubmissionId(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer">
                                        <X size={20} />
                                    </button>
                                    <h3 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight mb-2">Grade Assignment</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Review student work and allot grades & feedback</p>

                                    <form onSubmit={handleGradeSubmissionSubmit} className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Grade</label>
                                            <select
                                                value={gradingForm.grade}
                                                onChange={e => setGradingForm(prev => ({ ...prev, grade: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800"
                                            >
                                                {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(g => (
                                                    <option key={g} value={g}>{g}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Feedback / Comments</label>
                                            <textarea
                                                rows={3}
                                                required
                                                placeholder="Excellent work. Answers are complete and well structured."
                                                value={gradingForm.feedback}
                                                onChange={e => setGradingForm(prev => ({ ...prev, feedback: e.target.value }))}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-[#1e3a5f] hover:bg-[#2d5a9e] text-white font-black text-xs uppercase tracking-widest py-3 rounded-2xl shadow transition-all cursor-pointer mt-4"
                                        >
                                            Submit Grade
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════ MENTORING TAB ══════════════════ */}
                {activeTab === 'mentoring' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
                            <div>
                                <h2 className="text-2xl font-black text-[#1e3a5f] uppercase tracking-tight">Student Mentorship Portal</h2>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Search mentored student profiles, evaluate projects, and award skill credits</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Student search and select */}
                            <div className="space-y-4">
                                <div className="glass-card-premium p-5">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-1.5">
                                        <Search size={14} className="text-[#1e3a5f]" /> Mentored Students
                                    </h3>
                                    <div className="relative mb-3">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={studentSearch}
                                            onChange={e => setStudentSearch(e.target.value)}
                                            placeholder="Search by student name..."
                                            className="w-full h-10 pl-9 pr-4 bg-white/60 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all font-semibold"
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {mentoredStudents.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase())).length} Students Found
                                    </span>
                                </div>

                                {/* Student cards list */}
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                    {loadingStudents ? (
                                        <div className="text-center py-10">
                                            <Loader2 className="animate-spin text-[#1e3a5f] mx-auto mb-2" size={24} />
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading roster...</p>
                                        </div>
                                    ) : mentoredStudents.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase())).length === 0 ? (
                                        <div className="text-center py-10 bg-white/50 border border-slate-200/50 rounded-2xl p-4">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No associated students found</p>
                                        </div>
                                    ) : (
                                        mentoredStudents.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase())).map((student) => {
                                            const isSelected = selectedStudent?._id === student._id;
                                            return (
                                                <button
                                                    type="button"
                                                    key={student._id}
                                                    onClick={() => handleSelectStudent(student)}
                                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${isSelected
                                                            ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white shadow-lg'
                                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-350'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-[#1e3a5f]'}`}>
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className={`font-black text-sm truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>{student.name}</p>
                                                            <p className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                                                                {student.rollNo || 'No Roll No'} · {student.programme || 'B.Tech'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Selected student mentoring details & projects list */}
                            <div className="lg:col-span-2 space-y-6">
                                {selectedStudent ? (
                                    <>
                                        {/* Mentorship Profile Card */}
                                        <div className="glass-card-premium p-6">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-1.5 pb-2.5 border-b border-slate-100">
                                                <User size={14} className="text-[#1e3a5f]" /> Mentoring Profile Details
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                <DetailRow label="Student Name" value={selectedStudent.name} highlight />
                                                <DetailRow icon={<Mail size={11} />} label="Student Email" value={selectedStudent.email} />
                                                <DetailRow label="Department" value={selectedStudent.department || 'Computer Science'} />
                                                <DetailRow label="University Roll No" value={selectedStudent.rollNo} />
                                                <DetailRow label="Programme / Stream" value={selectedStudent.programme || 'B.Tech'} />
                                                <DetailRow label="Current Semester" value={selectedStudent.semester || 'Sem 6'} />
                                            </div>
                                        </div>

                                        {/* Student Submitted Projects Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Submitted Projects for Evaluation</h3>
                                                <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-full">
                                                    {studentProjects.length} Submitted
                                                </span>
                                            </div>

                                            {loadingProjects ? (
                                                <div className="text-center py-20 bg-white/50 border border-slate-200/50 rounded-3xl p-6">
                                                    <Loader2 className="animate-spin text-[#1e3a5f] mx-auto mb-2" size={24} />
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fetching student projects database...</p>
                                                </div>
                                            ) : studentProjects.length === 0 ? (
                                                <div className="text-center py-16 bg-white/50 border border-slate-200/50 rounded-3xl p-6">
                                                    <div className="text-3xl mb-3">📁</div>
                                                    <h4 className="font-bold text-slate-700 text-sm mb-1">No projects submitted yet</h4>
                                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">This student has not registered any projects</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {studentProjects.map((project) => {
                                                        const isEvaluated = project.creditsLocked || !!project.feedback;
                                                        const isCompleted = project.status === 'Completed';
                                                        const formState = evaluationForm[project._id] || { credits: project.skillsCredits || 3, feedback: '' };
                                                        const isEvaluating = evaluatingProjectId === project._id;

                                                        // Border color: green = evaluated/completed, red = awaiting
                                                        const borderColor = isEvaluated
                                                            ? isCompleted ? '#10b981' : '#6366f1'
                                                            : '#ef4444';
                                                        const borderLabel = isEvaluated
                                                            ? isCompleted ? 'COMPLETED' : 'EVALUATED'
                                                            : 'AWAITING REVIEW';
                                                        const borderLabelColor = isEvaluated
                                                            ? isCompleted ? '#059669' : '#4f46e5'
                                                            : '#dc2626';

                                                        return (
                                                            <div key={project._id} className="bg-white rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md" style={{
                                                                border: `2px solid ${borderColor}`,
                                                                boxShadow: `0 0 0 0px ${borderColor}22, 0 1px 3px rgba(0,0,0,0.07)`
                                                            }}>
                                                                {/* Colored top strip */}
                                                                <div className="h-1 w-full" style={{ background: borderColor }} />

                                                                <div className="p-6">
                                                                    {/* Project Metadata */}
                                                                    <div className="flex justify-between items-start gap-4 mb-3">
                                                                        <div>
                                                                            <h4 className="font-black text-[#1e3a5f] text-base leading-snug">{project.name}</h4>
                                                                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">
                                                                                Stack: <strong className="text-slate-600">{project.stack}</strong>
                                                                            </p>
                                                                        </div>
                                                                        <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border flex-shrink-0" style={{
                                                                            color: borderLabelColor,
                                                                            background: `${borderColor}12`,
                                                                            borderColor: `${borderColor}50`
                                                                        }}>
                                                                            {borderLabel}
                                                                        </span>
                                                                    </div>

                                                                    {/* Description */}
                                                                    <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/50 mb-5">
                                                                        {project.desc}
                                                                    </p>

                                                                    {/* Evaluation block */}
                                                                    <div className="border-t border-slate-100 pt-4 space-y-4">
                                                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                                            <Award size={12} className="text-indigo-500" /> Evaluation & Skill Credits Allocation
                                                                        </h5>

                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                                                            {/* Credits — locked after first eval */}
                                                                            <div>
                                                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                                                                    Award Skill Credits
                                                                                    {isEvaluated && <span className="ml-1 text-emerald-600 normal-case tracking-normal font-bold">(Locked)</span>}
                                                                                </label>
                                                                                {isEvaluated ? (
                                                                                    <div className="flex items-center h-10 px-4 bg-emerald-50 border border-emerald-200 rounded-xl gap-2 w-fit">
                                                                                        <Award size={13} className="text-emerald-600" />
                                                                                        <span className="text-base font-black text-emerald-700">{project.skillsCredits}</span>
                                                                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Credits</span>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm h-10 w-fit">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => setEvaluationForm(prev => ({
                                                                                                ...prev,
                                                                                                [project._id]: { ...prev[project._id], credits: Math.max(0, formState.credits - 1) }
                                                                                            }))}
                                                                                            className="px-3 py-2 text-slate-500 hover:bg-slate-100 font-black text-lg leading-none transition-colors"
                                                                                        >−</button>
                                                                                        <input
                                                                                            type="number"
                                                                                            min={0} max={10}
                                                                                            value={formState.credits}
                                                                                            onChange={e => setEvaluationForm(prev => ({
                                                                                                ...prev,
                                                                                                [project._id]: { ...prev[project._id], credits: Number(e.target.value) }
                                                                                            }))}
                                                                                            className="w-12 text-center text-sm font-black text-slate-800 border-0 outline-none"
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => setEvaluationForm(prev => ({
                                                                                                ...prev,
                                                                                                [project._id]: { ...prev[project._id], credits: Math.min(10, formState.credits + 1) }
                                                                                            }))}
                                                                                            className="px-3 py-2 text-slate-500 hover:bg-slate-100 font-black text-lg leading-none transition-colors"
                                                                                        >+</button>
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {/* Feedback input — always active */}
                                                                            <div className="md:col-span-2">
                                                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                                                                    {isEvaluated ? 'Add Another Feedback' : 'Mentoring Feedback'}
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={formState.feedback}
                                                                                    onChange={e => setEvaluationForm(prev => ({
                                                                                        ...prev,
                                                                                        [project._id]: { ...prev[project._id], feedback: e.target.value }
                                                                                    }))}
                                                                                    placeholder={isEvaluated ? "Add a new feedback note…" : "Enter feedback comments for the student..."}
                                                                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:border-[#1e3a5f] outline-none transition-all placeholder:text-slate-400 font-semibold"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {/* Feedback History */}
                                                                        {project.feedbackHistory && project.feedbackHistory.length > 0 && (
                                                                            <div className="mt-2 rounded-xl overflow-hidden border border-slate-100">
                                                                                <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center gap-1.5">
                                                                                    <MessageSquare size={11} className="text-slate-400" />
                                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Feedback History ({project.feedbackHistory.length})</span>
                                                                                </div>
                                                                                <div className="divide-y divide-slate-50 max-h-40 overflow-y-auto">
                                                                                    {[...project.feedbackHistory].reverse().map((entry: any, idx: number) => (
                                                                                        <div key={idx} className="px-3 py-2.5 bg-white flex flex-col gap-0.5">
                                                                                            <p className="text-xs font-semibold text-slate-700 leading-relaxed">"{entry.text}"</p>
                                                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                                                <span className="text-[9px] font-black text-indigo-600">{entry.byName}</span>
                                                                                                <span className="text-[9px] text-slate-400 font-bold">·</span>
                                                                                                <span className="text-[9px] text-slate-400 font-semibold">
                                                                                                    {new Date(entry.at).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <div className="flex justify-between items-center pt-1">
                                                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-lg border" style={{
                                                                                color: borderLabelColor,
                                                                                background: `${borderColor}10`,
                                                                                borderColor: `${borderColor}40`
                                                                            }}>
                                                                                {isEvaluated
                                                                                    ? `✓ Evaluated — ${project.skillsCredits} Credits Locked`
                                                                                    : '⏳ Awaiting Review'}
                                                                            </span>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleEvaluateProjectClick(project._id)}
                                                                                disabled={isEvaluating || !formState.feedback.trim()}
                                                                                className="px-4 py-2.5 bg-[#1e3a5f] hover:bg-[#162d4a] disabled:bg-slate-200 disabled:text-slate-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer ml-auto"
                                                                            >
                                                                                {isEvaluating ? (
                                                                                    <>
                                                                                        <Loader2 size={12} className="animate-spin" />
                                                                                        <span>Saving…</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Check size={12} />
                                                                                        <span>{isEvaluated ? 'Add Feedback' : 'Submit Evaluation'}</span>
                                                                                    </>
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-24 bg-white/50 border border-slate-200/50 rounded-3xl p-6">
                                        <div className="text-4xl mb-4">👨‍🏫</div>
                                        <h3 className="font-bold text-slate-700 text-lg mb-1">Select a student from the mentoring roster</h3>
                                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Choose a student on the left to evaluate their submissions and award credits</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════════════ APPROVALS TAB ══════════════════ */}
                {activeTab === 'approvals' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Project & Assignment Approvals</h2>
                                <p className="text-sm font-bold text-slate-500 mt-0.5">Review submissions and award credits manually</p>
                            </div>
                            <div className="flex gap-2 text-[11px] font-black">
                                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">{pendingCount} Pending</span>
                                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">{approvals.filter(a => a.status === 'approved').length} Approved</span>
                                <span className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full border border-rose-200">{approvals.filter(a => a.status === 'rejected').length} Rejected</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {approvals.map(appr => {
                                const isExpanded = expandedApproval === appr.id;
                                const statusColors: Record<string, string> = {
                                    pending: 'border-amber-200 bg-white',
                                    approved: 'border-emerald-200 bg-emerald-50/30',
                                    rejected: 'border-rose-200 bg-rose-50/30',
                                };
                                const badgeColors: Record<string, string> = {
                                    pending: 'bg-amber-100 text-amber-700',
                                    approved: 'bg-emerald-100 text-emerald-700',
                                    rejected: 'bg-rose-100 text-rose-700',
                                };
                                return (
                                    <div key={appr.id} className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${statusColors[appr.status]}`}>
                                        {/* Header row */}
                                        <div
                                            className="flex items-center justify-between p-5 cursor-pointer"
                                            onClick={() => setExpandedApproval(isExpanded ? null : appr.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm ${appr.type === 'project' ? 'bg-indigo-500' : 'bg-teal-500'}`}>
                                                    {appr.type === 'project' ? <Target size={17} /> : <FileText size={17} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black text-slate-800 text-sm">{appr.title}</p>
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full capitalize ${badgeColors[appr.status]}`}>
                                                            {appr.status}
                                                        </span>
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">
                                                            {appr.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                                                        {appr.student} · {appr.rollNo} · {appr.subject}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-slate-400">{appr.submittedOn}</span>
                                                {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                            </div>
                                        </div>

                                        {/* Expanded details */}
                                        {isExpanded && (
                                            <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4 bg-slate-50/50">
                                                <p className="text-sm text-slate-600 font-medium leading-relaxed">{appr.description}</p>

                                                {appr.status === 'pending' && (
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                                                        <div className="flex items-center gap-3">
                                                            <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Credits to Award:</label>
                                                            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                                                <button
                                                                    onClick={() => setCreditInputs(prev => ({ ...prev, [appr.id]: Math.max(0, (prev[appr.id] || 0) - 1) }))}
                                                                    className="px-3 py-2 text-slate-500 hover:bg-slate-100 font-black text-lg leading-none"
                                                                >−</button>
                                                                <input
                                                                    type="number"
                                                                    min={0} max={20}
                                                                    value={creditInputs[appr.id] ?? appr.creditSuggested}
                                                                    onChange={e => setCreditInputs(prev => ({ ...prev, [appr.id]: Number(e.target.value) }))}
                                                                    className="w-14 text-center text-sm font-black text-slate-800 border-0 outline-none py-2"
                                                                />
                                                                <button
                                                                    onClick={() => setCreditInputs(prev => ({ ...prev, [appr.id]: Math.min(20, (prev[appr.id] || 0) + 1) }))}
                                                                    className="px-3 py-2 text-slate-500 hover:bg-slate-100 font-black text-lg leading-none"
                                                                >+</button>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-400">(suggested: {appr.creditSuggested})</span>
                                                        </div>

                                                        <div className="flex gap-2 sm:ml-auto">
                                                            <button
                                                                onClick={() => handleApprove(appr.id)}
                                                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow"
                                                            >
                                                                <Check size={13} /> Approve & Award Credits
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(appr.id)}
                                                                className="flex items-center gap-1.5 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-black rounded-xl transition"
                                                            >
                                                                <X size={13} /> Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {appr.status === 'approved' && (
                                                    <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                                                        <CheckCircle size={16} />
                                                        Approved — <span className="text-emerald-800">{creditInputs[appr.id] ?? appr.creditSuggested} credits</span> awarded to {appr.student}
                                                    </div>
                                                )}
                                                {appr.status === 'rejected' && (
                                                    <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                                                        <XCircle size={16} /> Rejected
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ══════════════════ QUESTION BANK TAB ══════════════════ */}
                {activeTab === 'questionbank' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Question Bank Management</h2>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Scope: {user.department} Department</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress to Deadline</p>
                                    <p className="text-2xl font-black text-[#1e3a5f]">{myStats.submitted}<span className="text-slate-300 text-lg">/{minQuestions}</span></p>
                                </div>
                            </div>

                            {/* Deadline reminder inline */}
                            {!countdown.expired && (
                                <div className="mb-6 flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold">
                                    <Clock size={14} />
                                    <span>Deadline: <strong>{deadlineFmt}</strong> — {countdown.d}d {countdown.h}h {countdown.m}m {countdown.s}s remaining</span>
                                </div>
                            )}

                            <div className="border-t border-slate-100 pt-6">
                                <QuestionBank
                                    role="PROFESSOR"
                                    department={user.department}
                                    collegeId={user.college?._id}
                                    facultyName={user.name}
                                    facultyProfileUrl={`/college-admin/faculty/${user.id}`}
                                />
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default FacultySelfDashboard;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';
import {
    GraduationCap, BookOpen, Clock, FileText, Download,
    ShieldCheck, Mail, MapPin, User, Calendar, Phone, IdCard,
    PieChart, CalendarCheck, CreditCard, ArrowRight, Bell, Sparkles,
    ChevronRight, Zap, Target, Award, ExternalLink, Library,
    ClipboardCheck, History, Info, Bookmark, FileBadge, Eye, EyeOff,
    CheckCircle, ShieldAlert, Globe, HelpCircle, Share2
} from 'lucide-react';
import ExamForm from '../components/Examination/ExamForm';

const SEMESTER_DATA = [
    {
        sem: 'Semester 6',
        status: 'Ongoing',
        isCurrent: true,
        credits: 18,
        courses: [
            { code: 'CS601', name: 'Computer Networks', credits: 4, faculty: 'Dr. Alan Turing', progress: 75, topics: ['OSI Model', 'TCP/IP Protocol', 'Routing Algorithms', 'Network Security', 'Wireless LANs', 'Socket Programming'] },
            { code: 'CS602', name: 'Database Management Systems', credits: 4, faculty: 'Prof. Grace Hopper', progress: 92, topics: ['Relational Model', 'SQL Queries', 'Normalization', 'Transaction Control', 'Concurrency', 'NoSQL Basics'] },
            { code: 'CS603', name: 'Operating Systems', credits: 3, faculty: 'Dr. Linus Torvalds', progress: 60, topics: ['Process Management', 'Memory Allocation', 'File Systems', 'Virtualization', 'Deadlocks', 'I/O Systems'] },
            { code: 'CS604', name: 'Cloud Computing Infrastructure', credits: 3, faculty: 'Prof. Satya Nadella', progress: 45, topics: ['SaaS/PaaS/IaaS', 'Virtual Machines', 'Serverless', 'Microservices', 'AWS/Azure Tools', 'Cloud Security'] },
            { code: 'CS605', name: 'Software Engineering & Design', credits: 4, faculty: 'Dr. Margaret Hamilton', progress: 80, topics: ['Agile Methodology', 'UML Diagrams', 'Software Testing', 'DevOps', 'SDLC Models', 'System Design'] }
        ]
    },
    {
        sem: 'Semester 2',
        status: 'Completed',
        gpa: '8.2',
        credits: 22,
        courses: [
            { code: 'MA201', name: 'Engineering Mathematics II', credits: 4, result: 'B', topics: ['Linear Algebra', 'Complex Variables', 'Fourier Series', 'Laplace Transforms'] },
            { code: 'EC201', name: 'Basic Electronics', credits: 3, result: 'A', topics: ['Diodes', 'Transistors', 'Operational Amplifiers', 'Digital Logic'] },
            { code: 'ME201', name: 'Engineering Graphics', credits: 3, result: 'A+', topics: ['Orthographic Projections', 'Isometric Views', 'CAD Basics', 'Sectional Views'] }
        ]
    },
    {
        sem: 'Semester 1',
        status: 'Completed',
        gpa: '8.5',
        credits: 20,
        courses: [
            { code: 'MA101', name: 'Engineering Mathematics I', credits: 4, result: 'A', topics: ['Calculus', 'Matrices', 'Vector Algebra', 'Differential Equations'] },
            { code: 'PH101', name: 'Engineering Physics', credits: 4, result: 'A+', topics: ['Quantum Mechanics', 'Wave Optics', 'Electromagnetism', 'Semiconductors'] },
            { code: 'CS101', name: 'Programming in C', credits: 3, result: 'B+', topics: ['Basics', 'Control Structures', 'Arrays & Pointers', 'Structures & Files'] }
        ]
    }
];

const StudentSelfDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'examcell' | 'elearning' | 'locker' | 'projects'>('overview');
    const [showExamForm, setShowExamForm] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    const [expandedSem, setExpandedSem] = useState<string | null>('Semester 6');
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

    // Notices State
    const [notices, setNotices] = useState<any[]>(() => {
        const stored = localStorage.getItem('urp_notices');
        return stored ? JSON.parse(stored) : [];
    });
    const [showAllNotices, setShowAllNotices] = useState(false);

    // Target Grades State for GPA Predictor
    const [targetGrades, setTargetGrades] = useState<Record<string, number>>({
        CS601: 10, // Computer Networks (O - 10)
        CS602: 9,  // DBMS (A+ - 9)
        CS603: 8,  // OS (A - 8)
        CS604: 9,  // Cloud Computing (A+ - 9)
        CS605: 8   // Software Eng (A - 8)
    });

    // Digital Locker statuses
    const [requestingDoc, setRequestingDoc] = useState<string | null>(null);
    const [documentStatus, setDocumentStatus] = useState<Record<string, string>>({
        sem5: 'verified',
        bonafide: 'verified',
        nodues: 'processing',
        transcript: 'requestable'
    });

    // Toast message state
    const [toast, setToast] = useState('');

    const triggerToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    // Projects & Achievements state (Sync with local storage for cross-portal faculty reviews)
    const [projects, setProjects] = useState<any[]>(() => {
        const stored = localStorage.getItem('urp_student_projects');
        return stored ? JSON.parse(stored) : [
            { id: 'p1', name: 'Distributed Key-Value Store', stack: 'Go, Raft Consensus, gRPC', desc: 'A fault-tolerant distributed transactional database implemented in Go using Raft consensus.', status: 'Completed', feedback: 'Stellar work on consensus log compaction! - Dr. Alan Turing' },
            { id: 'p2', name: 'Autonomous Drone Obstacle Detection', stack: 'Python, OpenCV, PyTorch, ROS', desc: 'Real-time object detection and path routing utilizing stereoscopic depth mapping.', status: 'In Progress', feedback: '' }
        ];
    });

    const [achievements, setAchievements] = useState<any[]>(() => {
        const stored = localStorage.getItem('urp_student_achievements');
        return stored ? JSON.parse(stored) : [
            { id: 'a1', title: 'AWS Solutions Architect Associate', org: 'Amazon Web Services', date: '2025-08-14' },
            { id: 'a2', title: 'Google Associate Cloud Engineer', org: 'Google Cloud Platform', date: '2026-02-19' }
        ];
    });

    // Form states
    const [newProjName, setNewProjName] = useState('');
    const [newProjStack, setNewProjStack] = useState('');
    const [newProjDesc, setNewProjDesc] = useState('');
    const [newProjStatus, setNewProjStatus] = useState<'In Progress' | 'Completed'>('In Progress');

    const [newAchTitle, setNewAchTitle] = useState('');
    const [newAchOrg, setNewAchOrg] = useState('');
    const [newAchDate, setNewAchDate] = useState('');

    // Dynamic Sessional Attendance State (read from faculty upload)
    const [liveAttendance, setLiveAttendance] = useState(() => {
        const stored = localStorage.getItem('urp_student_attendance');
        if (stored) {
            const data = JSON.parse(stored);
            return data.attendancePercentage ? Number(data.attendancePercentage) : 86.5;
        }
        return 86.5;
    });

    // Auto-update values when local storage updates in secondary tabs
    useEffect(() => {
        const handleStorageUpdate = () => {
            const storedAtt = localStorage.getItem('urp_student_attendance');
            if (storedAtt) {
                const data = JSON.parse(storedAtt);
                if (data.attendancePercentage !== undefined) {
                    setLiveAttendance(Number(data.attendancePercentage));
                }
            }
            const storedProjs = localStorage.getItem('urp_student_projects');
            if (storedProjs) {
                setProjects(JSON.parse(storedProjs));
            }
            const storedNotices = localStorage.getItem('urp_notices');
            if (storedNotices) {
                setNotices(JSON.parse(storedNotices));
            }
        };
        window.addEventListener('storage', handleStorageUpdate);
        // Also run a short periodic polling sync to ensure fast UI updates
        const interval = setInterval(handleStorageUpdate, 1500);
        return () => {
            window.removeEventListener('storage', handleStorageUpdate);
            clearInterval(interval);
        };
    }, []);

    // Persist changes
    useEffect(() => {
        localStorage.setItem('urp_student_projects', JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        localStorage.setItem('urp_student_achievements', JSON.stringify(achievements));
    }, [achievements]);

    const handleAddProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjName.trim() || !newProjStack.trim()) return;
        const newP = {
            id: 'p_' + Date.now(),
            name: newProjName,
            stack: newProjStack,
            desc: newProjDesc,
            status: newProjStatus,
            feedback: ''
        };
        setProjects([newP, ...projects]);
        setNewProjName('');
        setNewProjStack('');
        setNewProjDesc('');
        setNewProjStatus('In Progress');
        triggerToast('New project registered in institutional repository!');
    };

    const handleAddAchievement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAchTitle.trim() || !newAchOrg.trim()) return;
        const newA = {
            id: 'a_' + Date.now(),
            title: newAchTitle,
            org: newAchOrg,
            date: newAchDate || new Date().toISOString().split('T')[0]
        };
        setAchievements([newA, ...achievements]);
        setNewAchTitle('');
        setNewAchOrg('');
        setNewAchDate('');
        triggerToast('Credential registered and certified successfully!');
    };

    // SWAYAM Credit Transfer states
    const [transferCourse, setTransferCourse] = useState('');
    const [transferCredits, setTransferCredits] = useState('3');
    const [submittingTransfer, setSubmittingTransfer] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('urp_user');
        if (!stored) { navigate('/login'); return; }
        const u = JSON.parse(stored);
        if (u.role !== 'STUDENT') { navigate('/login'); return; }
        setUser(u);
    }, [navigate]);

    if (!user) return null;

    // SGPA/CGPA predictions calculation
    const sem6Courses = [
        { code: 'CS601', name: 'Computer Networks', credits: 4 },
        { code: 'CS602', name: 'Database Management Systems', credits: 4 },
        { code: 'CS603', name: 'Operating Systems', credits: 3 },
        { code: 'CS604', name: 'Cloud Computing Infrastructure', credits: 3 },
        { code: 'CS605', name: 'Software Engineering & Design', credits: 4 }
    ];

    const calculateProjections = () => {
        let totalSemCredits = 0;
        let totalSemPoints = 0;

        sem6Courses.forEach(c => {
            const gradeVal = targetGrades[c.code] || 0;
            totalSemCredits += c.credits;
            totalSemPoints += gradeVal * c.credits;
        });

        const projectedSemSGPA = totalSemCredits > 0 ? (totalSemPoints / totalSemCredits) : 0;
        
        // Cumulative calculations based on current 112 credits at CGPA 8.94
        const currentCredits = 112;
        const currentCGPA = 8.94;
        const currentTotalPoints = currentCredits * currentCGPA; // 1001.28
        
        const newTotalCredits = currentCredits + totalSemCredits; // 130
        const projectedCGPA = (currentTotalPoints + totalSemPoints) / newTotalCredits;

        return {
            sgpa: projectedSemSGPA.toFixed(2),
            cgpa: projectedCGPA.toFixed(2),
            points: totalSemPoints
        };
    };

    const projections = calculateProjections();

    const handleRequestDoc = (docKey: string, docName: string) => {
        setRequestingDoc(docKey);
        setTimeout(() => {
            setDocumentStatus(prev => ({ ...prev, [docKey]: 'processing' }));
            setRequestingDoc(null);
            triggerToast(`Secure request for ${docName} successfully submitted to the Registry!`);
        }, 1500);
    };

    const handleSwayamSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferCourse) {
            triggerToast('Please provide the SWAYAM course title.');
            return;
        }
        setSubmittingTransfer(true);
        setTimeout(() => {
            setSubmittingTransfer(false);
            setTransferCourse('');
            triggerToast('Syllabus & Certificate submitted for Academic Board Approval!');
        }, 2000);
    };

    if (showExamForm) {
        return (
            <div className="min-h-screen bg-[#f8fafc] p-8 animate-fade-in font-body">
                <div className="max-w-4xl mx-auto space-y-6">
                    <button 
                        onClick={() => setShowExamForm(false)} 
                        className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                    >
                        <ArrowRight size={14} className="rotate-180" /> Exit to Dashboard
                    </button>
                    <ExamForm studentData={user} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-body pb-20 overflow-x-hidden selection:bg-slate-200">
            {toast && (
                <div className="fixed top-6 right-6 z-[110] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-extrabold tracking-wide animate-fade-in flex items-center gap-2.5 border-[1px] border-slate-800">
                    <Sparkles size={14} className="text-yellow-400" />
                    <span>{toast}</span>
                </div>
            )}

            <ChangePassword isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />

            {/* HEADER */}
            <header className="bg-white/85 backdrop-blur-xl border-b-[1px] border-slate-100 sticky top-0 z-50 px-6 lg:px-12 h-20 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div 
                        onClick={() => setActiveTab('overview')} 
                        className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer shrink-0"
                    >
                        <GraduationCap className="text-white w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm font-black text-slate-950 truncate leading-none uppercase mb-1 tracking-tight">
                            {user.university?.name || 'All Campus Digital'}
                        </h1>
                        <p className="text-[9px] font-black text-slate-400 truncate uppercase tracking-[0.2em]">
                            {user.college?.name}
                        </p>
                    </div>
                </div>

                 <div className="flex items-center gap-6">
                    <div className="hidden xl:flex items-center gap-7 border-r-[1px] border-slate-100 pr-7 h-8">
                        {[
                            { id: 'overview', label: 'Dashboard' },
                            { id: 'curriculum', label: 'Curriculum' },
                            { id: 'projects', label: 'Projects & Achievements' },
                            { id: 'examcell', label: 'Exam Cell' },
                            { id: 'elearning', label: 'SWAYAM e-Learning' },
                            { id: 'locker', label: 'Digital Locker' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id as any)}
                                className={`text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === t.id 
                                        ? 'text-slate-950 font-black border-b-2 border-slate-950 pb-1' 
                                        : 'text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setShowChangePassword(true)} 
                            className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 rounded-xl hover:bg-slate-100/80 border-[1px] border-slate-200/40"
                            title="Security Credentials"
                        >
                            <Zap size={15} />
                        </button>
                        <button 
                            onClick={() => { localStorage.clear(); navigate('/login'); }} 
                            className="px-4.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                        >
                            Secure Logout
                        </button>
                    </div>
                </div>
            </header>

            {notices.length > 0 && (
                <div className="bg-rose-600 text-white px-6 py-2.5 flex items-center gap-4 text-xs font-bold w-full shadow-sm z-40 relative border-b border-rose-700">
                    <div className="bg-rose-800 text-rose-100 px-2.5 py-1 rounded-md uppercase tracking-widest text-[9px] shrink-0 font-black flex items-center gap-1.5 shadow-inner">
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping"></div>
                        Notice
                    </div>
                    <div className="flex-1 overflow-hidden text-[12px] uppercase tracking-wider font-semibold opacity-90">
                        {/* eslint-disable-next-line jsx-a11y/no-distracting-elements */}
                        <marquee behavior="scroll" direction="left" scrollamount="5">
                            {notices.map((n: any) => `[${n.date}] ${n.title}: ${n.desc}`).join(' ✦✦✦ ')}
                        </marquee>
                    </div>
                    <button onClick={() => setShowAllNotices(true)} className="shrink-0 text-[9px] bg-rose-700 hover:bg-rose-800 px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors border border-rose-500 shadow-sm flex items-center gap-1.5">
                        Show More <ArrowRight size={12} />
                    </button>
                </div>
            )}

            {/* MOBILE NAVIGATION BAR (Shown on small screens) */}
            <div className="xl:hidden bg-white border-b-[1px] border-slate-100 px-6 py-3 flex gap-2 overflow-x-auto">
                {[
                    { id: 'overview', label: 'Dashboard' },
                    { id: 'curriculum', label: 'Curriculum' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'examcell', label: 'Exam Cell' },
                    { id: 'elearning', label: 'SWAYAM' },
                    { id: 'locker', label: 'Locker' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shrink-0 border-[1px] ${
                            activeTab === t.id 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                                : 'bg-slate-50 text-slate-500 border-slate-200/50 hover:bg-slate-100'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-10 animate-fade-in">
                        {/* HERO CARD */}
                        <section className="bg-white rounded-[32px] p-6 sm:p-10 border-[1px] border-slate-200/60 shadow-md flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32 opacity-80" />
                            <div className="absolute left-0 bottom-0 w-60 h-60 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-3xl -ml-24 -mb-24 opacity-60" />
                            
                            <div className="relative group shrink-0">
                                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-[28px] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-5xl sm:text-6xl font-black text-white shadow-xl shadow-slate-950/15 relative overflow-hidden select-none">
                                    {user.name.charAt(0)}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-300 cursor-pointer">
                                        <Sparkles size={18} className="animate-pulse mb-1 text-yellow-400" />
                                        <span className="text-[8px] font-black uppercase tracking-wider">Photo Wallet</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 space-y-5 text-center lg:text-left w-full">
                                <div>
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
                                        <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider rounded-md border border-slate-900">
                                            Official Student Portal
                                        </span>
                                        <span className="px-3 py-1 bg-green-50 text-green-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-green-100">
                                            Active Record
                                        </span>
                                    </div>
                                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-1.5 leading-tight">
                                        {user.name}
                                    </h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-none">
                                        {user.department} &bull; {user.programme || 'Bachelor of Technology'}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-5 border-t border-slate-100">
                                    <IntroStat label="Registration" value={user.registrationNo || 'REG-2024-892'} />
                                    <IntroStat label="Roll Number" value={user.rollNo || 'REG-2024-892'} highlight />
                                    <IntroStat label="Current Sem" value={user.semester} />
                                    <IntroStat label="Batch / Year" value="2023-2027" />
                                </div>
                            </div>
                        </section>

                        {/* STATS TILES */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <LiveStat title="Current CGPA" value="8.94" sub="Academic Elite" icon={<PieChart className="text-slate-900" size={24} />} progress={89.4} color="from-slate-900 to-slate-800" />
                            <LiveStat title="Attendance" value={`${liveAttendance.toFixed(1)}%`} sub={liveAttendance >= 75 ? "Status: Safe" : "Status: Debarred!"} icon={<CalendarCheck className="text-emerald-600" size={24} />} progress={liveAttendance} color={liveAttendance >= 75 ? "from-emerald-500 to-emerald-600" : "from-rose-500 to-rose-600"} />
                            <LiveStat title="Total Credits" value="112" sub="of 160 required" icon={<Award className="text-purple-600" size={24} />} progress={70} color="from-purple-500 to-purple-600" />
                        </section>

                        {/* NEW FEATURE: INTERACTIVE CGPA PREDICTOR & CALCULATOR */}
                        <section className="bg-white rounded-[32px] p-6 sm:p-8 border-[1px] border-slate-200/60 shadow-md relative overflow-hidden">
                            <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-3xl opacity-60" />
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-[1px] border-slate-100 pb-5 mb-6 gap-3">
                                <div>
                                    <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
                                        <Target className="text-indigo-600" size={20} />
                                        Target CGPA & Grades Predictor
                                    </h3>
                                    <p className="text-slate-500 text-xs font-semibold">Simulate Semester 6 course targets to project cumulative academic results in real-time.</p>
                                </div>
                                <span className="px-3.5 py-1 bg-indigo-50 border-[1px] border-indigo-100 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0">
                                    Simulating 18 Credits
                                </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Simulated Course Grades Selector */}
                                <div className="lg:col-span-7 space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Configure Semester 6 Grade Targets</h4>
                                    <div className="space-y-2.5">
                                        {sem6Courses.map(course => (
                                            <div key={course.code} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border-[1px] border-slate-200/40 hover:border-slate-300/60 hover:bg-slate-100/30 transition-all">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-slate-900 tracking-tight">{course.name}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{course.code} &bull; {course.credits} Credits</p>
                                                </div>
                                                <select
                                                    value={targetGrades[course.code] || 8}
                                                    onChange={(e) => setTargetGrades(p => ({ ...p, [course.code]: Number(e.target.value) }))}
                                                    className="px-3 py-1.5 bg-white border-[1px] border-slate-200 rounded-xl text-xs font-black text-slate-800 outline-none focus:border-slate-900 transition-colors"
                                                >
                                                    <option value={10}>O (Outstanding - 10)</option>
                                                    <option value={9}>A+ (Excellent - 9)</option>
                                                    <option value={8}>A (Very Good - 8)</option>
                                                    <option value={7}>B+ (Good - 7)</option>
                                                    <option value={6}>B (Above Average - 6)</option>
                                                    <option value={5}>C (Average - 5)</option>
                                                    <option value={0}>F (Fail - 0)</option>
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Radial Display & Projections Output */}
                                <div className="lg:col-span-5 bg-slate-50 rounded-[28px] border-[1px] border-slate-200/50 p-6 flex flex-col justify-between items-center text-center">
                                    <div className="space-y-1 w-full">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Simulation Result</h4>
                                        <p className="text-xs text-slate-500 font-medium">Cumulative result with 130 total credits.</p>
                                    </div>

                                    {/* Score Dial Display */}
                                    <div className="my-6 relative flex items-center justify-center">
                                        <div className="w-36 h-36 rounded-full border-[8px] border-slate-200 flex flex-col items-center justify-center bg-white shadow-md relative">
                                            {/* Colored accent ring */}
                                            <div className="absolute inset-0 rounded-full border-[8px] border-indigo-600 transition-all" style={{ clipPath: `polygon(50% 50%, 50% 0%, ${Number(projections.cgpa) > 8 ? '100% 0%, 100% 100%' : '100% 0%'})` }} />
                                            <p className="text-4xl font-black text-slate-950 tracking-tighter leading-none">{projections.cgpa}</p>
                                            <p className="text-[8px] font-black text-indigo-600 uppercase tracking-wider mt-1">Projected CGPA</p>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-slate-200/60">
                                        <div className="border-r border-slate-200/60">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sem 6 SGPA</p>
                                            <p className="text-lg font-black text-slate-900 mt-0.5">{projections.sgpa}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">New Total Credits</p>
                                            <p className="text-lg font-black text-slate-900 mt-0.5">130</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 text-[10px] font-extrabold text-slate-500 italic">
                                        {Number(projections.cgpa) >= 8.9 ? 'Outstanding! This maintains your Academic Elite standing.' : 'Excellent effort! Strive to cross the 9.0 threshold.'}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* DETAIL PANELS */}
                        <section className="bg-white rounded-[32px] border-[1px] border-slate-200/60 shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                            <div className="p-6 sm:p-10 border-r-[1px] border-slate-100 space-y-8">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2.5">
                                    <Target className="text-slate-900" size={16} /> Academic Record
                                </h4>
                                <div className="space-y-4">
                                    <InfoRow label="Institute" value={user.college?.name} />
                                    <InfoRow label="Programme" value={user.programme} />
                                    <InfoRow label="Branch Major" value={user.department} />
                                    <InfoRow label="Semester" value={user.semester} />
                                    <InfoRow label="Registration" value={user.registrationNo} />
                                </div>
                            </div>
                            <div className="p-6 sm:p-10 bg-slate-50/10 space-y-8">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2.5">
                                    <User className="text-indigo-600" size={16} /> Personal Identity
                                </h4>
                                <div className="space-y-4">
                                    <InfoRow label="Official Email" value={user.email} icon={<Mail size={13} />} />
                                    <InfoRow label="Contact No" value={user.mobile} icon={<Phone size={13} />} />
                                    <InfoRow label="Date of Birth" value={user.dob} icon={<Calendar size={13} />} />
                                    <InfoRow label="Aadhar No" value={user.aadharNo} icon={<ShieldCheck size={13} />} />
                                    <InfoRow label="Address" value={user.address} icon={<MapPin size={13} />} />
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* CURRICULUM TAB */}
                {activeTab === 'curriculum' && (
                    <div className="space-y-10 animate-fade-in">
                        <SectionHeader title="Academic Curriculum" desc="Official syllabus, progress tracking, and lecture breakdown across all phases." />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-6">
                                {SEMESTER_DATA.map((sem) => (
                                    <div key={sem.sem} className="space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedSem(expandedSem === sem.sem ? null : sem.sem)}
                                            className="w-full flex items-center justify-between p-6 bg-white rounded-[24px] border-[1px] border-slate-200/60 shadow-sm hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors ${
                                                    expandedSem === sem.sem 
                                                        ? 'bg-slate-900 text-white' 
                                                        : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700'
                                                }`}>
                                                    <Library size={22} />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">{sem.sem}</h3>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
                                                        {sem.status} {sem.gpa && `· SGPA: ${sem.gpa}`} &bull; {sem.credits} Total Credits
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className={`text-slate-300 transition-transform duration-300 ${expandedSem === sem.sem ? 'rotate-90 text-slate-900' : ''}`} />
                                        </button>

                                        {expandedSem === sem.sem && (
                                            <div className="space-y-3.5 pl-4 sm:pl-6 border-l-2 border-slate-200/80 animate-slide-down">
                                                {sem.courses.map((course) => (
                                                    <CourseRow
                                                        key={course.code}
                                                        {...course}
                                                        isExpanded={expandedCourse === course.code}
                                                        onToggle={() => setExpandedCourse(expandedCourse === course.code ? null : course.code)}
                                                        onToast={triggerToast}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-white rounded-[28px] p-6 border-[1px] border-slate-200/60 shadow-sm space-y-6">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <Bookmark className="text-slate-900" size={15} /> Academic Utilities
                                    </h3>
                                    <div className="space-y-3">
                                        <ResourceLink title="Syllabus Handbook (PDF)" icon={<FileBadge size={16} />} onToast={triggerToast} />
                                        <ResourceLink title="Institutional Calendar" icon={<Calendar size={16} />} onToast={triggerToast} />
                                        <ResourceLink title="Sessional Regulations 2024" icon={<Clock size={16} />} onToast={triggerToast} />
                                        <ResourceLink title="Library digital card pass" icon={<IdCard size={16} />} onToast={triggerToast} />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-slate-950 to-slate-800 rounded-[28px] p-6 text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5"><BookOpen size={90} /></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-wider mb-2.5 text-slate-300">Office of the Controller</h4>
                                    <p className="text-white/80 text-[11px] font-semibold leading-relaxed mb-5">
                                        Physical degree credentials for batch 2023 have been dispatched to college counters for validation.
                                    </p>
                                    <button 
                                        type="button"
                                        onClick={() => triggerToast('Notice Details requested!')}
                                        className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
                                    >
                                        View Dispatch Logs
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* EXAM CELL TAB */}
                {activeTab === 'examcell' && (
                    <div className="space-y-10 animate-fade-in">
                        <SectionHeader title="Examination Cell" desc="Official portals for examination registration, backlog clearances and hall permit downloads." />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <ServiceCard
                                onClick={() => {
                                    if (liveAttendance < 75) {
                                        triggerToast(`Debarred: Your sessional attendance is ${liveAttendance.toFixed(1)}%, which is below the mandatory 75% threshold. Please contact your Department Head.`);
                                    } else {
                                        setShowExamForm(true);
                                    }
                                }}
                                icon={<FileText size={26} />}
                                title="Exam Registration"
                                desc="Apply for upcoming Semester 6 final examinations. Confirm elective papers."
                                badge={liveAttendance < 75 ? "Debarred: Below 75%" : "Live Now"}
                                color={liveAttendance < 75 ? "bg-rose-600" : "bg-slate-950"}
                            />
                            <ServiceCard
                                onClick={() => triggerToast('Hall tickets will be available for download on June 1st.')}
                                icon={<IdCard size={26} />}
                                title="Download Hall Permit"
                                desc="Entry permit for exams. Enabled after college clearance and registry authorization."
                                badge="Available June 01"
                                color="bg-indigo-600"
                            />
                            <ServiceCard
                                onClick={() => triggerToast('Loading digital transcripts cabinet...')}
                                icon={<ClipboardCheck size={26} />}
                                title="Semester Results Ledger"
                                desc="View and download digitized transcripts. Certified by the Central Board."
                                badge="Updated May 12"
                                color="bg-emerald-600"
                            />
                            <ServiceCard
                                onClick={() => triggerToast('Registry Backlog form will be active in October.')}
                                icon={<History size={26} />}
                                title="Backlog Supplementary"
                                desc="Register for supplementary exam blocks or backlog paper reassessment."
                                badge="Closed"
                                color="bg-rose-600"
                            />
                        </div>

                        <div className="bg-amber-50/60 border-[1px] border-amber-200/70 rounded-[28px] p-6 sm:p-8 flex gap-5 items-start">
                            <div className="w-12 h-12 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                                <Info size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight mb-1">Controller Directives</h4>
                                <p className="text-xs font-bold text-amber-800 leading-relaxed mb-4">
                                    Hall ticket printing requires a minimum of 75% attendance in each registered subject. Absentees beyond the permissible limits will be debarred from entering the exam cell.
                                </p>
                                <button 
                                    onClick={() => triggerToast('Downloading Exam Regulation Handbook PDF...')}
                                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-black uppercase tracking-wider rounded-xl shadow-md transition-colors"
                                >
                                    Download Regulations Manual
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* NEW FEATURE: SWAYAM & NPTEL CREDIT TRANSFER PORTAL */}
                {activeTab === 'elearning' && (
                    <div className="space-y-10 animate-fade-in">
                        <SectionHeader title="SWAYAM Credit Transfer Hub" desc="Manage credit transfers, track certifications, and apply NPTEL grades directly to your degree ledger." />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Online Courses Grid */}
                            <div className="lg:col-span-8 space-y-6">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Active online course credits</h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Course 1 */}
                                    <div className="bg-white p-5 rounded-[24px] border-[1px] border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="px-2 py-0.5 bg-indigo-50 border-[1px] border-indigo-100 text-indigo-700 rounded text-[9px] font-black uppercase tracking-wider">
                                                    IIT Madras
                                                </span>
                                                <span className="text-[10px] font-black text-indigo-600">4 Credits</span>
                                            </div>
                                            <h4 className="text-base font-black text-slate-900 tracking-tight leading-snug mb-1">Deep Learning & Neural Networks</h4>
                                            <p className="text-[10px] font-bold text-slate-500">Syllabus major: Computer Science</p>
                                        </div>
                                        <div className="mt-6 space-y-2">
                                            <div className="flex justify-between text-[9px] font-extrabold text-slate-400 uppercase">
                                                <span>Progress</span>
                                                <span>85%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '85%' }}></div>
                                            </div>
                                            <button 
                                                onClick={() => triggerToast('Redirecting to SWAYAM course player...')}
                                                className="w-full mt-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all"
                                            >
                                                Resume Course Player
                                            </button>
                                        </div>
                                    </div>

                                    {/* Course 2 */}
                                    <div className="bg-white p-5 rounded-[24px] border-[1px] border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="px-2 py-0.5 bg-green-50 border-[1px] border-green-100 text-green-700 rounded text-[9px] font-black uppercase tracking-wider">
                                                    IIT Kharagpur
                                                </span>
                                                <span className="text-[10px] font-black text-green-600">3 Credits</span>
                                            </div>
                                            <h4 className="text-base font-black text-slate-900 tracking-tight leading-snug mb-1">Modern Cryptography</h4>
                                            <p className="text-[10px] font-bold text-slate-500">Syllabus major: Network Security</p>
                                        </div>
                                        <div className="mt-6 space-y-2">
                                            <div className="flex justify-between text-[9px] font-extrabold text-green-600 uppercase">
                                                <span>Status</span>
                                                <span>Completed (O Grade)</span>
                                            </div>
                                            <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-600 rounded-full" style={{ width: '100%' }}></div>
                                            </div>
                                            <button 
                                                onClick={() => triggerToast('Downloading verified NPTEL e-certificate...')}
                                                className="w-full mt-2 py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <Download size={11} /> Download Certificate
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-[28px] border-[1px] border-slate-200/60 shadow-sm flex flex-col sm:flex-row gap-5 items-center justify-between">
                                    <div className="flex gap-4 items-center text-center sm:text-left">
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-sm">
                                            <Globe className="text-white" size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 tracking-tight">Need to explore more SWAYAM courses?</h4>
                                            <p className="text-xs text-slate-500 font-medium">Browse online subjects matching your curriculum scheme.</p>
                                        </div>
                                    </div>
                                    <a 
                                        href="https://swayam.gov.in" 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shrink-0"
                                    >
                                        Swayam Directory <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>

                            {/* Credit Transfer Form */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-white rounded-[28px] p-6 border-[1px] border-slate-200/60 shadow-sm">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Award className="text-slate-950" size={15} /> Apply Credit Transfer
                                    </h3>
                                    <form onSubmit={handleSwayamSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">SWAYAM Course Title</label>
                                            <input 
                                                type="text" 
                                                required
                                                placeholder="e.g. Advanced Operating Systems"
                                                value={transferCourse}
                                                onChange={(e) => setTransferCourse(e.target.value)}
                                                className="w-full h-10 px-3 border-[1px] border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none focus:bg-white focus:border-slate-950 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Credits Count</label>
                                            <select
                                                value={transferCredits}
                                                onChange={(e) => setTransferCredits(e.target.value)}
                                                className="w-full h-10 px-3 border-[1px] border-slate-200 rounded-xl text-xs font-bold bg-slate-50 outline-none focus:bg-white focus:border-slate-950 transition-colors"
                                            >
                                                <option value="2">2 Credits</option>
                                                <option value="3">3 Credits</option>
                                                <option value="4">4 Credits</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Attach Marksheet (PDF)</label>
                                            <input 
                                                type="file" 
                                                accept="application/pdf"
                                                className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-100 file:text-slate-950 hover:file:bg-slate-200 cursor-pointer"
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <button 
                                                type="submit" 
                                                disabled={submittingTransfer}
                                                className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
                                            >
                                                {submittingTransfer ? (
                                                    <>
                                                        <Clock size={12} className="animate-spin" /> Submitting Request...
                                                    </>
                                                ) : (
                                                    'Submit Transfer Application'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* NEW FEATURE: DIGITAL LOCKER TAB */}
                {activeTab === 'locker' && (
                    <div className="space-y-10 animate-fade-in">
                        <SectionHeader title="Digital Credentials Wallet" desc="Verified documents ledger, secure transcripts, blockchain certificate hashes and digitally signed locker downloads." />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Holographic ID Badge Wallet */}
                            <div className="lg:col-span-4 flex flex-col justify-start">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Verified digital identity</h3>
                                
                                <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden border-[1px] border-slate-800 group hover:shadow-2xl transition-all">
                                    {/* Top Crest / logo */}
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                            <GraduationCap className="text-white w-5 h-5" />
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-black uppercase tracking-wider">
                                                VERIFIED
                                            </span>
                                            <p className="text-[8px] text-slate-400 font-extrabold uppercase mt-1">Blockchain Secured</p>
                                        </div>
                                    </div>

                                    {/* Student Card Info */}
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[8px] text-slate-400 uppercase tracking-widest">Student Name</p>
                                            <h4 className="text-lg font-black tracking-tight mt-0.5">{user.name}</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] text-slate-400 uppercase tracking-widest">Registration ID</p>
                                                <p className="font-mono text-xs font-bold text-slate-100">{user.registrationNo || 'REG-2024-892'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-slate-400 uppercase tracking-widest">Roll Number</p>
                                                <p className="font-mono text-xs font-bold text-slate-100">{user.rollNo || 'REG-2024-892'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* simulated Holographic details */}
                                    <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Active Enrollment</span>
                                        </div>
                                        <div className="w-10 h-10 bg-white rounded-lg p-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                            {/* Simulated QR Code */}
                                            <div className="w-full h-full bg-slate-900 rounded-sm flex items-center justify-center text-[7px] text-white font-black uppercase select-none">URP</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verified Documents Ledger */}
                            <div className="lg:col-span-8 space-y-6">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Registry Document Repository</h3>

                                <div className="bg-white rounded-[28px] border-[1px] border-slate-200/60 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-left">
                                            <thead>
                                                <tr className="bg-slate-50 border-b-[1px] border-slate-100">
                                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Document Name</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-wider text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {/* Doc 1 */}
                                                <tr>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center shrink-0 border-[1px] border-green-100">
                                                                <FileText size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-950">Digitized Transcript (Sem 5)</p>
                                                                <p className="text-[8px] text-slate-400 font-extrabold uppercase">Last updated: May 12, 2026</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[9px] font-black uppercase tracking-wider border border-green-100">
                                                            Verified & Signed
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => triggerToast('Downloading Certified Semester 5 Marksheet PDF...')}
                                                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 inline-flex ml-auto"
                                                        >
                                                            <Download size={10} /> Download
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Doc 2 */}
                                                <tr>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border-[1px] border-indigo-100">
                                                                <IdCard size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-950">Bonafide Student Certificate</p>
                                                                <p className="text-[8px] text-slate-400 font-extrabold uppercase">Registry Certified &middot; Phase 06</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-black uppercase tracking-wider border border-indigo-100">
                                                            Verified & Active
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => triggerToast('Downloading verified Bonafide Student Certificate...')}
                                                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 inline-flex ml-auto"
                                                        >
                                                            <Download size={10} /> Download
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Doc 3 */}
                                                <tr>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border-[1px] border-amber-100">
                                                                <ShieldCheck size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-950">No Dues Accounts clearance</p>
                                                                <p className="text-[8px] text-slate-400 font-extrabold uppercase">Department accounts review</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {documentStatus.nodues === 'processing' ? (
                                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-black uppercase tracking-wider border border-amber-100 animate-pulse">
                                                                Processing review
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[9px] font-black uppercase tracking-wider border border-green-100">
                                                                Cleared
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {documentStatus.nodues === 'processing' ? (
                                                            <button 
                                                                onClick={() => triggerToast('Clearance application is currently being reviewed by accounts office.')}
                                                                className="px-3.5 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-not-allowed"
                                                            >
                                                                Under Review
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => triggerToast('Accounts clearance PDF downloaded!')}
                                                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider"
                                                            >
                                                                Download
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Doc 4 */}
                                                <tr>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border-[1px] border-slate-200/85">
                                                                <Award size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-950">Official Academic Transcript</p>
                                                                <p className="text-[8px] text-slate-400 font-extrabold uppercase">Full degree cumulative record</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {documentStatus.transcript === 'requestable' ? (
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-wider">
                                                                Available
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-black uppercase tracking-wider border border-amber-100">
                                                                Pending Board
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {documentStatus.transcript === 'requestable' ? (
                                                            <button 
                                                                onClick={() => handleRequestDoc('transcript', 'Official Academic Transcript')}
                                                                disabled={requestingDoc === 'transcript'}
                                                                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-60"
                                                            >
                                                                {requestingDoc === 'transcript' ? 'Requesting...' : 'Request Copy'}
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-slate-400 italic">Submitted</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
            {showAllNotices && (
                <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-[32px] p-8 max-w-2xl w-full shadow-2xl relative animate-scale-in max-h-[85vh] flex flex-col">
                        <button onClick={() => setShowAllNotices(false)} className="absolute top-6 right-6 w-8 h-8 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-full flex items-center justify-center transition-colors"><X size={16} /></button>
                        <div className="flex items-center gap-3 mb-6 shrink-0">
                            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center"><Megaphone size={24} /></div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Campus Notices</h2>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Official Broadcasts</p>
                            </div>
                        </div>
                        <div className="overflow-y-auto pr-2 space-y-4 flex-1">
                            {notices.map((n: any) => (
                                <div key={n.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-wider rounded border border-rose-200">{n.type || 'Notice'}</span>
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Calendar size={10} /> {n.date}</span>
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 mb-1.5">{n.title}</h3>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{n.desc}</p>
                                </div>
                            ))}
                            {notices.length === 0 && (
                                <p className="text-center text-slate-500 text-sm font-medium py-10">No notices currently published.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const IntroStat = ({ label, value, highlight }: any) => (
    <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-xs font-black ${highlight ? 'text-indigo-600' : 'text-slate-800'}`}>{value || '—'}</p>
    </div>
);

const LiveStat = ({ title, value, sub, icon, progress, color }: any) => (
    <div className="bg-white rounded-[28px] p-6 border-[1px] border-slate-200/60 shadow-sm group hover:-translate-y-1 transition-all">
        <div className="flex justify-between items-start mb-5">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform border-[1px] border-slate-200/40">
                {icon}
            </div>
            <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">{sub}</p>
        </div>
    </div>
);

const InfoRow = ({ label, value, icon }: any) => (
    <div className="flex justify-between items-center py-2.5 border-b-[1px] border-slate-100">
        <div className="flex items-center gap-2.5">
            {icon && <div className="text-slate-300">{icon}</div>}
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-xs font-black text-slate-800 truncate max-w-[220px]">{value || '—'}</span>
    </div>
);

const SectionHeader = ({ title, desc }: any) => (
    <div className="text-center space-y-1.5 mb-8">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{title}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider max-w-xl mx-auto">{desc}</p>
    </div>
);

const ServiceCard = ({ onClick, icon, title, desc, badge, color }: any) => (
    <button 
        type="button"
        onClick={onClick} 
        className="group bg-white p-8 rounded-[32px] border-[1px] border-slate-200/60 shadow-sm hover:shadow-md transition-all text-left flex flex-col h-full relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 px-4 py-1.5 ${color} text-white text-[8px] font-black uppercase tracking-widest rounded-bl-2xl shadow-sm`}>
            {badge}
        </div>
        <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-all`}>
            {icon}
        </div>
        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2.5 flex items-center gap-2">
            {title} 
            <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1.5 transition-transform" />
        </h4>
        <p className="text-xs font-bold text-slate-500 leading-relaxed">{desc}</p>
    </button>
);

const CourseRow = ({ code, name, credits, faculty, result, progress, topics, isExpanded, onToggle, onToast }: any) => (
    <div className="space-y-2">
        <button
            type="button"
            onClick={onToggle}
            className={`w-full bg-white p-5 rounded-[20px] border-[1px] border-slate-200/60 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 group hover:shadow-md transition-all ${
                isExpanded ? 'ring-2 ring-slate-900 border-transparent shadow-md' : ''
            }`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 border-[1px] border-slate-100 transition-colors ${
                    isExpanded ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 group-hover:bg-slate-100'
                }`}>
                    <span className={`text-[7px] font-black uppercase ${isExpanded ? 'text-slate-300' : 'text-slate-400'}`}>{code.slice(0, 2)}</span>
                    <span className={`text-xs font-black ${isExpanded ? 'text-white' : 'text-slate-900'}`}>{code.slice(2)}</span>
                </div>
                <div className="text-left">
                    <h5 className={`font-black tracking-tight text-sm leading-none mb-1 transition-colors ${
                        isExpanded ? 'text-indigo-600' : 'text-slate-800 group-hover:text-indigo-600'
                    }`}>{name}</h5>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{faculty} &bull; {credits} Credits</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                {result ? (
                    <span className="px-3 py-1 bg-indigo-50 border-[1px] border-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-md">
                        Grade: {result}
                    </span>
                ) : (
                    <div className="text-right hidden sm:block">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Progress</p>
                        <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-slate-900 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}
                <ChevronRight size={16} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-90 text-slate-900' : ''}`} />
            </div>
        </button>

        {isExpanded && topics && (
            <div className="ml-4 sm:ml-6 p-6 sm:p-8 bg-slate-50/40 rounded-[24px] border-[1px] border-slate-200/50 space-y-5 animate-slide-down">
                <h6 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Bookmark size={12} className="text-indigo-600" /> Syllabus Unit breakdown
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {topics.map((topic: string, i: number) => (
                        <div key={i} className="flex items-center gap-2.5 bg-white p-3 rounded-xl shadow-sm border-[1px] border-slate-200/40 group hover:border-slate-300 transition-colors">
                            <div className="w-5 h-5 rounded-md bg-slate-50 text-slate-900 flex items-center justify-center text-[9px] font-black shadow-inner group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                {i + 1}
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 tracking-tight">{topic}</span>
                        </div>
                    ))}
                </div>
                <div className="pt-4 border-t border-slate-200/60 flex justify-between items-center">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Institutional Certified Content</span>
                    <button 
                        type="button"
                        onClick={() => onToast?.(`Downloading course unit syllabus for ${code}...`)}
                        className="flex items-center gap-1.5 text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                    >
                        <Download size={12} /> Download Course PDF
                    </button>
                </div>
            </div>
        )}
    </div>
);

const ResourceLink = ({ title, icon, onToast }: any) => (
    <button 
        type="button"
        onClick={() => onToast?.(`Requesting access for ${title}...`)}
        className="w-full flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-md transition-all group border border-transparent hover:border-slate-200/40"
    >
        <div className="flex items-center gap-2.5">
            <div className="text-slate-400 group-hover:text-slate-900 transition-colors">{icon}</div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{title}</span>
        </div>
        <ExternalLink size={12} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
    </button>
);

export default StudentSelfDashboard;

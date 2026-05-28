import BASE_URL from '../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';
import {
    GraduationCap, BookOpen, Clock, FileText, Download,
    ShieldCheck, Mail, MapPin, User, Calendar, Phone, IdCard,
    PieChart, CalendarCheck, CreditCard, ArrowRight, Bell, Sparkles,
    ChevronRight, Zap, Target, Award, ExternalLink, Library,
    ClipboardCheck, History, Info, Bookmark, FileBadge, Eye, EyeOff,
    CheckCircle, ShieldAlert, Globe, HelpCircle, Share2,
    Search, SlidersHorizontal, Users, MessageSquare, ClipboardList, X, Loader2
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

const getSemesterOfCode = (code: string): string => {
    if (!code) return 'Semester 1';
    const match = code.match(/\d/);
    if (!match) return 'Semester 1';
    const digit = match[0];
    if (digit === '1') return 'Semester 1';
    if (digit === '2') return 'Semester 2';
    if (digit === '3') return 'Semester 6';
    if (digit === '4') return 'Semester 7';
    return `Semester ${digit}`;
};

const isHighlyNovel = (q: any): boolean => {
    return q.difficulty === 'hard' || (q.marks !== undefined && q.marks >= 12);
};

const isTrainingData = (q: any): boolean => {
    if (!q.sourceUniversity) return false;
    const src = q.sourceUniversity.toLowerCase();
    return src.includes('training set') || src.includes('opencourseware');
};

const generateMockTestPaper = (
    subjectName: string,
    format: 'sessional' | 'endsem',
    trendsData: any[],
    batchYear: string = '2023-2027',
    branch: string = 'Computer Science'
) => {
    const subjectGroup = trendsData.find(g => g.subject === subjectName);
    const questions = subjectGroup ? [...subjectGroup.questions] : [];

    const hardQs = questions.filter(q => q.difficulty === 'hard' || q.marks >= 12);
    const mediumQs = questions.filter(q => (q.difficulty === 'medium' || q.marks === 10) && q.marks < 12);
    const easyQs = questions.filter(q => q.difficulty === 'easy' || q.marks <= 5);

    const getSubjectSemesterAndCode = (subject: string) => {
        if (subject.includes('Networks')) return { sem: 'V Semester', code: 'CS-301' };
        if (subject.includes('Database')) return { sem: 'V Semester', code: 'CS-302' };
        if (subject.includes('Operating')) return { sem: 'V Semester', code: 'CS-303' };
        if (subject.includes('Computation') || subject.includes('Turing')) return { sem: 'VI Semester', code: 'CS-402' };
        if (subject.includes('Machine Learning') || subject.includes('AI')) return { sem: 'VII Semester', code: 'CS-411' };
        if (subject.includes('Distributed')) return { sem: 'VIII Semester', code: 'CS-412' };
        if (subject.includes('Cryptography')) return { sem: 'VI Semester', code: 'CS-352' };
        if (subject.includes('Electronics')) return { sem: 'IV Semester', code: 'EE-202' };
        if (subject.includes('Theorems')) return { sem: 'IV Semester', code: 'EE-205' };
        if (subject.includes('Electromagnetic')) return { sem: 'VI Semester', code: 'EE-401' };
        if (subject.includes('Electrical')) return { sem: 'II Semester', code: 'EE-102' };
        if (subject.includes('Machines')) return { sem: 'V Semester', code: 'EE-302' };
        if (subject.includes('Communication')) return { sem: 'VI Semester', code: 'EE-303' };
        if (subject.includes('Signal')) return { sem: 'VI Semester', code: 'EE-311' };
        if (subject.includes('Heat Transfer')) return { sem: 'VI Semester', code: 'ME-301' };
        if (subject.includes('Dynamics')) return { sem: 'VII Semester', code: 'ME-404' };
        if (subject.includes('Fluid Mechanics')) return { sem: 'VI Semester', code: 'ME-401' };
        if (subject.includes('Thermodynamics')) return { sem: 'IV Semester', code: 'ME-201' };
        if (subject.includes('Engines')) return { sem: 'V Semester', code: 'ME-202' };
        if (subject.includes('Foundation')) return { sem: 'VII Semester', code: 'CE-401' };
        if (subject.includes('Structural')) return { sem: 'V Semester', code: 'CE-202' };
        if (subject.includes('Finite Element')) return { sem: 'VI Semester', code: 'CE-303' };
        if (subject.includes('Environmental')) return { sem: 'V Semester', code: 'CE-205' };
        if (subject.includes('Soil Mechanics')) return { sem: 'V Semester', code: 'CE-204' };
        return { sem: 'VI Semester', code: 'CS-400' };
    };

    const { sem, code } = getSubjectSemesterAndCode(subjectName);

    const fallbackEasy = [
        `Define the core scope of ${subjectName} in technical system design.`,
        `State the fundamental laws or core theorems governing ${subjectName}.`,
        `Briefly explain the primary architectural blocks of ${subjectName} implementations.`,
        `Detail the standard operational metrics and measurement criteria used in ${subjectName}.`
    ];

    const fallbackMedium = [
        `Compare and contrast the primary approaches or algorithms in ${subjectName}, highlighting trade-offs in efficiency and complexity.`,
        `Describe the step-by-step mathematical model or architectural framework for ${subjectName} sessional benchmarks.`,
        `Illustrate the operational workflow of ${subjectName} elements using a comprehensive block diagram.`,
        `Evaluate the performance bottleneck constraints of typical ${subjectName} setups and suggest mitigation plans.`
    ];

    const fallbackHard = [
        `Formulate and prove the primary theoretical theorem or computational limitation in advanced ${subjectName} systems.`,
        `Design a fault-tolerant, scalable system architecture incorporating advanced ${subjectName} principles to handle peak loads.`,
        `Derive the complete mathematical expression for the steady-state efficiency of ${subjectName} processes under variable boundary conditions.`,
        `Critically analyze recent premier research trends in ${subjectName} and detail their engineering implementation challenges.`
    ];

    const selectQuestions = (fromList: any[], count: number, fallbacks: string[]) => {
        const selected: any[] = [];
        const usedTexts = new Set<string>();

        fromList.forEach(q => {
            if (selected.length < count) {
                selected.push({
                    text: q.text,
                    marks: q.marks || (count === 1 ? 15 : 10),
                    isReal: true,
                    addedOn: q.addedOn,
                    sourceUniversity: q.sourceUniversity || 'University Bank',
                    difficulty: q.difficulty || 'medium'
                });
                usedTexts.add(q.text);
            }
        });

        let fIdx = 0;
        while (selected.length < count && fIdx < fallbacks.length) {
            const fText = fallbacks[fIdx++];
            if (!usedTexts.has(fText)) {
                selected.push({
                    text: fText,
                    marks: count === 1 ? 15 : 10,
                    isReal: false,
                    sourceUniversity: 'Academic Blueprint',
                    difficulty: 'standard'
                });
                usedTexts.add(fText);
            }
        }
        return selected;
    };

    let sectionA: any[] = [];
    let sectionB: any[] = [];
    let timeAllowed = '3 Hours';
    let maxMarks = 50;

    if (format === 'sessional') {
        timeAllowed = '1.5 Hours';
        maxMarks = 25;
        sectionA = selectQuestions(easyQs.concat(mediumQs), 2, fallbackEasy.concat(fallbackMedium)).map(q => ({ ...q, marks: 5 }));
        sectionB = selectQuestions(hardQs, 1, fallbackHard).map(q => ({ ...q, marks: 15 }));
    } else {
        timeAllowed = '3 Hours';
        maxMarks = 50;
        sectionA = selectQuestions(easyQs.concat(mediumQs), 4, fallbackEasy.concat(fallbackMedium)).map(q => ({ ...q, marks: 5 }));
        sectionB = selectQuestions(hardQs, 2, fallbackHard).map(q => ({ ...q, marks: 15 }));
    }

    // Deterministic batch paper ID: same for every student in the same batch/subject/format
    const batchPaperId = `${code}-${format.toUpperCase()}-${batchYear.replace(/[^0-9]/g, '')}-MOCK`;

    return {
        subject: subjectName,
        code,
        semester: sem,
        format: format === 'sessional' ? 'Sessional Examination' : 'End-Semester Examination',
        timeAllowed,
        maxMarks,
        sectionA,
        sectionB,
        batch: batchYear,
        branch,
        batchPaperId,
        dateGenerated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
};

const StudentSelfDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'examcell' | 'elearning' | 'locker' | 'projects' | 'schedule'>('overview');
    const [showExamForm, setShowExamForm] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    // Class Schedule & Assignments States
    const [classSessions, setClassSessions] = useState<any[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [assignmentsList, setAssignmentsList] = useState<any[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [solvingAssignmentId, setSolvingAssignmentId] = useState<string | null>(null);
    const [assignmentAnswers, setAssignmentAnswers] = useState<string[]>([]);
    const [generalSubText, setGeneralSubText] = useState('');
    const [submittingAssignment, setSubmittingAssignment] = useState(false);

    const fetchClassSessions = async () => {
        setLoadingSessions(true);
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(BASE_URL + '/api/class-sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setClassSessions(data.data);
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

    const handleSolveAssignmentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingAssignment(true);
        try {
            const token = localStorage.getItem('urp_token');
            const res = await fetch(`{BASE_URL}/api/assignments/${solvingAssignmentId}/submit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    answers: assignmentAnswers,
                    submittedText: generalSubText
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert('🚀 Assignment submitted successfully!');
                setSolvingAssignmentId(null);
                setAssignmentAnswers([]);
                setGeneralSubText('');
                fetchAssignments();
            } else {
                alert(`❌ Error: ${data.error || 'Failed to submit assignment'}`);
            }
        } catch (err) {
            console.error(err);
            alert('❌ Server communication error');
        } finally {
            setSubmittingAssignment(false);
        }
    };

    // Repurposed ACTIVE SEMESTER space -> Campus Facility dropdown state
    const [showFacilityDropdown, setShowFacilityDropdown] = useState(false);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [facilitiesLoading, setFacilitiesLoading] = useState(false);
    const [facilityBookingSuccess, setFacilityBookingSuccess] = useState('');
    const [quickBookId, setQuickBookId] = useState('');
    const [quickBookDate, setQuickBookDate] = useState('');

    const MOCK_FACILITIES = [
        { _id: 'mock-1', title: 'Main Auditorium', type: 'Auditorium', capacity: 1200, location: 'Central Block', operatingHours: '9:00 AM - 9:00 PM', status: 'Operational' },
        { _id: 'mock-2', title: 'Advanced Computing Lab', type: 'Computing', capacity: 60, location: 'IT Building, Rm 202', operatingHours: '8:00 AM - 8:00 PM', status: 'Operational' },
        { _id: 'mock-3', title: 'Central Library Study Hall', type: 'Library', capacity: 500, location: 'Library Complex', operatingHours: '24 Hours', status: 'Operational' },
        { _id: 'mock-4', title: 'Indoor Sports Arena', type: 'Sports', capacity: 300, location: 'Sports Complex', operatingHours: '6:00 AM - 9:00 PM', status: 'Maintenance' }
    ];

    const fetchFacilities = async () => {
        setFacilitiesLoading(true);
        try {
            const token = localStorage.getItem('urp_token');
            if (!token) return;
            const resp = await fetch(BASE_URL + '/api/facilitys', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (resp.ok) {
                const data = await resp.json();
                if (Array.isArray(data)) {
                    setFacilities(data);
                }
            }
        } catch (e) {
            console.error('Failed to fetch facilities:', e);
        } finally {
            setFacilitiesLoading(false);
        }
    };

    const handleQuickBookFacility = async (facilityId: string) => {
        if (!quickBookDate) {
            setFacilityBookingSuccess('❌ Please select a date first!');
            setTimeout(() => setFacilityBookingSuccess(''), 3000);
            return;
        }
        const selectedFac = (facilities.length > 0 ? facilities : MOCK_FACILITIES).find(f => f._id === facilityId);
        setFacilityBookingSuccess(`✅ Successfully requested reservation for ${selectedFac?.title || 'Facility'} on ${quickBookDate}!`);
        setQuickBookId('');
        setTimeout(() => setFacilityBookingSuccess(''), 4000);
    };

    const [expandedSem, setExpandedSem] = useState<string | null>('Semester 6');
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

    // Notices State
    const [notices, setNotices] = useState<any[]>(() => {
        const stored = localStorage.getItem('urp_notices');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) { }
        }
        return [
            {
                id: 'default-notice-1',
                title: 'Welcome to All Campus Digital student portal. Track curriculum progress, manage projects, and access the exam sessional tools.',
                date: new Date().toLocaleDateString(),
                type: 'General'
            },
            {
                id: 'default-notice-2',
                title: 'Semester VI final sessional mock examinations are now active. Prepare using our new Exam Prep Insights dashboard.',
                date: new Date().toLocaleDateString(),
                type: 'Examination'
            }
        ];
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
    // New Question Trends state
    const [questionTrends, setQuestionTrends] = useState<any[]>([]);
    const [trendsLoading, setTrendsLoading] = useState(false);
    const [selectedTrendSubject, setSelectedTrendSubject] = useState<string | null>(null);
    const [mlEngineActive, setMlEngineActive] = useState(false);
    const [mlStats, setMlStats] = useState<any>(null);

    // Mock Test generator state
    const [showMockModal, setShowMockModal] = useState(false);
    const [mockTestPaper, setMockTestPaper] = useState<any>(null);
    const [showMockTestPreview, setShowMockTestPreview] = useState(false);
    const [selectedMockSubject, setSelectedMockSubject] = useState<string>('');
    const [selectedMockFormat, setSelectedMockFormat] = useState<'sessional' | 'endsem'>('sessional');

    // Published Results ledger state
    const [showResultsLedgerModal, setShowResultsLedgerModal] = useState(false);
    const [resultsRegNo, setResultsRegNo] = useState('');
    const [resultsUnlocked, setResultsUnlocked] = useState(false);
    const [publishedResults, setPublishedResults] = useState<any[]>([]);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [resultsError, setResultsError] = useState('');

    // Interactive trends filter state
    const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('all');
    const [selectedNoveltyFilter, setSelectedNoveltyFilter] = useState<string>('all');
    const [searchSubjectQuery, setSearchSubjectQuery] = useState<string>('');

    // Fetch trends on mount
    useEffect(() => {
        const fetchTrends = async () => {
            setTrendsLoading(true);
            try {
                const token = localStorage.getItem('urp_token');
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                const resp = await fetch(BASE_URL + '/api/questions/trends', {
                    signal: controller.signal,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                clearTimeout(timeoutId);
                const data = await resp.json();
                if (data.success) {
                    setQuestionTrends(data.data);
                    setMlEngineActive(!!data.mlEngineActive);
                    setMlStats(data.mlStats || null);
                    if (data.data.length > 0) {
                        setSelectedTrendSubject(data.data[0].subject);
                    }
                }
            } catch (e) {
                console.error('Failed to load question trends', e);
            } finally {
                setTrendsLoading(false);
            }
        };
        fetchTrends();
    }, []);

    const filteredTrends = questionTrends.map((group: any) => {
        const filteredQuestions = group.questions.filter((q: any) => {
            // Semester Filter
            if (selectedSemesterFilter !== 'all') {
                if (getSemesterOfCode(q.code) !== selectedSemesterFilter) {
                    return false;
                }
            }
            // Novelty Filter
            if (selectedNoveltyFilter !== 'all') {
                const novel = isHighlyNovel(q);
                if (selectedNoveltyFilter === 'highly_novel' && !novel) return false;
                if (selectedNoveltyFilter === 'standard' && novel) return false;
            }
            return true;
        });
        return {
            ...group,
            questions: filteredQuestions
        };
    }).filter((group: any) => {
        // Subject text query filter
        if (searchSubjectQuery.trim() !== '') {
            if (!group.subject.toLowerCase().includes(searchSubjectQuery.toLowerCase())) {
                return false;
            }
        }
        return group.questions.length > 0;
    });

    const activeTrendSubject = filteredTrends.some(g => g.subject === selectedTrendSubject)
        ? selectedTrendSubject
        : (filteredTrends[0]?.subject || null);

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

    // Interactive preparation milestone tasks state
    const [prepTasksCompleted, setPrepTasksCompleted] = useState<string[]>(['ledger']);
    const togglePrepTask = (taskId: string) => {
        setPrepTasksCompleted(prev =>
            prev.includes(taskId) ? prev.filter(t => t !== taskId) : [...prev, taskId]
        );
    };

    // Scroll state for sticky glassy header
    const [scrolled, setScrolled] = useState(false);

    // Profile menu state
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const [readAlertIds, setReadAlertIds] = useState<string[]>([]);
    const [dbNotifications, setDbNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!showProfileMenu && !showNotificationMenu) return;
        const handleOutsideClick = () => {
            setShowProfileMenu(false);
            setShowNotificationMenu(false);
        };
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, [showProfileMenu, showNotificationMenu]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const triggerToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    // Projects & Achievements state (Sync with database)
    const [projects, setProjects] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [skillsCredits, setSkillsCredits] = useState<number>(12); // Fallback base value
    const [projectsLoading, setProjectsLoading] = useState<boolean>(false);

    // Dynamic curriculum & digital credentials states
    const [curriculum, setCurriculum] = useState<any[]>([]);
    const [curriculumLoading, setCurriculumLoading] = useState<boolean>(false);
    const [lockerDocs, setLockerDocs] = useState<any[]>([]);
    const [lockerLoading, setLockerLoading] = useState<boolean>(false);

    // Mentor selection states
    const [newProjMentor, setNewProjMentor] = useState('');
    const [mentorsList, setMentorsList] = useState<any[]>([]);

    const fetchMentorsList = async () => {
        try {
            const token = localStorage.getItem('urp_token');
            if (!token) return;
            const resp = await fetch(BASE_URL + '/api/projects/mentors', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await resp.json();
            if (Array.isArray(data)) {
                setMentorsList(data);
            }
        } catch (e) {
            console.error('Failed to load mentors list', e);
        }
    };

    const fetchProjectsAndCredits = async () => {
        setProjectsLoading(true);
        try {
            const token = localStorage.getItem('urp_token');
            if (!token) return;
            const resp = await fetch(BASE_URL + '/api/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await resp.json();
            if (data.projects && data.achievements) {
                setProjects(data.projects);
                setAchievements(data.achievements);
                setSkillsCredits(data.totalSkillsCredits);
            }
        } catch (e) {
            console.error('Failed to load projects/credits from DB', e);
        } finally {
            setProjectsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectsAndCredits();
        fetchMentorsList();
    }, []);

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

    const handleGenerateMock = () => {
        const subj = selectedMockSubject || selectedTrendSubject || (questionTrends[0]?.subject);
        if (!subj) return;

        const batchYear = '2023-2027'; // same for entire batch cohort
        const branch = user?.department || 'Computer Science';
        const paper = generateMockTestPaper(subj, selectedMockFormat, questionTrends, batchYear, branch);
        setMockTestPaper(paper);
        setShowMockModal(false);
        setShowMockTestPreview(true);
        triggerToast(`Mock Paper generated for ${subj}!`);
    };

    const handleUnlockResults = async () => {
        setResultsError('');
        const targetRegNo = user?.registrationNo || 'REG-2024-892';
        if (resultsRegNo.trim().toUpperCase() !== targetRegNo.toUpperCase()) {
            setResultsError('Verification Failed: Invalid University Registration Number. Access to transcripts debarred.');
            return;
        }

        setResultsLoading(true);
        try {
            const token = localStorage.getItem('urp_token');
            const resp = await fetch(BASE_URL + '/api/result', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await resp.json();
            if (Array.isArray(data)) {
                setPublishedResults(data);
                setResultsUnlocked(true);
                triggerToast('Results Cabinet Unlocked successfully! 🔓');
            } else {
                setResultsError('Failed to load published semester sheets.');
            }
        } catch (err) {
            setResultsError('Connection error: Failed to connect to registry servers.');
        } finally {
            setResultsLoading(false);
        }
    };

    const handlePrintMockPaper = () => {
        const element = document.getElementById('printable-mock-paper');
        if (!element) return;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Mock Exam Paper - ${mockTestPaper.subject}</title>
                        <style>
                            body {
                                margin: 0;
                                padding: 20mm;
                                font-family: Georgia, serif;
                                color: #1e293b;
                                background: white;
                            }
                            .absolute-watermark {
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%) rotate(-30deg);
                                font-size: 70px;
                                font-weight: 900;
                                color: rgba(30, 41, 59, 0.03);
                                letter-spacing: 0.2em;
                                text-transform: uppercase;
                                white-space: nowrap;
                                pointer-events: none;
                                user-select: none;
                                z-index: 0;
                            }
                            ol { padding-left: 20px; }
                            li { margin-bottom: 8px; }
                            .mt-12 { margin-top: 48px; }
                            .flex { display: flex; }
                            .justify-between { justify-content: space-between; }
                            .items-center { align-items: center; }
                            .items-end { align-items: flex-end; }
                            .border-b-2 { border-bottom: 2px solid #0f172a; }
                            .border-b { border-bottom: 1px solid #0f172a; }
                            .pb-6 { padding-bottom: 24px; }
                            .py-3 { padding-top: 12px; padding-bottom: 12px; }
                            .text-center { text-align: center; }
                            .uppercase { text-transform: uppercase; }
                            .text-xs { font-size: 12px; }
                            .text-sm { font-size: 14px; }
                            .text-lg { font-size: 18px; }
                            .text-xl { font-size: 24px; }
                            .font-bold { font-weight: bold; }
                            .font-mono { font-family: monospace; }
                            .leading-relaxed { line-height: 1.625; }
                            @media print {
                                body { padding: 10mm; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="absolute-watermark">ACADEMIC MOCK PAPER</div>
                        ${element.innerHTML}
                        <script>
                            window.onload = function() {
                                window.print();
                                setTimeout(function() { window.close(); }, 500);
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleExportMockPDF = () => {
        const element = document.getElementById('printable-mock-paper');
        if (!element) return;

        const clone = element.cloneNode(true) as HTMLElement;

        const watermarkEl = clone.querySelector('.absolute-watermark') as HTMLElement;
        if (watermarkEl) {
            watermarkEl.style.opacity = '0.04';
        }

        const runExport = () => {
            const opt = {
                margin: 15,
                filename: `mock_test_${mockTestPaper.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${selectedMockFormat}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            (window as any).html2pdf().from(clone).set(opt).save();
        };

        if ((window as any).html2pdf) {
            runExport();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.crossOrigin = 'anonymous';
            script.onload = () => {
                runExport();
            };
            document.body.appendChild(script);
        }
    };

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
            const storedNotices = localStorage.getItem('urp_notices');
            if (storedNotices) {
                setNotices(JSON.parse(storedNotices));
            }
        };
        window.addEventListener('storage', handleStorageUpdate);
        const interval = setInterval(handleStorageUpdate, 1500);
        return () => {
            window.removeEventListener('storage', handleStorageUpdate);
            clearInterval(interval);
        };
    }, []);

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjName.trim() || !newProjStack.trim()) return;
        try {
            const token = localStorage.getItem('urp_token');
            const resp = await fetch(BASE_URL + '/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newProjName,
                    stack: newProjStack,
                    desc: newProjDesc,
                    status: newProjStatus,
                    mentor: newProjMentor || undefined
                })
            });
            if (resp.ok) {
                setNewProjName('');
                setNewProjStack('');
                setNewProjDesc('');
                setNewProjStatus('In Progress');
                setNewProjMentor('');
                triggerToast('New project uploaded to institutional database & analysed for skills credits!');
                fetchProjectsAndCredits();
            } else {
                triggerToast('Failed to upload project.');
            }
        } catch (err) {
            console.error(err);
            triggerToast('Connection error uploading project.');
        }
    };

    const handleAddAchievement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAchTitle.trim() || !newAchOrg.trim()) return;
        try {
            const token = localStorage.getItem('urp_token');
            const resp = await fetch(BASE_URL + '/api/projects/achievement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newAchTitle,
                    org: newAchOrg,
                    date: newAchDate || new Date().toISOString().split('T')[0]
                })
            });
            if (resp.ok) {
                setNewAchTitle('');
                setNewAchOrg('');
                setNewAchDate('');
                triggerToast('Achievement uploaded to database & analysed for skills credits!');
                fetchProjectsAndCredits();
            } else {
                triggerToast('Failed to upload achievement.');
            }
        } catch (err) {
            console.error(err);
            triggerToast('Connection error uploading achievement.');
        }
    };

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('urp_token');
            if (!token) return;
            const resp = await fetch(BASE_URL + '/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await resp.json();
            if (data && !data.error) {
                setUser(data);
                localStorage.setItem('urp_user', JSON.stringify(data));
            }
        } catch (e) {
            console.error('Failed to fetch user profile:', e);
        }
    };

    const fetchRecentNotices = async () => {
        try {
            const token = localStorage.getItem('urp_token');
            if (!token) return;
            const resp = await fetch(BASE_URL + '/api/notice', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await resp.json();
            if (Array.isArray(data)) {
                setNotices(data);
                localStorage.setItem('urp_notices', JSON.stringify(data));
            }
        } catch (e) {
            console.error('Failed to fetch notices:', e);
        }
    };

    const fetchDbNotifications = async () => {
        try {
            const token = localStorage.getItem('urp_token');
            if (!token) return;
            const resp = await fetch(BASE_URL + '/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (resp.ok) {
                const data = await resp.json();
                if (Array.isArray(data)) {
                    setDbNotifications(data);
                }
            }
        } catch (e) {
            console.error('Failed to fetch notifications:', e);
        }
    };

    const fetchCurriculum = async () => {
        setCurriculumLoading(true);
        try {
            const token = localStorage.getItem('urp_token');
            if (!token) return;
            const resp = await fetch(BASE_URL + '/api/academic', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await resp.json();
            if (Array.isArray(data)) {
                const semestersMap: Record<string, any> = {};

                data.forEach((course: any) => {
                    const sem = course.semester || 'Semester 1';
                    if (!semestersMap[sem]) {
                        semestersMap[sem] = {
                            sem,
                            status: course.status || 'Completed',
                            isCurrent: course.status === 'Ongoing',
                            gpa: course.gpa || '',
                            credits: 0,
                            courses: []
                        };
                    }
                    semestersMap[sem].courses.push(course);
                    semestersMap[sem].credits += course.credits;

                    if (course.status === 'Ongoing') {
                        semestersMap[sem].status = 'Ongoing';
                        semestersMap[sem].isCurrent = true;
                    }
                });

                const sortedSemesters = Object.values(semestersMap).sort((a: any, b: any) => {
                    const numA = parseInt(a.sem.replace(/[^0-9]/g, '')) || 1;
                    const numB = parseInt(b.sem.replace(/[^0-9]/g, '')) || 1;
                    return numB - numA;
                });

                setCurriculum(sortedSemesters);
            }
        } catch (e) {
            console.error('Failed to fetch curriculum:', e);
        } finally {
            setCurriculumLoading(false);
        }
    };

    const fetchLockerDocs = async () => {
        setLockerLoading(true);
        try {
            const token = localStorage.getItem('urp_token');
            if (!token) return;
            const resp = await fetch(BASE_URL + '/api/academic/locker', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await resp.json();
            if (Array.isArray(data)) {
                setLockerDocs(data);
            }
        } catch (e) {
            console.error('Failed to fetch locker docs:', e);
        } finally {
            setLockerLoading(false);
        }
    };

    const handleRequestDoc = async (category: string, docName: string) => {
        setRequestingDoc(category);
        try {
            const token = localStorage.getItem('urp_token');
            if (!token) return;
            const resp = await fetch(BASE_URL + '/api/academic/locker/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ category })
            });
            if (resp.ok) {
                triggerToast(`Secure request for ${docName} successfully submitted to the Registry!`);
                await fetchLockerDocs();
            } else {
                triggerToast(`Failed to request ${docName}.`);
            }
        } catch (e) {
            console.error('Failed to request document:', e);
            triggerToast('Connection error requesting document.');
        } finally {
            setRequestingDoc(null);
        }
    };

    const handleDownloadIDBadge = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Student ID Badge - ${user?.name}</title>
                        <style>
                            body {
                                margin: 0;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                height: 100vh;
                                background: #f8fafc;
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            }
                            .badge {
                                width: 340px;
                                background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%);
                                border-radius: 28px;
                                padding: 28px;
                                color: white;
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                                text-align: left;
                                box-sizing: border-box;
                            }
                            .header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                margin-bottom: 24px;
                            }
                            .header .logo {
                                font-size: 24px;
                            }
                            .header .verified {
                                background: #10b981;
                                color: white;
                                padding: 3px 8px;
                                border-radius: 6px;
                                font-size: 8px;
                                font-weight: 900;
                                text-transform: uppercase;
                                letter-spacing: 1.5px;
                            }
                            .photo-container {
                                display: flex;
                                gap: 16px;
                                align-items: center;
                                margin-bottom: 24px;
                            }
                            .photo {
                                width: 72px;
                                height: 72px;
                                border-radius: 16px;
                                border: 2px solid rgba(255, 255, 255, 0.15);
                                object-fit: cover;
                                background: #1e293b;
                            }
                            .info-title {
                                font-size: 8px;
                                color: #94a3b8;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                                margin: 0;
                            }
                            .info-value {
                                font-size: 14px;
                                font-weight: 850;
                                color: white;
                                margin: 2px 0 10px 0;
                            }
                            .info-grid {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 12px;
                                border-top: 1px solid rgba(255,255,255,0.08);
                                padding-top: 16px;
                                margin-bottom: 8px;
                            }
                            .footer {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                margin-top: 20px;
                                border-top: 1px solid rgba(255,255,255,0.08);
                                padding-top: 16px;
                            }
                            .footer-text {
                                font-size: 9px;
                                font-weight: 800;
                                color: #10b981;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                                display: flex;
                                align-items: center;
                                gap: 6px;
                            }
                            .dot {
                                width: 6px;
                                height: 6px;
                                background: #10b981;
                                border-radius: 50%;
                            }
                            .qr {
                                width: 40px;
                                height: 40px;
                                background: #0f172a;
                                border: 1px solid rgba(255,255,255,0.1);
                                border-radius: 8px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 9px;
                                font-weight: 900;
                                color: white;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="badge">
                            <div class="header">
                                <div class="logo">🎓</div>
                                <span class="verified">VERIFIED</span>
                            </div>
                            <div class="photo-container">
                                <img class="photo" src="${user?.profileImage ? BASE_URL + '/' + user.profileImage : 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(user?.name || 'Student')}" alt="Photo" />
                                <div>
                                    <p class="info-title">Student Name</p>
                                    <p class="info-value" style="font-size: 15px; margin-bottom: 0;">${user?.name}</p>
                                    <p class="info-title" style="margin-top: 4px;">Department</p>
                                    <p class="info-value" style="font-size: 10px; margin-bottom: 0; color: #a5b4fc;">${user?.department}</p>
                                </div>
                            </div>
                            <div class="info-grid">
                                <div>
                                    <p class="info-title">Registration ID</p>
                                    <p class="info-value" style="font-size: 11px;">${user?.registrationNo || 'REG-2024-892'}</p>
                                </div>
                                <div>
                                    <p class="info-title">Roll Number</p>
                                    <p class="info-value" style="font-size: 11px;">${user?.rollNo || 'REG-2024-892'}</p>
                                </div>
                            </div>
                            <div class="footer">
                                <span class="footer-text"><span class="dot"></span>Active Enrollment</span>
                                <div class="qr">URP</div>
                            </div>
                        </div>
                        <script>
                            window.onload = function() {
                                setTimeout(function() {
                                    window.print();
                                }, 500);
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
        triggerToast('Preparing high-res digital ID badge for download...');
    };

    const getDocMeta = (category: string) => {
        switch (category) {
            case 'sem5':
                return {
                    icon: <FileText size={16} />,
                    bgClass: 'bg-green-50 text-green-700 border-green-100',
                    defaultTitle: 'Digitized Transcript (Sem 5)',
                    defaultDesc: 'Last updated: May 12, 2026',
                    downloadMsg: 'Downloading Certified Semester 5 Marksheet PDF...',
                };
            case 'bonafide':
                return {
                    icon: <IdCard size={16} />,
                    bgClass: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                    defaultTitle: 'Bonafide Student Certificate',
                    defaultDesc: 'Registry Certified • Phase 06',
                    downloadMsg: 'Downloading verified Bonafide Student Certificate...',
                };
            case 'nodues':
                return {
                    icon: <ShieldCheck size={16} />,
                    bgClass: 'bg-amber-50 text-amber-700 border-amber-100',
                    defaultTitle: 'No Dues Accounts clearance',
                    defaultDesc: 'Department accounts review',
                    downloadMsg: 'Accounts clearance PDF downloaded!',
                };
            case 'transcript':
                return {
                    icon: <Award size={16} />,
                    bgClass: 'bg-slate-50 text-slate-600 border-slate-200/85',
                    defaultTitle: 'Official Academic Transcript',
                    defaultDesc: 'Full degree cumulative record',
                    downloadMsg: 'Official Academic Transcript PDF downloaded!',
                };
            default:
                return {
                    icon: <FileText size={16} />,
                    bgClass: 'bg-slate-50 text-slate-500 border-slate-200',
                    defaultTitle: 'Institutional Document',
                    defaultDesc: 'Student Credentials Wallet',
                    downloadMsg: 'Downloading document...',
                };
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem('urp_user');
        if (!stored) { navigate('/login'); return; }
        const u = JSON.parse(stored);
        if (u.role !== 'STUDENT') { navigate('/login'); return; }
        setUser(u);
        fetchUserProfile();
        fetchRecentNotices();
        fetchDbNotifications();
        fetchCurriculum();
        fetchLockerDocs();
        fetchFacilities();
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'schedule') {
            fetchClassSessions();
            fetchAssignments();
        }
    }, [activeTab]);

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

    interface NotificationAlert {
        id: string;
        title: string;
        message: string;
        feedback?: string;
        date: string;
        type: string;
        isBackend?: boolean;
        isReadOnBackend?: boolean;
    }

    const projectNotifications: NotificationAlert[] = projects
        .filter(p => p.skillsCredits > 0 || p.feedback)
        .map(p => ({
            id: `project-${p._id}`,
            title: `Project Evaluated: ${p.name}`,
            message: `Your guide ${p.mentor?.name || 'Faculty Mentor'} evaluated your project, awarding +${p.skillsCredits} Skills Credits.`,
            feedback: p.feedback,
            date: new Date(p.createdAt || Date.now()).toLocaleDateString(),
            type: 'FACULTY',
            isBackend: false,
            isReadOnBackend: false
        }));

    const systemNotifications: NotificationAlert[] = [
        {
            id: 'sys-welcome',
            title: 'Welcome Alert',
            message: `Official Student Portal loaded successfully. Welcome back, ${user?.name || 'Student'}!`,
            feedback: '',
            date: new Date().toLocaleDateString(),
            type: 'SYSTEM',
            isBackend: false,
            isReadOnBackend: false
        }
    ];

    const parsedDbNotifications: NotificationAlert[] = dbNotifications.map(n => ({
        id: n._id,
        title: n.title,
        message: n.message,
        feedback: '',
        date: new Date(n.createdAt).toLocaleDateString(),
        type: n.type,
        isBackend: true,
        isReadOnBackend: n.readBy?.includes(user._id) || n.readBy?.includes(user.id || '')
    }));

    const allNotifications: NotificationAlert[] = [...parsedDbNotifications, ...projectNotifications, ...systemNotifications];
    const unreadCount = allNotifications.filter(n => {
        if (n.isBackend) {
            return !n.isReadOnBackend && !readAlertIds.includes(n.id);
        }
        return !readAlertIds.includes(n.id);
    }).length;




    if (showMockTestPreview && mockTestPaper) {
        return (
            <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-8 animate-fade-in font-body selection:bg-slate-200">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-[24px] border border-slate-200/60 shadow-sm">
                        <button
                            onClick={() => setShowMockTestPreview(false)}
                            className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest cursor-pointer"
                        >
                            <ArrowRight size={14} className="rotate-180" /> Back to Dashboard
                        </button>

                        <div className="flex flex-wrap gap-2.5">
                            <button
                                onClick={() => handlePrintMockPaper()}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                                Print Paper
                            </button>
                            <button
                                onClick={() => handleExportMockPDF()}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                            >
                                <Download size={13} className="text-indigo-200" /> Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Printable Exam Paper Container */}
                    <div
                        id="printable-mock-paper"
                        className="bg-white rounded-[24px] border border-slate-200 shadow-md p-8 sm:p-12 relative overflow-hidden font-serif text-slate-900"
                        style={{ minHeight: '297mm', fontFamily: 'Georgia, serif' }}
                    >
                        {/* Technical Watermark */}
                        <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] text-slate-850 text-7xl font-black uppercase tracking-widest z-0"
                            style={{ transform: 'rotate(-30deg)', whiteSpace: 'nowrap' }}
                        >
                            ACADEMIC MOCK PAPER
                        </div>

                        {/* Top Header Roll No and University Stamp */}
                        <div className="border-b-2 border-slate-900 pb-6 relative z-10">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Roll No:</span>
                                    <div className="flex gap-1">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <span key={i} className="w-5 h-6 border border-slate-400 rounded flex items-center justify-center text-[10px] font-mono font-bold text-slate-350"></span>
                                        ))}
                                    </div>
                                </div>
                                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 px-2 py-0.5 border border-slate-200 rounded">CONFIDENTIAL</span>
                            </div>

                            <div className="text-center space-y-1.5 font-serif">
                                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide leading-none">
                                    {user.university?.name || 'All Campus Technical University'}
                                </h2>
                                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 font-sans">
                                    {mockTestPaper.branch} &bull; {mockTestPaper.batch}
                                </p>
                                {/* Prominent MOCK TEST PAPER label */}
                                <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1 rounded-full mt-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] font-sans">Mock Test Paper</span>
                                </div>
                                <p className="text-[11px] font-bold tracking-widest uppercase text-slate-600 font-sans">
                                    {mockTestPaper.semester} &bull; {mockTestPaper.format}
                                </p>
                                <div className="w-16 h-0.5 bg-slate-900 mx-auto my-2"></div>
                                <h3 className="text-lg font-black uppercase tracking-tight mt-1">
                                    Subject: {mockTestPaper.subject} ({mockTestPaper.code})
                                </h3>
                            </div>
                        </div>

                        {/* Time & Marks Row */}
                        <div className="flex justify-between items-center py-3 border-b border-slate-900 text-xs font-mono font-bold uppercase tracking-wider relative z-10">
                            <span>Time Allowed: {mockTestPaper.timeAllowed}</span>
                            <span>Max. Marks: {mockTestPaper.maxMarks}</span>
                        </div>

                        {/* Instructions */}
                        <div className="my-6 p-4 border border-slate-200 rounded-xl bg-slate-50/50 text-[11px] leading-relaxed relative z-10 font-sans font-medium text-slate-600">
                            <p className="font-extrabold text-slate-900 uppercase tracking-widest mb-1 text-[10px]">General Instructions:</p>
                            <ol className="list-decimal pl-4 space-y-1">
                                <li>All questions are compulsory. Structure answers with neat schematics and proof derivations.</li>
                                <li><strong>Section A</strong> consists of short sessional test questions carrying <strong>5 marks</strong> each.</li>
                                <li><strong>Section B</strong> consists of advanced research-grade analytical questions carrying <strong>15 marks</strong> each.</li>
                                <li>This mock paper is compiled from fresh university master question bank additions within the past 2 months.</li>
                            </ol>
                        </div>

                        {/* Section A */}
                        <div className="space-y-6 my-8 relative z-10">
                            <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-900 border-b border-dashed border-slate-300 pb-1.5 flex justify-between">
                                <span>Section A (Short Answer Questions)</span>
                                <span>[{mockTestPaper.sectionA.length} &times; 5 = {mockTestPaper.sectionA.length * 5} Marks]</span>
                            </h4>

                            <div className="space-y-5">
                                {mockTestPaper.sectionA.map((q: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold leading-relaxed">
                                                <span className="font-bold mr-2">Q{idx + 1}.</span>
                                                {q.text}
                                            </p>
                                            {q.isReal && (
                                                <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.2 select-none">
                                                    Real Trend PYQ &bull; {q.sourceUniversity}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-mono font-bold shrink-0">({q.marks})</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section B */}
                        <div className="space-y-6 my-8 relative z-10">
                            <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-900 border-b border-dashed border-slate-300 pb-1.5 flex justify-between">
                                <span>Section B (Analytical & Design Questions)</span>
                                <span>[{mockTestPaper.sectionB.length} &times; 15 = {mockTestPaper.sectionB.length * 15} Marks]</span>
                            </h4>

                            <div className="space-y-6">
                                {mockTestPaper.sectionB.map((q: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold leading-relaxed">
                                                <span className="font-bold mr-2">Q{mockTestPaper.sectionA.length + idx + 1}.</span>
                                                {q.text}
                                            </p>
                                            {q.isReal ? (
                                                <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.2 select-none flex items-center gap-0.5 w-fit mt-1">
                                                    <Zap size={7} /> Highly Novel PYQ &bull; {q.sourceUniversity}
                                                </span>
                                            ) : (
                                                <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.2 select-none w-fit mt-1">
                                                    University Model Blueprint
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-mono font-bold shrink-0">({q.marks})</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Signature and Code */}
                        <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-end text-[9px] font-mono text-slate-400 relative z-10">
                            <div>
                                <p>Date Generated: {mockTestPaper.dateGenerated}</p>
                                <p className="font-bold uppercase text-slate-500">Questions sourced from Master Question Bank &bull; Past 2 Months</p>
                                <p className="font-bold uppercase text-slate-400 mt-0.5">Batch {mockTestPaper.batch} &bull; Same paper for all students in this batch</p>
                            </div>
                            <div className="text-right">
                                <p>Page 1 of 1</p>
                                <p className="font-bold text-slate-500">BATCH PAPER ID: {mockTestPaper.batchPaperId}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

            {/* Semester Results Ledger Modal */}
            {showResultsLedgerModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative overflow-hidden animate-scale-up">
                        <div className="absolute -left-20 -top-20 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl opacity-60" />

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h3 className="text-base font-black text-slate-955 uppercase tracking-tight flex items-center gap-2">
                                    <Award className="text-emerald-600 animate-pulse" size={20} />
                                    Semester Results Ledger
                                </h3>
                                <p className="text-slate-500 text-xs font-semibold mt-1">Official certified grade sheets and transcripts cupboard.</p>
                            </div>
                            <button
                                onClick={() => setShowResultsLedgerModal(false)}
                                className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors cursor-pointer border border-slate-100 font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        {!resultsUnlocked ? (
                            /* Verification Step */
                            <div className="space-y-4 relative z-10">
                                <div className="bg-emerald-50 border border-emerald-200/70 p-4 rounded-2xl flex gap-3">
                                    <span className="text-xl shrink-0">🔒</span>
                                    <div>
                                        <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-0.5">Security Verification Required</h4>
                                        <p className="text-[9.5px] text-emerald-700 font-semibold leading-relaxed">
                                            To guarantee privacy, please enter your University Registration Number exactly as printed on your student profile.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">University Registration Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. REG-2024-892"
                                        value={resultsRegNo}
                                        onChange={(e) => setResultsRegNo(e.target.value)}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-wider outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-800 uppercase"
                                    />
                                    <p className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider">Hint: Sourced from your profile info (e.g. {user?.registrationNo || 'REG-2024-892'})</p>
                                </div>

                                {resultsError && (
                                    <p className="text-[9px] text-red-600 font-bold uppercase tracking-wider bg-red-50 border border-red-100 p-2.5 rounded-xl">
                                        ⚠️ {resultsError}
                                    </p>
                                )}

                                <button
                                    onClick={handleUnlockResults}
                                    disabled={resultsLoading}
                                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md hover:shadow-emerald-600/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/20"
                                >
                                    {resultsLoading ? 'Establishing Handshake...' : 'Verify & Unlock Transcripts 🔑'}
                                </button>
                            </div>
                        ) : (
                            /* Unlocked Cabinet */
                            <div className="space-y-4 relative z-10 max-h-[350px] overflow-y-auto pr-1">
                                <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-2xl flex gap-3 items-center">
                                    <span className="text-xl">🔓</span>
                                    <div>
                                        <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none">Access Granted Successfully</h4>
                                        <p className="text-[8px] text-emerald-700 font-bold uppercase tracking-wider mt-1">Verified: {resultsRegNo.toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {publishedResults.length === 0 ? (
                                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">No Transcripts Found</p>
                                            <p className="text-slate-500 text-[9px] font-semibold mt-1">No exam results are published in your university portal yet.</p>
                                        </div>
                                    ) : (
                                        publishedResults.map(r => (
                                            <div key={r._id} className="p-4 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border border-slate-200/50 flex flex-col gap-2 transition-all">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <h4 className="text-xs font-black text-slate-900 leading-snug">{r.title}</h4>
                                                        <span className="text-[7.5px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-black uppercase mt-1 inline-block tracking-wider">
                                                            {r.semester}
                                                        </span>
                                                    </div>
                                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider shrink-0 border border-emerald-100/50">
                                                        Certified
                                                    </span>
                                                </div>
                                                {r.description && <p className="text-[10px] text-slate-500 font-semibold leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-100">{r.description}</p>}
                                                <div className="mt-2 pt-2 border-t border-slate-200/50">
                                                    <a
                                                        href={r.link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm transition-all border border-emerald-500/20"
                                                    >
                                                        <span>{r.linkText || 'Download Grade Sheet'} 📄</span>
                                                        <ChevronRight size={11} />
                                                    </a>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Mock Test Generator Settings Popup Modal */}
            {showMockModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative overflow-hidden animate-scale-up">
                        <div className="absolute -left-20 -top-20 w-48 h-48 rounded-full bg-indigo-500/5 blur-2xl opacity-60" />

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h3 className="text-base font-black text-slate-955 uppercase tracking-tight flex items-center gap-2">
                                    <Sparkles className="text-indigo-600 animate-pulse" size={18} />
                                    Configure Mock Test
                                </h3>
                                <p className="text-slate-500 text-xs font-semibold mt-1">Compile real 2-month university addition trends into a printed exam paper.</p>
                            </div>
                            <button
                                onClick={() => setShowMockModal(false)}
                                className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors cursor-pointer border border-slate-100 font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Select Subject</label>
                                <select
                                    value={selectedMockSubject}
                                    onChange={(e) => setSelectedMockSubject(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800"
                                >
                                    {questionTrends.length === 0 ? (
                                        <option value="">No subjects active</option>
                                    ) : (
                                        questionTrends.map(g => (
                                            <option key={g.subject} value={g.subject}>{g.subject} ({g.questions.length} Qs)</option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Examination Blueprint Format</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMockFormat('sessional')}
                                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${selectedMockFormat === 'sessional'
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                                                : 'bg-slate-50 text-slate-650 border-slate-200/60 hover:bg-slate-100/50'
                                            }`}
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-wider">Sessional Exam</p>
                                        <p className="text-[8px] font-semibold opacity-75 mt-0.5">25 Marks &bull; 1.5 Hours &bull; Short Prep</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedMockFormat('endsem')}
                                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${selectedMockFormat === 'endsem'
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                                                : 'bg-slate-50 text-slate-655 border-slate-200/60 hover:bg-slate-100/50'
                                            }`}
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-wider">End-Sem Exam</p>
                                        <p className="text-[8px] font-semibold opacity-75 mt-0.5">50 Marks &bull; 3 Hours &bull; Full Mock</p>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleGenerateMock()}
                            className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-950 hover:to-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-xl relative z-10 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Sparkles size={13} className="text-yellow-400" /> Compile Mock Paper
                        </button>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 h-20 flex items-center justify-between transition-all duration-300 ${scrolled
                        ? 'bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.08)]'
                        : 'bg-white border-b border-slate-100 shadow-sm'
                    }`}
            >
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
                            { id: 'schedule', label: 'Class Schedule & Assignments' },
                            { id: 'projects', label: 'Projects & Achievements' },
                            { id: 'examcell', label: 'Exam Cell' },
                            { id: 'locker', label: 'Digital Locker' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id as any)}
                                className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id
                                    ? 'text-slate-950 font-black border-b-2 border-slate-950 pb-1'
                                    : 'text-slate-400 hover:text-slate-705'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* CAMPUS FACILITIES QUICK RESERVATION DROPDOWN repurposed from ACTIVE SEMESTER */}
                    <div className="relative shrink-0 select-none">
                        <button
                            type="button"
                            onClick={() => setShowFacilityDropdown(!showFacilityDropdown)}
                            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-slate-800 shadow-sm hover:scale-[1.01] transition-all cursor-pointer group"
                            title="Quick View & Book Campus Facilities"
                        >
                            <span className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest leading-none flex items-center gap-1.5">
                                🏢 Campus Facilities
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </button>

                        {showFacilityDropdown && (
                            <div className="absolute right-0 mt-2.5 w-80 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl z-55 p-5 animate-scale-in flex flex-col gap-4">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl" />
                                
                                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                                    <div>
                                        <h4 className="font-black text-xs text-slate-900 uppercase">Facility Directory</h4>
                                        <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">Quick Booking Status Console</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setShowFacilityDropdown(false)}
                                        className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {facilityBookingSuccess && (
                                    <div className="p-3.5 bg-slate-900 border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider animate-fade-in shadow-inner text-center">
                                        {facilityBookingSuccess}
                                    </div>
                                )}

                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                    {(facilities.length > 0 ? facilities : MOCK_FACILITIES).map(fac => {
                                        const isOpen = fac.status === 'Operational';
                                        return (
                                            <div key={fac._id} className="p-3 bg-slate-50 border border-slate-150/70 rounded-xl flex flex-col gap-2 hover:bg-slate-100/50 transition-colors">
                                                <div className="flex justify-between items-start gap-1">
                                                    <div className="min-w-0 flex-1">
                                                        <h5 className="font-black text-[11px] text-slate-900 leading-snug truncate">{fac.title}</h5>
                                                        <p className="text-[9px] text-slate-450 font-bold mt-0.5">{fac.location} &bull; Cap: {fac.capacity}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-md tracking-wider shrink-0 ${
                                                        isOpen ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-amber-50 border border-amber-100 text-amber-700'
                                                    }`}>
                                                        {fac.status}
                                                    </span>
                                                </div>

                                                {isOpen && (
                                                    <div className="flex gap-1.5 pt-1 mt-1 border-t border-slate-250/30">
                                                        {quickBookId === fac._id ? (
                                                            <div className="flex flex-col gap-2 w-full animate-fade-in">
                                                                <input
                                                                    type="date"
                                                                    value={quickBookDate}
                                                                    onChange={e => setQuickBookDate(e.target.value)}
                                                                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-900 focus:border-[#1e3a5f] outline-none"
                                                                />
                                                                <div className="flex gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setQuickBookId('')}
                                                                        className="flex-1 h-7 text-[9px] font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-all"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleQuickBookFacility(fac._id)}
                                                                        className="flex-1 h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all shadow-sm"
                                                                    >
                                                                        Confirm
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setQuickBookId(fac._id);
                                                                    setQuickBookDate(new Date().toISOString().split('T')[0]);
                                                                }}
                                                                className="w-full py-1 bg-white hover:bg-[#1e3a5f] hover:text-white border border-slate-250/70 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#1e3a5f] transition-all"
                                                            >
                                                                Quick Reserve
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowFacilityDropdown(false);
                                        navigate('/facilities');
                                    }}
                                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                                >
                                    <ExternalLink size={11} /> Open Booking Portal
                                </button>
                            </div>
                        )}
                    </div>

                    {/* DYNAMIC NOTIFICATIONS BUTTON & DROPDOWN */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowNotificationMenu(!showNotificationMenu);
                                setShowProfileMenu(false);
                            }}
                            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 shadow-sm hover:scale-105 transition-all border border-slate-200 shrink-0 select-none relative cursor-pointer"
                            title="Notifications"
                        >
                            <Bell size={18} className="text-slate-600" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white shadow-sm animate-bounce">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotificationMenu && (
                            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-3 z-[100] animate-fade-in origin-top-right">
                                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                                        Faculty Notifications
                                    </span>
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setReadAlertIds(allNotifications.map(n => n.id));
                                                try {
                                                    const token = localStorage.getItem('urp_token');
                                                    await fetch(BASE_URL + '/api/notifications/mark-all-read', {
                                                        method: 'PUT',
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                    });
                                                    fetchDbNotifications();
                                                } catch (e) {
                                                    console.error('Error marking all read:', e);
                                                }
                                            }}
                                            className="text-[8px] font-black text-indigo-600 hover:text-indigo-850 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/50 cursor-pointer"
                                        >
                                            Mark All Read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                                    {allNotifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                                            No recent alerts from faculty
                                        </div>
                                    ) : (
                                        allNotifications.map(n => {
                                            const isRead = n.isBackend ? (n.isReadOnBackend || readAlertIds.includes(n.id)) : readAlertIds.includes(n.id);
                                            return (
                                                <div
                                                    key={n.id}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (isRead) {
                                                            setReadAlertIds(prev => prev.filter(id => id !== n.id));
                                                        } else {
                                                            setReadAlertIds(prev => [...prev, n.id]);
                                                            if (n.isBackend) {
                                                                try {
                                                                    const token = localStorage.getItem('urp_token');
                                                                    await fetch(`{BASE_URL}/api/notifications/${n.id}/read`, {
                                                                        method: 'PUT',
                                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                                    });
                                                                    fetchDbNotifications();
                                                                } catch (err) {
                                                                    console.error('Error marking notification read:', err);
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    className={`px-4 py-3 cursor-pointer hover:bg-slate-50/50 transition-colors flex items-start gap-3 ${!isRead ? 'bg-indigo-50/15' : ''}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!isRead ? 'bg-indigo-500 animate-pulse' : 'bg-slate-200'}`} />
                                                    <div className="space-y-1 min-w-0 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[10px] font-black text-slate-900 leading-snug">{n.title}</p>
                                                            {n.type === 'FACULTY' || n.type === 'Project' ? (
                                                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[7px] font-black uppercase tracking-wider scale-90 shrink-0">
                                                                    EVALUATION
                                                                </span>
                                                            ) : n.type === 'Schedule' ? (
                                                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[7px] font-black uppercase tracking-wider scale-90 shrink-0">
                                                                    SCHEDULE
                                                                </span>
                                                            ) : n.type === 'Notice' ? (
                                                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[7px] font-black uppercase tracking-wider scale-90 shrink-0">
                                                                    CIRCULAR
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <p className="text-[9px] text-slate-500 leading-relaxed font-bold">{n.message}</p>
                                                        {n.feedback && (
                                                            <div className="bg-slate-50 border border-slate-200/50 p-2 rounded-lg text-[8px] font-medium text-slate-600 mt-1 italic">
                                                                &ldquo;{n.feedback}&rdquo;
                                                            </div>
                                                        )}
                                                        <p className="text-[8px] text-slate-400 font-black uppercase mt-1">{n.date}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowProfileMenu(!showProfileMenu);
                            }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center font-bold text-white shadow-md hover:scale-105 transition-all border border-slate-200 shrink-0 select-none overflow-hidden"
                            title="Profile Options"
                        >
                            {user?.name ? user.name.charAt(0) : 'S'}
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-2 z-[100] animate-fade-in origin-top-right">
                                <div className="px-4 py-2 border-b border-slate-100">
                                    <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate">
                                        {user?.name}
                                    </div>
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider truncate">
                                        {user?.rollNo || 'Student'}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowChangePassword(true)}
                                    className="px-4 py-2.5 hover:bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors w-full text-left"
                                >
                                    <Zap size={13} className="text-slate-400" /> Change Password
                                </button>
                                <button
                                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                                    className="px-4 py-2.5 hover:bg-red-50 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 flex items-center gap-2 cursor-pointer transition-colors w-full text-left border-t border-slate-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Spacer to offset fixed header */}
            <div className="h-20" />

            {(() => {
                const latest = notices.length > 0 ? notices[0] : {
                    date: new Date().toLocaleDateString(),
                    title: 'Welcome to the Official Student Portal. Track curriculum progress, manage projects, and access the exam preparation insights.'
                };
                return (
                    <div className="bg-rose-600 text-white px-6 py-1 flex items-center gap-4 text-xs font-bold w-full shadow-sm z-40 relative border-b border-rose-700">
                        <div className="bg-rose-800 text-rose-100 px-2.5 py-0.5 rounded-md uppercase tracking-widest text-[9px] shrink-0 font-black flex items-center gap-1.5 shadow-inner">
                            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping"></div>
                            Notice
                        </div>
                        <div className="flex-1 overflow-hidden text-[12px] tracking-wide font-semibold opacity-95">
                            {/* eslint-disable-next-line jsx-a11y/no-distracting-elements */}
                            {React.createElement(
                                'marquee' as any,
                                { behavior: 'scroll', direction: 'left', scrollamount: '4' },
                                <span className="font-black mr-3">[{latest.date}]</span>,
                                latest.title
                            )}
                        </div>
                        <button onClick={() => navigate('/student-notices')} className="shrink-0 text-[9px] bg-rose-700 hover:bg-rose-800 px-3 py-1 rounded-lg uppercase tracking-wider transition-colors border border-rose-500 shadow-sm flex items-center gap-1.5">
                            Show More <ArrowRight size={12} />
                        </button>
                    </div>
                );
            })()}

            {/* MOBILE NAVIGATION BAR (Shown on small screens) */}
            <div className="xl:hidden bg-white border-b-[1px] border-slate-100 px-6 py-3 flex gap-2 overflow-x-auto">
                {[
                    { id: 'overview', label: 'Dashboard' },
                    { id: 'curriculum', label: 'Curriculum' },
                    { id: 'schedule', label: 'Schedule' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'examcell', label: 'Exam Cell' },
                    { id: 'locker', label: 'Locker' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shrink-0 border-[1px] ${activeTab === t.id
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
                        <section className="bg-slate-900 rounded-[32px] p-6 sm:p-10 border-[1px] border-slate-800/80 shadow-lg flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden text-white">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-cyan-500/20 rounded-full blur-3xl -mr-32 -mt-32 opacity-80" />
                            <div className="absolute left-0 bottom-0 w-60 h-60 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -ml-24 -mb-24 opacity-60" />

                            <div className="relative group shrink-0">
                                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-[28px] bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-5xl sm:text-6xl font-black text-white shadow-xl shadow-slate-950/15 relative overflow-hidden select-none border border-slate-700">
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
                                        <span className="px-3 py-1 bg-white/10 text-white text-[9px] font-black uppercase tracking-wider rounded-md border border-white/25">
                                            Official Student Portal
                                        </span>
                                        <span className="px-3 py-1 bg-green-500/20 text-green-300 text-[9px] font-black uppercase tracking-wider rounded-md border border-green-500/30">
                                            Active Record
                                        </span>
                                    </div>
                                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-1.5 leading-tight">
                                        {user.name}
                                    </h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] leading-none">
                                        {user.department} &bull; {user.programme || 'Bachelor of Technology'}
                                    </p>
                                    {user.mentor && (
                                        <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/25 text-[9px] font-black uppercase tracking-wider">
                                            <Users size={11} className="text-indigo-400" /> Assigned Mentor: {user.mentor.name} ({user.mentor.position || 'Professor'})
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 pt-5 border-t border-slate-800/80">
                                    <IntroStat label="Registration" value={user.registrationNo || 'REG-2024-892'} />
                                    <IntroStat label="Roll Number" value={user.rollNo || 'REG-2024-892'} highlight />
                                    <IntroStat label="Branch" value={user.department || 'Computer Science'} />
                                    <IntroStat label="Current Sem" value={user.semester} />
                                    <IntroStat label="Batch / Year" value="2023-2027" />
                                </div>
                            </div>
                        </section>

                        {/* STATS TILES & NOTICE BOARD */}
                        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Academic Progress Stats Cards + Extra Info */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                {/* Top two main stat cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <LiveStat title="Current CGPA" value="8.94" sub="Academic Elite" icon={<PieChart className="text-slate-900" size={24} />} progress={89.4} color="from-slate-900 to-slate-800" />
                                    <LiveStat title="Total Credits" value="112" sub="of 160 required" icon={<Award className="text-purple-600" size={24} />} progress={70} color="from-purple-500 to-purple-600" />
                                </div>

                                {/* 2 micro-stat tiles row */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Current SGPA', value: '9.12', color: 'from-emerald-50 to-green-50', border: 'border-emerald-200/60', text: 'text-emerald-700' },
                                        { label: 'Class Rank', value: '#7 / 60', color: 'from-amber-50 to-yellow-50', border: 'border-amber-200/60', text: 'text-amber-700' },
                                    ].map(stat => (
                                        <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all shadow-sm`}>
                                            <p className={`text-2xl font-black ${stat.text} leading-none`}>{stat.value}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Current semester subject progress */}
                                <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <BookOpen size={12} className="text-indigo-400" /> Semester 6 — Subject Progress
                                        </h4>
                                        <button onClick={() => setActiveTab('curriculum')} className="text-[9px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                                            Full Details <ArrowRight size={10} />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {(SEMESTER_DATA[0].courses || []).map((subj: any) => (
                                            <div key={subj.code} className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-slate-400 w-12 shrink-0">{subj.code}</span>
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-0.5">
                                                        <span className="text-[10px] font-bold text-slate-700 truncate max-w-[160px]">{subj.name}</span>
                                                        <span className="text-[9px] font-black text-slate-500">{subj.progress}%</span>
                                                    </div>
                                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-700 ${subj.progress >= 80 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : subj.progress >= 50 ? 'bg-gradient-to-r from-indigo-400 to-blue-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`}
                                                            style={{ width: `${subj.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${subj.progress >= 80 ? 'bg-emerald-50 text-emerald-600' : subj.progress >= 50 ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {subj.progress >= 80 ? 'On Track' : subj.progress >= 50 ? 'In Progress' : 'Needs Attn.'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Skills Credit Analytics on the Right Side */}
                            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[28px] border-[1px] border-slate-800 shadow-xl p-6 relative overflow-hidden flex flex-col justify-between text-white group">
                                <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />
                                <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-cyan-500/5 blur-xl pointer-events-none" />

                                <div>
                                    <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                                        <h3 className="text-xs font-black text-indigo-200 uppercase tracking-widest flex items-center gap-2">
                                            <Award className="text-indigo-400 animate-pulse" size={15} /> Skills Credit Analytics
                                        </h3>
                                        <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-[8px] font-black uppercase tracking-wider rounded-md">
                                            Active Portfolio
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Credits Score */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Skills Credits</span>
                                                <p className="text-xl font-extrabold text-white">{skillsCredits} Credits</p>
                                            </div>
                                            <div className="relative flex items-center justify-center shrink-0">
                                                <div className="w-11 h-11 rounded-full border-2 border-indigo-500 flex items-center justify-center font-mono text-[10px] font-black text-indigo-300">
                                                    +{skillsCredits}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skills breakdown bars */}
                                        <div className="space-y-2.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Skills Breakdown</span>
                                            {[
                                                { label: 'Projects', val: Math.min(100, (projects.filter((p: any) => p.type === 'project').length || 2) * 20), pts: (projects.filter((p: any) => p.type === 'project').length || 2) * 4, color: 'from-indigo-400 to-violet-500' },
                                                { label: 'Achievements', val: Math.min(100, (projects.filter((p: any) => p.type === 'achievement').length || 1) * 30), pts: (projects.filter((p: any) => p.type === 'achievement').length || 1) * 3, color: 'from-amber-400 to-orange-500' },
                                                { label: 'Open Source', val: 40, pts: 5, color: 'from-emerald-400 to-green-500' },
                                            ].map(bar => (
                                                <div key={bar.label}>
                                                    <div className="flex justify-between text-[8px] font-black text-slate-400 mb-0.5">
                                                        <span>{bar.label}</span><span>{bar.pts} pts</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div className={`h-full bg-gradient-to-r ${bar.color} rounded-full`} style={{ width: `${bar.val}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Core Tech Stack */}
                                        <div className="space-y-1.5 text-left">
                                            <div className="flex items-center gap-1.5 text-indigo-300">
                                                <Zap size={12} className="animate-bounce" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Core Technologies</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                {Array.from(new Set(projects.flatMap((p: any) => (p.stack || '').split(',').map((s: string) => s.trim())))).slice(0, 5).filter(Boolean).map((tech) => (
                                                    <span key={tech} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-indigo-200">
                                                        {tech}
                                                    </span>
                                                ))}
                                                {projects.length === 0 && ['Go', 'Raft', 'gRPC', 'Python', 'OpenCV', 'PyTorch'].map((tech) => (
                                                    <span key={tech} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-indigo-200">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-t border-white/10 flex flex-col gap-3">
                                    <button
                                        onClick={() => setActiveTab('projects')}
                                        className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-indigo-400/20"
                                    >
                                        <BookOpen size={13} className="text-indigo-200" /> Manage Portfolio & Upload
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* NEW SECTION: Exam Prep Trends & Insight Dashboard */}
                        <section className="mt-8 bg-white rounded-[32px] border-[1px] border-slate-200/60 shadow-md p-6 sm:p-8 relative overflow-hidden">
                            <div className="absolute -left-24 -bottom-24 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-500/5 to-blue-500/5 blur-3xl opacity-60" />

                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b-[1px] border-slate-100 pb-5 mb-6 gap-3">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
                                            <Sparkles className="text-amber-500 animate-pulse" size={20} />
                                            Exam Preparation Insights & Trend Analysis
                                        </h3>
                                        {mlEngineActive ? (
                                            <span className="px-2.5 py-0.5 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm animate-pulse border border-emerald-400">
                                                <span className="w-1 h-1 bg-white rounded-full" /> Python ML Active
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border border-slate-200">
                                                Basic Analytics
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-500 text-xs font-semibold mt-1">
                                        {mlEngineActive
                                            ? `Trained on Worldwide Curricula (MIT, Stanford, Cambridge, IITs, ETH Zurich) for all departments.`
                                            : "Analyzed from questions added to the university question bank in the last 2 months."
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedMockSubject(selectedTrendSubject || (questionTrends[0]?.subject) || '');
                                            setShowMockModal(true);
                                        }}
                                        className="px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-950 hover:to-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all border border-slate-700/50 cursor-pointer"
                                    >
                                        <FileText size={13} className="text-indigo-400" /> Generate Mock Test
                                    </button>
                                    <span className="px-3.5 py-1 bg-amber-50 border-[1px] border-amber-200 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm">
                                        <Clock size={12} /> Last 60 Days Additions
                                    </span>
                                </div>
                            </div>

                            {trendsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-950"></div>
                                </div>
                            ) : questionTrends.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Info className="mx-auto text-slate-400 mb-2" size={24} />
                                    <p className="text-slate-500 text-xs font-semibold">No questions added in the last 2 months to compile insights.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Interactive Filters Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                <Search size={11} className="text-slate-400" /> Search Subject
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Computer Networks..."
                                                value={searchSubjectQuery}
                                                onChange={(e) => setSearchSubjectQuery(e.target.value)}
                                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 transition-all text-slate-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                <SlidersHorizontal size={11} className="text-slate-400" /> Filter by Semester
                                            </label>
                                            <select
                                                value={selectedSemesterFilter}
                                                onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 transition-all text-slate-800"
                                            >
                                                <option value="all">All Semesters</option>
                                                <option value="Semester 1">Semester 1 (First Year)</option>
                                                <option value="Semester 2">Semester 2 (First Year)</option>
                                                <option value="Semester 6">Semester 6 (Ongoing)</option>
                                                <option value="Semester 7">Semester 7 (Final Year)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                <Sparkles size={11} className="text-slate-400" /> Filter by Novelty
                                            </label>
                                            <select
                                                value={selectedNoveltyFilter}
                                                onChange={(e) => setSelectedNoveltyFilter(e.target.value)}
                                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-900 transition-all text-slate-800"
                                            >
                                                <option value="all">All Novelty Levels</option>
                                                <option value="highly_novel">Highly Novel Only (Hard / Marks &ge; 12)</option>
                                                <option value="standard">Standard Questions Only</option>
                                            </select>
                                        </div>
                                    </div>

                                    {filteredTrends.length === 0 ? (
                                        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                                            <Info className="mx-auto text-slate-400 mb-2" size={24} />
                                            <p className="text-slate-500 text-xs font-semibold">No questions found matching your filter criteria.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            {/* Left Side: Subject Selector List */}
                                            <div className="lg:col-span-4 space-y-5">
                                                <div className="space-y-2">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Subject</h4>
                                                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                                                        {filteredTrends.map((group: any) => {
                                                            const active = activeTrendSubject === group.subject;
                                                            // Analyze repetition chance and badge styling
                                                            let repChance = 50;
                                                            if (mlEngineActive) {
                                                                let total = 0;
                                                                group.questions.forEach((q: any) => {
                                                                    total += q.mlRepetitionProbability !== undefined ? q.mlRepetitionProbability : 50;
                                                                });
                                                                repChance = group.questions.length > 0 ? Math.round(total / group.questions.length) : 50;
                                                            } else {
                                                                const hasNovel = group.questions.some(isHighlyNovel);
                                                                if (group.questions.length > 2) repChance += 20;
                                                                if (hasNovel) repChance += 15;
                                                                repChance = Math.min(repChance, 95);
                                                            }

                                                            return (
                                                                <button
                                                                    key={group.subject}
                                                                    onClick={() => setSelectedTrendSubject(group.subject)}
                                                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${active
                                                                            ? 'bg-slate-900 border-slate-900 text-white shadow-md transform scale-[1.01]'
                                                                            : 'bg-slate-50 hover:bg-slate-100/60 border-slate-200/50 text-slate-900'
                                                                        }`}
                                                                >
                                                                    <div className="flex justify-between items-start gap-2">
                                                                        <h5 className="text-xs font-black tracking-tight truncate flex-1">{group.subject}</h5>
                                                                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${active
                                                                                ? 'bg-white/20 text-white'
                                                                                : 'bg-slate-200/60 text-slate-700'
                                                                            }`}>
                                                                            {group.questions.length} Qs
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 mt-2 text-[9px] font-black uppercase tracking-wider opacity-85">
                                                                        <span>Repetition Chance:</span>
                                                                        <span className={repChance >= 75 ? 'text-rose-500 font-extrabold' : repChance >= 55 ? 'text-amber-500 font-extrabold' : 'text-slate-500'}>
                                                                            {repChance}%
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Interactive Checklist Card */}
                                                <div className="bg-white rounded-[24px] border border-slate-200/60 p-5 shadow-sm space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                            <ClipboardCheck size={14} className="text-indigo-500 animate-pulse" /> Prep Milestones
                                                        </h4>
                                                        <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                            {Math.round((prepTasksCompleted.length / 5) * 100)}% Done
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className="bg-indigo-600 h-full transition-all duration-300"
                                                            style={{ width: `${(prepTasksCompleted.length / 5) * 100}%` }}
                                                        />
                                                    </div>

                                                    <div className="space-y-2.5">
                                                        {[
                                                            { id: 'ledger', label: 'Analyze Match Ledger' },
                                                            { id: 'novel', label: 'Review Novel Spotlight Qs' },
                                                            { id: 'mock', label: 'Generate & Solve Mock Paper' },
                                                            { id: 'proofs', label: 'Verify Derivation Proofs' },
                                                            { id: 'co-pilot', label: 'Check Skills Portfolio Credits' }
                                                        ].map((task) => {
                                                            const done = prepTasksCompleted.includes(task.id);
                                                            return (
                                                                <button
                                                                    key={task.id}
                                                                    onClick={() => togglePrepTask(task.id)}
                                                                    className="w-full flex items-center gap-2.5 text-left text-xs font-semibold py-1 hover:opacity-80 transition-opacity cursor-pointer text-slate-700"
                                                                >
                                                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${done
                                                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                                                            : 'border-slate-300 bg-white'
                                                                        }`}>
                                                                        {done && (
                                                                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                    <span className={done ? 'line-through text-slate-400 font-medium' : 'text-slate-700'}>
                                                                        {task.label}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Trends Overview Stats Card */}
                                                <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[24px] border border-slate-800 p-5 shadow-md relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                                                        <SlidersHorizontal size={12} className="text-indigo-400" /> Compiled Analytics
                                                    </h4>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Questions</p>
                                                            <p className="text-base font-black text-white">
                                                                {filteredTrends.reduce((acc, g) => acc + (g.questions?.length || 0), 0)} Qs
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Highly Novel</p>
                                                            <p className="text-base font-black text-amber-400">
                                                                {filteredTrends.reduce((acc, g) => acc + (g.questions?.filter((q: any) => {
                                                                    return mlEngineActive ? (q.mlNoveltyRating >= 70) : isHighlyNovel(q);
                                                                }).length || 0), 0)}
                                                            </p>
                                                        </div>
                                                        {mlEngineActive && mlStats ? (
                                                            <>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Global Training Corpus</p>
                                                                    <p className="text-base font-black text-indigo-300">
                                                                        {mlStats.trainingCorpusQuestions || 38} Qs
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Avg ML Repetition</p>
                                                                    <p className="text-base font-black text-emerald-400 animate-pulse">
                                                                        {(() => {
                                                                            let total = 0;
                                                                            let count = 0;
                                                                            filteredTrends.forEach(g => {
                                                                                g.questions.forEach((q: any) => {
                                                                                    total += q.mlRepetitionProbability !== undefined ? q.mlRepetitionProbability : 50;
                                                                                    count++;
                                                                                });
                                                                            });
                                                                            return count > 0 ? Math.round(total / count) : 0;
                                                                        })()}%
                                                                    </p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active Subjects</p>
                                                                    <p className="text-base font-black text-indigo-300">
                                                                        {filteredTrends.length}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Avg Probability</p>
                                                                    <p className="text-base font-black text-emerald-400">
                                                                        {filteredTrends.length > 0 ? Math.round(
                                                                            filteredTrends.reduce((acc, g) => {
                                                                                let repChance = 50;
                                                                                const hasNovel = g.questions.some(isHighlyNovel);
                                                                                if (g.questions.length > 2) repChance += 20;
                                                                                if (hasNovel) repChance += 15;
                                                                                return acc + Math.min(repChance, 95);
                                                                            }, 0) / filteredTrends.length
                                                                        ) : 0}%
                                                                    </p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    {mlEngineActive && (
                                                        <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-[7.5px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1">
                                                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                                                            Trained on MIT, Stanford, IITs, Cambridge, ETH Zurich
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Side: Dynamic Insight Panel */}
                                            <div className="lg:col-span-8 space-y-6 bg-slate-50/50 rounded-3xl border border-slate-100 p-5 sm:p-6">
                                                {(() => {
                                                    const currentGroup = filteredTrends.find((g: any) => g.subject === activeTrendSubject) || filteredTrends[0];
                                                    if (!currentGroup) return null;

                                                    // Analyze group details
                                                    const questions = currentGroup.questions || [];
                                                    const hasNovel = questions.some(isHighlyNovel);
                                                    let repChance = 50;
                                                    if (questions.length > 2) repChance += 20;
                                                    if (hasNovel) repChance += 15;
                                                    repChance = Math.min(repChance, 95);

                                                    let chanceLabel = 'Low Repetition Chance';
                                                    let chanceColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                                                    if (repChance >= 75) {
                                                        chanceLabel = 'High Priority Focus';
                                                        chanceColor = 'text-rose-700 bg-rose-50 border-rose-200/80';
                                                    } else if (repChance >= 55) {
                                                        chanceLabel = 'Medium Priority Focus';
                                                        chanceColor = 'text-amber-700 bg-amber-50 border-amber-200/80';
                                                    }

                                                    // Map key topics
                                                    const topics: string[] = [];
                                                    questions.forEach((q: any) => {
                                                        const text = q.text.toLowerCase();
                                                        if (text.includes('tcp') || text.includes('udp')) topics.push('TCP vs UDP protocol headers & flow/congestion control mechanisms');
                                                        else if (text.includes('normalization') || text.includes('1nf')) topics.push('Relational schemas & Normalization forms (1NF, 2NF, 3NF, BCNF)');
                                                        else if (text.includes('turing')) topics.push('Turing machine formal design and transition graph graphing');
                                                        else if (text.includes('deadlock')) topics.push('Deadlock conditions (mutual exclusion, hold/wait, preemption, circular)');
                                                        else if (text.includes('halting')) topics.push('Halting problem undecidability and diagonalization proofs');
                                                        else if (text.includes('neural') || text.includes('machine learning')) topics.push('Deep CNN backpropagation & SGD loss optimization');
                                                        else if (text.includes('raft') || text.includes('distributed')) topics.push('Raft Consensus protocol & distributed multi-node transactions');
                                                        else if (text.includes('cryptography') || text.includes('rsa')) topics.push('RSA asymmetric cryptography algorithm & key exchange mechanics');
                                                        else if (text.includes('counter') || text.includes('jk flip')) topics.push('JK Flip-Flop synchronous up/down counters');
                                                        else if (text.includes('superposition')) topics.push('Superposition Theorem application in AC circuits');
                                                        else if (text.includes('maxwell')) topics.push('Maxwell equations in differential & integral formats');
                                                        else if (text.includes('faraday') || text.includes('lenz')) topics.push('Faradays & Lenzs Laws applied in power transformers');
                                                        else if (text.includes('induction motor')) topics.push('Three-Phase Induction Motor starting torque and slip');
                                                        else if (text.includes('amplitude modulation')) topics.push('AM and FM modulation under noise-limited channels');
                                                        else if (text.includes('butterworth')) topics.push('Second-order active low-pass Butterworth filters');
                                                        else if (text.includes('heat conduction')) topics.push('Steady-state 1D composite cylinder heat conduction');
                                                        else if (text.includes('critical speed')) topics.push('Damped & undamped shaft critical speed dynamics');
                                                        else if (text.includes('navier-stokes')) topics.push('Incompressible Navier-Stokes formulations & boundary criteria');
                                                        else if (text.includes('carnot')) topics.push('Carnot Cycle PV/TS diagrams & thermal efficiency formulas');
                                                        else if (text.includes('four-stroke')) topics.push('Four-stroke Spark-Ignition (SI) internal combustion principles');
                                                        else if (text.includes('terzaghi')) topics.push('Terzaghis theory of shallow rectangular foundations');
                                                        else if (text.includes('determinate')) topics.push('Statically determinate vs indeterminate structural beams');
                                                        else if (text.includes('stiffness matrix') || text.includes('truss')) topics.push('Stiffness matrix formulation for 2D truss elements');
                                                        else if (text.includes('wastewater')) topics.push('Primary vs secondary wastewater treatment in environment engineering');
                                                        else if (text.includes('earth pressure')) topics.push('Rankine & Coulomb active earth pressure calculations');
                                                        else if (text.includes('darcy')) topics.push('Darcys Law of fluid permeability through soils');
                                                        else if (text.includes('bernoulli')) topics.push('Bernoullis equation energy heads & fluid flow');
                                                        else {
                                                            const cleanText = q.text.replace(/^[.\s]+|[.\s]+$/g, '');
                                                            topics.push(cleanText.length > 70 ? cleanText.slice(0, 67) + '...' : cleanText);
                                                        }
                                                    });
                                                    const uniqueTopics = Array.from(new Set(topics));

                                                    // Identify highly novel questions
                                                    const novelQuestions = questions.filter(isHighlyNovel);

                                                    // Identify training data questions
                                                    const trainingQuestions = questions.filter(isTrainingData);

                                                    // Build prep suggestions
                                                    const prepTips: string[] = [];
                                                    if (uniqueTopics.some(t => t.includes('Turing') || t.includes('Halting'))) {
                                                        prepTips.push('Practice sketching complete state-transition matrices and graphs for multi-tape Turing machines.');
                                                        prepTips.push('Study the proof structure of the Halting Problem via diagonalization to explain undecidability.');
                                                    }
                                                    if (uniqueTopics.some(t => t.includes('Raft') || t.includes('Distributed'))) {
                                                        prepTips.push('Detail Raft leader election, heartbeats, and client interactions during partition recoveries.');
                                                        prepTips.push('Be ready to compare Raft consensus with Paxos variants in terms of messaging overhead.');
                                                    }
                                                    if (uniqueTopics.some(t => t.includes('TCP') || t.includes('UDP'))) {
                                                        prepTips.push('Be ready to draw a comparative chart of TCP vs UDP headers, noting size and optional field positions.');
                                                        prepTips.push('Trace slow-start, congestion avoidance, and fast recovery window sizes under packet loss.');
                                                    }
                                                    if (uniqueTopics.some(t => t.includes('CNN') || t.includes('Machine Learning'))) {
                                                        prepTips.push('Practice calculating gradients across convolutional, pooling, and fully-connected layers.');
                                                    }
                                                    if (uniqueTopics.some(t => t.includes('Navier-Stokes') || t.includes('Heat Conduction'))) {
                                                        prepTips.push('Derive boundary-layer assumptions for simplified 2D fluid flows.');
                                                        prepTips.push('Solve composite heat conduction proofs with varying boundary temperature constants.');
                                                    }
                                                    if (uniqueTopics.some(t => t.includes('Maxwell') || t.includes('Electromagnetic'))) {
                                                        prepTips.push('Review the physical interpretations of divergence and curl components in Maxwell equations.');
                                                    }

                                                    if (novelQuestions.length > 0) {
                                                        prepTips.push('Review numerical algorithms and proofs from premier universities (IISc/IITs) as they heavily inspire sessional tests.');
                                                    }
                                                    prepTips.push('Prioritize derivation steps and boundary assumptions over pure definitions.');

                                                    return (
                                                        <div className="space-y-6">
                                                            {/* Header Status Row */}
                                                            <div className="flex flex-wrap justify-between items-center gap-3">
                                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                                                    {currentGroup.subject} Dashboard
                                                                </h4>
                                                                <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border ${chanceColor}`}>
                                                                    {chanceLabel} ({repChance}% Chance)
                                                                </span>
                                                            </div>

                                                            {/* Progress Bar for repetition probability */}
                                                            <div className="bg-slate-200/60 rounded-full h-2 w-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all duration-500 ${repChance >= 75 ? 'bg-rose-500' : repChance >= 55 ? 'bg-amber-500' : 'bg-emerald-500'
                                                                        }`}
                                                                    style={{ width: `${repChance}%` }}
                                                                />
                                                            </div>

                                                            {/* Topics Touched Section */}
                                                            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-2">
                                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                                    <Target size={13} className="text-slate-500" /> Topics Touched
                                                                </h5>
                                                                <ul className="space-y-2">
                                                                    {uniqueTopics.map((topic, i) => (
                                                                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                                                                            <span className="text-indigo-500 font-extrabold mt-0.5">•</span>
                                                                            <span>{topic}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            {/* Highly Novel Questions Spotlight */}
                                                            {novelQuestions.length > 0 && (
                                                                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-indigo-950 relative overflow-hidden">
                                                                    <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles size={60} /></div>
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <span className="bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                                                                            <Zap size={10} className="text-yellow-400 animate-pulse" /> Highly Novel Spotlight
                                                                        </span>
                                                                    </div>

                                                                    <div className="space-y-3.5">
                                                                        {novelQuestions.map((q: any) => (
                                                                            <div key={q._id} className="border-b border-indigo-850/50 pb-3 last:border-0 last:pb-0">
                                                                                <p className="text-xs font-medium text-slate-100 leading-relaxed italic">
                                                                                    "{q.text}"
                                                                                </p>
                                                                                <div className="flex flex-wrap items-center gap-2.5 mt-2 text-[9px] text-slate-300 font-black uppercase tracking-wider">
                                                                                    <span>Marks: {q.marks}</span>
                                                                                    <span>•</span>
                                                                                    <span>Level: {q.creditLevel}</span>
                                                                                    <span>•</span>
                                                                                    <span className="text-indigo-300">Source: {q.sourceUniversity}</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* AI Training Corpus Questions Spotlight */}
                                                            {trainingQuestions.length > 0 && (
                                                                <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-purple-900 relative overflow-hidden">
                                                                    <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles size={60} /></div>
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <span className="bg-purple-500/20 border border-purple-400/40 text-purple-200 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
                                                                            <BookOpen size={10} className="text-purple-300 animate-pulse" /> AI Training Corpus Spotlight
                                                                        </span>
                                                                    </div>

                                                                    <div className="space-y-3.5">
                                                                        {trainingQuestions.map((q: any) => (
                                                                            <div key={q._id} className="border-b border-purple-900/40 pb-3 last:border-0 last:pb-0">
                                                                                <p className="text-xs font-semibold text-purple-100 leading-relaxed italic">
                                                                                    "{q.text}"
                                                                                </p>
                                                                                <div className="flex flex-wrap items-center gap-2.5 mt-2 text-[9px] text-purple-200 font-black uppercase tracking-wider">
                                                                                    <span>Marks: {q.marks}</span>
                                                                                    <span>•</span>
                                                                                    <span>Semester: {getSemesterOfCode(q.code)}</span>
                                                                                    <span>•</span>
                                                                                    <span className="text-purple-300">Dataset Source: {q.sourceUniversity}</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Complete Questions Ledger */}
                                                            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
                                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                                                    <FileText size={14} className="text-slate-500" /> Question Bank Ledger ({questions.length} Match{questions.length !== 1 ? 'es' : ''})
                                                                </h5>
                                                                <div className="space-y-3">
                                                                    {questions.map((q: any, idx: number) => {
                                                                        const novel = mlEngineActive ? (q.mlNoveltyRating >= 70) : isHighlyNovel(q);
                                                                        const training = isTrainingData(q);
                                                                        return (
                                                                            <div key={q._id || idx} className="p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                                                                                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                                                                                    {q.text}
                                                                                </p>
                                                                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                                                                    {/* Semester Badge */}
                                                                                    <span className="bg-slate-200/60 text-slate-700 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                                                                                        {getSemesterOfCode(q.code)}
                                                                                    </span>

                                                                                    {/* Novelty Badge */}
                                                                                    {novel ? (
                                                                                        <span className="bg-amber-100/80 text-amber-800 border border-amber-200/50 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                                                            <Zap size={8} /> Highly Novel
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="bg-slate-100 text-slate-500 border border-slate-200/40 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                                                                                            Standard
                                                                                        </span>
                                                                                    )}

                                                                                    {/* Dataset Origin Badge */}
                                                                                    {training ? (
                                                                                        <span className="bg-purple-100/80 text-purple-800 border border-purple-200/50 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                                                            <Sparkles size={8} className="text-purple-600" /> AI Training Set
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="bg-blue-100/80 text-blue-800 border border-blue-200/50 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                                                                                            University PYQ
                                                                                        </span>
                                                                                    )}

                                                                                    <span className="ml-auto text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                                                                        Marks: {q.marks} | Added: {q.addedOn}
                                                                                    </span>
                                                                                </div>

                                                                                {/* Python ML Engine Insights Footer */}
                                                                                {mlEngineActive && q.mlRepetitionProbability !== undefined && (
                                                                                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[8.5px] font-black uppercase tracking-wider text-slate-500 bg-slate-100/50 px-2.5 py-1.5 rounded-lg border border-slate-200/30">
                                                                                        <span className="text-slate-400 flex items-center gap-0.5 shrink-0"><Sparkles size={10} className="text-indigo-500" /> ML Predictor:</span>
                                                                                        <span className={q.mlRepetitionProbability >= 75 ? 'text-rose-600 font-extrabold' : q.mlRepetitionProbability >= 55 ? 'text-amber-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                                                                                            Repetition Probability: {q.mlRepetitionProbability}%
                                                                                        </span>
                                                                                        <span className="text-slate-300">|</span>
                                                                                        <span className="text-indigo-600">Novelty index: {q.mlNoveltyRating}%</span>
                                                                                        <span className="text-slate-300">|</span>
                                                                                        <span className="text-slate-500 font-semibold truncate max-w-[200px]">Match: {q.mlMatchedUniversity} ({Math.round(q.mlMatchedScore * 100)}% sim)</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* Preparation Guidelines */}
                                                            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-2">
                                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                                    <ClipboardCheck size={14} className="text-slate-500" /> Prep Action Items
                                                                </h5>
                                                                <ul className="space-y-2">
                                                                    {prepTips.map((tip, i) => (
                                                                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                                                                            <CheckCircle size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                                                                            <span>{tip}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
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

                {/* CLASS SCHEDULE & ASSIGNMENTS TAB */}
                {activeTab === 'schedule' && (
                    <div className="space-y-10 animate-fade-in">
                        <SectionHeader 
                            title="Class Schedule & Assignments" 
                            desc="View scheduled and completed lectures, see what topic was taught today, and solve question-bank assignments." 
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            
                            {/* LEFT COLUMN: CLASS SCHEDULE TIMELINE */}
                            <div className="lg:col-span-7 space-y-6">
                                <div className="bg-white border border-slate-200/60 rounded-[32px] p-6 sm:p-8 shadow-sm">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <Clock size={16} className="text-slate-900" /> Department Lecture Report & Timeline
                                    </h3>

                                    {loadingSessions ? (
                                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                            <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading department schedule...</p>
                                        </div>
                                    ) : classSessions.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                            <Calendar className="mx-auto text-slate-300 mb-3" size={36} />
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">No lectures scheduled today</p>
                                        </div>
                                    ) : (
                                        <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
                                            {classSessions.map((session) => (
                                                <div key={session._id} className="relative group">
                                                    {/* TIMELINE CIRCLE */}
                                                    <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-white transition-transform ${
                                                        session.status === 'completed'
                                                            ? 'border-emerald-500 bg-emerald-50'
                                                            : session.status === 'cancelled'
                                                                ? 'border-rose-500 bg-rose-50'
                                                                : 'border-indigo-500 bg-indigo-50'
                                                    }`} />

                                                    <div className={`border rounded-2xl p-5 transition-all duration-300 ${
                                                        session.status === 'completed'
                                                            ? 'bg-emerald-50/10 hover:bg-emerald-50/20 border-emerald-200/60'
                                                            : session.status === 'cancelled'
                                                                ? 'bg-rose-50/10 hover:bg-rose-50/20 border-rose-200/60 shadow-sm shadow-rose-100/50'
                                                                : 'bg-slate-50/40 hover:bg-slate-50 border-slate-200/40 hover:border-slate-250'
                                                    }`}>
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-slate-100 pb-3">
                                                            <div>
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{session.semester} • {session.batch || 'All'} • {session.department}</span>
                                                                <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight mt-0.5">{session.subject}</h4>
                                                            </div>
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl self-start sm:self-auto border ${
                                                                session.status === 'completed'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                                                                    : session.status === 'cancelled'
                                                                        ? 'bg-rose-50 text-rose-700 border-rose-150'
                                                                        : 'bg-indigo-50 text-indigo-700 border-indigo-150'
                                                            }`}>
                                                                {session.status}
                                                            </span>
                                                        </div>

                                                        {/* TIMING INFO */}
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[11px] font-bold text-slate-600 mb-4">
                                                            <div>
                                                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Date & Time</div>
                                                                <div className="mt-0.5 text-slate-800">
                                                                    {new Date(session.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} at {session.time}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Faculty</div>
                                                                <div className="mt-0.5 text-slate-800">{session.faculty?.name || 'Assigned Professor'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Duration</div>
                                                                <div className="mt-0.5 text-slate-800">{session.duration} mins</div>
                                                            </div>
                                                        </div>

                                                        {/* TOPIC LOG COVER */}
                                                        <div className="bg-white border border-slate-200/50 rounded-xl p-3.5 shadow-sm text-xs">
                                                            {session.status === 'completed' ? (
                                                                <div>
                                                                    <span className="font-black text-emerald-600 uppercase tracking-widest text-[8px] block mb-1">Topic Completed Today</span>
                                                                    <span className="font-extrabold text-slate-950 text-sm">“{session.topicCovered}”</span>
                                                                </div>
                                                            ) : session.status === 'cancelled' ? (
                                                                <div>
                                                                    <span className="font-black text-rose-600 uppercase tracking-widest text-[8px] block mb-1">Cancellation Reason</span>
                                                                    <span className="font-extrabold text-rose-950 text-sm">“{session.cancellationReason || 'No reason specified.'}”</span>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <span className="font-black text-indigo-600 uppercase tracking-widest text-[8px] block mb-1">Lecture Plan / Agenda</span>
                                                                    <span className="font-semibold text-slate-600">{session.topicPlanned || 'No description provided.'}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: ASSIGNMENT INBOX */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="bg-white border border-slate-200/60 rounded-[32px] p-6 shadow-sm">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <ClipboardList size={16} className="text-slate-900" /> Active Assignment Inbox
                                    </h3>

                                    {loadingAssignments ? (
                                        <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Loading assignments...</p>
                                        </div>
                                    ) : assignmentsList.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400">
                                            <p className="text-xs font-bold uppercase tracking-wider">No assignments allotted yet</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Assignments sent by faculty will appear here</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {assignmentsList.map((assignment) => {
                                                const mySubmission = assignment.submissions?.find((s: any) => String(s.student?._id || s.student) === String(user._id));
                                                return (
                                                    <div key={assignment._id} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/40 hover:border-slate-250 rounded-2xl p-5 transition-all duration-300">
                                                        <div className="flex items-start justify-between gap-3 mb-2 border-b border-slate-100 pb-2">
                                                            <div>
                                                                <h4 className="text-xs font-black text-slate-950 uppercase tracking-tight">{assignment.title}</h4>
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5 block">By: {assignment.faculty?.name}</span>
                                                            </div>
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                                                mySubmission 
                                                                    ? mySubmission.grade !== 'Pending'
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                                            }`}>
                                                                {mySubmission ? (mySubmission.grade !== 'Pending' ? `Graded: ${mySubmission.grade}` : 'Submitted') : 'Pending'}
                                                            </span>
                                                        </div>

                                                        <p className="text-[10px] text-slate-500 font-semibold mb-3">{assignment.description || 'No description provided.'}</p>

                                                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-600 mb-4">
                                                            <span>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                            <span>Questions: {assignment.questions?.length || 0}</span>
                                                        </div>

                                                        <button
                                                            onClick={() => {
                                                                setSolvingAssignmentId(assignment._id);
                                                                if (mySubmission) {
                                                                    setAssignmentAnswers(mySubmission.answers || []);
                                                                    setGeneralSubText(mySubmission.submittedText || '');
                                                                } else {
                                                                    setAssignmentAnswers(new Array(assignment.questions?.length || 0).fill(''));
                                                                    setGeneralSubText('');
                                                                }
                                                            }}
                                                            className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-sm ${
                                                                mySubmission
                                                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:scale-[1.01]'
                                                                    : 'bg-slate-900 hover:bg-slate-850 text-white hover:scale-[1.01]'
                                                            } cursor-pointer`}
                                                        >
                                                            {mySubmission ? 'Review Submission' : 'Solve Assignment'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* INTERACTIVE ASSIGNMENT SOLVER MODAL */}
                        {solvingAssignmentId && (() => {
                            const assignment = assignmentsList.find(a => a._id === solvingAssignmentId);
                            if (!assignment) return null;
                            const mySubmission = assignment.submissions?.find((s: any) => String(s.student?._id || s.student) === String(user._id));
                            return (
                                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setSolvingAssignmentId(null)} />
                                    <div className="bg-white border border-slate-200 rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up flex flex-col max-h-[85vh]">
                                        <button onClick={() => setSolvingAssignmentId(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer">
                                            <X size={20} />
                                        </button>
                                        <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight mb-1">{assignment.title}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                                            By: {assignment.faculty?.name} • Due Date: {new Date(assignment.dueDate).toLocaleDateString()}
                                        </p>

                                        {mySubmission && mySubmission.grade !== 'Pending' && (
                                            <div className="bg-emerald-50 border border-emerald-250 rounded-2xl p-4 mb-4 text-emerald-800 text-xs">
                                                <div className="font-extrabold flex items-center justify-between mb-1">
                                                    <span>🎯 Grade Allotted: {mySubmission.grade}</span>
                                                    <span className="font-medium opacity-80">{new Date(mySubmission.submittedAt).toLocaleDateString()}</span>
                                                </div>
                                                {mySubmission.feedback && (
                                                    <p className="font-semibold mt-1"><strong>Feedback:</strong> “{mySubmission.feedback}”</p>
                                                )}
                                            </div>
                                        )}

                                        <form onSubmit={handleSolveAssignmentSubmit} className="space-y-6 overflow-y-auto flex-1 pr-2">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions List</h4>
                                                
                                                {assignment.questions?.map((q: any, idx: number) => (
                                                    <div key={q._id} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4">
                                                        <div className="flex items-start justify-between gap-4 border-b border-slate-200/30 pb-2 mb-2">
                                                            <span className="text-[10px] font-black text-slate-500">Question {idx + 1}</span>
                                                            <div className="flex gap-2">
                                                                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-150">Marks: {q.marks}</span>
                                                                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-150">{q.difficulty}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <p className="text-xs font-black text-slate-800 mb-3">{q.text}</p>
                                                        
                                                        <textarea
                                                            rows={3}
                                                            required
                                                            disabled={!!mySubmission}
                                                            placeholder="Type your complete answer here..."
                                                            value={assignmentAnswers[idx] || ''}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                setAssignmentAnswers(prev => {
                                                                    const copy = [...prev];
                                                                    copy[idx] = val;
                                                                    return copy;
                                                                });
                                                            }}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800 disabled:bg-slate-100/50 disabled:text-slate-500"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Additional Notes / Submission Comments</label>
                                                <textarea
                                                    rows={2}
                                                    disabled={!!mySubmission}
                                                    placeholder="Add links, references, or general summaries here..."
                                                    value={generalSubText}
                                                    onChange={e => setGeneralSubText(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-xs text-slate-800 disabled:bg-slate-100/50 disabled:text-slate-500"
                                                />
                                            </div>

                                            {!mySubmission && (
                                                <button
                                                    type="submit"
                                                    disabled={submittingAssignment}
                                                    className="w-full bg-slate-900 hover:bg-slate-850 text-white font-black text-xs uppercase tracking-widest py-3 rounded-2xl shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                                                >
                                                    {submittingAssignment ? <Loader2 className="animate-spin" size={14} /> : 'Submit Assignment Answers'}
                                                </button>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* CURRICULUM TAB */}
                {activeTab === 'curriculum' && (
                    <div className="space-y-10 animate-fade-in">
                        <SectionHeader title="Academic Curriculum" desc="Official syllabus, progress tracking, and lecture breakdown across all phases." />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-6">
                                {curriculumLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-white border border-slate-200/60 rounded-[32px] shadow-sm">
                                        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Academic Curriculum...</p>
                                    </div>
                                ) : curriculum.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-5 bg-white border border-slate-200/60 rounded-[32px] shadow-sm">
                                        <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-[22px] flex items-center justify-center text-slate-400">
                                            <Library size={32} />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">Institutional Syllabus Empty</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide max-w-sm mt-1.5 leading-relaxed">
                                                No sessional syllabus branches have been registered under this college registry ledger yet.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    const token = localStorage.getItem('urp_token');
                                                    if (!token) return;
                                                    triggerToast('Seeding comprehensive 8-semester blueprint...');
                                                    const res = await fetch(BASE_URL + '/api/academic/seed', {
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                    });
                                                    if (res.ok) {
                                                        triggerToast('Syllabus seeder completed successfully!');
                                                        fetchCurriculum();
                                                    }
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                            }}
                                            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all cursor-pointer"
                                        >
                                            Seed 8-Semester Syllabus Blueprint
                                        </button>
                                    </div>
                                ) : (
                                    curriculum.map((sem) => (
                                        <div key={sem.sem} className="space-y-4">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedSem(expandedSem === sem.sem ? null : sem.sem)}
                                                className="w-full flex items-center justify-between p-6 bg-white rounded-[24px] border-[1px] border-slate-200/60 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors ${expandedSem === sem.sem
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
                                                    {sem.courses.map((course: any) => (
                                                        <CourseRow
                                                            key={course.code}
                                                            {...course}
                                                            name={course.title}
                                                            isExpanded={expandedCourse === course.code}
                                                            onToggle={() => setExpandedCourse(expandedCourse === course.code ? null : course.code)}
                                                            onToast={triggerToast}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
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
                                onClick={() => {
                                    setResultsRegNo('');
                                    setResultsUnlocked(false);
                                    setResultsError('');
                                    setShowResultsLedgerModal(true);
                                }}
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

                {/* NEW FEATURE: PROJECTS & ACHIEVEMENTS SKILLS CREDIT TRANSFER HUB */}
                {activeTab === 'projects' && (
                    <div className="space-y-10 animate-fade-in font-body">
                        <SectionHeader
                            title="Skills Credit Transfer & Portfolio Hub"
                            desc="Upload sessional software projects, technical achievements, and certifications. The system automatically analyses them for skills credits."
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Side: Upload Panel (Col Span 5) */}
                            <div className="lg:col-span-5 space-y-6">
                                {/* Project Upload */}
                                <div className="bg-white rounded-[28px] p-6 border-[1px] border-slate-200/60 shadow-sm relative overflow-hidden">
                                    <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-indigo-500/5 blur-lg pointer-events-none" />

                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <BookOpen className="text-indigo-600 animate-pulse" size={15} /> Upload Project Profile
                                    </h3>

                                    <form onSubmit={handleAddProject} className="space-y-4">
                                        <div>
                                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Project Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Distributed Key-Value Store"
                                                value={newProjName}
                                                onChange={(e) => setNewProjName(e.target.value)}
                                                className="w-full h-10 px-3 border-[1px] border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Tech Stack</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Go, Raft Consensus, gRPC"
                                                value={newProjStack}
                                                onChange={(e) => setNewProjStack(e.target.value)}
                                                className="w-full h-10 px-3 border-[1px] border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Status</label>
                                            <select
                                                value={newProjStatus}
                                                onChange={(e) => setNewProjStatus(e.target.value as any)}
                                                className="w-full h-10 px-3 border-[1px] border-slate-200 rounded-xl text-xs font-bold bg-slate-50 outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                                            >
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Assign Peer-Review Mentor</label>
                                            <select
                                                value={newProjMentor}
                                                onChange={(e) => setNewProjMentor(e.target.value)}
                                                className="w-full h-10 px-3 border-[1px] border-slate-200 rounded-xl text-xs font-bold bg-slate-50 outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                                            >
                                                <option value="">-- Choose Faculty Mentor (Optional) --</option>
                                                {mentorsList.map((m: any) => (
                                                    <option key={m._id || m.id} value={m._id || m.id}>
                                                        {m.name} ({m.department || 'General'} - {m.position || 'Professor'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Project Description</label>
                                            <textarea
                                                required
                                                rows={3}
                                                placeholder="Brief summary of implementation and features..."
                                                value={newProjDesc}
                                                onChange={(e) => setNewProjDesc(e.target.value)}
                                                className="w-full p-3 border-[1px] border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none focus:bg-white focus:border-indigo-500 transition-colors resize-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            Upload Project to Database
                                        </button>
                                    </form>
                                </div>

                                {/* Achievement Upload */}
                                <div className="bg-white rounded-[28px] p-6 border-[1px] border-slate-200/60 shadow-sm relative overflow-hidden">
                                    <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-emerald-500/5 blur-lg pointer-events-none" />

                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Award className="text-emerald-600 animate-pulse" size={15} /> Upload Certification
                                    </h3>

                                    <form onSubmit={handleAddAchievement} className="space-y-4">
                                        <div>
                                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Certification/Achievement Title</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. AWS Solutions Architect"
                                                value={newAchTitle}
                                                onChange={(e) => setNewAchTitle(e.target.value)}
                                                className="w-full h-10 px-3 border-[1px] border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Issuing Organization</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Amazon Web Services"
                                                value={newAchOrg}
                                                onChange={(e) => setNewAchOrg(e.target.value)}
                                                className="w-full h-10 px-3 border-[1px] border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1">Date Achieved</label>
                                            <input
                                                type="date"
                                                value={newAchDate}
                                                onChange={(e) => setNewAchDate(e.target.value)}
                                                className="w-full h-10 px-3 border-[1px] border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            Upload Achievement to Database
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Right Side: Active Portfolio Ledger (Col Span 7) */}
                            <div className="lg:col-span-7 space-y-6">
                                <div className="bg-slate-900 text-white p-5 rounded-[28px] border border-slate-800 shadow-md flex items-center justify-between">
                                    <div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Skills Credits Analyzed</span>
                                        <p className="text-2xl font-black text-white">{skillsCredits} Credits</p>
                                    </div>
                                    <span className="px-3.5 py-1.5 bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[9px] font-black uppercase tracking-widest rounded-xl">
                                        Approved Portfolio Ledger
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Project Profiles</h3>

                                    <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                                        {projects.map((p: any) => {
                                            const isEvaluated = p.creditsLocked || !!p.feedback;
                                            const isCompleted = p.status === 'Completed';

                                            // Green border = completed & evaluated, indigo = evaluated only, red = awaiting
                                            const borderColor = isEvaluated
                                                ? isCompleted ? '#10b981' : '#6366f1'
                                                : '#ef4444';
                                            const badgeLabel = isEvaluated
                                                ? isCompleted ? 'COMPLETED' : 'EVALUATED'
                                                : 'AWAITING REVIEW';
                                            const badgeTextColor = isEvaluated
                                                ? isCompleted ? '#059669' : '#4f46e5'
                                                : '#dc2626';

                                            return (
                                                <div key={p._id || p.id}
                                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                                                    style={{ border: `2px solid ${borderColor}` }}
                                                >
                                                    {/* Coloured top strip */}
                                                    <div className="h-1 w-full" style={{ background: borderColor }} />

                                                    <div className="p-5">
                                                        {/* Header row */}
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex flex-col gap-1">
                                                                <h4 className="text-base font-black text-slate-900 tracking-tight leading-snug">{p.name}</h4>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{p.stack}</span>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                                {/* Status badge */}
                                                                <span
                                                                    className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border"
                                                                    style={{ color: badgeTextColor, background: `${borderColor}12`, borderColor: `${borderColor}50` }}
                                                                >
                                                                    {badgeLabel}
                                                                </span>
                                                                {/* Credits chip */}
                                                                {isEvaluated ? (
                                                                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                        <Award size={9} /> {p.skillsCredits} Credits · Locked
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                                                        +{p.skillsCredits || 0} Credits
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Description */}
                                                        <p className="text-xs font-medium text-slate-500 leading-relaxed mb-3">{p.desc}</p>

                                                        {/* Feedback History */}
                                                        {p.feedbackHistory && p.feedbackHistory.length > 0 ? (
                                                            <div className="mt-2 rounded-xl overflow-hidden border" style={{ borderColor: `${borderColor}40` }}>
                                                                <div className="px-3 py-2 flex items-center gap-1.5" style={{ background: `${borderColor}0d` }}>
                                                                    <MessageSquare size={10} style={{ color: borderColor }} />
                                                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: badgeTextColor }}>Mentor Feedback ({p.feedbackHistory.length})</span>
                                                                </div>
                                                                <div className="divide-y divide-slate-50 max-h-36 overflow-y-auto">
                                                                    {[...p.feedbackHistory].reverse().map((entry: any, idx: number) => (
                                                                        <div key={idx} className="px-3 py-2.5 bg-white">
                                                                            <p className="text-xs font-semibold text-slate-700 leading-relaxed italic">"{entry.text}"</p>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <span className="text-[9px] font-black text-indigo-600">{entry.byName}</span>
                                                                                <span className="text-[9px] text-slate-300">·</span>
                                                                                <span className="text-[9px] text-slate-400 font-semibold">
                                                                                    {new Date(entry.at).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : !isEvaluated ? (
                                                            <div className="mt-2 text-[9px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                                                                <Clock size={11} /> Awaiting Faculty Review
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {projects.length === 0 && (
                                            <div className="text-center py-8 text-slate-400 font-bold text-xs">No project profiles uploaded yet.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Verified Credentials & Achievements</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {achievements.map((a: any) => (
                                            <div key={a._id || a.id} className="bg-white p-4.5 rounded-[24px] border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{a.date}</span>
                                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">
                                                            +{a.skillsCredits || 3} Credits
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-black text-slate-900 tracking-tight leading-snug mb-1">{a.title}</h4>
                                                    <p className="text-[10px] font-bold text-slate-500">{a.org}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {achievements.length === 0 && (
                                            <div className="col-span-2 text-center py-6 text-slate-400 font-bold text-xs">No achievements uploaded yet.</div>
                                        )}
                                    </div>
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

                                    {/* Student Card Info with attached profile image */}
                                    <div className="flex gap-4 items-center mb-6 pt-2 border-t border-white/5">
                                        <div className="w-14 h-14 rounded-2xl border border-white/15 overflow-hidden shrink-0 bg-slate-800 flex items-center justify-center relative">
                                            {user.profileImage ? (
                                                <img src={`{BASE_URL}/${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={24} className="text-white/30" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-slate-400 uppercase tracking-widest">Student Name</p>
                                            <h4 className="text-sm font-black tracking-tight mt-0.5 text-white leading-tight">{user.name}</h4>
                                            <p className="text-[8px] text-indigo-300 font-extrabold uppercase mt-1 tracking-wider leading-none">{user.department}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] text-slate-400 uppercase tracking-widest">Registration ID</p>
                                                <p className="font-mono text-[10px] font-bold text-slate-100">{user.registrationNo || 'REG-2024-892'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-slate-400 uppercase tracking-widest">Roll Number</p>
                                                <p className="font-mono text-[10px] font-bold text-slate-100">{user.rollNo || 'REG-2024-892'}</p>
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-white/10">
                                            <p className="text-[8px] text-slate-400 uppercase tracking-widest">Assigned Mentor</p>
                                            <p className="text-xs font-extrabold text-indigo-300">
                                                {user.mentor ? `${user.mentor.name} (${user.mentor.position || 'Professor'})` : 'Not Allotted'}
                                            </p>
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
                                <button
                                    type="button"
                                    onClick={() => handleDownloadIDBadge()}
                                    className="mt-4 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                                >
                                    <Download size={11} /> Download ID Badge (Print)
                                </button>
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
                                                {lockerLoading ? (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-8 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                                Loading credentials wallet...
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : lockerDocs.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-8 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                                                            No credentials found in your wallet.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    lockerDocs.map((doc: any) => {
                                                        const meta = getDocMeta(doc.category);
                                                        const formattedDate = doc.lastUpdated
                                                            ? `Last updated: ${new Date(doc.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                                            : meta.defaultDesc;

                                                        return (
                                                            <tr key={doc._id || doc.category}>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border-[1px] ${meta.bgClass}`}>
                                                                            {meta.icon}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-black text-slate-950">{doc.name || meta.defaultTitle}</p>
                                                                            <p className="text-[8px] text-slate-400 font-extrabold uppercase">{formattedDate}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    {doc.status === 'verified' && (
                                                                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[9px] font-black uppercase tracking-wider border border-green-100">
                                                                            {doc.category === 'sem5' ? 'Verified & Signed' : doc.category === 'bonafide' ? 'Verified & Active' : doc.category === 'nodues' ? 'Cleared' : 'Verified & Issued'}
                                                                        </span>
                                                                    )}
                                                                    {doc.status === 'processing' && (
                                                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-black uppercase tracking-wider border border-amber-100 animate-pulse">
                                                                            {doc.category === 'transcript' ? 'Pending Board' : 'Processing review'}
                                                                        </span>
                                                                    )}
                                                                    {doc.status === 'requestable' && (
                                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-wider">
                                                                            Available
                                                                        </span>
                                                                    )}
                                                                    {doc.status !== 'verified' && doc.status !== 'processing' && doc.status !== 'requestable' && (
                                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-wider">
                                                                            {doc.status}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    {doc.status === 'verified' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => triggerToast(meta.downloadMsg)}
                                                                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 inline-flex ml-auto cursor-pointer"
                                                                        >
                                                                            <Download size={10} /> Download
                                                                        </button>
                                                                    )}
                                                                    {doc.status === 'processing' && (
                                                                        doc.category === 'transcript' ? (
                                                                            <span className="text-[10px] font-bold text-slate-400 italic">Submitted</span>
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => triggerToast('Clearance application is currently being reviewed by accounts office.')}
                                                                                className="px-3.5 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-not-allowed"
                                                                                disabled
                                                                            >
                                                                                Under Review
                                                                            </button>
                                                                        )
                                                                    )}
                                                                    {doc.status === 'requestable' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRequestDoc(doc.category, doc.name || meta.defaultTitle)}
                                                                            disabled={requestingDoc === doc.category}
                                                                            className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-60 cursor-pointer"
                                                                        >
                                                                            {requestingDoc === doc.category ? 'Requesting...' : doc.category === 'nodues' ? 'Apply Clearance' : 'Request Copy'}
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

const IntroStat = ({ label, value, highlight }: any) => (
    <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-xs font-black ${highlight ? 'text-indigo-400' : 'text-white'}`}>{value || '—'}</p>
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
            className={`w-full bg-white p-5 rounded-[20px] border-[1px] border-slate-200/60 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 group hover:shadow-md transition-all ${isExpanded ? 'ring-2 ring-slate-900 border-transparent shadow-md' : ''
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 border-[1px] border-slate-100 transition-colors ${isExpanded ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 group-hover:bg-slate-100'
                    }`}>
                    <span className={`text-[7px] font-black uppercase ${isExpanded ? 'text-slate-300' : 'text-slate-400'}`}>{code.slice(0, 2)}</span>
                    <span className={`text-xs font-black ${isExpanded ? 'text-white' : 'text-slate-900'}`}>{code.slice(2)}</span>
                </div>
                <div className="text-left">
                    <h5 className={`font-black tracking-tight text-sm leading-none mb-1 transition-colors ${isExpanded ? 'text-indigo-600' : 'text-slate-800 group-hover:text-indigo-600'
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

// ── Examination Data ─────────────────────────────────────────
// Central data store for all examination-related data

export type SubjectType = 'core' | 'elective' | 'lab' | 'backlog';

export interface Subject {
    code: string;
    name: string;
    credits: number;
    type: SubjectType;
    maxMarks: number;
    isUniversityAssigned: boolean; // locked / pre-ticked by university
}

export interface SemesterData {
    sem: number;
    label: string;
    year: string;
    branch: string;
    coreSubjects: Subject[];
    electiveGroups: ElectiveGroup[];
}

export interface ElectiveGroup {
    groupId: string;
    groupName: string;
    pickCount: number; // how many to pick from this group
    options: Subject[];
}

export interface ExamCenter {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    capacity: number;
    pincode: string;
    contactPerson: string;
    phone: string;
}

export interface StudentRecord {
    id: string;
    name: string;
    prn: string;
    dept: string;
    sem: number;
    rollNo: string;
    category: string;
    status: 'Pending' | 'Approved' | 'Released';
    center: string;
    centerPref1?: string;
    centerPref2?: string;
    centerPref3?: string;
}

export interface ResultRecord {
    id: string;
    name: string;
    prn: string;
    marks: Record<string, number>;
    internal: Record<string, number>;
    status: 'Pass' | 'Distinction' | 'ATKT' | 'Fail' | 'Pending';
    sgpa?: number;
}

export interface ScheduleEntry {
    subjectCode: string;
    course: string;
    date: string;
    time: string;
    venue: string;
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Postponed';
    students: number;
    invigilator: string;
    room: string;
}

// ── Semester Configuration ────────────────────────────────────

export const semesterData: SemesterData = {
    sem: 6,
    label: 'Semester VI (Even)',
    year: '2025-26',
    branch: 'Computer Science & Engineering',
    coreSubjects: [
        { code: 'CS601', name: 'Computer Networks', credits: 4, type: 'core', maxMarks: 100, isUniversityAssigned: true },
        { code: 'CS602', name: 'Database Management Systems', credits: 4, type: 'core', maxMarks: 100, isUniversityAssigned: true },
        { code: 'CS603', name: 'Operating Systems', credits: 4, type: 'core', maxMarks: 100, isUniversityAssigned: true },
        { code: 'CS604', name: 'Software Engineering & Project Mgmt', credits: 3, type: 'core', maxMarks: 75, isUniversityAssigned: true },
        { code: 'CS605', name: 'Artificial Intelligence & ML', credits: 3, type: 'core', maxMarks: 75, isUniversityAssigned: true },
        { code: 'CS606', name: 'Web Technologies Lab', credits: 2, type: 'lab', maxMarks: 50, isUniversityAssigned: true },
        { code: 'CS607', name: 'Computer Networks Lab', credits: 2, type: 'lab', maxMarks: 50, isUniversityAssigned: true },
    ],
    electiveGroups: [
        {
            groupId: 'DEP',
            groupName: 'Departmental Elective',
            pickCount: 1,
            options: [
                { code: 'CS651', name: 'Cloud Computing', credits: 3, type: 'elective', maxMarks: 75, isUniversityAssigned: false },
                { code: 'CS652', name: 'Cyber Security & Cryptography', credits: 3, type: 'elective', maxMarks: 75, isUniversityAssigned: false },
                { code: 'CS653', name: 'Internet of Things (IoT)', credits: 3, type: 'elective', maxMarks: 75, isUniversityAssigned: false },
                { code: 'CS654', name: 'Natural Language Processing', credits: 3, type: 'elective', maxMarks: 75, isUniversityAssigned: false },
            ],
        },
        {
            groupId: 'OE',
            groupName: 'Open Elective',
            pickCount: 1,
            options: [
                { code: 'OE601', name: 'Entrepreneurship & Innovation', credits: 2, type: 'elective', maxMarks: 50, isUniversityAssigned: false },
                { code: 'OE602', name: 'Environmental Science & Sustainability', credits: 2, type: 'elective', maxMarks: 50, isUniversityAssigned: false },
                { code: 'OE603', name: 'Digital Marketing & Analytics', credits: 2, type: 'elective', maxMarks: 50, isUniversityAssigned: false },
                { code: 'OE604', name: 'Industrial Psychology', credits: 2, type: 'elective', maxMarks: 50, isUniversityAssigned: false },
            ],
        },
    ],
};

// ── Exam Centers ─────────────────────────────────────────────

export const examCenters: ExamCenter[] = [
    { id: 'C1', name: 'Main Campus — Examination Hall A', address: '1st Floor, Main Building', city: 'Pune', state: 'Maharashtra', capacity: 300, pincode: '411001', contactPerson: 'Prof. S. Kulkarni', phone: '020-26543210' },
    { id: 'C2', name: 'Main Campus — Examination Hall B', address: 'Ground Floor, Main Building', city: 'Pune', state: 'Maharashtra', capacity: 250, pincode: '411001', contactPerson: 'Dr. A. Deshmukh', phone: '020-26543211' },
    { id: 'C3', name: 'Engineering Block — Computer Lab', address: 'Block C, 2nd Floor', city: 'Pune', state: 'Maharashtra', capacity: 120, pincode: '411002', contactPerson: 'Mr. R. Patil', phone: '020-26543215' },
    { id: 'C4', name: 'City Centre — Annex Hall', address: 'Near Station, Shivajinagar', city: 'Pune', state: 'Maharashtra', capacity: 200, pincode: '411005', contactPerson: 'Mrs. P. Joshi', phone: '020-25421100' },
    { id: 'C5', name: 'North Campus — Seminar Complex', address: 'Nashik Road Campus', city: 'Nashik', state: 'Maharashtra', capacity: 180, pincode: '422001', contactPerson: 'Prof. M. Thakur', phone: '0253-2341234' },
    { id: 'C6', name: 'South Annexe — Multi Purpose Hall', address: 'Hadapsar Campus', city: 'Pune', state: 'Maharashtra', capacity: 160, pincode: '411028', contactPerson: 'Dr. K. Shah', phone: '020-26980001' },
];

// ── Students ─────────────────────────────────────────────────

export const admitCardStudents: StudentRecord[] = [
    { id: 'STU001', name: 'Rahul Sharma', prn: '2021CSE001', dept: 'CSE', sem: 6, rollNo: 'A01', category: 'General', status: 'Pending', center: 'Hall A', centerPref1: 'C1', centerPref2: 'C2', centerPref3: 'C4' },
    { id: 'STU002', name: 'Priya Patel', prn: '2021CSE002', dept: 'CSE', sem: 6, rollNo: 'A02', category: 'OBC', status: 'Approved', center: 'Hall B', centerPref1: 'C2', centerPref2: 'C1', centerPref3: 'C3' },
    { id: 'STU003', name: 'Amit Kumar', prn: '2021CSE003', dept: 'CSE', sem: 6, rollNo: 'A03', category: 'SC', status: 'Released', center: 'Hall A', centerPref1: 'C1', centerPref2: 'C3', centerPref3: 'C2' },
    { id: 'STU004', name: 'Sneha Singh', prn: '2021CSE004', dept: 'CSE', sem: 6, rollNo: 'A04', category: 'General', status: 'Pending', center: 'Hall B', centerPref1: 'C2', centerPref2: 'C4', centerPref3: 'C1' },
    { id: 'STU005', name: 'Vikram Joshi', prn: '2021CSE005', dept: 'CSE', sem: 6, rollNo: 'A05', category: 'ST', status: 'Released', center: 'Lab', centerPref1: 'C3', centerPref2: 'C1', centerPref3: 'C2' },
    { id: 'STU006', name: 'Ananya Iyer', prn: '2021CSE006', dept: 'CSE', sem: 6, rollNo: 'A06', category: 'General', status: 'Approved', center: 'Hall A', centerPref1: 'C1', centerPref2: 'C2', centerPref3: 'C5' },
];

// ── Results ──────────────────────────────────────────────────

export const resultData: ResultRecord[] = [
    {
        id: 'STU001', name: 'Rahul Sharma', prn: '2021CSE001',
        marks: { CS601: 82, CS602: 76, CS603: 88, CS604: 79, CS605: 91, CS606: 45, CS607: 46, CS651: 74 },
        internal: { CS601: 22, CS602: 21, CS603: 23, CS604: 20, CS605: 24, CS606: 0, CS607: 0, CS651: 20 },
        status: 'Pass', sgpa: 7.8,
    },
    {
        id: 'STU002', name: 'Priya Patel', prn: '2021CSE002',
        marks: { CS601: 94, CS602: 91, CS603: 96, CS604: 87, CS605: 90, CS606: 49, CS607: 48, CS651: 88 },
        internal: { CS601: 25, CS602: 25, CS603: 25, CS604: 23, CS605: 24, CS606: 0, CS607: 0, CS651: 24 },
        status: 'Distinction', sgpa: 9.4,
    },
    {
        id: 'STU003', name: 'Amit Kumar', prn: '2021CSE003',
        marks: { CS601: 55, CS602: 48, CS603: 62, CS604: 50, CS605: 57, CS606: 42, CS607: 41, CS651: 52 },
        internal: { CS601: 18, CS602: 17, CS603: 20, CS604: 16, CS605: 18, CS606: 0, CS607: 0, CS651: 17 },
        status: 'Pass', sgpa: 6.2,
    },
    {
        id: 'STU004', name: 'Sneha Singh', prn: '2021CSE004',
        marks: { CS601: 38, CS602: 72, CS603: 65, CS604: 70, CS605: 60, CS606: 44, CS607: 43, CS651: 65 },
        internal: { CS601: 15, CS602: 22, CS603: 21, CS604: 21, CS605: 20, CS606: 0, CS607: 0, CS651: 19 },
        status: 'ATKT', sgpa: 5.9,
    },
];

// ── Schedule ─────────────────────────────────────────────────

export const schedule: ScheduleEntry[] = [
    { subjectCode: 'CS601', course: 'Computer Networks (CS601)', date: 'Oct 24, 2026', time: '10:00 AM', venue: 'Hall A', status: 'Scheduled', students: 240, invigilator: 'Dr. B. Nair', room: 'Room 101, 102' },
    { subjectCode: 'CS602', course: 'Database Management Systems (CS602)', date: 'Oct 26, 2026', time: '02:00 PM', venue: 'Hall B', status: 'In Progress', students: 238, invigilator: 'Prof. C. Iyer', room: 'Room 201, 202' },
    { subjectCode: 'CS603', course: 'Operating Systems (CS603)', date: 'Oct 28, 2026', time: '10:00 AM', venue: 'Hall A', status: 'Completed', students: 241, invigilator: 'Dr. M. Singh', room: 'Room 101, 102' },
    { subjectCode: 'CS604', course: 'Software Engineering (CS604)', date: 'Oct 30, 2026', time: '10:00 AM', venue: 'Hall B', status: 'Scheduled', students: 240, invigilator: 'Prof. S. Roy', room: 'Room 301' },
    { subjectCode: 'CS605', course: 'Artificial Intelligence & ML (CS605)', date: 'Nov 01, 2026', time: '02:00 PM', venue: 'Hall A', status: 'Scheduled', students: 235, invigilator: 'Dr. A. Kumar', room: 'Room 101' },
    { subjectCode: 'CS606', course: 'Web Technologies Lab (CS606)', date: 'Nov 03, 2026', time: '10:00 AM', venue: 'Lab', status: 'Scheduled', students: 120, invigilator: 'Mr. P. Sharma', room: 'CL-1, CL-2' },
    { subjectCode: 'CS607', course: 'Computer Networks Lab (CS607)', date: 'Nov 05, 2026', time: '10:00 AM', venue: 'Lab', status: 'Scheduled', students: 118, invigilator: 'Mrs. R. Gupta', room: 'CL-3' },
    { subjectCode: 'CS651', course: 'Cloud Computing — Elective (CS651)', date: 'Nov 07, 2026', time: '02:00 PM', venue: 'Hall B', status: 'Scheduled', students: 195, invigilator: 'Dr. V. Joshi', room: 'Room 201' },
];

// ── Question Bank ─────────────────────────────────────────────

export type QuestionType = 'objective' | 'subjective' | 'multiple-answer';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface BankQuestion {
    id: string;
    code: string;          // e.g. CS601-Q001
    paperCode: string;     // e.g. CS601
    text: string;
    image?: string;        // optional URL / base64
    type: QuestionType;
    difficulty: Difficulty;
    marks: number;
    negativeMarks?: number;
    options?: string[];                  // objective / multiple-answer
    correctAnswer?: string | string[];   // string for objective, string[] for multiple-answer
    unit?: string;                       // unit/topic tag
    addedBy?: string;
    addedOn?: string;
}

// Dummy question bank data ────────────────────────────────────

export const questionBank: BankQuestion[] = [
    // CS601 — Computer Networks
    {
        id: 'Q0001', code: 'CS601-Q001', paperCode: 'CS601',
        text: 'Which layer of the OSI model is responsible for end-to-end communication?',
        type: 'objective', difficulty: 'easy', marks: 1, negativeMarks: 0.25,
        options: ['Network Layer', 'Transport Layer', 'Session Layer', 'Data Link Layer'],
        correctAnswer: 'Transport Layer',
        unit: 'OSI Model', addedBy: 'Dr. B. Nair', addedOn: '2026-01-10',
    },
    {
        id: 'Q0002', code: 'CS601-Q002', paperCode: 'CS601',
        text: 'TCP uses a __________ connection before transferring data.',
        type: 'objective', difficulty: 'easy', marks: 1, negativeMarks: 0.25,
        options: ['Two-way', 'Three-way handshake', 'Four-way', 'One-way'],
        correctAnswer: 'Three-way handshake',
        unit: 'TCP/IP', addedBy: 'Dr. B. Nair', addedOn: '2026-01-10',
    },
    {
        id: 'Q0003', code: 'CS601-Q003', paperCode: 'CS601',
        text: 'Which of the following are connection-oriented protocols? (Select all that apply)',
        type: 'multiple-answer', difficulty: 'medium', marks: 2, negativeMarks: 0.5,
        options: ['TCP', 'UDP', 'HTTP/2 over QUIC', 'SCTP'],
        correctAnswer: ['TCP', 'SCTP'],
        unit: 'Transport Layer', addedBy: 'Dr. B. Nair', addedOn: '2026-01-11',
    },
    {
        id: 'Q0004', code: 'CS601-Q004', paperCode: 'CS601',
        text: 'Explain the concept of subnetting and calculate the number of usable hosts in a /26 subnet.',
        type: 'subjective', difficulty: 'hard', marks: 8,
        unit: 'IP Addressing', addedBy: 'Dr. B. Nair', addedOn: '2026-01-12',
    },
    {
        id: 'Q0005', code: 'CS601-Q005', paperCode: 'CS601',
        text: 'What is the difference between circuit switching and packet switching? Explain with a diagram.',
        type: 'subjective', difficulty: 'medium', marks: 6,
        unit: 'Network Fundamentals', addedBy: 'Prof. C. Iyer', addedOn: '2026-01-15',
    },
    // CS602 — Database Management Systems
    {
        id: 'Q0006', code: 'CS602-Q001', paperCode: 'CS602',
        text: 'Which normal form eliminates transitive dependencies?',
        type: 'objective', difficulty: 'easy', marks: 1, negativeMarks: 0.25,
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correctAnswer: '3NF',
        unit: 'Normalization', addedBy: 'Prof. C. Iyer', addedOn: '2026-01-14',
    },
    {
        id: 'Q0007', code: 'CS602-Q002', paperCode: 'CS602',
        text: 'SELECT clause is used to __________ data from a table.',
        type: 'objective', difficulty: 'easy', marks: 1, negativeMarks: 0.25,
        options: ['insert', 'update', 'retrieve', 'delete'],
        correctAnswer: 'retrieve',
        unit: 'SQL', addedBy: 'Prof. C. Iyer', addedOn: '2026-01-14',
    },
    {
        id: 'Q0008', code: 'CS602-Q003', paperCode: 'CS602',
        text: 'Which of the following are properties of a transaction? (Select all that apply)',
        type: 'multiple-answer', difficulty: 'medium', marks: 2, negativeMarks: 0.5,
        options: ['Atomicity', 'Consistency', 'Durability', 'Distributability'],
        correctAnswer: ['Atomicity', 'Consistency', 'Durability'],
        unit: 'Transactions', addedBy: 'Prof. C. Iyer', addedOn: '2026-01-15',
    },
    {
        id: 'Q0009', code: 'CS602-Q004', paperCode: 'CS602',
        text: 'Describe the steps involved in query processing and optimization in a DBMS.',
        type: 'subjective', difficulty: 'hard', marks: 10,
        unit: 'Query Processing', addedBy: 'Dr. A. Deshmukh', addedOn: '2026-01-17',
    },
    // CS603 — Operating Systems
    {
        id: 'Q0010', code: 'CS603-Q001', paperCode: 'CS603',
        text: 'Which scheduling algorithm gives minimum average waiting time?',
        type: 'objective', difficulty: 'medium', marks: 1, negativeMarks: 0.25,
        options: ['FCFS', 'Round Robin', 'SJF', 'Priority'],
        correctAnswer: 'SJF',
        unit: 'CPU Scheduling', addedBy: 'Dr. M. Singh', addedOn: '2026-01-20',
    },
    {
        id: 'Q0011', code: 'CS603-Q002', paperCode: 'CS603',
        text: 'Deadlock can be prevented by breaking which of the following conditions? (Select all that apply)',
        type: 'multiple-answer', difficulty: 'hard', marks: 3, negativeMarks: 1,
        options: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait'],
        correctAnswer: ['Hold and Wait', 'No Preemption', 'Circular Wait'],
        unit: 'Deadlock', addedBy: 'Dr. M. Singh', addedOn: '2026-01-21',
    },
    {
        id: 'Q0012', code: 'CS603-Q003', paperCode: 'CS603',
        text: 'With a suitable diagram, explain the concept of virtual memory and demand paging.',
        type: 'subjective', difficulty: 'hard', marks: 10,
        unit: 'Memory Management', addedBy: 'Dr. M. Singh', addedOn: '2026-01-22',
    },
    // CS605 — AI & ML
    {
        id: 'Q0013', code: 'CS605-Q001', paperCode: 'CS605',
        text: 'Which search algorithm is both complete and optimal?',
        type: 'objective', difficulty: 'medium', marks: 1, negativeMarks: 0.25,
        options: ['DFS', 'BFS', 'A*', 'Hill Climbing'],
        correctAnswer: 'A*',
        unit: 'Search', addedBy: 'Dr. A. Kumar', addedOn: '2026-01-25',
    },
    {
        id: 'Q0014', code: 'CS605-Q002', paperCode: 'CS605',
        text: 'Explain the working of the backpropagation algorithm in neural networks with an example.',
        type: 'subjective', difficulty: 'hard', marks: 10,
        unit: 'Neural Networks', addedBy: 'Dr. A. Kumar', addedOn: '2026-01-26',
    },
];

// Paper codes available for question bank
export const paperCodes: { code: string; name: string }[] = [
    { code: 'CS601', name: 'Computer Networks' },
    { code: 'CS602', name: 'Database Management Systems' },
    { code: 'CS603', name: 'Operating Systems' },
    { code: 'CS604', name: 'Software Engineering & Project Mgmt' },
    { code: 'CS605', name: 'Artificial Intelligence & ML' },
    { code: 'CS651', name: 'Cloud Computing' },
    { code: 'CS652', name: 'Cyber Security & Cryptography' },
];


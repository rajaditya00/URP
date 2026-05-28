const Course = require('../models/Course');
const LockerDoc = require('../models/LockerDoc');

// GET all courses
exports.getCourses = async (req, res) => {
  try {
    const universityId = req.user.university;
    let courses = await Course.find({ university: universityId });
    
    // Auto-seed if blank
    if (courses.length === 0) {
      await seedCurriculumData(universityId);
      courses = await Course.find({ university: universityId });
    }
    
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE a course
exports.createCourse = async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      university: req.user.university
    });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE a course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Not found' });
    if (course.university.toString() !== req.user.university.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    await course.deleteOne();
    res.status(200).json({ message: 'Course removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SEED dynamic 8-semester curriculum
exports.seedCurriculum = async (req, res) => {
  try {
    const universityId = req.user.university;
    await Course.deleteMany({ university: universityId });
    await seedCurriculumData(universityId);
    const courses = await Course.find({ university: universityId });
    res.status(200).json({ message: 'Dynamic 8-Semester Curriculum Seeded!', courses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET locker documents
exports.getLockerDocs = async (req, res) => {
  try {
    const userId = req.user._id;
    let docs = await LockerDoc.find({ user: userId });
    
    // Auto-seed locker documents if empty
    if (docs.length === 0) {
      const initialDocs = [
        { user: userId, name: 'Digitized Transcript (Sem 5)', category: 'sem5', status: 'verified' },
        { user: userId, name: 'Bonafide Student Certificate', category: 'bonafide', status: 'verified' },
        { user: userId, name: 'No Dues Accounts clearance', category: 'nodues', status: 'processing' },
        { user: userId, name: 'Official Academic Transcript', category: 'transcript', status: 'requestable' }
      ];
      await LockerDoc.insertMany(initialDocs);
      docs = await LockerDoc.find({ user: userId });
    }
    
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REQUEST locker document
exports.requestLockerDoc = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category } = req.body;
    
    const doc = await LockerDoc.findOneAndUpdate(
      { user: userId, category },
      { status: 'processing', lastUpdated: Date.now() },
      { new: true }
    );
    
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Request submitted successfully!', doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper: Seed curriculum data array
async function seedCurriculumData(universityId) {
  const seedCourses = [
    // Semester 1
    { title: 'Engineering Mathematics I', code: 'MA101', department: 'Computer Science', credits: 4, semester: 'Semester 1', faculty: 'Dr. Alan Turing', status: 'Completed', result: 'A', gpa: '8.5', topics: ['Calculus', 'Matrices', 'Vector Algebra', 'Differential Equations'] },
    { title: 'Engineering Physics', code: 'PH101', department: 'Computer Science', credits: 4, semester: 'Semester 1', faculty: 'Prof. Grace Hopper', status: 'Completed', result: 'A+', topics: ['Quantum Mechanics', 'Wave Optics', 'Electromagnetism', 'Semiconductors'] },
    { title: 'Programming in C', code: 'CS101', department: 'Computer Science', credits: 3, semester: 'Semester 1', faculty: 'Dr. Linus Torvalds', status: 'Completed', result: 'B+', topics: ['Basics', 'Control Structures', 'Arrays & Pointers', 'Structures & Files'] },
    
    // Semester 2
    { title: 'Engineering Mathematics II', code: 'MA201', department: 'Computer Science', credits: 4, semester: 'Semester 2', faculty: 'Dr. Alan Turing', status: 'Completed', result: 'B', gpa: '8.2', topics: ['Linear Algebra', 'Complex Variables', 'Fourier Series', 'Laplace Transforms'] },
    { title: 'Basic Electronics', code: 'EC201', department: 'Computer Science', credits: 3, semester: 'Semester 2', faculty: 'Prof. Grace Hopper', status: 'Completed', result: 'A', topics: ['Diodes', 'Transistors', 'Operational Amplifiers', 'Digital Logic'] },
    { title: 'Engineering Graphics', code: 'ME201', department: 'Computer Science', credits: 3, semester: 'Semester 2', faculty: 'Dr. Margaret Hamilton', status: 'Completed', result: 'A+', topics: ['Orthographic Projections', 'Isometric Views', 'CAD Basics', 'Sectional Views'] },
    
    // Semester 3
    { title: 'Data Structures & Algorithms', code: 'CS301', department: 'Computer Science', credits: 4, semester: 'Semester 3', faculty: 'Dr. Alan Turing', status: 'Completed', result: 'A+', gpa: '8.8', topics: ['Linked Lists', 'Trees & Graphs', 'Sorting & Searching', 'Hashing Techniques'] },
    { title: 'Computer Organization', code: 'CS302', department: 'Computer Science', credits: 3, semester: 'Semester 3', faculty: 'Prof. John von Neumann', status: 'Completed', result: 'A', topics: ['Register Transfer', 'Microoperations', 'CPU Architecture', 'Memory Organization'] },
    { title: 'Discrete Mathematics', code: 'CS303', department: 'Computer Science', credits: 3, semester: 'Semester 3', faculty: 'Dr. Alonzo Church', status: 'Completed', result: 'B+', topics: ['Set Theory', 'Mathematical Logic', 'Graph Theory', 'Relations & Functions'] },
    
    // Semester 4
    { title: 'Database Management Systems', code: 'CS401', department: 'Computer Science', credits: 4, semester: 'Semester 4', faculty: 'Prof. Edgar F. Codd', status: 'Completed', result: 'A+', gpa: '8.9', topics: ['Relational Algebra', 'SQL Queries', 'Normalization', 'Concurrency Control'] },
    { title: 'Theory of Computation', code: 'CS402', department: 'Computer Science', credits: 3, semester: 'Semester 4', faculty: 'Dr. Alan Turing', status: 'Completed', result: 'A', topics: ['Finite Automata', 'Regular Languages', 'Turing Machines', 'Decidability'] },
    { title: 'System Programming', code: 'CS403', department: 'Computer Science', credits: 3, semester: 'Semester 4', faculty: 'Dr. Dennis Ritchie', status: 'Completed', result: 'A+', topics: ['Assemblers', 'Linkers & Loaders', 'Compiler Phases', 'Device Drivers'] },
    
    // Semester 5
    { title: 'Design and Analysis of Algorithms', code: 'CS501', department: 'Computer Science', credits: 4, semester: 'Semester 5', faculty: 'Dr. Donald Knuth', status: 'Completed', result: 'A', gpa: '9.0', topics: ['Divide & Conquer', 'Dynamic Programming', 'Greedy Algorithms', 'NP-Completeness'] },
    { title: 'Computer Networks', code: 'CS502', department: 'Computer Science', credits: 4, semester: 'Semester 5', faculty: 'Dr. Vint Cerf', status: 'Completed', result: 'A+', topics: ['Physical Layer', 'Data Link Protocol', 'Routing Algorithms', 'Security Protocols'] },
    { title: 'Object Oriented Programming', code: 'CS503', department: 'Computer Science', credits: 3, semester: 'Semester 5', faculty: 'Dr. Bjarne Stroustrup', status: 'Completed', result: 'A', topics: ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Exception Handling'] },
    
    // Semester 6
    { title: 'Computer Networks', code: 'CS601', department: 'Computer Science', credits: 4, semester: 'Semester 6', faculty: 'Dr. Alan Turing', status: 'Ongoing', progress: 75, topics: ['OSI Model', 'TCP/IP Protocol', 'Routing Algorithms', 'Network Security', 'Wireless LANs', 'Socket Programming'] },
    { title: 'Database Management Systems', code: 'CS602', department: 'Computer Science', credits: 4, semester: 'Semester 6', faculty: 'Prof. Grace Hopper', status: 'Ongoing', progress: 92, topics: ['Relational Model', 'SQL Queries', 'Normalization', 'Transaction Control', 'Concurrency', 'NoSQL Basics'] },
    { title: 'Operating Systems', code: 'CS603', department: 'Computer Science', credits: 3, semester: 'Semester 6', faculty: 'Dr. Linus Torvalds', status: 'Ongoing', progress: 60, topics: ['Process Management', 'Memory Allocation', 'File Systems', 'Virtualization', 'Deadlocks', 'I/O Systems'] },
    { title: 'Cloud Computing Infrastructure', code: 'CS604', department: 'Computer Science', credits: 3, semester: 'Semester 6', faculty: 'Prof. Satya Nadella', status: 'Ongoing', progress: 45, topics: ['SaaS/PaaS/IaaS', 'Virtual Machines', 'Serverless', 'Microservices', 'AWS/Azure Tools', 'Cloud Security'] },
    { title: 'Software Engineering & Design', code: 'CS605', department: 'Computer Science', credits: 4, semester: 'Semester 6', faculty: 'Dr. Margaret Hamilton', status: 'Ongoing', progress: 80, topics: ['Agile Methodology', 'UML Diagrams', 'Software Testing', 'DevOps', 'SDLC Models', 'System Design'] },
    
    // Semester 7
    { title: 'Machine Learning', code: 'CS701', department: 'Computer Science', credits: 4, semester: 'Semester 7', faculty: 'Dr. Andrew Ng', status: 'Ongoing', progress: 0, topics: ['Regression', 'Classification', 'Neural Networks', 'SVM', 'Unsupervised Learning'] },
    { title: 'Compiler Design', code: 'CS702', department: 'Computer Science', credits: 3, semester: 'Semester 7', faculty: 'Dr. Alfred Aho', status: 'Ongoing', progress: 0, topics: ['Lexical Analysis', 'Parsing', 'Intermediate Code', 'Code Generation'] },
    { title: 'Cryptography & Security', code: 'CS703', department: 'Computer Science', credits: 3, semester: 'Semester 7', faculty: 'Dr. Adi Shamir', status: 'Ongoing', progress: 0, topics: ['Symmetric Cipher', 'Asymmetric Cipher', 'Digital Signatures', 'Hashing'] },
    
    // Semester 8
    { title: 'Distributed Systems', code: 'CS801', department: 'Computer Science', credits: 4, semester: 'Semester 8', faculty: 'Dr. Leslie Lamport', status: 'Ongoing', progress: 0, topics: ['Consensus Protocols', 'RPC', 'Replication', 'Distributed Storage'] },
    { title: 'Full-Stack Web Development', code: 'CS802', department: 'Computer Science', credits: 4, semester: 'Semester 8', faculty: 'Prof. Tim Berners-Lee', status: 'Ongoing', progress: 0, topics: ['React', 'Node.js', 'MongoDB', 'REST APIs', 'JWT Auth'] },
    { title: 'Major Project / Capstone', code: 'CS803', department: 'Computer Science', credits: 6, semester: 'Semester 8', faculty: 'Dr. Margaret Hamilton', status: 'Ongoing', progress: 0, topics: ['Requirements', 'System Design', 'Implementation', 'Testing & Deployment'] }
  ];
  
  const formattedCourses = seedCourses.map(c => ({ ...c, university: universityId }));
  await Course.insertMany(formattedCourses);
}

const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');
const Question = require('../models/Question');

// @desc    Create/Allot a new assignment using selected questions
// @route   POST /api/assignments
// @access  Private (Professor only)
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, questions, department, semester, classSession } = req.body;

    if (!title || !dueDate || !questions || !Array.isArray(questions) || questions.length === 0 || !department || !semester) {
      return res.status(400).json({ error: 'Please provide all required fields, including at least one selected question' });
    }

    const assignment = await Assignment.create({
      faculty: req.user._id,
      college: req.user.college,
      department,
      semester,
      title,
      description,
      dueDate: new Date(dueDate),
      questions,
      classSession: classSession || undefined
    });

    // Notify students of allotted assignment
    try {
      await Notification.create({
        college: req.user.college,
        recipientType: 'DEPARTMENT',
        recipientDept: department,
        recipientSem: semester,
        title: `New Assignment: ${title}`,
        message: `Professor ${req.user.name} has allotted a new assignment: "${title}". Due date: ${new Date(dueDate).toLocaleDateString()}.`,
        type: 'Schedule',
        referenceId: String(assignment._id)
      });
    } catch (notifErr) {
      console.error('Failed to create notification for allotted assignment:', notifErr.message);
    }

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    console.error('Create assignment error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private (Professor or Student)
exports.getAssignments = async (req, res) => {
  try {
    let query = { college: req.user.college };

    if (req.user.role === 'PROFESSOR' || req.user.role === 'STAFF') {
      query.faculty = req.user._id;
    } else if (req.user.role === 'STUDENT') {
      query.department = req.user.department;
      query.semester = req.user.semester;
    }

    const assignments = await Assignment.find(query)
      .populate('faculty', 'name email')
      .populate('questions')
      .populate('submissions.student', 'name rollNo email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: assignments });
  } catch (err) {
    console.error('Get assignments error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Submit answers for an assignment
// @route   PUT /api/assignments/:id/submit
// @access  Private (Student only)
exports.submitAssignment = async (req, res) => {
  try {
    const { answers, submittedText } = req.body;
    
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user is a student in the same department/semester
    if (req.user.role !== 'STUDENT' || req.user.department !== assignment.department || req.user.semester !== assignment.semester) {
      return res.status(403).json({ error: 'Not authorized to submit this assignment' });
    }

    // Check if student already submitted, if so overwrite or update
    const existingIndex = assignment.submissions.findIndex(
      sub => String(sub.student) === String(req.user._id)
    );

    const submissionData = {
      student: req.user._id,
      answers: answers || [],
      submittedText: submittedText || '',
      submittedAt: Date.now(),
      grade: 'Pending',
      feedback: ''
    };

    if (existingIndex > -1) {
      // Overwrite/Update existing submission
      assignment.submissions[existingIndex] = submissionData;
    } else {
      // Append new submission
      assignment.submissions.push(submissionData);
    }

    await assignment.save();

    // Populate and return updated assignment
    assignment = await Assignment.findById(req.params.id)
      .populate('faculty', 'name email')
      .populate('questions')
      .populate('submissions.student', 'name rollNo email');

    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    console.error('Submit assignment error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc    Grade a student submission
// @route   PUT /api/assignments/:id/grade/:submissionId
// @access  Private (Professor only)
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;

    if (!grade) {
      return res.status(400).json({ error: 'Please specify a grade' });
    }

    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify ownership
    if (String(assignment.faculty) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to grade this assignment' });
    }

    const sub = assignment.submissions.id(req.params.submissionId);

    if (!sub) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    sub.grade = grade;
    sub.feedback = feedback || '';
    await assignment.save();

    // Notify the individual student that their assignment has been graded
    try {
      await Notification.create({
        college: req.user.college,
        recipientType: 'STUDENT',
        recipientStudent: sub.student,
        title: `Assignment Graded: ${assignment.title}`,
        message: `Professor ${req.user.name} graded your assignment "${assignment.title}". Grade: "${grade}".`,
        type: 'Schedule',
        referenceId: String(assignment._id)
      });
    } catch (notifErr) {
      console.error('Failed to notify student of graded assignment:', notifErr.message);
    }

    assignment = await Assignment.findById(req.params.id)
      .populate('faculty', 'name email')
      .populate('questions')
      .populate('submissions.student', 'name rollNo email');

    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    console.error('Grade submission error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

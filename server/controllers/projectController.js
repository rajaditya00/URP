const Project = require('../models/Project');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper to analyze stack and status to determine Project Skills Credits
const analyzeProjectCredits = (stack, status) => {
    let credits = 2; // base credits
    
    // Status boost
    if (status === 'Completed') {
        credits += 2;
    } else {
        credits += 1;
    }

    // Stack complexity analysis
    const lowStack = stack.toLowerCase();
    const complexKeywords = ['raft', 'consensus', 'pytorch', 'tensorflow', 'opencv', 'grpc', 'kubernetes', 'docker', 'golang', 'rust', 'microservices', 'compiler', 'distributed', 'blockchain', 'neural network', 'deep learning', 'machine learning'];
    
    let matches = 0;
    complexKeywords.forEach(kw => {
        if (lowStack.includes(kw)) {
            matches++;
        }
    });

    if (matches > 1) {
        credits += 2;
    } else if (matches === 1) {
        credits += 1;
    }

    return Math.min(credits, 8); // max 8 credits per project
};

// Helper to analyze achievement to determine Achievement Skills Credits
const analyzeAchievementCredits = (title, org) => {
    const lowTitle = title.toLowerCase();
    const lowOrg = org.toLowerCase();

    // Cloud & Industry giants get higher weightage
    const premiumProviders = ['aws', 'amazon', 'google', 'microsoft', 'azure', 'nvidia', 'red hat', 'cisco', 'oracle', 'ibm', 'hackerank', 'leetcode', 'coursera', 'udacity'];
    
    let isPremium = false;
    premiumProviders.forEach(prov => {
        if (lowTitle.includes(prov) || lowOrg.includes(prov)) {
            isPremium = true;
        }
    });

    if (isPremium) {
        if (lowTitle.includes('architect') || lowTitle.includes('engineer') || lowTitle.includes('expert') || lowTitle.includes('professional')) {
            return 6;
        }
        return 4;
    }
    return 3; // Standard achievement credits
};

exports.getStudentData = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find projects and achievements for the logged-in student
        let projects = await Project.find({ user: userId }).sort({ createdAt: -1 });
        let achievements = await Achievement.find({ user: userId }).sort({ createdAt: -1 });

        // Seed default projects/achievements if none exist to make it look alive initially
        if (projects.length === 0 && achievements.length === 0) {
            const defaultProjs = [
                {
                    user: userId,
                    name: 'Distributed Key-Value Store',
                    stack: 'Go, Raft Consensus, gRPC',
                    desc: 'A fault-tolerant distributed transactional database implemented in Go using Raft consensus.',
                    status: 'Completed',
                    feedback: 'Stellar work on consensus log compaction! - Dr. Vijay Kumar',
                    skillsCredits: 6
                },
                {
                    user: userId,
                    name: 'Autonomous Drone Obstacle Detection',
                    stack: 'Python, OpenCV, PyTorch, ROS',
                    desc: 'Real-time object detection and path routing utilizing stereoscopic depth mapping.',
                    status: 'In Progress',
                    feedback: '',
                    skillsCredits: 4
                }
            ];

            const defaultAchs = [
                {
                    user: userId,
                    title: 'AWS Solutions Architect Associate',
                    org: 'Amazon Web Services',
                    date: '2025-08-14',
                    skillsCredits: 6
                },
                {
                    user: userId,
                    title: 'Google Associate Cloud Engineer',
                    org: 'Google Cloud Platform',
                    date: '2026-02-19',
                    skillsCredits: 6
                }
            ];

            projects = await Project.insertMany(defaultProjs);
            achievements = await Achievement.insertMany(defaultAchs);
        }

        const projectCredits = projects.reduce((sum, p) => sum + (p.skillsCredits || 0), 0);
        const achievementCredits = achievements.reduce((sum, a) => sum + (a.skillsCredits || 0), 0);
        const totalSkillsCredits = projectCredits + achievementCredits;

        res.status(200).json({
            projects,
            achievements,
            totalSkillsCredits
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addProject = async (req, res) => {
    try {
        const { name, stack, desc, status, mentor } = req.body;
        const userId = req.user.id;

        const skillsCredits = analyzeProjectCredits(stack, status);

        const project = new Project({
            user: userId,
            name,
            stack,
            desc,
            status,
            skillsCredits,
            feedback: '', // Faculty feedback initially empty
            mentor: mentor || undefined
        });

        await project.save();

        // Dynamically assign student's primary mentor on project upload
        if (mentor) {
            await User.findByIdAndUpdate(userId, { mentor });
        }

        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addAchievement = async (req, res) => {
    try {
        const { title, org, date } = req.body;
        const userId = req.user.id;

        const skillsCredits = analyzeAchievementCredits(title, org);

        const achievement = new Achievement({
            user: userId,
            title,
            org,
            date,
            skillsCredits
        });

        await achievement.save();
        res.status(201).json(achievement);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMentoredStudents = async (req, res) => {
    try {
        const mentorId = req.user.id || req.user._id;
        // Query students assigned specifically to this mentor
        let students = await User.find({ role: 'STUDENT', mentor: mentorId }).select('-password');

        // Fallback: If no explicit mentees, show all students in the college/university
        if (students.length === 0) {
            const query = { role: 'STUDENT' };
            if (req.user.college) {
                query.college = req.user.college;
            } else if (req.user.university) {
                query.university = req.user.university;
            }
            students = await User.find(query).select('-password');
        }
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStudentProjects = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const projects = await Project.find({ user: studentId }).populate('mentor', 'name email department').sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.evaluateProject = async (req, res) => {
    try {
        const { projectId, feedback, skillsCredits } = req.body;
        const project = await Project.findById(projectId).populate('mentor', 'name');
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const mentorName = project.mentor?.name || req.user?.name || 'Mentor';
        const isFirstEval = !project.creditsLocked;

        // Lock credits only on first evaluation; ignore credit changes after that
        if (isFirstEval && skillsCredits !== undefined) {
            project.skillsCredits = Number(skillsCredits);
            project.creditsLocked = true;
        }

        // Always allow new feedback entry to be appended
        if (feedback && feedback.trim()) {
            project.feedback = feedback; // update latest feedback (legacy compat)
            project.feedbackHistory.push({
                text: feedback.trim(),
                byName: mentorName,
                at: new Date()
            });
        }

        await project.save();

        // Notify the student
        try {
            const student = await User.findById(project.user);
            if (student) {
                const Notification = require('../models/Notification');
                const notification = new Notification({
                    college: student.college,
                    recipientType: 'STUDENT',
                    recipientStudent: student._id,
                    title: isFirstEval ? 'Project Evaluated' : 'New Mentor Feedback',
                    message: isFirstEval
                        ? `Your project "${project.name}" has been evaluated. Skill Credits Awarded: ${project.skillsCredits} pts.`
                        : `Your mentor left new feedback on your project "${project.name}".`,
                    type: 'Project',
                    referenceId: project._id.toString()
                });
                await notification.save();
            }
        } catch (notifErr) {
            console.error('Failed to save project evaluation notification:', notifErr.message);
        }

        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCollegeMentors = async (req, res) => {
    try {
        const query = { role: { $in: ['PROFESSOR', 'STAFF'] } };
        if (req.user.college) {
            query.college = req.user.college;
        } else if (req.user.university) {
            query.university = req.user.university;
        }
        const mentors = await User.find(query).select('name email department position');
        res.json(mentors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

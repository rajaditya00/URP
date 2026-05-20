const Question = require('../models/Question');

// Seed engineering questions across all departments if database is empty or has old seeds
const seedEngineeringQuestions = async () => {
  // Let's clear out any old pre-seeded questions without sourceUniversity to ensure fresh seed matches
  await Question.deleteMany({ sourceUniversity: { $exists: false } });

  const count = await Question.countDocuments();
  // If we have some old data, let's clean it up to ensure it matches the new, larger, premier Indian University list!
  if (count > 15) return;

  await Question.deleteMany({}); // Start clean with the ultimate Indian Technical Universities Semester PYQ database!

  const seedData = [
    // --- AKTU Semester Exams ---
    { text: "Derive the mathematical equation for one-dimensional heat conduction in a composite cylinder wall under steady-state conditions.", code: "ME-301", department: "Mechanical Engineering", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 5, sourceUniversity: "AKTU Lucknow (Semester VII PYQ)" },
    { text: "Explain the working of a 4-bit synchronous up/down counter using JK Flip-Flops and derive the state transition table.", code: "EC-202", department: "Electrical Engineering", difficulty: "medium", type: "subjective", marks: 10, creditLevel: 3, sourceUniversity: "AKTU Lucknow (Semester IV PYQ)" },
    { text: "What is database normalization? Explain 1NF, 2NF, 3NF, and BCNF with concrete instances.", code: "CS-301", department: "Computer Science", difficulty: "medium", type: "subjective", marks: 10, creditLevel: 3, sourceUniversity: "AKTU Lucknow (Semester V PYQ)" },
    { text: "Design a Turing machine that accepts the language L = {a^n b^n c^n | n >= 1} and draw the complete transition graph.", code: "CS-402", department: "Computer Science", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 5, sourceUniversity: "AKTU Lucknow (Semester VI PYQ)" },

    // --- VTU Semester Exams ---
    { text: "Formulate the ultimate load-carrying capacity of a shallow rectangular foundation using Terzaghi's theory.", code: "CE-401", department: "Civil Engineering", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 5, sourceUniversity: "VTU Belagavi (Semester VIII PYQ)" },
    { text: "State and prove the Superposition Theorem as applied to alternating current electrical circuits.", code: "EE-205", department: "Electrical Engineering", difficulty: "medium", type: "subjective", marks: 10, creditLevel: 3, sourceUniversity: "VTU Belagavi (Semester III PYQ)" },
    { text: "Differentiate between statically determinate and indeterminate structural beams with suitable sketches.", code: "CE-202", department: "Civil Engineering", difficulty: "easy", type: "subjective", marks: 5, creditLevel: 2, sourceUniversity: "VTU Belagavi (Semester IV PYQ)" },
    { text: "Determine the critical speed of a shaft carrying a single rotor with and without damping conditions.", code: "ME-404", department: "Mechanical Engineering", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 5, sourceUniversity: "VTU Belagavi (Semester VII PYQ)" },

    // --- Anna University Semester Exams ---
    { text: "Explain the McCabe-Thiele method for calculating the number of theoretical stages in distillation columns.", code: "CH-302", department: "Chemical Engineering", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 4, sourceUniversity: "Anna University Chennai (Semester VI PYQ)" },
    { text: "Derive the Navier-Stokes equations for incompressible fluid flow and list key assumptions.", code: "ME-401", department: "Mechanical Engineering", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 5, sourceUniversity: "Anna University Chennai (Semester VII PYQ)" },
    { text: "Which material property defines the resistance of a structural component to plastic deformation?", code: "ME-102", department: "Mechanical Engineering", difficulty: "easy", type: "objective", marks: 2, creditLevel: 1, sourceUniversity: "Anna University Chennai (Semester I PYQ)" },
    { text: "Compare the operations of standard Amplitude Modulation (AM) and Frequency Modulation (FM) systems in noise constraints.", code: "EC-303", department: "Electrical Engineering", difficulty: "medium", type: "subjective", marks: 10, creditLevel: 3, sourceUniversity: "Anna University Chennai (Semester V PYQ)" },

    // --- SPPU Semester Exams ---
    { text: "Derive the design equation for a plug flow reactor (PFR) operating under steady-state conditions.", code: "CH-401", department: "Chemical Engineering", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 5, sourceUniversity: "SPPU Pune (Semester VIII PYQ)" },
    { text: "Explain database ACID properties and how two-phase locking (2PL) guarantees serializability.", code: "CS-204", department: "Computer Science", difficulty: "medium", type: "subjective", marks: 10, creditLevel: 3, sourceUniversity: "SPPU Pune (Semester IV PYQ)" },
    { text: "Formulate the stiffness matrix for a 2D truss element and describe local vs global coordinate systems.", code: "CE-303", department: "Civil Engineering", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 4, sourceUniversity: "SPPU Pune (Semester V PYQ)" },
    { text: "What is the primary function of a semiconductor diode in rectifier circuits?", code: "EE-101", department: "Electrical Engineering", difficulty: "easy", type: "objective", marks: 2, creditLevel: 1, sourceUniversity: "SPPU Pune (Semester I PYQ)" },

    // --- IIT Bombay/Madras PYQs ---
    { text: "State Maxwell's equations in differential and integral forms, and explain their electromagnetic significance.", code: "EE-401", department: "Electrical Engineering", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 5, sourceUniversity: "IIT Bombay (Semester VI Core Exam)" },
    { text: "Explain the working of deep convolutional neural networks with backpropagation and loss optimization.", code: "CS-401", department: "Computer Science", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 5, sourceUniversity: "IIT Madras (Semester VII Advanced ML)" },
    { text: "Design a fault-tolerant distributed transaction system using the Raft Consensus Protocol.", code: "CS-403", department: "Computer Science", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 5, sourceUniversity: "IIT Bombay (Semester VIII Distributed Systems)" },
    { text: "State the Halting Problem and prove that it is undecidable using diagonalization proofs.", code: "CS-402", department: "Computer Science", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 5, sourceUniversity: "IIT Madras (Semester V Theory of Computation)" },
    { text: "Derive the Navier-Stokes formulation for microfluidic channels under boundary-slip conditions.", code: "ME-405", department: "Mechanical Engineering", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 5, sourceUniversity: "IIT Kharagpur (Semester VII Advanced Fluid Mechanics)" },

    // --- JNTU Semester Exams ---
    { text: "Explain the difference between primary and secondary wastewater treatment processes.", code: "CE-205", department: "Civil Engineering", difficulty: "easy", type: "subjective", marks: 5, creditLevel: 2, sourceUniversity: "JNTU Hyderabad (Semester IV PYQ)" },
    { text: "Explain the TCP 3-way handshake process and how duplicate connection initiations are avoided.", code: "CS-202", department: "Computer Science", difficulty: "easy", type: "subjective", marks: 5, creditLevel: 2, sourceUniversity: "JNTU Hyderabad (Semester III PYQ)" },
    { text: "Formulate the active earth pressure on a retaining wall using Rankine's and Coulomb's methodologies.", code: "CE-305", department: "Civil Engineering", difficulty: "medium", type: "subjective", marks: 10, creditLevel: 3, sourceUniversity: "JNTU Kakinada (Semester V PYQ)" },
    { text: "Explain the operational differences between single-phase and three-phase induction motor windings.", code: "EE-302", department: "Electrical Engineering", difficulty: "medium", type: "subjective", marks: 10, creditLevel: 3, sourceUniversity: "JNTU Hyderabad (Semester VI PYQ)" },

    // --- MAKAUT Semester Exams ---
    { text: "Analyze the frequency response of a second-order active low-pass butterworth filter circuit.", code: "EE-301", department: "Electrical Engineering", difficulty: "medium", type: "subjective", marks: 10, creditLevel: 3, sourceUniversity: "MAKAUT Kolkata (Semester V PYQ)" },
    { text: "State Fick's First and Second Laws of molecular diffusion and explain their physical variables.", code: "CH-204", department: "Chemical Engineering", difficulty: "medium", type: "subjective", marks: 10, creditLevel: 3, sourceUniversity: "MAKAUT Kolkata (Semester IV PYQ)" },
    { text: "What is the differences between internal and external fragmentation in operating system memory?", code: "CS-205", department: "Computer Science", difficulty: "easy", type: "subjective", marks: 5, creditLevel: 2, sourceUniversity: "MAKAUT Kolkata (Semester IV PYQ)" },

    // --- GTU Semester Exams ---
    { text: "Explain the Rankine cycle with reheating and regeneration, and draw its T-s diagram representation.", code: "ME-302", department: "Mechanical Engineering", difficulty: "hard", type: "subjective", marks: 15, creditLevel: 4, sourceUniversity: "GTU Ahmedabad (Semester VI PYQ)" },
    { text: "State and prove Darcy's Law for fluid permeability through soils and outline flow velocity criteria.", code: "CE-204", department: "Civil Engineering", difficulty: "medium", type: "subjective", marks: 10, creditLevel: 3, sourceUniversity: "GTU Ahmedabad (Semester III PYQ)" },
    { text: "What is the standard mixing ratio of cement, sand, and aggregate in M20 grade concrete?", code: "CE-101", department: "Civil Engineering", difficulty: "easy", type: "objective", marks: 2, creditLevel: 1, sourceUniversity: "GTU Ahmedabad (Semester I PYQ)" }
  ];

  await Question.insertMany(seedData);
  console.log(`✅ Pre-seeded ${seedData.length} prestigious Indian Technical University PYQs successfully.`);
};

// @desc    Get all questions from overall available engineering departments
// @route   GET /api/questions
// @access  Private
const getQuestions = async (req, res) => {
  try {
    await seedEngineeringQuestions();

    const { department, difficulty } = req.query;
    let query = {};
    
    if (department && department !== 'all') {
      query.department = department;
    }
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    const questions = await Question.find(query);
    res.status(200).json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getQuestions
};

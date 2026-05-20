const Question = require('../models/Question');

// Seed engineering questions across all departments if database is empty or has old seeds
const seedEngineeringQuestions = async () => {
  const count = await Question.countDocuments();
  // If we have our exact expanded set, we don't need to re-seed
  if (count === 60) return;

  await Question.deleteMany({}); // Start clean with the ultimate Indian Technical Universities Semester PYQ database!

  const seedData = [
    // --- COMPUTER SCIENCE / IT ---
    {
      text: "Explain the difference between TCP and UDP protocols, detailing their header structures, flow control, and congestion control mechanisms.",
      code: "CS-301",
      department: "Computer Science",
      difficulty: "hard",
      type: "subjective",
      marks: 12,
      creditLevel: 5,
      sourceUniversity: "IIT Bombay (Semester V Core Exam)"
    },
    {
      text: "What is database normalization? Explain 1NF, 2NF, 3NF, and BCNF with concrete schemas and normal form violations.",
      code: "CS-302",
      department: "Computer Science",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "AKTU Lucknow (Semester V PYQ)"
    },
    {
      text: "Design a Turing machine that accepts the language L = {a^n b^n c^n | n >= 1} and draw the complete transition graph.",
      code: "CS-402",
      department: "Computer Science",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "IIT Madras (Semester VI Theory of Computation)"
    },
    {
      text: "Explain the concept of Deadlock and detail the four necessary conditions (mutual exclusion, hold & wait, no preemption, circular wait) for deadlock to occur.",
      code: "CS-303",
      department: "Computer Science",
      difficulty: "easy",
      type: "subjective",
      marks: 5,
      creditLevel: 2,
      sourceUniversity: "JNTU Hyderabad (Semester IV PYQ)"
    },
    {
      text: "State the Halting Problem and prove that it is undecidable using Cantor's diagonalization argument.",
      code: "CS-403",
      department: "Computer Science",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "SPPU Pune (Semester VI Theory of Computation)"
    },
    {
      text: "Explain the working of deep convolutional neural networks with backpropagation and SGD loss optimization.",
      code: "CS-411",
      department: "Computer Science",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "IIT Madras (Semester VII Advanced ML)"
    },
    {
      text: "Design a fault-tolerant distributed transaction system using the Raft Consensus Protocol.",
      code: "CS-412",
      department: "Computer Science",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "IIT Bombay (Semester VIII Distributed Systems)"
    },
    {
      text: "Explain the difference between symmetric and asymmetric key cryptography. Detail how RSA algorithm achieves key exchange.",
      code: "CS-352",
      department: "Computer Science",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 4,
      sourceUniversity: "VTU Belagavi (Semester VI Cryptography)"
    },

    // --- ELECTRICAL & ELECTRONICS ENGINEERING ---
    {
      text: "Explain the working of a 4-bit synchronous up/down counter using JK Flip-Flops and derive the state transition table.",
      code: "EE-202",
      department: "Electrical Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "AKTU Lucknow (Semester IV PYQ)"
    },
    {
      text: "State and prove the Superposition Theorem as applied to alternating current electrical circuits with multiple sources.",
      code: "EE-205",
      department: "Electrical Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "VTU Belagavi (Semester III PYQ)"
    },
    {
      text: "State Maxwell's equations in differential and integral forms, and explain their electromagnetic significance in vacuum.",
      code: "EE-401",
      department: "Electrical Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "IIT Bombay (Semester VI Core Exam)"
    },
    {
      text: "State and explain Faraday's Law of Electromagnetic Induction and Lenz's Law with practical power transformer examples.",
      code: "EE-102",
      department: "Electrical Engineering",
      difficulty: "easy",
      type: "subjective",
      marks: 5,
      creditLevel: 2,
      sourceUniversity: "Anna University Chennai (Semester II PYQ)"
    },
    {
      text: "Explain the working principle of a Three-Phase Induction Motor and derive the expression for starting torque under varying slip.",
      code: "EE-302",
      department: "Electrical Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 12,
      creditLevel: 4,
      sourceUniversity: "JNTU Hyderabad (Semester VI PYQ)"
    },
    {
      text: "What is the primary function of a semiconductor diode in rectifier circuits?",
      code: "EE-101",
      department: "Electrical Engineering",
      difficulty: "easy",
      type: "objective",
      marks: 2,
      creditLevel: 1,
      sourceUniversity: "SPPU Pune (Semester I PYQ)"
    },
    {
      text: "Compare the operations of standard Amplitude Modulation (AM) and Frequency Modulation (FM) systems in noise-limited channels.",
      code: "EE-303",
      department: "Electrical Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "Anna University Chennai (Semester V PYQ)"
    },
    {
      text: "Analyze the frequency response of a second-order active low-pass Butterworth filter circuit and derive its cutoff equation.",
      code: "EE-311",
      department: "Electrical Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "MAKAUT Kolkata (Semester V PYQ)"
    },

    // --- MECHANICAL ENGINEERING ---
    {
      text: "Derive the mathematical equation for one-dimensional heat conduction in a composite cylinder wall under steady-state conditions.",
      code: "ME-301",
      department: "Mechanical Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "AKTU Lucknow (Semester VII PYQ)"
    },
    {
      text: "Determine the critical speed of a shaft carrying a single rotor with and without damping conditions.",
      code: "ME-404",
      department: "Mechanical Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "VTU Belagavi (Semester VII PYQ)"
    },
    {
      text: "Derive the Navier-Stokes equations for incompressible fluid flow and list key assumptions and boundary conditions.",
      code: "ME-401",
      department: "Mechanical Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "Anna University Chennai (Semester VII PYQ)"
    },
    {
      text: "Which material property defines the resistance of a structural component to plastic deformation?",
      code: "ME-102",
      department: "Mechanical Engineering",
      difficulty: "easy",
      type: "objective",
      marks: 2,
      creditLevel: 1,
      sourceUniversity: "Anna University Chennai (Semester I PYQ)"
    },
    {
      text: "Derive the Navier-Stokes formulation for microfluidic channels under boundary-slip conditions.",
      code: "ME-405",
      department: "Mechanical Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "IIT Kharagpur (Semester VII Advanced Fluid Mechanics)"
    },
    {
      text: "Explain the Rankine cycle with reheating and regeneration, and draw its T-s diagram representation.",
      code: "ME-302",
      department: "Mechanical Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 4,
      sourceUniversity: "GTU Ahmedabad (Semester VI PYQ)"
    },
    {
      text: "Describe the four thermodynamic processes of the Carnot Cycle and derive its thermal efficiency equation using absolute temperatures.",
      code: "ME-201",
      department: "Mechanical Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "IIT Bombay (Semester IV Thermodynamics)"
    },
    {
      text: "Explain the working principle of a Four-Stroke Spark-Ignition (SI) internal combustion engine with PV and TS diagrams.",
      code: "ME-202",
      department: "Mechanical Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "SPPU Pune (Semester IV IC Engines)"
    },

    // --- CIVIL ENGINEERING ---
    {
      text: "Formulate the ultimate load-carrying capacity of a shallow rectangular foundation using Terzaghi's theory.",
      code: "CE-401",
      department: "Civil Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "VTU Belagavi (Semester VIII PYQ)"
    },
    {
      text: "Differentiate between statically determinate and indeterminate structural beams with suitable sketches.",
      code: "CE-202",
      department: "Civil Engineering",
      difficulty: "easy",
      type: "subjective",
      marks: 5,
      creditLevel: 2,
      sourceUniversity: "VTU Belagavi (Semester IV PYQ)"
    },
    {
      text: "Formulate the stiffness matrix for a 2D truss element and describe local vs global coordinate systems.",
      code: "CE-303",
      department: "Civil Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 4,
      sourceUniversity: "SPPU Pune (Semester V PYQ)"
    },
    {
      text: "Explain the difference between primary and secondary wastewater treatment processes in environmental engineering.",
      code: "CE-205",
      department: "Civil Engineering",
      difficulty: "easy",
      type: "subjective",
      marks: 5,
      creditLevel: 2,
      sourceUniversity: "JNTU Hyderabad (Semester IV PYQ)"
    },
    {
      text: "Formulate the active earth pressure on a retaining wall using Rankine's and Coulomb's methodologies.",
      code: "CE-305",
      department: "Civil Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "JNTU Kakinada (Semester V PYQ)"
    },
    {
      text: "State and prove Darcy's Law for fluid permeability through soils and outline flow velocity criteria.",
      code: "CE-204",
      department: "Civil Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "GTU Ahmedabad (Semester III PYQ)"
    },
    {
      text: "What is the standard mixing ratio of cement, sand, and aggregate in M20 grade concrete?",
      code: "CE-101",
      department: "Civil Engineering",
      difficulty: "easy",
      type: "objective",
      marks: 2,
      creditLevel: 1,
      sourceUniversity: "GTU Ahmedabad (Semester I PYQ)"
    },
    {
      text: "State and explain Bernoulli's equation for fluid flow, detailing its pressure, kinetic, and potential energy heads.",
      code: "CE-201",
      department: "Civil Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "AKTU Lucknow (Semester III Fluid Mechanics)"
    },

    // --- CHEMICAL ENGINEERING ---
    {
      text: "Explain the McCabe-Thiele method for calculating the number of theoretical stages in distillation columns.",
      code: "CH-302",
      department: "Chemical Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 4,
      sourceUniversity: "Anna University Chennai (Semester VI PYQ)"
    },
    {
      text: "Derive the design equation for a plug flow reactor (PFR) operating under steady-state conditions.",
      code: "CH-401",
      department: "Chemical Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "SPPU Pune (Semester VIII PYQ)"
    },
    {
      text: "State Fick's First and Second Laws of molecular diffusion and explain their physical variables.",
      code: "CH-204",
      department: "Chemical Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "MAKAUT Kolkata (Semester IV PYQ)"
    },
    {
      text: "Derive the design equation for a Continuous Stirred Tank Reactor (CSTR) operating under isothermal steady-state conditions.",
      code: "CH-301",
      department: "Chemical Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "IIT Bombay (Semester V Kinetics)"
    },
    {
      text: "Explain the principle of fractional distillation and describe the function of bubble cap plates in a fractionating column.",
      code: "CH-303",
      department: "Chemical Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "Anna University Chennai (Semester V Mass Transfer)"
    },
    {
      text: "State Fick's first and second laws of diffusion and derive the equation for steady-state equimolar counter-diffusion.",
      code: "CH-202",
      department: "Chemical Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "IIT Kharagpur (Semester IV Transport Phenomena)"
    },
    {
      text: "Describe the working of a shell and tube heat exchanger and explain the concept of Log Mean Temperature Difference (LMTD).",
      code: "CH-305",
      department: "Chemical Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "GTU Ahmedabad (Semester V Heat Transfer)"
    },
    {
      text: "Explain the difference between Newtonian and non-Newtonian fluids, providing mathematical models for power-law fluids.",
      code: "CH-205",
      department: "Chemical Engineering",
      difficulty: "easy",
      type: "subjective",
      marks: 5,
      creditLevel: 2,
      sourceUniversity: "MAKAUT Kolkata (Semester IV Fluid Flow)"
    },

    // --- BIOTECHNOLOGY ENGINEERING ---
    {
      text: "Explain the recombinant DNA technology process and detail the functions of restriction endonucleases and ligases.",
      code: "BT-301",
      department: "Biotechnology Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "IIT Delhi (Semester VI Genetic Engineering)"
    },
    {
      text: "Describe the three phases of Polymerase Chain Reaction (PCR) and explain the role of Taq polymerase.",
      code: "BT-202",
      department: "Biotechnology Engineering",
      difficulty: "easy",
      type: "subjective",
      marks: 5,
      creditLevel: 2,
      sourceUniversity: "Anna University Chennai (Semester IV Molecular Biology)"
    },
    {
      text: "Explain the difference between aerobic and anaerobic fermentation processes in bioreactors, detailing oxygen transfer rates.",
      code: "BT-303",
      department: "Biotechnology Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "VIT Vellore (Semester V Bioprocess Technology)"
    },
    {
      text: "Describe the structure and function of monoclonal antibodies and explain how they are produced using hybridoma technology.",
      code: "BT-401",
      department: "Biotechnology Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 12,
      creditLevel: 4,
      sourceUniversity: "JNTU Hyderabad (Semester VII Immunology)"
    },
    {
      text: "Explain the concept of enzyme immobilization and compare physical adsorption, covalent binding, and entrapment techniques.",
      code: "BT-302",
      department: "Biotechnology Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "MSU Baroda (Semester V Enzyme Technology)"
    },
    {
      text: "State Michaelis-Menten kinetic equations for enzyme reactions and define Km and Vmax constants.",
      code: "BT-201",
      department: "Biotechnology Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "IIT Kharagpur (Semester IV Biochemistry)"
    },
    {
      text: "Describe the process of plant tissue culture and explain the roles of auxins and cytokinins in organogenesis.",
      code: "BT-305",
      department: "Biotechnology Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "VTU Belagavi (Semester VI Plant Biotech)"
    },
    {
      text: "Explain the molecular mechanism of CRISPR-Cas9 gene editing tool and its applications in genetic disease correction.",
      code: "BT-410",
      department: "Biotechnology Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "IIT Bombay (Semester VIII Genetic Engineering)"
    },

    // --- AEROSPACE ENGINEERING ---
    {
      text: "Explain the generation of aerodynamic lift using Bernoulli's principle and circulation theory over a cambered airfoil.",
      code: "AE-301",
      department: "Aerospace Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "IIT Kanpur (Semester V Aerodynamics)"
    },
    {
      text: "Describe the working principles of a Turbojet engine, detailing compressor, combustion chamber, turbine, and nozzle stages.",
      code: "AE-302",
      department: "Aerospace Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 4,
      sourceUniversity: "IIT Kharagpur (Semester VI Propulsion)"
    },
    {
      text: "Formulate the Tsiolkovsky Rocket Equation and calculate the delta-V required for a rocket to escape Earth's gravity.",
      code: "AE-201",
      department: "Aerospace Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "IIST Trivandrum (Semester IV Spaceflight Dynamics)"
    },
    {
      text: "Explain the differences between subsonic, transonic, supersonic, and hypersonic flow regimes based on Mach number.",
      code: "AE-202",
      department: "Aerospace Engineering",
      difficulty: "easy",
      type: "subjective",
      marks: 5,
      creditLevel: 2,
      sourceUniversity: "IIT Madras (Semester IV Gas Dynamics)"
    },
    {
      text: "Describe the structural components of an aircraft wing, explaining the functions of spars, ribs, and skin panels.",
      code: "AE-303",
      department: "Aerospace Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "Anna University Chennai (Semester V Aircraft Structures)"
    },
    {
      text: "State the Keplarian orbital elements and describe how they define the size, shape, and orientation of a satellite orbit.",
      code: "AE-305",
      department: "Aerospace Engineering",
      difficulty: "medium",
      type: "subjective",
      marks: 10,
      creditLevel: 3,
      sourceUniversity: "IIT Bombay (Semester V Spaceflight Mechanics)"
    },
    {
      text: "Explain the concept of aeroelastic flutter and discuss its prevention methods in high-speed aircraft wings.",
      code: "AE-401",
      department: "Aerospace Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 15,
      creditLevel: 5,
      sourceUniversity: "IIT Kanpur (Semester VII Aeroelasticity)"
    },
    {
      text: "Describe the working of an aircraft autopilot system, explaining the roles of gyroscopes, accelerometers, and feedback loops.",
      code: "AE-402",
      department: "Aerospace Engineering",
      difficulty: "hard",
      type: "subjective",
      marks: 12,
      creditLevel: 4,
      sourceUniversity: "IIST Trivandrum (Semester VII Flight Control Systems)"
    }
  ];

  await Question.insertMany(seedData);
  console.log(`✅ Pre-seeded ${seedData.length} prestigious Indian Technical University PYQs successfully across all departments.`);
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

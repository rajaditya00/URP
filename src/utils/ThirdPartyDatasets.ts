export interface DatasetQuestion {
    text: string;
    label: 'novel' | 'repeat';
    domain: string;
}

export const MIT_OCW_DATASET: DatasetQuestion[] = [
    { text: "Derive the time complexity of the Floyd-Warshall all-pairs shortest path algorithm and prove its optimal substructure.", label: "novel", domain: "Algorithms" },
    { text: "Explain the Master Theorem for solving recurrences and solve T(n) = 4T(n/2) + n^2 log n.", label: "novel", domain: "Algorithms" },
    { text: "What is a red-black tree? List all 5 properties that ensure balanced height.", label: "repeat", domain: "Data Structures" },
    { text: "Explain the difference between Dijkstra's algorithm and Bellman-Ford for shortest paths.", label: "repeat", domain: "Algorithms" },
    { text: "Design a Turing machine that accepts the language L = {a^n b^n c^n | n >= 0}.", label: "novel", domain: "Theory of Computation" },
    { text: "Prove that the Halting Problem is undecidable using diagonalization.", label: "novel", domain: "Theory of Computation" },
    { text: "What is regular expression equivalence and how do you convert an NFA to a DFA?", label: "repeat", domain: "Theory of Computation" },
    { text: "Explain the concept of NP-Completeness and prove that 3-SAT is NP-Complete by reduction from SAT.", label: "novel", domain: "Theory of Computation" },
    { text: "Describe the architecture of a transformer network and explain self-attention mechanisms.", label: "novel", domain: "Artificial Intelligence" },
    { text: "Explain backpropagation in neural networks using multivariable chain rule equations.", label: "novel", domain: "Artificial Intelligence" },
    { text: "What is the difference between supervised and unsupervised machine learning?", label: "repeat", domain: "Artificial Intelligence" },
    { text: "Define overfitting and list three techniques (e.g., regularization, dropout) to prevent it.", label: "repeat", domain: "Artificial Intelligence" },
    { text: "State the Heisenberg Uncertainty Principle and derive it using operator commutators.", label: "novel", domain: "Quantum Physics" },
    { text: "Solve the time-independent Schrodinger equation for a particle in a one-dimensional infinite potential well.", label: "novel", domain: "Quantum Physics" },
    { text: "What are the three laws of thermodynamics and define the concept of entropy.", label: "repeat", domain: "Thermodynamics" },
    { text: "Explain Carnot's engine cycle and derive its thermal efficiency limit.", label: "novel", domain: "Thermodynamics" },
    { text: "Describe the chemical structures and synthesis pathways of modern peptide bonds.", label: "novel", domain: "Organic Chemistry" },
    { text: "What are electrophilic aromatic substitution reactions and their ortho/para directing effects?", label: "repeat", domain: "Organic Chemistry" },
    { text: "Formulate the Hamiltonian operator for a helium atom including electron-electron repulsion terms.", label: "novel", domain: "Quantum Chemistry" },
    { text: "Explain DNA replication phases and the roles of DNA polymerase and helicase.", label: "repeat", domain: "Molecular Biology" },
    { text: "State the central limit theorem and prove its convergence using moment generating functions.", label: "novel", domain: "Mathematics" },
    { text: "Define eigenvalue and eigenvector, and explain the steps to diagonalize a symmetric matrix.", label: "repeat", domain: "Mathematics" },
    { text: "Explain the difference between a Riemann integral and a Lebesgue integral.", label: "novel", domain: "Mathematics" },
    { text: "State the Fundamental Theorem of Calculus and prove both of its parts.", label: "repeat", domain: "Mathematics" },
    { text: "Explain the concept of public key cryptography and write the mathematical basis of RSA encryption.", label: "novel", domain: "Cryptography" }
];

export const STANFORD_CS_DATASET: DatasetQuestion[] = [
    { text: "Explain database ACID properties and how two-phase locking (2PL) guarantees serializability.", label: "novel", domain: "Database Systems" },
    { text: "Explain database write-ahead logging (WAL) and the ARIES recovery algorithm.", label: "novel", domain: "Database Systems" },
    { text: "What are primary keys, foreign keys, and referential integrity constraints in relational databases?", label: "repeat", domain: "Database Systems" },
    { text: "What is database normalization? Explain 1NF, 2NF, 3NF, and BCNF with examples.", label: "repeat", domain: "Database Systems" },
    { text: "Design a fault-tolerant distributed system using the Raft consensus algorithm.", label: "novel", domain: "Distributed Systems" },
    { text: "Explain the CAP Theorem and discuss the tradeoffs between consistency and availability.", label: "novel", domain: "Distributed Systems" },
    { text: "What is a map-reduce framework and how does it handle node failures during execution?", label: "repeat", domain: "Distributed Systems" },
    { text: "Describe the difference between RPC (Remote Procedure Call) and RESTful API architectures.", label: "repeat", domain: "Distributed Systems" },
    { text: "Explain buffer overflow attacks and detail modern defensive measures like ASLR and stack canaries.", label: "novel", domain: "Computer Security" },
    { text: "Describe the RSA public-key cryptosystem and how it prevents man-in-the-middle attacks.", label: "novel", domain: "Computer Security" },
    { text: "What is symmetric encryption and how does the AES algorithm encrypt blocks of data?", label: "repeat", domain: "Computer Security" },
    { text: "Explain the working of SSL/TLS handshake protocol for secure HTTP communication.", label: "repeat", domain: "Computer Security" },
    { text: "Compare LL(1) and LR(1) parsers. Derive the parsing table for a simple arithmetic grammar.", label: "novel", domain: "Compilers" },
    { text: "Explain compiler optimization techniques: loop unrolling, dead code elimination, and register allocation.", label: "novel", domain: "Compilers" },
    { text: "What is the difference between a compiler and an interpreter?", label: "repeat", domain: "Compilers" },
    { text: "Describe the phases of a compiler from lexical analysis to machine code generation.", label: "repeat", domain: "Compilers" },
    { text: "Formulate the bellman optimality equation for reinforcement learning Markov Decision Processes (MDP).", label: "novel", domain: "Machine Learning" },
    { text: "Explain Support Vector Machines (SVM) and the mathematical derivation of kernel trick.", label: "novel", domain: "Machine Learning" },
    { text: "What is linear regression and how does gradient descent find the optimal weights?", label: "repeat", domain: "Machine Learning" },
    { text: "Define the term 'neural network activation function' and compare Sigmoid, Tanh, and ReLU.", label: "repeat", domain: "Machine Learning" }
];

export const UGC_NET_DATASET: DatasetQuestion[] = [
    { text: "Analyse the impact of digital initiatives in Indian higher education like SWAYAM, NAD, and DigiLocker.", label: "novel", domain: "Higher Education" },
    { text: "Discuss the recommendations of National Education Policy (NEP) 2020 on vocational education integration.", label: "novel", domain: "Higher Education" },
    { text: "What is the role of UGC (University Grants Commission) and NAAC in maintaining university standards?", label: "repeat", domain: "Higher Education" },
    { text: "Explain the structure and function of the executive council of an Indian Central University.", label: "repeat", domain: "Higher Education" },
    { text: "Evaluate the role of qualitative vs quantitative research methods in social science studies.", label: "novel", domain: "Research Methodology" },
    { text: "Explain research ethics, plagiarism guidelines, and the usage of tools like Urkund or Turnitin.", label: "novel", domain: "Research Methodology" },
    { text: "Define hypothesis testing. What is the difference between Type I and Type II errors?", label: "repeat", domain: "Research Methodology" },
    { text: "What is a literature review and why is it essential in drafting a doctoral dissertation?", label: "repeat", domain: "Research Methodology" },
    { text: "Discuss the application of information communication technologies (ICT) in smart classroom environments.", label: "novel", domain: "ICT in Education" },
    { text: "Describe IPv6 addressing architecture and compare it directly to legacy IPv4 setups.", label: "novel", domain: "Computer Networks" },
    { text: "Explain the difference between synchronous and asynchronous transmission media.", label: "repeat", domain: "Computer Networks" },
    { text: "What is a web browser and explain how domain name systems (DNS) translate URLs to IP addresses.", label: "repeat", domain: "Computer Networks" },
    { text: "Formulate a lesson plan based on Bloom's Taxonomy of educational objectives.", label: "novel", domain: "Teaching Aptitude" },
    { text: "Analyze the characteristics of formative, summative, diagnostic, and placement evaluations.", label: "novel", domain: "Teaching Aptitude" },
    { text: "Explain the difference between teacher-centered and learner-centered education methods.", label: "repeat", domain: "Teaching Aptitude" },
    { text: "What is active learning and how do group discussions foster student understanding?", label: "repeat", domain: "Teaching Aptitude" }
];

export const ALL_COMBINED_DATASET = [
    ...MIT_OCW_DATASET,
    ...STANFORD_CS_DATASET,
    ...UGC_NET_DATASET
];

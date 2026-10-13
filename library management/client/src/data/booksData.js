/**
 * booksData.js
 * KL University Academic Library Repository & Curriculum Catalog
 * Contains enhanced metadata: Floor Plan coordinates, Rack occupancy,
 * Course/Semester alignments, and indexed Chapter listings for AI Syllabus matching.
 */

export const initialBooksData = [
  {
    id: 1,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    category: "COMPUTER SCIENCE",
    location: "Aisle A-2 • Rack R-01",
    availableCopies: 3,
    totalCopies: 6,
    status: "AVAILABLE",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg",
    isbn: "9780262033848",
    callNumber: "QA76.6 .C66 2009",
    shelfLocation: {
      floor: 1,
      wing: "Wing A (Computer Science)",
      aisle: "A-2",
      rack: "R-01",
      shelfNumber: "S-3",
      x: 230,
      y: 190,
      capacity: 50,
      occupied: 41,
      neighbors: ["QA76.6 .A43 (Aho & Ullman)", "QA76.7 .K45 (Knuth Vol 1)"]
    },
    curriculum: [
      { branch: "CSE", semester: 3, courseCode: "CS301", courseTitle: "Data Structures & Algorithms", isCore: true },
      { branch: "CS&IT", semester: 3, courseCode: "IT301", courseTitle: "Design and Analysis of Algorithms", isCore: true },
      { branch: "AI&DS", semester: 3, courseCode: "AD302", courseTitle: "Foundations of Algorithms", isCore: true }
    ],
    chapters: [
      {
        chapterNumber: 22,
        title: "Elementary Graph Algorithms (BFS & DFS)",
        pages: "589–623",
        topics: ["Breadth-First Search", "Depth-First Search", "Topological Sort", "Strongly Connected Components"]
      },
      {
        chapterNumber: 23,
        title: "Minimum Spanning Trees",
        pages: "624–642",
        topics: ["Kruskal's Algorithm", "Prim's Algorithm", "Cut Property", "Greedy Strategy"]
      },
      {
        chapterNumber: 24,
        title: "Single-Source Shortest Paths (Dijkstra & Bellman-Ford)",
        pages: "643–683",
        topics: ["Dijkstra's Shortest Path", "Bellman-Ford Algorithm", "DAG Shortest Paths", "Difference Constraints", "Edge Relaxation"]
      },
      {
        chapterNumber: 15,
        title: "Dynamic Programming",
        pages: "359–412",
        topics: ["Rod Cutting", "Matrix-Chain Multiplication", "Longest Common Subsequence", "Optimal Binary Search Trees"]
      }
    ]
  },
  {
    id: 2,
    title: "Database System Concepts",
    author: "Abraham Silberschatz, Henry F. Korth, S. Sudarshan",
    category: "COMPUTER SCIENCE",
    location: "Aisle A-3 • Rack R-04",
    availableCopies: 2,
    totalCopies: 5,
    status: "AVAILABLE",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780073523323-L.jpg",
    isbn: "9780073523323",
    callNumber: "QA76.9.D3 S56 2019",
    shelfLocation: {
      floor: 1,
      wing: "Wing A (Computer Science)",
      aisle: "A-3",
      rack: "R-04",
      shelfNumber: "S-2",
      x: 340,
      y: 190,
      capacity: 45,
      occupied: 39,
      neighbors: ["QA76.9.D3 E47 (Elmasri & Navathe)", "QA76.9.D3 C63 (Date Database Systems)"]
    },
    curriculum: [
      { branch: "CSE", semester: 4, courseCode: "CS402", courseTitle: "Database Management Systems", isCore: true },
      { branch: "CS&IT", semester: 4, courseCode: "IT402", courseTitle: "Database Engineering", isCore: true },
      { branch: "AI&DS", semester: 4, courseCode: "AD401", courseTitle: "Big Data & DBMS", isCore: true }
    ],
    chapters: [
      {
        chapterNumber: 7,
        title: "Relational Database Design and Normalization",
        pages: "297–348",
        topics: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Normalization 3NF & BCNF", "Boyce-Codd Normal Form", "Multivalued Dependencies (4NF)"]
      },
      {
        chapterNumber: 14,
        title: "Transactions & Concurrency Control",
        pages: "633–682",
        topics: ["ACID Properties", "Serializability", "Two-Phase Locking (2PL)", "Deadlock Detection & Prevention", "Timestamp-Based Protocols"]
      },
      {
        chapterNumber: 11,
        title: "Indexing and Hashing (B+ Trees)",
        pages: "497–546",
        topics: ["B+ Tree Indices", "B Tree", "Static & Dynamic Hashing", "Bitmap Indices"]
      }
    ]
  },
  {
    id: 3,
    title: "Operating System Concepts",
    author: "Abraham Silberschatz, Peter B. Galvin, Greg Gagne",
    category: "COMPUTER SCIENCE",
    location: "Aisle A-1 • Rack R-02",
    availableCopies: 0,
    totalCopies: 4,
    status: "RESERVED OUT",
    waitlistCount: 2,
    activeWaitlistUser: {
      id: "2500030041",
      name: "Aarav Sharma",
      branch: "CSE",
      year: 2,
      requestedAt: "2026-10-09T08:30:00.000Z"
    },
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Operating_System_Concepts_cover.jpg/220px-Operating_System_Concepts_cover.jpg",
    isbn: "9781119800361",
    callNumber: "QA76.76.O63 S55 2018",
    shelfLocation: {
      floor: 1,
      wing: "Wing A (Computer Science)",
      aisle: "A-1",
      rack: "R-02",
      shelfNumber: "S-1",
      x: 120,
      y: 190,
      capacity: 50,
      occupied: 48,
      neighbors: ["QA76.76.O63 T36 (Tanenbaum Modern OS)", "QA76.76.O63 S73 (Stallings Operating Systems)"]
    },
    curriculum: [
      { branch: "CSE", semester: 3, courseCode: "CS303", courseTitle: "Operating Systems Principles", isCore: true },
      { branch: "CS&IT", semester: 3, courseCode: "IT303", courseTitle: "Operating Systems", isCore: true },
      { branch: "IOT", semester: 3, courseCode: "IO302", courseTitle: "Embedded OS & Kernels", isCore: true }
    ],
    chapters: [
      {
        chapterNumber: 5,
        title: "CPU Scheduling Algorithms",
        pages: "183–228",
        topics: ["Round Robin Scheduling", "Shortest Job First (SJF)", "Priority Scheduling", "Multilevel Feedback Queues"]
      },
      {
        chapterNumber: 6,
        title: "Synchronization Tools & Semaphores",
        pages: "229–286",
        topics: ["Critical Section Problem", "Peterson's Solution", "Semaphores & Mutex Locks", "Classic Synchronization Problems"]
      },
      {
        chapterNumber: 8,
        title: "Deadlocks & Banker's Algorithm",
        pages: "317–348",
        topics: ["Deadlocks & Banker's Algorithm", "Deadlock Prevention", "Resource Allocation Graph", "Deadlock Recovery"]
      },
      {
        chapterNumber: 9,
        title: "Main Memory & Virtual Memory Paging",
        pages: "349–452",
        topics: ["Paging and Segmentation", "Page Replacement (LRU, FIFO)", "Thrashing", "Virtual Memory Management"]
      }
    ]
  },
  {
    id: 4,
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum, David J. Wetherall",
    category: "NETWORKING",
    location: "Aisle B-1 • Rack R-05",
    availableCopies: 4,
    totalCopies: 5,
    status: "AVAILABLE",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780132126953-L.jpg",
    isbn: "9780132126953",
    callNumber: "TK5105.5 .T36 2011",
    shelfLocation: {
      floor: 1,
      wing: "Wing B (Systems & Networks)",
      aisle: "B-1",
      rack: "R-05",
      shelfNumber: "S-2",
      x: 480,
      y: 190,
      capacity: 40,
      occupied: 32,
      neighbors: ["TK5105.5 .K87 (Kurose Computer Networking)", "TK5105.5 .F67 (Forouzan Data Comm)"]
    },
    curriculum: [
      { branch: "CSE", semester: 5, courseCode: "CS501", courseTitle: "Computer Networks", isCore: true },
      { branch: "ECE", semester: 5, courseCode: "EC502", courseTitle: "Data Communication Networks", isCore: true },
      { branch: "CS&IT", semester: 5, courseCode: "IT501", courseTitle: "Computer Communication Networks", isCore: true }
    ],
    chapters: [
      {
        chapterNumber: 5,
        title: "The Network Layer and IP Routing",
        pages: "343–460",
        topics: ["Routing Algorithms (OSPF, BGP)", "IPv4 and IPv6 Protocol", "Subnetting and CIDR", "Congestion Control"]
      },
      {
        chapterNumber: 6,
        title: "The Transport Layer (TCP / UDP)",
        pages: "461–582",
        topics: ["TCP 3-Way Handshake", "TCP Sliding Window", "Flow Control & Retransmission", "UDP vs TCP", "Socket Programming"]
      },
      {
        chapterNumber: 4,
        title: "The Medium Access Control Sublayer",
        pages: "243–342",
        topics: ["CSMA/CD and CSMA/CA", "Ethernet Architecture", "Wireless LANs 802.11", "Switching and VLANs"]
      }
    ]
  },
  {
    id: 5,
    title: "Clean Code: Agile Software Craftsmanship",
    author: "Robert C. Martin",
    category: "SOFTWARE ENGINEERING",
    location: "Aisle A-4 • Rack R-03",
    availableCopies: 3,
    totalCopies: 4,
    status: "AVAILABLE",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
    isbn: "9780132350884",
    callNumber: "QA76.76.C64 M37 2008",
    shelfLocation: {
      floor: 2,
      wing: "Wing A (Software Studio)",
      aisle: "A-4",
      rack: "R-03",
      shelfNumber: "S-2",
      x: 320,
      y: 290,
      capacity: 35,
      occupied: 28,
      neighbors: ["QA76.76.D47 F68 (Fowler Refactoring)", "QA76.76.P37 G36 (Gang of Four Design Patterns)"]
    },
    curriculum: [
      { branch: "CSE", semester: 4, courseCode: "CS404", courseTitle: "Software Engineering & Craftsmanship", isCore: true },
      { branch: "CS&IT", semester: 4, courseCode: "IT403", courseTitle: "Object-Oriented Design & Patterns", isCore: true }
    ],
    chapters: [
      {
        chapterNumber: 3,
        title: "Functions: Rules of Clean Implementation",
        pages: "29–52",
        topics: ["Small Functions", "Do One Thing (SRP)", "Command Query Separation", "Prefer Exceptions to Error Codes"]
      },
      {
        chapterNumber: 9,
        title: "Unit Tests and TDD",
        pages: "121–134",
        topics: ["The Three Laws of TDD", "Clean Tests (FIRST Principles)", "Test-Driven Development", "Mocking & Stubs"]
      },
      {
        chapterNumber: 10,
        title: "Classes & SOLID Principles",
        pages: "135–154",
        topics: ["Single Responsibility Principle", "Open-Closed Principle (OCP)", "Dependency Inversion", "Cohesion"]
      }
    ]
  },
  {
    id: 6,
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell, Peter Norvig",
    category: "ARTIFICIAL INTELLIGENCE",
    location: "Aisle A-5 • Rack R-02",
    availableCopies: 1,
    totalCopies: 4,
    status: "AVAILABLE",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780136042594-L.jpg",
    isbn: "9780136042594",
    callNumber: "Q335 .R87 2020",
    shelfLocation: {
      floor: 2,
      wing: "Wing A (AI & Data Science Hub)",
      aisle: "A-5",
      rack: "R-02",
      shelfNumber: "S-4",
      x: 440,
      y: 290,
      capacity: 45,
      occupied: 42,
      neighbors: ["Q325.5 .G66 (Goodfellow Deep Learning)", "Q335 .M58 (Mitchell Machine Learning)"]
    },
    curriculum: [
      { branch: "AI&DS", semester: 3, courseCode: "AD301", courseTitle: "Artificial Intelligence Principles", isCore: true },
      { branch: "CSE", semester: 5, courseCode: "CS503", courseTitle: "Artificial Intelligence & Expert Systems", isCore: true }
    ],
    chapters: [
      {
        chapterNumber: 3,
        title: "Solving Problems by Searching (A* Search)",
        pages: "63–118",
        topics: ["Informed (Heuristic) Search", "A* Search Algorithm", "Heuristic Admissibility & Consistency", "Memory-Bounded Search"]
      },
      {
        chapterNumber: 5,
        title: "Adversarial Search and Games (Alpha-Beta)",
        pages: "161–191",
        topics: ["Minimax Algorithm", "Alpha-Beta Pruning", "Evaluation Functions", "Monte Carlo Tree Search"]
      },
      {
        chapterNumber: 21,
        title: "Deep Learning & Neural Architectures",
        pages: "801–840",
        topics: ["Feedforward Neural Networks", "Convolutional Neural Networks", "Recurrent Networks & Transformers", "Gradient Descent"]
      }
    ]
  },
  {
    id: 7,
    title: "The C Programming Language",
    author: "Brian W. Kernighan, Dennis M. Ritchie",
    category: "PROGRAMMING",
    location: "Aisle B-3 • Rack R-01",
    availableCopies: 6,
    totalCopies: 8,
    status: "AVAILABLE",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780131103627-L.jpg",
    isbn: "9780131103627",
    callNumber: "QA76.73.C15 K47 1988",
    shelfLocation: {
      floor: 1,
      wing: "Wing B (Core Languages)",
      aisle: "B-3",
      rack: "R-01",
      shelfNumber: "S-1",
      x: 580,
      y: 190,
      capacity: 60,
      occupied: 45,
      neighbors: ["QA76.73.C153 S77 (Stroustrup C++)", "QA76.73.P98 L88 (Lutz Learning Python)"]
    },
    curriculum: [
      { branch: "CSE", semester: 1, courseCode: "CS101", courseTitle: "Programming in C", isCore: true },
      { branch: "ECE", semester: 1, courseCode: "EC101", courseTitle: "Computer Programming for Engineers", isCore: true },
      { branch: "IOT", semester: 1, courseCode: "IO101", courseTitle: "Problem Solving & C Programming", isCore: true },
      { branch: "Civil", semester: 1, courseCode: "CE101", courseTitle: "Fundamentals of Computing", isCore: true }
    ],
    chapters: [
      {
        chapterNumber: 5,
        title: "Pointers and Arrays",
        pages: "93–126",
        topics: ["Pointers and Dynamic Memory", "Pointer Arithmetic", "Pointers and Function Arguments", "Character Pointers & Functions"]
      },
      {
        chapterNumber: 6,
        title: "Structures & Unions",
        pages: "127–150",
        topics: ["Arrays of Structures", "Self-Referential Structures", "Table Lookup & Hash Tables", "Typedef & Unions"]
      },
      {
        chapterNumber: 8,
        title: "The UNIX System Interface",
        pages: "169–190",
        topics: ["File Descriptors", "Low-Level I/O (read & write)", "Random Access (lseek)", "Storage Allocator malloc"]
      }
    ]
  },
  {
    id: 8,
    title: "Software Engineering: A Practitioner's Approach",
    author: "Roger S. Pressman, Bruce R. Maxim",
    category: "SOFTWARE ENGINEERING",
    location: "Aisle A-4 • Rack R-06",
    availableCopies: 0,
    totalCopies: 4,
    status: "RESERVED OUT",
    waitlistCount: 1,
    activeWaitlistUser: {
      id: "2400030018",
      name: "Sneha Patel",
      branch: "CSE",
      year: 3,
      requestedAt: "2026-10-09T09:15:00.000Z"
    },
    coverImage: "https://covers.openlibrary.org/b/isbn/9780078022128-L.jpg",
    isbn: "9780078022128",
    callNumber: "QA76.758 .P74 2014",
    shelfLocation: {
      floor: 2,
      wing: "Wing A (Software Studio)",
      aisle: "A-4",
      rack: "R-06",
      shelfNumber: "S-3",
      x: 320,
      y: 360,
      capacity: 40,
      occupied: 36,
      neighbors: ["QA76.758 .S66 (Sommerville Software Eng)", "QA76.758 .B44 (Beck Extreme Programming)"]
    },
    curriculum: [
      { branch: "CSE", semester: 4, courseCode: "CS401", courseTitle: "Software Engineering Processes", isCore: true },
      { branch: "CS&IT", semester: 4, courseCode: "IT401", courseTitle: "Software Lifecycle & Quality", isCore: true }
    ],
    chapters: [
      {
        chapterNumber: 4,
        title: "Agile Development & Scrum Framework",
        pages: "75–98",
        topics: ["Agile Manifesto", "Scrum Framework & Sprints", "Extreme Programming (XP)", "Kanban Method"]
      },
      {
        chapterNumber: 12,
        title: "Requirements Engineering & Use Cases",
        pages: "220–254",
        topics: ["Requirements Elicitation", "Use-Case Diagrams", "CRC Cards", "Non-Functional Requirements"]
      },
      {
        chapterNumber: 26,
        title: "Software Quality Assurance & Metrics",
        pages: "580–615",
        topics: ["Code Reviews & Fagan Inspections", "Software Testing Strategies", "Cyclomatic Complexity", "Defect Tracking"]
      }
    ]
  },
  {
    id: 9,
    title: "Higher Engineering Mathematics",
    author: "B.S. Grewal",
    category: "MATHEMATICS",
    location: "Aisle M-2 • Rack R-03",
    availableCopies: 5,
    totalCopies: 8,
    status: "AVAILABLE",
    coverImage: null, // Displays emerald Mathematics CSS styled fallback
    isbn: "9788174091955",
    callNumber: "QA300 .G74 2017",
    shelfLocation: {
      floor: 1,
      wing: "Wing M (Applied Mathematics)",
      aisle: "M-2",
      rack: "R-03",
      shelfNumber: "S-2",
      x: 710,
      y: 190,
      capacity: 50,
      occupied: 42,
      neighbors: ["QA300 .B35 (Bali Engineering Math)", "QA300 .J34 (Jain Numerical Methods)"]
    },
    curriculum: [
      { branch: "CSE", semester: 2, courseCode: "MA201", courseTitle: "Engineering Mathematics II", isCore: true },
      { branch: "ECE", semester: 2, courseCode: "MA202", courseTitle: "Differential Equations & Transforms", isCore: true },
      { branch: "EEE", semester: 2, courseCode: "MA203", courseTitle: "Linear Algebra & Transforms", isCore: true },
      { branch: "Civil", semester: 2, courseCode: "MA204", courseTitle: "Calculus & Vector Analysis", isCore: true },
      { branch: "IOT", semester: 2, courseCode: "MA205", courseTitle: "Mathematical Foundations of IoT", isCore: true }
    ],
    chapters: [
      {
        chapterNumber: 21,
        title: "Laplace Transforms & Inverse Transforms",
        pages: "721–785",
        topics: ["Laplace Transforms", "First and Second Shifting Theorems", "Inverse Laplace Transforms", "Convolution Theorem", "Solving Differential Equations"]
      },
      {
        chapterNumber: 10,
        title: "Fourier Series and Harmonic Analysis",
        pages: "374–420",
        topics: ["Fourier Series", "Dirichlet's Conditions", "Half-Range Fourier Expansions", "Harmonic Analysis"]
      },
      {
        chapterNumber: 26,
        title: "Partial Differential Equations",
        pages: "860–912",
        topics: ["Separation of Variables", "Wave Equation 1D", "Heat Equation 1D", "Laplace Equation in 2D"]
      }
    ]
  },
  {
    id: 10,
    title: "Advanced Engineering Mathematics",
    author: "Erwin Kreyszig",
    category: "MATHEMATICS",
    location: "Aisle M-1 • Rack R-02",
    availableCopies: 4,
    totalCopies: 6,
    status: "AVAILABLE",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780470458365-L.jpg",
    isbn: "9780470458365",
    callNumber: "QA401 .K74 2011",
    shelfLocation: {
      floor: 1,
      wing: "Wing M (Applied Mathematics)",
      aisle: "M-1",
      rack: "R-02",
      shelfNumber: "S-1",
      x: 710,
      y: 120,
      capacity: 40,
      occupied: 33,
      neighbors: ["QA401 .Z55 (Zill Advanced Engineering Math)", "QA401 .A73 (Arfken Mathematical Physics)"]
    },
    curriculum: [
      { branch: "CSE", semester: 3, courseCode: "MA301", courseTitle: "Discrete Mathematics & Probability", isCore: true },
      { branch: "ECE", semester: 3, courseCode: "MA302", courseTitle: "Complex Variables & Linear Algebra", isCore: true },
      { branch: "AI&DS", semester: 3, courseCode: "MA303", courseTitle: "Linear Algebra & Optimization", isCore: true }
    ],
    chapters: [
      {
        chapterNumber: 7,
        title: "Linear Algebra: Matrices, Vectors & Determinants",
        pages: "256–310",
        topics: ["Gaussian Elimination", "Matrix Rank and Linear Independence", "Eigenvalues and Eigenvectors", "Diagonalization of Matrices"]
      },
      {
        chapterNumber: 13,
        title: "Complex Numbers & Cauchy-Riemann Equations",
        pages: "608–650",
        topics: ["Analytic Functions", "Cauchy-Riemann Equations", "Cauchy's Integral Theorem", "Residue Theorem"]
      },
      {
        chapterNumber: 24,
        title: "Probability Theory and Random Variables",
        pages: "1011–1055",
        topics: ["Bayes' Theorem", "Binomial and Poisson Distributions", "Normal Gaussian Distribution", "Hypothesis Testing"]
      }
    ]
  },
  {
    id: 11,
    title: "Electronic Devices and Circuit Theory",
    author: "Robert L. Boylestad, Louis Nashelsky",
    category: "ELECTRONICS",
    location: "Aisle E-4 • Rack R-02",
    availableCopies: 2,
    totalCopies: 4,
    status: "AVAILABLE",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780132622264-L.jpg",
    isbn: "9780132622264",
    callNumber: "TK7867 .B66 2013",
    shelfLocation: {
      floor: 2,
      wing: "Wing E (Electronics & Microcircuits)",
      aisle: "E-4",
      rack: "R-02",
      shelfNumber: "S-2",
      x: 820,
      y: 290,
      capacity: 45,
      occupied: 37,
      neighbors: ["TK7867 .S43 (Sedra & Smith Microelectronic Circuits)", "TK7867 .M54 (Millman Integrated Electronics)"]
    },
    curriculum: [
      { branch: "ECE", semester: 3, courseCode: "EC301", courseTitle: "Electronic Devices and Circuits", isCore: true },
      { branch: "EEE", semester: 3, courseCode: "EE301", courseTitle: "Analog Electronics", isCore: true },
      { branch: "IOT", semester: 3, courseCode: "IO301", courseTitle: "Sensors & Actuator Electronics", isCore: true }
    ],
    chapters: [
      {
        chapterNumber: 5,
        title: "BJT DC Biasing and Transistor Modeling",
        pages: "240–310",
        topics: ["Fixed-Bias Configuration", "Voltage-Divider Bias", "Collector Feedback Bias", "Thermal Stability Factor"]
      },
      {
        chapterNumber: 6,
        title: "Field-Effect Transistors & MOSFET Biasing",
        pages: "311–395",
        topics: ["MOSFET Biasing", "Enhancement-type MOSFETs", "Depletion-type MOSFETs", "CMOS Inverter Operation", "Drain Current Shockley Equation"]
      },
      {
        chapterNumber: 10,
        title: "Operational Amplifiers (Op-Amps) & Feedback",
        pages: "560–620",
        topics: ["Inverting & Non-Inverting Op-Amp", "CMRR Common-Mode Rejection", "Active Filter Topologies", "Schmitt Trigger"]
      }
    ]
  },
  {
    id: 12,
    title: "Signals and Systems",
    author: "Alan V. Oppenheim, Alan S. Willsky, S. Hamid Nawab",
    category: "ELECTRONICS",
    location: "Aisle E-2 • Rack R-04",
    availableCopies: 3,
    totalCopies: 5,
    status: "AVAILABLE",
    coverImage: "https://covers.openlibrary.org/b/isbn/9780138147570-L.jpg",
    isbn: "9780138147570",
    callNumber: "TK5102.5 .O66 1997",
    shelfLocation: {
      floor: 2,
      wing: "Wing E (Electronics & Microcircuits)",
      aisle: "E-2",
      rack: "R-04",
      shelfNumber: "S-3",
      x: 820,
      y: 190,
      capacity: 40,
      occupied: 34,
      neighbors: ["TK5102.5 .H39 (Haykin Signals and Systems)", "TK5102.5 .P76 (Proakis Digital Signal Processing)"]
    },
    curriculum: [
      { branch: "ECE", semester: 3, courseCode: "EC302", courseTitle: "Signals and Systems", isCore: true },
      { branch: "EEE", semester: 3, courseCode: "EE302", courseTitle: "Signals & Linear Systems", isCore: true },
      { branch: "IOT", semester: 3, courseCode: "IO303", courseTitle: "Signals & Sensor Data Processing", isCore: true }
    ],
    chapters: [
      {
        chapterNumber: 2,
        title: "Linear Time-Invariant (LTI) Systems & Convolution",
        pages: "74–140",
        topics: ["Continuous-Time Convolution Integral", "Discrete-Time Convolution Sum", "Properties of LTI Systems", "Causality and Stability"]
      },
      {
        chapterNumber: 4,
        title: "Continuous-Time Fourier Transform (CTFT)",
        pages: "284–358",
        topics: ["Fourier Transform Synthesis & Analysis", "Properties of CTFT", "Duality & Parseval's Relation", "Frequency Response of LTI Systems"]
      },
      {
        chapterNumber: 7,
        title: "Sampling and Nyquist-Shannon Theorem",
        pages: "514–554",
        topics: ["Nyquist Sampling Rate", "Aliasing and Anti-Aliasing Filters", "Reconstruction from Samples", "Discrete-Time Processing of Continuous Signals"]
      },
      {
        chapterNumber: 10,
        title: "The Z-Transform in Discrete-Time Systems",
        pages: "741–796",
        topics: ["Region of Convergence (ROC)", "Inverse Z-Transform", "Poles and Zeros", "Transfer Function H(z)"]
      }
    ]
  }
];

export const CATEGORIES = [
  'All',
  'COMPUTER SCIENCE',
  'SOFTWARE ENGINEERING',
  'ARTIFICIAL INTELLIGENCE',
  'PROGRAMMING',
  'MATHEMATICS',
  'ELECTRONICS',
  'NETWORKING'
];

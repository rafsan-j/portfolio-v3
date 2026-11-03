import type {
  Project,
  ArchiveEntry,
  InkwellPost,
  MapLocation,
  GalleryImage,
} from './supabase';

export const DEFAULT_AI_SYSTEM_PROMPT = `You are RJ.AI, the intelligent assistant embedded in Rafsan Jani's portfolio. Answer concisely, confidently, and accurately based on this profile.

PROFILE OVERVIEW:
- Name: Rafsan Jani
- Current Education: B.Sc. (Engineering) in Computer Science and Engineering (CSE) at Shahjalal University of Science and Technology (SUST), Sylhet, Bangladesh (Freshman, Batch CSE-25).
- Current Roles:
  1. AI & Automation Executive / Business Systems Strategist at Waffle Up (architecting AI workflow automations, franchise SOPs, supply-chain logistics, and unit-economics models).
  2. STEM & Programming Instructor at Tworon (teaching programming, math, and science; creating programmatic 60 FPS Manim animations and practical workbooks).
  3. Author — writing 'Ordhek Deen', an analytical book combining neuroscience, psychology, and Islamic jurisprudence (fiqh).
- Prior Education: Rajshahi Cadet College (Graduated 2025). HSC GPA 5.00/5.00 — 17th on the National Merit List (Top 0.01% of 180,000+ candidates, Talentpool Merit Scholarship 2025). SSC GPA 5.00/5.00 — 18th Nationally.
- Leadership: College Prefect at Rajshahi Cadet College (highest student leadership post, led 297 cadets). Awarded Best All-Round Cadet, Best Disciplined Cadet, and ISSB Green Card (recommended as a Commissioned Officer, Bangladesh Army).
- Location: Currently based in Sylhet, Bangladesh (Hometown: Dinajpur, Bangladesh).
- Languages: Bengali (Native), English (C1 Advanced), Arabic (Introductory).

TECHNICAL SKILLS:
- Languages: C, C++, Kotlin, Python, TypeScript, JavaScript (ES6+), SQL, HTML5, CSS3
- Mobile & Web: Native Android (Jetpack Compose, Material 3, Room DB, AppWidgets, Custom 3D Canvas Shaders), Next.js 14, React, Three.js / React Three Fiber, Tailwind CSS, Framer Motion
- AI, Data & Backend: Agentic AI Workflows, Google Gemini API, Groq / Llama 3.3, Supabase (PostgreSQL, Auth, RLS, Edge Functions), Flask, Python Selenium Automation, Bayesian Regression, Manim, NumPy/SciPy Audio DSP
- Hardware & Security: Arduino Uno, ESP32, Raspberry Pi, SiPM & Optical/LDR Sensors, OSINT & EXIF Metadata Forensics

FLAGSHIP PROJECTS:
1. Kairyn (v5.1) — Flagship Native Android Habit & Rhythm OS: Built in Kotlin & Jetpack Compose. Features a zero-allocation 60 FPS Three.js-inspired 3D perspective live wallpaper engine (3D Plexus geodesic sphere, 3D Lorenz strange attractor, 3D Aurora, 3D Flow Field, 3D Terrain) with dynamic 30/60 FPS Choreographer throttling, WCAG 2.1 luminance contrast switching, self-healing home screen widgets, selective Google Calendar overlays on Home/Lock screens, biometric auto-lock, and 30-day OLS Rhythm Index forecasting.
2. S_Track — Modular Academic OS & CSE Roadmap Tracker: Built with Next.js, React, TypeScript, Supabase, and Tailwind CSS to structure and track university CSE coursework (Discrete Mathematics, Structured Programming in C) and competitive programming milestones.
3. ParallaxMascot3D — Sensor-Driven 5-Plane 3D Android Engine: Hardware gyroscope (TYPE_GAME_ROTATION_VECTOR) + spring-physics 3D parallax UI component in Kotlin/Compose with automatic edge-seeded flood-fill background separation and 3-slice 3D bevel extrusion.
4. AgriBase — Precision Agriculture Predictive Ecosystem: Converted 50,000+ unstructured agricultural records into a predictive crop-yield database using Python, Flask, PostgreSQL, and Bayesian Regression. Won the Bronze Medal at Innovation World Cup Bangladesh.
5. Punorabritti — Real-Time Transit Ticketing Automation: Python & Selenium automation suite monitoring real-time intercity bus ticket inventory on Shohoz.com (Dhaka–Dinajpur corridor).
6. Manim Mathematical Animation & Procedural Audio DSP Pipeline: Programmatic 60 FPS visual proof of Euclidean & Cavalieri triangle area invariance paired with 48 kHz stereo synth soundtracks and SFX synthesized directly in Python (NumPy/SciPy/FFmpeg).
7. Offline Clinical Prescription & Drug Inventory System: Zero-latency offline clinical web app deployed for a medical practice in Dinajpur for rapid patient prescriptions and local JSON drug catalog lookups.
8. Project ClearRiver: Award-winning IoT optical water turbidity analyzer and upcycled rice-husk bio-char filtration prototype built with Arduino Uno and LDR optical sensors.
9. CERN Beamline for Schools — Relativistic Muon Experiment: Particle physics experiment using Silicon Photomultipliers (SiPMs) and BC-408 plastic scintillators to verify relativistic time dilation at CERN's T9 beamline.
10. HAYTHAM X ONE: AI-managed Concentrating Solar Power (CSP) and green hydrogen energy nexus.
11. DCMD & PTR Water Purification: Solar membrane distillation system delivering 5L of safe drinking water per person daily.

AWARDS & HONORS:
- Talentpool Merit Scholarship (2025) — 17th on National Merit List (Top 0.01%)
- Innovation World Cup Bangladesh Bronze Medal — AgriBase
- International Youth Math Challenge (IYMC) Silver Honor (2024)
- College Science Competition Winner — Project ClearRiver
- ISSB Green Card — Bangladesh Army Officer Recommended
- TIB National Anti-Corruption Competition 1st Place (2022)
- IAAC Astronomy Competition Qualifier (2022)
- Bangladesh Junior Science Olympiad (BdJSO) National Winner (2020)

CONTACT:
- Email: rafsan2972jani@gmail.com | Phone: +880 1776-132121
- GitHub: https://github.com/rafsan-j | LinkedIn: https://linkedin.com/in/rafsan-jani72
- Resume: Available at /resume.pdf`;

export const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'proj-kairyn-v5',
    title: 'Kairyn v5.1 — Flagship Android Habit & Rhythm OS',
    description:
      'Native Kotlin & Jetpack Compose habit operating system featuring a zero-allocation 60 FPS 3D perspective live wallpaper engine, self-healing quick-check-in widgets, selective Google Calendar lock-screen overlays, and 30-day OLS Rhythm Index forecasting.',
    tech_stack: [
      'Kotlin',
      'Jetpack Compose',
      '3D Canvas Shaders',
      'Room DB',
      'Android Widgets',
      'Biometric Auth',
    ],
    github_url: 'https://github.com/rafsan-j',
    live_url: '',
    case_study: `PROBLEM:
Conventional mobile habit trackers suffer from passive drop-off, widget token desynchronization, and battery-draining live wallpapers on 120Hz OLED displays.

ARCHITECTURE & ENGINEERING:
• 60 FPS 3D Perspective Projection Engine: Built a zero-allocation 3D renderer in Kotlin (WallpaperCanvasRenderer & WallpaperRenderer) using perspective camera projection, 3D rotation matrices, depth-sorted alpha, and additive bloom across 5 real-time scenes: 3D Plexus (88-vertex Fibonacci geodesic sphere), 3D Lorenz Strange Attractor, 3D Aurora Silk, 3D Curl-Noise Flow Field, and 3D Topographic Terrain.
• Adaptive Frame Throttling & Luminance: Implemented a timestamp-delta Choreographer frame limiter (selectable 30 FPS Battery Saver / 60 FPS Smooth, auto-stepping to 30 FPS on the Lock Screen) and WCAG 2.1 relative-luminance contrast switching.
• Self-Healing Widgets & Calendar Sync: Engineered token auto-resynchronization in KairynQuickWidgetProvider, selective Google Calendar agenda overlays on Home/Lock screens, and Room DB v3→v4 migrations for customizable steppers.
• Predictive Analytics: Added 30-day Ordinary Least-Squares (OLS) Rhythm Index forecasting, momentum classification (Accelerating, Steady, Cooling), and RFC-4180 CSV + fault-tolerant JSON backup codecs.`,
    is_featured: true,
    sort_order: 1,
    created_at: '2026-10-23T00:00:00Z',
  },
  {
    id: 'proj-strack-os',
    title: 'S_Track — Modular Academic OS & CSE Roadmap Tracker',
    description:
      'Full-stack academic workspace built to structure, schedule, and track SUST CSE coursework, Discrete Mathematics & Structured Programming (C) syllabus milestones, and daily competitive programming targets.',
    tech_stack: ['Next.js', 'React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
    github_url: 'https://github.com/rafsan-j',
    live_url: '',
    case_study: `PROBLEM:
University engineering coursework across Structured Programming (C), Discrete Mathematics, lab evaluations, and competitive programming judges (Codeforces, VJudge, AtCoder) is scattered across disconnected syllabi and spreadsheets.

ARCHITECTURE & IMPACT:
• Modular Coursework Engine: Built with Next.js, TypeScript, and Supabase to map syllabus dependencies, track lecture/lab attendance, and break down exam preparation into actionable daily sprints.
• Competitive Programming Integration: Tracks problem-solving velocity, recursion/algorithmic topic mastery, and streak consistency in a unified low-latency dashboard.`,
    is_featured: true,
    sort_order: 2,
    created_at: '2026-09-15T00:00:00Z',
  },
  {
    id: 'proj-parallax-mascot',
    title: 'ParallaxMascot3D — Sensor-Driven 5-Plane 3D Android Engine',
    description:
      'Interactive 3D parallax UI component for Android combining hardware gyroscope tilt sensing (TYPE_GAME_ROTATION_VECTOR) with touch-drag spring physics, automatic flood-fill background separation, and 3-slice 3D bevel extrusion.',
    tech_stack: [
      'Kotlin',
      'Jetpack Compose',
      'Android SensorManager',
      'Custom Canvas',
      'Image Processing',
    ],
    github_url: 'https://github.com/rafsan-j',
    live_url: '',
    case_study: `PROBLEM:
Delivering tactile, depth-reactive 3D character cards on Android typically requires a heavy Unity/OpenGL runtime or manually pre-sliced multi-layer PSD assets.

ARCHITECTURE & IMPACT:
• Automated Background Matting (MascotBitmapSeparator): Implemented an edge-seeded flood-fill algorithm with soft alpha feathering on Dispatchers.Default to automatically isolate foreground silhouettes from raw raster/SVG embeds with zero manual asset prep.
• 5-Plane Depth Choreography: Renders a recessed stage with a counter-shifting radial spotlight (-0.85x depth), dynamic floating drop shadow (-0.45x), a 3-slice 3D extruded bevel stack for vinyl figurine thickness, pop-out hero layer (+1.15x out-of-bounds overflow), and an additive specular glare sweep.
• Dual Sensor + Touch Fusion: Blends smoothed hardware game-rotation-vector tilt with accelerometer fallback and bouncy spring touch-drag physics.`,
    is_featured: true,
    sort_order: 3,
    created_at: '2026-10-26T00:00:00Z',
  },
  {
    id: 'proj-agribase',
    title: 'AgriBase — Precision Agriculture Predictive Ecosystem',
    description:
      'Converted 50,000+ unstructured agricultural records into a predictive crop-yield and waste-reduction platform using Flask and Bayesian Regression. Won the Bronze Medal at Innovation World Cup Bangladesh.',
    tech_stack: ['Python', 'Flask', 'Bayesian Regression', 'PostgreSQL', 'Data Analysis'],
    github_url: 'https://github.com/rafsan-j',
    live_url: '',
    case_study: `PROBLEM:
Smallholder farmers in Bangladesh face severe post-harvest crop waste and unpredictable yield fluctuations due to fragmented historical data and lack of localized forecasting tools.

ARCHITECTURE & IMPACT:
• Data Ingestion & Cleaning: Processed and normalized over 50,000 unstructured regional agricultural records into a relational PostgreSQL schema.
• Predictive Modeling: Implemented Bayesian Regression pipelines served via a lightweight Flask web application to forecast crop yields, optimal planting windows, and spoilage risk.
• Recognition: Awarded the Bronze Medal at the Innovation World Cup Bangladesh.`,
    is_featured: true,
    sort_order: 4,
    created_at: '2024-11-10T00:00:00Z',
  },
  {
    id: 'proj-punorabritti',
    title: 'Punorabritti — Real-Time Transit Ticketing Automation Suite',
    description:
      'Python & Selenium automation engine that monitors real-time intercity bus ticket inventory, seat matrices, and schedule releases across Shohoz.com for the Dhaka–Dinajpur corridor.',
    tech_stack: ['Python', 'Selenium', 'Web Automation', 'REST APIs', 'JSON'],
    github_url: 'https://github.com/rafsan-j',
    live_url: '',
    case_study: `PROBLEM:
Peak-season intercity transit tickets between Dhaka, Sylhet, and Dinajpur sell out within minutes of release, requiring repetitive manual checking across multiple operator schedules.

ARCHITECTURE & IMPACT:
• Automated Route Polling: Built a headless Selenium & API polling pipeline in Python that queries multi-operator trip schedules, parses live seat availability matrices, and triggers instant alerts when target seats open.`,
    is_featured: false,
    sort_order: 5,
    created_at: '2026-05-20T00:00:00Z',
  },
  {
    id: 'proj-manim-dsp',
    title: 'Manim Mathematical Animation & Procedural Audio DSP Engine',
    description:
      'Programmatic 60 FPS mathematical proof and video synthesis pipeline pairing Manim Community visualizations with 48 kHz stereo ambient synth soundtracks and foley SFX generated in NumPy & SciPy.',
    tech_stack: ['Python', 'Manim', 'NumPy', 'SciPy', 'Audio DSP', 'FFmpeg'],
    github_url: 'https://github.com/rafsan-j',
    live_url: '',
    case_study: `PROBLEM:
Educational math animations often rely on generic stock music that fails to synchronize with geometric transformations and theorem beats.

ARCHITECTURE & IMPACT:
• 5-Act Visual Proof: Programmed a 60 FPS vertical animation proving Euclidean & Cavalieri triangle area invariance (A = 1/2 bh) via parallel rail apex glides, 16-slice Cavalieri micro-shearing, and 180° parallelogram doubling.
• Procedural Audio Synthesis: Wrote a custom Python DSP synthesizer using NumPy and SciPy to generate detuned Fmaj9–G6–Em9–Am9 synth pads, a 110 BPM marimba arpeggio, bandpass air whooshes, and mechanical rail-lock foley synced to exact frame timestamps.`,
    is_featured: true,
    sort_order: 6,
    created_at: '2026-10-23T00:00:00Z',
  },
  {
    id: 'proj-clinical-rx',
    title: 'Dynamic Medical Prescription & Offline Drug Inventory System',
    description:
      'Zero-latency, offline-first clinical web application deployed for a medical practice in Dinajpur to handle rapid patient prescription generation and instant local drug catalog lookups.',
    tech_stack: ['JavaScript', 'HTML5/CSS3', 'Local JSON DB', 'Print Engine'],
    github_url: 'https://github.com/rafsan-j',
    live_url: '',
    case_study: `PROBLEM:
Clinical practices in regional areas experience intermittent connectivity, making cloud-only EMR and prescription tools unreliable during high-volume patient consultation hours.

ARCHITECTURE & IMPACT:
• Offline-First Indexing: Engineered a browser-resident JSON drug inventory and dosage autocomplete engine with sub-millisecond search latency and standardized A4 prescription print formatting.`,
    is_featured: false,
    sort_order: 7,
    created_at: '2025-12-10T00:00:00Z',
  },
  {
    id: 'proj-clearriver',
    title: 'Project ClearRiver — IoT Optical Water Turbidity & Bio-Char Analyzer',
    description:
      'Science Fair winning multi-stage water filtration system utilizing upcycled rice-husk bio-char integrated with an Arduino Uno optical clarity analyzer and live web telemetry dashboard.',
    tech_stack: ['Arduino Uno', 'C/C++', 'Optical LDR Sensors', 'Bio-Char Filtration', 'IoT'],
    github_url: 'https://github.com/rafsan-j',
    live_url: '',
    case_study: `PROBLEM:
Low-cost rural water filters lack real-time saturation and turbidity diagnostics, leaving households unsure when filtration media is exhausted.

ARCHITECTURE & IMPACT:
• Upcycled Bio-Char Media: Combined multi-stage rice-husk bio-char adsorption with an Arduino-controlled optical emitter/LDR sensor array to quantify water clarity and display live quality metrics on a web dashboard. Won the College Science Competition Award.`,
    is_featured: false,
    sort_order: 8,
    created_at: '2025-02-18T00:00:00Z',
  },
  {
    id: 'proj-cern-muon',
    title: 'CERN Beamline for Schools — Relativistic Muon Experiment',
    description:
      'Designed a particle physics experiment using Silicon Photomultipliers (SiPMs) and BC-408 plastic scintillators to verify relativistic time dilation at the T9 beamline at CERN.',
    tech_stack: ['Particle Physics', 'SiPM Sensors', 'BC-408 Scintillators', 'Python', 'Data Analysis'],
    github_url: '',
    live_url: '',
    case_study: `PROBLEM:
Measuring relativistic time dilation of secondary cosmic and beamline muons requires nanosecond-level coincidence timing and momentum-filtered decay analysis.

ARCHITECTURE & IMPACT:
• Detector Geometry: Designed a multi-plate BC-408 plastic scintillator telescope coupled with Silicon Photomultipliers (SiPMs) and time-of-flight coincidence logic for CERN's T9 beamline competition.`,
    is_featured: true,
    sort_order: 9,
    created_at: '2024-03-15T00:00:00Z',
  },
  {
    id: 'proj-haytham',
    title: 'HAYTHAM X ONE — AI-Managed CSP Solar & Hydrogen Nexus',
    description:
      'Sustainable energy architecture integrating Concentrating Solar Power (CSP) heliostat fields with AI-driven load management and green hydrogen electrolysis.',
    tech_stack: ['Python', 'AI/ML', 'IoT', 'ESP32', 'Solar Engineering'],
    github_url: '',
    live_url: '',
    case_study: `Designed an integrated renewable energy nexus pairing dual-axis heliostat tracking with predictive AI dispatch and excess thermal-to-hydrogen conversion to address grid intermittency in Bangladesh.`,
    is_featured: false,
    sort_order: 10,
    created_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'proj-dcmd-water',
    title: 'DCMD & PTR — Integrated Solar Water Purification',
    description:
      'Sustainable solution for arsenic and salinity crises pairing modified Direct Contact Membrane Distillation with parabolic trough solar reflectors to provide 5L of safe water per person daily.',
    tech_stack: ['Environmental Engineering', 'Arduino', 'Sensor Integration', 'Thermodynamics'],
    github_url: '',
    live_url: '',
    case_study: `Engineered a decentralized solar-thermal desalination and arsenic removal unit using hydrophobic PTFE membranes and parabolic solar concentrators.`,
    is_featured: false,
    sort_order: 11,
    created_at: '2024-01-20T00:00:00Z',
  },
];

export const FALLBACK_ARCHIVE: ArchiveEntry[] = [
  {
    id: 'arch-manim-invariance',
    title: 'Euclidean & Cavalieri Area Invariance — Programmatic Visual Proof & DSP Synthesis',
    abstract_content:
      'A computational geometry and digital signal processing project demonstrating that triangles sharing an equal base and parallel altitude preserve constant area (A = 1/2 bh). Combines Cavalieri cross-sectional micro-slice shearing and Euclidean parallelogram doubling in Manim with frame-accurate 48 kHz procedural audio synthesis in NumPy/SciPy.',
    tags: ['Mathematics', 'Manim', 'Computational Geometry', 'Python', 'Audio DSP'],
    date_completed: '2026-10-23',
  },
  {
    id: 'arch-waffle-up-sop',
    title: 'Standard Operating Procedures & AI Automation Architecture for Modular Franchises',
    abstract_content:
      'Systems engineering and operational blueprint developed for Waffle Up. Covers automated inventory forecasting, raw ingredient supply-chain logistics, thermal batter preparation benchmarks, hygiene compliance matrices, and unit-economics optimization for high-throughput street-food kiosks.',
    tags: ['Operations Research', 'AI Automation', 'Systems Design', 'Supply Chain'],
    date_completed: '2026-08-15',
  },
  {
    id: 'arch-osint-forensics',
    title: 'OSINT Verification & Digital Image Metadata Forensics Workflow',
    abstract_content:
      'Technical field methodology for open-source intelligence (OSINT) media verification, multi-engine reverse image chronological indexing, InVID frame analysis, and command-line EXIF/IPTC/XMP header inspection and tamper detection using ExifTool.',
    tags: ['Cybersecurity', 'OSINT', 'Digital Forensics', 'Metadata Analysis'],
    date_completed: '2026-10-22',
  },
  {
    id: 'arch-heliostat',
    title: 'Harnessing the Sun — Advanced Heliostat Field Implementation',
    abstract_content:
      'A technical feasibility and systems proposal for utility-scale Concentrating Solar Power (CSP) heliostat field deployment in Bangladesh, analyzing solar irradiance profiles, thermal storage, and national grid cost-benefit projections.',
    tags: ['Solar Energy', 'Engineering', 'Bangladesh', 'Sustainability'],
    date_completed: '2024-06-01',
  },
  {
    id: 'arch-cern-muons',
    title: 'Dissecting Muons — CERN Beamline for Schools Experimental Design',
    abstract_content:
      'Full experimental proposal submitted to CERN’s Beamline for Schools competition. Uses BC-408 plastic scintillation detectors and Silicon Photomultipliers (SiPMs) to measure muon flux, decay lifetimes, and special-relativistic time dilation.',
    tags: ['Particle Physics', 'CERN', 'Experimental Design', 'Relativity'],
    date_completed: '2024-03-15',
  },
  {
    id: 'arch-cop26',
    title: 'British Council COP26 Climate Policy & Diplomacy Simulation',
    abstract_content:
      'Represented youth delegates in the British Council COP26 climate conference simulation, negotiating carbon mitigation frameworks, climate finance commitments, and sustainable development policy positions.',
    tags: ['Climate Policy', 'Leadership', 'International Relations'],
    date_completed: '2021-11-01',
  },
];

export const FALLBACK_POSTS: InkwellPost[] = [
  {
    id: 'post-3d-canvas-shaders',
    title: 'Engineering 60 FPS 3D Shaders on a Native 2D Android Canvas',
    slug: 'engineering-60fps-3d-shaders-android-canvas',
    excerpt:
      'How I built a zero-allocation Three.js-inspired 3D perspective engine—complete with a Fibonacci geodesic sphere and chaotic Lorenz attractor—directly inside Android’s WallpaperService.',
    reading_time: 5,
    is_published: true,
    created_at: '2026-10-25T12:00:00Z',
    updated_at: '2026-10-25T12:00:00Z',
    content: `## Why Not Just Use OpenGL or Unity?

When I started architecting **Kairyn v5.1**, my goal was clear: every time you unlock your phone, your habit momentum should feel alive—not trapped inside a static chart you forget to open.

Bringing a 3D live wallpaper to Android usually means spinning up a heavy \`GLSurfaceView\` context or embedding a game engine runtime. On modern 120Hz OLED displays, poorly throttled GL contexts drain battery and fight with system UI compositing. I wanted **zero heap allocations per frame**, deterministic 30/60 FPS throttling, and mathematical beauty using pure 3D projection math on Android's hardware-accelerated \`Canvas\`.

## The 3D Perspective Projection Pipeline

Every vertex $(x, y, z)$ in Kairyn's 3D scenes passes through two rotation matrices—pitch $R_x(\\theta_x)$ and yaw $R_y(\\theta_y)$—followed by perspective division:

\`\`\`
scale = fov / (fov + z_rot + cameraDistance)
screenX = centerX + x_rot * scale
screenY = centerY + y_rot * scale
\`\`\`

By pre-allocating primitive \`FloatArray\` buffers and sorting edges by transformed $z$-depth without creating boxed objects inside \`Choreographer.FrameCallback\`, the garbage collector never pauses a single frame.

## 5 Mathematical Worlds

1. **3D Plexus (Fibonacci Geodesic Sphere)**: 88 vertices distributed via the Golden Angle $\\phi = \\pi(3 - \\sqrt{5})$ with harmonic surface wave displacement.
2. **3D Lorenz Strange Attractor**: 160 segments tracing the chaotic differential system $dx/dt = \\sigma(y - x)$, $dy/dt = x(\\rho - z) - y$, $dz/dt = xy - \\beta z$ with glowing orbital energy pulses.
3. **3D Aurora Silk**: 6 parametric ribbon curtains rendered with additive bioluminescent bloom.
4. **3D Curl-Noise Flow Field**: Depth-sorted particles streaming through a trigonometric vector field with velocity-aligned motion streaks.
5. **3D Topographic Horizon**: A 19×11 perspective wireframe wave receding into the horizon.

## Adaptive Luminance & Battery Discipline

A live wallpaper is only useful if your HUD text stays readable and your battery lasts all day. By computing WCAG 2.1 relative luminance across the rendered backdrop, Kairyn dynamically flips its glass HUD and Google Calendar agenda overlays between crisp dark-on-light and light-on-dark typography—while automatically stepping down to 30 FPS on the Lock Screen.`,
  },
  {
    id: 'post-cadet-prefect-to-sust-cse',
    title: 'From Cadet Prefect to CSE at SUST: Discipline, Systems & Building',
    slug: 'from-cadet-prefect-to-sust-cse',
    excerpt:
      'Reflections on five years at Rajshahi Cadet College, leading 297 cadets as College Prefect, and bringing military-grade discipline into computer science and AI automation.',
    reading_time: 4,
    is_published: true,
    created_at: '2026-09-18T12:00:00Z',
    updated_at: '2026-09-18T12:00:00Z',
    content: `## Five Years That Forged Everything

At **Rajshahi Cadet College**, time is measured in bugle calls, boots on parade squares, and shared accountability. Being appointed **College Prefect**—entrusted with leading 297 cadets—taught me a lesson no textbook covers: *motivation is fleeting, but well-designed systems endure*.

When you are responsible for hundreds of peers while preparing for national board exams, you cannot rely on last-minute sprints. Every hour has a protocol. That structure carried me through earning a 5.00 GPA in both SSC and HSC and placing **17th on the National Merit List** out of more than 180,000 students.

## Transitioning to SUST & Software Engineering

Moving to **Sylhet** to begin my **B.Sc. in Computer Science and Engineering at SUST** opened a new frontier. Whether I am debugging pointer arithmetic in a C programming lab, proving recurrences in Discrete Mathematics, or architecting AI automation workflows at **Waffle Up**, the underlying principle is identical:

> Break complex, chaotic problems into clean, deterministic invariants.

## Why I Build Across Hardware, Mobile, and AI

Many developers stay strictly in one lane—either frontend, backend, or embedded hardware. I love the seams where those worlds collide:
- Writing C/C++ firmware for an **Arduino optical turbidity sensor** (*Project ClearRiver*)
- Training **Bayesian regression models** on 50,000+ agricultural records (*AgriBase*)
- Engineering **60 FPS 3D shaders and self-healing Android widgets** (*Kairyn*)
- Teaching younger students at **Tworon** how mathematical proofs come alive through code

The tools evolve every year. The discipline to ship stays constant.`,
  },
  {
    id: 'post-cognitive-pacing-and-systems',
    title: 'Cognitive Pacing: Designing Software and Writing for the Human Mind',
    slug: 'cognitive-pacing-software-and-writing',
    excerpt:
      'What neuroscience, psychology, and systems engineering teach us about information overload, active recall, and building tools that respect human attention.',
    reading_time: 4,
    is_published: true,
    created_at: '2026-10-10T12:00:00Z',
    updated_at: '2026-10-10T12:00:00Z',
    content: `## The Myth of Binge-Learning

While authoring my upcoming book—an analytical manual that weaves together psychology, neuroscience, and classical jurisprudence—I spent a lot of time studying **Cognitive Overload**.

When the human brain ingests dense, high-entropy information without pause, working memory saturates. Retention plummets. We see the exact same failure mode in software interfaces: dashboards that dump fifty unprioritized metrics on a user induce paralysis rather than action.

## Three Principles I Use in Both Writing and Code

1. **The Rule of Cognitive Pacing**: Good architecture reveals complexity progressively. In **S_Track** and **Kairyn**, the default view surfaces only today's highest-leverage actions, keeping 30-day Ordinary Least-Squares regression curves one tap away when you are ready to reflect.
2. **Active Recall Over Passive Consumption**: Whether I am teaching STEM students at **Tworon** or designing a habit tracker, passive reading creates the illusion of competence. True mastery requires active retrieval and immediate feedback loops.
3. **Principled Defaults**: Technology should never exploit human dopamine loops for empty screen time. Every notification, widget, or automation script should give time *back* to the human using it.`,
  },
];

export const FALLBACK_MAP_LOCATIONS: MapLocation[] = [
  {
    id: 'loc-sylhet',
    location_name: 'Sylhet',
    latitude: 24.8949,
    longitude: 91.8687,
    visited_date: '2025-06-01',
    story:
      'Current base — pursuing B.Sc. in Computer Science & Engineering at SUST amidst tea gardens, monsoon rain, and late-night coding sessions.',
    is_wishlist: false,
  },
  {
    id: 'loc-dinajpur',
    location_name: 'Dinajpur',
    latitude: 25.6279,
    longitude: 88.6326,
    visited_date: '2007-01-01',
    story:
      'Hometown. Where it all started—and where I deployed my first offline clinical prescription software and Punorabritti transit automation scripts.',
    is_wishlist: false,
  },
  {
    id: 'loc-rajshahi',
    location_name: 'Rajshahi',
    latitude: 24.3745,
    longitude: 88.6042,
    visited_date: '2020-01-01',
    story:
      'Rajshahi Cadet College — 5 formative years that forged discipline, brotherhood, and leadership as College Prefect over 297 cadets.',
    is_wishlist: false,
  },
  {
    id: 'loc-dhaka',
    location_name: 'Dhaka',
    latitude: 23.8103,
    longitude: 90.4125,
    visited_date: '2022-05-01',
    story:
      'The capital — national science & math olympiads, ISSB Green Card evaluation, Innovation World Cup, and big dreams.',
    is_wishlist: false,
  },
  {
    id: 'loc-rangpur',
    location_name: 'Rangpur',
    latitude: 25.7439,
    longitude: 89.2752,
    visited_date: '2023-03-01',
    story: 'Northern division headquarters — close to Dinajpur, rich in history and regional competitions.',
    is_wishlist: false,
  },
  {
    id: 'loc-coxs-bazar',
    location_name: "Cox's Bazar",
    latitude: 21.4272,
    longitude: 92.0058,
    story: "The world's longest natural sea beach — high on the exploration wishlist.",
    is_wishlist: true,
  },
  {
    id: 'loc-chittagong',
    location_name: 'Chittagong',
    latitude: 22.3569,
    longitude: 91.7832,
    story: 'Port city and gateway to the hill tracts — on the upcoming travel radar.',
    is_wishlist: true,
  },
];

// Self-contained SVG data-URI artworks so the Gallery (/visuals) looks rich immediately out of the box
function makeSvgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const FALLBACK_GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'gal-kairyn-3d',
    category: 'ui',
    caption: 'Kairyn v5.1 — 60 FPS 3D Geodesic Plexus & Lorenz Attractor Live Wallpaper Engine on Android',
    uploaded_at: '2026-10-24T00:00:00Z',
    image_url: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
        <defs>
          <radialGradient id="g1" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stop-color="#00ff88" stop-opacity="0.28"/>
            <stop offset="55%" stop-color="#00d4ff" stop-opacity="0.1"/>
            <stop offset="100%" stop-color="#05050a" stop-opacity="1"/>
          </radialGradient>
        </defs>
        <rect width="800" height="800" fill="#05050a"/>
        <rect width="800" height="800" fill="url(#g1)"/>
        <g stroke="#00ff88" stroke-opacity="0.35" fill="none" stroke-width="1.5">
          <circle cx="400" cy="380" r="210"/>
          <ellipse cx="400" cy="380" rx="210" ry="75" transform="rotate(25 400 380)"/>
          <ellipse cx="400" cy="380" rx="210" ry="75" transform="rotate(-35 400 380)"/>
          <ellipse cx="400" cy="380" rx="90" ry="210" transform="rotate(15 400 380)"/>
          <polygon points="400,170 580,275 580,485 400,590 220,485 220,275" stroke="#00d4ff" stroke-opacity="0.45"/>
        </g>
        <text x="60" y="690" fill="#00ff88" font-family="monospace" font-size="22" letter-spacing="4">// KAIRYN v5.1 3D ENGINE</text>
        <text x="60" y="725" fill="#8888aa" font-family="monospace" font-size="16">60 FPS Geodesic Plexus · Lorenz Attractor · WCAG 2.1 HUD</text>
      </svg>
    `),
  },
  {
    id: 'gal-manim-invariance',
    category: 'generative',
    caption: 'Manim 60 FPS Proof — Euclidean & Cavalieri Triangle Area Invariance (A = ½bh = 12.00 u²)',
    uploaded_at: '2026-10-23T00:00:00Z',
    image_url: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
        <rect width="800" height="800" fill="#070b14"/>
        <line x1="80" y1="220" x2="720" y2="220" stroke="#00d4ff" stroke-width="2" stroke-dasharray="8 6"/>
        <line x1="80" y1="540" x2="720" y2="540" stroke="#e8e8f0" stroke-width="3"/>
        <polygon points="240,540 560,540 190,220" fill="#00ff88" fill-opacity="0.12" stroke="#00ff88" stroke-width="2.5"/>
        <polygon points="240,540 560,540 410,220" fill="#00d4ff" fill-opacity="0.15" stroke="#00d4ff" stroke-width="2.5"/>
        <polygon points="240,540 560,540 650,220" fill="#a78bfa" fill-opacity="0.14" stroke="#a78bfa" stroke-width="2.5"/>
        <text x="60" y="680" fill="#00d4ff" font-family="monospace" font-size="22" letter-spacing="3">// CAVALIERI INVARIANCE</text>
        <text x="60" y="715" fill="#8888aa" font-family="monospace" font-size="16">Manim Community · Procedural 48kHz Synth &amp; Foley DSP</text>
      </svg>
    `),
  },
  {
    id: 'gal-parallax-mascot',
    category: 'ui',
    caption: 'ParallaxMascot3D — 5-Plane Sensor-Driven 3D Extrusion & Specular Glare Component',
    uploaded_at: '2026-10-26T00:00:00Z',
    image_url: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
        <rect width="800" height="800" fill="#120c1c"/>
        <rect x="170" y="150" width="460" height="460" rx="48" fill="#B190B6" fill-opacity="0.22" stroke="#f472b6" stroke-width="2"/>
        <rect x="200" y="180" width="400" height="400" rx="36" fill="#B190B6" fill-opacity="0.35" stroke="#a78bfa" stroke-width="2"/>
        <circle cx="400" cy="360" r="115" fill="#f472b6" fill-opacity="0.25" stroke="#ffffff" stroke-width="3"/>
        <text x="60" y="690" fill="#f472b6" font-family="monospace" font-size="22" letter-spacing="3">// PARALLAX MASCOT 3D</text>
        <text x="60" y="725" fill="#c8a8e8" font-family="monospace" font-size="16">Gyroscope Tilt · Flood-Fill Alpha Matting · 3-Slice Bevel</text>
      </svg>
    `),
  },
  {
    id: 'gal-cern-beamline',
    category: 'events',
    caption: 'CERN Beamline for Schools — Relativistic Muon Time-Dilation Telescope Schematic',
    uploaded_at: '2025-04-10T00:00:00Z',
    image_url: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
        <rect width="800" height="800" fill="#060913"/>
        <line x1="60" y1="380" x2="740" y2="380" stroke="#ffb400" stroke-width="4" stroke-dasharray="12 6"/>
        <rect x="210" y="230" width="36" height="300" fill="#00d4ff" fill-opacity="0.25" stroke="#00d4ff" stroke-width="2.5"/>
        <rect x="390" y="230" width="36" height="300" fill="#00d4ff" fill-opacity="0.25" stroke="#00d4ff" stroke-width="2.5"/>
        <rect x="570" y="230" width="36" height="300" fill="#00ff88" fill-opacity="0.25" stroke="#00ff88" stroke-width="2.5"/>
        <text x="60" y="690" fill="#ffb400" font-family="monospace" font-size="22" letter-spacing="3">// CERN T9 MUON DETECTOR</text>
        <text x="60" y="725" fill="#8888aa" font-family="monospace" font-size="16">BC-408 Scintillators · SiPM Coincidence Timing</text>
      </svg>
    `),
  },
];

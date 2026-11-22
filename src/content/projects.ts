import type { Project, SupportingProject } from './types';

export const FLAGSHIP_PROJECTS: Project[] = [
  {
    slug: 'ottobudget',
    index: '01',
    title: 'OttoBudget',
    subtitle: 'com.OttoBudget',
    tagline:
      'Offline-first native Android personal finance engine with zero-schema encrypted cloud backup and notification-based MFS tracking.',
    summary:
      'Native Kotlin and Jetpack Compose ledger that captures bKash, Nagad, Rocket, and bank alerts without SMS permissions and syncs via a single AES-256-GCM vault.',
    year: 'Ongoing',
    role: 'Creator & Android Engineer',
    category: 'android',
    status: 'active',
    featured: true,
    problem:
      'Most personal finance apps in Bangladesh either force tedious manual logging for every bKash, Nagad, Rocket, and bank transaction or declare broad SMS permissions that trigger Google Play Protect blocks on sideloaded APKs. Users also need encrypted cross-device backup without exposing plaintext financial schemas to a remote database.',
    architecture:
      'Built natively in Kotlin with Jetpack Compose and Room SQLite as the single local source of truth. Automated transaction capture runs through Android NotificationListenerService to parse MFS and bank alerts while staying completely free of READ_SMS and RECEIVE_SMS permissions. Cloud backup serializes local state into a single AES-256-GCM encrypted blob (vault.enc) stored in Supabase Storage with zero server-side table schema.',
    craftHighlights: [
      'Savings Vault with Stealth Mode unlocked via a long-press on the Wallet icon in the concentric dock.',
      'Proportional 7-day spending charts anchored to a strict ৳0 baseline with zero floor distortion.',
      'iOS-style magnifying drum wheel scheduler for recurring entries without soft-keyboard occlusion.',
      'Strict neutral-border Obsidian UI engineered for high legibility and low visual noise.',
    ],
    stack: [
      'Kotlin',
      'Jetpack Compose',
      'Room SQLite',
      'NotificationListenerService',
      'AES-256-GCM',
      'Supabase Storage',
    ],
    specs: [
      { label: 'Storage', value: 'Room SQLite + vault.enc' },
      { label: 'Encryption', value: 'AES-256-GCM' },
      { label: 'Alert Capture', value: 'NotificationListenerService' },
      { label: 'Package', value: 'com.OttoBudget' },
    ],
    links: {},
  },
  {
    slug: 'ujaan',
    index: '02',
    title: 'Ujaan (উজান)',
    tagline:
      'Flood-risk combine-harvester dispatch and storm scheduling platform for Bangladesh’s Haor Basin.',
    summary:
      'Three-module civic optimization system fusing Sentinel-1 SAR, FFWC river gauges, Open-Meteo, Bangla/Banglish intake, and an OR-Tools CP-SAT scheduler.',
    year: '2026',
    role: 'Systems & Optimization Engineer',
    context: 'AI Builders Hackathon 2026 — SUST CSE Team',
    team: [
      'Rafsan Jani',
      'Abdullah Al Araf',
      'Ahnaf Sadiq',
      'Shafkat Ahsan',
    ],
    category: 'ai-systems',
    status: 'hackathon',
    featured: true,
    problem:
      'Pre-monsoon flash floods in Bangladesh’s Haor Basin can submerge standing Boro rice crops within days, yet combine-harvester dispatch still relies on fragmented phone calls, unverified ground reports, and ad-hoc routing across patchy rural connectivity.',
    architecture:
      'Structured as three coordinated software modules: (1) a flood urgency scorer combining Sentinel-1 SAR satellite imagery, FFWC river gauge readings, Open-Meteo weather forecasts, and a 6-hour TTL field override; (2) an offline-first Android PWA and missed-call intake pipeline backed by a Pydantic-gated Bangla and Banglish LLM parser; and (3) a Google OR-Tools CP-SAT integer-linear scheduler that assigns harvesters across plots by urgency and travel constraints.',
    craftHighlights: [
      'Fuses Sentinel-1 SAR radar, FFWC hydrological gauges, Open-Meteo forecasts, and 6-hour TTL ground overrides into a unified urgency score.',
      'Supports low-connectivity farmers through an offline-first Android PWA paired with missed-call intake.',
      'Validates noisy Bangla and Banglish LLM extractions through strict Pydantic schemas before jobs reach the solver.',
      'Produces deterministic dispatch assignments with Google OR-Tools CP-SAT integer-linear optimization.',
    ],
    stack: [
      'Python',
      'OR-Tools CP-SAT',
      'Pydantic',
      'Sentinel-1 SAR',
      'FFWC River Gauges',
      'Open-Meteo',
      'Offline-First Android PWA',
    ],
    specs: [
      { label: 'Modules', value: 'Scorer · Intake · CP-SAT' },
      { label: 'Override TTL', value: '6 hours' },
      { label: 'Solver', value: 'OR-Tools CP-SAT' },
      { label: 'Context', value: 'AI Builders Hackathon 2026' },
    ],
    links: {},
  },
  {
    slug: 'mess-manager',
    index: '03',
    title: 'Mess Manager',
    tagline:
      'Period-scoped shared-living financial and meal accounting Android app built for exact BDT (৳) reconciliation.',
    summary:
      'Kotlin and Jetpack Compose hostel accounting engine running a 7-term balance formula in integer paisa with Hamilton / Largest-Remainder allocation.',
    year: 'Ongoing',
    role: 'Creator & Android Engineer',
    category: 'android',
    status: 'active',
    featured: true,
    problem:
      'Student hostels and shared messes in Bangladesh settle monthly meals, utilities, and deposits in BDT, where floating-point division introduces penny-level rounding drift that causes ledgers to fail reconciliation and erodes roommate trust.',
    architecture:
      'Implemented natively in Kotlin and Jetpack Compose around period-scoped ledgers. Every monetary figure is stored and computed strictly in integer paisa (1 BDT = 100 paisa) across a 7-term balance formula. Indivisible meal-rate remainders are allocated deterministically via the Hamilton (Largest-Remainder) method so total credits and debits reconcile to the exact paisa.',
    craftHighlights: [
      'Zero-drift integer-paisa accounting using the Hamilton / Largest-Remainder method across a 7-term balance formula.',
      'Concentric icon-only floating capsule bottom dock tuned for single-hand thumb reach.',
      'True linear 7-day charts for meal and expense trends without artificial baseline clamping.',
      'Anchored spotlight onboarding tour guiding first-time mess managers through period setup.',
    ],
    stack: [
      'Kotlin',
      'Jetpack Compose',
      'Integer-Paisa Engine',
      'Hamilton Method',
    ],
    specs: [
      { label: 'Precision', value: '1 BDT = 100 paisa (int)' },
      { label: 'Allocation', value: 'Hamilton Largest-Remainder' },
      { label: 'Formula', value: '7-term period balance' },
      { label: 'Navigation', value: 'Concentric icon-only dock' },
    ],
    links: {},
  },
  {
    slug: 'vellum',
    index: '04',
    title: 'Vellum',
    subtitle: 'Words, given voice',
    tagline:
      'Independent vocal-nasheed YouTube project and contemporary lyric archive powered by a programmatic Remotion video pipeline.',
    summary:
      'Code-driven Remotion v3.0 mastering pipeline generating 9 style-locked 16:9 scenes and 3 vertical Shorts for Qurrat al-Ayn (VLM-2026-001).',
    year: '2026',
    role: 'Creator & Pipeline Engineer',
    context: 'Release VLM-2026-001 — Qurrat al-Ayn',
    category: 'pipeline',
    status: 'shipped',
    featured: true,
    problem:
      'Authoring cohesive, high-bitrate lyric videos across both 16:9 widescreen and 9:16 vertical Shorts by hand makes typography pacing, camera drift, and visual consistency across scenes slow to iterate and difficult to reproduce.',
    architecture:
      'Engineered a programmatic Remotion v3.0 pipeline using --gl=angle GPU rasterization and libx264 CRF 18 encoding. Camera breathing, rack-focus bloom transitions, typography timing, and audio-reactive ribbons are authored declaratively in TypeScript and React to render 9 style-locked 16:9 scenes and 3 vertical Shorts from a single shared codebase.',
    craftHighlights: [
      'Programmatic gimbal camera breathing and rack-focus bloom transitions across scenes.',
      'Custom 3-layer SVG Bezier silk-ribbon visualizer reacting cleanly to vocal phrasing.',
      'Single codebase rendering 9 style-locked 16:9 scenes and 3 vertical Shorts for Qurrat al-Ayn (VLM-2026-001).',
      'Hardware-accelerated --gl=angle rasterization paired with libx264 CRF 18 mastering.',
    ],
    stack: [
      'Remotion v3.0',
      'TypeScript',
      'React',
      'SVG Bezier Graphics',
      'ANGLE GPU Rasterization',
      'FFmpeg (libx264 CRF 18)',
    ],
    specs: [
      { label: 'Pipeline', value: 'Remotion v3.0 (--gl=angle)' },
      { label: 'Encoding', value: 'libx264 CRF 18' },
      { label: 'Release', value: 'VLM-2026-001 (Qurrat al-Ayn)' },
      { label: 'Outputs', value: '9 × 16:9 scenes + 3 Shorts' },
    ],
    links: {},
  },
  {
    slug: 'living-sylhet-studio',
    index: '05',
    title: 'Living Sylhet 3D Studio',
    tagline:
      'Procedural PBR Three.js workspace recreating a rainy Sylhet desk with custom shaders, interactive hardware, and a canvas arcade.',
    summary:
      'Self-contained Three.js studio featuring a GLSL wet-glass rain shader, 78-keycap instanced keyboard, 64-district Bangladesh map, Beamline Breaker, and a dual-sided page-flip notebook.',
    year: '2026',
    role: 'Creator & Graphics Engineer',
    category: 'graphics',
    status: 'shipped',
    featured: true,
    problem:
      'Most 3D web portfolios either weigh down every page with heavy WebGL bundles or rely on static imported meshes with little tactile payoff. The goal was an atmospheric, procedural workspace isolated to its own route so editorial pages stay fast.',
    architecture:
      'Constructed procedurally in Three.js with physically based materials and custom GLSL shaders, mounted on /studio via an isolated full-viewport static document (studio-scene.html) with a same-origin postMessage bridge back to Next.js. Every object on the rainy Sylhet desk—window glass, instanced mechanical keyboard, mid-tower PC, Monitor Light Bar, hollow drawer, and curved page-flip hardcover notebook—is modeled and rigged in code.',
    craftHighlights: [
      'Custom GLSL wet-glass rain shader looking out onto a rainy Sylhet evening.',
      '78-keycap instanced mechanical keyboard, tabletop mid-tower PC, Monitor Light Bar, and hollow interactive drawer.',
      'Real 64-district Bangladesh map mounted directly inside the workspace.',
      'Playable 60 FPS HTML5 canvas arcade (Beamline Breaker) and true 3D curved dual-sided page-flip hardcover notebook.',
    ],
    stack: [
      'Three.js',
      'GLSL',
      'Procedural PBR',
      'InstancedMesh',
      'HTML5 Canvas',
      'TypeScript',
    ],
    specs: [
      { label: 'Route', value: '/studio (isolated)' },
      { label: 'Keyboard', value: '78-keycap InstancedMesh' },
      { label: 'Arcade', value: 'Beamline Breaker (60 FPS)' },
      { label: '2D Bundle Cost', value: '0 KB Three.js on /' },
    ],
    links: {
      live: '/studio',
    },
  },
];

export const SUPPORTING_PROJECTS: SupportingProject[] = [
  {
    slug: 'kairyn',
    title: 'Kairyn',
    tagline:
      'Offline-first Jetpack Compose study planner with home-screen Glance widgets.',
    summary:
      'Built natively in Kotlin and Jetpack Compose with local Room persistence and Jetpack Glance widgets for quick-glance daily study tracking.',
    stack: ['Kotlin', 'Jetpack Compose', 'Room', 'Jetpack Glance'],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return FLAGSHIP_PROJECTS.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return FLAGSHIP_PROJECTS.filter((p) => p.featured);
}

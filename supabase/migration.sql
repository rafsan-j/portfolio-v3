-- ============================================================
-- RAFSAN JANI PORTFOLIO v2.0 — Supabase SQL Migration & Seed
-- Paste this entire file into: Supabase → SQL Editor → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- 1. Lab Projects
create table if not exists pf_projects_lab (
  id              uuid default uuid_generate_v4() primary key,
  title           text not null,
  description     text,
  tech_stack      text[] default '{}',
  github_url      text,
  live_url        text,
  cover_image_url text,
  case_study      text,
  is_featured     boolean default false,
  sort_order      int default 0,
  created_at      timestamptz default now()
);

-- 2. Archive / Research
create table if not exists pf_projects_archive (
  id               uuid default uuid_generate_v4() primary key,
  title            text not null,
  abstract_content text,
  tags             text[] default '{}',
  pdf_url          text,
  date_completed   date,
  created_at       timestamptz default now()
);

-- 3. Inkwell Posts
create table if not exists pf_inkwell_posts (
  id              uuid default uuid_generate_v4() primary key,
  title           text not null,
  slug            text unique not null,
  content         text,
  cover_image_url text,
  excerpt         text,
  reading_time    int,
  is_published    boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- 4. Gallery Images
create table if not exists pf_gallery_images (
  id          uuid default uuid_generate_v4() primary key,
  image_url   text not null,
  caption     text,
  category    text default 'general',
  uploaded_at timestamptz default now()
);

-- 5. BD Map Locations
create table if not exists pf_map_locations (
  id            uuid default uuid_generate_v4() primary key,
  location_name text not null,
  latitude      numeric(10,7) not null,
  longitude     numeric(10,7) not null,
  visited_date  date,
  story         text,
  photo_url     text,
  is_wishlist   boolean default false,
  created_at    timestamptz default now()
);

-- 6. Contact Inbox
create table if not exists pf_inbox_messages (
  id           uuid default uuid_generate_v4() primary key,
  sender_name  text not null,
  sender_email text not null,
  message      text not null,
  is_read      boolean default false,
  created_at   timestamptz default now()
);

-- 7. AI Knowledge Base (single-row)
create table if not exists pf_ai_knowledge (
  id                 int primary key default 1,
  system_prompt_text text,
  last_updated       timestamptz default now(),
  constraint single_row check (id = 1)
);

-- 8. Visitor Counter (single-row)
create table if not exists pf_visitor_counter (
  id    int primary key default 1,
  count bigint default 0,
  constraint single_row check (id = 1)
);
insert into pf_visitor_counter (id, count) values (1, 128) on conflict (id) do nothing;

-- Enable Row Level Security (RLS)
alter table pf_projects_lab      enable row level security;
alter table pf_projects_archive  enable row level security;
alter table pf_inkwell_posts     enable row level security;
alter table pf_gallery_images    enable row level security;
alter table pf_map_locations     enable row level security;
alter table pf_inbox_messages    enable row level security;
alter table pf_ai_knowledge      enable row level security;
alter table pf_visitor_counter   enable row level security;

-- Drop old policies if re-running migration
drop policy if exists "public read lab"      on pf_projects_lab;
drop policy if exists "admin all lab"        on pf_projects_lab;
drop policy if exists "public read archive"  on pf_projects_archive;
drop policy if exists "admin all archive"    on pf_projects_archive;
drop policy if exists "public read posts"    on pf_inkwell_posts;
drop policy if exists "admin all posts"      on pf_inkwell_posts;
drop policy if exists "public read gallery"  on pf_gallery_images;
drop policy if exists "admin all gallery"    on pf_gallery_images;
drop policy if exists "public read map"      on pf_map_locations;
drop policy if exists "admin all map"        on pf_map_locations;
drop policy if exists "public insert msg"    on pf_inbox_messages;
drop policy if exists "admin all inbox"      on pf_inbox_messages;
drop policy if exists "public read ai"       on pf_ai_knowledge;
drop policy if exists "admin all knowledge"  on pf_ai_knowledge;
drop policy if exists "public read counter"  on pf_visitor_counter;
drop policy if exists "public update count"  on pf_visitor_counter;

-- Policies allowing public reads + /admin dashboard CRUD operations
create policy "admin all lab"        on pf_projects_lab     for all using (true) with check (true);
create policy "admin all archive"    on pf_projects_archive for all using (true) with check (true);
create policy "admin all posts"      on pf_inkwell_posts    for all using (true) with check (true);
create policy "admin all gallery"    on pf_gallery_images   for all using (true) with check (true);
create policy "admin all map"        on pf_map_locations    for all using (true) with check (true);
create policy "admin all inbox"      on pf_inbox_messages   for all using (true) with check (true);
create policy "admin all knowledge"  on pf_ai_knowledge     for all using (true) with check (true);
create policy "public read counter"  on pf_visitor_counter  for select using (true);
create policy "public update count"  on pf_visitor_counter  for update using (true) with check (true);

-- Clear old seed data before inserting updated v2.0 portfolio records
delete from pf_projects_lab;
delete from pf_projects_archive;
delete from pf_map_locations;

-- Seed: Updated AI Knowledge Base
insert into pf_ai_knowledge (id, system_prompt_text) values (1,
'You are RJ.AI, the intelligent assistant representing Rafsan Jani. Answer concisely, confidently, and accurately based on this profile.

PROFILE:
Name: Rafsan Jani
Education: B.Sc. (Engineering) in Computer Science and Engineering (CSE) at Shahjalal University of Science and Technology (SUST), Sylhet, Bangladesh (Freshman, Batch CSE-25).
Prior Education: Rajshahi Cadet College (Graduated 2025). HSC GPA 5.00/5.00 — 17th on National Merit List (Top 0.01% of 180,000+ students, Talentpool Merit Scholarship 2025). SSC GPA 5.00/5.00 — 18th Nationally.
Current Roles:
- AI & Automation Executive / Business Systems Strategist at Waffle Up (architecting AI workflow automations, franchise SOPs, supply-chain models).
- STEM & Programming Instructor at Tworon (teaching programming, math, and science; building 60 FPS Manim animations).
- Author of "Ordhek Deen" (combining neuroscience, psychology, and Islamic jurisprudence).
Leadership: College Prefect at Rajshahi Cadet College — led 297 cadets. Best All-Round Cadet. Best Disciplined Cadet. ISSB Green Card (Army Officer recommended).
Skills: C, C++, Kotlin, Python, TypeScript, JavaScript, SQL, Jetpack Compose, Android SDK, 3D Canvas Shaders, Next.js 14, React, Three.js / React Three Fiber, Supabase, Tailwind CSS, Agentic AI, Gemini & Groq APIs, Selenium, Flask, Bayesian Regression, Manim, NumPy/SciPy Audio DSP, Arduino, ESP32, Raspberry Pi, OSINT & EXIF Forensics.
Languages: Bengali (Native), English (C1 Advanced), Arabic (Introductory).

KEY PROJECTS:
1. Kairyn v5.1 — Flagship Native Android Habit & Rhythm OS: Kotlin & Jetpack Compose app featuring a zero-allocation 60 FPS 3D perspective live wallpaper engine (geodesic sphere, Lorenz strange attractor, curl-noise flow fields), self-healing widgets, selective Google Calendar lock-screen overlays, and 30-day OLS Rhythm Index forecasting.
2. S_Track — Modular Academic OS & CSE Roadmap Tracker: Next.js, React, TypeScript, Supabase, and Tailwind CSS workspace for SUST CSE coursework & competitive programming.
3. ParallaxMascot3D — Sensor-Driven 5-Plane 3D Android Engine: Hardware gyroscope + touch-spring 3D parallax UI component with automatic flood-fill alpha matting.
4. AgriBase — Precision Agriculture Ecosystem: Bronze Medal at Innovation World Cup Bangladesh. Flask + Bayesian Regression over 50,000+ agricultural records.
5. Punorabritti: Python & Selenium real-time intercity bus ticket monitor for Shohoz.com.
6. Manim Mathematical Animation & Procedural Audio DSP Engine: 60 FPS geometric proof of Cavalieri & Euclidean area invariance with 48 kHz NumPy/SciPy synth soundtrack.
7. Offline Clinical Prescription & Drug Inventory System: Zero-latency clinical web app deployed in Dinajpur.
8. Project ClearRiver: Award-winning Arduino optical water turbidity & rice-husk bio-char analyzer.
9. CERN Beamline for Schools: Particle physics experiment using SiPMs and BC-408 scintillators to verify relativistic time dilation.
10. HAYTHAM X ONE & DCMD Water Purification: CSP solar/hydrogen energy nexus & solar membrane distillation.

CONTACT: rafsan2972jani@gmail.com | +880 1776-132121 | Sylhet & Dinajpur, Bangladesh
GitHub: https://github.com/rafsan-j | LinkedIn: https://linkedin.com/in/rafsan-jani72'
) on conflict (id) do update set system_prompt_text = excluded.system_prompt_text;

-- Seed: Updated Map Locations (Sylhet moved to Visited / Current Base!)
insert into pf_map_locations (location_name, latitude, longitude, visited_date, story, is_wishlist) values
  ('Sylhet',       24.8949, 91.8687, '2025-06-01', 'Current base — pursuing B.Sc. in Computer Science & Engineering at SUST amidst tea gardens, monsoon rain, and late-night coding sessions.', false),
  ('Dinajpur',     25.6279, 88.6326, '2007-01-01', 'Hometown. Where it all started—and where I deployed my first offline clinical prescription software and Punorabritti transit automation scripts.', false),
  ('Rajshahi',     24.3745, 88.6042, '2020-01-01', 'Rajshahi Cadet College — 5 formative years that forged discipline, brotherhood, and leadership as College Prefect over 297 cadets.', false),
  ('Dhaka',        23.8103, 90.4125, '2022-05-01', 'The capital — national science & math olympiads, ISSB Green Card evaluation, Innovation World Cup, and big dreams.', false),
  ('Rangpur',      25.7439, 89.2752, '2023-03-01', 'Northern division headquarters — close to Dinajpur, rich in history and regional competitions.', false),
  ('Cox''s Bazar', 21.4272, 92.0058, null,         'The world''s longest natural sea beach — high on the exploration wishlist.', true),
  ('Chittagong',   22.3569, 91.7832, null,         'Port city and gateway to the hill tracts — on the upcoming travel radar.', true);

-- Seed: Updated Lab Projects (11 Projects)
insert into pf_projects_lab (title, description, tech_stack, is_featured, sort_order, github_url, case_study) values
  ('Kairyn v5.1 — Flagship Android Habit & Rhythm OS',
   'Native Kotlin & Jetpack Compose habit operating system featuring a zero-allocation 60 FPS 3D perspective live wallpaper engine, self-healing quick-check-in widgets, selective Google Calendar lock-screen overlays, and 30-day OLS Rhythm Index forecasting.',
   ARRAY['Kotlin', 'Jetpack Compose', '3D Canvas Shaders', 'Room DB', 'Android Widgets', 'Biometric Auth'],
   true, 1, 'https://github.com/rafsan-j',
   'Built a zero-allocation 60 FPS 3D perspective projection renderer in Kotlin supporting 5 real-time 3D scenes (3D Plexus geodesic sphere, 3D Lorenz strange attractor, 3D Aurora, 3D Flow Field, 3D Terrain) with dynamic 30/60 FPS Choreographer throttling, WCAG 2.1 luminance adaptation, self-healing widgets, and 30-day OLS forecasting.'),

  ('S_Track — Modular Academic OS & CSE Roadmap Tracker',
   'Full-stack academic workspace built to structure, schedule, and track SUST CSE coursework, Discrete Mathematics & Structured Programming (C) syllabus milestones, and daily competitive programming targets.',
   ARRAY['Next.js', 'React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
   true, 2, 'https://github.com/rafsan-j',
   'Engineered a modular Next.js & Supabase platform mapping syllabus dependencies, lab evaluations, and competitive programming velocity across Codeforces, VJudge, and AtCoder.'),

  ('ParallaxMascot3D — Sensor-Driven 5-Plane 3D Android Engine',
   'Interactive 3D parallax UI component for Android combining hardware gyroscope tilt sensing (TYPE_GAME_ROTATION_VECTOR) with touch-drag spring physics, automatic flood-fill background separation, and 3-slice 3D bevel extrusion.',
   ARRAY['Kotlin', 'Jetpack Compose', 'Android SensorManager', 'Custom Canvas', 'Image Processing'],
   true, 3, 'https://github.com/rafsan-j',
   'Implemented edge-seeded flood-fill background separation on Dispatchers.Default and a 5-plane depth stage with counter-shifting spotlights, 3-slice bevel extrusion, and hardware gyroscope + spring physics.'),

  ('AgriBase — Precision Agriculture Predictive Ecosystem',
   'Converted 50,000+ unstructured agricultural records into a predictive crop-yield and waste-reduction platform using Flask and Bayesian Regression. Won the Bronze Medal at Innovation World Cup Bangladesh.',
   ARRAY['Python', 'Flask', 'Bayesian Regression', 'PostgreSQL', 'Data Analysis'],
   true, 4, 'https://github.com/rafsan-j',
   'Processed 50,000+ regional agricultural records into PostgreSQL and served Bayesian Regression yield & spoilage predictions via Flask. Awarded Bronze Medal at Innovation World Cup Bangladesh.'),

  ('Punorabritti — Real-Time Transit Ticketing Automation Suite',
   'Python & Selenium automation engine that monitors real-time intercity bus ticket inventory, seat matrices, and schedule releases across Shohoz.com for the Dhaka–Dinajpur corridor.',
   ARRAY['Python', 'Selenium', 'Web Automation', 'REST APIs', 'JSON'],
   false, 5, 'https://github.com/rafsan-j',
   'Automates high-demand route polling, live seat-matrix parsing, and instant availability alerts across multi-operator intercity schedules.'),

  ('Manim Mathematical Animation & Procedural Audio DSP Engine',
   'Programmatic 60 FPS mathematical proof and video synthesis pipeline pairing Manim Community visualizations with 48 kHz stereo ambient synth soundtracks and foley SFX generated in NumPy & SciPy.',
   ARRAY['Python', 'Manim', 'NumPy', 'SciPy', 'Audio DSP', 'FFmpeg'],
   true, 6, 'https://github.com/rafsan-j',
   'Built a 5-act 60 FPS visual proof of Euclidean & Cavalieri triangle area invariance paired with a custom NumPy/SciPy procedural audio synthesizer generating Fmaj9–Am9 synth beds and frame-accurate foley.'),

  ('Dynamic Medical Prescription & Offline Drug Inventory System',
   'Zero-latency, offline-first clinical web application deployed for a medical practice in Dinajpur to handle rapid patient prescription generation and instant local drug catalog lookups.',
   ARRAY['JavaScript', 'HTML5/CSS3', 'Local JSON DB', 'Print Engine'],
   false, 7, 'https://github.com/rafsan-j',
   'Eliminated internet dependency in clinical consultations by indexing the drug catalog in a sub-millisecond client-side JSON engine with standardized A4 print formatting.'),

  ('Project ClearRiver — IoT Optical Water Turbidity & Bio-Char Analyzer',
   'Science Fair winning multi-stage water filtration system utilizing upcycled rice-husk bio-char integrated with an Arduino Uno optical clarity analyzer and live web telemetry dashboard.',
   ARRAY['Arduino Uno', 'C/C++', 'Optical LDR Sensors', 'Bio-Char Filtration', 'IoT'],
   false, 8, 'https://github.com/rafsan-j',
   'Combined multi-stage rice-husk bio-char adsorption with an Arduino optical emitter/LDR turbidity sensor array and web dashboard.'),

  ('CERN Beamline for Schools — Relativistic Muon Experiment',
   'Designed a particle physics experiment using Silicon Photomultipliers (SiPMs) and BC-408 plastic scintillators to verify relativistic time dilation at the T9 beamline at CERN.',
   ARRAY['Particle Physics', 'SiPM Sensors', 'BC-408 Scintillators', 'Python', 'Data Analysis'],
   true, 9, null,
   'Designed a multi-plate BC-408 plastic scintillator telescope coupled with Silicon Photomultipliers (SiPMs) and time-of-flight coincidence logic for CERN T9 beamline competition.'),

  ('HAYTHAM X ONE — AI-Managed CSP Solar & Hydrogen Nexus',
   'Sustainable energy architecture integrating Concentrating Solar Power (CSP) heliostat fields with AI-driven load management and green hydrogen electrolysis.',
   ARRAY['Python', 'AI/ML', 'IoT', 'ESP32', 'Solar Engineering'],
   false, 10, null,
   'Integrated dual-axis heliostat tracking with predictive AI dispatch and green hydrogen production.'),

  ('DCMD & PTR — Integrated Solar Water Purification',
   'Sustainable solution for arsenic and salinity crises pairing modified Direct Contact Membrane Distillation with parabolic trough solar reflectors to provide 5L of safe water per person daily.',
   ARRAY['Environmental Engineering', 'Arduino', 'Sensor Integration', 'Thermodynamics'],
   false, 11, null,
   'Engineered a decentralized solar-thermal desalination and arsenic removal unit providing 5L of safe water per person daily.');

-- Seed: Updated Archive Entries
insert into pf_projects_archive (title, abstract_content, tags, date_completed) values
  ('Euclidean & Cavalieri Area Invariance — Programmatic Visual Proof & DSP Synthesis',
   'A computational geometry and digital signal processing project demonstrating that triangles sharing an equal base and parallel altitude preserve constant area (A = 1/2 bh). Combines Cavalieri cross-sectional micro-slice shearing and Euclidean parallelogram doubling in Manim with frame-accurate 48 kHz procedural audio synthesis in NumPy/SciPy.',
   ARRAY['Mathematics', 'Manim', 'Computational Geometry', 'Python', 'Audio DSP'],
   '2026-10-23'),
  ('Standard Operating Procedures & AI Automation Architecture for Modular Franchises',
   'Systems engineering and operational blueprint developed for Waffle Up. Covers automated inventory forecasting, raw ingredient supply-chain logistics, thermal batter preparation benchmarks, hygiene compliance matrices, and unit-economics optimization.',
   ARRAY['Operations Research', 'AI Automation', 'Systems Design', 'Supply Chain'],
   '2026-08-15'),
  ('OSINT Verification & Digital Image Metadata Forensics Workflow',
   'Technical field methodology for open-source intelligence (OSINT) media verification, multi-engine reverse image chronological indexing, InVID frame analysis, and command-line EXIF/IPTC/XMP header inspection using ExifTool.',
   ARRAY['Cybersecurity', 'OSINT', 'Digital Forensics', 'Metadata Analysis'],
   '2026-10-22'),
  ('Harnessing the Sun — Advanced Heliostat Field Implementation',
   'A proposal for advanced heliostat field implementation to address power generation challenges in Bangladesh, analyzing Concentrating Solar Power viability at national scale with cost-benefit projections.',
   ARRAY['Solar Energy', 'Engineering', 'Bangladesh', 'Sustainability'],
   '2024-06-01'),
  ('Dissecting Muons — CERN Beamline for Schools Experimental Design',
   'Full experimental design document for a particle physics experiment submitted to CERN''s Beamline for Schools competition using scintillation detectors to measure muon flux and verify time dilation predictions.',
   ARRAY['Particle Physics', 'CERN', 'Experimental Design', 'Relativity'],
   '2024-03-15'),
  ('British Council COP26 Climate Policy & Diplomacy Simulation',
   'Participated as a representative in the British Council''s COP26 climate conference simulation, negotiating environmental policy positions and sustainable development commitments.',
   ARRAY['Climate Policy', 'Leadership', 'International Relations'],
   '2021-11-01');

-- Seed: Pre-published Inkwell Posts
insert into pf_inkwell_posts (title, slug, excerpt, reading_time, is_published, content) values
  ('Engineering 60 FPS 3D Shaders on a Native 2D Android Canvas',
   'engineering-60fps-3d-shaders-android-canvas',
   'How I built a zero-allocation Three.js-inspired 3D perspective engine—complete with a Fibonacci geodesic sphere and chaotic Lorenz attractor—directly inside Android’s WallpaperService.',
   5, true,
   '## Why Not Just Use OpenGL or Unity?\n\nWhen I started architecting **Kairyn v5.1**, my goal was clear: every time you unlock your phone, your habit momentum should feel alive—not trapped inside a static chart you forget to open.\n\nBy pre-allocating primitive `FloatArray` buffers and projecting 3D vertices through pitch/yaw rotation matrices onto Android''s hardware-accelerated `Canvas`, Kairyn renders 5 mathematical 3D worlds (Fibonacci Geodesic Sphere, Lorenz Strange Attractor, Aurora Silk, Curl-Noise Flow Field, and Topographic Horizon) at 60 FPS with zero garbage-collection pauses.'),
  ('From Cadet Prefect to CSE at SUST: Discipline, Systems & Building',
   'from-cadet-prefect-to-sust-cse',
   'Reflections on five years at Rajshahi Cadet College, leading 297 cadets as College Prefect, and bringing military-grade discipline into computer science and AI automation.',
   4, true,
   '## Five Years That Forged Everything\n\nAt **Rajshahi Cadet College**, being appointed **College Prefect**—entrusted with leading 297 cadets—taught me a lesson no textbook covers: *motivation is fleeting, but well-designed systems endure*.\n\nMoving to **Sylhet** to begin my **B.Sc. in Computer Science and Engineering at SUST** while serving as AI & Automation Executive at **Waffle Up** and Instructor at **Tworon** opened a new frontier where hardware, mobile systems, and agentic AI meet.'),
  ('Cognitive Pacing: Designing Software and Writing for the Human Mind',
   'cognitive-pacing-software-and-writing',
   'What neuroscience, psychology, and systems engineering teach us about information overload, active recall, and building tools that respect human attention.',
   4, true,
   '## The Myth of Binge-Learning\n\nWhile authoring my upcoming book—an analytical manual weaving together psychology, neuroscience, and classical jurisprudence—I studied **Cognitive Overload** in depth.\n\nGood software and good writing follow the same invariant: reveal complexity progressively, prioritize active recall over passive consumption, and give time back to the human using the system.')
on conflict (slug) do nothing;

-- Visitor counter RPC
create or replace function increment_visitor_count()
returns bigint
language sql
as $$
  update pf_visitor_counter set count = count + 1 where id = 1 returning count;
$$;

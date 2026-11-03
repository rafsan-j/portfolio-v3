'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisitorMode } from '@/components/ui/VisitorModeProvider';
import { NavBar }          from '@/components/layout/NavBar';
import { WebGLBackground } from '@/components/sections/WebGLBackground';
import { FALLBACK_PROJECTS } from '@/lib/fallbackData';

const CyberLabGame = dynamic(() => import('@/components/sections/CyberLabGame'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#03060c] text-[#00d4ff] font-mono text-xs tracking-widest">
      // INITIALIZING 3D CYBER-DEFENSE SOC...
    </div>
  ),
});

const STATUSES = [
  'Role: AI & Automation Executive @ Waffle Up.',
  'Teaching STEM & Problem Solving @ Tworon.',
  'Studying: B.Sc. in CSE @ SUST (Sylhet).',
  'Shipping: Kairyn v5.1 Android OS (60 FPS 3D Shaders).',
  'Exploring: Agentic AI, OSINT Cyber-Defense & WebGL.',
  'Authoring: "Ordhek Deen" — Psychology, Neuroscience & Fiqh.',
];

const BENTO = [
  {
    href: '/lab',
    label: '// THE LAB',
    sub: '11 Engineered Systems & Builds',
    color: '#00ff88',
    size: 'md:col-span-2',
    icon: '⚗',
    preview: 'Kairyn v5.1 · S_Track · ParallaxMascot3D · AgriBase',
  },
  {
    href: '/archive',
    label: '// THE ARCHIVE',
    sub: 'Research, CERN & OSINT',
    color: '#00d4ff',
    size: 'md:col-span-1',
    icon: '◈',
    preview: 'Manim Proofs · CERN Muons · Waffle Up SOPs',
  },
  {
    href: '/inkwell',
    label: '// THE INKWELL',
    sub: 'Engineering Essays & Writing',
    color: '#a78bfa',
    size: 'md:col-span-1',
    icon: '✦',
    preview: '60 FPS 3D Shaders · RCC to SUST · Cognitive Pacing',
  },
  {
    href: '/visuals',
    label: '// VISUALS',
    sub: '3D Shaders & Generative Art',
    color: '#fb923c',
    size: 'md:col-span-1',
    icon: '◎',
    preview: 'Lorenz Attractor · Cavalieri Geometry · UI',
  },
  {
    href: '/map',
    label: '// COORDINATES',
    sub: 'Bangladesh Tactical Grid',
    color: '#34d399',
    size: 'md:col-span-2',
    icon: '◉',
    preview: 'Sylhet (SUST) · Dinajpur · Rajshahi (RCC) · Dhaka',
  },
  {
    href: '/contact',
    label: '// TRANSMISSION',
    sub: 'Collaborate or Hire',
    color: '#f472b6',
    size: 'md:col-span-1',
    icon: '▶',
    preview: 'Direct Inbox · Resume PDF · Socials',
  },
];

const TIMELINE = [
  {
    period: '2025 – Present',
    role: 'AI & Automation Executive',
    org: 'Waffle Up',
    loc: 'Bangladesh',
    color: '#00ff88',
    desc: 'Architecting AI workflow automations, digital inventory tracking, unit-economics forecasting, and standardized franchise operating procedures (SOPs).',
  },
  {
    period: '2025 – Present',
    role: 'STEM & Programming Instructor',
    org: 'Tworon',
    loc: 'Bangladesh',
    color: '#00d4ff',
    desc: 'Teaching programming, mathematics, and science; developing programmatic 60 FPS Manim animations with procedural Python DSP audio.',
  },
  {
    period: '2025 – Present',
    role: 'B.Sc. (Engg.) in Computer Science & Engineering',
    org: 'Shahjalal University of Science & Technology (SUST)',
    loc: 'Sylhet',
    color: '#a78bfa',
    desc: 'Undergraduate (Batch CSE-25). Active in Competitive Programming (Codeforces, VJudge, AtCoder), Structured Programming (C), and Discrete Mathematics.',
  },
  {
    period: '2020 – 2025',
    role: 'College Prefect & National Merit Scholar (17th)',
    org: 'Rajshahi Cadet College',
    loc: 'Rajshahi',
    color: '#ffb400',
    desc: 'Led 297 cadets as College Prefect. HSC GPA 5.00 (17th nationally, Top 0.01%, Talentpool Scholar) & SSC GPA 5.00 (18th nationally). ISSB Green Card & Best All-Round Cadet.',
  },
];

function TiltCard({
  children,
  className = '',
  glowColor = '#00ff88',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [spot, setSpot] = useState({ x: 50, y: 50, opacity: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotY = (px - 0.5) * 10;
    const rotX = (0.5 - py) * 10;
    setStyle({
      transform: `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(0)`,
    });
    setSpot({ x: px * 100, y: py * 100, opacity: 1 });
  };

  const onLeave = () => {
    setStyle({ transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)' });
    setSpot(s => ({ ...s, opacity: 0 }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ ...style, transition: 'transform 0.18s ease-out' }}
      className={`relative ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[10px] z-10 transition-opacity duration-300"
        style={{
          opacity: spot.opacity,
          background: `radial-gradient(360px circle at ${spot.x}% ${spot.y}%, ${glowColor}1c, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}

function RecruiterPage({
  onAI,
  onLaunchGame,
  visitorCount,
}: {
  onAI: () => void;
  onLaunchGame: () => void;
  visitorCount: number | null;
}) {
  const featured = FALLBACK_PROJECTS.slice(0, 6);

  return (
    <div className="theme-page pt-20 pb-20 px-4" style={{ fontFamily: 'var(--font-sans)' }}>
      <main className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 pt-6"
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border"
              style={{ borderColor: 'var(--c-border)', color: 'var(--c-accent-2)', background: 'var(--c-surface)' }}
            >
              ● Open to Software Engineering &amp; AI Roles
            </span>
            <span className="text-xs" style={{ color: 'var(--c-muted)' }}>
              Sylhet &amp; Dinajpur, Bangladesh
            </span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-light tracking-tight mb-4 leading-none"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--c-text)' }}
          >
            Rafsan Jani
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mb-7" style={{ color: 'var(--c-muted)' }}>
            Computer Science &amp; Engineering undergraduate at <strong>SUST</strong> (17th on the National Merit List, Top 0.01% of 180,000+ candidates) and <strong>AI &amp; Automation Executive at Waffle Up</strong>. I engineer native Android systems with 60 FPS 3D shaders, full-stack Next.js/Supabase platforms, and agentic AI automations.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 text-xs font-mono uppercase tracking-widest rounded transition-all"
              style={{ background: 'var(--c-text)', color: 'var(--c-bg)', fontWeight: 600 }}
            >
              ↓ Download 1-Page Resume (PDF)
            </a>
            <button
              onClick={onAI}
              className="px-6 py-3 text-xs font-mono uppercase tracking-widest rounded border transition-all"
              style={{ borderColor: 'var(--c-border)', color: 'var(--c-text)', background: 'var(--c-panel)' }}
            >
              ✦ Ask RJ.AI About Me
            </button>
            <button
              onClick={onLaunchGame}
              className="px-5 py-3 text-xs font-mono uppercase tracking-widest rounded border transition-all"
              style={{ borderColor: '#00d4ff66', color: '#00d4ff', background: 'rgba(0,212,255,0.08)' }}
            >
              🎮 Interactive 3D Cyber Lab
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14"
        >
          {[
            { v: 'Top 0.01%', l: 'National Merit (17th)', d: 'Of 180,000+ · Talentpool Scholar' },
            { v: 'SUST CSE',  l: 'B.Sc. in Engineering',  d: 'GPA 5.00×2 in HSC & SSC'         },
            { v: '50,000+',   l: 'Records Engineered',    d: 'Bronze — Innovation World Cup'    },
            { v: '297',       l: 'Cadets Led',            d: 'College Prefect & ISSB Green Card' },
          ].map(s => (
            <div key={s.l} className="panel p-5">
              <div
                className="text-2xl md:text-3xl font-light mb-1"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--c-text)' }}
              >
                {s.v}
              </div>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--c-text)' }}>
                {s.l}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--c-muted)' }}>
                {s.d}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <h2
            className="text-2xl font-light pb-3 mb-6 border-b"
            style={{ fontFamily: 'var(--font-serif)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
          >
            Experience, Leadership &amp; Education
          </h2>
          <div className="space-y-4">
            {TIMELINE.map(item => (
              <div key={item.role + item.org} className="panel p-5 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <h3 className="font-semibold text-base" style={{ color: 'var(--c-text)' }}>
                      {item.role}
                    </h3>
                    <span className="text-xs font-medium" style={{ color: 'var(--c-accent-2)' }}>
                      @ {item.org}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
                    {item.desc}
                  </p>
                </div>
                <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--c-muted)' }}>
                  {item.period} · {item.loc}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-baseline justify-between pb-3 mb-6 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <h2 className="text-2xl font-light" style={{ fontFamily: 'var(--font-serif)', color: 'var(--c-text)' }}>
              Selected Engineering Projects
            </h2>
            <Link href="/lab" className="text-xs font-mono underline" style={{ color: 'var(--c-accent-2)' }}>
              View All 11 Projects →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map(p => (
              <Link key={p.id} href="/lab" className="panel overflow-hidden flex flex-col hover:-translate-y-0.5 transition-all">
                {p.cover_image_url && (
                  <div className="w-full h-28 border-b overflow-hidden" style={{ borderColor: 'var(--c-border)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.cover_image_url} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-base mb-1.5" style={{ color: 'var(--c-text)' }}>
                    {p.title}
                  </h3>
                  <p className="text-xs leading-relaxed mb-4 flex-1" style={{ color: 'var(--c-muted)' }}>
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech_stack.slice(0, 5).map(t => (
                      <span key={t} className="tag tag-neon text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2
            className="text-2xl font-light pb-3 mb-5 border-b"
            style={{ fontFamily: 'var(--font-serif)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
          >
            Technical Toolchain
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              'C', 'C++', 'Kotlin', 'Python', 'TypeScript', 'JavaScript', 'SQL',
              'Jetpack Compose', 'Android SDK', '3D Canvas Shaders', 'Next.js 14', 'React',
              'Three.js / React Three Fiber', 'Supabase (PostgreSQL)', 'Tailwind CSS',
              'Agentic AI', 'Gemini & Groq APIs', 'Selenium Automation', 'Flask',
              'Bayesian Regression', 'Manim & Audio DSP', 'Arduino / ESP32', 'OSINT & EXIF Forensics',
            ].map(s => (
              <span key={s} className="tag tag-neon">
                {s}
              </span>
            ))}
          </div>
        </motion.section>

        <div
          className="pt-8 border-t flex flex-wrap items-center justify-between gap-4 text-xs"
          style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}
        >
          <div className="flex flex-wrap gap-5">
            <a href="mailto:rafsan2972jani@gmail.com" className="hover:underline">
              rafsan2972jani@gmail.com
            </a>
            <a href="https://github.com/rafsan-j" target="_blank" rel="noreferrer" className="hover:underline">
              GitHub (rafsan-j)
            </a>
            <a href="https://linkedin.com/in/rafsan-jani72" target="_blank" rel="noreferrer" className="hover:underline">
              LinkedIn (rafsan-jani72)
            </a>
          </div>
          <span>
            Sylhet, Bangladesh {visitorCount !== null ? `· ${visitorCount.toLocaleString()} portfolio visits` : ''}
          </span>
        </div>
      </main>
    </div>
  );
}

function FriendPage({
  onAI,
  onLaunchGame,
}: {
  onAI: () => void;
  onLaunchGame: () => void;
}) {
  return (
    <div className="theme-page pt-24 pb-20 px-4" style={{ fontFamily: 'var(--font-sans)' }}>
      <main className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-xl"
              style={{
                background: 'linear-gradient(135deg,#f472b6,#a78bfa,#38bdf8)',
                boxShadow: '0 10px 30px rgba(244,114,182,0.35)',
              }}
            >
              👋
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--c-text)' }}>
              Hey, I&apos;m Rafsan!
            </h1>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              CSE freshman at <strong>SUST in Sylhet</strong> (hometown Dinajpur!), AI &amp; Automation Executive at <strong>Waffle Up</strong>, teacher at <strong>Tworon</strong>, and a builder who loves turning wild ideas into apps, 3D shaders, and stories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {[
              {
                e: '🎓',
                t: "SUST CSE '25",
                b: 'Studying Computer Science in Sylhet after ranking 17th nationally (Top 0.01%).',
              },
              {
                e: '📱',
                t: 'Kairyn Android OS',
                b: 'Built a habit app with 60 FPS 3D live wallpapers & smart widgets.',
              },
              {
                e: '🤖',
                t: 'Waffle Up & Tworon',
                b: 'Building AI automations for Waffle Up + teaching STEM & Manim math.',
              },
              {
                e: '⚡',
                t: '297 Cadets Led',
                b: 'Former College Prefect at Rajshahi Cadet College & CERN competitor.',
              },
            ].map(c => (
              <motion.div
                key={c.t}
                whileHover={{ y: -4 }}
                className="panel p-4"
              >
                <div className="text-2xl mb-2">{c.e}</div>
                <p className="font-bold text-sm mb-1" style={{ color: 'var(--c-text)' }}>
                  {c.t}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--c-muted)' }}>
                  {c.b}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="panel p-5 mb-6">
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--c-accent)' }}
            >
              Right now in Sylhet I&apos;m...
            </p>
            <div className="space-y-2.5 text-sm" style={{ color: 'var(--c-text)' }}>
              {[
                ['🤖', 'Building agentic AI & franchise automations at Waffle Up'],
                ['🎓', 'Surviving C programming labs & Discrete Math at SUST'],
                ['👨‍🏫', 'Teaching students at Tworon & animating geometry with Manim'],
                ['✍️', 'Writing my book "Ordhek Deen" while running on Sylheti tea'],
              ].map(([e, t]) => (
                <div key={t} className="flex items-center gap-3">
                  <span className="text-lg">{e}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-4 mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--c-text)' }}>
                🎮 Want to play a 3D game inside my portfolio?
              </p>
              <p className="text-xs" style={{ color: 'var(--c-muted)' }}>
                Explore my 3D Cyber-Defense Lab &amp; intercept rogue packets!
              </p>
            </div>
            <button
              onClick={onLaunchGame}
              className="px-4 py-2 rounded-full text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)' }}
            >
              Play 3D Lab →
            </button>
          </div>

          <div className="flex gap-3">
            <Link
              href="/contact"
              className="flex-1 text-center py-3 rounded-full font-bold text-white text-sm shadow-lg"
              style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)' }}
            >
              Say Hello! 💌
            </Link>
            <button
              onClick={onAI}
              className="flex-1 py-3 rounded-full font-bold text-sm border-2 transition-all"
              style={{ borderColor: 'var(--c-accent)', color: 'var(--c-accent)' }}
            >
              Chat with My AI ✨
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function DeveloperPage({
  onAI,
  onLaunchGame,
  visitorCount,
}: {
  onAI: () => void;
  onLaunchGame: () => void;
  visitorCount: number | null;
}) {
  const [statusIdx, setStatusIdx] = useState(0);
  const [time, setTime]           = useState('');

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          timeZone: 'Asia/Dhaka',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setStatusIdx(i => (i + 1) % STATUSES.length), 3400);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <WebGLBackground />
      <NavBar />
      <main className="relative z-10 min-h-screen px-4 pb-20 max-w-6xl mx-auto pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className="status-dot" />
            <span className="text-xs tracking-widest font-mono text-[#00ff88]">
              DEVELOPER MODE // SUST-CSE-25
            </span>
            <span className="text-xs font-mono text-[#00d4ff] px-2 py-0.5 rounded border border-[#00d4ff]/30 bg-[#00d4ff]/5">
              SYLHET, BD · {time}
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-3 leading-none tracking-tight">
            <span className="glitch" style={{ color: '#00ff88' }} data-text="RAFSAN">
              RAFSAN
            </span>
            <span style={{ color: '#e8e8f0' }}> JANI</span>
          </h1>

          <p className="text-xs sm:text-sm tracking-[0.22em] uppercase mb-4 font-mono text-[#00d4ff]">
            CSE Undergrad @ SUST &nbsp;·&nbsp; AI &amp; Automation Executive @ Waffle Up &nbsp;·&nbsp; Educator @ Tworon
          </p>

          <p className="text-sm text-[#8888aa] max-w-2xl leading-relaxed mb-6">
            Ranked <span className="text-[#e8e8f0] font-semibold">17th Nationally (Top 0.01% of 180,000+ · Talentpool Scholar)</span> &amp; former <span className="text-[#e8e8f0] font-semibold">College Prefect leading 297 cadets</span> at Rajshahi Cadet College. Engineering 60 FPS 3D Android systems (<span className="text-[#00ff88]">Kairyn v5.1</span>), full-stack academic platforms (<span className="text-[#00d4ff]">S_Track</span>), and agentic AI automations.
          </p>

          <AnimatePresence mode="wait">
            <motion.p
              key={statusIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs tracking-widest mb-7 font-mono text-[#8888aa]"
            >
              &gt;&nbsp;<span style={{ color: '#00ff88' }}>{STATUSES[statusIdx]}</span>
              <span className="cursor" />
            </motion.p>
          </AnimatePresence>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={onLaunchGame}
              className="btn-neon"
              style={{ borderColor: '#00d4ff', color: '#00d4ff', boxShadow: '0 0 18px rgba(0,212,255,0.22)' }}
            >
              <span>🎮 Enter 3D Cyber-Defense Lab →</span>
            </button>
            <a href="/resume.pdf" target="_blank" rel="noreferrer" className="btn-neon">
              <span>↓ Resume PDF</span>
            </a>
            <button
              onClick={onAI}
              className="btn-neon"
              style={{ borderColor: '#a78bfa', color: '#a78bfa' }}
            >
              <span>✦ Ask RJ.AI</span>
            </button>
            <a
              href="https://github.com/rafsan-j"
              target="_blank"
              rel="noreferrer"
              className="btn-neon"
              style={{ borderColor: '#4a4a6a', color: '#8888aa' }}
            >
              <span>GitHub ↗</span>
            </a>
          </div>
        </motion.div>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs tracking-widest font-mono text-[#8888aa]">
              // COMMAND MATRIX (3D PERSPECTIVE TILT)
            </p>
            <span className="text-[11px] font-mono text-[#4a4a6a]">Hover to tilt · Click to explore</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {BENTO.map((cell, i) => (
              <motion.div
                key={cell.href}
                className={cell.size}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <TiltCard glowColor={cell.color} className="h-full">
                  <Link href={cell.href} className="block h-full">
                    <div className="panel panel-accent p-5 group cursor-pointer transition-all duration-300 min-h-[140px] h-full flex flex-col hover:border-[#00ff88]/40">
                      <div className="flex items-start justify-between mb-3">
                        <span
                          className="font-display text-xs tracking-widest font-bold"
                          style={{ color: cell.color }}
                        >
                          {cell.label}
                        </span>
                        <span className="text-xl opacity-40 group-hover:opacity-90 transition-opacity">
                          {cell.icon}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-auto text-[#e8e8f0]">{cell.sub}</p>
                      <p className="text-xs mt-3 font-mono text-[#8888aa] group-hover:text-[#00ff88] transition-colors">
                        {cell.preview}
                      </p>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs tracking-widest font-mono text-[#00ff88] mb-1">
                // FEATURED SYSTEMS
              </p>
              <h2 className="font-display text-2xl font-bold text-[#e8e8f0]">
                Recent Flagship Builds
              </h2>
            </div>
            <Link href="/lab" className="text-xs font-mono text-[#00d4ff] hover:underline">
              All 11 Projects →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FALLBACK_PROJECTS.filter(p => p.is_featured)
              .slice(0, 6)
              .map((proj, idx) => (
                <motion.div
                  key={proj.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: idx * 0.07 }}
                >
                  <TiltCard glowColor="#00d4ff" className="h-full">
                    <Link href="/lab" className="block h-full">
                      <div className="panel overflow-hidden h-full flex flex-col hover:border-[#00d4ff]/40">
                        {proj.cover_image_url && (
                          <div className="w-full h-28 border-b border-[#1a1a2e] overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={proj.cover_image_url} alt={proj.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono text-[#00ff88] uppercase tracking-widest">
                              BUILD 0{idx + 1}
                            </span>
                            <span className="tag tag-amber text-[9px]">Featured</span>
                          </div>
                          <h3 className="font-display text-sm font-bold text-[#e8e8f0] mb-2">
                            {proj.title}
                          </h3>
                          <p className="text-xs text-[#8888aa] leading-relaxed mb-4 flex-1 line-clamp-3">
                            {proj.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-auto">
                            {proj.tech_stack.slice(0, 4).map(t => (
                              <span key={t} className="tag tag-cyan text-[9px]">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </motion.div>
              ))}
          </div>
        </section>

        <section className="mb-16">
          <p className="text-xs tracking-widest font-mono text-[#00d4ff] mb-1">
            // OPERATIONAL LOG
          </p>
          <h2 className="font-display text-2xl font-bold text-[#e8e8f0] mb-6">
            Experience, SUST CSE &amp; Leadership
          </h2>
          <div className="space-y-3 border-l-2 border-[#1a1a2e] pl-5 ml-2">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.role + item.org}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative panel p-5"
              >
                <span
                  className="absolute -left-[27px] top-6 w-3 h-3 rounded-full"
                  style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
                />
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h3 className="font-display text-sm font-bold text-[#e8e8f0]">
                    {item.role}{' '}
                    <span className="font-mono text-xs" style={{ color: item.color }}>
                      @ {item.org}
                    </span>
                  </h3>
                  <span className="text-[11px] font-mono text-[#8888aa]">
                    {item.period} · {item.loc}
                  </span>
                </div>
                <p className="text-xs text-[#8888aa] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <div
          className="text-center text-xs tracking-widest border-t pt-8 font-mono"
          style={{ color: '#8888aa', borderColor: '#1a1a2e' }}
        >
          Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-[#0d0d12] border border-[#1a1a2e] text-[#00ff88]">
            `
          </kbd>{' '}
          terminal &nbsp;·&nbsp;
          <kbd className="px-1.5 py-0.5 rounded bg-[#0d0d12] border border-[#1a1a2e] text-[#00d4ff]">
            ⌘K
          </kbd>{' '}
          command palette &nbsp;·&nbsp;
          <button
            onClick={onLaunchGame}
            className="underline text-[#00d4ff] hover:text-[#00ff88] ml-1"
          >
            Launch 3D Cyber Lab
          </button>
          {visitorCount !== null && (
            <span className="ml-3 text-[#4a4a6a]">· {visitorCount.toLocaleString()} visits</span>
          )}
        </div>
      </main>
    </>
  );
}

export default function HomePage() {
  const { mode, setMode, setAiOpen, visitorCount } = useVisitorMode();
  const launchGame = () => setMode('game');

  return (
    <>
      {mode === 'developer' && (
        <DeveloperPage
          onAI={() => setAiOpen(true)}
          onLaunchGame={launchGame}
          visitorCount={visitorCount}
        />
      )}
      {mode === 'recruiter' && (
        <>
          <NavBar />
          <RecruiterPage
            onAI={() => setAiOpen(true)}
            onLaunchGame={launchGame}
            visitorCount={visitorCount}
          />
        </>
      )}
      {mode === 'friend' && (
        <>
          <NavBar />
          <FriendPage onAI={() => setAiOpen(true)} onLaunchGame={launchGame} />
        </>
      )}
      {mode === 'game' && (
        <>
          <NavBar />
          <CyberLabGame onOpenAI={() => setAiOpen(true)} />
        </>
      )}
    </>
  );
}

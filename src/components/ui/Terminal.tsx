'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisitorMode } from '@/components/ui/VisitorModeProvider';

const CMDS: Record<string, string[]> = {
  help: [
    'Available commands:',
    '  help · ls · whoami · game (launch 3D Cyber Lab)',
    '  cat about.txt · cat experience.txt · cat projects.txt',
    '  cat skills.txt · cat awards.txt · cd <route> · clear · exit',
  ],
  ls: [
    'drwxr-xr-x  /lab      → 11 Projects (Kairyn, S_Track, AgriBase...)',
    'drwxr-xr-x  /archive  → Research & Technical Papers',
    'drwxr-xr-x  /inkwell  → Essays & Engineering Deep Dives',
    'drwxr-xr-x  /visuals  → 3D & Generative Visuals',
    'drwxr-xr-x  /map      → Bangladesh Coordinates (Sylhet, Dinajpur...)',
    'drwxr-xr-x  /contact  → Direct Transmission & Resume PDF',
  ],
  whoami: [
    'rafsan-jani',
    'B.Sc. in CSE @ SUST (Sylhet) | AI & Automation Executive @ Waffle Up | Educator @ Tworon',
    'Top 0.01% National Merit (17th of 180,000+ in HSC · Talentpool Scholar)',
    'Former College Prefect — Rajshahi Cadet College (Led 297 Cadets)',
    'Sylhet & Dinajpur, Bangladesh',
  ],
  'cat about.txt': [
    "Hello. I'm Rafsan Jani.",
    '',
    'B.Sc. in CSE undergraduate at Shahjalal University of Science & Technology (SUST)',
    'and graduate of Rajshahi Cadet College (College Prefect — led 297 cadets;',
    '17th on the National Merit List, Top 0.01%).',
    '',
    'Currently serving as AI & Automation Executive at Waffle Up and Instructor at Tworon,',
    'while engineering native Android apps (Kairyn v5.1), 60 FPS 3D shaders,',
    'full-stack Next.js/Supabase platforms (S_Track), and agentic AI automations.',
    '',
    '"The world deserves builders who combine rigorous engineering with principled leadership."',
  ],
  'cat experience.txt': [
    '[2025–Present] AI & Automation Executive — Waffle Up',
    '               Architecting AI workflows, supply-chain models & franchise SOPs',
    '[2025–Present] STEM & Programming Instructor — Tworon',
    '               Teaching programming & building 60 FPS Manim math visualizations',
    '[2025–Present] B.Sc. (Engg.) in CSE — SUST, Sylhet (Batch CSE-25)',
    '[2024–2025]    College Prefect — Rajshahi Cadet College (Led 297 Cadets)',
  ],
  'cat projects.txt': [
    '[01] Kairyn v5.1       → Native Android Habit OS w/ 60 FPS 3D Live Wallpapers',
    '[02] S_Track           → Next.js + Supabase Modular Academic OS for SUST CSE',
    '[03] ParallaxMascot3D  → Gyroscope + Spring 5-Plane 3D Android UI Engine',
    '[04] AgriBase          → Flask + Bayesian ML on 50k+ records (IWC Bronze)',
    '[05] Punorabritti      → Python + Selenium Transit Ticket Automation',
    '[06] Manim + Audio DSP → 60 FPS Geometric Proofs + Procedural 48kHz Synth',
    '[07] Clinical Rx Suite → Offline-First Medical Prescription Web App',
    '[08] ClearRiver & CERN → IoT Water Turbidity Analyzer & CERN T9 Muon Design',
  ],
  'cat skills.txt': [
    'LANGUAGES:   C · C++ · Kotlin · Python · TypeScript · JavaScript · SQL',
    'MOBILE/WEB:  Jetpack Compose · Android SDK · Next.js 14 · React · Three.js/R3F · Tailwind',
    'AI/BACKEND:  Agentic AI · Gemini & Groq APIs · Supabase · Flask · Selenium · Manim',
    'HARDWARE:    Arduino Uno · ESP32 · Raspberry Pi · SiPM & Optical Sensors · OSINT/EXIF',
  ],
  'cat awards.txt': [
    '[Scholar] Talentpool Merit Scholarship 2025 (17th Nationally, Top 0.01%)',
    '[Bronze]  Innovation World Cup BD — AgriBase Precision Agriculture',
    '[Silver]  IYMC International Youth Math Challenge 2024',
    '[Winner]  College Science Competition — Project ClearRiver IoT',
    '[Green]   ISSB Green Card — Bangladesh Army Officer Recommended',
    '[Prefect] Best All-Round Cadet & Best Disciplined Cadet — RCC',
    '[1st]     TIB National Anti-Corruption Competition 2022',
    '[Winner]  BdJSO National Junior Science Olympiad 2020',
  ],
};

export function Terminal() {
  const [open, setOpen]             = useState(false);
  const [history, setHistory]       = useState<{ cmd: string; out: string[] }[]>([
    { cmd: '', out: ['RJ Terminal v2.0.0 (SUST-CSE Edition) — type "help" for commands', ''] },
  ]);
  const [input, setInput]           = useState('');
  const [cmdHist, setCmdHist]       = useState<string[]>([]);
  const [histIdx, setHistIdx]       = useState(-1);
  const inputRef  = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router    = useRouter();
  const { setMode } = useVisitorMode();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '`' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [open, history]);

  const run = () => {
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;
    setCmdHist(h => [cmd, ...h]);
    setHistIdx(-1);
    setInput('');

    if (cmd === 'game' || cmd === 'cyberlab') {
      setHistory(h => [...h, { cmd, out: ['→ Launching 3D Cyber-Defense Lab...'] }]);
      setTimeout(() => {
        setMode('game');
        router.push('/');
        setOpen(false);
      }, 350);
      return;
    }

    if (cmd.startsWith('cd ')) {
      const route = '/' + cmd.slice(3).replace(/^\//, '');
      const valid = ['/lab', '/archive', '/inkwell', '/visuals', '/map', '/contact'];
      if (valid.includes(route)) {
        setHistory(h => [...h, { cmd, out: [`→ Navigating to ${route}...`] }]);
        setTimeout(() => {
          router.push(route);
          setOpen(false);
        }, 400);
      } else {
        setHistory(h => [...h, { cmd, out: [`cd: ${route}: not found. Run ls for routes.`] }]);
      }
      return;
    }
    if (cmd === 'clear') {
      setHistory([{ cmd: '', out: ['Cleared.'] }]);
      return;
    }
    if (cmd === 'exit') {
      setHistory(h => [...h, { cmd, out: ['Goodbye.'] }]);
      setTimeout(() => setOpen(false), 350);
      return;
    }
    const out = CMDS[cmd] ?? [`"${cmd}": command not found. Try "help".`];
    setHistory(h => [...h, { cmd, out }]);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      run();
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowUp') {
      const i = Math.min(histIdx + 1, cmdHist.length - 1);
      setHistIdx(i);
      setInput(cmdHist[i] ?? '');
    }
    if (e.key === 'ArrowDown') {
      const i = Math.max(histIdx - 1, -1);
      setHistIdx(i);
      setInput(i < 0 ? '' : cmdHist[i]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 inset-x-0 z-[100] h-80 bg-[#0d0d12] border-t border-[#00ff88]/40 font-mono text-xs shadow-2xl"
        >
          <div className="flex items-center justify-between px-4 h-8 border-b border-[#1a1a2e] bg-[#111118]">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-[#ffb400]/70" />
              <span className="w-3 h-3 rounded-full bg-[#00ff88]/70" />
            </div>
            <span className="text-[#8888aa] tracking-widest text-[10px]">
              RJ-TERMINAL v2.0 — ` to toggle
            </span>
            <button onClick={() => setOpen(false)} className="text-[#8888aa] hover:text-white">
              ✕
            </button>
          </div>
          <div className="h-[calc(100%-4.25rem)] overflow-y-auto px-4 pt-3 space-y-1">
            {history.map((h, i) => (
              <div key={i}>
                {h.cmd && (
                  <p>
                    <span className="text-[#8888aa]">rafsan</span>
                    <span className="text-[#4a4a6a]">@</span>
                    <span className="text-[#00d4ff]">sust-cse</span>
                    <span className="text-[#4a4a6a]">:~$</span>
                    <span className="text-[#e8e8f0] ml-1">{h.cmd}</span>
                  </p>
                )}
                {h.out.map((line, j) => (
                  <p key={j} className="text-[#8888aa]">
                    {line || '\u00a0'}
                  </p>
                ))}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="flex items-center gap-1 px-4 h-9 border-t border-[#1a1a2e] bg-[#111118]">
            <span className="text-[#8888aa]">rafsan</span>
            <span className="text-[#4a4a6a]">@</span>
            <span className="text-[#00d4ff]">sust-cse</span>
            <span className="text-[#4a4a6a]">:~$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              className="flex-1 bg-transparent text-[#e8e8f0] outline-none caret-[#00ff88] ml-1"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

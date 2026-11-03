'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useVisitorMode, type VisitorMode } from '@/components/ui/VisitorModeProvider';

const LINKS = [
  { href: '/lab',     label: 'Lab'     },
  { href: '/archive', label: 'Archive' },
  { href: '/inkwell', label: 'Inkwell' },
  { href: '/visuals', label: 'Visuals' },
  { href: '/map',     label: 'Map'     },
  { href: '/contact', label: 'Contact' },
];

export const MODES: { id: VisitorMode; label: string; badge?: string; color: string; desc: string }[] = [
  { id: 'developer', label: 'Developer',    color: '#00ff88', desc: 'Cyberpunk terminal & 3D core'       },
  { id: 'recruiter', label: 'Recruiter',    color: '#0d9488', desc: 'Executive brief, metrics & CV'      },
  { id: 'friend',    label: 'Friend',       color: '#ec4899', desc: 'Casual story, life & highlights'    },
  { id: 'game',      label: 'Cyber Lab 3D', badge: 'PLAY', color: '#00d4ff', desc: 'Interactive 3D SOC & defense game' },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode, dark, toggleDark, setAiOpen, visitorCount } = useVisitorMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modeOpen, setModeOpen]     = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setModeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentMode = MODES.find(m => m.id === mode) ?? MODES[0];

  const handleSelectMode = (m: VisitorMode) => {
    setMode(m);
    setModeOpen(false);
    setMobileOpen(false);
    if (m === 'game' && pathname !== '/') {
      router.push('/');
    }
  };

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b transition-colors duration-300"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--c-bg) 88%, transparent)',
        borderColor: 'var(--c-border)',
      }}
    >
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo + Live Visitor Counter Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/"
            className="font-display text-sm tracking-widest hover:opacity-80 transition-all font-bold"
            style={{ color: 'var(--c-accent)' }}
          >
            RJ<span style={{ color: 'var(--c-muted)' }}>://</span>
          </Link>
          <span
            className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border"
            style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)', background: 'var(--c-surface)' }}
            title="Live Portfolio Visits"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--c-accent)' }} />
            {visitorCount !== null ? `${visitorCount.toLocaleString()} visits` : 'SUST.CSE'}
          </span>
        </div>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {LINKS.map(l => {
            const active = pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="px-3 py-1.5 text-xs tracking-widest uppercase transition-all font-mono rounded"
                  style={{
                    color: active ? 'var(--c-accent)' : 'var(--c-muted)',
                    borderBottom: active ? '2px solid var(--c-accent)' : '2px solid transparent',
                  }}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right controls: Global RJ.AI trigger + 3D Game button + Mode switcher + Dark toggle */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setAiOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-mono tracking-wider uppercase rounded border transition-all hover:opacity-85"
            style={{
              borderColor: 'var(--c-border)',
              color: 'var(--c-text)',
              background: 'var(--c-surface)',
            }}
            title="Open RJ.AI Assistant (Groq + Gemini)"
          >
            <span style={{ color: 'var(--c-accent)' }}>✦</span>
            <span>RJ.AI</span>
          </button>

          {mode !== 'game' && (
            <button
              onClick={() => handleSelectMode('game')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono tracking-wider uppercase rounded border transition-all hover:scale-105"
              style={{
                borderColor: 'rgba(0,212,255,0.45)',
                color: '#00d4ff',
                background: 'rgba(0,212,255,0.08)',
              }}
              title="Launch Interactive 3D Cyber-Defense Lab"
            >
              <span>🎮</span>
              <span>3D Lab</span>
            </button>
          )}

          {(mode === 'recruiter' || mode === 'friend') && (
            <button
              onClick={toggleDark}
              className="px-2.5 py-1.5 text-xs font-mono rounded border transition-all"
              style={{
                borderColor: 'var(--c-border)',
                color: 'var(--c-muted)',
                background: 'var(--c-panel)',
              }}
              title="Toggle Light / Dark appearance"
            >
              {dark ? '☀ Light' : '◑ Dark'}
            </button>
          )}

          {/* Theme-aware Mode Switcher Dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setModeOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-widest uppercase border rounded transition-all"
              style={{
                borderColor: `${currentMode.color}55`,
                color:       currentMode.color,
                background:  `${currentMode.color}12`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: currentMode.color, boxShadow: `0 0 6px ${currentMode.color}` }}
              />
              {currentMode.label}
              <span className="opacity-60 text-[10px]">{modeOpen ? '▲' : '▼'}</span>
            </button>

            {modeOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 rounded-lg border overflow-hidden shadow-2xl"
                style={{
                  background: 'var(--c-panel)',
                  borderColor: 'var(--c-border)',
                  zIndex: 250,
                }}
              >
                <div
                  className="px-3 py-2 border-b text-[10px] font-mono tracking-widest uppercase"
                  style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)', background: 'var(--c-surface)' }}
                >
                  Select Portfolio Persona (4 Modes)
                </div>
                {MODES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMode(m.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-opacity hover:opacity-85 border-b"
                    style={{ borderColor: 'var(--c-border)' }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono tracking-widest uppercase font-bold" style={{ color: m.color }}>
                          {m.label}
                        </p>
                        {m.badge && (
                          <span
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold"
                            style={{ background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}55` }}
                          >
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--c-muted)' }}>
                        {m.desc}
                      </p>
                    </div>
                    {mode === m.id && (
                      <span className="ml-auto text-xs font-bold" style={{ color: m.color }}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden lg:flex gap-1.5 text-[11px] font-mono pl-1" style={{ color: 'var(--c-muted)' }}>
            <kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--c-border)', background: 'var(--c-panel)' }} title="Command palette">⌘K</kbd>
            <kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--c-border)', background: 'var(--c-panel)' }} title="Terminal">~</kbd>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-1.5 ml-auto">
          <button
            onClick={() => setAiOpen(true)}
            className="px-2 py-1 text-[10px] font-mono uppercase rounded border"
            style={{ borderColor: 'var(--c-border)', color: 'var(--c-accent)', background: 'var(--c-surface)' }}
          >
            ✦ AI
          </button>
          <button
            onClick={() => handleSelectMode(mode === 'game' ? 'developer' : 'game')}
            className="px-2 py-1 text-[10px] font-mono uppercase rounded border"
            style={{ borderColor: '#00d4ff66', color: '#00d4ff', background: 'rgba(0,212,255,0.08)' }}
          >
            {mode === 'game' ? 'Exit 3D' : '🎮 3D'}
          </button>
          <button
            className="p-1.5 rounded border"
            style={{ color: 'var(--c-text)', borderColor: 'var(--c-border)' }}
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
        >
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm border-b transition-colors font-mono"
              style={{ color: 'var(--c-text)', borderColor: 'var(--c-border)' }}
            >
              &gt; {l.label}
            </Link>
          ))}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] tracking-widest uppercase font-mono" style={{ color: 'var(--c-muted)' }}>
                Portfolio Mode (4 Versions)
              </p>
              {(mode === 'recruiter' || mode === 'friend') && (
                <button
                  onClick={toggleDark}
                  className="text-[10px] font-mono px-2 py-0.5 rounded border"
                  style={{ borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                >
                  {dark ? '☀ Light' : '◑ Dark'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMode(m.id)}
                  className="px-3 py-2 text-[11px] font-mono tracking-wider uppercase rounded border text-left transition-all flex items-center gap-2"
                  style={{
                    borderColor: mode === m.id ? m.color : 'var(--c-border)',
                    color:       mode === m.id ? m.color : 'var(--c-muted)',
                    background:  mode === m.id ? `${m.color}15` : 'var(--c-panel)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                  <span className="truncate">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

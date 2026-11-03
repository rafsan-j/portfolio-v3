'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisitorMode } from '@/components/ui/VisitorModeProvider';

const ACTIONS = [
  { id: 'game',      label: 'Launch 3D Cyber-Defense Lab (Game Mode)', hint: '3D PLAY',  type: 'mode'     },
  { id: 'developer', label: 'Switch to Developer Mode',                hint: 'MODE',     type: 'mode'     },
  { id: 'recruiter', label: 'Switch to Recruiter Mode',                hint: 'MODE',     type: 'mode'     },
  { id: 'friend',    label: 'Switch to Friend Mode',                   hint: 'MODE',     type: 'mode'     },
  { id: 'home',      label: 'Go Home',                                 hint: '/',        type: 'nav'      },
  { id: 'lab',       label: 'Open The Lab (11 Projects)',              hint: '/lab',     type: 'nav'      },
  { id: 'archive',   label: 'Open The Archive (Research)',             hint: '/archive', type: 'nav'      },
  { id: 'inkwell',   label: 'Open The Inkwell (Writing)',              hint: '/inkwell', type: 'nav'      },
  { id: 'visuals',   label: 'Open Visuals Gallery',                    hint: '/visuals', type: 'nav'      },
  { id: 'map',       label: 'View Bangladesh Coordinates Map',         hint: '/map',     type: 'nav'      },
  { id: 'contact',   label: 'Contact Rafsan',                          hint: '/contact', type: 'nav'      },
  { id: 'resume',    label: 'Download Technical Resume (PDF)',         hint: 'PDF',      type: 'action'   },
  { id: 'github',    label: 'Open GitHub (rafsan-j)',                  hint: 'GitHub',   type: 'external' },
  { id: 'linkedin',  label: 'Open LinkedIn (rafsan-jani72)',           hint: 'LinkedIn', type: 'external' },
  { id: 'email',     label: 'Send Email to Rafsan',                    hint: 'Gmail',    type: 'external' },
  { id: 'terminal',  label: 'Toggle UNIX Terminal',                    hint: '`',        type: 'action'   },
];

const TC: Record<string, string> = {
  mode: '#a78bfa',
  nav: '#00ff88',
  action: '#ffb400',
  external: '#00d4ff',
};

export function CommandPalette() {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();
  const { setMode } = useVisitorMode();

  const filtered = ACTIONS.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery('');
      setActive(0);
    }
  }, [open]);

  const execute = (a: (typeof ACTIONS)[0]) => {
    setOpen(false);
    if (a.id === 'game' || a.id === 'developer' || a.id === 'recruiter' || a.id === 'friend') {
      setMode(a.id);
      router.push('/');
      return;
    }
    const nav: Record<string, string> = {
      home: '/',
      lab: '/lab',
      archive: '/archive',
      inkwell: '/inkwell',
      visuals: '/visuals',
      map: '/map',
      contact: '/contact',
    };
    if (nav[a.id]) {
      router.push(nav[a.id]);
      return;
    }
    if (a.id === 'resume')   { window.open('/resume.pdf', '_blank'); return; }
    if (a.id === 'github')   { window.open('https://github.com/rafsan-j', '_blank'); return; }
    if (a.id === 'linkedin') { window.open('https://linkedin.com/in/rafsan-jani72', '_blank'); return; }
    if (a.id === 'email')    { window.location.href = 'mailto:rafsan2972jani@gmail.com'; return; }
    if (a.id === 'terminal') {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '`', bubbles: true }));
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(i => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(i => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && filtered[active]) execute(filtered[active]);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-start justify-center pt-[16vh] px-4"
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: -8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96 }}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-[#1a1a2e] bg-[#111118]"
            style={{ boxShadow: '0 0 0 1px rgba(0,255,136,.2), 0 30px 60px rgba(0,0,0,.85)' }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1a1a2e]">
              <span className="text-[#00ff88] font-mono">⌘K</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKey}
                placeholder="Type a command or jump to any mode..."
                className="flex-1 bg-transparent text-sm text-[#e8e8f0] outline-none placeholder:text-[#4a4a6a] font-mono"
              />
              <kbd className="text-[10px] px-1.5 py-0.5 border border-[#1a1a2e] rounded text-[#8888aa]">
                ESC
              </kbd>
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <p className="text-center text-[#8888aa] text-xs py-6 font-mono">No matching commands.</p>
              )}
              {filtered.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => execute(a)}
                  onMouseEnter={() => setActive(i)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-mono transition-colors ${
                    i === active ? 'bg-[#0d0d12]' : ''
                  }`}
                >
                  <span className={i === active ? 'text-[#e8e8f0]' : 'text-[#8888aa]'}>{a.label}</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded border"
                    style={{
                      color: TC[a.type],
                      borderColor: `${TC[a.type]}40`,
                      background: `${TC[a.type]}12`,
                    }}
                  >
                    {a.hint}
                  </span>
                </button>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-[#1a1a2e] text-[10px] text-[#4a4a6a] font-mono flex gap-4">
              <span>↑↓ navigate</span>
              <span>↵ execute</span>
              <span>ESC close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

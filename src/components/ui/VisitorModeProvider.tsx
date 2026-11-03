'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AIAssistant } from '@/components/sections/AIAssistant';

export type VisitorMode = 'developer' | 'recruiter' | 'friend' | 'game';

const VALID_MODES: VisitorMode[] = ['developer', 'recruiter', 'friend', 'game'];

interface Ctx {
  mode:         VisitorMode;
  setMode:      (m: VisitorMode) => void;
  dark:         boolean;
  setDark:      (d: boolean) => void;
  toggleDark:   () => void;
  aiOpen:       boolean;
  setAiOpen:    (open: boolean) => void;
  visitorCount: number | null;
}

const VisitorCtx = createContext<Ctx>({
  mode:         'developer',
  setMode:      () => {},
  dark:         true,
  setDark:      () => {},
  toggleDark:   () => {},
  aiOpen:       false,
  setAiOpen:    () => {},
  visitorCount: null,
});

export function VisitorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState]       = useState<VisitorMode>('developer');
  const [dark, setDarkState]       = useState<boolean>(true);
  const [aiOpen, setAiOpen]        = useState<boolean>(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  const applyTheme = useCallback((m: VisitorMode, d: boolean) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-mode', m);
    if (d && (m === 'recruiter' || m === 'friend')) {
      document.documentElement.setAttribute('data-dark', '1');
    } else {
      document.documentElement.removeAttribute('data-dark');
    }
  }, []);

  useEffect(() => {
    const savedMode = localStorage.getItem('pf_mode') as VisitorMode | null;
    const savedDark = localStorage.getItem('pf_dark');
    const resolvedMode: VisitorMode =
      savedMode && VALID_MODES.includes(savedMode) ? savedMode : 'developer';
    const resolvedDark = savedDark !== null ? savedDark === '1' : true;

    setModeState(resolvedMode);
    setDarkState(resolvedDark);
    applyTheme(resolvedMode, resolvedDark);

    // Wire up live visitor counter once per browser session
    const counted = sessionStorage.getItem('pf_visited');
    const method = counted ? 'GET' : 'POST';
    fetch('/api/visitor', { method })
      .then(r => r.json())
      .then(data => {
        if (typeof data?.count === 'number') {
          setVisitorCount(data.count);
          sessionStorage.setItem('pf_visited', '1');
        }
      })
      .catch(() => {});
  }, [applyTheme]);

  const setMode = (m: VisitorMode) => {
    setModeState(m);
    localStorage.setItem('pf_mode', m);
    applyTheme(m, dark);
  };

  const setDark = (d: boolean) => {
    setDarkState(d);
    localStorage.setItem('pf_dark', d ? '1' : '0');
    applyTheme(mode, d);
  };

  const toggleDark = () => {
    setDark(!dark);
  };

  return (
    <VisitorCtx.Provider
      value={{ mode, setMode, dark, setDark, toggleDark, aiOpen, setAiOpen, visitorCount }}
    >
      {children}
      {aiOpen && <AIAssistant onClose={() => setAiOpen(false)} mode={mode} />}
    </VisitorCtx.Provider>
  );
}

export const useVisitorMode = () => useContext(VisitorCtx);

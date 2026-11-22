'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Box,
  Briefcase,
  Check,
  Copy,
  ExternalLink,
  Home,
  Mail,
  Moon,
  PenLine,
  Search,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

export interface CommandPaletteProject {
  slug: string;
  title: string;
  tagline: string;
}

export interface CommandPaletteEssay {
  slug: string;
  title: string;
}

interface CommandPaletteProps {
  projects: CommandPaletteProject[];
  essays: CommandPaletteEssay[];
}

type CommandGroup = 'Navigate' | 'Case Studies' | 'Essays' | 'Actions';

interface CommandItem {
  id: string;
  group: CommandGroup;
  label: string;
  subtitle?: string;
  keywords: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

const GROUP_ORDER: CommandGroup[] = ['Navigate', 'Case Studies', 'Essays', 'Actions'];
const EMAIL = 'rafsan2972jani@gmail.com';

export function CommandPalette({ projects, essays }: CommandPaletteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
    const prev = previouslyFocusedRef.current;
    if (prev && typeof prev.focus === 'function') {
      prev.focus();
    }
  }, []);

  const openPalette = useCallback(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setActiveIndex(0);
    setOpen(true);
  }, []);

  // Close automatically on route change
  useEffect(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, [pathname]);

  // Global keyboard shortcut (Cmd/Ctrl+K) and custom event listener
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => {
          if (prev) {
            setQuery('');
            setActiveIndex(0);
            return false;
          }
          previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
          setQuery('');
          setActiveIndex(0);
          return true;
        });
      }
    };

    const onCustomOpen = () => {
      openPalette();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('open-command-palette', onCustomOpen);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('open-command-palette', onCustomOpen);
    };
  }, [openPalette]);

  // Auto-focus search input immediately on open (including out of /studio iframe)
  useEffect(() => {
    if (!open) return;
    const raf = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [open]);

  const navigate = useCallback(
    (href: string) => {
      closePalette();
      router.push(href);
    },
    [closePalette, router]
  );

  const handleCopyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = EMAIL;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedEmail(true);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopiedEmail(false);
    }, 2000);
  }, []);

  const allItems = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = [
      {
        id: 'nav-home',
        group: 'Navigate',
        label: 'Home',
        subtitle: '/',
        keywords: 'home index start overview',
        icon: <Home className="w-4 h-4" aria-hidden="true" />,
        onSelect: () => navigate('/'),
      },
      {
        id: 'nav-work',
        group: 'Navigate',
        label: 'Work',
        subtitle: '/work',
        keywords: 'work projects portfolio case studies',
        icon: <Briefcase className="w-4 h-4" aria-hidden="true" />,
        onSelect: () => navigate('/work'),
      },
      {
        id: 'nav-studio',
        group: 'Navigate',
        label: '3D Studio',
        subtitle: '/studio',
        keywords: 'studio 3d threejs sylhet desk webgl',
        icon: <Box className="w-4 h-4" aria-hidden="true" />,
        onSelect: () => navigate('/studio'),
      },
      {
        id: 'nav-writing',
        group: 'Navigate',
        label: 'Writing',
        subtitle: '/writing',
        keywords: 'writing essays notes articles blog',
        icon: <PenLine className="w-4 h-4" aria-hidden="true" />,
        onSelect: () => navigate('/writing'),
      },
      {
        id: 'nav-about',
        group: 'Navigate',
        label: 'About',
        subtitle: '/about',
        keywords: 'about bio timeline bangladesh map sust',
        icon: <User className="w-4 h-4" aria-hidden="true" />,
        onSelect: () => navigate('/about'),
      },
      {
        id: 'nav-contact',
        group: 'Navigate',
        label: 'Contact',
        subtitle: '/contact',
        keywords: 'contact email message reach out',
        icon: <Mail className="w-4 h-4" aria-hidden="true" />,
        onSelect: () => navigate('/contact'),
      },
    ];

    const projectItems: CommandItem[] = projects.map((project) => ({
      id: `project-${project.slug}`,
      group: 'Case Studies',
      label: project.title,
      subtitle: project.tagline,
      keywords: `${project.title} ${project.slug} ${project.tagline} project case study`,
      icon: <ArrowRight className="w-4 h-4" aria-hidden="true" />,
      onSelect: () => navigate(`/work/${project.slug}`),
    }));

    const essayItems: CommandItem[] = essays.map((essay) => ({
      id: `essay-${essay.slug}`,
      group: 'Essays',
      label: essay.title,
      subtitle: `/writing/${essay.slug}`,
      keywords: `${essay.title} ${essay.slug} essay writing`,
      icon: <PenLine className="w-4 h-4" aria-hidden="true" />,
      onSelect: () => navigate(`/writing/${essay.slug}`),
    }));

    const actionItems: CommandItem[] = [
      {
        id: 'action-theme',
        group: 'Actions',
        label: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
        subtitle: 'Toggle Obsidian Dark / Cool-Neutral Light',
        keywords: 'theme dark light mode appearance toggle',
        icon:
          theme === 'dark' ? (
            <Sun className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Moon className="w-4 h-4" aria-hidden="true" />
          ),
        onSelect: () => {
          toggleTheme();
          closePalette();
        },
      },
      {
        id: 'action-copy-email',
        group: 'Actions',
        label: copiedEmail ? 'Email Copied' : 'Copy Email',
        subtitle: EMAIL,
        keywords: 'copy email address mailto rafsan',
        icon: copiedEmail ? (
          <Check className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
        ) : (
          <Copy className="w-4 h-4" aria-hidden="true" />
        ),
        onSelect: () => {
          void handleCopyEmail();
        },
      },
      {
        id: 'action-open-studio',
        group: 'Actions',
        label: 'Open 3D Studio',
        subtitle: 'Launch Living Sylhet 3D Studio',
        keywords: 'open launch 3d studio desk',
        icon: <Box className="w-4 h-4" aria-hidden="true" />,
        onSelect: () => navigate('/studio'),
      },
      {
        id: 'action-github',
        group: 'Actions',
        label: 'Open GitHub',
        subtitle: 'github.com/rafsan-j',
        keywords: 'github code profile external',
        icon: <ExternalLink className="w-4 h-4" aria-hidden="true" />,
        onSelect: () => {
          window.open('https://github.com/rafsan-j', '_blank', 'noopener,noreferrer');
          closePalette();
        },
      },
      {
        id: 'action-linkedin',
        group: 'Actions',
        label: 'Open LinkedIn',
        subtitle: 'linkedin.com/in/rafsan-jani72',
        keywords: 'linkedin profile external',
        icon: <ExternalLink className="w-4 h-4" aria-hidden="true" />,
        onSelect: () => {
          window.open('https://linkedin.com/in/rafsan-jani72', '_blank', 'noopener,noreferrer');
          closePalette();
        },
      },
    ];

    return [...navItems, ...projectItems, ...essayItems, ...actionItems];
  }, [projects, essays, theme, copiedEmail, navigate, toggleTheme, closePalette, handleCopyEmail]);

  const filteredItems = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return allItems;
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(trimmed) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(trimmed)) ||
        item.keywords.toLowerCase().includes(trimmed)
    );
  }, [allItems, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const groupedItems = useMemo(() => {
    const groups: Array<{ group: CommandGroup; items: Array<{ item: CommandItem; flatIndex: number }> }> = [];
    let flatIndex = 0;

    for (const groupName of GROUP_ORDER) {
      const matching = filteredItems.filter((item) => item.group === groupName);
      if (matching.length > 0) {
        groups.push({
          group: groupName,
          items: matching.map((item) => ({ item, flatIndex: flatIndex++ })),
        });
      }
    }
    return groups;
  }, [filteredItems]);

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePalette();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (filteredItems.length > 0) {
        setActiveIndex((prev) => (prev + 1) % filteredItems.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (filteredItems.length > 0) {
        setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const selected = filteredItems[activeIndex];
      if (selected) {
        selected.onSelect();
      }
      return;
    }

    if (event.key === 'Tab') {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-scrim)] flex items-start justify-center pt-[12vh] px-4 transition-none">
      <div
        className="fixed inset-0 bg-[var(--bg-scrim)] transition-none"
        aria-hidden="true"
        onClick={closePalette}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={handleDialogKeyDown}
        className="relative z-[var(--z-modal)] w-full max-w-xl rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-neutral)] shadow-[var(--shadow-modal)] overflow-hidden transition-none"
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-[var(--border-neutral)]">
          <Search className="w-4 h-4 text-[var(--ink-secondary)] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a route, case study, essay, or action..."
            aria-label="Search commands"
            className="w-full bg-transparent text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-secondary)] focus:outline-none"
          />
          <button
            type="button"
            onClick={closePalette}
            aria-label="Close command palette"
            className="w-8 h-8 inline-flex items-center justify-center rounded-md text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-track)]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div
          role="listbox"
          aria-label="Command results"
          className="max-h-[60vh] overflow-y-auto py-2"
        >
          {groupedItems.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--ink-secondary)]">
              No matching routes, case studies, or actions.
            </p>
          ) : (
            groupedItems.map(({ group, items }) => (
              <div key={group} className="mb-2 last:mb-0">
                <div className="px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
                  {group}
                </div>
                {items.map(({ item, flatIndex }) => {
                  const isActive = flatIndex === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      onClick={item.onSelect}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 border-l-2 transition-none ${
                        isActive
                          ? 'bg-[var(--bg-track)] border-[var(--accent)] text-[var(--ink-primary)]'
                          : 'border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                      }`}
                    >
                      <span
                        className={`shrink-0 ${
                          isActive ? 'text-[var(--accent)]' : 'text-[var(--ink-secondary)]'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-[var(--ink-primary)] truncate">
                          {item.label}
                        </span>
                        {item.subtitle ? (
                          <span className="block text-xs text-[var(--ink-secondary)] truncate">
                            {item.subtitle}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-[var(--border-neutral)] flex items-center justify-between font-mono text-[11px] text-[var(--ink-secondary)]">
          <span>↑↓ Navigate · ↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CommandPalette;

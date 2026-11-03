'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { NavBar } from '@/components/layout/NavBar';
import { useVisitorMode } from '@/components/ui/VisitorModeProvider';

const SOCIALS = [
  {
    label: 'Email',
    href: 'mailto:rafsan2972jani@gmail.com',
    tag: 'rafsan2972jani@gmail.com',
    icon: '✉',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/rafsan-j',
    tag: 'github.com/rafsan-j',
    icon: '◈',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/rafsan-jani72',
    tag: 'in/rafsan-jani72',
    icon: '◉',
  },
];

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactPage() {
  const { mode, setAiOpen } = useVisitorMode();
  const [form, setForm]     = useState({ name: '', email: '', message: '', hp: '' });
  const [status, setStatus] = useState<Status>('idle');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          honeypot: form.hp,
        }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--c-surface)',
    border: '1px solid var(--c-border)',
    color: 'var(--c-text)',
  };

  const headerKicker =
    mode === 'recruiter'
      ? 'DIRECT INQUIRY & COLLABORATION'
      : mode === 'friend'
      ? 'DROP A NOTE 👋'
      : '// TRANSMISSION';

  return (
    <div className="theme-page">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs tracking-widest mb-2 font-mono" style={{ color: 'var(--c-accent)' }}>
            {headerKicker}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--c-text)' }}>
            Get in Touch
          </h1>
          <p className="mb-8 text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
            Open for software engineering roles, AI automation projects, research collaborations, or a conversation in Sylhet. All messages reach my inbox directly.
          </p>

          {/* 3 Social Links (No Phone Number) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {SOCIALS.map(s => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
                className="panel p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all"
              >
                <span className="font-mono text-base flex-shrink-0" style={{ color: 'var(--c-accent)' }}>
                  {s.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[10px] uppercase tracking-widest font-mono"
                    style={{ color: 'var(--c-muted)' }}
                  >
                    {s.label}
                  </p>
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--c-text)' }}>
                    {s.tag}
                  </p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--c-muted)' }}>
                  ↗
                </span>
              </a>
            ))}
          </div>

          {/* Contact Form */}
          {status === 'sent' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="panel p-10 text-center"
            >
              <span className="status-dot block mx-auto mb-4" />
              <p className="font-display text-lg font-bold mb-2" style={{ color: 'var(--c-accent)' }}>
                Transmission Received
              </p>
              <p className="text-sm" style={{ color: 'var(--c-muted)' }}>
                Thanks for reaching out! I&apos;ll get back to you within 24 hours.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="panel p-6 space-y-5">
              <input
                type="text"
                value={form.hp}
                onChange={set('hp')}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {[
                { k: 'name', label: 'Name', type: 'text', ph: 'Your name' },
                { k: 'email', label: 'Email', type: 'email', ph: 'your@email.com' },
              ].map(f => (
                <div key={f.k}>
                  <label
                    className="block text-[10px] tracking-widest uppercase mb-1.5 font-mono"
                    style={{ color: 'var(--c-muted)' }}
                  >
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    required
                    value={(form as Record<string, string>)[f.k]}
                    onChange={set(f.k)}
                    placeholder={f.ph}
                    style={inputStyle}
                    className="w-full rounded px-3 py-2.5 text-sm outline-none font-mono"
                  />
                </div>
              ))}

              <div>
                <label
                  className="block text-[10px] tracking-widest uppercase mb-1.5 font-mono"
                  style={{ color: 'var(--c-muted)' }}
                >
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={set('message')}
                  placeholder="What are we building together?"
                  style={{ ...inputStyle, resize: 'none' }}
                  className="w-full rounded px-3 py-2.5 text-sm outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-neon w-full"
                style={{ opacity: status === 'sending' ? 0.4 : 1 }}
              >
                <span>{status === 'sending' ? 'Transmitting...' : 'Send Message →'}</span>
              </button>

              {status === 'error' && (
                <p className="text-xs text-red-400 text-center">
                  Something went wrong. Email me directly at{' '}
                  <a href="mailto:rafsan2972jani@gmail.com" style={{ color: 'var(--c-accent)' }}>
                    rafsan2972jani@gmail.com
                  </a>
                </p>
              )}
            </form>
          )}

          {/* Resume Download + AI Quick Card */}
          <div className="panel p-4 mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg" style={{ color: 'var(--c-accent)' }}>
                ◎
              </span>
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--c-text)' }}>
                  Need my 1-page technical resume or quick answers?
                </p>
                <p className="text-[11px]" style={{ color: 'var(--c-muted)' }}>
                  Includes SUST CSE, Waffle Up, Tworon, Kairyn v5.1, S_Track &amp; AgriBase
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAiOpen(true)}
                className="btn-neon text-xs py-2 px-3"
              >
                <span>✦ Ask RJ.AI</span>
              </button>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="btn-neon text-xs py-2 px-4"
              >
                <span>Resume PDF →</span>
              </a>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

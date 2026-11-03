'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VisitorMode } from '@/components/ui/VisitorModeProvider';

type Message = { role: 'user' | 'assistant'; content: string };

const STARTERS: Record<VisitorMode, string[]> = {
  recruiter: [
    'What is Rafsan building right now?',
    'Tell me about Kairyn v5.1 Android OS.',
    'What is his role at Waffle Up?',
    'Summarize his academic & leadership record.',
  ],
  developer: [
    'How does Kairyn render 60 FPS 3D shaders?',
    'What is S_Track & ParallaxMascot3D?',
    'What is his full tech stack?',
    'Tell me about AgriBase & CERN Beamline.',
  ],
  friend: [
    'How is CSE life at SUST in Sylhet?',
    'What does he do at Waffle Up & Tworon?',
    'What book is he writing?',
    'What are his favorite projects?',
  ],
  game: [
    'What are the 5 stations in this 3D Cyber Lab?',
    'How did Rafsan engineer Kairyn v5.1?',
    'Tell me about his OSINT & cybersecurity skills.',
    'How can I contact or hire Rafsan?',
  ],
};

function FormattedMessage({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <div style={{ lineHeight: 1.7 }}>
      {paragraphs.map((para, i) => {
        const lines = para.split(/\n/);
        return (
          <div key={i} style={{ marginBottom: i < paragraphs.length - 1 ? '10px' : 0 }}>
            {lines.map((line, j) => {
              const isBullet = /^[\*\-•]\s/.test(line) || /^\d+\.\s/.test(line);
              const clean = line
                .replace(/\*\*(.+?)\*\*/g, '$1')
                .replace(/\*(.+?)\*/g, '$1')
                .replace(/`(.+?)`/g, '$1')
                .replace(/^[\*\-•]\s+/, '')
                .replace(/^\d+\.\s+/, '')
                .trim();

              if (!clean) return null;

              if (isBullet) {
                return (
                  <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '4px', paddingLeft: '4px' }}>
                    <span style={{ color: 'var(--c-accent)', flexShrink: 0, marginTop: '1px' }}>▸</span>
                    <span>{clean}</span>
                  </div>
                );
              }

              return (
                <span key={j}>
                  {clean}
                  {j < lines.length - 1 && <br />}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

interface Props {
  onClose: () => void;
  mode?: VisitorMode;
}

export function AIAssistant({ onClose, mode = 'developer' }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        mode === 'friend'
          ? "Hey! 👋 I'm Rafsan's AI assistant. Ask me about SUST in Sylhet, Waffle Up, Tworon, or his latest builds!"
          : mode === 'recruiter'
          ? "Hello. I'm RJ.AI (powered by Groq & Gemini). Ask me about Rafsan Jani's software engineering projects, SUST CSE studies, AI automation leadership at Waffle Up, or qualifications."
          : "RJ.AI online (Groq + Gemini Dual Engine). Ask me about Kairyn v5.1, S_Track, ParallaxMascot3D, Waffle Up, or SUST CSE.",
    },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg || loading) return;
    setInput('');
    const updated: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let reply = '';
      setMessages(p => [...p, { role: 'assistant', content: '' }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages(p => {
          const c = [...p];
          c[c.length - 1] = { role: 'assistant', content: reply };
          return c;
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection issue.';
      setMessages(p => [
        ...p,
        { role: 'assistant', content: `Sorry, something went wrong: ${msg.slice(0, 120)}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const titleLabel =
    mode === 'recruiter'
      ? 'AI PORTFOLIO REPRESENTATIVE (RJ.AI)'
      : mode === 'friend'
      ? 'Ask Rafsan’s AI ✨'
      : mode === 'game'
      ? '// SOC NEURAL CORE (RJ.AI)'
      : '// RJ.AI (GROQ + GEMINI)';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] flex items-end justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40 }}
          className="w-full max-w-[540px] h-[550px] flex flex-col rounded-xl overflow-hidden shadow-2xl border"
          style={{
            background: 'var(--c-panel)',
            borderColor: 'var(--c-border)',
            color: 'var(--c-text)',
          }}
        >
          {/* Header — automatically adapts to Light & Dark mode in all 4 personas */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
            style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
          >
            <div className="flex items-center gap-2">
              <span className="status-dot" />
              <span
                className="text-[11px] font-mono tracking-widest uppercase font-semibold"
                style={{ color: 'var(--c-accent)' }}
              >
                {titleLabel}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-xs font-mono px-2 py-0.5 rounded border transition-opacity hover:opacity-75"
              style={{ color: 'var(--c-muted)', borderColor: 'var(--c-border)' }}
            >
              ✕ Close
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[86%] text-xs px-3.5 py-2.5 rounded-lg border"
                  style={
                    m.role === 'user'
                      ? {
                          background: 'var(--c-tag-bg)',
                          borderColor: 'var(--c-tag-border)',
                          color: 'var(--c-text)',
                        }
                      : {
                          background: 'var(--c-surface)',
                          borderColor: 'var(--c-border)',
                          color: 'var(--c-text)',
                        }
                  }
                >
                  {m.role === 'assistant' && (
                    <span
                      className="text-[9px] tracking-widest font-mono block mb-1 font-bold"
                      style={{ color: 'var(--c-accent)' }}
                    >
                      RJ.AI
                    </span>
                  )}
                  {m.role === 'assistant' && loading && i === messages.length - 1 && m.content === '' ? (
                    <span className="animate-pulse opacity-60">▋</span>
                  ) : (
                    <FormattedMessage text={m.content} />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Starter questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5 flex-shrink-0">
              {(STARTERS[mode] ?? STARTERS.developer).map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-[10.5px] px-2.5 py-1 rounded border transition-opacity hover:opacity-80 text-left"
                  style={{
                    borderColor: 'var(--c-border)',
                    color: 'var(--c-muted)',
                    background: 'var(--c-surface)',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            className="p-3 border-t flex-shrink-0"
            style={{ borderColor: 'var(--c-border)', background: 'var(--c-panel)' }}
          >
            <div
              className="flex gap-2 items-center border rounded-lg px-3 py-2"
              style={{ borderColor: 'var(--c-border)', background: 'var(--c-surface)' }}
            >
              <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--c-accent)' }}>
                &gt;
              </span>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask about Rafsan, Kairyn, SUST, Waffle Up..."
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-xs font-mono"
                style={{ color: 'var(--c-text)' }}
              />
              <button
                onClick={() => send()}
                disabled={loading}
                className="text-[10px] font-mono tracking-widest uppercase font-bold disabled:opacity-40"
                style={{ color: 'var(--c-accent)' }}
              >
                {loading ? '...' : 'SEND'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

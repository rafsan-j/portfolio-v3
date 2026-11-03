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
                    <span style={{ color: 'currentColor', opacity: 0.6, flexShrink: 0, marginTop: '1px' }}>▸</span>
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

  const theme = {
    developer: {
      panelBg: '#111118', headerBg: '#0d0d12', headerBdr: '#1a1a2e',
      accent: '#00ff88', title: '// RJ.AI (GROQ + GEMINI)',
      userBg: 'rgba(0,255,136,0.08)', userBdr: 'rgba(0,255,136,0.25)', userColor: '#e8e8f0',
      aiBg: '#0d0d12', aiBdr: '#1a1a2e', aiColor: '#c0c0d8',
      inputBg: '#0d0d12', inputBdr: '#1a1a2e', inputColor: '#e8e8f0',
    },
    game: {
      panelBg: '#07101e', headerBg: '#03060c', headerBdr: '#162a45',
      accent: '#00d4ff', title: '// SOC NEURAL CORE (RJ.AI)',
      userBg: 'rgba(0,212,255,0.12)', userBdr: 'rgba(0,212,255,0.3)', userColor: '#e8f4ff',
      aiBg: '#0a1526', aiBdr: '#162a45', aiColor: '#b8d4f0',
      inputBg: '#03060c', inputBdr: '#162a45', inputColor: '#e8f4ff',
    },
    recruiter: {
      panelBg: '#ffffff', headerBg: '#f1f5f9', headerBdr: '#e2e8f0',
      accent: '#0f766e', title: 'AI PORTFOLIO REPRESENTATIVE',
      userBg: '#0f172a', userBdr: '#0f172a', userColor: '#ffffff',
      aiBg: '#f8fafc', aiBdr: '#e2e8f0', aiColor: '#1e293b',
      inputBg: '#f8fafc', inputBdr: '#cbd5e1', inputColor: '#0f172a',
    },
    friend: {
      panelBg: '#1a0f2e', headerBg: '#2d1f4a', headerBdr: '#3d2a5a',
      accent: '#f472b6', title: 'Ask Rafsan’s AI ✨',
      userBg: 'rgba(244,114,182,0.15)', userBdr: 'rgba(244,114,182,0.35)', userColor: '#f5d0fe',
      aiBg: '#2d1f4a', aiBdr: '#3d2a5a', aiColor: '#e9d5ff',
      inputBg: '#2d1f4a', inputBdr: '#3d2a5a', inputColor: '#f5d0fe',
    },
  }[mode];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 500,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '1rem',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40 }}
          style={{
            width: '100%',
            maxWidth: '540px',
            height: '550px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            overflow: 'hidden',
            background: theme.panelBg,
            border: `1px solid ${theme.headerBdr}`,
            boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: `1px solid ${theme.headerBdr}`,
              background: theme.headerBg,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: theme.accent,
                  boxShadow: `0 0 6px ${theme.accent}`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                  color: theme.accent,
                }}
              >
                {theme.title}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                fontSize: '11px',
                color: theme.aiColor,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              ✕ Close
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                <div
                  style={{
                    maxWidth: '86%',
                    fontSize: '12.5px',
                    padding: '10px 13px',
                    borderRadius: '8px',
                    border: `1px solid ${m.role === 'user' ? theme.userBdr : theme.aiBdr}`,
                    background: m.role === 'user' ? theme.userBg : theme.aiBg,
                    color: m.role === 'user' ? theme.userColor : theme.aiColor,
                  }}
                >
                  {m.role === 'assistant' && (
                    <span
                      style={{
                        fontSize: '9px',
                        letterSpacing: '0.1em',
                        color: theme.accent,
                        fontFamily: 'monospace',
                        display: 'block',
                        marginBottom: '6px',
                        opacity: 0.85,
                      }}
                    >
                      RJ.AI
                    </span>
                  )}
                  {m.role === 'assistant' && loading && i === messages.length - 1 && m.content === '' ? (
                    <span style={{ animation: 'pulse 1s ease-in-out infinite', opacity: 0.6 }}>▋</span>
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
            <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px', flexShrink: 0 }}>
              {(STARTERS[mode] ?? STARTERS.developer).map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  style={{
                    fontSize: '10.5px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    border: `1px solid ${theme.headerBdr}`,
                    color: theme.aiColor,
                    background: theme.headerBg,
                    borderRadius: '4px',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.headerBdr}`, flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                border: `1px solid ${theme.inputBdr}`,
                borderRadius: '8px',
                padding: '8px 12px',
                background: theme.inputBg,
              }}
            >
              <span style={{ fontSize: '11px', color: theme.accent, fontFamily: 'monospace', flexShrink: 0 }}>
                &gt;
              </span>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask about Rafsan, Kairyn, SUST, Waffle Up..."
                autoFocus
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  color: theme.inputColor,
                }}
              />
              <button
                onClick={() => send()}
                disabled={loading}
                style={{
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                  color: loading ? theme.aiColor : theme.accent,
                  background: 'none',
                  border: 'none',
                  cursor: loading ? 'default' : 'pointer',
                  opacity: loading ? 0.4 : 1,
                }}
              >
                {loading ? '...' : 'SEND'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>
    </AnimatePresence>
  );
}

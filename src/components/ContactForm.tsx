'use client';

import React, { useState } from 'react';
import { Check, Mail, Send } from 'lucide-react';

const RECIPIENT_EMAIL = 'rafsan2972jani@gmail.com';

type FormStatus = 'idle' | 'submitting' | 'sent' | 'mailto_fallback' | 'error';

interface ContactResponse {
  ok?: boolean;
  mode?: string;
  error?: string;
}

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const buildMailtoHref = () => {
    const cleanSubject =
      subject.trim() || `Portfolio inquiry from ${name.trim() || 'visitor'}`;
    const bodyLines = [
      message.trim(),
      '',
      `From: ${name.trim()} (${email.trim()})`,
    ].join('\n');

    return `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(
      cleanSubject
    )}&body=${encodeURIComponent(bodyLines)}`;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setErrorMessage('Please enter your name.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (trimmedMessage.length < 10) {
      setErrorMessage('Please write a message of at least 10 characters.');
      return;
    }

    if (trimmedMessage.length > 5000) {
      setErrorMessage('Please keep your message under 5,000 characters.');
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          subject: subject.trim(),
          message: trimmedMessage,
          website,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as ContactResponse;

      if (!response.ok || !payload.ok) {
        setStatus('error');
        setErrorMessage(
          payload.error || 'Could not send right now. You can still email directly below.'
        );
        return;
      }

      if (payload.mode === 'mailto_fallback') {
        setStatus('mailto_fallback');
        return;
      }

      setStatus('sent');
    } catch {
      setStatus('mailto_fallback');
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setWebsite('');
    setErrorMessage('');
    setStatus('idle');
  };

  if (status === 'sent' || status === 'mailto_fallback') {
    return (
      <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-neutral)] p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-[var(--accent)]">
          <Check className="w-5 h-5" aria-hidden="true" />
          <h3 className="text-base font-semibold text-[var(--ink-primary)]">
            {status === 'sent' ? 'Message sent' : 'Ready to send via your email client'}
          </h3>
        </div>

        <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
          {status === 'sent'
            ? 'Thanks for reaching out. Your note has been delivered and I will reply from Sylhet (UTC+6).'
            : 'Your message is validated and ready. Because direct mail delivery is not active on this static deployment, open your mail client with the pre-filled message below.'}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {status === 'mailto_fallback' ? (
            <a
              href={buildMailtoHref()}
              className="min-h-[44px] px-4 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--ink-on-accent)] text-sm font-medium transition-colors duration-[var(--dur-fast)] active:scale-[0.97]"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span>Open pre-filled email</span>
            </a>
          ) : null}

          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] px-4 inline-flex items-center justify-center rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-neutral)] hover:border-[var(--border-hover)] text-sm text-[var(--ink-primary)] transition-colors duration-[var(--dur-fast)] active:scale-[0.97]"
          >
            Write another note
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      noValidate
      className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-neutral)] p-5 sm:p-6 space-y-4"
    >
      {/* Honeypot field for bot filtering */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="contact-name"
            className="block font-mono text-xs text-[var(--ink-secondary)]"
          >
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-neutral)] focus:border-[var(--border-interactive)] text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-secondary)] focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="contact-email"
            className="block font-mono text-xs text-[var(--ink-secondary)]"
          >
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-neutral)] focus:border-[var(--border-interactive)] text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-secondary)] focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="contact-subject"
          className="block font-mono text-xs text-[var(--ink-secondary)]"
        >
          Subject (optional)
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Android engineering, AI automation, or technical note"
          className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-neutral)] focus:border-[var(--border-interactive)] text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-secondary)] focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="contact-message"
          className="block font-mono text-xs text-[var(--ink-secondary)]"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={5000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share context, timeline, or technical details..."
          className="w-full p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-neutral)] focus:border-[var(--border-interactive)] text-sm leading-relaxed text-[var(--ink-primary)] placeholder:text-[var(--ink-secondary)] focus:outline-none resize-y"
        />
      </div>

      {errorMessage ? (
        <p role="alert" className="text-sm text-[var(--accent)]">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="min-h-[44px] px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-60 text-[var(--ink-on-accent)] text-sm font-medium transition-colors duration-[var(--dur-fast)] active:scale-[0.97]"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          <span>{status === 'submitting' ? 'Sending...' : 'Send message'}</span>
        </button>

        <a
          href={`mailto:${RECIPIENT_EMAIL}`}
          className="font-mono text-xs text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors duration-[var(--dur-fast)]"
        >
          Or email {RECIPIENT_EMAIL}
        </a>
      </div>
    </form>
  );
}

export default ContactForm;

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyEmailButtonProps {
  email?: string;
  className?: string;
}

export function CopyEmailButton({
  email = 'rafsan2972jani@gmail.com',
  className = '',
}: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = email;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopied(true);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-live="polite"
      className={`min-h-[44px] px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-neutral)] hover:border-[var(--border-hover)] text-sm font-mono text-[var(--ink-primary)] transition-colors duration-[var(--dur-fast)] active:scale-[0.97] ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
          <span className="text-[var(--accent)]">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 text-[var(--ink-secondary)]" aria-hidden="true" />
          <span>Copy email</span>
        </>
      )}
    </button>
  );
}

export default CopyEmailButton;

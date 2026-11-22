'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function StudioViewport() {
  const router = useRouter();

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string } | null;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'STUDIO_EXIT') {
        router.push('/');
      } else if (data.type === 'STUDIO_OPEN_CMDK') {
        window.dispatchEvent(new CustomEvent('open-command-palette'));
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [router]);

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] bg-[#0B0E11] overflow-hidden">
      <iframe
        src="/studio-scene.html"
        title="Living Sylhet 3D Studio"
        className="w-full h-full border-0 z-0"
        allow="autoplay"
      />

      <Link
        href="/"
        className="fixed top-[4.25rem] left-4 md:top-4 md:left-1/2 md:-translate-x-1/2 z-30 min-h-[44px] md:min-h-0 md:h-10 px-4 inline-flex items-center gap-2 rounded-full bg-[var(--bg-surface-translucent)] backdrop-blur-md border border-[var(--border-neutral)] hover:border-[var(--border-hover)] text-[var(--ink-primary)] text-xs font-mono tracking-[0.02em] shadow-[var(--shadow-dock)] transition-colors duration-[var(--dur-fast)] active:scale-[0.97]"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
        <span>Back to Editorial</span>
      </Link>
    </div>
  );
}

export default StudioViewport;

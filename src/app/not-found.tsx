import Link from 'next/link';
import { ArrowLeft, Box } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-16 sm:pt-24 pb-20">
      <div className="max-w-xl rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-8 sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)] tabular-nums">
          404 · Page not found
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-[-0.025em] leading-[1.12] text-[var(--ink-primary)]">
          This route does not exist.
        </h1>
        <p className="mt-4 text-base leading-[1.65] text-[var(--ink-secondary)]">
          The page you requested may have moved during the V4 rebuild, or the
          address may contain a typo. Return to the editorial home or open the
          3D studio directly.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--ink-on-accent)] transition-colors duration-150 hover:bg-[var(--accent-hover)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/studio"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-canvas)] px-5 py-2.5 text-sm font-medium text-[var(--ink-primary)] transition-colors duration-150 hover:border-[var(--border-hover)]"
          >
            <Box className="h-4 w-4 text-[var(--ink-secondary)]" aria-hidden="true" />
            <span>Enter 3D Studio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

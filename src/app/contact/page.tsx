import type { Metadata } from 'next';
import { ArrowUpRight, Clock, Mail } from 'lucide-react';
import { PROFILE } from '@/content/profile';
import { CopyEmailButton } from '@/components/CopyEmailButton';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Rafsan Jani via email, GitHub, LinkedIn, or the direct contact form.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-12 sm:pt-16 pb-16">
      <header className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
          Contact · {PROFILE.location}
        </p>
        <h1 className="mt-2 text-3xl sm:text-[2.5rem] font-semibold tracking-[-0.025em] leading-[1.12] text-[var(--ink-primary)]">
          Get in touch
        </h1>
        <p className="mt-4 text-base leading-[1.65] text-[var(--ink-secondary)]">
          {PROFILE.contact.intro}
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Direct Channels */}
        <aside className="space-y-5 lg:col-span-5">
          <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-6">
            <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
              Direct Email
            </p>
            <a
              href={PROFILE.links.email}
              className="mt-2 inline-flex items-center gap-2 font-mono text-sm font-medium text-[var(--ink-primary)] transition-colors duration-150 hover:text-[var(--accent)] break-all"
            >
              <Mail
                className="h-4 w-4 shrink-0 text-[var(--ink-secondary)]"
                aria-hidden="true"
              />
              <span>{PROFILE.email}</span>
            </a>

            <div className="mt-4">
              <CopyEmailButton />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-6">
            <p className="font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
              Profiles
            </p>
            <ul className="mt-3 space-y-2.5">
              <li>
                <a
                  href={PROFILE.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] w-full items-center justify-between rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-canvas)] px-4 py-2.5 text-sm font-medium text-[var(--ink-primary)] transition-colors duration-150 hover:border-[var(--border-hover)]"
                >
                  <span>GitHub · @rafsan-j</span>
                  <ArrowUpRight
                    className="h-4 w-4 text-[var(--ink-secondary)]"
                    aria-hidden="true"
                  />
                </a>
              </li>
              <li>
                <a
                  href={PROFILE.links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] w-full items-center justify-between rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-canvas)] px-4 py-2.5 text-sm font-medium text-[var(--ink-primary)] transition-colors duration-150 hover:border-[var(--border-hover)]"
                >
                  <span>LinkedIn · rafsan-jani72</span>
                  <ArrowUpRight
                    className="h-4 w-4 text-[var(--ink-secondary)]"
                    aria-hidden="true"
                  />
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-6">
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Timezone &amp; Availability</span>
            </p>
            <p className="mt-2.5 text-sm leading-[1.65] text-[var(--ink-secondary)]">
              {PROFILE.contact.availability}
            </p>
          </div>
        </aside>

        {/* Contact Form */}
        <section aria-label="Send a message" className="lg:col-span-7">
          <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] p-6 sm:p-8">
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-[var(--ink-primary)]">
              Send a message
            </h2>
            <p className="mt-1.5 text-sm text-[var(--ink-secondary)]">
              Include a brief overview of what you are building and how I can
              help.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

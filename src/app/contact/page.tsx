import type { Metadata } from 'next';
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
    <div className="pt-16 w-full max-w-[1680px] mx-auto px-6 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Sticky Left Header & Direct Channels Rail */}
        <aside className="lg:col-span-5 lg:border-r border-[var(--border-neutral)] py-12 lg:py-20 lg:pr-10 border-b lg:border-b-0">
          <div className="lg:sticky lg:top-24 lg:self-start space-y-10">
            <header className="space-y-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
                Correspondence
              </p>
              <h1 className="editorial-display text-[var(--ink-primary)]">
                Get in <em className="italic font-light">touch</em>
              </h1>
              <p className="max-w-[44ch] text-[15px] leading-[1.72] text-[var(--ink-secondary)]">
                {PROFILE.contact.intro}
              </p>
            </header>

            <div className="divide-y divide-[var(--border-neutral)] border-t border-b border-[var(--border-neutral)]">
              <div className="py-5 space-y-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-secondary)]">
                  Direct email
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={PROFILE.links.email}
                    className="font-mono text-sm text-[var(--ink-primary)] hover-accent break-all"
                  >
                    {PROFILE.email}
                  </a>
                  <CopyEmailButton />
                </div>
              </div>

              <div className="py-5 flex items-center justify-between gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-secondary)]">
                  GitHub
                </span>
                <a
                  href={PROFILE.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-[var(--ink-primary)] hover-accent"
                >
                  @rafsan-j
                </a>
              </div>

              <div className="py-5 flex items-center justify-between gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-secondary)]">
                  LinkedIn
                </span>
                <a
                  href={PROFILE.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-[var(--ink-primary)] hover-accent"
                >
                  rafsan-jani72
                </a>
              </div>

              <div className="py-5 space-y-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-secondary)]">
                  Availability
                </p>
                <p className="text-sm leading-[1.66] text-[var(--ink-secondary)]">
                  {PROFILE.contact.availability}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right 7-Column Message Form Stage */}
        <section
          aria-label="Send a message"
          className="lg:col-span-7 py-12 lg:py-20 lg:pl-12"
        >
          <div className="max-w-2xl">
            <h2 className="font-serif font-normal text-[36px] lg:text-[44px] leading-[1.04] tracking-[-0.02em] text-[var(--ink-primary)]">
              Send a <em className="italic font-light">note</em>
            </h2>
            <p className="mt-3 text-sm leading-[1.68] text-[var(--ink-secondary)]">
              Include a brief overview of what you are building and how I can
              help.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

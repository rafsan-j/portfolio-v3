import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Mono, Manrope } from 'next/font/google';
import './globals.css';
import { PROFILE } from '@/content/profile';
import { FLAGSHIP_PROJECTS } from '@/content/projects';
import { ESSAYS } from '@/content/writing';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ShellChrome } from '@/components/layout/ShellChrome';
import { Footer } from '@/components/layout/Footer';
import { CommandPalette } from '@/components/CommandPalette';
import { CursorPreviewProvider } from '@/components/motion/CursorPreview';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-manrope',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rafsanjani.dev';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PROFILE.name} — Software Engineer & SUST CSE`,
    template: `%s · ${PROFILE.name}`,
  },
  description:
    'Offline-first native Android apps, applied AI systems, and procedural visual software by Rafsan Jani in Sylhet, Bangladesh.',
  authors: [{ name: PROFILE.name }],
  creator: PROFILE.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: PROFILE.name,
    title: `${PROFILE.name} — Software Engineer & SUST CSE`,
    description:
      'Offline-first native Android apps, applied AI systems, and procedural visual software built in Sylhet, Bangladesh.',
  },
  twitter: {
    card: 'summary',
    title: `${PROFILE.name} — Software Engineer & SUST CSE`,
    description:
      'Offline-first native Android apps, applied AI systems, and procedural visual software.',
  },
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.setAttribute('data-theme','light');}else{document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

const COMMAND_PROJECTS = FLAGSHIP_PROJECTS.map(({ slug, title, tagline }) => ({
  slug,
  title,
  tagline,
}));

const COMMAND_ESSAYS = ESSAYS.map(({ slug, title }) => ({
  slug,
  title,
}));

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${cormorantGaramond.variable} ${manrope.variable} ${dmMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-[var(--bg-canvas)] text-[var(--ink-primary)] font-sans antialiased">
        <ThemeProvider>
          <ShellChrome footer={<Footer />}>
            <CursorPreviewProvider>{children}</CursorPreviewProvider>
          </ShellChrome>
          <CommandPalette
            projects={COMMAND_PROJECTS}
            essays={COMMAND_ESSAYS}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

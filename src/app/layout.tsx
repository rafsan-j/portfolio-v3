import type { Metadata } from 'next';
import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { PROFILE } from '@/content/profile';
import { FLAGSHIP_PROJECTS } from '@/content/projects';
import { ESSAYS } from '@/content/writing';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ShellChrome } from '@/components/layout/ShellChrome';
import { Footer } from '@/components/layout/Footer';
import { CommandPalette } from '@/components/CommandPalette';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
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
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-[var(--bg-canvas)] text-[var(--ink-primary)] font-sans antialiased">
        <ThemeProvider>
          <ShellChrome footer={<Footer />}>{children}</ShellChrome>
          <CommandPalette
            projects={COMMAND_PROJECTS}
            essays={COMMAND_ESSAYS}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

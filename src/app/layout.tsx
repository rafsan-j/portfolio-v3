import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { VisitorModeProvider } from '@/components/ui/VisitorModeProvider';
import { CommandPalette }      from '@/components/ui/CommandPalette';
import { Terminal }            from '@/components/ui/Terminal';

export const metadata: Metadata = {
  title: { default: 'Rafsan Jani — CSE @ SUST & AI Automation Builder', template: '%s | Rafsan Jani' },
  description:
    'B.Sc. in CSE at SUST, AI & Automation Executive at Waffle Up, Educator at Tworon, and Top 0.01% National Merit Scholar (17th). Builder of Kairyn v5.1, S_Track, and AgriBase.',
  keywords: [
    'Rafsan Jani',
    'SUST CSE',
    'Kairyn',
    'Waffle Up',
    'Tworon',
    'AgriBase',
    'Bangladesh',
    'Software Engineer',
    'AI Automation',
  ],
  authors: [{ name: 'Rafsan Jani' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Rafsan Jani',
    title: 'Rafsan Jani — Software Engineer & AI Automation Builder',
    description:
      'CSE @ SUST · Top 0.01% National Merit · Builder of Kairyn 3D Android OS, S_Track, and AgriBase.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: '#050505', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <VisitorModeProvider>
          {children}
          <CommandPalette />
          <Terminal />
        </VisitorModeProvider>
      </body>
    </html>
  );
}

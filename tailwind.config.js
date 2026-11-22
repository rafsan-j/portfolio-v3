/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/content/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: [
          'var(--font-jetbrains-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        track: 'var(--bg-track)',
        ink: {
          primary: 'var(--ink-primary)',
          secondary: 'var(--ink-secondary)',
          'on-accent': 'var(--ink-on-accent)',
        },
        border: {
          neutral: 'var(--border-neutral)',
          hover: 'var(--border-hover)',
          interactive: 'var(--border-interactive)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          tint: 'var(--accent-tint)',
        },
      },
      transitionTimingFunction: {
        obsidian: 'var(--ease-obsidian)',
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
      },
      boxShadow: {
        dock: 'var(--shadow-dock)',
        modal: 'var(--shadow-modal)',
      },
    },
  },
  plugins: [],
};

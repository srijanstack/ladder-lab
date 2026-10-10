/** Colours point at CSS variables (see src/index.css) so light and dark themes share one set of class names. */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        chrome: 'var(--chrome)',
        panel: 'var(--panel)',
        ink: 'var(--ink)',
        mute: 'var(--mute)',
        line: 'var(--line)',
        accent: 'var(--accent)',
        accentink: 'var(--accentink)',
        live: 'var(--live)',
        livebg: 'var(--livebg)',
        bad: 'var(--bad)',
        warn: 'var(--warn)',
        field: 'var(--field)'
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'Segoe UI', 'Tahoma', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
};

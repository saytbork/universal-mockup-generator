/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surfaceElevated: 'var(--surface-elevated)',
        surfaceNested: 'var(--surface-nested)',
        surfaceMuted: 'var(--surface-muted)',
        surfaceTint: 'var(--surface-tint)',
        border: 'var(--border)',
        borderSubtle: 'var(--border)',
        borderStrong: 'var(--border-strong)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        accent: 'var(--accent)',
        accentSoft: 'var(--accent-soft)',
      },
      borderRadius: {
        apple: '20px',
        'apple-xl': '36px',
      },
      boxShadow: {
        accent: '0 0 40px var(--accent-glow)',
        glowActive: '0 0 40px var(--accent-glow)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
};

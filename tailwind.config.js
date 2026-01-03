/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surfaceElevated: 'var(--surface-elevated)',
        surfaceTint: 'var(--surface-tint)',
        borderSubtle: 'var(--border)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        accent: 'rgb(var(--accent-primary-rgb) / <alpha-value>)',
        success: 'var(--success)',
      },
      borderRadius: {
        apple: '20px',
        'apple-xl': '36px',
      },
      boxShadow: {
        'accent-glow': '0 18px 40px var(--accent-glow)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
};

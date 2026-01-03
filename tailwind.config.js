/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--surface-elevated) / <alpha-value>)',
        borderSubtle: 'rgb(var(--border) / 0.10)',
        textPrimary: 'rgb(var(--text-primary) / <alpha-value>)',
        textSecondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        textMuted: 'rgb(var(--text-muted) / <alpha-value>)',
        accent: 'rgb(var(--accent-primary) / <alpha-value>)',
      },
      borderRadius: {
        apple: '20px',
        'apple-xl': '36px',
      },
      boxShadow: {
        'accent-xl': '0 20px 40px rgba(79,70,229,0.20)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
};


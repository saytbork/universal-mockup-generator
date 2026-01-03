/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--surface-elevated-rgb) / <alpha-value>)',
        borderSubtle: 'var(--border)',
        textPrimary: 'rgb(var(--text-primary-rgb) / <alpha-value>)',
        textSecondary: 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
        textMuted: 'rgb(var(--text-muted-rgb) / <alpha-value>)',
        accent: 'rgb(var(--accent-primary-rgb) / <alpha-value>)',
      },
      borderRadius: {
        apple: '20px',
        'apple-xl': '36px',
      },
      boxShadow: {
        'accent-xl': '0 20px 40px rgba(79,70,229,0.25)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.{html,js,ts,jsx,tsx}",
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./components/**/*.{html,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surfaceElevated: 'var(--surface-elevated)',
        surfaceTint: 'var(--surface-tint)',
        surfaceGlass: 'var(--surface-glass)',
        surfaceSoft: 'var(--surface-soft)',
        borderSubtle: 'var(--border)',
        borderSoft: 'var(--border-soft)',
        borderHover: 'var(--border-hover)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        accent: 'var(--accent-primary)',
        accentRgb: 'rgb(var(--accent-primary-rgb) / <alpha-value>)',
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
      keyframes: {
        scaleIcon: {
          '0%': { transform: 'scale(0.5) rotate(-45deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'scale-icon': 'scaleIcon 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.5s ease-out',
      },
    },
  },
};

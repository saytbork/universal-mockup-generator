import React from 'react';
import { Aperture } from 'lucide-react';

type LogoVariant = 'siteNav' | 'appHeader';

type LogoProps = {
  variant?: LogoVariant;
  className?: string;
};

const variantStyles: Record<
  LogoVariant,
  { icon: string; wordmark: string; accent: string }
> = {
  siteNav: {
    icon: 'w-6 h-6 text-indigo-600 dark:text-indigo-300',
    wordmark: 'uppercase text-lg font-black tracking-tight text-gray-900 dark:text-white leading-none',
    accent: 'text-indigo-600 dark:text-indigo-300',
  },
  appHeader: {
    icon: 'w-7 h-7 text-indigo-600 dark:text-indigo-400',
    wordmark: 'uppercase text-4xl font-black tracking-tight text-gray-900 dark:text-white leading-none',
    accent: 'text-indigo-600 dark:text-indigo-400',
  },
};

export default function Logo({ variant = 'siteNav', className = '' }: LogoProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Aperture className={styles.icon} strokeWidth={2} />
      <span className={styles.wordmark}>
        Perfect <span className={styles.accent}>Mockup</span>
      </span>
    </div>
  );
}


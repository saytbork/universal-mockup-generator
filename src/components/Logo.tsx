import React from 'react';

type LogoVariant = 'siteNav' | 'appHeader';

type LogoProps = {
  variant?: LogoVariant;
  className?: string;
};

const variantStyles: Record<LogoVariant, { height: string }> = {
  siteNav: {
    height: 'h-6',
  },
  appHeader: {
    height: 'h-9',
  },
};

export default function Logo({ variant = 'siteNav', className = '' }: LogoProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/img/logos/colorlogo.svg"
        alt="Perfect Mockup"
        className={`${styles.height} w-auto dark:hidden`}
        draggable={false}
      />
      <img
        src="/img/logos/logowhite.svg"
        alt="Perfect Mockup"
        className={`${styles.height} w-auto hidden dark:block`}
        draggable={false}
      />
    </div>
  );
}

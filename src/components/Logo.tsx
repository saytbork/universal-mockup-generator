import React from 'react';

import colorLogoUrl from '../../img/logos/svg/colorlogo.svg';
import whiteLogoUrl from '../../img/logos/svg/logowhite.svg';

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
        src={colorLogoUrl}
        alt="Perfect Mockup"
        className={`${styles.height} w-auto dark:hidden`}
        draggable={false}
      />
      <img
        src={whiteLogoUrl}
        alt="Perfect Mockup"
        className={`${styles.height} w-auto hidden dark:block`}
        draggable={false}
      />
    </div>
  );
}

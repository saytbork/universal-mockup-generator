import React from 'react';

type ChipSize = 'xs' | 'sm' | 'md';

const sizeMap: Record<ChipSize, string> = {
  xs: 'px-3 py-1.5 text-xs',
  sm: 'px-3 py-1.5 text-xs sm:text-sm',
  md: 'px-3.5 py-2 text-xs sm:text-sm',
};

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: ChipSize;
}

const baseClass =
  'inline-flex items-center gap-1 rounded-full border transition-colors whitespace-nowrap font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg';

const activeClass =
  'bg-accent text-white border-accent hover:bg-accent/90 scale-105 duration-500 shadow-accent-xl';

const inactiveClass =
  'bg-bg/40 text-textSecondary border-borderSubtle hover:border-accent hover:text-textPrimary';

const disabledClass =
  'opacity-50 cursor-not-allowed pointer-events-none bg-bg/30 text-textMuted border-borderSubtle';

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ selected = false, disabled = false, size = 'sm', className = '', children, ...props }, ref) => {
    const classes = [
      baseClass,
      sizeMap[size],
      disabled ? disabledClass : (selected ? activeClass : inactiveClass),
      disabled ? '' : 'cursor-pointer',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button type="button" ref={ref} className={classes} disabled={disabled} {...props}>
        {children}
      </button>
    );
  }
);

Chip.displayName = 'Chip';

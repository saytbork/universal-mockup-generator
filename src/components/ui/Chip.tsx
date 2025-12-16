import React from 'react';

type ChipSize = 'xs' | 'sm' | 'md';

const sizeMap: Record<ChipSize, string> = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3.5 py-2 text-sm',
};

type ChipTone = 'indigo' | 'warm';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: ChipSize;
  tone?: ChipTone;
}

const baseClass =
  'inline-flex items-center gap-1 rounded-full border transition-colors duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0';

const activeToneClass: Record<ChipTone, string> = {
  indigo: 'border-indigo-400 bg-indigo-500/15 text-white shadow-[0_0_0_1px_rgba(99,102,241,0.15)]',
  warm: 'border-amber-300 bg-amber-500/15 text-white shadow-[0_0_0_1px_rgba(255,193,7,0.18)]',
};

const inactiveToneClass: Record<ChipTone, string> = {
  indigo:
    'border-gray-700 text-gray-300 hover:text-gray-100 hover:border-gray-500 active:border-indigo-300 active:text-white',
  warm:
    'border-gray-700 text-gray-200 hover:text-white hover:border-amber-300 active:border-amber-400 active:text-white',
};
const disabledClass = 'opacity-40 cursor-not-allowed hover:border-gray-700 hover:text-gray-400';

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ selected = false, disabled = false, size = 'sm', tone = 'indigo', className = '', children, ...props }, ref) => {
    const classes = [
      baseClass,
      sizeMap[size],
      selected ? activeToneClass[tone] : inactiveToneClass[tone],
      disabled ? disabledClass : 'cursor-pointer',
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

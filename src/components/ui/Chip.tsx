import React from 'react';

type ChipSize = 'xs' | 'sm' | 'md';

const sizeMap: Record<ChipSize, string> = {
  xs: 'px-3 py-1',
  sm: 'px-4 py-2',
  md: 'px-4 py-2',
};

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: ChipSize;
}

const baseClass =
  'inline-flex items-center gap-1 rounded-xl border transition-all duration-400 whitespace-nowrap font-bold text-[10px] focus:outline-none';

const activeClass =
  'border-indigo-600 bg-indigo-600 text-white shadow-lg';

const inactiveClass =
  'border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20';

const disabledClass =
  'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100 dark:bg-zinc-800 text-gray-400 border-gray-200 dark:border-white/5';

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

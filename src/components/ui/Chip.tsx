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
  'border-accent bg-accent text-white shadow-lg';

const inactiveClass =
  'border-borderSubtle border-borderSoft bg-surfaceSoft text-textMuted hover:border-borderHover hover:border-borderHover';

const disabledClass =
  'opacity-50 cursor-not-allowed pointer-events-none bg-surfaceElevated text-textMuted border-borderSubtle border-borderSoft';

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

import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type ChipSize = 'xs' | 'sm' | 'md';

const sizeMap: Record<ChipSize, string> = {
  xs: 'px-3 py-1',
  sm: 'px-4 py-2',
  md: 'px-4 py-2',
};

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: ChipSize;
  tone?: 'default' | 'warm';
  tooltip?: string;
}

const baseClass =
  'inline-flex max-w-full items-center gap-1 rounded-xl border transition-all duration-300 whitespace-nowrap font-bold text-[10px] focus:outline-none min-w-0';

const activeClass =
  'border-indigo-600 bg-indigo-600 text-white shadow-lg';

const inactiveClass =
  'border-gray-200 bg-white text-gray-600 hover:border-gray-400 dark:bg-white/5 dark:text-white/60 dark:border-white/10 dark:hover:border-white/30';

const warmActiveClass =
  'border-orange-500 bg-orange-500 text-white shadow-lg';

const warmInactiveClass =
  'border-orange-200 bg-orange-50/50 text-orange-700 hover:border-orange-300 dark:bg-orange-500/10 dark:text-orange-200 dark:border-orange-500/30 dark:hover:border-orange-500/50';

const disabledClass =
  'opacity-70 cursor-not-allowed pointer-events-none bg-gray-50/80 text-gray-400 border-gray-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10';

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ selected = false, disabled = false, size = 'sm', tone = 'default', tooltip, className = '', children, ...props }, ref) => {
    const classes = [
      baseClass,
      sizeMap[size],
      disabled
        ? disabledClass
        : (tone === 'warm'
          ? (selected ? warmActiveClass : warmInactiveClass)
          : (selected ? activeClass : inactiveClass)),
      disabled ? '' : 'cursor-pointer',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inferredTitle =
      tooltip ??
      props.title ??
      (typeof children === 'string' ? children : undefined);

    const button = (
      <button type="button" ref={ref} className={classes} disabled={disabled} title={inferredTitle} {...props}>
        {typeof children === 'string' ? <span className="truncate max-w-full">{children}</span> : children}
      </button>
    );

    if (!tooltip) return button;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm opacity-90">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }
);

Chip.displayName = 'Chip';

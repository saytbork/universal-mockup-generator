import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type ChipSize = 'xs' | 'sm' | 'md';

const sizeMap: Record<ChipSize, string> = {
  xs: 'h-7 px-3',
  sm: 'h-8 px-4',
  md: 'h-9 px-5',
};

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: ChipSize;
  tone?: 'default' | 'warm';
  tooltip?: string;
}

const baseClass =
  'inline-flex items-center justify-center gap-1 rounded-full border transition-colors duration-200 whitespace-nowrap font-semibold text-xs leading-none normal-case focus:outline-none';

const activeClass =
  'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-500/20';

const inactiveClass =
  'border-gray-200 bg-white text-gray-600 hover:border-indigo-600 dark:bg-white/5 dark:text-white/60 dark:border-white/10 dark:hover:border-white/30';

const warmActiveClass =
  'border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-500/20';

const warmInactiveClass =
  'border-orange-200 bg-orange-50/50 text-orange-700 hover:border-orange-300 dark:bg-orange-500/10 dark:text-orange-200 dark:border-orange-500/30 dark:hover:border-orange-500/50';

const disabledClass =
  'opacity-50 cursor-not-allowed pointer-events-none bg-gray-50 text-gray-400 border-gray-200 dark:bg-white/5 dark:text-white/30 dark:border-white/10';

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
        {children}
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

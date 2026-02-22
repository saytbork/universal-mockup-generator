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
  description?: string;
}

const baseClass =
  'inline-flex max-w-full items-center gap-1 rounded-full border transition-colors whitespace-nowrap text-xs font-semibold focus:outline-none min-w-0';

const activeClass =
  'border-indigo-600 bg-indigo-600 text-white';

const inactiveClass =
  'border-gray-200 bg-white text-gray-600 hover:border-indigo-600 dark:bg-white/5 dark:text-white/60 dark:border-white/10 dark:hover:border-white/30';

const warmActiveClass =
  'border-orange-500 bg-orange-500 text-white';

const warmInactiveClass =
  'border-orange-200 bg-orange-50/50 text-orange-700 hover:border-orange-300 dark:bg-orange-500/10 dark:text-orange-200 dark:border-orange-500/30 dark:hover:border-orange-500/50';

const disabledClass =
  'opacity-70 cursor-not-allowed pointer-events-none bg-gray-50/80 text-gray-400 border-gray-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10';

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ selected = false, disabled = false, size = 'sm', tone = 'default', tooltip, description, className = '', children, ...props }, ref) => {
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

    const resolvedChildren = (() => {
      if (React.isValidElement(children) || Array.isArray(children)) {
        return { kind: 'node' as const, value: children };
      }
      if (typeof children === 'string' || typeof children === 'number') {
        return { kind: 'text' as const, value: String(children) };
      }
      if (children == null || typeof children === 'boolean') {
        return { kind: 'node' as const, value: children };
      }
      if (typeof children === 'object') {
        try {
          return { kind: 'text' as const, value: JSON.stringify(children) };
        } catch {
          return { kind: 'text' as const, value: String(children) };
        }
      }
      return { kind: 'text' as const, value: String(children) };
    })();

    const safeTooltip = typeof tooltip === 'string'
      ? tooltip
      : (typeof description === 'string' ? description : undefined);
    const inferredTitle =
      safeTooltip ??
      props.title ??
      (resolvedChildren.kind === 'text' ? resolvedChildren.value : undefined);

    const button = (
      <button type="button" ref={ref} className={classes} disabled={disabled} title={inferredTitle} {...props}>
        {resolvedChildren.kind === 'text'
          ? <span className="truncate max-w-full">{resolvedChildren.value}</span>
          : resolvedChildren.value}
      </button>
    );

    if (!safeTooltip) return button;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm opacity-90">
          {safeTooltip}
        </TooltipContent>
      </Tooltip>
    );
  }
);

Chip.displayName = 'Chip';

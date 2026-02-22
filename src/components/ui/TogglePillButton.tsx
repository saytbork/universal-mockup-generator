import React from 'react';

type TogglePillButtonProps = {
  active: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
};

const ACTIVE_CLASS =
  'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 dark:text-white';

const INACTIVE_CLASS =
  'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-600 dark:bg-white/5 dark:text-white/60 dark:border-white/10 dark:hover:border-white/30';

export const getTogglePillClass = (active: boolean, fullWidth = false) =>
  [
    'rounded-full px-4 py-2 text-xs font-semibold border transition-colors',
    fullWidth ? 'w-full text-center' : '',
    active ? ACTIVE_CLASS : INACTIVE_CLASS,
  ]
    .filter(Boolean)
    .join(' ');

export function TogglePillButton({
  active,
  onClick,
  children,
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
}: TogglePillButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        getTogglePillClass(active, fullWidth),
        disabled ? 'opacity-60 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}

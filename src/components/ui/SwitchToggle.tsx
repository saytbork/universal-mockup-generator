import React from 'react';

type SwitchToggleProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  title?: string;
  size?: 'sm' | 'md';
  'aria-label'?: string;
};

export function SwitchToggle({
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
  id,
  title,
  size = 'md',
  'aria-label': ariaLabel,
}: SwitchToggleProps) {
  const trackSizeClass = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
  const thumbSizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const thumbTranslateClass = size === 'sm' ? (checked ? 'translate-x-4' : 'translate-x-0') : (checked ? 'translate-x-5' : 'translate-x-0');

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onCheckedChange(!checked);
      }}
      className={[
        `relative inline-flex ${trackSizeClass} shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out`,
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white',
        checked
          ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
          : 'bg-gray-200 border-gray-200 dark:bg-white/10 dark:border-white/10',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          `pointer-events-none inline-block ${thumbSizeClass} transform rounded-full bg-white border border-gray-200 ring-0 transition duration-200 ease-in-out`,
          thumbTranslateClass,
        ].join(' ')}
      />
    </button>
  );
}

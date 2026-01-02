import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface SmoothAccordionProps {
  title: string;
  tooltip: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  defaultOpen?: boolean;
  isRequired?: boolean;
  isTouched?: boolean;
  isActive?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'expert';
}

const SmoothAccordion: React.FC<SmoothAccordionProps> = ({
  title,
  tooltip,
  icon: Icon,
  children,
  isOpen,
  onToggle,
  defaultOpen = false,
  isRequired = false,
  isTouched = false,
  isActive = true,
  className = '',
  variant = 'primary',
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = typeof isOpen === 'boolean';
  const open = controlled ? isOpen : internalOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(prev => !prev);
    }
  };

  const headerTextClass = open ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-200';
  const containerVariantClass = (() => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-50 dark:bg-gray-800/30 border border-gray-200/70 dark:border-white/10 opacity-70 hover:opacity-100 hover:border-indigo-400';
      case 'expert':
        return 'bg-gray-100 dark:bg-gray-900/40 border border-gray-200/50 dark:border-white/5 opacity-60 hover:opacity-100 hover:border-indigo-400';
      case 'primary':
      default:
        return 'bg-white dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 opacity-100';
    }
  })();

  return (
    <div className={`rounded-xl overflow-hidden transition-all ${containerVariantClass} ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 transition focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700/20"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold ${headerTextClass}`}>{title}</p>
              {isRequired && !isTouched && (
                <span className="text-xs text-amber-600 dark:text-amber-400">*Required</span>
              )}
              {isTouched && isActive && (
                <Check className="w-4 h-4 text-green-400" />
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 opacity-80">{tooltip}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transform transition-transform duration-300 ${open ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
            }`}
        />
      </button>
      <div
        className={`grid transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-t border-gray-200 dark:border-gray-700 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmoothAccordion;

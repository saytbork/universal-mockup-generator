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

  const headerTextClass = open ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-white/90';
  const containerVariantClass = (() => {
    switch (variant) {
      case 'secondary':
      case 'expert':
      case 'primary':
      default:
        return '';
    }
  })();

  return (
    <div className={`rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 overflow-hidden mb-2 transition-all duration-300 ${containerVariantClass} ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition focus:outline-none"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-indigo-400" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold ${headerTextClass}`}>{title}</p>
              {isRequired && !isTouched && (
                <span className="text-xs text-gray-400 dark:text-gray-500">*Required</span>
              )}
              {isTouched && isActive && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{tooltip}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-300 dark:text-gray-600 transform transition-transform duration-300 ${open ? 'rotate-180 text-indigo-500' : ''}`}
        />
      </button>
      <div
        className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-t border-gray-100 dark:border-white/5 overflow-hidden ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-4 bg-gray-50/50 dark:bg-black/20">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SmoothAccordion;

import React from 'react';
import { Check } from 'lucide-react';

interface AccordionSectionProps {
  icon: React.ElementType;
  title: string;
  tooltip: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isRequired?: boolean;
  isTouched?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  icon: Icon,
  title,
  tooltip,
  isOpen,
  onToggle,
  children,
  isRequired = false,
  isTouched = false,
  isActive = true,
  isDisabled = false,
  disabledReason
}) => {
  return (
    <div className={`rounded-xl border border-gray-700 bg-gray-800/30 overflow-hidden ${isDisabled ? 'opacity-60' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        disabled={isDisabled}
        className={`w-full flex items-center justify-between p-4 transition ${isDisabled ? 'cursor-not-allowed' : 'hover:bg-gray-700/20'}`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-indigo-400" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white">{title}</p>
              {isRequired && !isTouched && (
                <span className="text-xs text-amber-400">*Required</span>
              )}
              {isDisabled && (
                <span className="text-xs text-gray-400">Locked</span>
              )}
              {isTouched && isActive && (
                <Check className="w-4 h-4 text-green-400" />
              )}
            </div>
            <p className="text-xs text-gray-400">{disabledReason ?? tooltip}</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionSection;
export type { AccordionSectionProps };

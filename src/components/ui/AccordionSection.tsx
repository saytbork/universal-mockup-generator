import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type AccordionSectionProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  required?: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
  id?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  isTouched?: boolean;
  isActive?: boolean;
  className?: string;
  iconClassName?: string;
  helpTooltip?: string;
  ui?: 'legacy' | 'tokens';
  variant?: 'primary' | 'secondary' | 'expert';
};

export function AccordionSection({
  icon: Icon,
  title,
  description,
  required = false,
  children,
  defaultOpen = false,
  id,
  isOpen,
  onToggle,
  isTouched = false,
  isActive = true,
  className = '',
  iconClassName = '',
  helpTooltip,
}: AccordionSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const controlled = typeof isOpen === 'boolean';
  const open = controlled ? isOpen : internalOpen;

  const [maxHeight, setMaxHeight] = useState<number>(defaultOpen ? 9999 : 0);

  useEffect(() => {
    if (!open) {
      setMaxHeight(0);
      return;
    }

    const measure = () => {
      if (!contentRef.current) return;
      setMaxHeight(contentRef.current.scrollHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [open, children]);

  const containerClassName = useMemo(
    () =>
      `rounded-xl border border-gray-200 bg-white overflow-hidden mb-4 transition-all duration-300 dark:bg-white/5 dark:border-white/10 dark:backdrop-blur-[20px] dark:backdrop-saturate-[180%] ${className}`.trim(),
    [className]
  );

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
      return;
    }
    setInternalOpen((prev) => !prev);
  };

  return (
    <div id={id} className={containerClassName}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors focus:outline-none dark:bg-transparent dark:hover:bg-white/5"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 text-indigo-600 dark:text-indigo-300 ${iconClassName}`.trim()} />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
              {(description || helpTooltip) ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white/70"
                      aria-label={`${title} help`}
                      title="Help"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                    <TooltipContent side="right">
                    <span className="whitespace-pre-line">{helpTooltip ?? description}</span>
                  </TooltipContent>
                </Tooltip>
              ) : null}
              {required && !isTouched && (
                <span className="text-xs text-gray-500 dark:text-white/50">*Required</span>
              )}
              {isTouched && isActive && <Check className="w-4 h-4 text-green-500" />}
            </div>
            <p className="text-[10px] text-gray-500 font-medium dark:text-white/40">{description}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transform transition-transform duration-300 dark:text-white/50 ${open ? 'rotate-180 text-indigo-600 dark:text-indigo-300' : ''}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? 'opacity-100' : 'opacity-0'}`}
        style={{ maxHeight: open ? `${maxHeight}px` : '0px' }}
      >
        <div ref={contentRef} className="p-5 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}

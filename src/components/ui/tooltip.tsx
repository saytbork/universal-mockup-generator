import React, { cloneElement, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

type TooltipDelayContextValue = {
  delayDuration: number;
};

const TooltipDelayContext = createContext<TooltipDelayContextValue>({ delayDuration: 0 });

type TooltipContextValue = {
  isOpen: boolean;
  open: (target?: EventTarget | null) => void;
  close: () => void;
  triggerRect: DOMRect | null;
  setTriggerRect: (rect: DOMRect | null) => void;
};

const TooltipContext = createContext<TooltipContextValue | null>(null);

export const TooltipProvider: React.FC<React.PropsWithChildren<{ delayDuration?: number }>> = ({
  delayDuration = 0,
  children,
}) => {
  return <TooltipDelayContext.Provider value={{ delayDuration }}>{children}</TooltipDelayContext.Provider>;
};

export const Tooltip: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const { delayDuration } = useContext(TooltipDelayContext);
  const [isOpen, setIsOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const open = (target?: EventTarget | null) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(true);
    }, delayDuration);
    if (target instanceof HTMLElement) {
      setTriggerRect(target.getBoundingClientRect());
    }
  };

  const close = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      isOpen,
      open,
      close,
      triggerRect,
      setTriggerRect,
    }),
    [isOpen, triggerRect]
  );

  return <TooltipContext.Provider value={contextValue}>{children}</TooltipContext.Provider>;
};

type TooltipTriggerProps = {
  children: React.ReactElement;
  asChild?: boolean;
};

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ children, asChild = false }) => {
  const context = useContext(TooltipContext);
  if (!context) {
    return null;
  }

  const handleOpen = (event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
    context.open(event.currentTarget);
  };

  const handleClose = () => {
    context.close();
  };

  const child = React.Children.only(children);
  const mergedProps = {
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      handleOpen(event);
      child.props.onMouseEnter?.(event);
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
      handleClose();
      child.props.onMouseLeave?.(event);
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      handleOpen(event);
      child.props.onFocus?.(event);
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      handleClose();
      child.props.onBlur?.(event);
    },
  };

  const trigger = cloneElement(child, mergedProps);
  return asChild ? trigger : trigger;
};

type TooltipContentProps = {
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
};

export const TooltipContent: React.FC<TooltipContentProps> = ({ children, className = '', side = 'right' }) => {
  const context = useContext(TooltipContext);
  if (!context?.isOpen || !context.triggerRect) {
    return null;
  }

  const { top, left, width, height } = context.triggerRect;
  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 999,
    pointerEvents: 'none',
    background: 'rgba(15, 23, 42, 0.95)',
    color: '#f8fafc',
    borderRadius: 8,
    padding: '0.35rem 0.6rem',
    fontSize: '0.75rem',
    lineHeight: 1.4,
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.5)',
    maxWidth: 240,
  };

  const horizontalCenter = left + width / 2;
  const verticalCenter = top + height / 2;

  switch (side) {
    case 'left':
      style.left = left - 8;
      style.top = verticalCenter;
      style.transform = 'translateX(-100%) translateY(-50%)';
      break;
    case 'top':
      style.left = horizontalCenter;
      style.top = top - 6;
      style.transform = 'translate(-50%, -100%)';
      break;
    case 'bottom':
      style.left = horizontalCenter;
      style.top = top + height + 6;
      style.transform = 'translate(-50%, 0)';
      break;
    default:
      style.left = left + width + 8;
      style.top = verticalCenter;
      style.transform = 'translateY(-50%)';
      break;
  }

  return (
    <div role="status" className={`tooltip-content ${className}`} style={style}>
      {children}
    </div>
  );
};

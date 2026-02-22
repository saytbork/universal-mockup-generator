import React, { useEffect, useLayoutEffect, useState } from 'react';

interface OnboardingStep {
  title: string;
  description: string;
  ref: React.RefObject<HTMLElement>;
}

interface OnboardingOverlayProps {
  steps: OnboardingStep[];
  currentStep: number;
  visible: boolean;
  onNext: () => void;
  onSkip: () => void;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  steps,
  currentStep,
  visible,
  onNext,
  onSkip,
}) => {
  const [highlightRect, setHighlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const fallbackRect = () => ({
    top: window.scrollY + window.innerHeight / 2 - 80,
    left: window.scrollX + window.innerWidth / 2 - 160,
    width: 320,
    height: 160,
  });

  const updateRect = () => {
    const step = steps[currentStep - 1];
    const element = step?.ref.current;
    if (!element) {
      setHighlightRect(fallbackRect());
      return;
    }
    const rect = element.getBoundingClientRect();
    setHighlightRect({
      top: rect.top + window.scrollY - 12,
      left: rect.left + window.scrollX - 12,
      width: rect.width + 24,
      height: rect.height + 24,
    });
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useLayoutEffect(() => {
    if (!visible) return;
    updateRect();
    const handleResize = () => updateRect();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visible, currentStep, steps]);

  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(updateRect, 50);
    return () => clearTimeout(timeout);
  }, [visible, currentStep]);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onSkip();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, onSkip]);

  if (!visible) {
    return null;
  }

  const step = steps[currentStep - 1];
  const rect = highlightRect ?? fallbackRect();
  const cardWidth = 320;
  const cardHeight = 160;
  let cardTop = rect.top + rect.height + 16;
  let cardLeft = rect.left;

  if (cardTop + cardHeight > window.innerHeight + window.scrollY) {
    cardTop = rect.top - cardHeight - 16;
  }

  if (cardLeft + cardWidth > window.innerWidth + window.scrollX) {
    cardLeft = window.innerWidth + window.scrollX - cardWidth - 16;
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="absolute border border-indigo-600 rounded-3xl transition-all duration-300"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
      />
      <div
        className="absolute glass-card rounded-3xl border border-gray-200 p-5 text-left w-80 pointer-events-auto shadow-md shadow-md shadow-indigo-500/20 animate-fade-up"
        style={{
          top: cardTop,
          left: cardLeft,
        }}
      >
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-600">{`Step ${currentStep} / ${steps.length}`}</p>
        <button
          onClick={onSkip}
          aria-label="Close tutorial"
          className="absolute right-3 top-3 text-gray-600 hover:text-gray-900 transition"
        >
          ×
        </button>
        <h3 className="text-gray-900 text-lg font-semibold mt-2">{step.title}</h3>
        <p className="text-gray-600 text-sm mt-2">{step.description}</p>
        <div className="mt-4 flex items-center justify-between text-xs">
          <button onClick={onSkip} className="text-gray-600 hover:text-gray-900 transition">Skip</button>
          <button
            onClick={onNext}
            className="rounded-full bg-indigo-600 text-white px-4 py-1.5 text-white font-semibold hover:bg-indigo-600 text-white transition"
          >
            {currentStep === steps.length ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;

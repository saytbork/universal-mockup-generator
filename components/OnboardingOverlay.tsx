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

  const updateRect = () => {
    const step = steps[currentStep - 1];
    const element = step?.ref.current;
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect({
        top: rect.top + window.scrollY - 12,
        left: rect.left + window.scrollX - 12,
        width: rect.width + 24,
        height: rect.height + 24,
      });
    }
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

  if (!visible || !highlightRect) {
    return null;
  }

  const step = steps[currentStep - 1];
  const cardWidth = 320;
  const cardHeight = 160;
  let cardTop = highlightRect.top + highlightRect.height + 16;
  let cardLeft = highlightRect.left;

  if (cardTop + cardHeight > window.innerHeight + window.scrollY) {
    cardTop = highlightRect.top - cardHeight - 16;
  }

  if (cardLeft + cardWidth > window.innerWidth + window.scrollX) {
    cardLeft = window.innerWidth + window.scrollX - cardWidth - 16;
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" />
      <div
        className="absolute border border-indigo-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] rounded-3xl transition-all duration-300"
        style={{
          top: highlightRect.top,
          left: highlightRect.left,
          width: highlightRect.width,
          height: highlightRect.height,
        }}
      />
      <div
        className="absolute glass-card rounded-3xl border border-white/10 p-5 text-left w-80 pointer-events-auto shadow-xl animate-fade-up"
        style={{
          top: cardTop,
          left: cardLeft,
        }}
      >
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">{`Step ${currentStep} / ${steps.length}`}</p>
        <h3 className="text-white text-lg font-semibold mt-2">{step.title}</h3>
        <p className="text-gray-300 text-sm mt-2">{step.description}</p>
        <div className="mt-4 flex items-center justify-between text-xs">
          <button onClick={onSkip} className="text-gray-400 hover:text-white transition">Skip</button>
          <button
            onClick={onNext}
            className="rounded-full bg-indigo-500 px-4 py-1.5 text-white font-semibold hover:bg-indigo-600 transition"
          >
            {currentStep === steps.length ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;

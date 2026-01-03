import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PlanCheckoutModalProps {
  plan: {
    name: string;
    price: string;
    cadence: string;
    highlights: string[];
    checkoutUrl?: string;
  };
  email: string;
  onEmailChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  disabledReason?: string | null;
}

const PlanCheckoutModal: React.FC<PlanCheckoutModalProps> = ({ plan, email, onEmailChange, onClose, onConfirm, disabledReason }) => {
  const [company, setCompany] = useState('');

  const hasEmail = email.trim().length > 0;
  const isEmailValid = !hasEmail || /^\S+@\S+\.\S+$/.test(email);
  const isDisabled = Boolean(disabledReason);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surfaceTint px-4">
      <div className="w-full max-w-lg rounded-apple bg-surface border border-borderSubtle shadow-accent-glow p-8 space-y-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-textMuted hover:text-textPrimary">
          <X className="w-5 h-5" />
        </button>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Secure Checkout</p>
          <h2 className="text-2xl text-textPrimary font-semibold">{plan.name}</h2>
          <p className="text-4xl font-bold text-textPrimary">{plan.price}<span className="text-base text-textSecondary font-medium"> {plan.cadence}</span></p>
        </div>
        <div className="space-y-3 text-sm text-textSecondary">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-textMuted">Work email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="you@brand.com"
              className={`rounded-apple border ${isEmailValid ? 'border-borderSubtle' : 'border-borderSubtle'} bg-surface px-4 py-2 text-textPrimary placeholder:text-textMuted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent`}
            />
          </label>
          {!isEmailValid && (
            <p className="text-xs text-textMuted">
              Optional, but use a valid email if you want Stripe to pre-fill it.
            </p>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-textMuted">Company / brand</span>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Optional"
              className="rounded-apple border border-borderSubtle bg-surface px-4 py-2 text-textPrimary placeholder:text-textMuted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </label>
        </div>
        <div className="bg-surfaceElevated border border-borderSubtle rounded-apple p-4 text-sm text-textSecondary space-y-2">
          <p className="font-semibold text-textPrimary">What&apos;s included</p>
          <ul className="space-y-1 text-textSecondary list-disc list-inside">
            {plan.highlights.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="flex items-center gap-2 text-xs text-textMuted"><ShieldCheck className="w-4 h-4" /> Powered by Stripe · instant access after payment</p>
        </div>
        {disabledReason && (
          <p className="text-xs text-textMuted border border-borderSubtle rounded-xl px-3 py-2 bg-surfaceTint">
            {disabledReason}
          </p>
        )}
        <button
          disabled={isDisabled}
          onClick={onConfirm}
          className="w-full rounded-full bg-accent py-3 font-semibold text-white shadow-accent-glow hover:bg-accent disabled:bg-surfaceTint disabled:cursor-not-allowed"
        >
          Continue to checkout
        </button>
      </div>
    </div>
  );
};

export default PlanCheckoutModal;

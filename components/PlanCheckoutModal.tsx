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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-whiteTint px-4">
      <div className="w-full max-w-lg rounded-2xl bg-whiteGlass border border-gray-200 shadow-md shadow-md shadow-indigo-500/20 p-8 space-y-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900">
          <X className="w-5 h-5" />
        </button>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Secure Checkout</p>
          <h2 className="text-2xl text-gray-900 font-semibold">{plan.name}</h2>
          <p className="text-4xl font-bold text-gray-900">{plan.price}<span className="text-base text-gray-600 font-medium"> {plan.cadence}</span></p>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-gray-500">Work email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="you@brand.com"
              className={`rounded-2xl border ${isEmailValid ? 'border-gray-200' : 'border-gray-200'} bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 Muted focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            />
          </label>
          {!isEmailValid && (
            <p className="text-xs text-gray-500">
              Optional, but use a valid email if you want Stripe to pre-fill it.
            </p>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-gray-500">Company / brand</span>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Optional"
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 Muted focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>
        </div>
        <div className="bg-whiteTint border border-gray-200 rounded-2xl p-4 text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-900">What&apos;s included</p>
          <ul className="space-y-1 text-gray-600 list-disc list-inside">
            {plan.highlights.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="flex items-center gap-2 text-xs text-gray-500"><ShieldCheck className="w-4 h-4" /> Powered by Stripe · instant access after payment</p>
        </div>
        {disabledReason && (
          <p className="text-xs text-gray-500 border border-gray-200 rounded-xl px-3 py-2 bg-whiteTint">
            {disabledReason}
          </p>
        )}
        <button
          disabled={isDisabled}
          onClick={onConfirm}
          className="w-full rounded-full bg-indigo-600 py-3 font-semibold text-white shadow-md shadow-md shadow-indigo-500/20 hover:bg-indigo-600 disabled:bg-whiteTint disabled:cursor-not-allowed"
        >
          Continue to checkout
        </button>
      </div>
    </div>
  );
};

export default PlanCheckoutModal;

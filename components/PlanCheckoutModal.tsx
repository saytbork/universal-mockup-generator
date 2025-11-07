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

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
  const isDisabled = !isEmailValid || Boolean(disabledReason);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-gray-950 border border-gray-800 shadow-2xl p-8 space-y-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Secure Checkout</p>
          <h2 className="text-2xl text-white font-semibold">{plan.name}</h2>
          <p className="text-4xl font-bold text-white">{plan.price}<span className="text-base text-gray-400 font-medium"> {plan.cadence}</span></p>
        </div>
        <div className="space-y-3 text-sm text-gray-300">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-gray-500">Work email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="you@brand.com"
              className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-gray-500">Company / brand</span>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Optional"
              className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>
        </div>
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 text-sm text-gray-300 space-y-2">
          <p className="font-semibold text-white">What&apos;s included</p>
          <ul className="space-y-1 text-gray-400 list-disc list-inside">
            {plan.highlights.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="flex items-center gap-2 text-xs text-gray-500"><ShieldCheck className="w-4 h-4" /> Powered by Stripe · instant access after payment</p>
        </div>
        {disabledReason && (
          <p className="text-xs text-amber-300 border border-amber-500/30 rounded-xl px-3 py-2 bg-amber-500/10">
            {disabledReason}
          </p>
        )}
        <button
          disabled={isDisabled}
          onClick={onConfirm}
          className="w-full rounded-full bg-indigo-500 py-3 font-semibold text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-600 disabled:bg-indigo-900/40 disabled:cursor-not-allowed"
        >
          Continue to checkout
        </button>
      </div>
    </div>
  );
};

export default PlanCheckoutModal;

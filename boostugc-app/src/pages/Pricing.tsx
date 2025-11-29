import axios from 'axios';
import { useState } from 'react';

const plans = [
  { id: 'creator', priceId: import.meta.env.VITE_STRIPE_PRICE_CREATOR, label: 'Creator' },
  { id: 'studio', priceId: import.meta.env.VITE_STRIPE_PRICE_STUDIO, label: 'Studio' },
];

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (priceId?: string) => {
    if (!priceId) {
      setError('Price not configured');
      return;
    }
    setLoading(priceId);
    setError(null);
    try {
      const email = window.localStorage.getItem('emailForSignIn');
      const res = await axios.post('/api/stripe/create-checkout-session', { userId: email, priceId });
      window.location.href = res.data.url;
    } catch (err: any) {
      setError(err?.message || 'Unable to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="page">
      <h1>Pricing</h1>
      <div className="grid">
        {plans.map(plan => (
          <div key={plan.id} className="card">
            <h2>{plan.label}</h2>
            <button onClick={() => handleCheckout(plan.priceId)} disabled={loading === plan.priceId}>
              {loading === plan.priceId ? 'Redirecting...' : 'Choose plan'}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

type UserInfo = {
  credits: number;
  plan: string;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [info, setInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    // Placeholder: fetch user info from Firestore via custom endpoint in real app.
    setInfo({ credits: 20, plan: 'creator' });
  }, [user?.email]);

  const handleConsume = async () => {
    if (!user?.email) return;
    setLoading(true);
    setError(null);
    try {
      await axios.post('/api/credits/consume', { email: user.email });
      setInfo(prev => (prev ? { ...prev, credits: Math.max(prev.credits - 1, 0) } : prev));
    } catch (err: any) {
      setError(err?.message || 'Failed to consume credit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <div className="card">
        <p>Plan: {info?.plan || 'Free'}</p>
        <p>Credits: {info?.credits ?? 'Loading...'}</p>
        <button onClick={handleConsume} disabled={loading}>
          {loading ? 'Processing...' : 'Generate (consume 1 credit)'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

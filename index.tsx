import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import LandingPage from './LandingPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_Y2xvc2luZy1tYWxsYXJkLTU2LmNsZXJrLmFjY291bnRzLmRldiQ";
const INVITE_CODE = (import.meta.env.VITE_INVITE_CODE || '713371').trim();
const INVITE_LOCAL_KEY = 'boostugc_invite_code_ok';

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const PreAccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(INVITE_LOCAL_KEY);
    if (stored === 'true') {
      setHasAccess(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput.trim() === INVITE_CODE) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(INVITE_LOCAL_KEY, 'true');
      }
      setHasAccess(true);
      setError(null);
    } else {
      setError('Código incorrecto. Intenta de nuevo.');
    }
  };

  if (hasAccess) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300/80 mb-2">Pre-access</p>
        <h1 className="text-2xl font-semibold mb-3">We’re working on it</h1>
        <p className="text-gray-300 mb-6">Ingresa el código de invitación para continuar mientras terminamos detalles.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Access code</label>
            <input
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              placeholder="Ingresa tu código"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <PreAccessGate>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<App />} />
          </Routes>
        </BrowserRouter>
      </PreAccessGate>
    </ClerkProvider>
  </React.StrictMode>
);

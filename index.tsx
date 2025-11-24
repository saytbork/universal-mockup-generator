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

const MaintenanceGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      setError('Código incorrecto. Prueba de nuevo.');
    }
  };

  if (hasAccess) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-gray-900/70 border border-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-lg font-bold text-blue-200">
            B
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300/80">BoostUGC</p>
            <h1 className="text-2xl font-semibold">We&apos;re polishing the experience</h1>
          </div>
        </div>
        <p className="text-gray-300 mb-6">
          El sitio está en modo invitación mientras terminamos ajustes. Ingresa el código de acceso para continuar.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Código de invitación</label>
            <input
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              placeholder="Ingresa el código"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Entrar
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
      <MaintenanceGate>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<App />} />
          </Routes>
        </BrowserRouter>
      </MaintenanceGate>
    </ClerkProvider>
  </React.StrictMode>
);

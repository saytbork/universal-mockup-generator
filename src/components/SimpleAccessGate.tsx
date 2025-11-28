import React, { useState, useEffect } from 'react';
import { Lock, Loader2 } from 'lucide-react';

const ACCESS_STORAGE_KEY = 'ugc-access-granted';

export const SimpleAccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [codeInput, setCodeInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if user already has access
        const accessGranted = localStorage.getItem(ACCESS_STORAGE_KEY) === 'true';
        setHasAccess(accessGranted);
        setLoading(false);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validCode = import.meta.env.VITE_ACCESS_CODE || 'demo123';

        if (codeInput.trim() === validCode) {
            localStorage.setItem(ACCESS_STORAGE_KEY, 'true');
            setHasAccess(true);
        } else {
            setError('Código incorrecto. Intenta nuevamente.');
            setCodeInput('');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-gray-900/70 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl space-y-6">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="w-8 h-8 text-indigo-400" />
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-indigo-300 mb-2">Acceso Requerido</p>
                        <h1 className="text-3xl font-bold">Ingresa el código de acceso</h1>
                        <p className="mt-3 text-sm text-gray-400">
                            Necesitas un código de acceso para usar la aplicación.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2 text-left">
                            <label className="text-xs uppercase tracking-widest text-gray-500">
                                Código de acceso
                            </label>
                            <input
                                type="text"
                                value={codeInput}
                                onChange={(e) => setCodeInput(e.target.value)}
                                placeholder="Ingresa tu código"
                                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                autoFocus
                            />
                            {error && (
                                <p className="text-sm text-red-400">{error}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!codeInput.trim()}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-900/60 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out shadow-lg"
                        >
                            Acceder
                        </button>
                    </form>

                    <p className="text-xs text-gray-500">
                        ¿No tienes un código? Contacta al administrador.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};


import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthContextType {
    user: User | null;
    emailUser: string | null;
    pendingEmail: string | null;
    loading: boolean;
    isGuest: boolean;
    signInWithGoogle: () => Promise<void>;
    requestEmailCode: (email: string) => Promise<void>;
    verifyEmailCode: (code: string) => Promise<void>;
    logout: () => Promise<void>;
    loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [emailUser, setEmailUser] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return window.localStorage.getItem('emailUser');
    });
    const [pendingEmail, setPendingEmail] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return window.localStorage.getItem('emailPending');
    });
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (emailUser) {
            window.localStorage.setItem('emailUser', emailUser);
        } else {
            window.localStorage.removeItem('emailUser');
        }
    }, [emailUser]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (pendingEmail) {
            window.localStorage.setItem('emailPending', pendingEmail);
        } else {
            window.localStorage.removeItem('emailPending');
        }
    }, [pendingEmail]);

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const requestEmailCode = async (email: string) => {
        const normalizedEmail = email.trim();
        if (!normalizedEmail) {
            throw new Error('Ingresa un email válido.');
        }
        const res = await fetch('/api/request-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: normalizedEmail }),
        });
        if (!res.ok) {
            let errorMessage = 'No se pudo enviar el código. Intenta de nuevo.';
            try {
                const data = await res.json();
                if (data?.error) errorMessage = data.error;
            } catch {
                try {
                    const text = await res.text();
                    if (text) errorMessage = text;
                } catch {
                    // ignore
                }
            }
            throw new Error(errorMessage);
        }
        setPendingEmail(normalizedEmail);
    };

    const verifyEmailCode = async (code: string) => {
        const normalizedCode = code.trim();
        if (!normalizedCode) {
            throw new Error('Ingresa el código de 6 dígitos.');
        }
        if (!pendingEmail) {
            throw new Error('Primero ingresa tu email y solicita el código.');
        }
        const res = await fetch('/api/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: pendingEmail, code: normalizedCode }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Código incorrecto o vencido. Pide uno nuevo.');
        }
        setEmailUser(pendingEmail);
        setPendingEmail(null);
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.warn('Logout warning:', error);
        }
        setIsGuest(false);
        setEmailUser(null);
        setPendingEmail(null);
    };

    const loginAsGuest = () => {
        setIsGuest(true);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                emailUser,
                pendingEmail,
                loading,
                isGuest,
                signInWithGoogle,
                requestEmailCode,
                verifyEmailCode,
                logout,
                loginAsGuest,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

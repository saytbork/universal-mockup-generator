import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthUser = { email: string };

interface AuthContextType {
  user: AuthUser | null;
  emailUser: string | null;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  sendMagicLink: (email: string, invitationCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [emailUser, setEmailUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/user?action=me');
        if (res.ok) {
          const data = await res.json();
          const email = data.email as string;
          setUser({ email });
          setEmailUser(email);
        } else {
          setUser(null);
          setEmailUser(null);
        }
      } catch {
        setUser(null);
        setEmailUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const signInWithGoogle = async () => {
    throw new Error('Google sign-in is not available in this auth mode.');
  };

  const sendMagicLink = async (email: string, invitationCode?: string) => {
    const normalized = email.trim();
    if (!normalized) throw new Error('Email required');
    const res = await fetch('/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized, invitationCode }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Unable to send magic link');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth?action=logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout warning', err);
    }
    setUser(null);
    setEmailUser(null);
    setIsGuest(false);
    window.location.href = '/login';
  };

  const loginAsGuest = () => {
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        emailUser,
        loading,
        isGuest,
        signInWithGoogle,
        sendMagicLink,
        logout,
        loginAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

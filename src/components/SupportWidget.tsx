import React, { useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SupportAssistant from './SupportAssistant';

declare global {
  interface Window {
    Tawk_API?: Record<string, any>;
    Tawk_LoadStart?: Date;
  }
}

const tawkPropertyId = String(import.meta.env.VITE_TAWK_PROPERTY_ID || '').trim();
const tawkWidgetId = String(import.meta.env.VITE_TAWK_WIDGET_ID || '').trim() || 'default';
const aiEnabled = String(import.meta.env.VITE_SUPPORT_AI_ENABLED || '').toLowerCase() === 'true';

const getPreferredProvider = () => {
  if (tawkPropertyId) return 'tawk' as const;
  if (aiEnabled) return 'ai' as const;
  return 'none' as const;
};

export default function SupportWidget() {
  const { user, emailUser, isGuest } = useAuth();

  const provider = useMemo(getPreferredProvider, []);
  const email = user?.email || emailUser || undefined;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (provider !== 'tawk') return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const existing = document.getElementById('tawk-chat-script');
    if (existing) return;

    const script = document.createElement('script');
    script.id = 'tawk-chat-script';
    script.async = true;
    script.src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;
    document.head.appendChild(script);
  }, [provider]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (provider !== 'tawk') return;
    if (!email || isGuest) return;

    const api = window.Tawk_API as any;
    if (!api) return;

    const setAttrs = () => {
      try {
        api.setAttributes?.({ email }, () => {});
      } catch {
        // ignore
      }
    };

    if (typeof api.onLoad === 'function') {
      const prevOnLoad = api.onLoad;
      api.onLoad = () => {
        try {
          prevOnLoad();
        } finally {
          setAttrs();
        }
      };
      return;
    }

    setAttrs();
  }, [provider, email, isGuest]);

  if (provider === 'ai') return <SupportAssistant />;
  return null;
}

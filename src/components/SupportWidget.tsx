import React, { useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SupportAssistant from './SupportAssistant';

declare global {
  interface Window {
    $crisp?: any[];
    CRISP_WEBSITE_ID?: string;
    Intercom?: (...args: any[]) => void;
    intercomSettings?: Record<string, any>;
  }
}

const crispWebsiteId = String(import.meta.env.VITE_CRISP_WEBSITE_ID || '').trim();
const intercomAppId = String(import.meta.env.VITE_INTERCOM_APP_ID || '').trim();
const aiEnabled = String(import.meta.env.VITE_SUPPORT_AI_ENABLED || '').toLowerCase() === 'true';

const getPreferredProvider = () => {
  if (crispWebsiteId) return 'crisp' as const;
  if (intercomAppId) return 'intercom' as const;
  if (aiEnabled) return 'ai' as const;
  return 'none' as const;
};

export default function SupportWidget() {
  const { user, emailUser, isGuest } = useAuth();

  const provider = useMemo(getPreferredProvider, []);
  const email = user?.email || emailUser || undefined;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (provider !== 'crisp') return;

    if (!window.$crisp) window.$crisp = [];
    window.CRISP_WEBSITE_ID = crispWebsiteId;

    if (email && !isGuest) {
      window.$crisp.push(['set', 'user:email', [email]]);
    }

    const existing = document.getElementById('crisp-chat-script');
    if (existing) return;

    const script = document.createElement('script');
    script.id = 'crisp-chat-script';
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);
  }, [provider, email, isGuest]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (provider !== 'intercom') return;

    const settings: Record<string, any> = { app_id: intercomAppId };
    if (email && !isGuest) settings.email = email;
    window.intercomSettings = settings;

    const w = window as any;
    const ic = w.Intercom;
    if (typeof ic === 'function') {
      ic('update', settings);
      return;
    }

    const existing = document.getElementById('intercom-widget-script');
    if (existing) return;

    const script = document.createElement('script');
    script.id = 'intercom-widget-script';
    script.async = true;
    script.src = `https://widget.intercom.io/widget/${intercomAppId}`;
    document.head.appendChild(script);
  }, [provider, email, isGuest]);

  if (provider === 'ai') return <SupportAssistant />;
  return null;
}


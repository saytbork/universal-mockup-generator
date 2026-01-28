import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import SupportAssistant from './SupportAssistant';

export default function SupportWidget() {
  const { user, emailUser } = useAuth();
  const email = user?.email || emailUser || undefined;
  const location = useLocation();
  const path = location.pathname || '/';
  const shouldShow = path.startsWith('/app') || path.startsWith('/dashboard') || path.startsWith('/login');
  if (!shouldShow) return null;
  return <SupportAssistant email={email} />;
}

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SupportAssistant from './SupportAssistant';

export default function SupportWidget() {
  const { user, emailUser } = useAuth();
  const email = user?.email || emailUser || undefined;
  return <SupportAssistant email={email} />;
}

export function isAuthBypassEnabled(): boolean {
  const raw = (import.meta as any)?.env?.VITE_AUTH_BYPASS;
  if (raw == null) return false;
  const normalized = String(raw).trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}


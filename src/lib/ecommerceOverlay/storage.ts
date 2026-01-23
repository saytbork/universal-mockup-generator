import type { EcommerceSlotsConfig } from './types';
import { buildDefaultEcommerceSlotsConfig } from './templates';

const STORAGE_KEY = 'boostugc:ecommerceOverlays:v1';

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function loadEcommerceSlotsConfig(): EcommerceSlotsConfig {
  const defaults = buildDefaultEcommerceSlotsConfig();
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed)) return defaults;
    return { ...defaults, ...(parsed as any) };
  } catch {
    return defaults;
  }
}

export function saveEcommerceSlotsConfig(config: EcommerceSlotsConfig) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}


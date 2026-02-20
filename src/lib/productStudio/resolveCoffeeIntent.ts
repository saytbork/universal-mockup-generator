import { industryRules } from './industryRules';

const normalizeMode = (value: string): string =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const EXTRA_MODE_ALIASES: Record<string, string> = {
  'hero-landing-page': 'hero-landing',
  'golden-sunset-backlit': 'golden-hour-lifestyle',
  'soft-wellness-morning': 'soft-wellness-morning',
  'warm-window-wood': 'editorial-table',
};

export function resolveCoffeeIntent(photoMode: string): 'conversion' | 'editorial-ritual' {
  const rules = industryRules.coffee;
  const normalized = normalizeMode(photoMode);
  const resolved = EXTRA_MODE_ALIASES[normalized] || normalized;

  if ((rules.conversionPhotoModes || []).includes(resolved)) {
    return 'conversion';
  }

  if ((rules.editorialPhotoModes || []).includes(resolved)) {
    return 'editorial-ritual';
  }

  return 'editorial-ritual';
}

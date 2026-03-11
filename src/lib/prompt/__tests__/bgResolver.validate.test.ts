/**
 * Validation test: resolveStudioBackgroundColor for Hero Landing Page + Color Pop Hero.
 * Drives mapSceneToPrompt with controlled fixtures and dumps all debug logs.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapSceneToPrompt } from '../../productStudio/mapSceneToPrompt';
import { DEFAULT_PRODUCT_STUDIO_STATE } from '../../productStudio/store';

// Capture console.log lines
const logs: string[] = [];
beforeEach(() => {
  logs.length = 0;
  vi.spyOn(console, 'log').mockImplementation((...args) => {
    logs.push(args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
  });
  vi.spyOn(console, 'warn').mockImplementation((...args) => {
    logs.push('[WARN] ' + args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
  });
});

const BASE = {
  ...DEFAULT_PRODUCT_STUDIO_STATE,
  mode: 'studio',
  sceneType: 'studio-branding',
  environmentContext: null,
  blankSpaceEnabled: false,
  props: '',
} as any;

// Product with known label palette
const PRODUCT_WITH_PALETTE = {
  id: 'p1',
  url: 'https://example.com/product.png',
  palette: {
    dominant: '#C0392B',
    secondary: '#2980B9',
    accent: '#F1C40F',
  },
};

// ── HERO LANDING PAGE ─────────────────────────────────────────────────────────

describe('Hero Landing Page — brand palette (Gradient)', () => {
  it('uses label dominant+secondary as gradient stops', () => {
    const result = mapSceneToPrompt({
      ...BASE,
      photoMode: 'Hero Landing Page',
      products: [PRODUCT_WITH_PALETTE],
      activeProductId: 'p1',
      photoModeConfig: {
        ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig,
        heroLandingPage: {
          ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig.heroLandingPage,
          backgroundType: 'Gradient',
          paletteSource: 'Product label colors',
        },
      },
    } as any);

    const bgLogs = logs.filter(l => l.includes('[DEBUG][STUDIO_BG_RESOLVER]') || l.includes('[DEBUG][mapSceneToPrompt]') || l.includes('[DEBUG][buildWorld]'));
    console.error('\n=== HERO LP GRADIENT LOGS ===');
    bgLogs.forEach(l => console.error(l));
    console.error('=== HERO LP GRADIENT PROMPT SNIPPET ===');
    console.error(result.prompt.slice(0, 600));

    expect(result.prompt).toContain('#C0392B');
  });
});

describe('Hero Landing Page — brand palette (Solid)', () => {
  it('uses label dominant as solid background', () => {
    const result = mapSceneToPrompt({
      ...BASE,
      photoMode: 'Hero Landing Page',
      products: [PRODUCT_WITH_PALETTE],
      activeProductId: 'p1',
      photoModeConfig: {
        ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig,
        heroLandingPage: {
          ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig.heroLandingPage,
          backgroundType: 'Solid',
          paletteSource: 'Product label colors',
        },
      },
    } as any);

    const bgLogs = logs.filter(l => l.includes('[DEBUG][STUDIO_BG_RESOLVER]') || l.includes('[DEBUG][mapSceneToPrompt]'));
    console.error('\n=== HERO LP SOLID LOGS ===');
    bgLogs.forEach(l => console.error(l));
    console.error('=== HERO LP SOLID PROMPT SNIPPET ===');
    console.error(result.prompt.slice(0, 600));

    expect(result.prompt).toContain('#C0392B');
  });
});

describe('Hero Landing Page — Custom override', () => {
  it('uses custom colors only, ignores brand extraction', () => {
    const result = mapSceneToPrompt({
      ...BASE,
      photoMode: 'Hero Landing Page',
      products: [PRODUCT_WITH_PALETTE],
      activeProductId: 'p1',
      backgroundColor: '#112233',
      gradientStart: '#112233',
      gradientEnd: '#445566',
      photoModeConfig: {
        ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig,
        heroLandingPage: {
          ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig.heroLandingPage,
          backgroundType: 'Gradient',
          paletteSource: 'Custom',
        },
      },
    } as any);

    const bgLogs = logs.filter(l => l.includes('[DEBUG][STUDIO_BG_RESOLVER]'));
    console.error('\n=== HERO LP CUSTOM LOGS ===');
    bgLogs.forEach(l => console.error(l));
    console.error('=== HERO LP CUSTOM PROMPT SNIPPET ===');
    console.error(result.prompt.slice(0, 600));

    expect(result.prompt).toContain('#112233');
    expect(result.prompt).not.toContain('#C0392B');
  });
});

describe('Hero Landing Page — no product colors, falls back to brand system', () => {
  it('uses palette.primaryColor when no label palette', () => {
    const result = mapSceneToPrompt({
      ...BASE,
      photoMode: 'Hero Landing Page',
      products: [{ id: 'p2', url: 'https://example.com/p.png', palette: null }],
      activeProductId: 'p2',
      palette: {
        ...DEFAULT_PRODUCT_STUDIO_STATE.palette,
        primaryColor: '#7B1FA2',
        secondaryColor: '#4CAF50',
      },
      photoModeConfig: {
        ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig,
        heroLandingPage: {
          ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig.heroLandingPage,
          backgroundType: 'Gradient',
          paletteSource: 'Brand Colors',
        },
      },
    } as any);

    const bgLogs = logs.filter(l => l.includes('[DEBUG][STUDIO_BG_RESOLVER]'));
    console.error('\n=== HERO LP FALLBACK BRAND LOGS ===');
    bgLogs.forEach(l => console.error(l));
    console.error(result.prompt.slice(0, 600));

    expect(result.prompt).toContain('#7B1FA2');
  });
});

// ── COLOR POP HERO ────────────────────────────────────────────────────────────

describe('Color Pop Hero — uses primary brand color as solid', () => {
  it('uses label dominant, no gradient, no palette guessing', () => {
    const result = mapSceneToPrompt({
      ...BASE,
      photoMode: 'Color Pop Hero',
      products: [PRODUCT_WITH_PALETTE],
      activeProductId: 'p1',
      photoModeConfig: {
        ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig,
        heroLandingPage: {
          ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig.heroLandingPage,
          paletteSource: 'Product label colors',
        },
      },
    } as any);

    const bgLogs = logs.filter(l => l.includes('[DEBUG][STUDIO_BG_RESOLVER]') || l.includes('[DEBUG][mapSceneToPrompt]'));
    console.error('\n=== COLOR POP HERO LOGS ===');
    bgLogs.forEach(l => console.error(l));
    console.error('=== COLOR POP HERO PROMPT SNIPPET ===');
    console.error(result.prompt.slice(0, 600));

    expect(result.prompt).toContain('#C0392B');
    expect(result.prompt).not.toMatch(/vibrant environment/i);
    expect(result.prompt).not.toMatch(/No flat solid backgrounds/i);
  });
});

describe('Color Pop Hero — Custom override', () => {
  it('uses custom backgroundColor, ignores brand extraction', () => {
    const result = mapSceneToPrompt({
      ...BASE,
      photoMode: 'Color Pop Hero',
      products: [PRODUCT_WITH_PALETTE],
      activeProductId: 'p1',
      backgroundColor: '#00BCD4',
      photoModeConfig: {
        ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig,
        heroLandingPage: {
          ...DEFAULT_PRODUCT_STUDIO_STATE.photoModeConfig.heroLandingPage,
          paletteSource: 'Custom',
        },
      },
    } as any);

    const bgLogs = logs.filter(l => l.includes('[DEBUG][STUDIO_BG_RESOLVER]'));
    console.error('\n=== COLOR POP CUSTOM LOGS ===');
    bgLogs.forEach(l => console.error(l));
    console.error(result.prompt.slice(0, 600));

    expect(result.prompt).toContain('#00BCD4');
    expect(result.prompt).not.toContain('#C0392B');
  });
});

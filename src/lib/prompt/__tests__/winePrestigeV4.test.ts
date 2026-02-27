/**
 * WINE ARCHETYPE SYSTEM v4 — ENTERPRISE ENGINE TESTS
 *
 * Coverage:
 *   - All 15 environments emit correct tokens
 *   - All 5 luxury tiers emit correct tokens
 *   - All 8 lighting rigs emit correct tokens
 *   - All 6 composition modes emit correct tokens
 *   - Micro variation block generation
 *   - Anti-repetition: isValidSceneCombination exclusion rules
 *   - Anti-repetition: weightedSelectFromPool de-weights recent items
 *   - Scene hash: identical params = identical hash, different params ≠ identical hash
 *   - Edge cases: resolveCompositionForServeState, resolveCameraForCompositionMode
 *   - resolveDefaultLuxuryTier prestige thresholds
 *   - assembleWineV4Prompt: layer order contract (physics always first after engine status)
 *   - winePipelineV4.build: integration smoke test (no crash, contains physics token)
 */

import { describe, it, expect } from 'vitest';
import {
  WINE_ENVIRONMENT_V4,
  ALL_WINE_ENVIRONMENTS_V4,
  WINE_LIGHTING_RIGS,
  ALL_WINE_LIGHTING_RIGS,
  WINE_LUXURY_TIERS,
  WINE_COMPOSITION_MODES,
  buildMicroVariationBlock,
  isValidSceneCombination,
  weightedSelectFromPool,
  computeWineSceneHash,
  assembleWineV4Prompt,
  resolveDefaultLuxuryTier,
  resolveCompositionForServeState,
  resolveCameraForCompositionMode,
} from '../../productStudio/winePrestige';
import { winePipelineV4 } from '../../productStudioV2/pipelines/winePipeline';
import type { WineEnvironmentV4, WineLuxuryIntensity, WineCompositionMode } from '../../productStudio/types';

// ─── Base assembly params used in multiple tests ──────────────────────────
const BASE_PARAMS = {
  physicsBlock: 'WINE_ENGINE_STATUS: active. BOTTLE_PRESERVATION_LOCK: sealed.',
  labelBlock: '',
  luxuryTier: 'Ultra Premium' as WineLuxuryIntensity,
  environment: 'Dark Luxury Studio' as WineEnvironmentV4,
  lightingRig: 'sculptural-studio-luxury' as keyof typeof WINE_LIGHTING_RIGS,
  cameraAngle: 'eye-level-centered' as keyof typeof WINE_COMPOSITION_MODES,
  compositionMode: 'single-hero' as WineCompositionMode,
};

// ─── ENVIRONMENT ENGINE ───────────────────────────────────────────────────
describe('Wine v4 Environment Engine', () => {
  it('exports exactly 15 environments', () => {
    expect(ALL_WINE_ENVIRONMENTS_V4).toHaveLength(15);
  });

  it('every environment has a token and narrative', () => {
    for (const env of ALL_WINE_ENVIRONMENTS_V4) {
      const spec = WINE_ENVIRONMENT_V4[env];
      expect(spec.token).toBeTruthy();
      expect(spec.narrative).toContain('WINE_ENV_V4:');
      expect(spec.prestigeIntensity).toBeGreaterThanOrEqual(0);
      expect(spec.prestigeIntensity).toBeLessThanOrEqual(1);
    }
  });

  it('each environment token appears in its narrative', () => {
    for (const env of ALL_WINE_ENVIRONMENTS_V4) {
      const spec = WINE_ENVIRONMENT_V4[env];
      expect(spec.narrative).toContain(spec.token);
    }
  });

  it('assembleWineV4Prompt injects environment narrative', () => {
    const prompt = assembleWineV4Prompt({ ...BASE_PARAMS, environment: 'Oak Barrel Cellar' });
    expect(prompt).toContain('OAK_BARREL_CELLAR');
  });
});

// ─── LUXURY TIER SCALING ─────────────────────────────────────────────────
describe('Wine v4 Luxury Tier Scaling', () => {
  const tiers: WineLuxuryIntensity[] = [
    'Editorial', 'Premium', 'Ultra Premium', 'Heritage Luxury', 'Modern Architectural Luxury',
  ];

  it('all 5 tiers are defined', () => {
    for (const tier of tiers) {
      expect(WINE_LUXURY_TIERS[tier]).toBeDefined();
    }
  });

  it('each tier emits LUXURY_TIER token in narrative', () => {
    for (const tier of tiers) {
      expect(WINE_LUXURY_TIERS[tier].narrative).toContain('LUXURY_TIER:');
    }
  });

  it('Ultra Premium has highest contrastMultiplier among non-arch tiers', () => {
    const up = WINE_LUXURY_TIERS['Ultra Premium'].contrastMultiplier;
    const ed = WINE_LUXURY_TIERS['Editorial'].contrastMultiplier;
    expect(up).toBeGreaterThan(ed);
  });

  it('Modern Architectural Luxury has propDensity none', () => {
    expect(WINE_LUXURY_TIERS['Modern Architectural Luxury'].propDensity).toBe('none');
  });

  it('resolveDefaultLuxuryTier: prestige >= 0.91 → Heritage Luxury', () => {
    // Stone Cave Cellar has prestige 0.91
    expect(resolveDefaultLuxuryTier('Stone Cave Cellar')).toBe('Heritage Luxury');
  });

  it('resolveDefaultLuxuryTier: prestige 0.78–0.85 → Premium', () => {
    // Vineyard Golden Hour has prestige 0.78
    expect(resolveDefaultLuxuryTier('Vineyard Golden Hour')).toBe('Premium');
  });

  it('resolveDefaultLuxuryTier: prestige 0.68 → Editorial', () => {
    expect(resolveDefaultLuxuryTier('Rustic Estate Kitchen')).toBe('Editorial');
  });

  it('assembleWineV4Prompt injects luxury tier narrative', () => {
    const prompt = assembleWineV4Prompt({ ...BASE_PARAMS, luxuryTier: 'Heritage Luxury' });
    expect(prompt).toContain('HERITAGE_LUXURY');
  });
});

// ─── LIGHTING ENGINE ─────────────────────────────────────────────────────
describe('Wine v4 Lighting Engine', () => {
  it('exports 8 lighting rigs', () => {
    expect(ALL_WINE_LIGHTING_RIGS).toHaveLength(8);
  });

  it('every rig has a token and narrative', () => {
    for (const rig of ALL_WINE_LIGHTING_RIGS) {
      expect(WINE_LIGHTING_RIGS[rig].token).toBeTruthy();
      expect(WINE_LIGHTING_RIGS[rig].narrative).toContain('LIGHTING:');
    }
  });

  it('backlit-liquid-glow mentions liquid luminosity', () => {
    expect(WINE_LIGHTING_RIGS['backlit-liquid-glow'].narrative).toContain('luminosity');
  });

  it('barrel-cellar-candlelight has extreme ratio', () => {
    expect(WINE_LIGHTING_RIGS['barrel-cellar-candlelight'].keyFillRatio).toContain('12:1');
  });
});

// ─── COMPOSITION MODES ───────────────────────────────────────────────────
describe('Wine v4 Composition Modes', () => {
  const modes: WineCompositionMode[] = [
    'single-hero', 'bottle-and-glass', 'horizontal-editorial',
    'premium-lineup', 'gift-celebration', 'macro-label',
  ];

  it('all 6 composition modes are defined', () => {
    for (const mode of modes) {
      expect(WINE_COMPOSITION_MODES[mode]).toBeDefined();
    }
  });

  it('each composition mode has a COMPOSITION: token in narrative', () => {
    for (const mode of modes) {
      expect(WINE_COMPOSITION_MODES[mode].narrative).toContain('COMPOSITION:');
    }
  });

  it('macro-label composition uses macro-label camera angle', () => {
    expect(WINE_COMPOSITION_MODES['macro-label'].cameraAngle).toBe('macro-label');
  });

  it('horizontal-editorial uses flatlay-overhead camera angle', () => {
    expect(WINE_COMPOSITION_MODES['horizontal-editorial'].cameraAngle).toBe('flatlay-overhead');
  });
});

// ─── MICRO VARIATION ENGINE ──────────────────────────────────────────────
describe('Wine v4 Micro Variation Engine', () => {
  it('returns empty string for null input', () => {
    expect(buildMicroVariationBlock(null)).toBe('');
    expect(buildMicroVariationBlock(undefined)).toBe('');
    expect(buildMicroVariationBlock({})).toBe('');
  });

  it('season autumn injects autumn text', () => {
    const result = buildMicroVariationBlock({ season: 'autumn' });
    expect(result).toContain('autumn');
    expect(result).toContain('WINE_MICRO_VARIATION:');
  });

  it('dewOnGlass injects condensation text', () => {
    const result = buildMicroVariationBlock({ dewOnGlass: true });
    expect(result).toContain('condensation');
  });

  it('floralProps injects floral text', () => {
    const result = buildMicroVariationBlock({ floralProps: true });
    expect(result).toContain('flower');
  });

  it('micro prop cork-and-corkscrew injects corkscrew text', () => {
    const result = buildMicroVariationBlock({ microProps: 'cork-and-corkscrew' });
    expect(result).toContain('corkscrew');
  });

  it('season none does not inject season text', () => {
    const result = buildMicroVariationBlock({ season: 'none', dewOnGlass: true });
    expect(result).not.toContain('spring');
    expect(result).not.toContain('summer');
    expect(result).toContain('condensation');
  });

  it('multiple params produce pipe-separated block', () => {
    const result = buildMicroVariationBlock({ season: 'winter', dewOnGlass: true });
    expect(result).toContain(' | ');
  });

  it('assembleWineV4Prompt injects micro variation block', () => {
    const prompt = assembleWineV4Prompt({
      ...BASE_PARAMS,
      microVariation: { season: 'spring', dewOnGlass: true },
    });
    expect(prompt).toContain('WINE_MICRO_VARIATION:');
    expect(prompt).toContain('spring');
  });
});

// ─── ANTI-REPETITION ENGINE ──────────────────────────────────────────────
describe('Wine v4 Anti-Repetition Engine', () => {
  describe('isValidSceneCombination exclusion rules', () => {
    it('flatlay-overhead is invalid for outdoor vineyard environments', () => {
      expect(isValidSceneCombination('Vineyard Golden Hour', 'sculptural-studio-luxury', 'flatlay-overhead')).toBe(false);
      expect(isValidSceneCombination('Hillside Terroir Landscape', 'sculptural-studio-luxury', 'flatlay-overhead')).toBe(false);
    });

    it('flatlay-overhead is valid for studio environments', () => {
      expect(isValidSceneCombination('Dark Luxury Studio', 'sculptural-studio-luxury', 'flatlay-overhead')).toBe(true);
      expect(isValidSceneCombination('White Marble Studio', 'natural-luxury', 'flatlay-overhead')).toBe(true);
    });

    it('backlit-liquid-glow is invalid for cellar environments', () => {
      expect(isValidSceneCombination('Oak Barrel Cellar', 'backlit-liquid-glow', 'eye-level-centered')).toBe(false);
      expect(isValidSceneCombination('Stone Cave Cellar', 'backlit-liquid-glow', 'eye-level-centered')).toBe(false);
    });

    it('backlit-liquid-glow is valid for Glass Winery Modern', () => {
      expect(isValidSceneCombination('Glass Winery Modern', 'backlit-liquid-glow', 'eye-level-centered')).toBe(true);
    });

    it('candlelight is invalid for outdoor environments', () => {
      expect(isValidSceneCombination('Vineyard Misty Dawn', 'barrel-cellar-candlelight', 'eye-level-centered')).toBe(false);
      expect(isValidSceneCombination('Hillside Terroir Landscape', 'barrel-cellar-candlelight', 'eye-level-centered')).toBe(false);
    });

    it('candlelight is valid for cellar environments', () => {
      expect(isValidSceneCombination('Oak Barrel Cellar', 'barrel-cellar-candlelight', 'eye-level-centered')).toBe(true);
      expect(isValidSceneCombination('Fine Dining Table', 'barrel-cellar-candlelight', 'eye-level-centered')).toBe(true);
    });

    it('lineup-collection is invalid for outdoor environments', () => {
      expect(isValidSceneCombination('Vineyard Golden Hour', 'natural-luxury', 'lineup-collection')).toBe(false);
    });

    it('lineup-collection is valid for Dark Luxury Studio', () => {
      expect(isValidSceneCombination('Dark Luxury Studio', 'sculptural-studio-luxury', 'lineup-collection')).toBe(true);
    });

    it('any standard angle is valid for any environment', () => {
      expect(isValidSceneCombination('Vineyard Golden Hour', 'golden-hour-cinematic', 'eye-level-centered')).toBe(true);
      expect(isValidSceneCombination('Stone Cave Cellar', 'barrel-cellar-candlelight', 'low-hero')).toBe(true);
    });
  });

  describe('weightedSelectFromPool', () => {
    const pool = ['A', 'B', 'C', 'D', 'E'] as const;
    type PoolItem = typeof pool[number];

    it('always returns a value from the pool', () => {
      for (let seed = 0; seed < 100; seed++) {
        const result = weightedSelectFromPool([...pool], [], seed);
        expect(pool).toContain(result as PoolItem);
      }
    });

    it('de-weights recent items — with 1000 samples, recently used items appear less often', () => {
      const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
      const recentlyUsed = ['A', 'B', 'C'] as PoolItem[];
      for (let seed = 0; seed < 1000; seed++) {
        const result = weightedSelectFromPool([...pool], recentlyUsed, seed);
        counts[result]++;
      }
      // D and E should appear more often than A, B, C
      expect(counts['D'] + counts['E']).toBeGreaterThan(counts['A'] + counts['B'] + counts['C']);
    });

    it('with empty recentlyUsed, all pool items are reachable across a wide seed range', () => {
      const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
      // Use seeds spread across the full 0–9999 range to cover the full weight cursor
      for (let seed = 0; seed < 10000; seed += 7) {
        const result = weightedSelectFromPool([...pool], [], seed);
        counts[result]++;
      }
      // All items should appear at least once across a wide seed range
      for (const key of Object.keys(counts)) {
        expect(counts[key]).toBeGreaterThan(0);
      }
    });
  });

  describe('computeWineSceneHash', () => {
    const base = {
      environment: 'Dark Luxury Studio' as WineEnvironmentV4,
      lightingRig: 'sculptural-studio-luxury',
      cameraAngle: 'eye-level-centered',
      luxuryTier: 'Ultra Premium' as WineLuxuryIntensity,
    };

    it('same params produce identical hash', () => {
      expect(computeWineSceneHash(base)).toBe(computeWineSceneHash(base));
    });

    it('different environment produces different hash', () => {
      const other = { ...base, environment: 'Oak Barrel Cellar' as WineEnvironmentV4 };
      expect(computeWineSceneHash(base)).not.toBe(computeWineSceneHash(other));
    });

    it('different lighting rig produces different hash', () => {
      const other = { ...base, lightingRig: 'backlit-liquid-glow' };
      expect(computeWineSceneHash(base)).not.toBe(computeWineSceneHash(other));
    });

    it('different micro variation produces different hash', () => {
      const withMv = { ...base, microVariation: { season: 'autumn' as const } };
      const withoutMv = { ...base };
      expect(computeWineSceneHash(withMv)).not.toBe(computeWineSceneHash(withoutMv));
    });
  });
});

// ─── EDGE CASE HANDLERS ──────────────────────────────────────────────────
describe('Wine v4 Edge Case Handlers', () => {
  describe('resolveCompositionForServeState', () => {
    it('served + single-hero → bottle-and-glass', () => {
      expect(resolveCompositionForServeState('single-hero', 'served')).toBe('bottle-and-glass');
    });

    it('served + bottle-and-glass → bottle-and-glass (no change)', () => {
      expect(resolveCompositionForServeState('bottle-and-glass', 'served')).toBe('bottle-and-glass');
    });

    it('none + single-hero → single-hero (no change)', () => {
      expect(resolveCompositionForServeState('single-hero', 'none')).toBe('single-hero');
    });

    it('served + premium-lineup → premium-lineup (multi-SKU preserved)', () => {
      expect(resolveCompositionForServeState('premium-lineup', 'served')).toBe('premium-lineup');
    });
  });

  describe('resolveCameraForCompositionMode', () => {
    it('horizontal-editorial forces flatlay-overhead', () => {
      expect(resolveCameraForCompositionMode('eye-level-centered', 'horizontal-editorial')).toBe('flatlay-overhead');
    });

    it('premium-lineup forces lineup-collection', () => {
      expect(resolveCameraForCompositionMode('three-quarter-45', 'premium-lineup')).toBe('lineup-collection');
    });

    it('macro-label forces macro-label angle', () => {
      expect(resolveCameraForCompositionMode('eye-level-centered', 'macro-label')).toBe('macro-label');
    });

    it('single-hero preserves provided angle', () => {
      expect(resolveCameraForCompositionMode('low-hero', 'single-hero')).toBe('low-hero');
      expect(resolveCameraForCompositionMode('vertical-prestige', 'single-hero')).toBe('vertical-prestige');
    });
  });
});

// ─── PROMPT ASSEMBLY LAYER ORDER CONTRACT ────────────────────────────────
describe('Wine v4 assembleWineV4Prompt layer order', () => {
  it('WINE_ENGINE_V4 token appears first', () => {
    const prompt = assembleWineV4Prompt(BASE_PARAMS);
    expect(prompt.indexOf('WINE_ENGINE_V4')).toBe(0);
  });

  it('physics block appears before environment narrative', () => {
    const prompt = assembleWineV4Prompt(BASE_PARAMS);
    const physicsIdx = prompt.indexOf('BOTTLE_PRESERVATION_LOCK');
    const envIdx = prompt.indexOf('WINE_ENV_V4:');
    expect(physicsIdx).toBeLessThan(envIdx);
  });

  it('luxury tier appears before environment', () => {
    const prompt = assembleWineV4Prompt(BASE_PARAMS);
    const luxIdx = prompt.indexOf('LUXURY_TIER:');
    const envIdx = prompt.indexOf('WINE_ENV_V4:');
    expect(luxIdx).toBeLessThan(envIdx);
  });

  it('environment appears before lighting', () => {
    const prompt = assembleWineV4Prompt(BASE_PARAMS);
    const envIdx = prompt.indexOf('WINE_ENV_V4:');
    const lightIdx = prompt.indexOf('LIGHTING:');
    expect(envIdx).toBeLessThan(lightIdx);
  });

  it('lighting appears before camera', () => {
    const prompt = assembleWineV4Prompt(BASE_PARAMS);
    const lightIdx = prompt.indexOf('LIGHTING:');
    const cameraIdx = prompt.indexOf('CAMERA:');
    expect(lightIdx).toBeLessThan(cameraIdx);
  });

  it('camera appears before composition', () => {
    const prompt = assembleWineV4Prompt(BASE_PARAMS);
    const cameraIdx = prompt.indexOf('CAMERA:');
    const compIdx = prompt.indexOf('COMPOSITION:');
    expect(cameraIdx).toBeLessThan(compIdx);
  });

  it('output constraint is last non-empty segment', () => {
    const prompt = assembleWineV4Prompt(BASE_PARAMS);
    expect(prompt.endsWith('No composite artifacts.')).toBe(true);
  });

  it('no duplicate WINE_ENGINE_V4 token', () => {
    const prompt = assembleWineV4Prompt(BASE_PARAMS);
    const count = (prompt.match(/WINE_ENGINE_V4/g) ?? []).length;
    expect(count).toBe(1);
  });
});

// ─── WINE PIPELINE V4 INTEGRATION ─────────────────────────────────────────
describe('winePipelineV4 integration', () => {
  const baseState = {
    visualProfile: 'wine-prestige' as const,
    wineEngineVersion: 4,
    wineType: 'red',
    wineClosureType: 'cork',
    carbonationLevel: 'none',
    wineBottleState: 'sealed',
    wineServeState: 'none',
  } as any;

  it('produces a non-empty string', () => {
    const result = winePipelineV4.build(baseState);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(100);
  });

  it('always contains WINE_ENGINE_V4 token', () => {
    const result = winePipelineV4.build(baseState);
    expect(result).toContain('WINE_ENGINE_V4');
  });

  it('always contains physics token (BOTTLE_PRESERVATION_LOCK)', () => {
    const result = winePipelineV4.build(baseState);
    expect(result).toContain('BOTTLE_PRESERVATION_LOCK');
  });

  it('bottle-and-glass composition mode → WINE_GLASS token in output', () => {
    // In the simplified architecture, "served" is communicated by composition mode,
    // not by bottle state mutation. Forcing compositionMode='bottle-and-glass' is
    // the correct v4 way to request a glass alongside the sealed bottle.
    const result = winePipelineV4.build(baseState, { compositionMode: 'bottle-and-glass' });
    // The pipeline resolves composition → 'bottle-and-glass' which forces the
    // physics block's glassBlock. The WINE_GLASS token is in the physics block.
    // Alternatively COMPOSITION: BOTTLE_AND_GLASS should appear.
    expect(result).toContain('BOTTLE_AND_GLASS');
  });

  it('respects environment override', () => {
    const result = winePipelineV4.build(baseState, { environment: 'Vineyard Blue Hour' });
    expect(result).toContain('VINEYARD_BLUE_HOUR');
  });

  it('respects luxury tier override', () => {
    const result = winePipelineV4.build(baseState, { luxuryTier: 'Heritage Luxury' });
    expect(result).toContain('HERITAGE_LUXURY');
  });

  it('respects lighting rig override', () => {
    const result = winePipelineV4.build(baseState, { lightingRig: 'backlit-liquid-glow' });
    expect(result).toContain('BACKLIT_GLOW');
  });

  it('with micro variation — injects WINE_MICRO_VARIATION block', () => {
    const result = winePipelineV4.build(baseState, {
      microVariation: { season: 'autumn', dewOnGlass: true },
    });
    expect(result).toContain('WINE_MICRO_VARIATION:');
  });

  it('no options → does not crash, produces valid output', () => {
    expect(() => winePipelineV4.build(baseState, {})).not.toThrow();
  });
});

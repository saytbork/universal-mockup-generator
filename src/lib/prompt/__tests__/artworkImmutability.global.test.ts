/**
 * artworkImmutability.global.test.ts
 *
 * Global artwork preservation contract.
 *
 * Validates that ARTWORK_IMMUTABILITY appears in every industry pipeline:
 *   wine, coffee, and generic (covers supplements, beauty, beverage, boxes, jars, tubes).
 *
 * Contract assertions:
 *   ✔ No modification of printed text
 *   ✔ No spelling correction
 *   ✔ No typographic reinterpretation
 *   ✔ No proper noun substitution
 *   ✔ No geographic name rewrite
 *   ✔ No brand name alteration
 *   ✔ No invented wording
 *   ✔ No semantic correction
 *   ✔ No typographic enhancement
 *   ✔ Block appears BEFORE geometry/lighting/environment/materials
 */

import { describe, test, expect } from 'vitest';
import { buildArtworkImmutability } from '../../productStudioV2/builders/buildArtworkImmutability';
import { generateStudioPromptV2 } from '../../productStudioV2';
import type { StudioUIState } from '../../productStudioV2/types/studioTypes';

// ─── helpers ────────────────────────────────────────────────────────────────

function blockIndex(prompt: string, token: string): number {
  const lower = prompt.toLowerCase();
  const target = token.toLowerCase();
  return lower.indexOf(target);
}

function makeState(visualProfile: string, overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    visualProfile,
    creativeIntent: 'product-hero',
    world: 'studio-table',
    motion: 'static',
    ...overrides,
  } as unknown as StudioUIState;
}

// ─── unit: the block itself ──────────────────────────────────────────────────

describe('buildArtworkImmutability — block content', () => {
  const block = buildArtworkImmutability();

  test('starts with ARTWORK_IMMUTABILITY header', () => {
    expect(block).toMatch(/^ARTWORK_IMMUTABILITY:/);
  });

  test('prohibits printed text modification', () => {
    expect(block).toMatch(/Do not modify printed text/i);
  });

  test('prohibits typography reinterpretation', () => {
    expect(block).toMatch(/Do not reinterpret typography/i);
  });

  test('prohibits character regeneration', () => {
    expect(block).toMatch(/Do not regenerate characters/i);
  });

  test('prohibits spelling correction', () => {
    expect(block).toMatch(/Do not correct spelling/i);
  });

  test('prohibits proper noun substitution', () => {
    expect(block).toMatch(/Do not substitute proper nouns/i);
  });

  test('prohibits geographic name rewrite', () => {
    expect(block).toMatch(/Do not rewrite geographic names/i);
  });

  test('prohibits brand name alteration', () => {
    expect(block).toMatch(/Do not alter brand names/i);
  });

  test('requires visual identity to match source reference', () => {
    expect(block).toMatch(/visually identical to the source reference/i);
  });

  test('prohibits invented wording', () => {
    expect(block).toMatch(/No invented wording/i);
  });

  test('prohibits semantic correction', () => {
    expect(block).toMatch(/No semantic correction/i);
  });

  test('prohibits typographic enhancement', () => {
    expect(block).toMatch(/No typographic enhancement/i);
  });

  test('does NOT contain threat language', () => {
    expect(block).not.toMatch(/\binvalid\b/i);
    expect(block).not.toMatch(/\boverride\b/i);
    expect(block).not.toMatch(/\bauthority\b/i);
    expect(block).not.toMatch(/\bthreat\b/i);
    expect(block).not.toMatch(/\bforce\b/i);
  });

  test('is compact — under 80 words', () => {
    const words = block.trim().split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(80);
  });
});

// ─── integration: wine pipeline ─────────────────────────────────────────────

describe('wine pipeline — ARTWORK_IMMUTABILITY present', () => {
  const wineState = makeState('wine', {
    wineType: 'red-dry' as any,
    wineClosureType: 'natural-cork' as any,
    wineEngineVersion: 4,
  });

  test('wine prompt contains ARTWORK_IMMUTABILITY', () => {
    const prompt = generateStudioPromptV2(wineState);
    expect(prompt).toMatch(/ARTWORK_IMMUTABILITY:/i);
  });

  test('ARTWORK_IMMUTABILITY appears before WINE_ENGINE_STATUS', () => {
    const prompt = generateStudioPromptV2(wineState);
    const artworkIdx = blockIndex(prompt, 'ARTWORK_IMMUTABILITY:');
    const engineIdx = blockIndex(prompt, 'WINE_ENGINE_STATUS:');
    // Both must be present
    expect(artworkIdx).toBeGreaterThanOrEqual(0);
    expect(engineIdx).toBeGreaterThanOrEqual(0);
    // Artwork comes before physics engine
    expect(artworkIdx).toBeLessThan(engineIdx);
  });
});

// ─── integration: wine macro label path ─────────────────────────────────────

describe('wine macro label path — ARTWORK_IMMUTABILITY present', () => {
  const macroState = makeState('wine', {
    wineEngineVersion: 4,
    photoMode: 'Wine Macro Label',
  } as any);

  test('macro label prompt contains ARTWORK_IMMUTABILITY', () => {
    const prompt = generateStudioPromptV2(macroState);
    expect(prompt).toMatch(/ARTWORK_IMMUTABILITY:/i);
  });
});

// ─── integration: coffee pipeline ───────────────────────────────────────────

describe('coffee pipeline — ARTWORK_IMMUTABILITY present', () => {
  const coffeeState = makeState('coffee', {
    coffeeIndustryLayer: true,
    coffeeMoodProfile: 'premium-minimal',
    coffeePackagingIntent: 'pdp-clean',
  } as any);

  test('coffee prompt contains ARTWORK_IMMUTABILITY', () => {
    const prompt = generateStudioPromptV2(coffeeState);
    expect(prompt).toMatch(/ARTWORK_IMMUTABILITY:/i);
  });
});

// ─── integration: generic pipeline (supplements, beauty, beverage, etc.) ────

describe('generic pipeline — ARTWORK_IMMUTABILITY present', () => {
  const industries = [
    'supplements',
    'beauty',
    'beverage',
    'generic',
  ] as const;

  for (const industry of industries) {
    test(`${industry} prompt contains ARTWORK_IMMUTABILITY`, () => {
      const state = makeState(industry);
      const prompt = generateStudioPromptV2(state);
      expect(prompt).toMatch(/ARTWORK_IMMUTABILITY:/i);
    });
  }
});

// ─── integration: ARTWORK_IMMUTABILITY appears before geometry/lighting ──────

describe('position contract — ARTWORK_IMMUTABILITY before geometry and lighting', () => {
  const industries = ['supplements', 'beauty', 'generic'];

  for (const industry of industries) {
    test(`${industry}: ARTWORK_IMMUTABILITY before any lighting token`, () => {
      const state = makeState(industry);
      const prompt = generateStudioPromptV2(state);
      const artworkIdx = blockIndex(prompt, 'ARTWORK_IMMUTABILITY:');
      expect(artworkIdx).toBeGreaterThanOrEqual(0);

      // STUDIO_LIGHTING_PROFILE may or may not be present; if it is, it must come after
      const lightingIdx = blockIndex(prompt, 'STUDIO_LIGHTING_PROFILE:');
      if (lightingIdx >= 0) {
        expect(artworkIdx).toBeLessThan(lightingIdx);
      }
    });
  }
});

// ─── contract: block is not duplicated ───────────────────────────────────────

describe('deduplication contract', () => {
  test('generic pipeline does not emit ARTWORK_IMMUTABILITY twice', () => {
    const state = makeState('generic');
    const prompt = generateStudioPromptV2(state);
    const count = (prompt.match(/ARTWORK_IMMUTABILITY:/gi) || []).length;
    expect(count).toBe(1);
  });

  test('wine pipeline does not emit ARTWORK_IMMUTABILITY twice', () => {
    const state = makeState('wine', { wineEngineVersion: 4 } as any);
    const prompt = generateStudioPromptV2(state);
    const count = (prompt.match(/ARTWORK_IMMUTABILITY:/gi) || []).length;
    expect(count).toBe(1);
  });

  test('coffee pipeline does not emit ARTWORK_IMMUTABILITY twice', () => {
    const state = makeState('coffee', { coffeeIndustryLayer: true } as any);
    const prompt = generateStudioPromptV2(state);
    const count = (prompt.match(/ARTWORK_IMMUTABILITY:/gi) || []).length;
    expect(count).toBe(1);
  });
});

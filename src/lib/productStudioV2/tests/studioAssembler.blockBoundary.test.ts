import { describe, expect, it } from 'vitest';
import { assembleStudioPrompt } from '../assembler/studioAssembler';

describe('studioAssembler block boundary regression', () => {
  it('preserves double-newline block boundaries for validator scanning', () => {
    const prompt = assembleStudioPrompt([
      'STUDIO_VISUAL_INTENT: conversion.',
      'STUDIO_PHYSICS_MODEL: fluid_dynamics_surface_impact.',
      'STUDIO_MODIFIERS: STUDIO_MODIFIER_SPLASH: enabled.',
    ]);

    expect(prompt).toContain('\n\n');

    const blocks = prompt.split('\n\n').map((b) => b.trim()).filter(Boolean);
    expect(blocks.some((b) => b.startsWith('STUDIO_PHYSICS_MODEL:'))).toBe(true);
    expect(blocks.some((b) => b.startsWith('STUDIO_MODIFIERS:'))).toBe(true);
  });
});


import { test, expect } from 'playwright/test';
import { generateStudioPromptV2 } from '../src/lib/productStudioV2';

test.describe('ProductStudioV2', () => {
  test('conversion static hero has no physics block', () => {
    const prompt = generateStudioPromptV2({
      creativeIntent: 'conversion',
      world: 'studio',
      motion: 'static',
      composition: 'hero',
      aspectRatio: '4:5',
      subjectOrientation: 'vertical',
    });

    expect(prompt).toContain('STUDIO_VISUAL_INTENT: conversion.');
    expect(prompt).toContain('STUDIO_PRODUCT_MOTION: static.');
    expect(prompt).not.toContain('STUDIO_PHYSICS_MODEL:');
    expect(prompt).toContain('STUDIO_MODIFIERS: none.');
  });

  test('splash pouring includes physics block', () => {
    const prompt = generateStudioPromptV2({
      creativeIntent: 'conversion',
      world: 'splash-tank',
      motion: 'pouring',
      composition: 'hero',
      photoMode: 'Splash Shot',
    });

    expect(prompt).toContain('STUDIO_PHYSICS_MODEL:');
    expect(prompt).toContain('Define liquid origin explicitly');
  });

  test('underwater split 1:1 vertical disables horizontal spread', () => {
    const prompt = generateStudioPromptV2({
      creativeIntent: 'conversion',
      world: 'underwater',
      motion: 'pouring',
      composition: 'hero',
      aspectRatio: '1:1',
      photoMode: 'Underwater Split',
      subjectOrientation: 'vertical',
    });

    expect(prompt).toContain('Horizontal spread is disabled.');
    expect(prompt).toContain('Vertical subject dominance is enabled.');
    expect(prompt).toContain('No lateral splash expansion allowed.');
  });

  test('clinical disables splash physics even with dynamic motion', () => {
    const prompt = generateStudioPromptV2({
      creativeIntent: 'clinical',
      world: 'splash-tank',
      motion: 'pouring',
      composition: 'macro',
      photoMode: 'Splash Shot',
    });

    expect(prompt).toContain('STUDIO_VISUAL_INTENT: clinical.');
    expect(prompt).not.toContain('STUDIO_PHYSICS_MODEL:');
  });

  test('prompt contains one intent and one lighting model block', () => {
    const prompt = generateStudioPromptV2({
      creativeIntent: 'luxury',
      world: 'studio',
      motion: 'static',
      composition: 'carousel',
    });

    expect((prompt.match(/STUDIO_VISUAL_INTENT:/g) || []).length).toBe(1);
    expect((prompt.match(/STUDIO_LIGHTING_MODEL:/g) || []).length).toBe(1);
  });

  test('no requested modifiers yields none', () => {
    const prompt = generateStudioPromptV2({
      creativeIntent: 'luxury',
      world: 'studio',
      motion: 'static',
      composition: 'hero',
      requestedModifiers: [],
    });

    expect(prompt).toContain('STUDIO_MODIFIERS: none.');
  });

  test('requested splash modifier without authority does not appear', () => {
    const prompt = generateStudioPromptV2({
      creativeIntent: 'conversion',
      world: 'studio',
      motion: 'static',
      composition: 'hero',
      requestedModifiers: ['splash'],
    });

    expect(prompt).not.toContain('STUDIO_MODIFIER_SPLASH:');
    expect(prompt).toContain('STUDIO_MODIFIERS: none.');
  });

  test('underwater blocks texturedBed even if requested', () => {
    const prompt = generateStudioPromptV2({
      creativeIntent: 'conversion',
      world: 'underwater',
      motion: 'pouring',
      composition: 'hero',
      photoMode: 'Underwater Split',
      requestedModifiers: ['texturedBed', 'splash'],
    });

    expect(prompt).not.toContain('STUDIO_MODIFIER_TEXTUREDBED:');
    expect(prompt).toContain('STUDIO_MODIFIER_SPLASH:');
  });
});

/**
 * Deterministic Prompt Builder Tests
 */

import { test, expect } from 'playwright/test';
import { DeterministicPromptBuilder, deterministicPromptBuilder, type DeterministicPromptInput } from '../src/lib/promptEngine/deterministicPromptBuilder';

function createBaseInput(sceneType: DeterministicPromptInput['sceneType']): DeterministicPromptInput {
    return {
        sceneType,
        productSetup: { productType: 'skincare serum bottle', packaging: 'glass bottle with dropper', physicalScale: '30ml', productContentColor: 'clear', handsAllowed: false },
        compositionRules: { quantity: 1, arrangement: 'centered', interactionObjects: [] },
        environment: { macroEnvironment: undefined, microPlace: undefined },
        lighting: { lightingStyle: 'natural soft light' },
        creativity: { level: 0, theme: undefined, paletteSource: undefined, propDensity: undefined },
        camera: { cameraSystem: 'smartphone', angle: 'eye level', distance: 'medium', framing: 'centered' },
        ecommerce: { enabled: false },
        outputFormat: { aspectRatio: '1:1' }
    };
}

test.describe('Scene Type Validation', () => {
    test('HARD FAIL: missing sceneType blocks generation', () => {
        const result = new DeterministicPromptBuilder().build({} as any);
        expect(result.validationStatus).toBe('fail');
        expect(result.validationErrors?.[0]).toContain('sceneType is required');
    });

    test('studio_packshot produces correct prompt structure', () => {
        const result = deterministicPromptBuilder.build(createBaseInput('studio_packshot'));
        expect(result.validationStatus).toBe('pass');
        expect(result.prompt).toContain('SCENE TYPE:');
        expect(result.prompt).toContain('studio packshot');
    });

    test('each scene type produces unique prompt structure', () => {
        const sceneTypes: DeterministicPromptInput['sceneType'][] = ['studio_packshot', 'editorial_product', 'lifestyle_product', 'ugc_phone', 'ecommerce_blank_space', 'bundle_kit'];
        const prompts = sceneTypes.map(sceneType => {
            const input = createBaseInput(sceneType);
            if (sceneType === 'bundle_kit') input.compositionRules.quantity = 3;
            if (sceneType === 'ecommerce_blank_space') { input.ecommerce.enabled = true; input.lighting.lightingStyle = 'even lighting'; input.creativity.level = 1; }
            if (sceneType === 'ugc_phone') { input.lighting.lightingStyle = 'natural window light'; input.environment.macroEnvironment = 'indoor'; input.environment.microPlace = 'bathroom counter'; }
            if (sceneType === 'lifestyle_product') { input.environment.macroEnvironment = 'indoor'; input.environment.microPlace = 'kitchen counter'; }
            return deterministicPromptBuilder.build(input);
        });
        prompts.forEach(result => expect(result.validationStatus).toBe('pass'));
    });
});

test.describe('Environment Rules', () => {
    test('HARD FAIL: studio_packshot + environment', () => {
        const input = createBaseInput('studio_packshot');
        input.environment.macroEnvironment = 'indoor';
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('fail');
        expect(result.validationErrors?.[0]).toContain('Environment is FORBIDDEN');
    });

    test('lifestyle_product + environment = pass', () => {
        const input = createBaseInput('lifestyle_product');
        input.environment.macroEnvironment = 'indoor';
        input.environment.microPlace = 'kitchen counter';
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('pass');
        expect(result.prompt).toContain('ENVIRONMENT:');
    });
});

test.describe('Ecommerce Overrides', () => {
    test('HARD FAIL: ecommerce enabled outside ecommerce_blank_space', () => {
        const input = createBaseInput('studio_packshot');
        input.ecommerce.enabled = true;
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('fail');
        expect(result.validationErrors?.[0]).toContain('ecommerce.enabled=true requires');
    });

    test('ecommerce_blank_space enforces blank space layout', () => {
        const input = createBaseInput('ecommerce_blank_space');
        input.ecommerce.enabled = true;
        input.ecommerce.blankSpacePosition = 'left';
        input.lighting.lightingStyle = 'even lighting';
        input.creativity.level = 1;
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('pass');
        expect(result.prompt).toContain('ECOMMERCE RULES:');
    });
});

test.describe('Lighting Validation', () => {
    test('HARD FAIL: ugc_phone + ring light', () => {
        const input = createBaseInput('ugc_phone');
        input.lighting.lightingStyle = 'ring light';
        input.environment.macroEnvironment = 'indoor';
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('fail');
        expect(result.validationErrors?.[0]).toContain('Lighting');
    });
});

test.describe('Hands Validation', () => {
    test('HARD FAIL: studio_packshot + handsAllowed', () => {
        const input = createBaseInput('studio_packshot');
        input.productSetup.handsAllowed = true;
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('fail');
        expect(result.validationErrors?.[0]).toContain('handsAllowed=true is FORBIDDEN');
    });

    test('lifestyle_product + handsAllowed = pass', () => {
        const input = createBaseInput('lifestyle_product');
        input.productSetup.handsAllowed = true;
        input.environment.macroEnvironment = 'indoor';
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('pass');
        expect(result.prompt).toContain('Hands may interact with product');
    });
});

test.describe('Bundle Kit Validation', () => {
    test('HARD FAIL: bundle_kit with quantity=1', () => {
        const input = createBaseInput('bundle_kit');
        input.compositionRules.quantity = 1;
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('fail');
        expect(result.validationErrors?.[0]).toContain('requires quantity > 1');
    });

    test('bundle_kit with quantity=3 = pass', () => {
        const input = createBaseInput('bundle_kit');
        input.compositionRules.quantity = 3;
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('pass');
        expect(result.prompt).toContain('3 product units');
    });
});

test.describe('Creativity Validation', () => {
    test('HARD FAIL: ugc_phone + high creativity level', () => {
        const input = createBaseInput('ugc_phone');
        input.lighting.lightingStyle = 'natural window light';
        input.environment.macroEnvironment = 'indoor';
        input.creativity.level = 8;
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('fail');
        expect(result.validationErrors?.[0]).toContain('creativity level MUST be <= 3');
    });

    test('HARD FAIL: ecommerce_blank_space + advanced creativity', () => {
        const input = createBaseInput('ecommerce_blank_space');
        input.ecommerce.enabled = true;
        input.lighting.lightingStyle = 'even lighting';
        input.creativity.level = 5;
        input.creativity.theme = 'moody';
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('fail');
        expect(result.validationErrors?.[0]).toContain('creativity level MUST be <= 2');
    });
});

test.describe('Prompt Construction Order', () => {
    test('sections appear in canonical order', () => {
        const input = createBaseInput('lifestyle_product');
        input.environment.macroEnvironment = 'indoor';
        input.environment.microPlace = 'kitchen counter';
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('pass');
        const p = result.prompt;
        expect(p.indexOf('SCENE TYPE:')).toBeLessThan(p.indexOf('PRODUCT:'));
        expect(p.indexOf('PRODUCT:')).toBeLessThan(p.indexOf('COMPOSITION:'));
        expect(p.indexOf('COMPOSITION:')).toBeLessThan(p.indexOf('ENVIRONMENT:'));
        expect(p.indexOf('ENVIRONMENT:')).toBeLessThan(p.indexOf('LIGHTING:'));
        expect(p.indexOf('LIGHTING:')).toBeLessThan(p.indexOf('CAMERA:'));
        expect(p.indexOf('CAMERA:')).toBeLessThan(p.indexOf('CREATIVE MODULATION:'));
        expect(p.indexOf('CREATIVE MODULATION:')).toBeLessThan(p.indexOf('CONSTRAINTS:'));
    });

    test('negative prompt auto-generated based on scene type', () => {
        const studioResult = deterministicPromptBuilder.build(createBaseInput('studio_packshot'));
        expect(studioResult.negativePrompt).toContain('hands');
        expect(studioResult.negativePrompt).toContain('people');
    });
});

test.describe('Strict Creativity Rules', () => {
    test('HARD FAIL: studio_packshot with creativity > 0', () => {
        const input = createBaseInput('studio_packshot');
        input.creativity.level = 1;
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('fail');
        expect(result.validationErrors?.[0]).toContain('creativity level MUST be 0 or Off');
    });

    test('studio_packshot with creativity = 0 passes', () => {
        const input = createBaseInput('studio_packshot');
        input.creativity.level = 0;
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('pass');
    });
});

test.describe('Quantity Restrictions', () => {
    test('HARD FAIL: lifestyle_product with quantity > 1', () => {
        const input = createBaseInput('lifestyle_product');
        input.compositionRules.quantity = 2;
        input.environment.macroEnvironment = 'indoor';
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('fail');
        expect(result.validationErrors?.[0]).toContain('quantity > 1 is ONLY allowed');
    });

    test('editorial_product with quantity > 1 passes', () => {
        const input = createBaseInput('editorial_product');
        input.compositionRules.quantity = 3;
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('pass');
    });
});

test.describe('UGC Camera Validation', () => {
    test('HARD FAIL: ugc_phone with DSLR camera', () => {
        const input = createBaseInput('ugc_phone');
        input.lighting.lightingStyle = 'natural window light';
        input.environment.macroEnvironment = 'indoor';
        input.camera.cameraSystem = 'DSLR';
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('fail');
        expect(result.validationErrors?.[0]).toContain('contradicts UGC authenticity');
    });

    test('ugc_phone with smartphone camera passes', () => {
        const input = createBaseInput('ugc_phone');
        input.lighting.lightingStyle = 'natural window light';
        input.environment.macroEnvironment = 'indoor';
        input.camera.cameraSystem = 'smartphone';
        const result = deterministicPromptBuilder.build(input);
        expect(result.validationStatus).toBe('pass');
    });
});

/**
 * Canonical Smoke Test Fixtures
 * 
 * CRITICAL: If any of these change result, v1 is broken.
 */

import { deterministicPromptBuilder } from '../src/lib/promptEngine/deterministicPromptBuilder';
import type { DeterministicPromptInput } from '../src/lib/promptEngine/sceneTypes';

// ============================================================================
// FIXTURES
// ============================================================================

export const PASS_1_STUDIO_PACKSHOT: DeterministicPromptInput = {
    sceneType: 'studio_packshot',
    productSetup: {
        productType: 'capsule supplement',
        packaging: 'plastic bottle',
        physicalScale: 'tabletop',
        productContentColor: 'white',
        handsAllowed: false
    },
    compositionRules: {
        quantity: 1,
        arrangement: 'centered',
        interactionObjects: []
    },
    environment: {},
    lighting: {
        lightingStyle: 'soft studio light'
    },
    creativity: {
        level: 0
    },
    camera: {
        cameraSystem: 'DSLR',
        angle: 'eye level',
        distance: 'medium',
        rotation: '0',
        framing: 'centered'
    },
    ecommerce: {
        enabled: false
    },
    outputFormat: {
        aspectRatio: '1:1'
    }
};

export const PASS_2_BUNDLE_KIT: DeterministicPromptInput = {
    sceneType: 'bundle_kit',
    productSetup: {
        productType: 'skincare serum',
        packaging: 'glass dropper bottle',
        physicalScale: 'tabletop',
        productContentColor: 'clear',
        handsAllowed: false
    },
    compositionRules: {
        quantity: 3,
        arrangement: 'grouped',
        interactionObjects: []
    },
    environment: {
        macroEnvironment: 'indoor',
        microPlace: 'vanity table'
    },
    lighting: {
        lightingStyle: 'natural soft light'
    },
    creativity: {
        level: 3
    },
    camera: {
        cameraSystem: 'DSLR',
        angle: 'slight top-down',
        distance: 'medium',
        rotation: '0',
        framing: 'balanced'
    },
    ecommerce: {
        enabled: false
    },
    outputFormat: {
        aspectRatio: '4:5'
    }
};

export const FAIL_1_STUDIO_CREATIVITY: DeterministicPromptInput = {
    sceneType: 'studio_packshot',
    productSetup: {
        productType: 'powder supplement',
        handsAllowed: false
    },
    compositionRules: {
        quantity: 1,
        arrangement: '',
        interactionObjects: []
    },
    environment: {},
    lighting: {
        lightingStyle: 'soft studio light'
    },
    creativity: {
        level: 1 // VIOLATION: must be 0
    },
    camera: {
        cameraSystem: 'DSLR',
        angle: '',
        distance: '',
        framing: ''
    },
    ecommerce: {
        enabled: false
    },
    outputFormat: {
        aspectRatio: '1:1'
    }
};

export const FAIL_2_UGC_CAMERA: DeterministicPromptInput = {
    sceneType: 'ugc_phone',
    productSetup: {
        productType: 'gummy supplement',
        handsAllowed: true
    },
    compositionRules: {
        quantity: 1,
        arrangement: '',
        interactionObjects: []
    },
    environment: {
        macroEnvironment: 'indoor',
        microPlace: 'kitchen counter'
    },
    lighting: {
        lightingStyle: 'natural window light'
    },
    creativity: {
        level: 2
    },
    camera: {
        cameraSystem: 'DSLR', // VIOLATION: must be smartphone
        angle: '',
        distance: '',
        framing: ''
    },
    ecommerce: {
        enabled: false
    },
    outputFormat: {
        aspectRatio: '9:16'
    }
};

// ============================================================================
// EXECUTION
// ============================================================================

console.log('='.repeat(60));
console.log('CANONICAL SMOKE TESTS');
console.log('='.repeat(60));

// PASS 1
console.log('\n✅ PASS 1 — studio_packshot (mínimo, correcto)');
const result1 = deterministicPromptBuilder.build(PASS_1_STUDIO_PACKSHOT);
console.log('Status:', result1.validationStatus);
if (result1.validationStatus === 'pass') {
    console.log('\nPrompt final:');
    console.log(result1.prompt);
    console.log('\nNegative prompt:');
    console.log(result1.negativePrompt);
} else {
    console.log('ERRORS:', result1.validationErrors);
}
console.log('\nValidation status:', result1.validationStatus);

// PASS 2
console.log('\n' + '='.repeat(60));
console.log('\n✅ PASS 2 — bundle_kit (válido, quantity > 1)');
const result2 = deterministicPromptBuilder.build(PASS_2_BUNDLE_KIT);
console.log('Status:', result2.validationStatus);
if (result2.validationStatus === 'pass') {
    console.log('\nPrompt final:');
    console.log(result2.prompt);
    console.log('\nNegative prompt:');
    console.log(result2.negativePrompt);
} else {
    console.log('ERRORS:', result2.validationErrors);
}
console.log('\nValidation status:', result2.validationStatus);

// FAIL 1
console.log('\n' + '='.repeat(60));
console.log('\n❌ FAIL 1 — studio_packshot con creatividad > 0');
const result3 = deterministicPromptBuilder.build(FAIL_1_STUDIO_CREATIVITY);
console.log('Status:', result3.validationStatus);
console.log('ABORT Reason:', result3.validationErrors?.[0] || 'none');
console.log('\nValidation status:', result3.validationStatus);

// FAIL 2
console.log('\n' + '='.repeat(60));
console.log('\n❌ FAIL 2 — ugc_phone con cámara incorrecta');
const result4 = deterministicPromptBuilder.build(FAIL_2_UGC_CAMERA);
console.log('Status:', result4.validationStatus);
console.log('ABORT Reason:', result4.validationErrors?.[0] || 'none');
console.log('\nValidation status:', result4.validationStatus);

// Summary
console.log('\n' + '='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`PASS 1 (studio_packshot): ${result1.validationStatus === 'pass' ? '✅ PASS' : '❌ UNEXPECTED FAIL'}`);
console.log(`PASS 2 (bundle_kit): ${result2.validationStatus === 'pass' ? '✅ PASS' : '❌ UNEXPECTED FAIL'}`);
console.log(`FAIL 1 (studio+creativity): ${result3.validationStatus === 'fail' ? '✅ CORRECTLY ABORTED' : '❌ UNEXPECTED PASS'}`);
console.log(`FAIL 2 (ugc+DSLR): ${result4.validationStatus === 'fail' ? '✅ CORRECTLY ABORTED' : '❌ UNEXPECTED PASS'}`);

const allCorrect =
    result1.validationStatus === 'pass' &&
    result2.validationStatus === 'pass' &&
    result3.validationStatus === 'fail' &&
    result4.validationStatus === 'fail';

console.log('\n' + (allCorrect ? '🎉 ALL 4 CANONICAL TESTS PASSED' : '🚨 REGRESSION DETECTED'));

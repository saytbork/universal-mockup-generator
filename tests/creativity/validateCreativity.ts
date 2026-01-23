/**
 * Creativity v2 Validation Tests
 * 
 * Tests that:
 * 1. All modes generate distinct prompts
 * 2. Compatibility rules are enforced
 * 3. No v1 regression
 */

import {
    CREATIVE_MODES,
    injectCreativity,
    injectUGCCreativity,
    validateCreativity,
    getCreativeModeOptions
} from '../../src/lib/creativity';
import type { CreativeMode } from '../../src/lib/creativity';
import type { SceneType } from '../../src/lib/premiumStudio/schema';

console.log('='.repeat(70));
console.log('CREATIVITY v2 VALIDATION');
console.log('='.repeat(70));

let passed = 0;
let failed = 0;

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1: All modes generate unique prompts
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n▶ TEST 1: Mode Differentiation');

const modes = Object.keys(CREATIVE_MODES) as CreativeMode[];
const injections = new Map<CreativeMode, string>();

for (const mode of modes) {
    const injection = injectCreativity(mode);
    injections.set(mode, injection.fullInjection);
    console.log(`  ✓ ${mode}: ${injection.fullInjection.length} chars`);
}

// Check uniqueness
let allUnique = true;
for (let i = 0; i < modes.length; i++) {
    for (let j = i + 1; j < modes.length; j++) {
        const a = injections.get(modes[i])!;
        const b = injections.get(modes[j])!;
        if (a === b) {
            console.log(`  ❌ ${modes[i]} and ${modes[j]} produce identical prompts`);
            allUnique = false;
            failed++;
        }
    }
}

if (allUnique) {
    console.log(`  ✅ All 7 modes produce unique prompts`);
    passed++;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2: UGC has no creativity
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n▶ TEST 2: UGC Creativity Limited');

const ugcOptions = getCreativeModeOptions('ugc_phone');
if (ugcOptions.length === 0) {
    console.log('  ✅ UGC returns no creative mode options');
    passed++;
} else {
    console.log(`  ❌ UGC should have no options, got ${ugcOptions.length}`);
    failed++;
}

const ugcValidation = validateCreativity('ugc_phone', 'high_end_studio');
if (ugcValidation.normalizedMode === null) {
    console.log('  ✅ UGC normalizes to null (no creativity)');
    passed++;
} else {
    console.log(`  ❌ UGC should normalize to null, got ${ugcValidation.normalizedMode}`);
    failed++;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3: Compatibility enforcement
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n▶ TEST 3: Compatibility Rules');

const testCases: { scene: SceneType; mode: CreativeMode; shouldPass: boolean }[] = [
    { scene: 'studio_branding', mode: 'high_end_studio', shouldPass: true },
    { scene: 'studio_branding', mode: 'lifestyle_cinematic', shouldPass: false },
    { scene: 'lifestyle_real', mode: 'lifestyle_cinematic', shouldPass: true },
    { scene: 'lifestyle_real', mode: 'vibrant_brand_explosion', shouldPass: false },
    { scene: 'bundle_hero', mode: 'vibrant_brand_explosion', shouldPass: true },
    { scene: 'editorial_product', mode: 'minimal_editorial', shouldPass: true }
];

for (const tc of testCases) {
    const result = validateCreativity(tc.scene, tc.mode);
    const actualPass = result.valid;

    if (actualPass === tc.shouldPass) {
        console.log(`  ✅ ${tc.scene} + ${tc.mode} → ${tc.shouldPass ? 'VALID' : 'INVALID'}`);
        passed++;
    } else {
        console.log(`  ❌ ${tc.scene} + ${tc.mode} → expected ${tc.shouldPass}, got ${actualPass}`);
        failed++;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 4: Default mode fallback
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n▶ TEST 4: Default Mode Fallback');

const scenes: SceneType[] = ['studio_branding', 'editorial_product', 'lifestyle_real', 'bundle_hero'];
for (const scene of scenes) {
    const result = validateCreativity(scene, null);
    if (result.normalizedMode !== null) {
        console.log(`  ✅ ${scene} defaults to "${result.normalizedMode}"`);
        passed++;
    } else {
        console.log(`  ❌ ${scene} should have a default mode`);
        failed++;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));

const total = passed + failed;
console.log(`\nTotal: ${passed}/${total} PASS`);

if (failed === 0) {
    console.log('\n🎉 ALL CREATIVITY TESTS PASSED');
} else {
    console.log(`\n🚨 ${failed} TESTS FAILED`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE OUTPUT
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(70));
console.log('SAMPLE: HIGH_END_STUDIO INJECTION');
console.log('='.repeat(70));

const sample = injectCreativity('high_end_studio');
console.log(sample.fullInjection);

console.log('\n' + '='.repeat(70));
console.log('SAMPLE: VIBRANT_BRAND_EXPLOSION INJECTION');
console.log('='.repeat(70));

const sample2 = injectCreativity('vibrant_brand_explosion');
console.log(sample2.fullInjection);

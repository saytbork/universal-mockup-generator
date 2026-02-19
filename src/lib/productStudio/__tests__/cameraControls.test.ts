/**
 * PRODUCT STUDIO CAMERA CONTROLS - VERIFICATION TEST
 * 
 * This file demonstrates that all 08 / Camera & Framing controls
 * are properly wired from UI → State → Prompt
 */

import { mapFieldsToProductStudioState } from '../mapper';
import type { ProductStudioState } from '../state';

// ============================================================================
// TEST: ALL CAMERA CONTROLS INJECT CORRECTLY
// ============================================================================

describe('Product Studio Camera Controls', () => {
    
    // Test 1: CAMERA SYSTEM (3 options)
    test('Camera System: DSLR / mirrorless', () => {
        const values = { productCameraSystem: 'DSLR / mirrorless' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.cameraSystem).toBe('dslr_mirrorless');
    });

    test('Camera System: Macro lens', () => {
        const values = { productCameraSystem: 'Macro lens' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.cameraSystem).toBe('macro');
    });

    test('Camera System: Telephoto compression', () => {
        const values = { productCameraSystem: 'Telephoto compression' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.cameraSystem).toBe('telephoto');
    });

    // Test 2: ANGLE (6 options)
    test('Angle: Eye level product', () => {
        const values = { productCameraAngle: 'Eye level product' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.angle).toBe('eye_level');
    });

    test('Angle: 45° hero', () => {
        const values = { productCameraAngle: '45° hero' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.angle).toBe('45_hero');
    });

    test('Angle: Top-down flat lay', () => {
        const values = { productCameraAngle: 'Top-down flat lay' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.angle).toBe('top_down');
    });

    test('Angle: Low angle power', () => {
        const values = { productCameraAngle: 'Low angle power' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.angle).toBe('low_angle');
    });

    test('Angle: High angle overview', () => {
        const values = { productCameraAngle: 'High angle overview' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.angle).toBe('high_angle');
    });

    test('Angle: Detail close-up', () => {
        const values = { productCameraAngle: 'Detail close-up' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.angle).toBe('detail_closeup');
    });

    // Test 3: DISTANCE (4 options)
    test('Distance: Wide', () => {
        const values = { productCameraDistance: 'Wide' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.distance).toBe('wide');
    });

    test('Distance: Standard', () => {
        const values = { productCameraDistance: 'Standard' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.distance).toBe('standard');
    });

    test('Distance: Tight', () => {
        const values = { productCameraDistance: 'Tight' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.distance).toBe('tight');
    });

    test('Distance: Macro', () => {
        const values = { productCameraDistance: 'Macro' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.distance).toBe('macro');
    });

    // Test 4: ROTATION (4 options)
    test('Rotation: 0°', () => {
        const values = { productCameraRotation: 0 };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.rotation).toBe(0);
    });

    test('Rotation: 5°', () => {
        const values = { productCameraRotation: 5 };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.rotation).toBe(5);
    });

    test('Rotation: 10°', () => {
        const values = { productCameraRotation: 10 };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.rotation).toBe(10);
    });

    test('Rotation: 15°', () => {
        const values = { productCameraRotation: 15 };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.rotation).toBe(15);
    });

    // Test 5: FRAMING GUIDE (5 options)
    test('Framing: Centered hero', () => {
        const values = { productFramingGuide: 'Centered hero' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.framing).toBe('centered_hero');
    });

    test('Framing: Rule of thirds', () => {
        const values = { productFramingGuide: 'Rule of thirds' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.framing).toBe('rule_of_thirds');
    });

    test('Framing: Left aligned + negative space', () => {
        const values = { productFramingGuide: 'Left aligned + negative space' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.framing).toBe('left_negative');
    });

    test('Framing: Right aligned + negative space', () => {
        const values = { productFramingGuide: 'Right aligned + negative space' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.framing).toBe('right_negative');
    });

    test('Framing: Grid-ready', () => {
        const values = { productFramingGuide: 'Grid-ready' };
        const state = mapFieldsToProductStudioState(values, []);
        expect(state.framing).toBe('grid_ready');
    });

    // Test 6: DEFAULT VALUES
    test('Default values when no camera controls specified', () => {
        const state = mapFieldsToProductStudioState({}, []);
        expect(state.cameraSystem).toBe('dslr_mirrorless');
        expect(state.angle).toBe('45_hero');
        expect(state.distance).toBe('standard');
        expect(state.rotation).toBe(0);
        expect(state.framing).toBe('centered_hero');
    });

    // Test 7: COMPLETE SCENARIO
    test('Complete camera control scenario: Macro + Top-down + Macro + 10° + Rule of thirds', () => {
        const values = {
            productCameraSystem: 'Macro lens',
            productCameraAngle: 'Top-down flat lay',
            productCameraDistance: 'Macro',
            productCameraRotation: 10,
            productFramingGuide: 'Rule of thirds',
        };
        const state = mapFieldsToProductStudioState(values, []);
        
        expect(state.cameraSystem).toBe('macro');
        expect(state.angle).toBe('top_down');
        expect(state.distance).toBe('macro');
        expect(state.rotation).toBe(10);
        expect(state.framing).toBe('rule_of_thirds');
    });
});

// ============================================================================
// MANUAL VERIFICATION SCRIPT
// ============================================================================

export function verifyCameraControls() {
    console.log('='.repeat(80));
    console.log('PRODUCT STUDIO CAMERA CONTROLS - VERIFICATION');
    console.log('='.repeat(80));

    const scenarios = [
        {
            name: 'Scenario 1: Professional DSLR Hero Shot',
            input: {
                productCameraSystem: 'DSLR / mirrorless',
                productCameraAngle: '45° hero',
                productCameraDistance: 'Standard',
                productCameraRotation: 5,
                productFramingGuide: 'Centered hero',
            },
            expected: {
                cameraSystem: 'dslr_mirrorless',
                angle: '45_hero',
                distance: 'standard',
                rotation: 5,
                framing: 'centered_hero',
            },
        },
        {
            name: 'Scenario 2: Macro Detail Shot',
            input: {
                productCameraSystem: 'Macro lens',
                productCameraAngle: 'Detail close-up',
                productCameraDistance: 'Macro',
                productCameraRotation: 0,
                productFramingGuide: 'Rule of thirds',
            },
            expected: {
                cameraSystem: 'macro',
                angle: 'detail_closeup',
                distance: 'macro',
                rotation: 0,
                framing: 'rule_of_thirds',
            },
        },
        {
            name: 'Scenario 3: Telephoto Flat Lay',
            input: {
                productCameraSystem: 'Telephoto compression',
                productCameraAngle: 'Top-down flat lay',
                productCameraDistance: 'Wide',
                productCameraRotation: 15,
                productFramingGuide: 'Grid-ready',
            },
            expected: {
                cameraSystem: 'telephoto',
                angle: 'top_down',
                distance: 'wide',
                rotation: 15,
                framing: 'grid_ready',
            },
        },
        {
            name: 'Scenario 4: Low Angle Power Shot with Negative Space',
            input: {
                productCameraSystem: 'DSLR / mirrorless',
                productCameraAngle: 'Low angle power',
                productCameraDistance: 'Tight',
                productCameraRotation: 10,
                productFramingGuide: 'Left aligned + negative space',
            },
            expected: {
                cameraSystem: 'dslr_mirrorless',
                angle: 'low_angle',
                distance: 'tight',
                rotation: 10,
                framing: 'left_negative',
            },
        },
    ];

    scenarios.forEach((scenario, index) => {
        console.log(`\n${index + 1}. ${scenario.name}`);
        console.log('-'.repeat(80));
        
        const state = mapFieldsToProductStudioState(scenario.input, []);
        
        const checks = [
            { key: 'cameraSystem', label: 'Camera System' },
            { key: 'angle', label: 'Angle' },
            { key: 'distance', label: 'Distance' },
            { key: 'rotation', label: 'Rotation' },
            { key: 'framing', label: 'Framing' },
        ];

        checks.forEach(({ key, label }) => {
            const actual = state[key as keyof typeof state];
            const expected = scenario.expected[key as keyof typeof scenario.expected];
            const status = actual === expected ? '✅' : '❌';
            console.log(`  ${status} ${label}: ${actual} ${actual === expected ? '' : `(expected: ${expected})`}`);
        });
    });

    console.log('\n' + '='.repeat(80));
    console.log('VERIFICATION COMPLETE');
    console.log('='.repeat(80));
}

// Run verification if executed directly
if (import.meta.env.MODE === 'test') {
    verifyCameraControls();
}

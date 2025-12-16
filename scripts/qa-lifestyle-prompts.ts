/**
 * QA SCRIPT: Lifestyle UGC Mode Prompt Validation
 * 
 * This script validates that all UI controls in Lifestyle Mode
 * correctly translate to observable, physical semantic language in the final prompt.
 * 
 * NO RENDERS ARE EXECUTED - only prompt generation is tested.
 */

import { promptEngine } from '../src/lib/promptEngine';
import type { PromptOptions } from '../src/lib/promptEngine/types';

// ============================================================================
// BASE CONFIGURATION
// ============================================================================

const BASE_CONFIG: Partial<PromptOptions> = {
    creationMode: 'lifestyle',
    creationIntent: 'ugc',
    contentStyle: 'ugc',
    aspectRatio: '1:1',
    camera: 'Smartphone',
    setting: 'Living room',
    lighting: 'soft natural light',
    perspective: 'centered composition',
    environmentOrder: 'environment first',
    productPlane: 'mid-ground',

    // Person included
    personIncluded: true,

    // Default person settings via personDetails
    personDetails: {
        age: 35,
        gender: 'Female',
        ethnicity: 'Caucasian',
        bodyType: 'Average',
        skinTone: 'Medium',
        skinRealism: 'Natural with minor imperfections',
        eyeColor: 'Brown',
        hairLength: 'Medium',
        hairTexture: 'Wavy',
        hairColor: 'Brown',
        facialExpression: 'Soft smile',
        eyeDirection: 'Camera' as any,
        selfieType: 'No arm visible',
    },

    // UGC Mode active
    ugcRealModeActive: true,
};

// ============================================================================
// TEST SCENARIOS
// ============================================================================

interface TestScenario {
    name: string;
    config: Partial<PromptOptions>;
    expectedKeywords: string[];
}

const QA_SCENARIOS: Record<string, TestScenario[]> = {

    // ========== AGE VALIDATION ==========
    'AGE': [
        {
            name: 'Age 30 (Baseline)',
            config: {
                personDetails: { age: 30, gender: 'Female', ethnicity: 'Caucasian', facialExpression: 'Soft smile' }
            },
            expectedKeywords: ['30-year-old adult'],
        },
        {
            name: 'Age 70 (Age Anchor)',
            config: {
                personDetails: { age: 70, gender: 'Female', ethnicity: 'Caucasian', facialExpression: 'Soft smile' }
            },
            expectedKeywords: [
                '70-year-old adult',
                'AGE ANCHOR',
                'skin laxity',
                'realistic skin texture',
                'Age realism override',
            ],
        },
        {
            name: 'Age 90 (Extreme Age)',
            config: {
                personDetails: { age: 90, gender: 'Female', ethnicity: 'Caucasian', facialExpression: 'Soft smile' }
            },
            expectedKeywords: [
                '90-year-old adult',
                'AGE ANCHOR',
                'advanced age',
                'realistic skin texture',
                'Age realism override',
            ],
        },
    ],

    // ========== EXPRESSION VALIDATION ==========
    'EXPRESSION': [
        {
            name: 'Soft Smile',
            config: {
                personDetails: { age: 35, facialExpression: 'Soft smile', gender: 'Female', ethnicity: 'Caucasian' }
            },
            expectedKeywords: ['soft relaxed smile', 'lips slightly curved', 'natural facial tension'],
        },
        {
            name: 'Full Smile',
            config: {
                personDetails: { age: 35, facialExpression: 'Full smile', gender: 'Female', ethnicity: 'Caucasian' }
            },
            expectedKeywords: ['broad genuine smile', 'teeth visible', 'expressive eyes'],
        },
        {
            name: 'Serious Focus',
            config: {
                personDetails: { age: 35, facialExpression: 'Serious focus', gender: 'Female', ethnicity: 'Caucasian' }
            },
            expectedKeywords: ['neutral serious expression', 'focused eyes', 'relaxed mouth'],
        },
    ],

    // ========== MOOD → BODY LANGUAGE ==========
    'MOOD': [
        {
            name: 'Calm',
            config: {
                personDetails: { age: 35, gender: 'Female', ethnicity: 'Caucasian', facialExpression: 'Soft smile' },
                personMood: 'relaxed posture with peaceful atmosphere, natural shoulders, gentle breathing, serene body language'
            },
            expectedKeywords: ['relaxed posture', 'peaceful atmosphere', 'serene body language'],
        },
        {
            name: 'Confident',
            config: {
                personDetails: { age: 35, gender: 'Female', ethnicity: 'Caucasian', facialExpression: 'Soft smile' },
                personMood: 'upright confident posture with composed presence, open chest, self-assured body language'
            },
            expectedKeywords: ['upright confident posture', 'composed presence', 'self-assured body language'],
        },
        {
            name: 'Playful',
            config: {
                personDetails: { age: 35, gender: 'Female', ethnicity: 'Caucasian', facialExpression: 'Soft smile' },
                personMood: 'loose playful body language with spontaneous natural moment, casual relaxed positioning'
            },
            expectedKeywords: ['loose playful body language', 'spontaneous natural moment', 'casual relaxed positioning'],
        },
    ],

    // ========== CAMERA SEMANTICS ==========
    'CAMERA': [
        {
            name: 'Medium Shot',
            config: {
                personDetails: { age: 35, gender: 'Female', ethnicity: 'Caucasian', facialExpression: 'Soft smile' },
                cameraShot: 'medium shot framing from waist up, balanced composition' as any
            },
            expectedKeywords: ['medium shot framing', 'waist up', 'balanced composition'],
        },
        {
            name: 'Close-up',
            config: {
                personDetails: { age: 35, gender: 'Female', ethnicity: 'Caucasian', facialExpression: 'Soft smile' },
                cameraShot: 'close-up framing focused on face and upper torso' as any
            },
            expectedKeywords: ['close-up framing', 'face and upper torso'],
        },
        {
            name: 'Centered Composition',
            config: {
                personDetails: { age: 35, gender: 'Female', ethnicity: 'Caucasian', facialExpression: 'Soft smile' },
                perspective: 'centered symmetrical composition, subject in middle of frame'
            },
            expectedKeywords: ['centered symmetrical composition', 'subject in middle of frame'],
        },
        {
            name: 'Rule of Thirds',
            config: {
                personDetails: { age: 35, gender: 'Female', ethnicity: 'Caucasian', facialExpression: 'Soft smile' },
                perspective: 'rule-of-thirds composition with subject off-center for visual balance'
            },
            expectedKeywords: ['rule-of-thirds composition', 'subject off-center', 'visual balance'],
        },
    ],

    // ========== LIGHTING & TIME ==========
    'LIGHTING': [
        {
            name: 'Morning',
            config: {
                personDetails: { age: 35, gender: 'Female', ethnicity: 'Caucasian', facialExpression: 'Soft smile' },
                lighting: 'soft early morning natural light, fresh atmosphere, cool tones'
            },
            expectedKeywords: ['soft early morning natural light', 'fresh atmosphere', 'cool tones'],
        },
        {
            name: 'Golden Hour',
            config: {
                personDetails: { age: 35, gender: 'Female', ethnicity: 'Caucasian', facialExpression: 'Soft smile' },
                lighting: 'golden hour sunlight with warm orange-amber glow, long soft shadows'
            },
            expectedKeywords: ['golden hour sunlight', 'warm orange-amber glow', 'long soft shadows'],
        },
        {
            name: 'Night',
            config: {
                personDetails: { age: 35, gender: 'Female', ethnicity: 'Caucasian', facialExpression: 'Soft smile' },
                lighting: 'low ambient nighttime lighting, indoor artificial warmth, deeper shadows'
            },
            expectedKeywords: ['low ambient nighttime lighting', 'indoor artificial warmth', 'deeper shadows'],
        },
    ],
};

// ============================================================================
// PROMPT GENERATION ENGINE
// ============================================================================

function generatePromptForScenario(scenario: TestScenario): string {
    // Deep merge personDetails
    const mergedPersonDetails = {
        ...BASE_CONFIG.personDetails,
        ...scenario.config.personDetails
    };

    const config = {
        ...BASE_CONFIG,
        ...scenario.config,
        personDetails: mergedPersonDetails
    } as PromptOptions;

    try {
        const result = promptEngine.build(config);
        return result;  // build() returns a string directly
    } catch (error) {
        return `ERROR: ${error instanceof Error ? error.message : String(error)}`;
    }
}

// ============================================================================
// KEYWORD VALIDATION
// ============================================================================

function validateKeywords(prompt: string, keywords: string[]): {
    found: string[];
    missing: string[];
    pass: boolean;
} {
    const found: string[] = [];
    const missing: string[] = [];

    for (const keyword of keywords) {
        if (prompt.toLowerCase().includes(keyword.toLowerCase())) {
            found.push(keyword);
        } else {
            missing.push(keyword);
        }
    }

    return {
        found,
        missing,
        pass: missing.length === 0,
    };
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateQAReport(): void {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  QA REPORT: LIFESTYLE UGC MODE PROMPT VALIDATION');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');

    let totalTests = 0;
    let passedTests = 0;

    for (const [category, scenarios] of Object.entries(QA_SCENARIOS)) {
        console.log(`\n${'─'.repeat(67)}`);
        console.log(`📋 CATEGORY: ${category}`);
        console.log(`${'─'.repeat(67)}\n`);

        for (const scenario of scenarios) {
            totalTests++;

            console.log(`\n🧪 TEST: ${scenario.name}`);
            console.log(`${'┄'.repeat(67)}`);

            // Generate prompt (suppress console.logs from promptEngine)
            const originalLog = console.log;
            console.log = () => { }; // Temporarily silence logs
            const prompt = generatePromptForScenario(scenario);
            console.log = originalLog; // Restore logs

            // Validate keywords
            const validation = validateKeywords(prompt, scenario.expectedKeywords);

            if (validation.pass) {
                passedTests++;
                console.log(`✅ PASS - All expected keywords found`);
            } else {
                console.log(`❌ FAIL - Missing keywords: ${validation.missing.join(', ')}`);
            }

            console.log(`\n📝 EXPECTED KEYWORDS:`);
            for (const keyword of scenario.expectedKeywords) {
                const found = validation.found.includes(keyword);
                console.log(`   ${found ? '✓' : '✗'} ${keyword}`);
            }

            console.log(`\n📄 FINAL PROMPT (first 800 chars):`);
            console.log(`${'┄'.repeat(67)}`);
            console.log(prompt.substring(0, 800));
            console.log(`${'┄'.repeat(67)}`);
        }
    }

    // Summary
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\nTotal Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

    if (passedTests === totalTests) {
        console.log('🎉 ALL TESTS PASSED - Semantic mapping is working correctly!\n');
    } else {
        console.log('⚠️  SOME TESTS FAILED - Review the semantic mapping logic.\n');
    }
}

// ============================================================================
// EXECUTION
// ============================================================================

generateQAReport();

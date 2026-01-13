/**
 * Negative Prompt Handler - Auto-generates based on sceneType
 */

import type { SceneType } from '../sceneTypes';
import { getNegativePromptAdditions } from '../sceneTypeRules';

const BASE_NEGATIVE = ['deformed hands', 'extra fingers', 'missing fingers', 'distorted limbs', 'extra limbs', 'mutated anatomy', 'mangled hands', 'blurry face', 'distorted face', 'asymmetric face', 'doll-like face', 'warped product', 'deformed bottle', 'incorrect label', 'fake reflections', 'warped text', 'blurry label', 'ai-generated label', 'incorrect logo', 'watermark', 'signature', 'caption', 'ai artifacts', 'floating objects', 'duplicate objects', 'cartoon style', '3d render'];

const SCENE_NEGATIVE: Record<SceneType, string[]> = {
    studio_packshot: ['hands', 'humans', 'person', 'environment', 'lifestyle', 'phone camera', 'amateur', 'cluttered', 'busy background'],
    editorial_product: ['hands', 'humans', 'person', 'phone camera', 'amateur', 'messy scene', 'cluttered', 'ugc style', 'selfie'],
    lifestyle_product: ['studio backdrop', 'white background', 'product isolation', 'commercial lighting', 'perfect symmetry', 'sterile'],
    ugc_phone: ['studio lighting', 'professional photography', 'perfect symmetry', 'ring light', 'beauty filter', 'skin smoothing', 'influencer pose', 'centered composition', 'HDR look', 'cinematic', 'editorial', 'commercial polish', 'fashion photography', 'retouching', 'depth of field', 'bokeh', 'background blur', 'portrait mode'],
    ecommerce_blank_space: ['environment', 'lifestyle', 'hands', 'humans', 'person', 'complex background', 'shadows on background', 'cluttered', 'busy composition', 'props', 'contextual elements'],
    bundle_kit: ['hands', 'humans', 'person', 'single product only', 'cluttered arrangement', 'overlapping products', 'messy layout']
};

export function buildNegativePrompt(sceneType: SceneType): string {
    const entries = [...BASE_NEGATIVE, ...(SCENE_NEGATIVE[sceneType] || [])];
    const ruleNegatives = getNegativePromptAdditions(sceneType);
    for (const neg of ruleNegatives) {
        if (!entries.includes(neg)) entries.push(neg);
    }
    return Array.from(new Set(entries)).join(', ');
}

export function getSceneNegativeAdditions(sceneType: SceneType): string[] {
    return SCENE_NEGATIVE[sceneType] || [];
}

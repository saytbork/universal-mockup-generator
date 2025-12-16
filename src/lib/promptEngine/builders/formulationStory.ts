/**
 * Formulation Story Builder
 * Inject HUMAN CREDIBILITY TRAITS for expert appearance
 * 
 * RULES:
 * - Expert is a CREDIBLE HUMAN, not an actor or model
 * - Respect age if provided (no rejuvenation for 70+)
 * - Respect UGC Real Mode if active (imperfections allowed)
 * - NO marketing language, ONLY physical observable traits
 * - NO titles in prompt (Dr., specialist, etc.)
 */

import type { PromptOptions, PromptBuilder } from '../types';

export class FormulationStoryBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        if (!options.formulationExpertEnabled) {
            return '';
        }

        console.log('[FORMULATION STORY] Building expert credibility injection');

        const traits: string[] = [];
        const age = options.personDetails?.age || 45;
        const isUGCActive = options.ugcRealModeActive;

        // ====================================================================
        // AGE-APPROPRIATE CREDIBILITY
        // ====================================================================
        if (age >= 70) {
            traits.push(`mature professional approximately ${age} years old`);
            traits.push('visible age-appropriate features');
            traits.push('natural age signs in face and hands');
            traits.push('distinguished experienced presence');
        } else if (age >= 50) {
            traits.push(`experienced professional in their ${Math.floor(age / 10) * 10}s`);
            traits.push('subtle age-appropriate features');
            traits.push('composed authoritative demeanor');
        } else {
            traits.push('professional expert appearance');
            traits.push('intelligent focused demeanor');
        }

        // ====================================================================
        // CREDIBLE EXPERT PRESENCE (NOT MODEL OR ACTOR)
        // ====================================================================
        traits.push('confident upright posture');
        traits.push('direct knowledgeable gaze');
        traits.push('calm composed expression');
        traits.push('authentic human presence with natural imperfections');

        // ====================================================================
        // UGC-AWARE IMPERFECTIONS
        // ====================================================================
        if (isUGCActive) {
            traits.push('realistic skin texture with visible pores');
            traits.push('natural minor imperfections appropriate for real person');
            traits.push('unretouched photoreal appearance');
        } else {
            traits.push('natural skin texture with subtle imperfections');
            traits.push('photoreal credible features');
        }

        // ====================================================================
        // LAB ENVIRONMENT (VISUAL CONTEXT)
        // ====================================================================
        const labStyle = options.formulationLabStyle;
        if (labStyle) {
            const labContextMap: Record<string, string> = {
                'Clean Lab': 'clean clinical lab environment with white surfaces and controlled lighting',
                'Moody Lab': 'moody atmospheric lab with dramatic directional lighting',
                'Warm Studio': 'warm studio environment with natural tones and soft lighting'
            };
            const labContext = labContextMap[labStyle] || 'professional laboratory environment';
            traits.push(`in ${labContext}`);
        }

        // ====================================================================
        // PROFESSIONAL ATTIRE (ROLE-SPECIFIC)
        // ====================================================================
        const expertRole = options.formulationExpertRole || 'Custom';

        const ROLE_ATTIRE_MAP: Record<string, string> = {
            'Respiratory Doctor': 'light blue medical scrubs, real hospital fabric, slightly worn, natural wrinkles',
            'Pulmonologist': 'light blue medical scrubs, real hospital fabric, slightly worn, natural wrinkles', // Alias
            'Clinical Researcher': 'off-white lab coat, slightly aged fabric, subtle creases, real clinical wear',
            'Herbal Formulator': 'olive green or beige lab coat, natural fabric texture, understated and practical',
            'Herbalist': 'olive green or beige lab coat, natural fabric texture, understated and practical', // Alias
            'Pharmacist': 'light gray-white lab coat, structured but worn, practical clinical look',
            'Nutritionist': 'soft sage green or pale blue scrubs, relaxed fit, everyday professional wear',
            'Dermatologist': 'light gray-blue scrubs, clean but not pristine, real clinic fabric',
            'Custom': 'neutral-toned professional lab attire, understated and realistic'
        };

        // Get specific attire or fall back to Custom/Generic
        const attireDescription = ROLE_ATTIRE_MAP[expertRole] || ROLE_ATTIRE_MAP['Custom'];

        traits.push(`wearing ${attireDescription}`);
        traits.push('clean professional grooming');

        let result = traits.join(', ') + '.';

        // INJECT EMBROIDERY DETAIL IF NAME EXISTS
        // Context: "a small embroidered name on the lab coat chest..." logic adapted to attire
        const expertName = options.formulationExpertName;
        if (expertName) {
            // Determine if it's scrubs or lab coat for the description
            // const isScrubs = attireDescription.includes('scrubs'); // Unused for now but kept concept

            result += `\nEXPERT DETAIL: The expert is wearing ${attireDescription}. On the LEFT SIDE OF THE IMAGE (viewer's left) ONLY, on the chest area, there is a single small embroidered name reading "${expertName}". The embroidery is stitched into the fabric. There is absolutely NO embroidery, text, badge, or marking on the opposite side. The embroidery must not be mirrored, duplicated, or symmetrically repeated.`;
        }

        console.log('[FORMULATION STORY] Injected:', result.substring(0, 150) + '...');

        return result;
    }
}


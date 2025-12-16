/**
 * Formulation Story Builder
 * PHASE 5: Inject HUMAN TRAITS ONLY
 * 
 * Rules:
 * - NO titles (e.g., "Dr.", "formulation specialist")
 * - NO narrative (e.g., "Expert-led narrative", "focused on trust")
 * - NO UGC language
 * - ONLY human visual traits for photoreal expert appearance
 */

import type { PromptOptions, PromptBuilder } from '../types';

export class FormulationStoryBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        if (!options.formulationExpertEnabled) {
            return '';
        }

        console.log('[FORMULATION STORY] Building human traits injection');

        const traits: string[] = [];

        // HUMAN TRAITS ONLY - Visual appearance for photoreal expert

        // Credible expert presence
        traits.push('Mature professional appearance');
        traits.push('confident posture');
        traits.push('intelligent demeanor');

        // Calm, confident demeanor
        traits.push('calm facial expression');
        traits.push('composed body language');
        traits.push('professional poise');

        // Approachable gaze
        traits.push('direct eye contact');
        traits.push('warm approachable gaze');
        traits.push('friendly presence');

        // Photoreal human characteristics
        traits.push('natural skin texture with subtle imperfections');
        traits.push('authentic human presence');
        traits.push('photoreal features');

        // Lab environment integration (visual only)
        const labStyle = options.formulationLabStyle;
        if (labStyle) {
            const labContextMap: Record<string, string> = {
                'Clean Lab': 'clean clinical lab setting with white surfaces',
                'Moody Lab': 'moody atmospheric lab with dramatic lighting',
                'Warm Studio': 'warm studio environment with natural tones'
            };
            const labContext = labContextMap[labStyle] || 'professional lab environment';
            traits.push(`in ${labContext}`);
        }

        // Professional attire (visual trait, not title)
        traits.push('wearing professional lab coat');
        traits.push('clean professional styling');

        const result = traits.join(', ') + '.';

        console.log('[FORMULATION STORY] Injected traits:', result);

        return result;
    }
}

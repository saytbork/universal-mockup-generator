import type { PromptOptions } from './types';

export class PromptSanitizer {
    private bannedAdjectives = [
        'premium',
        'luxury',
        'high-end',
        'brand-safe',
        'campaign',
        'commercial-ready',
        'lifestyle',
        'cinematic',
        'expensive',
        'deluxe'
    ];

    sanitize(prompt: string): string {
        let sanitized = prompt;
        this.bannedAdjectives.forEach(word => {
            // Remove word with boundaries, case insensitive
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            sanitized = sanitized.replace(regex, '');
        });
        // Cleanup double spaces
        return sanitized.replace(/\s+/g, ' ').trim();
    }

    assertIntegrity(prompt: string, options: PromptOptions): void {
        if (options.contentStyle !== 'product') return;

        // 1. Structure Check
        if (!prompt.includes('SCENE STRUCTURE:')) {
            throw new Error('Integrity Check Failed: Missing Scene Structure in Product Mode.');
        }

        // 2. Material Check
        if (!prompt.includes('MATERIAL PHYSICS:')) {
            throw new Error('Integrity Check Failed: Missing Material Definition in Product Mode.');
        }

        // 3. Scale Check
        if (!prompt.includes('SCALE RULE:')) {
            throw new Error('Integrity Check Failed: Missing Scale Rule in Product Mode.');
        }

        // 4. Visual Grammar Check (Semantics)
        if (!prompt.includes('VISUAL GRAMMAR LAYER:')) {
            throw new Error('Integrity Check Failed: Missing Visual Grammar Layer in Product Mode.');
        }
    }
}

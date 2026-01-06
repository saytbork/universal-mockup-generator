/**
 * Creativity Handler - Style modulator (no new elements)
 */

import type { CreativityConfig, SceneType } from '../sceneTypes';
import { getSceneTypeRules } from '../sceneTypeRules';

export interface CreativityResult {
    section: string;
    modifiers: string[];
}

export function buildCreativitySection(creativity: CreativityConfig, sceneType: SceneType): CreativityResult {
    const rules = getSceneTypeRules(sceneType);
    const modifiers: string[] = [];

    if (!rules.allowsAdvancedCreativity && creativity.level > 3) {
        return { section: 'CREATIVE MODULATION: Minimal. Authentic representation only.', modifiers: ['minimal', 'authentic'] };
    }

    if (creativity.level <= 3) {
        modifiers.push('subtle enhancements only', 'maintain realism');
        return { section: 'CREATIVE MODULATION: Subtle enhancements only, maintaining realism.', modifiers };
    }

    if (creativity.level <= 6) {
        if (creativity.theme) modifiers.push(`${creativity.theme} mood`);
        if (creativity.paletteSource) modifiers.push(`palette influenced by ${creativity.paletteSource}`);
        modifiers.push('enhanced visual style');
        const themePart = creativity.theme ? `${creativity.theme} mood, ` : '';
        const palettePart = creativity.paletteSource ? `palette from ${creativity.paletteSource}, ` : '';
        return { section: `CREATIVE MODULATION: ${themePart}${palettePart}enhanced visual style. No new elements.`, modifiers };
    }

    modifiers.push('strong stylistic interpretation');
    if (creativity.theme) modifiers.push(`${creativity.theme} aesthetic`);
    if (creativity.paletteSource) modifiers.push(`${creativity.paletteSource}-driven palette`);
    if (creativity.propDensity) modifiers.push(`${creativity.propDensity} prop presence`);

    const parts: string[] = ['CREATIVE MODULATION:'];
    if (creativity.theme) parts.push(`${creativity.theme} aesthetic.`);
    if (creativity.paletteSource) parts.push(`Color palette: ${creativity.paletteSource}.`);
    if (creativity.propDensity) parts.push(`Prop density: ${creativity.propDensity}.`);
    parts.push('Stylistic interpretation allowed. No invented objects or people.');

    return { section: parts.join(' '), modifiers };
}

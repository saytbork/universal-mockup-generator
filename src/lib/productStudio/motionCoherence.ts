import type { ProductDefinition, ProductStateMotion } from './types';

export function applyCanonicalPhysicalForMotion(
    definition: ProductDefinition,
    motion: ProductStateMotion
): ProductDefinition {
    const physical = definition.physical;
    // No-op for most types; only correct sub-states that can directly contradict motion.
    if (physical.kind === 'drops') {
        const nextDropperState = (() => {
            if (motion === 'static') return 'closed';
            if (motion === 'dispensed') return 'drop-suspended';
            // opened/spilled → open but resting; pouring/falling are coerced elsewhere by allowed motions
            return 'open-resting';
        })();
        if (physical.v.dropperState === nextDropperState) return definition;
        return {
            ...definition,
            physical: { kind: 'drops', v: { ...physical.v, dropperState: nextDropperState } },
        };
    }

    if (physical.kind === 'powder') {
        const nextPresentation = (() => {
            if (motion === 'opened' || motion === 'pouring') return 'in-container-rim';
            if (motion === 'spilled') return 'loose-pile';
            if (motion === 'dispensed') return 'in-scoop';
            // static/falling → keep powder "contained intent" by not forcing an open-container cue.
            return 'in-scoop';
        })();
        if (physical.v.presentation === nextPresentation) return definition;
        return {
            ...definition,
            physical: { kind: 'powder', v: { ...physical.v, presentation: nextPresentation } },
        };
    }

    return definition;
}


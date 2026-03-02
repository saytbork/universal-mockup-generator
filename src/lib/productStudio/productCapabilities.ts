/**
 * PRODUCT CAPABILITIES — Unified behavior validation layer.
 *
 * Maps PhysicalFormFactor → allowed PhysicalPresence, ProductState,
 * and ProductInteraction values.
 *
 * Used to:
 *  1. Validate UI selections (auto-correct incoherent combos)
 *  2. Inject INTERACTION_CONSTRAINT / NO_HANDS_RULE into the prompt
 *  3. Drive capability-aware UI chips (enabled/disabled state)
 *
 * DO NOT modify PHYSICS_RULES here — it already exists in atmosphereResolver.ts.
 * DO NOT replace the existing interaction / stateMotion / placement types.
 */

import type {
    PhysicalFormFactor,
    PhysicalPresence,
    ProductState,
    ProductInteraction,
} from './types';

// ============================================================================
// CAPABILITY DEFINITION
// ============================================================================

export type FormFactorCapabilities = {
    /** Human-readable label for UI display */
    label: string;
    /** Short physical descriptor injected into the prompt when this form factor is active */
    promptDescriptor: string;
    /** Allowed presence modes for this form factor */
    allowedPresence: PhysicalPresence[];
    /** Default presence when no valid selection exists */
    defaultPresence: PhysicalPresence;
    /** Allowed product states for this form factor */
    allowedStates: ProductState[];
    /** Default state when no valid selection exists */
    defaultState: ProductState;
    /** Allowed interactions for this form factor */
    allowedInteractions: ProductInteraction[];
    /** Default interaction when no valid selection exists */
    defaultInteraction: ProductInteraction;
    /** Whether a pouring/liquid action is physically plausible */
    canPour: boolean;
    /** Whether a dropper-tip action (drop-action) is physically plausible */
    canDrop: boolean;
};

// ============================================================================
// CAPABILITIES MAP
// ============================================================================

export const PRODUCT_CAPABILITIES: Record<PhysicalFormFactor, FormFactorCapabilities> = {
    bottle: {
        label: 'Bottle',
        promptDescriptor: 'rigid cylindrical bottle with screw or press cap',
        allowedPresence: ['surface', 'held', 'poured'],
        defaultPresence: 'surface',
        allowedStates: ['static', 'opened', 'dispensed'],
        defaultState: 'static',
        allowedInteractions: ['none', 'holding', 'two-hand-hold', 'presenting'],
        defaultInteraction: 'none',
        canPour: true,
        canDrop: false,
    },
    jar: {
        label: 'Jar',
        promptDescriptor: 'wide-mouth jar with twist lid',
        allowedPresence: ['surface', 'held'],
        defaultPresence: 'surface',
        allowedStates: ['static', 'opened'],
        defaultState: 'static',
        allowedInteractions: ['none', 'holding', 'two-hand-hold', 'presenting', 'applying'],
        defaultInteraction: 'none',
        canPour: false,
        canDrop: false,
    },
    pouch: {
        label: 'Pouch / Sachet',
        promptDescriptor: 'flexible stand-up pouch or flat sachet',
        allowedPresence: ['surface', 'held'],
        defaultPresence: 'surface',
        allowedStates: ['static', 'opened', 'dispensed'],
        defaultState: 'static',
        allowedInteractions: ['none', 'holding', 'presenting'],
        defaultInteraction: 'none',
        canPour: false,
        canDrop: false,
    },
    box: {
        label: 'Box / Carton',
        promptDescriptor: 'rectangular cardboard or rigid box packaging',
        allowedPresence: ['surface', 'held'],
        defaultPresence: 'surface',
        allowedStates: ['static', 'opened'],
        defaultState: 'static',
        allowedInteractions: ['none', 'holding', 'two-hand-hold', 'presenting'],
        defaultInteraction: 'none',
        canPour: false,
        canDrop: false,
    },
    dropper: {
        label: 'Dropper / Serum',
        promptDescriptor: 'glass dropper bottle with rubber pipette bulb',
        allowedPresence: ['surface', 'held', 'drop-action'],
        defaultPresence: 'surface',
        allowedStates: ['static', 'opened', 'dispensed'],
        defaultState: 'static',
        allowedInteractions: ['none', 'holding', 'presenting', 'applying'],
        defaultInteraction: 'none',
        canPour: false,
        canDrop: true,
    },
    can: {
        label: 'Can / Tin',
        promptDescriptor: 'aluminum or steel cylindrical can with pull-tab or twist top',
        allowedPresence: ['surface', 'held', 'poured'],
        defaultPresence: 'surface',
        allowedStates: ['static', 'opened', 'dispensed'],
        defaultState: 'static',
        allowedInteractions: ['none', 'holding', 'two-hand-hold', 'presenting'],
        defaultInteraction: 'none',
        canPour: true,
        canDrop: false,
    },
    tube: {
        label: 'Tube',
        promptDescriptor: 'squeezable plastic or metal tube with flip or screw cap',
        allowedPresence: ['surface', 'held'],
        defaultPresence: 'surface',
        allowedStates: ['static', 'opened', 'dispensed'],
        defaultState: 'static',
        allowedInteractions: ['none', 'holding', 'presenting', 'applying'],
        defaultInteraction: 'none',
        canPour: false,
        canDrop: false,
    },
    pump: {
        label: 'Pump Dispenser',
        promptDescriptor: 'pump-top dispenser bottle with actuator head',
        allowedPresence: ['surface', 'held'],
        defaultPresence: 'surface',
        allowedStates: ['static', 'dispensed'],
        defaultState: 'static',
        allowedInteractions: ['none', 'holding', 'presenting', 'applying'],
        defaultInteraction: 'none',
        canPour: false,
        canDrop: false,
    },
    spray: {
        label: 'Spray / Atomizer',
        promptDescriptor: 'spray bottle or perfume atomizer with mist actuator',
        allowedPresence: ['surface', 'held'],
        defaultPresence: 'surface',
        allowedStates: ['static', 'dispensed'],
        defaultState: 'static',
        allowedInteractions: ['none', 'holding', 'presenting', 'applying'],
        defaultInteraction: 'none',
        canPour: false,
        canDrop: false,
    },
    stick: {
        label: 'Stick / Twist-up',
        promptDescriptor: 'cylindrical twist-up stick format (lip balm, deodorant, sunscreen)',
        allowedPresence: ['surface', 'held'],
        defaultPresence: 'surface',
        allowedStates: ['static', 'opened'],
        defaultState: 'static',
        allowedInteractions: ['none', 'holding', 'presenting', 'applying'],
        defaultInteraction: 'none',
        canPour: false,
        canDrop: false,
    },
};

// ============================================================================
// RESOLVER FUNCTIONS
// ============================================================================

/**
 * Returns allowed presence modes for the given form factor.
 * Falls back to ['surface'] if the form factor is unknown.
 */
export function resolveAllowedPresence(
    formFactor: PhysicalFormFactor
): PhysicalPresence[] {
    return PRODUCT_CAPABILITIES[formFactor]?.allowedPresence ?? ['surface'];
}

/**
 * Returns allowed product states for the given form factor.
 * Falls back to ['static'] if the form factor is unknown.
 */
export function resolveAllowedState(
    formFactor: PhysicalFormFactor
): ProductState[] {
    return PRODUCT_CAPABILITIES[formFactor]?.allowedStates ?? ['static'];
}

/**
 * Returns allowed interactions for the given form factor.
 * Falls back to ['none'] if the form factor is unknown.
 */
export function resolveAllowedInteraction(
    formFactor: PhysicalFormFactor
): ProductInteraction[] {
    return PRODUCT_CAPABILITIES[formFactor]?.allowedInteractions ?? ['none'];
}

/**
 * Validates and auto-corrects a (presence, state, interaction) triplet
 * against the capabilities of the given form factor.
 *
 * Returns the corrected triplet + a flag indicating whether any correction was made.
 */
export function validateAndCorrectCapabilities(
    formFactor: PhysicalFormFactor,
    requested: {
        presence: PhysicalPresence;
        state: ProductState;
        interaction: ProductInteraction;
    }
): {
    presence: PhysicalPresence;
    state: ProductState;
    interaction: ProductInteraction;
    corrected: boolean;
} {
    const caps = PRODUCT_CAPABILITIES[formFactor];
    if (!caps) {
        return { ...requested, corrected: false };
    }

    let corrected = false;

    const presence: PhysicalPresence = caps.allowedPresence.includes(requested.presence)
        ? requested.presence
        : caps.defaultPresence;
    if (presence !== requested.presence) corrected = true;

    const state: ProductState = caps.allowedStates.includes(requested.state)
        ? requested.state
        : caps.defaultState;
    if (state !== requested.state) corrected = true;

    const interaction: ProductInteraction = caps.allowedInteractions.includes(requested.interaction)
        ? requested.interaction
        : caps.defaultInteraction;
    if (interaction !== requested.interaction) corrected = true;

    // Coherence rule: poured/drop-action presence requires non-static state
    if ((presence === 'poured' || presence === 'drop-action') && state === 'static') {
        // coerce to dispensed if allowed, otherwise opened
        const fallbackState: ProductState = caps.allowedStates.includes('dispensed')
            ? 'dispensed'
            : caps.allowedStates.includes('opened')
                ? 'opened'
                : caps.defaultState;
        if (fallbackState !== state) corrected = true;
        return { presence, state: fallbackState, interaction, corrected };
    }

    return { presence, state, interaction, corrected };
}

/**
 * Builds the hands constraint or no-hands rule prompt fragment
 * based on the current productInteraction value.
 *
 * Rules:
 * - Uses no forbidden API terms ("human", "person", "body")
 * - Safe for all industry profiles
 * - Injected AFTER sanitizePromptForIndustry in promptRouter.ts
 * - DO NOT inject PHYSICS_RULES here — it already lives in atmosphereResolver.ts.
 */
export function buildInteractionConstraintFragment(
    productInteraction?: ProductInteraction
): string {
    if (!productInteraction || productInteraction === 'none') {
        return 'NO_HANDS: No hands. No fingers. No skin. No shadows implying hands or arms. No limbs of any kind in the frame.';
    }
    return (
        'HANDS_CONSTRAINT: One single hand interaction only. ' +
        'No additional hands. No extra limbs. No extra arms. ' +
        'Hands must be natural and relaxed — no stiff fingers, no theatrical gestures. ' +
        'Product is the visual hero. Hands must never overpower the product.'
    );
}

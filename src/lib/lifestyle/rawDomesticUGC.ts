/**
 * RAW DOMESTIC UGC
 * 
 * Simulates careless front-camera capture at home.
 * All professional controls are locked automatically.
 * 
 * BEHAVIOR:
 * - Opening accordion activates mode (no extra toggle needed)
 * - Depth is FLAT (locked)
 * - No background separation
 * - No cinematic blur
 * - Smartphone optics only
 */

// ============================================================================
// TYPES
// ============================================================================

export type RawUGCStyle =
    | 'messy_counter'
    | 'quick_mirror'
    | 'bed_scroll'
    | 'bathroom_shelf';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface RawUGCConfig {
    id: RawUGCStyle;
    title: string;
    description: string;
}

export const RAW_UGC_STYLES: Record<RawUGCStyle, RawUGCConfig> = {
    messy_counter: {
        id: 'messy_counter',
        title: 'Messy Counter',
        description: 'Product on cluttered kitchen or bathroom counter.'
    },
    quick_mirror: {
        id: 'quick_mirror',
        title: 'Quick Mirror',
        description: 'Mirror selfie with product, casual grip.'
    },
    bed_scroll: {
        id: 'bed_scroll',
        title: 'Bed Scroll',
        description: 'Product on bedding, phone-scroll moment.'
    },
    bathroom_shelf: {
        id: 'bathroom_shelf',
        title: 'Bathroom Shelf',
        description: 'Product among other items on bathroom shelf.'
    }
};

// ============================================================================
// UGC DEPTH RULES (CRITICAL)
// ============================================================================

export interface UGCDepthRules {
    mode: 'flat';
    backgroundSeparation: false;
    bokeh: false;
    selectiveFocus: false;
    tooltip: string;
}

export const UGC_DEPTH_RULES: UGCDepthRules = {
    mode: 'flat',
    backgroundSeparation: false,
    bokeh: false,
    selectiveFocus: false,
    tooltip: 'UGC uses a single-plane image with no background separation. Any cinematic depth or blur would break authenticity.'
};

// ============================================================================
// LOCKED CONTROLS IN UGC MODE
// ============================================================================

export const UGC_LOCKED_CONTROLS = {
    depth: 'flat',
    camera: 'smartphone_front',
    lighting: 'ambient_only',
    framing: 'imperfect',
    composition: 'casual'
};

export const UGC_LOCKED_TOOLTIP =
    'Raw Domestic UGC ignores polish, lighting control, and staging by design.';

// ============================================================================
// PROMPT INJECTION
// ============================================================================

export function injectUGCDepthRules(): string {
    return [
        'DEPTH: Single-plane image. Flat depth. No background separation.',
        'CAMERA: Smartphone front or rear camera. No DSLR. No cinema lens.',
        'FOCUS: Uniform or slightly imperfect. No selective focus. No bokeh.',
        'LIGHTING: Ambient only. No professional lighting setup.',
        'FRAMING: Imperfect, casual. Not composed. Not staged.',
        'RULE: If it looks shot with a pro camera, it is NOT UGC.'
    ].join('\n');
}

// ============================================================================
// UI HELPERS
// ============================================================================

export const RAW_UGC_INTRO_TEXT =
    'This mode simulates careless front-camera capture at home. All professional controls are locked automatically.';

export function getRawUGCStyles(): RawUGCConfig[] {
    return Object.values(RAW_UGC_STYLES);
}

/**
 * When accordion opens, this should be called to activate mode
 */
export function activateRawUGCMode(): {
    active: true;
    lockedControls: typeof UGC_LOCKED_CONTROLS;
    depthRules: UGCDepthRules;
} {
    return {
        active: true,
        lockedControls: UGC_LOCKED_CONTROLS,
        depthRules: UGC_DEPTH_RULES
    };
}

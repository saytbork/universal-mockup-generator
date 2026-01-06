/**
 * UX CONFIGURATION — PERFECT MOCKUP
 * 
 * Defines block visibility, order, copy, and tooltips per context.
 * Creativity is the dominant, always-visible core.
 */

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export type UIContext =
    | 'product_studio'
    | 'lifestyle'
    | 'raw_ugc';

// ============================================================================
// BLOCK DEFINITIONS
// ============================================================================

export type BlockId =
    | 'creativity'
    | 'commercial_composition'
    | 'lifestyle_intent'
    | 'person'
    | 'interaction'
    | 'environment'
    | 'lighting'
    | 'camera'
    | 'output';

export interface BlockConfig {
    id: BlockId;
    title: string;
    visible: boolean;
    dominant?: boolean;
    locked?: boolean;
    tooltip: string;
}

// ============================================================================
// PRODUCT STUDIO BLOCKS
// ============================================================================

export const PRODUCT_STUDIO_BLOCKS: BlockConfig[] = [
    {
        id: 'creativity',
        title: 'Art Direction',
        visible: true,
        dominant: true,
        tooltip: 'Defines the art direction, composition logic, and visual intelligence of the image. This is the creative brain.'
    },
    {
        id: 'commercial_composition',
        title: 'Commercial Composition',
        visible: true,
        tooltip: 'Defines how many products appear and which one leads the scene.'
    },
    {
        id: 'environment',
        title: 'Environment',
        visible: true,
        tooltip: 'Studio, abstract, or editorial backgrounds only. No domestic settings in Product Studio.'
    },
    {
        id: 'lighting',
        title: 'Lighting',
        visible: true,
        tooltip: 'Lighting simulates realism. It does not increase quality or polish.'
    },
    {
        id: 'camera',
        title: 'Camera & Framing',
        visible: true,
        tooltip: 'Professional camera options. Defines perspective and focal length.'
    },
    {
        id: 'output',
        title: 'Output Format',
        visible: true,
        tooltip: 'Aspect ratio and resolution for final image.'
    }
];

// Blocks NOT visible in Product Studio
export const PRODUCT_STUDIO_HIDDEN = [
    'lifestyle_intent',
    'person',
    'interaction'
];

// ============================================================================
// LIFESTYLE BLOCKS
// ============================================================================

export const LIFESTYLE_BLOCKS: BlockConfig[] = [
    {
        id: 'lifestyle_intent',
        title: 'Lifestyle Intent',
        visible: true,
        dominant: true,
        tooltip: 'Defines how realistic or cinematic the scene is, and whether art direction is collaborative or system-led.'
    },
    {
        id: 'creativity',
        title: 'Art Direction',
        visible: true, // Conditional - hidden for POV
        tooltip: 'Art direction for the scene. Blocked for POV intent to prioritize realism.'
    },
    {
        id: 'commercial_composition',
        title: 'Commercial Composition',
        visible: true,
        tooltip: 'Defines how many products appear and which one leads the scene.'
    },
    {
        id: 'person',
        title: 'Person & Hands',
        visible: true,
        tooltip: 'Hands must look natural and secondary. If they attract attention, the image fails.'
    },
    {
        id: 'interaction',
        title: 'Product Interaction',
        visible: true,
        tooltip: 'How the person interacts with the product. Contextual uses placed, Narrative uses active.'
    },
    {
        id: 'environment',
        title: 'Environment',
        visible: true,
        tooltip: 'Real-world domestic or outdoor settings for lifestyle scenes.'
    },
    {
        id: 'camera',
        title: 'Camera & Framing',
        visible: true,
        tooltip: 'Camera options adapt based on Lifestyle Intent.'
    },
    {
        id: 'output',
        title: 'Output Format',
        visible: true,
        tooltip: 'Aspect ratio and resolution for final image.'
    }
];

// ============================================================================
// RAW DOMESTIC UGC BLOCKS
// ============================================================================

export const RAW_UGC_BLOCKS: BlockConfig[] = [
    {
        id: 'interaction',
        title: 'UGC Style',
        visible: true,
        dominant: true,
        tooltip: 'Select the casual capture moment. All professional controls are locked.'
    },
    {
        id: 'output',
        title: 'Output Format',
        visible: true,
        tooltip: 'Aspect ratio for UGC. 9:16 recommended for Stories/Reels.'
    }
];

// These are HIDDEN and LOCKED in UGC
export const RAW_UGC_LOCKED = [
    'creativity',
    'commercial_composition',
    'person',
    'environment',
    'lighting',
    'camera'
];

// ============================================================================
// MANDATORY COPY
// ============================================================================

export const MANDATORY_COPY = {
    product_studio: {
        creativity_header: 'Art Direction',
        creativity_subtitle: 'The creative brain of your image'
    },

    lifestyle: {
        intent_footer: 'Lifestyle intent defines how realistic or cinematic the scene is, and whether art direction is collaborative or system-led.',
        creativity_blocked: 'This intent prioritizes realism over art direction.'
    },

    raw_ugc: {
        header: 'Raw Domestic UGC',
        intro: 'This mode intentionally removes professional depth, lighting, and composition to simulate real creator footage. If it looks "too good", it\'s not UGC.',
        depth_locked: 'UGC uses flat depth to avoid professional camera cues.'
    }
};

// ============================================================================
// CORRECTIVE TOOLTIPS (FULL SET)
// ============================================================================

export const ALL_TOOLTIPS = {
    // Creativity
    creativity_core: 'Defines the art direction, composition logic, and visual intelligence of the image. This is the creative brain.',
    creativity_blocked_ugc: 'UGC does not use art direction. If it looks intentional, it\'s not UGC.',
    creativity_blocked_pov: 'POV prioritizes first-person realism. Art direction is disabled.',

    // Commercial Composition
    composition_hero: 'Optimized for PDP hero images and ads.',
    composition_duo: 'Designed for bundles and cross-sells.',
    composition_routine: 'Multi-step systems with enforced visual hierarchy.',

    // Hands
    hands_forbidden: 'Studio branding does not include hands. Product is sole hero.',
    hands_natural: 'Hands must look natural and secondary. If they attract attention, the image fails.',
    hands_ugc: 'One hand only. Real imperfections mandatory. No plastic hands.',

    // Environment
    environment_studio: 'Studio, abstract, or editorial backgrounds only.',
    environment_lifestyle: 'Real-world domestic or outdoor settings.',

    // Lighting
    lighting_core: 'Lighting simulates realism. It does not increase quality or polish.',

    // Camera
    camera_professional: 'Professional camera options. Defines perspective and focal length.',
    camera_smartphone: 'Smartphone only. Imperfect framing for authenticity.',

    // UGC
    ugc_depth: 'UGC uses flat depth. Any background separation breaks authenticity.',
    ugc_quality: 'If it looks professional, it\'s not UGC.',

    // Disabled states
    disabled_protected: 'This option is restricted to protect realism.',
    disabled_context: 'Not available in this context.'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getBlocksForContext(context: UIContext): BlockConfig[] {
    switch (context) {
        case 'product_studio':
            return PRODUCT_STUDIO_BLOCKS;
        case 'lifestyle':
            return LIFESTYLE_BLOCKS;
        case 'raw_ugc':
            return RAW_UGC_BLOCKS;
    }
}

export function isBlockVisible(context: UIContext, blockId: BlockId): boolean {
    const blocks = getBlocksForContext(context);
    const block = blocks.find(b => b.id === blockId);
    return block?.visible ?? false;
}

export function isBlockLocked(context: UIContext, blockId: BlockId): boolean {
    if (context === 'raw_ugc') {
        return RAW_UGC_LOCKED.includes(blockId);
    }
    return false;
}

export function getTooltip(key: keyof typeof ALL_TOOLTIPS): string {
    return ALL_TOOLTIPS[key];
}

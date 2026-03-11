import { EnvironmentPhotoModeSchema, VisualStyle } from './types';

export type LegacyVisualStyleSchemaMode = VisualStyle | 'UGC Premium Simulation';

export const VISUAL_STYLE_SCHEMAS: Partial<Record<LegacyVisualStyleSchemaMode, EnvironmentPhotoModeSchema>> = {
    'Clinical Lab Counter': {
        id: 'clinical-lab-counter',
        label: 'Clinical Lab Counter',
        scope: 'studio',
        description: 'Clinical laboratory-inspired advertising environment.',
        basePrompt: 'clinical laboratory-inspired advertising environment, sterile counter surface with subtle scientific cues, trust-driven clean precise composition',
        subOptions: [
            { key: 'surfaceMaterial', label: 'Surface Material', values: ['Stainless steel', 'White lab', 'Neutral lab'] },
            { key: 'propDensity', label: 'Prop Density', values: ['Minimal', 'Standard'] },
            { key: 'lightingTemperature', label: 'Lighting Temperature', values: ['Cool', 'Neutral'] },
        ],
        constraints: [
            'Lab equipment must be subtle and clean',
            'No dramatic lighting',
            'Authentic scientific feel',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Dark Premium Studio': {
        id: 'dark-premium-studio',
        label: 'Dark Premium Studio',
        scope: 'studio',
        description: 'Low-key premium advertising studio with controlled highlights.',
        basePrompt: 'low-key premium advertising studio with dark background and controlled highlights, product edges remain clearly defined',
        subOptions: [
            { key: 'darknessLevel', label: 'Darkness Level', values: ['Deep', 'Balanced'] },
            { key: 'rimLightIntensity', label: 'Rim Light Intensity', values: ['Subtle', 'Strong'] },
            { key: 'backgroundMaterial', label: 'Background Material', values: ['Matte', 'Stone', 'Velvet'] },
        ],
        constraints: [
            'No crushed blacks',
            'Edges must remain readable',
            'Label contrast must be preserved',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Monochrome Brand': {
        id: 'monochrome-brand-world',
        label: 'Monochrome Brand',
        scope: 'studio',
        description: 'Single-color brand advertising environment.',
        basePrompt: 'single-color brand world advertising composition, all elements remain within one color family, graphic minimal brand-driven abstraction',
        subOptions: [
            { key: 'monoColor', label: 'Mono Color', values: ['Brand color', 'Neutral', 'Custom'] },
            { key: 'gradientPresence', label: 'Gradient Presence', values: ['None', 'Subtle'] },
            { key: 'contrastLevel', label: 'Contrast Level', values: ['Soft', 'High'] },
        ],
        constraints: [
            'Only one color family allowed',
            'No texture noise',
            'Product silhouette must stay dominant',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Tech Clean Studio': {
        id: 'tech-clean-studio',
        label: 'Tech Clean Studio',
        scope: 'studio',
        description: 'Technology-driven advertising studio with precision surfaces.',
        basePrompt: 'technology-driven advertising studio, precision surfaces, clean geometry, cool neutral tones, modern minimal performance-oriented atmosphere',
        subOptions: [
            { key: 'backgroundColor', label: 'Background Color', values: ['White', 'Light gray', 'Cool neutral'] },
            { key: 'precisionLevel', label: 'Precision Level', values: ['High', 'Extreme'] },
            { key: 'shadowPresence', label: 'Shadow Presence', values: ['Minimal', 'Soft'] },
        ],
        constraints: [
            'No casual props',
            'No shadow noise',
            'Edges must be extremely sharp',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Minimal Bathroom Vanity': {
        id: 'minimal-bathroom-vanity',
        label: 'Minimal Bathroom Vanity',
        scope: 'studio',
        description: 'Minimal clean studio surface with rigid materials and controlled reflections.',
        basePrompt: 'minimal clean advertising studio surface, rigid materials like glass metal acrylic and stone, minimal elements, controlled reflections, product-first composition',
        subOptions: [
            { key: 'surfaceStyle', label: 'Surface Style', values: ['Modern', 'Minimal'] },
            { key: 'materialTone', label: 'Material Tone', values: ['Cool', 'Neutral'] },
            { key: 'lightingSource', label: 'Lighting Source', values: ['Soft studio', 'Neutral studio'] },
        ],
        constraints: [
            'No cluttered backgrounds',
            'No exaggerated reflections',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Brand Campaign': {
        id: 'brand-campaign-world',
        label: 'Brand Campaign',
        scope: 'studio',
        description: 'High-end brand campaign studio composition with architectural set design.',
        basePrompt: 'high-end brand campaign advertising studio, architectural composition with premium rigid materials, controlled set design, product remains the focal point',
        subOptions: [
            { key: 'architecturalScale', label: 'Architectural Scale', values: ['Intimate', 'Grand'] },
            { key: 'materialRichness', label: 'Material Richness', values: ['Refined', 'Opulent'] },
            { key: 'lightingDrama', label: 'Lighting Drama', values: ['Soft', 'Dramatic'] },
        ],
        constraints: [
            'No stock-photo look',
            'Consistent brand tone',
            'No clutter competing with product',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Soft Wellness Morning': {
        id: 'soft-wellness-morning',
        label: 'Soft Wellness Morning',
        scope: 'studio',
        description: 'Soft diffused studio lighting with clean rigid materials and product-first composition.',
        basePrompt: 'soft diffused advertising studio lighting, clean rigid materials, minimal set styling, product-first composition with controlled highlights',
        subOptions: [
            { key: 'warmthLevel', label: 'Warmth Level', values: ['Cool', 'Neutral', 'Warm'] },
            { key: 'lightDiffusion', label: 'Light Diffusion', values: ['Soft', 'Very soft'] },
            { key: 'colorPalette', label: 'Color Palette', values: ['Neutral', 'Pastel'] },
        ],
        constraints: [
            'No harsh light',
            'No saturated colors',
            'Soft shadows only',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Sunlit Stone Editorial': {
        id: 'sunlit-stone-editorial',
        label: 'Sunlit Stone Editorial',
        scope: 'studio',
        description: 'Sunlit architectural stone set with premium editorial contrast.',
        basePrompt: 'architectural stone blocks with sunlit editorial lighting, strong directional shadows, premium warm-neutral palette, clean product-first framing',
        subOptions: [
            { key: 'shadowLength', label: 'Shadow Length', values: ['Medium', 'Long'] },
            { key: 'stoneTone', label: 'Stone Tone', values: ['Warm beige', 'Neutral sand'] },
            { key: 'contrastLevel', label: 'Contrast Level', values: ['Balanced', 'High'] },
        ],
        constraints: [
            'Architectural blocks must remain clean and premium',
            'No cluttered props',
            'Label readability remains mandatory',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Golden Sunset Backlit': {
        id: 'golden-sunset-backlit',
        label: 'Golden Sunset Backlit',
        scope: 'environment',
        description: 'Golden backlit hero scene with controlled glow and premium silhouettes.',
        basePrompt: 'golden-hour backlit hero composition, warm sunset tonal range, controlled flare and edge glow, product remains readable and dominant',
        subOptions: [
            { key: 'glowStrength', label: 'Glow Strength', values: ['Soft', 'Balanced', 'Bold'] },
            { key: 'horizonType', label: 'Horizon Type', values: ['Abstract', 'Natural'] },
            { key: 'shadowDensity', label: 'Shadow Density', values: ['Soft', 'Balanced'] },
        ],
        constraints: [
            'No overblown highlights',
            'Product contour must stay crisp',
            'Label must remain readable',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Bathroom Daylight Clean': {
        id: 'bathroom-daylight-clean',
        label: 'Bathroom Daylight Clean',
        scope: 'environment',
        description: 'Clean bathroom daylight scene with premium everyday realism.',
        basePrompt: 'clean bathroom daylight composition, soft window light, premium minimal surfaces, realistic skincare setting with no clutter',
        subOptions: [
            { key: 'surfaceType', label: 'Surface Type', values: ['Ceramic', 'Stone', 'Marble'] },
            { key: 'lightSoftness', label: 'Light Softness', values: ['Soft', 'Very soft'] },
            { key: 'propDensity', label: 'Prop Density', values: ['None', 'Minimal'] },
        ],
        constraints: [
            'Bathroom setting must stay clean and believable',
            'No random decorative noise',
            'Product remains hero',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Sky Float Minimal': {
        id: 'sky-float-minimal',
        label: 'Sky Float Minimal',
        scope: 'environment',
        description: 'Minimal floating composition against a real open-sky atmosphere.',
        basePrompt: 'minimal floating product composition against a real open sky with natural atmospheric depth, subtle cloud variation, believable horizon haze, airy premium look, soft natural daylight and controlled product silhouette',
        subOptions: [
            { key: 'skyTone', label: 'Sky Tone', values: ['Light blue', 'Neutral blue'] },
            { key: 'floatStability', label: 'Float Stability', values: ['Stable', 'Slight dynamic'] },
            { key: 'edgeContrast', label: 'Edge Contrast', values: ['Soft', 'Balanced'] },
        ],
        constraints: [
            'Floating illusion must remain physically plausible',
            'Sky must read as real outdoor sky photography, never a flat studio backdrop',
            'Natural atmospheric gradient and depth are mandatory',
            'No chaotic background elements',
            'Label stays readable',
        ],
        requiredPlacement: 'air',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Wet Rock Ripples': {
        id: 'wet-rock-ripples',
        label: 'Wet Rock Ripples',
        scope: 'environment',
        description: 'Product grounded on wet stone with controlled water ripple energy.',
        basePrompt: 'wet stone surface with controlled shallow water ripples, premium reflective highlights, product grounded and physically coherent',
        subOptions: [
            { key: 'rippleIntensity', label: 'Ripple Intensity', values: ['Low', 'Balanced', 'High'] },
            { key: 'stoneTexture', label: 'Stone Texture', values: ['Smooth', 'Natural'] },
            { key: 'reflectionLevel', label: 'Reflection Level', values: ['Balanced', 'Glossy'] },
        ],
        constraints: [
            'Water physics must look realistic',
            'No messy splash chaos',
            'Product must stay cleanly readable',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Sand Palm Shadows': {
        id: 'sand-palm-shadows',
        label: 'Sand Palm Shadows',
        scope: 'environment',
        description: 'Sunlit sand scene with palm shadow patterns and clean composition.',
        basePrompt: 'sunlit real-beach sand composition with visible natural grain variation, micro-ridges, and subtle irregular footprints from wind shaping, soft palm shadow patterns, warm premium tones, grounded product placement and controlled negative space',
        subOptions: [
            { key: 'shadowPattern', label: 'Shadow Pattern', values: ['Soft palm', 'Defined palm'] },
            { key: 'sandTexture', label: 'Sand Texture', values: ['Fine', 'Natural'] },
            { key: 'warmthLevel', label: 'Warmth Level', values: ['Warm', 'Golden'] },
        ],
        constraints: [
            'Shadows must look natural and directional',
            'Sand must read as natural granular beach sand, not painted concrete or smooth studio floor',
            'Visible micro-texture and uneven grain depth are mandatory near contact zones',
            'No random tropical clutter',
            'Product remains hero and readable',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Botanical Water Garden': {
        id: 'botanical-water-garden',
        label: 'Botanical Water Garden',
        scope: 'environment',
        description: 'Natural botanical wet scene with controlled premium realism.',
        basePrompt: 'botanical wet environment with shallow water and subtle natural foliage context, premium realistic lighting, clean product focus',
        subOptions: [
            { key: 'foliageDensity', label: 'Foliage Density', values: ['Low', 'Balanced'] },
            { key: 'waterActivity', label: 'Water Activity', values: ['Still', 'Gentle ripples'] },
            { key: 'lightDirection', label: 'Light Direction', values: ['Side', 'Back-side'] },
        ],
        constraints: [
            'Botanical elements must remain secondary',
            'No heavy clutter around label zone',
            'Product remains dominant',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Warm Window Wood': {
        id: 'warm-window-wood',
        label: 'Warm Window Wood',
        scope: 'environment',
        description: 'Warm wooden window scene with natural sunlight realism.',
        basePrompt: 'warm wooden window environment, natural sunlight and soft interior shadows, realistic lifestyle-adjacent premium product scene',
        subOptions: [
            { key: 'woodTone', label: 'Wood Tone', values: ['Light oak', 'Warm walnut'] },
            { key: 'lightStrength', label: 'Light Strength', values: ['Soft', 'Balanced'] },
            { key: 'dustMood', label: 'Ambient Particles', values: ['None', 'Subtle'] },
        ],
        constraints: [
            'No messy room clutter',
            'Window light direction must be coherent',
            'Product remains crisp and readable',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Outdoor Energy Boost': {
        id: 'outdoor-energy-boost',
        label: 'Outdoor Energy Boost',
        scope: 'studio',
        description: 'Fresh, energetic studio lighting with crisp contrast and controlled set design.',
        basePrompt: 'fresh energetic advertising studio lighting, bright highlights, crisp contrast, dynamic framing, controlled set with clean rigid surfaces',
        subOptions: [
            { key: 'materialType', label: 'Material Type', values: ['Stone', 'Concrete', 'Acrylic', 'Metal'] },
            { key: 'energyMood', label: 'Energy Mood', values: ['Crisp', 'Bold', 'Active'] },
            { key: 'lightQuality', label: 'Light Quality', values: ['Bright', 'Directional', 'Diffuse'] },
            { key: 'backgroundBlurLevel', label: 'Background Blur Level', values: ['Low', 'Medium'] },
        ],
        constraints: [
            'No motion blur',
            'Product must remain sharp',
            'Crisp scale realism enforced',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Creator Premium Simulation': {
        id: 'ugc-premium-simulation',
        label: 'Creator Premium Simulation',
        scope: 'studio',
        description: 'Premium studio simulation with subtle realism and controlled imperfections (no UGC language).',
        basePrompt: 'premium studio simulation with subtle realism, controlled advertising studio, clean purpose-built studio surfaces, brand-safe polish, controlled imperfections with studio-grade clarity',
        subOptions: [
            { key: 'realismLevel', label: 'Realism Level', values: ['Subtle', 'Balanced'] },
            { key: 'imperfectionControl', label: 'Imperfection Control', values: ['Minimal', 'Controlled'] },
            { key: 'lightQuality', label: 'Light Quality', values: ['Neutral studio', 'Soft studio'] },
            { key: 'surfaceType', label: 'Surface Type', values: ['Abstract studio surface'] },
        ],
        constraints: [
            'Controlled imperfections only',
            'No personal context cues',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: [
            'none',
            'passive-presence',
            'cropped-hand',
            'supported-hold',
            'holding',
            'two-hand-hold',
            'presenting',
            'framed-presentation',
            'applying-opening',
            'capsule-display',
            'resting-interaction',
        ],
        allowsPersonPresence: true
    },
    'UGC Premium Simulation': {
        id: 'ugc-premium-simulation',
        label: 'Creator Premium Simulation',
        scope: 'studio',
        description: 'Premium studio simulation with subtle realism and controlled imperfections (no UGC language).',
        basePrompt: 'premium studio simulation with subtle realism, controlled advertising studio, clean purpose-built studio surfaces, brand-safe polish, controlled imperfections with studio-grade clarity',
        subOptions: [
            { key: 'realismLevel', label: 'Realism Level', values: ['Subtle', 'Balanced'] },
            { key: 'imperfectionControl', label: 'Imperfection Control', values: ['Minimal', 'Controlled'] },
            { key: 'lightQuality', label: 'Light Quality', values: ['Neutral studio', 'Soft studio'] },
            { key: 'surfaceType', label: 'Surface Type', values: ['Abstract studio surface'] },
        ],
        constraints: [
            'Controlled imperfections only',
            'No personal context cues',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: [
            'none',
            'passive-presence',
            'cropped-hand',
            'supported-hold',
            'holding',
            'two-hand-hold',
            'presenting',
            'framed-presentation',
            'applying-opening',
            'capsule-display',
            'resting-interaction',
        ],
        allowsPersonPresence: true
    },
};

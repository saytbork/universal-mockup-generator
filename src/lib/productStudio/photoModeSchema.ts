import { EnvironmentPhotoModeSchema, PhotoMode } from './types';

export const PHOTO_MODE_SCHEMAS: Partial<Record<PhotoMode, EnvironmentPhotoModeSchema>> = {
    'Minimal Bathroom Vanity': {
        id: 'minimal-bathroom-vanity',
        label: 'Minimal Bathroom Vanity',
        type: 'environment',
        description: 'Clean modern bathroom countertop with soft daylight and minimal props.',
        basePrompt: 'minimal bathroom vanity photography, clean countertop with subtle bathroom context, soft natural light through window, premium spa-like aesthetic',
        settingsSchema: {
            environmentMood: ['clean', 'spa-like', 'minimal'],
            lighting: ['soft window daylight', 'diffused overhead'],
            surfaceBackground: ['stone vanity', 'ceramic counter'],
            subjectPresence: ['none', 'cropped hand'],
            cameraBias: ['eye-level', 'slight top-down']
        },
        constraints: [
            'No cluttered backgrounds',
            'No exaggerated reflections',
            'Scale must remain realistic for bathroom surfaces'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'cropped-hand', 'resting-interaction'],
        allowsPersonPresence: true
    },
    'Dark Premium Studio': {
        id: 'dark-premium-studio',
        label: 'Dark Premium Studio',
        type: 'environment',
        description: 'High-end dark studio with controlled highlights and luxury mood.',
        basePrompt: 'dark premium studio photography, low-key lighting with dramatic shadows, luxury high-contrast composition, moody editorial aesthetic',
        settingsSchema: {
            environmentMood: ['luxury', 'dramatic', 'editorial'],
            lighting: ['rim light', 'soft key + shadow fill'],
            surfaceBackground: ['black matte', 'dark stone'],
            subjectPresence: ['none'],
            cameraBias: ['eye-level', 'low angle power']
        },
        constraints: [
            'No crushed blacks',
            'Edges must remain readable',
            'Label contrast must be preserved'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Monochrome Brand': {
        id: 'monochrome-brand-world',
        label: 'Monochrome Brand',
        type: 'environment',
        description: 'Single-color brand-driven environment.',
        basePrompt: 'monochrome brand world photography, single-color abstraction using brand color, editorial tonal composition, controlled monochromatic gradient',
        settingsSchema: {
            environmentMood: ['calm', 'brand-focused', 'modern'],
            lighting: ['even studio light', 'soft gradient light'],
            surfaceBackground: ['monochrome surface', 'brand-color gradient'],
            subjectPresence: ['none'],
            cameraBias: ['centered hero', 'rule of thirds']
        },
        constraints: [
            'Only one color family allowed',
            'No texture noise',
            'Product silhouette must stay dominant'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Brand Campaign': {
        id: 'brand-campaign-world',
        label: 'Brand Campaign',
        type: 'environment',
        description: 'Large-scale lifestyle campaign environment.',
        basePrompt: 'hero brand campaign photography, high-end commercial set with architectural geometry, premium material interplay and depth, aspirational advertising aesthetic, sophisticated spatial composition',
        settingsSchema: {
            environmentMood: ['aspirational', 'confident', 'campaign-ready'],
            lighting: ['natural daylight', 'cinematic soft light'],
            surfaceBackground: ['abstract set', 'lifestyle surface'],
            subjectPresence: ['none', 'cropped hand', 'holding'],
            cameraBias: ['hero angle', 'slight wide']
        },
        constraints: [
            'No stock-photo look',
            'Consistent brand tone',
            'No clutter competing with product'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'cropped-hand', 'holding', 'presenting'],
        allowsPersonPresence: false
    },
    'UGC Premium Simulation': {
        id: 'ugc-premium-simulation',
        label: 'UGC Premium Simulation',
        type: 'environment',
        description: 'High-quality UGC-style realism with controlled imperfections.',
        basePrompt: 'premium UGC-style photography, high-quality smartphone aesthetic with intentional framing, natural lived-in environment with soft window light, authentic brand-focused realism, casual yet elevated product presentation',
        settingsSchema: {
            environmentMood: ['natural', 'authentic', 'everyday'],
            lighting: ['window light', 'indoor ambient'],
            surfaceBackground: ['home table', 'bedside surface'],
            subjectPresence: ['holding', 'two-hand hold'],
            cameraBias: ['phone eye-level', 'slight tilt']
        },
        constraints: [
            'Visible hand pressure required',
            'No mannequin hands',
            'No studio-perfect lighting'
        ],
        requiredPlacement: 'held',
        allowedInteractions: ['holding', 'two-hand-hold', 'presenting'],
        allowsPersonPresence: true
    },
    'Tech Clean Studio': {
        id: 'tech-clean-studio',
        label: 'Tech Clean Studio',
        type: 'environment',
        description: 'Ultra-clean tech-focused studio environment.',
        basePrompt: 'minimalist tech studio photography, pristine surfaces with clinical precision, sharp focus and clean digital-ready borders, professional hardware commercial aesthetic, balanced high-key lighting',
        settingsSchema: {
            environmentMood: ['precise', 'clinical', 'modern'],
            lighting: ['flat diffused', 'top softbox'],
            surfaceBackground: ['white acrylic', 'light gray surface'],
            subjectPresence: ['none'],
            cameraBias: ['orthographic feel', 'centered']
        },
        constraints: [
            'No lifestyle props',
            'No shadows noise',
            'Edges must be extremely sharp'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Luxury Editorial Tabletop': {
        id: 'luxury-editorial-tabletop',
        label: 'Luxury Editorial Tabletop',
        type: 'environment',
        description: 'Magazine-style tabletop editorial composition.',
        basePrompt: 'luxury editorial tabletop photography, premium surface with curated styling, aspirational lifestyle context, controlled depth of field',
        settingsSchema: {
            environmentMood: ['editorial', 'luxury', 'crafted'],
            lighting: ['directional soft light', 'editorial contrast'],
            surfaceBackground: ['wood grain', 'stone slab'],
            subjectPresence: ['none', 'cropped hand'],
            cameraBias: ['45-degree hero', 'rule of thirds']
        },
        constraints: [
            'No messy composition',
            'Natural shadows required',
            'Product must anchor the scene'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'cropped-hand', 'resting-interaction'],
        allowsPersonPresence: false
    },
    'Soft Wellness Morning': {
        id: 'soft-wellness-morning',
        label: 'Soft Wellness Morning',
        type: 'environment',
        description: 'Morning wellness vibe with calm natural light.',
        basePrompt: 'soft wellness morning photography, gentle natural light through window, calm bedroom or kitchen counter, aspirational wellness routine aesthetic',
        settingsSchema: {
            environmentMood: ['calm', 'warm', 'wellness'],
            lighting: ['morning window light', 'soft haze'],
            surfaceBackground: ['linen fabric', 'light wood'],
            subjectPresence: ['none', 'holding'],
            cameraBias: ['eye-level', 'slight top-down']
        },
        constraints: [
            'No harsh light',
            'No saturated colors',
            'Soft shadows only'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'holding', 'resting-interaction'],
        allowsPersonPresence: true
    },
    'Golden Hour Lifestyle': {
        id: 'golden-hour-lifestyle',
        label: 'Golden Hour Lifestyle',
        type: 'environment',
        description: 'Warm golden-hour lifestyle lighting.',
        basePrompt: 'golden hour lifestyle photography, warm sunset light with natural glow, outdoor or window-lit environment, aspirational brand-safe composition',
        settingsSchema: {
            environmentMood: ['warm', 'aspirational', 'natural'],
            lighting: ['golden hour sunlight'],
            surfaceBackground: ['outdoor table', 'window ledge'],
            subjectPresence: ['holding', 'presenting'],
            cameraBias: ['backlit hero', 'slight wide']
        },
        constraints: [
            'No overexposure',
            'Skin tones must remain natural',
            'Label readability mandatory'
        ],
        requiredPlacement: 'held',
        allowedInteractions: ['holding', 'presenting', 'two-hand-hold'],
        allowsPersonPresence: true
    },
    'Outdoor Energy Boost': {
        id: 'outdoor-energy-boost',
        label: 'Outdoor Energy Boost',
        type: 'environment',
        description: 'Dynamic outdoor environment conveying energy.',
        basePrompt: 'outdoor energy boost photography, bright natural sunlight with greenery bokeh, clean outdoor surface, fresh vibrant lifestyle aesthetic',
        settingsSchema: {
            environmentMood: ['energetic', 'fresh', 'active'],
            lighting: ['natural daylight'],
            surfaceBackground: ['stone bench', 'outdoor surface'],
            subjectPresence: ['holding', 'active grip'],
            cameraBias: ['low angle', 'dynamic crop']
        },
        constraints: [
            'No motion blur',
            'Product must remain sharp',
            'Outdoor scale realism enforced'
        ],
        requiredPlacement: 'held',
        allowedInteractions: ['holding', 'two-hand-hold'],
        allowsPersonPresence: true
    },
    'Pastel Picnic': {
        id: 'pastel-picnic',
        label: 'Pastel Picnic',
        type: 'environment',
        description: 'Soft pastel outdoor picnic environment.',
        basePrompt: 'pastel picnic photography, soft outdoor blanket with warm golden-hour light, gentle lens flare and background bokeh, curated picnic props and fresh fruit',
        settingsSchema: {
            environmentMood: ['playful', 'light', 'pastel'],
            lighting: ['overcast daylight'],
            surfaceBackground: ['fabric blanket', 'light wood'],
            subjectPresence: ['none', 'cropped hand'],
            cameraBias: ['top-down', 'eye-level']
        },
        constraints: [
            'No strong contrast',
            'Pastel palette only',
            'No clutter'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'cropped-hand', 'resting-interaction'],
        allowsPersonPresence: true
    },
    'Candy Gradient Lab': {
        id: 'candy-gradient-lab',
        label: 'Candy Gradient Lab',
        type: 'environment',
        description: 'Playful lab-like environment with candy gradients.',
        basePrompt: 'candy gradient lab photography, playful premium gradient background, modern reflections and clean geometric forms, high saturation with controlled polish',
        settingsSchema: {
            environmentMood: ['playful', 'experimental', 'colorful'],
            lighting: ['even studio light'],
            surfaceBackground: ['gradient backdrop'],
            subjectPresence: ['none'],
            cameraBias: ['centered', 'symmetrical']
        },
        constraints: [
            'No realistic environments',
            'Gradient must remain smooth',
            'Product edges must stay sharp'
        ],
        requiredPlacement: 'air',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Hero Landing Page': {
        id: 'hero-landing-page',
        label: 'Hero Landing Page',
        type: 'studio',
        description: 'Clean high-end studio composition for hero sections.',
        basePrompt: 'hero product photography, clean high-end studio composition, minimalist commercial aesthetic, large intentional negative space for copy, product isolated as the sole focal point, luxury ecommerce advertising style',
        settingsSchema: {
            environmentMood: ['minimalist', 'clean', 'luxury'],
            lighting: ['studio softbox', 'rim light'],
            surfaceBackground: ['solid color', 'soft gradient'],
            subjectPresence: ['none'],
            cameraBias: ['centered', 'low-angle hero']
        },
        constraints: [
            'Mandatory negative space for copy',
            'No props allowed',
            'Single product focal point'
        ],
        requiredPlacement: 'any',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Color Pop Hero': {
        id: 'color-pop-hero',
        label: 'Color Pop Hero',
        type: 'studio',
        description: 'Bold color pop studio photography with high-saturation backgrounds.',
        basePrompt: 'bold color pop studio photography, high-saturation background derived from brand colors, modern DTC advertising aesthetic, smooth cyclorama with controlled contrast',
        settingsSchema: {
            environmentMood: ['vibrant', 'bold', 'modern'],
            lighting: ['high-key studio', 'pop light'],
            surfaceBackground: ['saturated cyclorama', 'color-matched surface'],
            subjectPresence: ['none'],
            cameraBias: ['centered punch', 'offset pop']
        },
        constraints: [
            'Background must be high-saturation',
            'No environment props',
            'Controlled contrast'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Ingredient Stack': {
        id: 'ingredient-stack',
        label: 'Ingredient Stack',
        type: 'studio',
        description: 'Editorial exploded ingredient stack photography.',
        basePrompt: 'ingredient-focused product photography, editorial exploded ingredient stack, clear separation and depth planes, scientific yet premium visual language',
        settingsSchema: {
            environmentMood: ['scientific', 'premium', 'editorial'],
            lighting: ['precise highlights', 'diffused fill'],
            surfaceBackground: ['neutral studio', 'pedestal'],
            subjectPresence: ['none'],
            cameraBias: ['eye-level', 'slight top-down']
        },
        constraints: [
            'Ingredients must be visible and stack-oriented',
            'Scientific precision required',
            'No lifestyle clutter'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Ingredient Flat Lay': {
        id: 'ingredient-flat-lay',
        label: 'Ingredient Flat Lay',
        type: 'studio',
        description: 'Overhead ingredient flat lay wellness composition.',
        basePrompt: 'overhead ingredient flat lay photography, editorial wellness composition, clean material textures and spacing, top-down perspective with controlled shadows',
        settingsSchema: {
            environmentMood: ['wellness', 'calm', 'organized'],
            lighting: ['even top-down', 'soft shadows'],
            surfaceBackground: ['clean texture', 'colored paper'],
            subjectPresence: ['none'],
            cameraBias: ['top-down']
        },
        constraints: [
            'Strict top-down perspective',
            'Clean spacing between items',
            'Natural material textures'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Acrylic Blocks': {
        id: 'acrylic-blocks',
        label: 'Acrylic Blocks',
        type: 'studio',
        description: 'High-end studio photography using acrylic geometric blocks.',
        basePrompt: 'high-end studio photography using acrylic blocks, geometric premium composition, controlled reflections and refractions, museum-like luxury aesthetic',
        settingsSchema: {
            environmentMood: ['museum-like', 'geometric', 'luxury'],
            lighting: ['prismatic highlights', 'controlled reflections'],
            surfaceBackground: ['dark studio', 'reflective surface'],
            subjectPresence: ['none'],
            cameraBias: ['architectural angle']
        },
        constraints: [
            'Acrylic blocks must be primary props',
            'Controlled refractions mandatory',
            'No soft lifestyle elements'
        ],
        requiredPlacement: 'supported',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Glass Pedestal Studio': {
        id: 'glass-pedestal-studio',
        label: 'Glass Pedestal Studio',
        type: 'studio',
        description: 'Product elevated on sculptural glass pedestal.',
        basePrompt: 'premium editorial product photography, product elevated on sculptural glass pedestal, museum-like luxury composition, controlled reflections and transparency',
        settingsSchema: {
            environmentMood: ['sophisticated', 'elevated', 'minimal'],
            lighting: ['backlit glass', 'soft rim light'],
            surfaceBackground: ['dark void', 'minimal studio'],
            subjectPresence: ['none'],
            cameraBias: ['slightly low angle']
        },
        constraints: [
            'Glass pedestal must be visible',
            'Transparency effects mandatory',
            'Product stays as hero'
        ],
        requiredPlacement: 'supported',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Splash Shot': {
        id: 'splash-shot',
        label: 'Splash Shot',
        type: 'studio',
        description: 'High-speed splash photography with realistic liquid physics.',
        basePrompt: 'high-speed splash photography, realistic liquid physics frozen mid-action, premium skincare and beverage advertising style, controlled water dynamics',
        settingsSchema: {
            environmentMood: ['dynamic', 'refreshing', 'high-speed'],
            lighting: ['strobe lighting', 'sparkling highlights'],
            surfaceBackground: ['liquid surface', 'gradient studio'],
            subjectPresence: ['none'],
            cameraBias: ['eye-level splash']
        },
        constraints: [
            'Mid-air droplets required',
            'Frozen motion effect',
            'High clarity in liquid physics'
        ],
        requiredPlacement: 'air',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Foam & Texture': {
        id: 'foam-and-texture',
        label: 'Foam & Texture',
        type: 'studio',
        description: 'Macro texture-focused sensory photography.',
        basePrompt: 'macro texture-focused photography, sensory material detail emphasis, editorial beauty aesthetic, controlled foam and gel elements',
        settingsSchema: {
            environmentMood: ['sensory', 'macro', 'tactile'],
            lighting: ['grazing light', 'texture emphasis'],
            surfaceBackground: ['macro surface', 'smeared texture'],
            subjectPresence: ['none'],
            cameraBias: ['macro close-up']
        },
        constraints: [
            'Focus on material texture (foam/gel)',
            'Macro depth of field',
            'Pristine details'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Routine Carousel': {
        id: 'routine-carousel',
        label: 'Routine Carousel',
        type: 'studio',
        description: 'Multi-step routine presentation for ecommerce carousels.',
        basePrompt: 'multi-step routine presentation, clear visual hierarchy, ecommerce carousel-ready composition, repeatable styling across SKUs',
        settingsSchema: {
            environmentMood: ['organized', 'consistent', 'professional'],
            lighting: ['even fill', 'repeatable setup'],
            surfaceBackground: ['neutral shelf', 'studio counter'],
            subjectPresence: ['none', 'cropped hand'],
            cameraBias: ['eye-level consistent']
        },
        constraints: [
            'Clean visual hierarchy',
            'Consistent background across shots',
            'Ecommerce ready'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'cropped-hand'],
        allowsPersonPresence: false
    },
    'Clinical Lab Counter': {
        id: 'clinical-lab-counter',
        label: 'Clinical Lab Counter',
        type: 'studio',
        description: 'Scientific trust-driven environment with lab equipment.',
        basePrompt: 'clinical laboratory product photography, scientific trust-driven environment, precise and minimal composition, sterile counter surfaces and subtle equipment',
        settingsSchema: {
            environmentMood: ['sterile', 'precise', 'trusted'],
            lighting: ['clinical softbox', 'even fluorescent'],
            surfaceBackground: ['stainless steel', 'white lab counter'],
            subjectPresence: ['none', 'gloved hand'],
            cameraBias: ['standard eye-level']
        },
        constraints: [
            'Lab equipment must be subtle and clean',
            'No dramatic lighting',
            'Authentic scientific feel'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'cropped-hand'],
        allowsPersonPresence: false
    },
    'Golden Mist Aura': {
        id: 'golden-mist-aura',
        label: 'Golden Mist Aura',
        type: 'studio',
        description: 'Warm golden mist aura with soft radiant glow.',
        basePrompt: 'premium product photography with soft golden mist aura, radiant radiant glow, warm atmospheric lighting, luxurious moody composition',
        settingsSchema: {
            environmentMood: ['calm', 'luxurious', 'radiant'],
            lighting: ['backlit mist', 'golden hour studio'],
            surfaceBackground: ['reflective dark surface', 'soft mist'],
            subjectPresence: ['none'],
            cameraBias: ['hero centered']
        },
        constraints: [
            'Mist must be soft and golden',
            'No harsh shadows',
            'Label remains readable through mist'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    }
};

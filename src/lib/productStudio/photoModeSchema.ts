import { EnvironmentPhotoModeSchema, PhotoMode } from './types';

export const PHOTO_MODE_SCHEMAS: Partial<Record<PhotoMode, EnvironmentPhotoModeSchema>> = {
    'Minimal Bathroom Vanity': {
        id: 'minimal-bathroom-vanity',
        label: 'Minimal Bathroom Vanity',
        type: 'studio',
        description: 'Bathroom-inspired advertising surface with clean materials.',
        basePrompt: 'clean bathroom-inspired advertising surface, neutral materials like stone ceramic and glass, minimal elements, calm wellness-oriented atmosphere',
        settingsSchema: {
            environmentMood: ['clean', 'spa-like', 'minimal'],
            lighting: ['soft window daylight', 'diffused overhead'],
            surfaceBackground: ['stone vanity', 'ceramic counter'],
            subjectPresence: ['none'],
            cameraBias: ['eye-level', 'slight top-down']
        },
        constraints: [
            'No cluttered backgrounds',
            'No exaggerated reflections',
            'Scale must remain realistic for bathroom surfaces'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'cropped-hand'],
        allowsPersonPresence: false
    },
    'Dark Premium Studio': {
        id: 'dark-premium-studio',
        label: 'Dark Premium Studio',
        type: 'studio',
        description: 'Low-key premium advertising studio with controlled highlights.',
        basePrompt: 'low-key premium advertising studio, dark background with controlled highlights, product edges remain clearly defined',
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
        type: 'studio',
        description: 'Single-color brand advertising environment.',
        basePrompt: 'single-color brand world advertising composition, all elements remain within one color family, graphic minimal brand-driven abstraction',
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
        type: 'studio',
        description: 'High-end brand campaign advertising environment.',
        basePrompt: 'high-end brand campaign advertising environment, architectural composition with premium materials, aspirational controlled hero-focused scene',
        settingsSchema: {
            environmentMood: ['aspirational', 'confident', 'campaign-ready'],
            lighting: ['natural daylight', 'cinematic soft light'],
            surfaceBackground: ['abstract set', 'campaign surface'],
            subjectPresence: ['none'],
            cameraBias: ['hero angle', 'slight wide']
        },
        constraints: [
            'No stock-photo look',
            'Consistent brand tone',
            'No clutter competing with product'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'cropped-hand'],
        allowsPersonPresence: false
    },
    'UGC Premium Simulation': {
        id: 'ugc-premium-simulation',
        label: 'UGC Premium Simulation',
        type: 'environment',
        description: 'Premium casual realism simulation with controlled imperfections.',
        basePrompt: 'advertising composition inspired by casual realism, natural imperfections in lighting and framing, still polished controlled and brand-safe, no personal context or subject presence',
        settingsSchema: {
            environmentMood: ['natural', 'authentic', 'everyday'],
            lighting: ['window light', 'indoor ambient'],
            surfaceBackground: ['home table', 'bedside surface'],
            subjectPresence: ['none'],
            cameraBias: ['phone eye-level', 'slight tilt']
        },
        constraints: [
            'Controlled imperfections only',
            'No personal context cues',
            'No studio-perfect lighting'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['holding', 'two-hand-hold', 'presenting'],
        allowsPersonPresence: true
    },
    'Tech Clean Studio': {
        id: 'tech-clean-studio',
        label: 'Tech Clean Studio',
        type: 'environment',
        description: 'Technology-driven advertising studio with precision surfaces.',
        basePrompt: 'technology-driven advertising studio, precision surfaces clean geometry cool neutral tones, modern minimal performance-oriented atmosphere',
        settingsSchema: {
            environmentMood: ['precise', 'clinical', 'modern'],
            lighting: ['flat diffused', 'top softbox'],
            surfaceBackground: ['white acrylic', 'light gray surface'],
            subjectPresence: ['none'],
            cameraBias: ['orthographic feel', 'centered']
        },
        constraints: [
            'No casual props',
            'No shadows noise',
            'Edges must be extremely sharp'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'cropped-hand'],
        allowsPersonPresence: false
    },
    'Luxury Editorial Tabletop': {
        id: 'luxury-editorial-tabletop',
        label: 'Luxury Editorial Tabletop',
        type: 'environment',
        description: 'Luxury editorial tabletop advertising composition.',
        basePrompt: 'luxury editorial tabletop advertising composition, premium surface materials with curated supporting props, product remains the focal point',
        settingsSchema: {
            environmentMood: ['editorial', 'luxury', 'crafted'],
            lighting: ['directional soft light', 'editorial contrast'],
            surfaceBackground: ['wood grain', 'stone slab'],
            subjectPresence: ['none'],
            cameraBias: ['45-degree hero', 'rule of thirds']
        },
        constraints: [
            'No messy composition',
            'Natural shadows required',
            'Product must anchor the scene'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Soft Wellness Morning': {
        id: 'soft-wellness-morning',
        label: 'Soft Wellness Morning',
        type: 'environment',
        description: 'Soft wellness-inspired advertising atmosphere with diffused light.',
        basePrompt: 'soft wellness-inspired advertising atmosphere, diffused light calm tones gentle material textures, clean serene product-first composition',
        settingsSchema: {
            environmentMood: ['calm', 'warm', 'wellness'],
            lighting: ['morning window light', 'soft haze'],
            surfaceBackground: ['linen fabric', 'light wood'],
            subjectPresence: ['none'],
            cameraBias: ['eye-level', 'slight top-down']
        },
        constraints: [
            'No harsh light',
            'No saturated colors',
            'Soft shadows only'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'holding', 'two-hand-hold', 'presenting'],
        allowsPersonPresence: true
    },
    'Golden Hour Lifestyle': {
        id: 'golden-hour-lifestyle',
        label: 'Golden Hour Lifestyle',
        type: 'environment',
        description: 'Warm advertising lighting inspired by golden-hour tones.',
        basePrompt: 'warm advertising lighting inspired by golden-hour tones, soft directional glow and natural color warmth, studio-controlled environment with aspirational mood',
        settingsSchema: {
            environmentMood: ['warm', 'aspirational', 'natural'],
            lighting: ['golden hour sunlight'],
            surfaceBackground: ['outdoor table', 'window ledge'],
            subjectPresence: ['none'],
            cameraBias: ['backlit hero', 'slight wide']
        },
        constraints: [
            'No overexposure',
            'Color tones must remain natural',
            'Label readability mandatory'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'holding', 'two-hand-hold', 'presenting'],
        allowsPersonPresence: true
    },
    'Outdoor Energy Boost': {
        id: 'outdoor-energy-boost',
        label: 'Outdoor Energy Boost',
        type: 'environment',
        description: 'Fresh, energetic advertising atmosphere inspired by outdoor light.',
        basePrompt: 'fresh energetic advertising atmosphere inspired by outdoor light, bright highlights crisp contrast dynamic framing, studio-controlled environment with vitality cues',
        settingsSchema: {
            environmentMood: ['energetic', 'fresh', 'active'],
            lighting: ['natural daylight'],
            surfaceBackground: ['stone bench', 'outdoor surface'],
            subjectPresence: ['none'],
            cameraBias: ['low angle', 'dynamic crop']
        },
        constraints: [
            'No motion blur',
            'Product must remain sharp',
            'Outdoor scale realism enforced'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'holding', 'two-hand-hold', 'presenting'],
        allowsPersonPresence: true
    },
    'Pastel Picnic': {
        id: 'pastel-picnic',
        label: 'Pastel Picnic',
        type: 'environment',
        description: 'Pastel-toned advertising composition with soft palette.',
        basePrompt: 'pastel-toned advertising composition, soft color palette with playful balance, graphic clean brand-safe environment',
        settingsSchema: {
            environmentMood: ['playful', 'light', 'pastel'],
            lighting: ['overcast daylight'],
            surfaceBackground: ['fabric blanket', 'light wood'],
            subjectPresence: ['none'],
            cameraBias: ['top-down', 'eye-level']
        },
        constraints: [
            'No strong contrast',
            'Pastel palette only',
            'No clutter'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'holding', 'two-hand-hold', 'presenting'],
        allowsPersonPresence: true
    },
    'Candy Gradient Lab': {
        id: 'candy-gradient-lab',
        label: 'Candy Gradient Lab',
        type: 'environment',
        description: 'Studio gradient lab environment with candy-like colors.',
        basePrompt: 'studio gradient background with candy-like color transitions, smooth blends and controlled saturation, clean abstraction with physical grounding',
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
        description: 'Hero product advertising composition for landing pages.',
        basePrompt: 'hero product photography for landing page use, clean premium advertising composition with strong negative space, product positioned for copy-safe layout, no props competing with the product, high clarity high contrast label fully readable',
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
        description: 'Bold single-color advertising composition.',
        basePrompt: 'bold advertising composition driven by a single dominant color, smooth tonal background with controlled saturation, no textures no gradients unless monochromatic, product silhouette remains the visual anchor',
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
        description: 'Ingredient-focused advertising composition with grounded elements.',
        basePrompt: 'realistic ingredients placed manually around the product, ingredients scaled correctly and physically grounded, editorial advertising arrangement clean and intentional, ingredients rest on the same surface as the product',
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
            'No casual clutter'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Ingredient Flat Lay': {
        id: 'ingredient-flat-lay',
        label: 'Ingredient Flat Lay',
        type: 'studio',
        description: 'Top-down advertising flat lay with precise spacing.',
        basePrompt: 'top-down advertising flat lay composition, product and ingredients arranged with precise spacing, zenith camera angle only, graphic clean editorial balance',
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
        description: 'Acrylic block advertising setup with controlled reflections.',
        basePrompt: 'product staged on transparent or frosted acrylic blocks, geometric advertising setup with controlled reflections, clean edges sharp surfaces premium studio feel',
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
            'No soft domestic elements'
        ],
        requiredPlacement: 'supported',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Glass Pedestal Studio': {
        id: 'glass-pedestal-studio',
        label: 'Glass Pedestal Studio',
        type: 'studio',
        description: 'Glass pedestal advertising studio composition.',
        basePrompt: 'product elevated on a glass pedestal, subtle reflections and optical depth, luxury advertising studio composition',
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
        description: 'High-speed liquid splash advertising composition.',
        basePrompt: 'dynamic liquid splash surrounding the product, high-speed advertising photography aesthetic, product remains fully readable and physically plausible',
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
        description: 'Macro texture-focused advertising composition.',
        basePrompt: 'macro-focused texture-driven advertising composition, foam or surface textures arranged around the product, shallow depth of field with premium material detail',
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
        description: 'Multi-position advertising sequence for carousel layouts.',
        basePrompt: 'multi-position product sequence on the same surface, consistent lighting and scale across frames, advertising repetition with controlled variation',
        settingsSchema: {
            environmentMood: ['organized', 'consistent', 'professional'],
            lighting: ['even fill', 'repeatable setup'],
            surfaceBackground: ['neutral shelf', 'studio counter'],
            subjectPresence: ['none'],
            cameraBias: ['eye-level consistent']
        },
        constraints: [
            'Clean visual hierarchy',
            'Consistent background across shots',
            'Ecommerce ready'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Clinical Lab Counter': {
        id: 'clinical-lab-counter',
        label: 'Clinical Lab Counter',
        type: 'studio',
        description: 'Clinical laboratory-inspired advertising environment.',
        basePrompt: 'clinical laboratory-inspired advertising environment, sterile counter surface with subtle scientific cues, trust-driven clean precise composition',
        settingsSchema: {
            environmentMood: ['sterile', 'precise', 'trusted'],
            lighting: ['clinical softbox', 'even fluorescent'],
            surfaceBackground: ['stainless steel', 'white lab counter'],
            subjectPresence: ['none'],
            cameraBias: ['standard eye-level']
        },
        constraints: [
            'Lab equipment must be subtle and clean',
            'No dramatic lighting',
            'Authentic scientific feel'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Golden Mist Aura': {
        id: 'golden-mist-aura',
        label: 'Golden Mist Aura',
        type: 'studio',
        description: 'Atmospheric advertising studio lighting with subtle haze.',
        basePrompt: 'atmospheric advertising studio lighting, subtle haze for depth separation, soft highlights no hard shadows, label clarity remains mandatory',
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

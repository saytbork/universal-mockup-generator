import { EnvironmentPhotoModeSchema, PhotoMode } from './types';

export const PHOTO_MODE_SCHEMAS: Partial<Record<PhotoMode, EnvironmentPhotoModeSchema>> = {
    'Hero Landing Page': {
        id: 'hero-landing-page',
        label: 'Hero Landing Page',
        scope: 'studio',
        description: 'Hero product advertising composition for landing pages.',
        basePrompt: 'hero product advertising composition with strong negative space, copy-safe layout, product isolated as the focal point, high clarity and contrast, label fully readable',
        subOptions: [
            { key: 'backgroundType', label: 'Background Type', values: ['Solid', 'Gradient'] },
            { key: 'contrastLevel', label: 'Contrast Level', values: ['Soft', 'High'] },
            { key: 'negativeSpace', label: 'Negative Space', values: ['Tight', 'Generous'] },
        ],
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
        scope: 'studio',
        description: 'Bold single-color advertising composition.',
        basePrompt: 'bold advertising composition driven by a single dominant color, smooth tonal background with controlled saturation, product silhouette remains the visual anchor',
        subOptions: [
            { key: 'dominantColor', label: 'Dominant Color', values: ['Brand color', 'Complementary', 'Monochrome'] },
            { key: 'contrastLevel', label: 'Contrast Level', values: ['Soft', 'High'] },
            { key: 'shadowStyle', label: 'Shadow Style', values: ['Soft', 'Crisp'] },
        ],
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
        scope: 'studio',
        description: 'Ingredient-focused advertising composition with grounded elements.',
        basePrompt: 'realistic ingredients arranged around the product, physically grounded and scaled correctly, clean editorial advertising arrangement, ingredients rest on the same surface as the product',
        subOptions: [
            { key: 'ingredientDensity', label: 'Ingredient Density', values: ['Low', 'Medium', 'High'] },
            { key: 'layoutStyle', label: 'Layout Style', values: ['Stacked', 'Surround', 'Split'] },
            { key: 'surfaceType', label: 'Surface Type', values: ['Stone', 'Ceramic', 'Wood'] },
            { key: 'cameraAngle', label: 'Camera Angle', values: ['Eye-level', 'Slight top-down'] },
        ],
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
        scope: 'studio',
        description: 'Top-down advertising flat lay with precise spacing.',
        basePrompt: 'top-down advertising flat lay composition with precise spacing, clean editorial balance, organized ingredient arrangement',
        subOptions: [
            { key: 'surfaceType', label: 'Surface Type', values: ['Paper', 'Stone', 'Textile'] },
            { key: 'spacingRhythm', label: 'Spacing Rhythm', values: ['Tight', 'Balanced', 'Wide'] },
            { key: 'shadowPresence', label: 'Shadow Presence', values: ['Soft', 'Minimal', 'Defined'] },
            { key: 'cameraAngle', label: 'Camera Angle', values: ['Top-down'] },
        ],
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
        scope: 'studio',
        description: 'Acrylic block advertising setup with controlled reflections.',
        basePrompt: 'product staged on transparent or frosted acrylic blocks, geometric advertising setup with controlled reflections, clean edges and premium studio feel',
        subOptions: [
            { key: 'blockGeometry', label: 'Block Geometry', values: ['Rectangular', 'Cylindrical', 'Mixed'] },
            { key: 'transparencyLevel', label: 'Transparency Level', values: ['Clear', 'Frosted', 'Smoked'] },
            { key: 'reflectionIntensity', label: 'Reflection Intensity', values: ['Minimal', 'Balanced', 'Glossy'] },
        ],
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
        scope: 'studio',
        description: 'Glass pedestal advertising studio composition.',
        basePrompt: 'product elevated on a glass pedestal, subtle reflections and optical depth, luxury advertising studio composition',
        subOptions: [
            { key: 'pedestalShape', label: 'Pedestal Shape', values: ['Cylinder', 'Cube', 'Tapered'] },
            { key: 'glassFinish', label: 'Glass Finish', values: ['Clear', 'Frosted', 'Tinted'] },
            { key: 'reflectionControl', label: 'Reflection Control', values: ['Soft', 'Balanced', 'High'] },
        ],
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
        scope: 'studio',
        description: 'High-speed liquid splash advertising composition.',
        basePrompt: 'dynamic liquid splash surrounding the product, high-speed advertising photography aesthetic, product remains fully readable and physically plausible',
        subOptions: [
            { key: 'splashMedium', label: 'Splash Medium', values: ['Liquid', 'Mist'] },
            { key: 'motionIntensity', label: 'Motion Intensity', values: ['Subtle', 'Dynamic', 'Explosive'] },
            { key: 'freezeMoment', label: 'Freeze Moment', values: ['Early', 'Mid-splash', 'Peak'] },
            { key: 'productStability', label: 'Product Stability', values: ['Fully grounded', 'Slight movement'] },
        ],
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
        scope: 'studio',
        description: 'Macro texture-focused advertising composition.',
        basePrompt: 'macro-focused texture-driven advertising composition, foam or surface textures arranged around the product, shallow depth of field with premium material detail',
        subOptions: [
            { key: 'textureType', label: 'Texture Type', values: ['Foam', 'Cream', 'Gel', 'Powder'] },
            { key: 'macroLevel', label: 'Macro Level', values: ['Macro', 'Close'] },
            { key: 'lightingStyle', label: 'Lighting Style', values: ['Grazing', 'Soft', 'Directional'] },
        ],
        constraints: [
            'Focus on material texture',
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
        scope: 'studio',
        description: 'Multi-position advertising sequence for carousel layouts.',
        basePrompt: 'multi-position product sequence on the same surface, consistent lighting and scale across frames, advertising repetition with controlled variation',
        subOptions: [
            { key: 'frameConsistency', label: 'Frame Consistency', values: ['Strict', 'Subtle variation'] },
            { key: 'cameraDistance', label: 'Camera Distance', values: ['Close', 'Medium'] },
            { key: 'sequenceRhythm', label: 'Sequence Rhythm', values: ['Linear', 'Alternating'] },
        ],
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
            'Authentic scientific feel'
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
            'Label contrast must be preserved'
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
            'Product silhouette must stay dominant'
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
            'Edges must be extremely sharp'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Candy Gradient Lab': {
        id: 'candy-gradient-lab',
        label: 'Candy Gradient Lab',
        scope: 'studio',
        description: 'Studio gradient lab environment with candy-like colors.',
        basePrompt: 'studio gradient background with candy-like color transitions, smooth blends and controlled saturation, clean abstraction with physical grounding',
        subOptions: [
            { key: 'gradientType', label: 'Gradient Type', values: ['Soft blend', 'Sharp transition'] },
            { key: 'saturationLevel', label: 'Saturation Level', values: ['Soft', 'Bold'] },
            { key: 'floatingPlanesDensity', label: 'Floating Planes Density', values: ['Low', 'Medium', 'High'] },
        ],
        constraints: [
            'No realistic environments',
            'Gradient must remain smooth',
            'Product edges must stay sharp'
        ],
        requiredPlacement: 'air',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Golden Mist Aura': {
        id: 'golden-mist-aura',
        label: 'Golden Mist Aura',
        scope: 'studio',
        description: 'Atmospheric advertising studio lighting with subtle haze.',
        basePrompt: 'atmospheric advertising studio lighting, subtle haze for depth separation, soft highlights, label clarity remains mandatory',
        subOptions: [
            { key: 'mistDensity', label: 'Mist Density', values: ['Low', 'Medium', 'High'] },
            { key: 'lightBloomIntensity', label: 'Light Bloom Intensity', values: ['Soft', 'Warm', 'Radiant'] },
            { key: 'depthFalloff', label: 'Depth Falloff', values: ['Subtle', 'Pronounced'] },
        ],
        constraints: [
            'Mist must be soft and golden',
            'No harsh shadows',
            'Label remains readable through mist'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Minimal Bathroom Vanity': {
        id: 'minimal-bathroom-vanity',
        label: 'Minimal Bathroom Vanity',
        scope: 'environment',
        description: 'Bathroom-inspired advertising surface with clean materials.',
        basePrompt: 'clean bathroom-inspired advertising surface, neutral materials like stone ceramic and glass, minimal elements, calm wellness-oriented atmosphere',
        subOptions: [
            { key: 'vanityStyle', label: 'Vanity Style', values: ['Modern', 'Classic', 'Minimal'] },
            { key: 'materialTone', label: 'Material Tone', values: ['Cool', 'Neutral', 'Warm'] },
            { key: 'lightingSource', label: 'Lighting Source', values: ['Window light', 'Soft overhead'] },
        ],
        constraints: [
            'No cluttered backgrounds',
            'No exaggerated reflections',
            'Scale must remain realistic for bathroom surfaces'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'cropped-hand'],
        allowsPersonPresence: false
    },
    'Brand Campaign': {
        id: 'brand-campaign-world',
        label: 'Brand Campaign',
        scope: 'environment',
        description: 'High-end brand campaign advertising environment.',
        basePrompt: 'high-end brand campaign advertising environment, architectural composition with premium materials, aspirational controlled hero-focused scene',
        subOptions: [
            { key: 'architecturalScale', label: 'Architectural Scale', values: ['Intimate', 'Grand'] },
            { key: 'materialRichness', label: 'Material Richness', values: ['Refined', 'Opulent'] },
            { key: 'lightingDrama', label: 'Lighting Drama', values: ['Soft', 'Dramatic'] },
        ],
        constraints: [
            'No stock-photo look',
            'Consistent brand tone',
            'No clutter competing with product'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'cropped-hand'],
        allowsPersonPresence: false
    },
    'Luxury Editorial Tabletop': {
        id: 'luxury-editorial-tabletop',
        label: 'Luxury Editorial Tabletop',
        scope: 'environment',
        description: 'Luxury editorial tabletop advertising composition.',
        basePrompt: 'luxury editorial tabletop advertising composition, premium surface materials with curated supporting props, product remains the focal point',
        subOptions: [
            { key: 'surfaceMaterial', label: 'Surface Material', values: ['Stone', 'Wood', 'Ceramic'] },
            { key: 'propDensity', label: 'Prop Density', values: ['Minimal', 'Balanced'] },
            { key: 'editorialMood', label: 'Editorial Mood', values: ['Refined', 'Dramatic', 'Soft'] },
        ],
        constraints: [
            'No messy composition',
            'Natural shadows required',
            'Product must anchor the scene'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'cropped-hand'],
        allowsPersonPresence: false
    },
    'Soft Wellness Morning': {
        id: 'soft-wellness-morning',
        label: 'Soft Wellness Morning',
        scope: 'environment',
        description: 'Soft wellness-inspired advertising atmosphere with diffused light.',
        basePrompt: 'soft wellness-inspired advertising atmosphere, diffused light, gentle material textures, clean serene product-first composition',
        subOptions: [
            { key: 'warmthLevel', label: 'Warmth Level', values: ['Cool', 'Neutral', 'Warm'] },
            { key: 'lightDiffusion', label: 'Light Diffusion', values: ['Soft', 'Very soft'] },
            { key: 'colorPalette', label: 'Color Palette', values: ['Neutral', 'Pastel'] },
        ],
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
        label: 'Golden Hour Editorial Set',
        scope: 'environment',
        description: 'Warm advertising lighting inspired by golden-hour tones.',
        basePrompt: 'warm advertising lighting inspired by golden-hour tones, soft directional glow and natural color warmth, controlled editorial set with aspirational mood',
        subOptions: [
            { key: 'lightAngle', label: 'Light Angle', values: ['Low', 'Side', 'Back'] },
            { key: 'warmthLevel', label: 'Warmth Level', values: ['Warm', 'Golden', 'Amber'] },
            { key: 'shadowLength', label: 'Shadow Length', values: ['Short', 'Medium', 'Long'] },
        ],
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
        scope: 'environment',
        description: 'Fresh, energetic advertising atmosphere inspired by outdoor light.',
        basePrompt: 'fresh energetic advertising atmosphere inspired by outdoor light, bright highlights, crisp contrast, dynamic framing, controlled set with vitality cues',
        subOptions: [
            { key: 'materialType', label: 'Material Type', values: ['Stone', 'Concrete', 'Wood'] },
            { key: 'energyMood', label: 'Energy Mood', values: ['Crisp', 'Bold', 'Active'] },
            { key: 'lightQuality', label: 'Light Quality', values: ['Bright', 'Directional', 'Diffuse'] },
            { key: 'backgroundBlurLevel', label: 'Background Blur Level', values: ['Low', 'Medium'] },
        ],
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
        scope: 'environment',
        description: 'Pastel-toned advertising composition with soft palette.',
        basePrompt: 'pastel-toned advertising composition, soft color palette with playful balance, clean brand-safe environment',
        subOptions: [
            { key: 'pastelPalette', label: 'Pastel Palette', values: ['Soft', 'Balanced', 'Vibrant'] },
            { key: 'propSoftness', label: 'Prop Softness', values: ['Minimal', 'Soft', 'Playful'] },
            { key: 'contrastLevel', label: 'Contrast Level', values: ['Low', 'Medium'] },
        ],
        constraints: [
            'No strong contrast',
            'Pastel palette only',
            'No clutter'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'holding', 'two-hand-hold', 'presenting'],
        allowsPersonPresence: true
    },
    'UGC Premium Simulation': {
        id: 'ugc-premium-simulation',
        label: 'UGC Premium Simulation',
        scope: 'studio',
        description: 'Premium studio simulation with subtle realism and controlled imperfections (no UGC language).',
        basePrompt: 'premium studio simulation with subtle realism, controlled advertising studio, clean purpose-built studio surfaces, brand-safe polish, no domestic context, no handheld or selfie language',
        subOptions: [
            { key: 'realismLevel', label: 'Realism Level', values: ['Subtle', 'Balanced'] },
            { key: 'imperfectionControl', label: 'Imperfection Control', values: ['Minimal', 'Controlled'] },
            { key: 'lightQuality', label: 'Light Quality', values: ['Neutral studio', 'Soft studio'] },
            { key: 'surfaceType', label: 'Surface Type', values: ['Abstract studio surface'] },
        ],
        constraints: [
            'Controlled imperfections only',
            'No lifestyle, domestic, or outdoor context',
            'No handheld/selfie/phone capture language'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    }
};

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
            { key: 'negativeSpace', label: 'Negative Space', values: ['Tight', 'Balanced', 'Spacious'] },
        ],
        constraints: [
            'Mandatory negative space for copy',
            'No props allowed',
            'Single product focal point',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
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
            'Controlled contrast',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
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
            { key: 'surfaceType', label: 'Surface Type', values: ['None', 'Stone', 'Ceramic', 'Wood'] },
            { key: 'cameraAngle', label: 'Camera Angle', values: ['Eye-level', 'Slight top-down'] },
        ],
        constraints: [
            'Ingredients must be visible and clearly separated',
            'Scientific precision required',
            'No casual clutter',
            'Rigid studio surfaces only: acrylic and coated metal.'
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
            { key: 'surfaceType', label: 'Surface Type', values: ['Paper', 'Stone', 'Acrylic'] },
            { key: 'spacingRhythm', label: 'Spacing Rhythm', values: ['Tight', 'Balanced', 'Wide'] },
            { key: 'shadowPresence', label: 'Shadow Presence', values: ['Soft', 'Minimal', 'Defined'] },
            { key: 'cameraAngle', label: 'Camera Angle', values: ['Top-down'] },
        ],
        constraints: [
            'Strict top-down perspective',
            'Clean spacing between items',
            'Natural material textures',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
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
            'No soft domestic elements',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
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
            'Product stays as hero',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
        ],
        requiredPlacement: 'supported',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Splash Shot': {
        id: 'splash-shot',
        label: 'Splash Shot',
        scope: 'studio',
        description: 'High-speed advertising splash with controlled motion and hero readability.',
        basePrompt: 'high-speed commercial splash hero: one product as the clear focal point, one dominant splash sheet wrapping behind/around the product, crisp frozen droplets, campaign-grade strobe lighting, clean premium background, label fully readable, and physically coherent liquid behavior',
        subOptions: [
            { key: 'splashMedium', label: 'Splash Medium', values: ['Liquid'] },
            { key: 'motionIntensity', label: 'Motion Intensity', values: ['Dynamic', 'Explosive'] },
            { key: 'freezeMoment', label: 'Freeze Moment', values: ['Mid-splash', 'Peak'] },
            { key: 'productStability', label: 'Product Stability', values: ['Fully grounded', 'Slight interaction'] },
        ],
        constraints: [
            'Single dominant splash direction (no chaotic circular splash)',
            'Frozen high-speed motion with physically coherent droplets',
            'Label and logo zone must remain unobstructed',
            'No muddy water, foam clutter, or dirty liquid artifacts',
            'Avoid CGI splash rings and melted-looking liquid blobs',
            'No random jet streams crossing the frame edges',
            'No heavy splash occlusion over the label area',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Beach Foam Splash': {
        id: 'beach-foam-splash',
        label: 'Beach Foam Splash',
        scope: 'environment',
        description: 'Beach foam splash moment with clean premium control and readable hero product.',
        basePrompt: 'premium beach splash setup: product physically grounded on wet compact sand, shallow sea foam and clean micro-droplets only near the base, restrained directional backwash around the product, product remains hero and label stays readable, beach sand tones and coastal light vibe without clutter',
        subOptions: [
            { key: 'shoreline', label: 'Shoreline', values: ['Foam line', 'Wave break', 'Backwash'] },
            { key: 'spray', label: 'Spray', values: ['Low', 'Medium', 'High'] },
            { key: 'sand', label: 'Sand', values: ['Clean', 'Wet', 'Glossy'] },
        ],
        constraints: [
            'Keep foam minimal and controlled (do not bury the product)',
            'Frozen motion with crisp droplets',
            'Label must remain readable and unobstructed',
            'No muddy water or dirty foam',
            'Product must stay physically grounded on wet sand (not floating, not submerged)',
            'Backwash/Wave break motion should pass around the base, never replace sand support under the product',
            'No tall water plumes, no random water jets, no chaotic crossing splash arcs'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Pool Water': {
        id: 'pool-water',
        label: 'Pool Water',
        scope: 'environment',
        description: 'Clear pool water look with ripples, caustics, and refreshing droplets.',
        basePrompt: 'clear pool water look with turquoise ripples and subtle caustic highlights, refreshing droplets and clean wet reflections, premium summertime vibe, product remains sharp and readable',
        subOptions: [
            { key: 'waterLevel', label: 'Water Level', values: ['Surface', 'Half', 'Split', 'Out of water (pool edge)'] },
            { key: 'waterEnergy', label: 'Water Energy', values: ['Calm', 'Active', 'Splashy'] },
        ],
        constraints: [
            'Water must look physically real (no CGI plastic water)',
            'Keep composition clean and premium',
            'Label must remain readable',
            'If water level is "Out of water (pool edge)", product must be fully outside the water and physically grounded on the pool edge'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Cheers (Hands Clink)': {
        id: 'cheers-hands-clink',
        label: 'Cheers (Hands Clink)',
        scope: 'environment',
        description: 'Celebratory clink moment with a clean cropped interaction and premium lifestyle light.',
        basePrompt: 'celebratory clink moment with two products meeting at center frame, premium lifestyle lighting, clean background with soft bokeh, frozen droplets and crisp highlights, product branding remains readable',
        subOptions: [],
        constraints: [
            'Cropped interaction only (no faces, no identity)',
            'Branding must remain readable',
            'No chaotic motion blur'
        ],
        requiredPlacement: 'held',
        allowedInteractions: ['two-hand-hold', 'holding', 'supported-hold', 'presenting', 'framed-presentation'],
        allowsPersonPresence: true
    },
    'Ice Cubes': {
        id: 'ice-cubes',
        label: 'Ice Cubes',
        scope: 'studio',
        description: 'Product staged with realistic ice cubes and meltwater reflections.',
        basePrompt: 'product staged with realistic translucent ice cubes, meltwater droplets, clean wet reflections on a premium surface, refreshing chilled vibe, label remains fully readable',
        subOptions: [],
        constraints: [
            'Ice must look physically real and correctly scaled',
            'No plastic-looking cubes',
            'Label must remain readable'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Condensation Droplets': {
        id: 'condensation-droplets',
        label: 'Condensation Droplets',
        scope: 'studio',
        description: 'Cold condensation look with micro-droplets and clean specular highlights.',
        basePrompt: 'cold condensation look with micro-droplets and subtle streaks on the container, clean specular highlights, premium chilled freshness, label typography remains undistorted and readable',
        subOptions: [],
        constraints: [
            'Do not distort or blur label typography',
            'Condensation must look physically plausible',
            'Keep it clean and premium'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Fruit Garnish / Citrus Accents': {
        id: 'fruit-garnish-citrus-accents',
        label: 'Fruit Garnish / Citrus Accents',
        scope: 'studio',
        description: 'Product staged with fruit/citrus accents as clean secondary styling elements.',
        basePrompt: 'product staged with fruit or citrus accents as clean secondary styling elements (slices, peels, wedges), premium advertising composition, controlled reflections and freshness cues, product remains the hero and label stays readable',
        subOptions: [],
        constraints: [
            'Accents must be secondary (do not overpower the product)',
            'Fresh cut realism and correct scale',
            'Label must remain readable'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Textured Bed / Scatter Base': {
        id: 'textured-bed-scatter-base',
        label: 'Textured Bed / Scatter Base',
        scope: 'studio',
        description: 'Product grounded on a controlled textured bed or scatter base.',
        basePrompt: 'product grounded on a controlled textured bed or scatter base around the bottom edge of frame, premium advertising styling, realistic contact shadows, label stays readable, keep scatter minimal and intentional',
        subOptions: [],
        constraints: [
            'Scatter must be controlled and premium',
            'No messy clutter or noise',
            'Label must remain readable'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Floating Particles': {
        id: 'floating-particles',
        label: 'Floating Particles',
        scope: 'studio',
        description: 'Subtle floating particles for atmosphere, kept premium and controlled.',
        basePrompt: 'subtle floating particles for atmosphere (mist micro-droplets, dust motes, sparkle bokeh), premium controlled look, product remains sharp and readable, no heavy haze',
        subOptions: [],
        constraints: [
            'Particles must be subtle and controlled',
            'No fog that reduces readability',
            'Label must remain readable'
        ],
        requiredPlacement: 'surface',
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
            'Pristine details',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
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
            'Ecommerce ready',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
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
            'Product edges must stay sharp',
            'Rigid materials only: glass, metal, acrylic, stone, concrete.'
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
            'Label remains readable through mist',
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
    'Luxury Editorial Tabletop': {
        id: 'luxury-editorial-tabletop',
        label: 'Luxury Editorial Tabletop',
        scope: 'studio',
        description: 'Luxury editorial studio surface composition with minimal rigid accents.',
        basePrompt: 'luxury editorial advertising studio surface composition, premium rigid surface materials with minimal glass acrylic or stone accents, product remains the focal point',
        subOptions: [
            { key: 'surfaceMaterial', label: 'Surface Material', values: ['Stone', 'Concrete', 'Acrylic', 'Metal'] },
            { key: 'propDensity', label: 'Prop Density', values: ['None', 'Minimal'] },
            { key: 'editorialMood', label: 'Editorial Mood', values: ['Refined', 'Dramatic', 'Soft'] },
        ],
        constraints: [
            'No messy composition',
            'Natural shadows required',
            'Product must anchor the scene',
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
    'Hands Application Clean': {
        id: 'hands-application-clean',
        label: 'Hands Application Clean',
        scope: 'environment',
        description: 'Clean application moment with hands and product interaction.',
        basePrompt: 'clean premium skincare application moment with realistic hands, clear product handling, product and label remain readable and central',
        subOptions: [
            { key: 'handPose', label: 'Hand Pose', values: ['Applying', 'Opening', 'Holding'] },
            { key: 'skinLighting', label: 'Skin Lighting', values: ['Soft natural', 'Neutral studio'] },
            { key: 'cropStyle', label: 'Crop Style', values: ['Tight', 'Medium'] },
        ],
        constraints: [
            'Hands must be anatomically correct',
            'No exaggerated gestures',
            'No facial subject required',
        ],
        requiredPlacement: 'held',
        allowedInteractions: ['holding', 'applying-opening', 'supported-hold', 'two-hand-hold'],
        allowsPersonPresence: true
    },
    'Underwater Split': {
        id: 'underwater-split',
        label: 'Underwater Split',
        scope: 'environment',
        description: 'Split-level aqua scene with physically credible underwater depth.',
        basePrompt: 'split-level water composition with realistic waterline, product visibly submerged below the waterline with true underwater depth cues, underwater caustics, particulate diffusion and bubbles, clean hydration-oriented premium look',
        subOptions: [
            { key: 'waterlineHeight', label: 'Waterline Height', values: ['Mid', 'Upper-mid'] },
            { key: 'bubbleDensity', label: 'Bubble Density', values: ['Low', 'Balanced'] },
            { key: 'aquaTone', label: 'Aqua Tone', values: ['Light blue', 'Cyan blue'] },
        ],
        constraints: [
            'Waterline must be physically coherent',
            'Submerged portion must clearly read as underwater with authentic light attenuation',
            'Underwater refraction and caustics must be physically plausible',
            'No muddy water color',
            'Label remains as readable as perspective allows',
        ],
        requiredPlacement: 'air',
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
    'Macro Dew Label': {
        id: 'macro-dew-label',
        label: 'Macro Dew Label',
        scope: 'studio',
        description: 'Macro close-up for texture, label fidelity, and droplets.',
        basePrompt: 'true macro close-up of the product label and bottle material texture, label occupying most of frame, realistic dew droplets with optical magnification behavior, ultra-sharp commercial detail and controlled highlights',
        subOptions: [
            { key: 'macroTightness', label: 'Macro Tightness', values: ['Tight', 'Extreme'] },
            { key: 'dropletMode', label: 'Droplet Mode', values: ['Clean', 'Wet', 'Drops'] },
            { key: 'dropletDensity', label: 'Droplet Density', values: ['Low', 'Balanced', 'High'] },
            { key: 'highlightControl', label: 'Highlight Control', values: ['Soft', 'Balanced'] },
        ],
        constraints: [
            'True macro proximity is mandatory: no medium or wide framing',
            'Primary label area should dominate the frame while remaining fully legible',
            'Label typography fidelity is critical',
            'No blur on key label text',
            'Droplets must be physically plausible',
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
    'Gel Smear Editorial': {
        id: 'gel-smear-editorial',
        label: 'Gel Smear Editorial',
        scope: 'studio',
        description: 'Editorial texture scene with controlled gel smear styling.',
        basePrompt: 'editorial gel-smear texture composition on clean premium surface, product placed with tactile material contrast and controlled highlights',
        subOptions: [
            { key: 'smearWidth', label: 'Smear Width', values: ['Narrow', 'Balanced', 'Wide'] },
            { key: 'surfaceTone', label: 'Surface Tone', values: ['Cool gray', 'Neutral stone'] },
            { key: 'textureGloss', label: 'Texture Gloss', values: ['Soft', 'Glossy'] },
        ],
        constraints: [
            'Texture must look intentional and premium',
            'No chaotic mess',
            'Product readability remains mandatory',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Citrus Fresh Flat Lay': {
        id: 'citrus-fresh-flat-lay',
        label: 'Citrus Fresh Flat Lay',
        scope: 'studio',
        description: 'Fresh flat lay composition with ingredient-focused rhythm.',
        basePrompt: 'fresh ingredient-led flat lay composition with clean circular rhythm around the product, bright premium commercial styling, top-down discipline',
        subOptions: [
            { key: 'layoutDensity', label: 'Layout Density', values: ['Balanced', 'Full'] },
            { key: 'colorEnergy', label: 'Color Energy', values: ['Fresh', 'Vibrant'] },
            { key: 'dropDetails', label: 'Drop Details', values: ['None', 'Subtle'] },
            { key: 'customIngredients', label: 'Custom Ingredients', values: ['Optional custom list via text input'] },
        ],
        constraints: [
            'Strict top-down framing',
            'Ingredient props should only be used when explicitly selected',
            'Label remains readable',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Stones & Crystals Flat Lay': {
        id: 'stones-crystals-flat-lay',
        label: 'Stones & Crystals Flat Lay',
        scope: 'studio',
        description: 'Grounded flat lay with neutral stones and crystal accents.',
        basePrompt: 'neutral tactile flat lay with curated stones and crystal accents, balanced spacing and premium wellness editorial tone',
        subOptions: [
            { key: 'textureBase', label: 'Texture Base', values: ['Linen', 'Stone'] },
            { key: 'objectDensity', label: 'Object Density', values: ['Low', 'Balanced'] },
            { key: 'lightSoftness', label: 'Light Softness', values: ['Soft', 'Balanced'] },
            { key: 'customIngredients', label: 'Custom Ingredients', values: ['Optional custom list via text input'] },
        ],
        constraints: [
            'Objects remain secondary to product',
            'No chaotic arrangement',
            'Label readability must be preserved',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Dried Citrus Earth': {
        id: 'dried-citrus-earth',
        label: 'Dried Citrus Earth',
        scope: 'studio',
        description: 'Earthy warm flat lay with dried botanical accents.',
        basePrompt: 'earthy warm flat lay on textured natural surface with curated dried botanical accents, premium grounded composition and clear product hierarchy',
        subOptions: [
            { key: 'earthTone', label: 'Earth Tone', values: ['Sand', 'Terracotta'] },
            { key: 'accentDensity', label: 'Accent Density', values: ['Low', 'Balanced'] },
            { key: 'shadowSharpness', label: 'Shadow Sharpness', values: ['Soft', 'Defined'] },
            { key: 'customIngredients', label: 'Custom Ingredients', values: ['Optional custom list via text input'] },
        ],
        constraints: [
            'Earthy palette must remain controlled',
            'No random fresh fruit unless explicitly selected by user',
            'Product remains dominant and readable',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
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
        requiredPlacement: 'any',
        allowedInteractions: ['none', 'holding', 'two-hand-hold', 'presenting'],
        allowsPersonPresence: true
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
        requiredPlacement: 'any',
        allowedInteractions: ['none', 'holding', 'two-hand-hold', 'presenting'],
        allowsPersonPresence: true
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
    }
};

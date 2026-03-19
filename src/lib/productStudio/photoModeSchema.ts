import { EnvironmentPhotoModeSchema, PhotoMode } from './types';
import { VISUAL_STYLE_SCHEMAS } from './visualStyleSchema';

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
        allowedInteractions: ['none', 'passive-presence', 'cropped-hand', 'supported-hold', 'holding', 'presenting', 'framed-presentation', 'applying-opening', 'capsule-display', 'resting-interaction'],
        allowsPersonPresence: true
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
        allowedInteractions: ['none', 'passive-presence', 'cropped-hand', 'resting-interaction'],
        allowsPersonPresence: true
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
        basePrompt: 'premium Caribbean beach splash setup in sunny daytime: product physically grounded on wet clean white sand, vivid turquoise seawater and shallow sea foam with clean micro-droplets only near the base, restrained directional backwash around the product, lively coastal atmosphere with product as hero and label fully readable',
        subOptions: [
            { key: 'shoreline', label: 'Shoreline', values: ['Foam line', 'Wave break', 'Backwash'] },
            { key: 'spray', label: 'Spray', values: ['Low', 'Medium', 'High'] },
            { key: 'sand', label: 'Sand', values: ['Clean', 'Wet', 'Glossy'] },
        ],
        constraints: [
            'Scene must read as sunny tropical Caribbean daytime (not studio, not overcast, not dusk)',
            'Water should read turquoise and sand should read clean white',
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
        basePrompt: 'celebratory clink moment with two products meeting at center frame, premium lifestyle lighting, clean background with soft bokeh, frozen droplets and crisp highlights, product branding remains readable, hands must look real with natural skin texture and anatomically plausible grip',
        subOptions: [],
        constraints: [
            'Cropped interaction only (no faces, no identity)',
            'Branding must remain readable',
            'No chaotic motion blur',
            'Hands must look real (no doll/mannequin/CGI/waxy skin)',
            'Finger anatomy and grip pressure must be physically plausible'
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
    'Caustic Light Ripples': {
        id: 'caustic-light-ripples',
        label: 'Caustic Light Ripples',
        scope: 'studio',
        description: 'Water-like caustic light ripples with premium optical movement and clean readability.',
        basePrompt: 'controlled caustic light ripples across the scene, premium optical reflections, elegant water-light interplay, clean product readability',
        subOptions: [
            { key: 'rippleIntensity', label: 'Ripple Intensity', values: ['Subtle', 'Balanced'] },
            { key: 'lightSpread', label: 'Light Spread', values: ['Focused', 'Wide'] },
            { key: 'surfaceEnergy', label: 'Surface Energy', values: ['Calm', 'Lively'] },
        ],
        constraints: [
            'Caustics must feel optical and realistic',
            'Do not simulate pool-party chaos',
            'Keep product edges readable',
            'Label readability must remain intact'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Prism Rainbow Refractions': {
        id: 'prism-rainbow-refractions',
        label: 'Prism Rainbow Refractions',
        scope: 'studio',
        description: 'Controlled prism refractions with premium spectral highlights and clean readability.',
        basePrompt: 'controlled prism refractions around the product, premium spectral highlights, elegant optical breakup, clean readability, luxury studio realism',
        subOptions: [
            { key: 'spectrumStrength', label: 'Spectrum Strength', values: ['Subtle', 'Balanced'] },
            { key: 'refractionPlacement', label: 'Refraction Placement', values: ['Edge-only', 'Background + edge'] },
            { key: 'highlightCleanliness', label: 'Highlight Cleanliness', values: ['Clean', 'Expressive'] },
        ],
        constraints: [
            'Keep spectral effects controlled and premium',
            'No rainbow wash over the full product',
            'Label readability must remain intact',
            'No cheap holographic CGI look'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Glass Refraction Panels': {
        id: 'glass-refraction-panels',
        label: 'Glass Refraction Panels',
        scope: 'studio',
        description: 'Elegant glass-panel refractions adding depth and optical distortion around the product.',
        basePrompt: 'elegant glass refraction panels placed around the product, controlled distortion, premium optical depth, clean studio realism, hero readability preserved',
        subOptions: [
            { key: 'panelDensity', label: 'Panel Density', values: ['Single', 'Layered'] },
            { key: 'distortionLevel', label: 'Distortion Level', values: ['Subtle', 'Balanced'] },
            { key: 'glassTone', label: 'Glass Tone', values: ['Clear', 'Cool neutral'] },
        ],
        constraints: [
            'Refraction panels must feel like real glass',
            'No warped product geometry',
            'Keep the hero product clearly readable',
            'No plastic transparent prop look'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Micro Mist Halo': {
        id: 'micro-mist-halo',
        label: 'Micro Mist Halo',
        scope: 'studio',
        description: 'A fine premium mist halo adding atmospheric freshness without obscuring the product.',
        basePrompt: 'fine premium mist halo around the product, controlled atmospheric freshness, subtle suspended moisture, clean studio realism, product readability preserved',
        subOptions: [
            { key: 'mistDensity', label: 'Mist Density', values: ['Light', 'Balanced'] },
            { key: 'haloRadius', label: 'Halo Radius', values: ['Tight', 'Wide'] },
            { key: 'backlightLevel', label: 'Backlight Level', values: ['Soft', 'Balanced'] },
        ],
        constraints: [
            'Mist must remain subtle and premium',
            'Do not fog out the product',
            'No smoke-like dirty haze',
            'Label readability must remain intact'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Shadow Pattern Projection': {
        id: 'shadow-pattern-projection',
        label: 'Shadow Pattern Projection',
        scope: 'studio',
        description: 'Projected shadow shapes adding modern editorial lighting and graphic depth.',
        basePrompt: 'projected shadow pattern across the scene, editorial light shaping, graphic depth, premium studio realism, product remains clearly readable',
        subOptions: [
            { key: 'patternType', label: 'Pattern Type', values: ['Window', 'Palm', 'Geometric'] },
            { key: 'shadowSharpness', label: 'Shadow Sharpness', values: ['Soft', 'Balanced'] },
            { key: 'coverage', label: 'Coverage', values: ['Background only', 'Partial product edge'] },
        ],
        constraints: [
            'Projected shadows must feel optical, not composited',
            'Do not bury the product in darkness',
            'Label readability must remain intact',
            'No chaotic or messy shadow clutter'
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },
    'Fruit Garnish / Citrus Accents': {
        id: 'fruit-garnish-citrus-accents',
        label: 'Fruit Garnish / Citrus Accents',
        scope: 'studio',
        description: 'Product staged with fresh citrus slices arranged in a premium flat lay composition.',
        basePrompt: 'product hero centered on clean surface surrounded by fresh citrus slices (orange, lemon, lime, or grapefruit) arranged in a natural premium flat lay pattern, top-down or slightly angled perspective, fresh cut citrus with visible pulp texture and natural juice droplets, soft directional natural light creating gentle shadows, clean minimal styling with product as hero and label fully readable',
        subOptions: [],
        constraints: [
            'Citrus slices must be fresh-cut and realistic (not artificial)',
            'Product remains dominant hero - citrus is supporting element',
            'Natural arrangement - avoid overly symmetrical or contrived patterns',
            'Label must remain fully readable and sharp'
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
        basePrompt: 'top-down flat lay product shot with product grounded in a dense, controlled textured ingredient bed (not just loose scatter), premium advertising styling, ingredient field wraps around product contact area with realistic compression and occlusion, product surface remains clean and dry with no drips or residue, label area remains clean and fully readable, keep composition intentional and premium',
        subOptions: [
            { key: 'depthLevel', label: 'Depth Level', values: ['Balanced', 'Subtle', 'Immersive'] },
        ],
        constraints: [
            'Textured bed must feel dense and physically grounded around product base',
            'No floating product; clear contact and compression into the ingredient bed',
            'Camera must be top-down flat lay (90° overhead)',
            'Product must stay clean: no drips, no residue, no foam/liquid attached to container',
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
        basePrompt: 'sunlit split-waterline composition: product intersects the water surface with upper section in bright clean air and lower section submerged in clear luminous aqua water, realistic curved meniscus at waterline, visible underwater caustics and light rays, crisp micro-bubbles around submerged edges, premium hydration look with strong product readability',
        subOptions: [
            { key: 'waterlineHeight', label: 'Waterline Height', values: ['Mid', 'Upper-mid'] },
            { key: 'bubbleDensity', label: 'Bubble Density', values: ['Low', 'Balanced'] },
            { key: 'aquaTone', label: 'Aqua Tone', values: ['Light blue', 'Cyan blue'] },
        ],
        constraints: [
            'Waterline must be physically coherent',
            'Product must clearly cross the waterline (split-level view), not fully submerged and not fully dry',
            'Submerged portion must clearly read as underwater with authentic light attenuation and caustic response',
            'Underwater refraction and caustics must be physically plausible',
            'No muddy water color',
            'Top half should read as bright daylight air environment, clean and minimal',
            'Label remains as readable as perspective allows',
        ],
        requiredPlacement: 'air',
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
    'Wine Macro Label': {
        id: 'wine-macro-label',
        label: 'Wine Macro Label',
        scope: 'studio',
        description: 'Extreme close-up cropped to label region only. No full bottle. No environment. Label fidelity is the only subject.',
        basePrompt: 'extreme macro close-up cropped to the wine bottle label region only, bottle neck excluded, bottle base excluded, frame centers on label panel, 100mm macro lens simulation, f/4 aperture, ultra-sharp label typography, high micro contrast, natural paper/foil texture, label fully readable with maximum detail fidelity',
        subOptions: [
            { key: 'macroTightness', label: 'Macro Tightness', values: ['Tight', 'Extreme'] },
            { key: 'highlightControl', label: 'Highlight Control', values: ['Soft', 'Balanced'] },
            { key: 'surfaceTone', label: 'Surface Tone', values: ['Dark neutral', 'Stone', 'Warm wood'] },
        ],
        constraints: [
            'FRAME_CONSTRAINT: Label region only. Neck and base must be cropped out or fully out of frame.',
            'COMPOSITION: Label panel centered. No environmental expansion.',
            'CAMERA: 100mm macro lens. f/4. No wide framing. No environment in background.',
            'NEGATIVE_SPACE_POLICY: Minimal. Label fills at least 70% of frame.',
            'No glass addition',
            'No full bottle framing',
            'No gradient background injection',
            'No clinical-softbox bloom',
            'No environment expansion',
            'Fallback to Hero Landing Page is FORBIDDEN',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },

    'Bottle + Glass': {
        id: 'bottle-and-glass',
        label: 'Bottle + Glass',
        scope: 'studio',
        description: 'Wine bottle and filled glass composition. Served state. Bottle sealed.',
        basePrompt: 'wine bottle and filled wine glass composition, bottle remains sealed, glass positioned at complementary angle, 3/4 camera angle, premium wine photography, label fully legible',
        subOptions: [
            { key: 'glassPosition', label: 'Glass Position', values: ['Right', 'Left', 'Behind'] },
            { key: 'fillLevel', label: 'Glass Fill Level', values: ['Half', 'Two-thirds'] },
            { key: 'surfaceType', label: 'Surface Type', values: ['Stone', 'Dark slate', 'Warm wood'] },
        ],
        constraints: [
            'Bottle must remain sealed',
            'Label fully readable',
            'Glass must contain wine liquid',
            'No full pour-in-progress motion',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },

    'Bottle + Glass Pour': {
        id: 'bottle-and-glass-pour',
        label: 'Bottle + Glass Pour',
        scope: 'studio',
        description: 'Bottle pours wine directly into a glass with controlled premium motion.',
        basePrompt: 'wine bottle actively pouring into a wine glass, elegant continuous liquid ribbon, premium cellar-grade commercial photography, label preserved and readable, liquid color rendered authentically',
        subOptions: [
            { key: 'pourAngle', label: 'Pour Angle', values: ['Three-quarter', 'Side profile'] },
            { key: 'streamShape', label: 'Stream Shape', values: ['Slow ribbon', 'Mid-flow elegance'] },
            { key: 'glassFill', label: 'Glass Fill', values: ['One-third', 'Half'] },
        ],
        constraints: [
            'Bottle must be visibly open during pour',
            'Liquid stream must remain controlled and elegant',
            'No explosive splash behavior',
            'Label must remain readable on the bottle',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },

    'Hands Pouring Wine': {
        id: 'hands-pouring-wine',
        label: 'Hands Pouring Wine',
        scope: 'studio',
        description: 'Cropped hands-only service action pouring wine into a glass.',
        basePrompt: 'cropped hands only pouring wine from bottle into wine glass, premium service ritual photography, bottle label remains visible, elegant hospitality framing, no faces, no full person',
        subOptions: [
            { key: 'handCrop', label: 'Hand Crop', values: ['Tight', 'Mid crop'] },
            { key: 'serviceMood', label: 'Service Mood', values: ['Tasting room', 'Fine dining'] },
            { key: 'glassFill', label: 'Glass Fill', values: ['One-third', 'Half'] },
        ],
        constraints: [
            'Only hands or forearms may appear',
            'No faces or full bodies',
            'Bottle must be visibly open during pour',
            'No chaotic splash behavior',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },

    'Wine Lineup Comparison': {
        id: 'wine-lineup-comparison',
        label: 'Wine Lineup Comparison',
        scope: 'studio',
        description: 'Multiple wine bottles arranged as a clean family lineup for brand or varietal comparison.',
        basePrompt: 'multiple wine bottles arranged in a refined comparison lineup, clean spacing, premium studio shadows, varietal color contrast visible, family-of-products commercial photography',
        subOptions: [
            { key: 'lineupCount', label: 'Bottle Count', values: ['Three', 'Four'] },
            { key: 'spacing', label: 'Spacing', values: ['Balanced', 'Wide'] },
            { key: 'surfaceTone', label: 'Surface Tone', values: ['White', 'Stone'] },
        ],
        constraints: [
            'Use product-family comparison framing',
            'Bottles must remain upright and clearly separated',
            'Clean shadow play is allowed',
            'No human presence',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },

    'Editorial Bottle Tabletop': {
        id: 'editorial-bottle-tabletop',
        label: 'Editorial Bottle Tabletop',
        scope: 'studio',
        description: 'Editorial tabletop still life with bottle, optional glass, and minimal premium props.',
        basePrompt: 'premium wine editorial tabletop still life, bottle hero on refined stone or marble surface, optional supporting glass, minimal premium props, soft luxury composition',
        subOptions: [
            { key: 'surfaceType', label: 'Surface Type', values: ['Stone', 'Marble', 'Warm wood'] },
            { key: 'glassSupport', label: 'Glass Support', values: ['None', 'Single glass'] },
            { key: 'propDensity', label: 'Prop Density', values: ['Minimal', 'Balanced'] },
        ],
        constraints: [
            'Bottle remains the hero subject',
            'Props must stay minimal and wine-appropriate',
            'No fantasy styling',
            'Label must remain readable',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },

    'Bottle In Hand Cutout': {
        id: 'bottle-in-hand-cutout',
        label: 'Bottle In Hand Cutout',
        scope: 'studio',
        description: 'Hand-only cutout hold against a clean premium backdrop.',
        basePrompt: 'wine bottle held by a single cropped hand against a clean premium backdrop, hand-only commercial cutout style, label fully visible, no face, no body, minimal art-direction',
        subOptions: [
            { key: 'backgroundTone', label: 'Background Tone', values: ['Soft pink', 'Warm neutral', 'Brand color'] },
            { key: 'holdAngle', label: 'Hold Angle', values: ['Diagonal', 'Straight'] },
            { key: 'cropTightness', label: 'Crop Tightness', values: ['Tight', 'Balanced'] },
        ],
        constraints: [
            'Only one cropped hand or forearm may appear',
            'No face or torso',
            'Backdrop must remain clean and minimal',
            'Bottle label must remain visible',
        ],
        requiredPlacement: 'held',
        allowedInteractions: ['holding'],
        allowsPersonPresence: false
    },

    'Rose Tasting Table': {
        id: 'rose-tasting-table',
        label: 'Rose Tasting Table',
        scope: 'studio',
        description: 'Bright tasting-table editorial scene optimized for rose or white wine service.',
        basePrompt: 'bright wine tasting table with poured rose or white wine, fresh glass highlights, light floral or picnic-adjacent accents, elegant social tasting atmosphere without people',
        subOptions: [
            { key: 'wineTone', label: 'Wine Tone', values: ['Rose', 'White'] },
            { key: 'tableMood', label: 'Table Mood', values: ['Fresh floral', 'Minimal tasting'] },
            { key: 'glassCount', label: 'Glass Count', values: ['One', 'Multiple'] },
        ],
        constraints: [
            'No people in frame',
            'Scene must feel bright and premium, not casual party',
            'Bottle or poured glass must remain clearly readable',
            'Props must remain refined and minimal',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },

    'Editorial Table': {
        id: 'editorial-table',
        label: 'Editorial Table',
        scope: 'studio',
        description: 'Wine editorial tabletop composition with controlled props and surface texture.',
        basePrompt: 'premium wine editorial tabletop composition, authentic surface texture, editorial balance, minimal controlled props, bottle as focal point with subtle environmental depth',
        subOptions: [
            { key: 'surfaceType', label: 'Surface Type', values: ['Stone', 'Dark slate', 'Warm wood', 'Marble'] },
            { key: 'propDensity', label: 'Prop Density', values: ['None', 'Minimal', 'Balanced'] },
            { key: 'lightingMood', label: 'Lighting Mood', values: ['Warm side', 'Dramatic', 'Diffused'] },
        ],
        constraints: [
            'No synthetic fog',
            'No fantasy backgrounds',
            'Label must be legible',
            'Props must be wine-appropriate only',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },

    'Winery Scene': {
        id: 'winery-scene',
        label: 'Winery Scene',
        scope: 'environment',
        description: 'Wine bottle in an authentic winery or cellar environment.',
        basePrompt: 'wine bottle in authentic winery environment, stone cellar or barrel room background, natural imperfect lighting, editorial depth of field, bottle as primary subject',
        subOptions: [
            { key: 'environment', label: 'Environment', values: ['Stone cellar', 'Barrel room', 'Vineyard terrace'] },
            { key: 'depthOfField', label: 'Depth of Field', values: ['Shallow', 'Moderate'] },
            { key: 'lightingMood', label: 'Lighting Mood', values: ['Warm ambient', 'Dramatic side', 'Golden hour'] },
        ],
        constraints: [
            'No stylized fog or fantasy atmosphere',
            'Bottle must be primary subject',
            'Label must be legible',
            'No CGI environment rendering',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none'],
        allowsPersonPresence: false
    },

    'Social Table Served': {
        id: 'social-table-served',
        label: 'Social Table Served',
        scope: 'environment',
        description: 'Product-led wine table scene with hospitality context and bottle-first readability.',
        basePrompt: 'product-led social table wine scene with bottle on table, one or more glasses, believable food pairing context, hands or partial cropped presence only when needed, hospitality realism, bottle remains visible and legible',
        subOptions: [
            { key: 'tableContext', label: 'Table Context', values: ['Minimal snacks', 'Shared plates', 'Hosting spread'] },
            { key: 'peoplePresence', label: 'People Presence', values: ['Hands only', 'Cropped people', 'Small group'] },
        ],
        constraints: [
            'Bottle must remain clearly visible and brand-legible',
            'No full-body portrait framing',
            'No selfie or influencer aesthetic',
            'Food props must feel real and wine-appropriate',
            'Use shared-table asymmetry and tactile surface realism, not a perfect styled set',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'passive-presence', 'cropped-hand', 'resting-interaction', 'presenting'],
        allowsPersonPresence: true
    },

    'Outdoor Toast': {
        id: 'outdoor-toast',
        label: 'Outdoor Toast',
        scope: 'environment',
        description: 'Product-led outdoor wine toast with natural daylight and visible action context.',
        basePrompt: 'product-led outdoor wine toast scene with raised glasses, bottle visible in the setup, natural daylight, relaxed premium hospitality, partial cropped presence only, believable celebration moment',
        subOptions: [
            { key: 'setting', label: 'Setting', values: ['Garden', 'Terrace', 'Picnic lawn'] },
            { key: 'groupSize', label: 'Group Size', values: ['Two', 'Three', 'Four'] },
        ],
        constraints: [
            'Bottle must stay visible in frame or clearly present on the table',
            'No chaotic crowd scene',
            'No nightlife or party-club styling',
            'Hospitality realism only',
            'Prefer garden, terrace, or picnic realism over cinematic landscape drama',
        ],
        requiredPlacement: 'held',
        allowedInteractions: ['holding', 'two-hand-hold', 'presenting', 'framed-presentation'],
        allowsPersonPresence: true
    },

    'Hosting Pour': {
        id: 'hosting-pour',
        label: 'Hosting Pour',
        scope: 'environment',
        description: 'Product-led wine hosting pour in a real hospitality setting.',
        basePrompt: 'product-led hosting wine pour in a real hospitality setting, bottle actively pouring into a receiving glass, cropped host support only, premium hospitality realism, table context secondary',
        subOptions: [
            { key: 'setting', label: 'Setting', values: ['Indoor hosting', 'Outdoor hosting'] },
            { key: 'cropStyle', label: 'Crop Style', values: ['Hands only', 'Cropped torso'] },
        ],
        constraints: [
            'Bottle must be naturally supported by a real hand or cropped host presence',
            'No levitation or impossible pour angle',
            'No full visible face required',
            'Glass must read as the receiving vessel',
            'Frame as real table-side or hosting service, not an abstract pour demo',
        ],
        requiredPlacement: 'held',
        allowedInteractions: ['holding', 'supported-hold', 'presenting'],
        allowsPersonPresence: true
    },

    'Dinner Pairing': {
        id: 'dinner-pairing',
        label: 'Dinner Pairing',
        scope: 'environment',
        description: 'Product-led wine bottle with plated food and dining context in a premium but real setting.',
        basePrompt: 'product-led wine dinner pairing scene with bottle, glasses, plated food, real dining table context, premium hospitality atmosphere, bottle remains commercially readable',
        subOptions: [
            { key: 'diningMood', label: 'Dining Mood', values: ['Restaurant', 'Home dinner', 'Terrace dining'] },
            { key: 'foodDensity', label: 'Food Density', values: ['Minimal pairing', 'Balanced table', 'Shared meal'] },
        ],
        constraints: [
            'Bottle must remain a strong readable subject',
            'Food styling must feel real, not ad-prop fake',
            'No overloaded banquet table',
            'No theatrical set design',
            'Use limited plated-food context with believable dining materials',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'passive-presence', 'cropped-hand', 'resting-interaction', 'presenting'],
        allowsPersonPresence: true
    },

    'Picnic Gathering': {
        id: 'picnic-gathering',
        label: 'Picnic Gathering',
        scope: 'environment',
        description: 'Product-led outdoor wine gathering with picnic cues and relaxed action context.',
        basePrompt: 'product-led wine picnic gathering with bottle, glasses, relaxed outdoor setting, simple premium food context, natural sunlight, hands or partial cropped presence only, lifestyle realism',
        subOptions: [
            { key: 'setting', label: 'Setting', values: ['Blanket picnic', 'Low table picnic', 'Park table'] },
            { key: 'peoplePresence', label: 'People Presence', values: ['Hands only', 'Cropped people', 'Small group'] },
        ],
        constraints: [
            'No influencer picnic fantasy styling',
            'Bottle must remain visible and legible',
            'No excessive props or floral overload',
            'Keep tone relaxed but premium',
            'Use casual hospitality cues, not wedding editorial picnic decor',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'passive-presence', 'cropped-hand', 'resting-interaction', 'presenting'],
        allowsPersonPresence: true
    },

    'Celebration Chill': {
        id: 'celebration-chill',
        label: 'Celebration Chill',
        scope: 'environment',
        description: 'Product-led chilled wine service scene with bucket, glasses, and restrained hospitality action.',
        basePrompt: 'product-led chilled wine service scene with glasses, cold hospitality cues, restrained action context, and believable premium atmosphere',
        subOptions: [
            { key: 'serviceStyle', label: 'Service Style', values: ['Ice bucket', 'Chilled table service'] },
            { key: 'groupMood', label: 'Group Mood', values: ['Intimate', 'Small group'] },
        ],
        constraints: [
            'Cold-service realism only',
            'No fake frost glamour or nightclub look',
            'Bottle and service context must remain believable',
            'Social presence must stay secondary to the bottle',
            'Condensation should feel tactile and photographic, not synthetic FX',
        ],
        requiredPlacement: 'surface',
        allowedInteractions: ['none', 'passive-presence', 'cropped-hand', 'presenting', 'resting-interaction'],
        allowsPersonPresence: true
    },
};

export function getSceneSchema(mode: string | undefined): EnvironmentPhotoModeSchema | undefined {
    const normalized = String(mode || '').trim();
    if (!normalized) return undefined;

    return (
        PHOTO_MODE_SCHEMAS[normalized as PhotoMode] ||
        VISUAL_STYLE_SCHEMAS[normalized as keyof typeof VISUAL_STYLE_SCHEMAS]
    );
}

import React, { useState, useEffect, useCallback } from 'react';
import {
  Hand,
  Layers,
  Building2,
  MapPin,
  Sun,
  Camera,
  Film,
  Scissors
} from 'lucide-react';
import { CAMERA_OPTIONS } from '../../constants';
import AccordionSection from './shared/AccordionSection';
import { getPillClass } from './shared/sceneBuilderConstants';
import type { ProductValues, Step3Values } from '@/types/step3Types';

const INTERACTION_OPTIONS = ['Holding', 'Using', 'Presenting', 'Unboxing / Open Box'];
const ASPECT_RATIO_OPTIONS = ['1:1 (Square)', '4:5 (Portrait)', '9:16 (Story)'];
const GRADIENT_ANGLE_OPTIONS: Array<'45' | '90' | '180'> = ['45', '90', '180'];
const COMPOSITION_MODE_OPTIONS = ['Ecommerce Blank Space'];
const PRODUCT_STRUCTURE_OPTIONS = [
  { label: 'Single Product', value: 'single', description: 'One product, the hero, is presented.' },
  { label: 'Bundle (2–3 products)', value: 'bundle', description: 'Small set: one held, others placed nearby.' },
  { label: 'Routine (multi-product)', value: 'routine', description: 'Step-based set with multiple items arranged together.' }
];
const SIDE_PLACEMENT_OPTIONS = ['Left', 'Center', 'Right'];
const PRODUCT_SETUP_TYPE_OPTIONS: Step3Values['productType'][] = ['capsules', 'gummies', 'drops', 'powder', 'skincare', 'device'];
const PRODUCT_SETUP_COUNT_OPTIONS: Step3Values['productCount'][] = [1, 2, 3, 4];
const PRODUCT_SETUP_SCALE_OPTIONS: Step3Values['productScale'][] = ['small', 'realistic', 'hero'];
const PRODUCT_VIEW_OPTIONS: Array<{ label: string; value: Step3Values['productViewPreset']; tooltip: string }> = [
  {
    label: 'Front View',
    value: 'front',
    tooltip: 'Camera at product height, facing straight on. Controls framing only; lighting, styling, and background remain unchanged.'
  },
  {
    label: 'Top View (Cenital)',
    value: 'top',
    tooltip: 'Camera positioned directly above the product, pointing straight down. Only geometry changes—no impact on lighting or props.'
  },
  {
    label: '45° Perspective',
    value: 'perspective45',
    tooltip: 'Camera set at a 45° diagonal from the product, showing depth and dimension. Does not alter lighting, texture, or styling.'
  },
  {
    label: 'High Angle',
    value: 'highAngle',
    tooltip: 'Camera placed above the product, angled down slightly. Affects hit framing only; lighting/background remain steady.'
  },
  {
    label: 'Low Angle',
    value: 'lowAngle',
    tooltip: 'Camera positioned below the product line, angling upward. Geometry shift only; no story or lighting changes.'
  },
  {
    label: 'Detail View',
    value: 'detail',
    tooltip: 'Camera tight on product details, accentuating texture/focus. Does not change lighting direction or environment.'
  },
  {
    label: 'Back / Side View',
    value: 'backSide',
    tooltip: 'Camera positioned behind or to the side of the product, showing profiles. Controls angle only, not props or lighting.'
  }
];
const PRODUCT_VIEW_PREVIEWS = [
  { label: 'Front', description: 'Square-on, straight horizon line' },
  { label: 'Top', description: 'Overhead flat lay, shadows below' },
  { label: '45°', description: 'Diagonal depth with visible sides' },
  { label: 'High', description: 'Looking down, background recedes' },
  { label: 'Low', description: 'Looking up, product looms' },
  { label: 'Detail', description: 'Close crop highlighting texture' },
  { label: 'Back / Side', description: 'Profile view of edges or labels' }
];
const PRODUCT_VIEW_CUSTOM_TOOLTIP =
  'Describe your own camera position and distance. This control only defines geometry, not lighting, props, or background.';
const PRODUCT_COMPOSITION_OPTIONS: Array<{ label: string; value: Step3Values['productCompositionPreset']; tooltip: string }> = [
  {
    label: 'Clean Studio Product',
    value: 'cleanStudio',
    tooltip:
      'Isolated product with controlled framing and minimal props. Allows crisp detail, polished lighting, and tight focus. Does not introduce ingredients, abstract elements, or lifestyle clutter.'
  },
  {
    label: 'Editorial Flat Lay',
    value: 'editorialFlatLay',
    tooltip:
      'Flat lay composition with balanced grouping on a surface. Allows lifestyle props that support the hero item, such as tools or accessories. Does not trigger candid people or UGC storytelling.'
  },
  {
    label: 'Ingredient Story',
    value: 'ingredientStory',
    tooltip:
      'Product surrounded by ingredients or flavor props to highlight formulation. Allows textures, powders, botanicals, or capsules as supporting elements. Does not add people, expressions, or emotional cues.'
  },
  {
    label: 'Abstract Benefit Visual',
    value: 'abstractBenefit',
    tooltip:
      'Uses abstract geometry, gradients, or light trails to convey benefit or function. Allows conceptual props like ripple patterns or floating halos. Does not depict real ingredients or literal usage.'
  },
  {
    label: 'Routine / Bundle Shot',
    value: 'routineBundle',
    tooltip:
      'Shows multiple kit components arranged with hierarchy and subtle motion. Allows stacking, layering, and packaging variations. Does not introduce hands, people, or narrative background scenes.'
  }
];
const ECOMMERCE_ALIGNMENT_OPTIONS: Array<{ label: string; value: Step3Values['ecommerceAlignment']; tooltip: string }> = [
  {
    label: 'Left',
    value: 'left',
    tooltip: 'Places the product on the left side of the frame to leave right-hand negative space for overlays. Does not change camera angle or perspective.'
  },
  {
    label: 'Center',
    value: 'center',
    tooltip: 'Centers the product in the frame for balanced layouts. Does not adjust camera height, lens, or background.'
  },
  {
    label: 'Right',
    value: 'right',
    tooltip: 'Pushes the product toward the right, leaving the left open for UI overlays. Does not touch lighting or depth.'
  }
];
const RESERVE_BLANK_SPACE_TOOLTIP =
  'Reserves clean negative space opposite the product for UI overlays. Does not add text, graphics, or imply final copy placement.';
const ENVIRONMENT_OPTIONS: Array<{ label: string; value: Step3Values['productEnvironment']; tooltip: string }> = [
  {
    label: 'Solid Brand Color',
    value: 'solidColor',
    tooltip: 'Solid background using brand color. Does not introduce lifestyle context or props.'
  },
  {
    label: 'Soft Gradient',
    value: 'softGradient',
    tooltip: 'Gradient backdrop with gentle blends. Allows tonal depth but not candid environments.'
  },
  {
    label: 'Studio Seamless',
    value: 'studioSeamless',
    tooltip: 'Seamless white or neutral studio background. Keeps product isolated, no lifestyle narrative.'
  },
  {
    label: 'Real Surface',
    value: 'realSurface',
    tooltip: 'Physical surface (counter, shelf). Allows textures but no messy lifestyle clutter.'
  }
];
const PRODUCT_LIGHTING_OPTIONS: Array<{ label: string; value: Step3Values['productLighting']; tooltip: string }> = [
  {
    label: 'Soft Studio Light',
    value: 'softStudio',
    tooltip: 'Even, diffused lighting for clean product clarity. Does not imply time of day or emotional mood.'
  },
  {
    label: 'Natural Window Light',
    value: 'naturalWindow',
    tooltip: 'Soft directional light mimicking a window source. Does not introduce lifestyle context or narrative.'
  },
  {
    label: 'Controlled Directional Light',
    value: 'controlledDirectional',
    tooltip: 'Focused directional illumination with crisp shadows for definition. Does not suggest candid or handheld capture.'
  }
];
const PRODUCT_OUTPUT_FORMAT_OPTIONS: Array<{ label: string; value: Step3Values['productOutputFormat']; tooltip: string }> = [
  {
    label: '1:1 (Square)',
    value: '1x1',
    tooltip: 'Square output format for product listings and feeds. Does not change camera position or composition logic.'
  },
  {
    label: '4:5 (Vertical)',
    value: '4x5',
    tooltip: 'Vertical format commonly used in ecommerce ads. Does not reposition the product automatically.'
  },
  {
    label: '16:9 (Landscape)',
    value: '16x9',
    tooltip: 'Widescreen crop for hero banners. Does not affect camera framing or styling decisions.'
  }
];
const PRODUCT_INTERACTION_EDITORIAL_OPTIONS: Array<{ label: string; value: NonNullable<Step3Values['productInteractionEditorial']>; tooltip: string }> = [
  {
    label: 'No Interaction',
    value: 'none',
    tooltip: 'Product-only shot with no hands or human elements. Does not introduce faces, people, or emotional cues.'
  },
  {
    label: 'Hands Holding Product',
    value: 'handsHolding',
    tooltip: 'Editorial hands holding the product. No faces, no people, no emotion, and no lifestyle context.'
  },
  {
    label: 'Hands Opening Product',
    value: 'handsOpening',
    tooltip: 'Hands opening or unveiling the product in a controlled editorial setup. Does not imply usage or narrative storytelling.'
  },
  {
    label: 'Hands Placing Product',
    value: 'handsPlacing',
    tooltip: 'Hands lowering or placing the product onto a surface. Keeps the hands as props—no faces, people, or candid context.'
  }
];
const SHOT_TYPE_OPTIONS = ['Extreme close-up', 'Close', 'Medium', 'Wide', 'Full body'];
const CAMERA_ANGLE_OPTIONS = [
  'Eye level',
  'Slightly above eye level',
  'Slightly below eye level',
  'High angle',
  'Low angle',
  'Top-down',
  'Bottom-up'
];


const initialValues: ProductValues = {
  productInteraction: 'Holding',
  productUsageDescription: '',
  productStructure: 'single',
  productType: null,
  productCount: 1,
  productScale: 'realistic',
  isBundle: false,
  productViewPreset: 'front',
  productViewCustomText: null,
  productCompositionPreset: null,
  ecommerceAlignment: 'center',
  reserveBlankSpace: false,
  productEnvironment: 'solidColor',
  backgroundColorHint: '',
  productLighting: null,
  productOutputFormat: '1x1',
  productInteractionEditorial: 'none',
  compositionMode: '',
  sidePlacement: 'Center',
  ecommerceBackgroundColor: '#ffffff',
  ecommerceBackgroundMode: 'white',
  ecommerceGradientStart: '#f7f7f7',
  ecommerceGradientEnd: '#d9d9d9',
  ecommerceGradientAngle: '90',
  cameraType: CAMERA_OPTIONS[0]?.label ?? 'Smartphone',
  shotType: 'Medium',
  cameraAngle: 'Eye level'
};

interface SceneBuilderProductProps {
  onValuesChange?: (values: ProductValues) => void;
  onCanGenerateChange?: (canGenerate: boolean) => void;
}

const SceneBuilderProduct: React.FC<SceneBuilderProductProps> = ({
  onValuesChange,
  onCanGenerateChange,
}) => {
  const [openAccordionId, setOpenAccordionId] = useState<string | null>('productSetup');
  const [touchedSections, setTouchedSections] = useState<Set<string>>(new Set());
  const [values, setValues] = useState<ProductValues>(initialValues);

  const toggleSection = useCallback((section: string) => {
    setOpenAccordionId(prev => (prev === section ? null : section));
  }, []);

  const markSectionTouched = useCallback((section: string) => {
    setTouchedSections(prev => {
      const next = new Set(prev);
      next.add(section);
      return next;
    });
  }, []);

  const updateValue = useCallback(<K extends keyof ProductValues>(key: K, value: ProductValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleGradientColorChange = useCallback((key: 'ecommerceGradientStart' | 'ecommerceGradientEnd', color: string) => {
    updateValue(key, color as any);
    markSectionTouched('bundles');
  }, [updateValue, markSectionTouched]);

  const invertGradient = useCallback(() => {
    setValues(prev => ({
      ...prev,
      ecommerceGradientStart: prev.ecommerceGradientEnd,
      ecommerceGradientEnd: prev.ecommerceGradientStart
    }));
    markSectionTouched('bundles');
  }, [markSectionTouched]);

  const selectProductViewPreset = useCallback((value: Step3Values['productViewPreset'] | 'custom') => {
    setValues(prev => {
      if (value === 'custom') {
        return { ...prev, productViewPreset: null, productViewCustomText: prev.productViewCustomText ?? '' };
      }
      return { ...prev, productViewPreset: value, productViewCustomText: null };
    });
    markSectionTouched('productViews');
  }, [markSectionTouched]);

  const toggleCompositionMode = useCallback((option: string) => {
    setValues(prev => {
      const newValue = prev.compositionMode === option ? '' : option;
      const next = { ...prev, compositionMode: newValue } as ProductValues;
      if (!newValue) {
        next.sidePlacement = 'Center';
      }
      return next;
    });
    markSectionTouched('bundles');
  }, [markSectionTouched]);

  useEffect(() => {
    onValuesChange?.(values);
  }, [values, onValuesChange]);

  useEffect(() => {
    onCanGenerateChange?.(true);
  }, [onCanGenerateChange]);

  const shouldShowIngredientDescription =
    values.productInteraction === 'Using' || values.productCompositionPreset === 'ingredientStory';

  const productInteractionSection = (
    <AccordionSection
      icon={Hand}
      title="Product Interaction"
      tooltip="Control how the creator handles the product"
      isOpen={openAccordionId === 'productInteraction'}
      onToggle={() => toggleSection('productInteraction')}
      isTouched={touchedSections.has('productInteraction')}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {INTERACTION_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => { updateValue('productInteraction', option); markSectionTouched('productInteraction'); }}
              className={getPillClass(values.productInteraction === option)}
            >
              {option}
            </button>
          ))}
        </div>
        {shouldShowIngredientDescription && (
          <div className="mt-2">
            <p className="mb-2 text-[11px] text-gray-400">
              {values.productCompositionPreset === 'ingredientStory'
                ? 'Describe the ingredient or formulation props that should surround the product.'
                : 'Describe how the creator uses the product.'}
            </p>
            <textarea
              value={values.productUsageDescription}
              onChange={(event) => {
                updateValue('productUsageDescription', event.target.value);
                markSectionTouched('productInteraction');
              }}
              placeholder={
                values.productCompositionPreset === 'ingredientStory'
                  ? 'Example: loose capsules, vitamin powder, botanical leaves, measuring scoop'
                  : 'Describe how the creator uses the product'
              }
              className="w-full rounded-lg border border-gray-600 bg-gray-900/60 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              rows={3}
            />
          </div>
        )}
      </div>
    </AccordionSection>
  );

  const productStructureSection = (
    <AccordionSection
      icon={Layers}
      title="Product Structure"
      tooltip="Define how products are grouped and placed"
      isOpen={openAccordionId === 'productStructure'}
      onToggle={() => toggleSection('productStructure')}
      isTouched={touchedSections.has('productStructure')}
    >
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider text-indigo-200">Group & count</p>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_STRUCTURE_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                updateValue('productStructure', option.value as Step3Values['productStructure']);
                markSectionTouched('productStructure');
              }}
              className={getPillClass(values.productStructure === option.value)}
            >
              <span className="flex flex-col text-left">
                <span>{option.label}</span>
                <span className="text-[10px] text-gray-400">{option.description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </AccordionSection>
  );

  const productSetupSection = (
    <AccordionSection
      icon={Film}
      title="Product Setup"
      tooltip="Define the hero SKU, packaging, and scale"
      isOpen={openAccordionId === 'productSetup'}
      onToggle={() => toggleSection('productSetup')}
      isTouched={touchedSections.has('productSetup')}
    >
      <div className="space-y-6">
        <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-800/20 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-indigo-200">Product Type</p>
            <p className="text-[11px] text-gray-500">Single-select form factor, no camera or lighting changes.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_SETUP_TYPE_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  updateValue('productType', option);
                  markSectionTouched('productSetup');
                }}
                className={getPillClass(values.productType === option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-800/20 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-indigo-200">Product Count</p>
            <p className="text-[11px] text-gray-500">Select how many SKUs appear in frame.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_SETUP_COUNT_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  updateValue('productCount', option);
                  markSectionTouched('productSetup');
                }}
                className={getPillClass(values.productCount === option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/20 p-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-200">Bundle / Routine</p>
            <p className="text-[11px] text-gray-500">Toggle on for grouped kits.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={values.isBundle}
            onClick={() => {
              updateValue('isBundle', !values.isBundle);
              markSectionTouched('productSetup');
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${values.isBundle ? 'bg-indigo-500' : 'bg-gray-600'}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${values.isBundle ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>

        <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-800/20 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-indigo-200">Product Scale</p>
            <p className="text-[11px] text-gray-500">Choose emphasis size; does not affect camera geometry.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_SETUP_SCALE_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  updateValue('productScale', option);
                  markSectionTouched('productSetup');
                }}
                className={getPillClass(values.productScale === option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AccordionSection>
  );

  const productViewsSection = (
    <AccordionSection
      icon={Camera}
      title="Product Views"
      tooltip="Defines the camera geometry relative to the product"
      isOpen={openAccordionId === 'productViews'}
      onToggle={() => toggleSection('productViews')}
      isTouched={touchedSections.has('productViews')}
    >
      <div className="space-y-4">
        <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-800/20 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-indigo-200">View Presets</p>
            <p className="text-[11px] text-gray-500">Only camera position changes; lighting and props remain untouched.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_VIEW_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => selectProductViewPreset(option.value)}
                className={getPillClass(values.productViewPreset === option.value)}
                title={option.tooltip}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => selectProductViewPreset('custom')}
              className={getPillClass(values.productViewPreset === null && values.productViewCustomText !== null)}
              title={PRODUCT_VIEW_CUSTOM_TOOLTIP}
            >
              Custom View
            </button>
          </div>
        </div>

        {values.productViewCustomText !== null && (
          <div className="space-y-2 rounded-lg border border-gray-700 bg-gray-900/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-indigo-200">Custom View Notes</p>
              <p className="text-[11px] text-gray-500">Describe the camera height, distance, or tilt.</p>
            </div>
            <input
              type="text"
              value={values.productViewCustomText ?? ''}
              onChange={(event) => {
                updateValue('productViewCustomText', event.target.value);
                markSectionTouched('productViews');
              }}
              placeholder="e.g., low-angle slider shot angled at 10°, no props visible"
              className="w-full rounded-lg border border-gray-600 bg-gray-900/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}

        <div className="space-y-2 rounded-lg border border-gray-700 bg-gray-900/20 p-4">
          <p className="text-xs uppercase tracking-wider text-indigo-200">Static preview grid</p>
          <div className="grid grid-cols-2 gap-3">
            {PRODUCT_VIEW_PREVIEWS.map(preview => (
              <div key={preview.label} className="flex flex-col gap-1 rounded-lg border border-dotted border-gray-600 bg-gray-950/40 p-2 text-[11px] text-gray-400">
                <div className="h-12 w-full rounded border border-gray-700 bg-gradient-to-tr from-white/10 to-black/40" />
                <p className="font-semibold text-white">{preview.label}</p>
                <p className="text-[10px] text-gray-500">{preview.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AccordionSection>
  );

  const productCompositionSection = (
    <AccordionSection
      icon={Layers}
      title="Product Composition"
      tooltip="Defines the creative intent for framing, realism, and props"
      isOpen={openAccordionId === 'productComposition'}
      onToggle={() => toggleSection('productComposition')}
      isTouched={touchedSections.has('productComposition')}
    >
      <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-900/60 p-4">
        <p className="text-[11px] text-gray-500">
          Presets control framing logic, realism tolerance, and prop allowance without touching camera or ecommerce layout.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_COMPOSITION_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                updateValue('productCompositionPreset', option.value);
                markSectionTouched('productComposition');
              }}
              className={getPillClass(values.productCompositionPreset === option.value)}
              title={option.tooltip}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </AccordionSection>
  );

  const ecommerceLayoutSection = (
    <AccordionSection
      icon={Layers}
      title="Ecommerce Layout"
      tooltip="Controls product alignment and overlay space inside the frame"
      isOpen={openAccordionId === 'ecommerceLayout'}
      onToggle={() => toggleSection('ecommerceLayout')}
      isTouched={touchedSections.has('ecommerceLayout')}
    >
      <div className="space-y-4">
        <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-800/20 p-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-200">Image Alignment</p>
            <p className="text-[11px] text-gray-400 mt-1">Positions the product within the frame for ecommerce layouts.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ECOMMERCE_ALIGNMENT_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  updateValue('ecommerceAlignment', option.value);
                  markSectionTouched('ecommerceLayout');
                }}
                className={getPillClass(values.ecommerceAlignment === option.value)}
                title={option.tooltip}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/20 p-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-200">Reserve Blank Space</p>
            <p className="text-[11px] text-gray-400 mt-1">Creates clean room opposite the product for UI overlays.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={values.reserveBlankSpace}
            onClick={() => {
              updateValue('reserveBlankSpace', !values.reserveBlankSpace);
              markSectionTouched('ecommerceLayout');
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${values.reserveBlankSpace ? 'bg-indigo-500' : 'bg-gray-600'}`}
            title={RESERVE_BLANK_SPACE_TOOLTIP}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${values.reserveBlankSpace ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </div>
    </AccordionSection>
  );

  const productEnvironmentSection = (
    <AccordionSection
      icon={MapPin}
      title="Environment & Background"
      tooltip="Product-safe background selections only"
      isOpen={openAccordionId === 'productEnvironment'}
      onToggle={() => toggleSection('productEnvironment')}
      isTouched={touchedSections.has('productEnvironment')}
    >
      <div className="space-y-4">
        <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-800/20 p-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-200">Environment Type</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Select backgrounds that keep the product isolated or on clean surfaces.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ENVIRONMENT_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  updateValue('productEnvironment', option.value);
                  markSectionTouched('productEnvironment');
                }}
                className={getPillClass(values.productEnvironment === option.value)}
                title={option.tooltip}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-gray-700 bg-gray-900/30 p-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-200">Background Color / Tone</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Hint the color or tonal direction of the background.
            </p>
          </div>
          <input
            type="text"
            value={values.backgroundColorHint ?? ''}
            onChange={(event) => {
              updateValue('backgroundColorHint', event.target.value);
              markSectionTouched('productEnvironment');
            }}
            placeholder="e.g., pale beige gradient with soft amber glow"
            className="w-full rounded-lg border border-gray-600 bg-gray-900/50 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
    </AccordionSection>
  );

  const productInteractionEditorialSection = (
    <AccordionSection
      icon={Hand}
      title="Product Interaction"
      tooltip="Editorial hands-only handling for the product"
      isOpen={openAccordionId === 'productInteractionEditorial'}
      onToggle={() => toggleSection('productInteractionEditorial')}
      isTouched={touchedSections.has('productInteractionEditorial')}
    >
      <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-900/60 p-4">
        <p className="text-[11px] text-gray-500">
          Hands are props—choose how they hold, open, or place the hero product.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_INTERACTION_EDITORIAL_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                updateValue('productInteractionEditorial', option.value);
                markSectionTouched('productInteractionEditorial');
              }}
              className={getPillClass(values.productInteractionEditorial === option.value)}
              title={option.tooltip}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </AccordionSection>
  );

  const productLightingSection = (
    <AccordionSection
      icon={Sun}
      title="Lighting"
      tooltip="Control illumination clarity"
      isOpen={openAccordionId === 'productLighting'}
      onToggle={() => toggleSection('productLighting')}
      isTouched={touchedSections.has('productLighting')}
    >
      <div className="space-y-3">
        <p className="text-[11px] text-gray-500">
          Define the technical light source for product clarity without narrative language.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_LIGHTING_OPTIONS.map(option => (
            <button
              key={option.value ?? 'none'}
              type="button"
              onClick={() => {
                updateValue('productLighting', option.value);
                markSectionTouched('productLighting');
              }}
              className={getPillClass(values.productLighting === option.value)}
              title={option.tooltip}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </AccordionSection>
  );

  const productOutputFormatSection = (
    <AccordionSection
      icon={Layers}
      title="Output Format"
      tooltip="Choose final aspect ratio without affecting composition"
      isOpen={openAccordionId === 'productOutputFormat'}
      onToggle={() => toggleSection('productOutputFormat')}
      isTouched={touchedSections.has('productOutputFormat')}
    >
      <div className="space-y-3">
        <p className="text-[11px] text-gray-500">
          Pick the renderer framing. This only affects export crop.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_OUTPUT_FORMAT_OPTIONS.map(option => (
            <button
              key={option.value ?? 'none'}
              type="button"
              onClick={() => {
                updateValue('productOutputFormat', option.value);
                markSectionTouched('productOutputFormat');
              }}
              className={getPillClass(values.productOutputFormat === option.value)}
              title={option.tooltip}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </AccordionSection>
  );

  const ecommerceImageBuilderSection = (
    <AccordionSection
      icon={Building2}
      title="Ecommerce Image Builder"
      tooltip="PDP, ads, bundles, hero ecommerce visuals"
      isOpen={openAccordionId === 'bundles'}
      onToggle={() => toggleSection('bundles')}
      isTouched={touchedSections.has('bundles')}
    >
      <div className="space-y-4">
        <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-200">Composition Mode</p>
            <p className="text-[11px] text-gray-400 mt-1">Select ecommerce composition style</p>
          </div>
          <div className="flex flex-col gap-2">
            {COMPOSITION_MODE_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => toggleCompositionMode(option)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${values.compositionMode === option
                  ? 'border-indigo-400 bg-indigo-500/10 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
              >
                <span className="font-medium">{option}</span>
                <p className="text-[10px] text-gray-400 mt-0.5">PDP hero, ads, editorial product shots</p>
              </button>
            ))}
          </div>
        </div>

        {values.compositionMode === 'Ecommerce Blank Space' && (
          <>
            <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
              <div>
                <p className="text-xs uppercase tracking-wider text-indigo-200">Side Placement</p>
                <p className="text-[11px] text-gray-400 mt-1">Product anchor position for copy space</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SIDE_PLACEMENT_OPTIONS.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      updateValue('sidePlacement', option);
                      markSectionTouched('bundles');
                    }}
                    className={getPillClass(values.sidePlacement === option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5 rounded-xl border border-white/10 bg-gradient-to-b from-gray-900/60 to-gray-900/30 p-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-indigo-300">Background</p>
                <p className="text-sm text-gray-300">Canvas style for product renders</p>
              </div>
              <div className="inline-flex rounded-full bg-gray-800/50 p-1">
                {(['white', 'gradient'] as Step3Values['ecommerceBackgroundMode'][]).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      updateValue('ecommerceBackgroundMode', mode);
                      markSectionTouched('bundles');
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${values.ecommerceBackgroundMode === mode
                      ? 'bg-white text-black shadow'
                      : 'text-gray-300 hover:text-white'
                      }`}
                  >
                    {mode === 'white' ? 'Pure White' : 'Gradient'}
                  </button>
                ))}
              </div>
              {values.ecommerceBackgroundMode === 'white' ? (
                <div className="rounded-xl border border-white/15 bg-gray-900/60 px-3 py-3 text-sm text-gray-300">
                  Background locked to pure #FFFFFF for PDP hero compliance. No color overrides allowed.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'ecommerceGradientStart', label: 'Start color', value: values.ecommerceGradientStart },
                      { key: 'ecommerceGradientEnd', label: 'End color', value: values.ecommerceGradientEnd }
                    ].map(cfg => (
                      <div key={cfg.key} className="space-y-2">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">{cfg.label}</p>
                        <label className="relative flex items-center gap-3 rounded-xl bg-gray-800/40 p-3 cursor-pointer hover:bg-gray-800/60 transition">
                          <div
                            className="h-10 w-10 rounded-lg ring-1 ring-white/20"
                            style={{ background: cfg.value }}
                          />
                          <input
                            type="text"
                            value={cfg.value}
                            onChange={(e) => handleGradientColorChange(cfg.key as 'ecommerceGradientStart' | 'ecommerceGradientEnd', e.target.value)}
                            className="w-full bg-transparent text-sm text-gray-200 focus:outline-none"
                          />
                          <input
                            type="color"
                            value={cfg.value}
                            onChange={(e) => handleGradientColorChange(cfg.key as 'ecommerceGradientStart' | 'ecommerceGradientEnd', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={values.ecommerceGradientAngle}
                      onChange={(e) => {
                        updateValue('ecommerceGradientAngle', e.target.value as Step3Values['ecommerceGradientAngle']);
                        markSectionTouched('bundles');
                      }}
                      className="rounded-full bg-gray-800/60 px-3 py-1.5 text-sm text-gray-200 focus:outline-none"
                    >
                      {GRADIENT_ANGLE_OPTIONS.map(angle => (
                        <option key={angle} value={angle}>{angle}°</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={invertGradient}
                      className="rounded-full bg-gray-800/60 px-3 py-1.5 text-sm text-gray-300 hover:text-white transition"
                    >
                      Invert
                    </button>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10">
                    <div
                      className="h-24 w-full"
                      style={{
                        background: `linear-gradient(${values.ecommerceGradientAngle}deg, ${values.ecommerceGradientStart}, ${values.ecommerceGradientEnd})`
                      }}
                    />
                    <div className="absolute inset-0 ring-1 ring-black/5" />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </AccordionSection>
  );

  const cameraContent = (
    <div className="space-y-3">
      <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
        <div>
          <p className="text-xs uppercase tracking-wider text-indigo-200">Camera Type</p>
          <p className="text-[11px] text-gray-400 mt-1">Select the capture device aesthetic</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CAMERA_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                updateValue('cameraType', option.label);
                markSectionTouched('camera');
              }}
              className={getPillClass(values.cameraType === option.label)}
              title={option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
        <p className="text-xs uppercase tracking-wider text-indigo-200">Shot Type</p>
        <div className="flex flex-wrap gap-2">
          {SHOT_TYPE_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => {
                updateValue('shotType', option);
                markSectionTouched('camera');
              }}
              className={getPillClass(values.shotType === option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-3 rounded-lg border border-gray-700 bg-gray-800/20">
        <p className="text-xs uppercase tracking-wider text-indigo-200">Camera Angle</p>
        <div className="flex flex-wrap gap-2">
          {CAMERA_ANGLE_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => {
                updateValue('cameraAngle', option);
                markSectionTouched('camera');
              }}
              className={getPillClass(values.cameraAngle === option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const bundlesPanel = values.productCount && values.productCount > 1 && (
    <div id="bundles" className="mt-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Bundles</p>
          <p className="text-sm text-gray-400">
            Quickly swap between curated packs, your own mix, or AI-recommended combos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-full border px-3 py-1 text-xs font-semibold transition border-indigo-400 bg-indigo-500/10 text-white">
            Pre-made Bundles
          </button>
          <button type="button" className="rounded-full border px-3 py-1 text-xs font-semibold transition border-white/15 text-gray-300 hover:border-indigo-400 hover:text-white">
            Custom Bundle Builder
          </button>
          <button type="button" className="rounded-full border px-3 py-1 text-xs font-semibold transition border-white/15 text-gray-300 hover:border-indigo-400 hover:text-white">
            Recommended Bundles
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-gray-400">Pick a bundle</label>
            <select className="rounded-lg border border-white/15 bg-gray-900/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none">
              <option value="essentials_trio">Core Essentials Trio</option>
              <option value="daily_duo">Daily Duo Stack</option>
              <option value="launch_showcase">Launch Showcase Set</option>
              <option value="hero_lineup">Complete Hero Lineup</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-4 space-y-3">
            <p className="text-sm font-semibold text-white">Core Essentials Trio</p>
            <p className="text-xs text-amber-200">Add another product to enable bundles.</p>

            <div className="flex flex-wrap gap-3">
              <div className="w-28 text-center text-xs text-gray-300">
                <div className="relative h-28 w-full overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  <img className="h-full w-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] font-semibold text-amber-200">
                    Upload to fill
                  </div>
                </div>
                <p className="mt-1 text-[11px]">Product 1</p>
              </div>
            </div>
          </div>

          <button type="button" disabled className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-indigo-900/50">
            Generate Bundle Mockup
          </button>
        </div>
      </div>
    </div>
  );

  const advancedSection = (
    <AccordionSection
      icon={Scissors}
      title="Advanced (Pro)"
      tooltip="Editorial camera and bundle controls"
      isOpen={openAccordionId === 'advancedPro'}
      onToggle={() => toggleSection('advancedPro')}
      isTouched={touchedSections.has('advancedPro')}
    >
      <div className="space-y-4">
        {cameraContent}
        {bundlesPanel}
      </div>
    </AccordionSection>
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-4">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-indigo-300">Product Builder</p>
        <h2 className="text-2xl font-bold text-gray-200">Product & Ecommerce</h2>
        <p className="text-sm text-gray-400">Manage ecommerce-first render options without lifestyle toggles.</p>
      </div>

      {productSetupSection}
      {productInteractionSection}
      {productStructureSection}
      {productViewsSection}
      {productCompositionSection}
      {ecommerceLayoutSection}
      {productEnvironmentSection}
      {productInteractionEditorialSection}
      {productLightingSection}
      {productOutputFormatSection}
      {ecommerceImageBuilderSection}
      {advancedSection}
    </div>
  );
};

export default SceneBuilderProduct;

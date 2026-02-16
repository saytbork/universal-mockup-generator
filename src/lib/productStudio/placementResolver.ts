import type { ProductPlacement } from './types';

export type PlacementPhotoType = 'photo-studio' | 'environment';

export type PlacementOption = {
  id: ProductPlacement;
  label: string;
  description: string;
  enabled: boolean;
  disabledReason?: string;
};

export type PlacementResolution = {
  requestedPlacement: ProductPlacement;
  resolvedPlacement: ProductPlacement;
  corrected: boolean;
  correctionReason: string | null;
  label: string;
  promptFragment: string;
};

const normalize = (value: unknown): string =>
  String(value || '')
    .trim()
    .toLowerCase();

export const isUnderwaterPhotoMode = (photoMode: string): boolean => {
  const key = normalize(photoMode);
  return key.includes('underwater');
};

export const isSplashDynamicPhotoMode = (photoMode: string): boolean => {
  const key = normalize(photoMode);
  return (
    key.includes('splash') ||
    key.includes('foam') ||
    key.includes('pool water') ||
    key.includes('wet rock') ||
    key.includes('waterline')
  );
};

export function getPlacementOptionsForContext(
  photoType: PlacementPhotoType,
  photoMode: string
): PlacementOption[] {
  const underwater = photoType === 'environment' && isUnderwaterPhotoMode(photoMode);
  const splashDynamic = photoType === 'environment' && isSplashDynamicPhotoMode(photoMode);

  if (photoType === 'photo-studio') {
    return [
      { id: 'surface', label: 'Surface', description: 'Product rests on a real studio surface.', enabled: true },
      { id: 'held', label: 'Held', description: 'Product is physically held with realistic grip contact.', enabled: true },
      { id: 'supported', label: 'Supported', description: 'Product sits on a visible stand or support.', enabled: true },
      { id: 'air', label: 'Air / Suspended', description: 'Product is suspended in studio with anchor shadows.', enabled: true },
    ];
  }

  if (underwater) {
    return [
      { id: 'surface', label: 'Submerged', description: 'Product is fully submerged with coherent water depth cues.', enabled: true },
      {
        id: 'supported',
        label: 'Contact with seabed',
        description: 'Product has stable contact with seabed/rock and realistic sediment interaction.',
        enabled: true
      },
      {
        id: 'floating',
        label: 'Floating buoyancy',
        description: 'Neutral buoyancy float with realistic drag and no studio suspension behavior.',
        enabled: true
      },
      {
        id: 'air',
        label: 'Air / Suspended',
        description: 'Studio-like suspension is incoherent in underwater world mode.',
        enabled: false,
        disabledReason: 'Underwater scenes require submerged, seabed contact, or floating buoyancy.'
      },
      {
        id: 'held',
        label: 'Held',
        description: 'Hand-held placement is incoherent in underwater world mode.',
        enabled: false,
        disabledReason: 'Underwater scenes require submerged, seabed contact, or floating buoyancy.'
      },
    ];
  }

  return [
    { id: 'surface', label: 'Surface', description: 'Product rests on a real environmental surface.', enabled: true },
    { id: 'held', label: 'Held', description: 'Product is held naturally within the environment.', enabled: true },
    { id: 'supported', label: 'Supported', description: 'Product is stabilized by tray/rock/prop support.', enabled: true },
    {
      id: 'floating',
      label: 'Waterline interaction',
      description: splashDynamic
        ? 'Partial waterline / buoyant interaction with physically coherent contact and splash dynamics.'
        : 'Waterline interaction is available only in water/splash-driven environment modes.',
      enabled: splashDynamic,
      ...(splashDynamic
        ? {}
        : { disabledReason: 'Waterline interaction requires a water/splash photo mode.' }),
    },
    {
      id: 'air',
      label: splashDynamic ? 'Dynamic airborne lift' : 'Air / Suspended',
      description: splashDynamic
        ? 'Allowed only with physically justified splash or wind dynamics.'
        : 'Pure suspension is incoherent in this environment mode.',
      enabled: splashDynamic,
      ...(splashDynamic
        ? {}
        : { disabledReason: 'Air/suspended placement is disabled unless splash/wind dynamics physically justify lift.' }),
    },
  ];
}

function buildStudioPlacementPrompt(resolvedPlacement: ProductPlacement): string {
  if (resolvedPlacement === 'supported') {
    return [
      'Placement resolved: supported studio setup.',
      'Product sits on a visible stand, tray, or pedestal with stable balance and coherent contact shadows.'
    ].join(' ');
  }
  if (resolvedPlacement === 'air') {
    return [
      'Placement resolved: studio suspended composition.',
      'Product is suspended in controlled studio space with physically plausible anchor shadows and coherent perspective.'
    ].join(' ');
  }
  if (resolvedPlacement === 'held') {
    return [
      'Placement resolved: hand-held studio composition.',
      'Product is clearly held with realistic finger pressure, grip contact, and physical support.'
    ].join(' ');
  }
  if (resolvedPlacement === 'floating') {
    return [
      'Placement resolved: grounded studio surface.',
      'Floating buoyancy is not used in studio mode; product remains physically grounded with coherent contact shadows.'
    ].join(' ');
  }
  return [
    'Placement resolved: grounded studio surface.',
    'Product rests on a real studio surface with coherent grounding and contact shadows.'
  ].join(' ');
}

function buildUnderwaterPlacementPrompt(resolvedPlacement: ProductPlacement): string {
  if (resolvedPlacement === 'supported') {
    return [
      'Placement resolved: contact with seabed/rock.',
      'Product remains physically grounded against underwater terrain with stable contact and realistic water drag.'
    ].join(' ');
  }
  if (resolvedPlacement === 'floating') {
    return [
      'Placement resolved: floating buoyancy.',
      'Product drifts with realistic neutral buoyancy and water resistance; no studio-style suspension cues.'
    ].join(' ');
  }
  return [
    'Placement resolved: submerged product form.',
    'Product is fully submerged with physically coherent depth, refraction, and waterline behavior.'
  ].join(' ');
}

function buildEnvironmentPlacementPrompt(
  resolvedPlacement: ProductPlacement,
  photoMode: string
): string {
  if (resolvedPlacement === 'supported') {
    return [
      'Placement resolved: environmentally supported setup.',
      'Product is stabilized by a real support element with believable weight transfer and contact shadows.'
    ].join(' ');
  }
  if (resolvedPlacement === 'floating') {
    return [
      'Placement resolved: partial waterline interaction.',
      'Product engages shallow waterline/buoyancy behavior with realistic wet contact, splash response, and stable physical coherence.'
    ].join(' ');
  }
  if (resolvedPlacement === 'air') {
    return [
      'Placement resolved: dynamic environmental lift.',
      `Use airborne positioning only when physically justified by ${photoMode || 'the selected mode'} (wind/splash momentum) with coherent trajectory and grounding cues.`
    ].join(' ');
  }
  if (resolvedPlacement === 'held') {
    return [
      'Placement resolved: hand-held environmental composition.',
      'Product is physically held within the scene with realistic hand mechanics and contact pressure.'
    ].join(' ');
  }
  return [
    'Placement resolved: grounded environmental surface.',
    'Product rests on a real environmental surface with stable grounding and coherent contact shadows.'
  ].join(' ');
}

export function resolvePlacement(
  photoType: PlacementPhotoType,
  photoMode: string,
  placementSelection: ProductPlacement
): PlacementResolution {
  const options = getPlacementOptionsForContext(photoType, photoMode);
  const requested = placementSelection || 'surface';
  const requestedOption = options.find(option => option.id === requested);
  const fallbackOption = options.find(option => option.enabled) || options[0];

  const resolvedOption =
    requestedOption && requestedOption.enabled
      ? requestedOption
      : fallbackOption;

  const corrected = resolvedOption.id !== requested;
  const correctionReason = corrected
    ? (
      requestedOption?.disabledReason ||
      `Placement "${requested}" is not physically coherent for ${photoType} + ${photoMode || 'selected mode'}.`
    )
    : null;

  const underwater = photoType === 'environment' && isUnderwaterPhotoMode(photoMode);

  const promptFragment =
    photoType === 'photo-studio'
      ? buildStudioPlacementPrompt(resolvedOption.id)
      : underwater
        ? buildUnderwaterPlacementPrompt(resolvedOption.id)
        : buildEnvironmentPlacementPrompt(resolvedOption.id, photoMode);

  return {
    requestedPlacement: requested,
    resolvedPlacement: resolvedOption.id,
    corrected,
    correctionReason,
    label: resolvedOption.label,
    promptFragment,
  };
}

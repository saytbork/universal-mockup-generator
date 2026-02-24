// Real StudioUIState samples for Wine, Coffee, Generic
import type { StudioUIState } from './types/studioTypes';

export const getTestStates = () => [
  {
    name: 'Wine V4',
    state: {
      creativeIntent: 'luxury',
      world: 'studio',
      motion: 'static',
      composition: 'hero',
      visualProfile: 'wine',
      wineEngineVersion: 4,
      winePrestigeMode: true,
      referenceProductCategory: 'wine',
    } as StudioUIState,
  },
  {
    name: 'Coffee',
    state: {
      creativeIntent: 'luxury',
      world: 'studio',
      motion: 'static',
      composition: 'hero',
      visualProfile: 'coffee',
    } as StudioUIState,
  },
  {
    name: 'Generic',
    state: {
      creativeIntent: 'luxury',
      world: 'studio',
      motion: 'static',
      composition: 'hero',
      visualProfile: 'generic',
    } as StudioUIState,
  },
];

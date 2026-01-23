/**
 * UGC MODULE — PUBLIC API
 * 
 * Raw Domestic UGC: Accordion open = ON. No toggle.
 */

export type { CaptureGeometry, UGCPromptResult } from './mapper';
export {
    CAPTURE_GEOMETRY_OPTIONS,
    UGC_STRIPPED_CONTROLS,
    mapRawDomesticUGC,
    isUGCActive,
    getUGCLockedState
} from './mapper';

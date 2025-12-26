/**
 * Canvas Utilities (Disabled)
 * Helper constants and fragile composition logic reserved for future Canvas-first workflows.
 * These exports are intentionally not consumed anywhere in the current pipeline.
 */

export const CANVAS_RATIO_MAP = {
    square: { label: '1:1', width: 1200, height: 1200 },
    portrait: { label: '4:5', width: 1080, height: 1350 },
    landscape: { label: '16:9', width: 1920, height: 1080 },
    tall: { label: '9:16', width: 1080, height: 1920 }
} as const;

export type CanvasRatioKey = keyof typeof CANVAS_RATIO_MAP;

export interface CanvasCompositionParams {
    ratioKey?: CanvasRatioKey;
    backgroundColor?: string;
    overlayDescription?: string;
    metadata?: Record<string, unknown>;
}

export interface CanvasCompositionResult {
    width: number;
    height: number;
    backgroundColor: string;
    description: string;
    metadata?: Record<string, unknown>;
}

export function composeCanvasPreview(params: CanvasCompositionParams): CanvasCompositionResult {
    const ratioEntry = CANVAS_RATIO_MAP[params.ratioKey || 'square'];
    const width = ratioEntry.width;
    const height = ratioEntry.height;
    const backgroundColor = params.backgroundColor || '#ffffff';
    const description = params.overlayDescription
        ? `Canvas ${ratioEntry.label} with ${params.overlayDescription}`
        : `Canvas ${ratioEntry.label} with neutral background`;

    return {
        width,
        height,
        backgroundColor,
        description,
        metadata: params.metadata
    };
}

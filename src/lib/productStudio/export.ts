/**
 * PRODUCT STUDIO EXPORT UTILITIES
 */

export type ExportFormat = 'png-only' | 'png-with-overlays';

export interface ExportOptions {
    format: ExportFormat;
    imageUrl: string;
    overlays?: OverlayConfig[];
    filename?: string;
}

export interface OverlayConfig {
    type: 'text' | 'logo' | 'badge';
    content: string;
    position: { x: number; y: number };
    style?: Record<string, string>;
}

/**
 * Export image as PNG
 * Overlays are client-side only, never sent to model
 */
export async function exportProductImage(options: ExportOptions): Promise<Blob> {
    const { format, imageUrl, overlays = [], filename } = options;

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
    });

    canvas.width = img.width;
    canvas.height = img.height;

    // Draw base image
    ctx.drawImage(img, 0, 0);

    // Apply overlays only for png-with-overlays
    if (format === 'png-with-overlays' && overlays.length > 0) {
        for (const overlay of overlays) {
            applyOverlay(ctx, overlay);
        }
    }

    // Convert to blob
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    // Trigger download if filename provided
                    if (filename) {
                        downloadBlob(blob, filename);
                    }
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob'));
                }
            },
            'image/png',
            1.0
        );
    });
}

function applyOverlay(ctx: CanvasRenderingContext2D, overlay: OverlayConfig): void {
    const { type, content, position, style = {} } = overlay;

    switch (type) {
        case 'text':
            ctx.save();
            ctx.font = style.font || '32px Arial';
            ctx.fillStyle = style.color || '#000000';
            ctx.textAlign = (style.textAlign as CanvasTextAlign) || 'left';
            ctx.fillText(content, position.x, position.y);
            ctx.restore();
            break;

        case 'badge':
            ctx.save();
            ctx.fillStyle = style.backgroundColor || '#FF0000';
            ctx.beginPath();
            ctx.arc(position.x, position.y, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = style.color || '#FFFFFF';
            ctx.font = style.font || '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(content, position.x, position.y);
            ctx.restore();
            break;

        case 'logo':
            // Logo overlay would load an image - simplified here
            console.log('[Export] Logo overlay:', content, position);
            break;
    }
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Quick export helpers
 */
export function exportImageOnly(imageUrl: string, filename: string): Promise<Blob> {
    return exportProductImage({
        format: 'png-only',
        imageUrl,
        filename,
    });
}

export function exportWithOverlays(
    imageUrl: string,
    overlays: OverlayConfig[],
    filename: string
): Promise<Blob> {
    return exportProductImage({
        format: 'png-with-overlays',
        imageUrl,
        overlays,
        filename,
    });
}

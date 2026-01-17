/**
 * Color Extraction Utility
 * Extracts dominant colors from product images using canvas pixel analysis
 */

/**
 * Extract dominant colors from an image URL or base64 string
 * Returns { dominant, secondary } hex colors
 */
export async function extractDominantColors(
    imageSource: string
): Promise<{ dominant: string; secondary: string }> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.warn('[ColorExtractor] Canvas context not available, using defaults');
                resolve({ dominant: '#6366f1', secondary: '#818cf8' });
                return;
            }

            // Sample at reduced size for performance.
            // IMPORTANT: focus on the likely label region (center/lower-middle) to avoid
            // backgrounds, caps, shadows, and table surfaces dominating the palette.
            const sampleSize = 50;
            canvas.width = sampleSize;
            canvas.height = sampleSize;

            // Label ROI heuristic:
            // - horizontally centered (avoid edges/background)
            // - vertically biased toward mid-lower (where labels usually sit)
            const sx = Math.floor(img.width * 0.20);
            const sy = Math.floor(img.height * 0.35);
            const sw = Math.max(1, Math.floor(img.width * 0.60));
            const sh = Math.max(1, Math.floor(img.height * 0.45));
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sampleSize, sampleSize);

            const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
            const pixels = imageData.data;

            // Color frequency map
            const colorMap: Record<string, number> = {};

            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const a = pixels[i + 3];

                // Skip transparent or near-white pixels
                if (a < 128) continue;
                if (r > 240 && g > 240 && b > 240) continue;
                if (r < 15 && g < 15 && b < 15) continue;

                // Quantize to reduce color count
                const qr = Math.round(r / 32) * 32;
                const qg = Math.round(g / 32) * 32;
                const qb = Math.round(b / 32) * 32;
                const key = `${qr},${qg},${qb}`;
                colorMap[key] = (colorMap[key] || 0) + 1;
            }

            // Prefer saturated colors (label/brand) over neutrals.
            const sorted = Object.entries(colorMap)
                .sort(([rgbA, countA], [rgbB, countB]) => {
                    const scoreA = scoreColor(rgbA, countA);
                    const scoreB = scoreColor(rgbB, countB);
                    return scoreB - scoreA;
                })
                .slice(0, 10);

            if (sorted.length === 0) {
                console.warn('[ColorExtractor] No colors found, using defaults');
                resolve({ dominant: '#6366f1', secondary: '#818cf8' });
                return;
            }

            // Convert back to hex
            const toHex = (rgb: string): string => {
                const [r, g, b] = rgb.split(',').map(Number);
                return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
            };

            const dominant = toHex(sorted[0][0]);
            const secondary = sorted.length > 1 ? toHex(sorted[1][0]) : dominant;

            console.log('[ColorExtractor] Extracted:', { dominant, secondary });
            resolve({ dominant, secondary });
        };

        img.onerror = () => {
            console.warn('[ColorExtractor] Failed to load image, using defaults');
            resolve({ dominant: '#6366f1', secondary: '#818cf8' });
        };

        img.src = imageSource;
    });
}

function scoreColor(rgb: string, count: number): number {
    const [r, g, b] = rgb.split(',').map(Number);
    const { s, l } = rgbToHsl(r, g, b);

    // Penalize near-gray and extreme luminance.
    const saturationBoost = Math.pow(Math.max(0, s), 1.5); // favor saturated label colors
    const luminancePenalty = l < 0.08 || l > 0.92 ? 0.15 : 1.0;

    return count * saturationBoost * luminancePenalty;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;

    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;

    if (max === min) return { h: 0, s: 0, l };

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    switch (max) {
        case rn:
            h = (gn - bn) / d + (gn < bn ? 6 : 0);
            break;
        case gn:
            h = (bn - rn) / d + 2;
            break;
        case bn:
            h = (rn - gn) / d + 4;
            break;
    }
    h /= 6;
    return { h, s, l };
}

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

            // Sample at reduced size for performance
            const sampleSize = 50;
            canvas.width = sampleSize;
            canvas.height = sampleSize;
            ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

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

            // Sort by frequency
            const sorted = Object.entries(colorMap)
                .sort(([, a], [, b]) => b - a)
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

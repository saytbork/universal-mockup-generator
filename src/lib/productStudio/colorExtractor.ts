/**
 * Color Extraction Utility
 * Extracts dominant colors from product images using canvas pixel sampling + k-means clustering.
 *
 * Algorithm:
 *   1. Downscale image to ≤200px on the longest side.
 *   2. Sample full image (not just center crop) to capture all label regions.
 *   3. Filter near-white (R>245, G>245, B>245) and transparent pixels.
 *   4. Run k-means with k=5 for up to 20 iterations to cluster the remaining pixels.
 *   5. Sort clusters by pixel count (largest = most frequent color).
 *   6. Return top-3 non-white cluster centroids as dominant / secondary / accent.
 *
 * Fallback:
 *   If all pixels are near-white (fully-white product with no visible color):
 *   - Compute average of ALL non-transparent pixels (including near-white).
 *   - Derive secondary via darken(avg, 20%) and accent via lighten(avg, 20%).
 *   - productPaletteA is NEVER null.
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

function toHexStr(r: number, g: number, b: number): string {
    return (
        '#' +
        [r, g, b]
            .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
            .join('')
    );
}

function darkenHex(hex: string, pct: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const t = 1 - pct / 100;
    return toHexStr(r * t, g * t, b * t);
}

function lightenHex(hex: string, pct: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const t = pct / 100;
    return toHexStr(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
}

// ── K-means ───────────────────────────────────────────────────────────────────

interface Centroid { r: number; g: number; b: number; count: number }

function kMeans(pixels: Array<[number, number, number]>, k: number, maxIter = 20): Centroid[] {
    if (pixels.length === 0) return [];

    // Seed centroids by picking evenly-spaced pixels (deterministic, no random)
    const step = Math.max(1, Math.floor(pixels.length / k));
    const centroids: Array<[number, number, number]> = Array.from({ length: k }, (_, i) => {
        const p = pixels[Math.min(i * step, pixels.length - 1)];
        return [p[0], p[1], p[2]];
    });

    let assignments = new Int32Array(pixels.length);

    for (let iter = 0; iter < maxIter; iter++) {
        // Assign each pixel to nearest centroid
        let changed = false;
        for (let i = 0; i < pixels.length; i++) {
            const [r, g, b] = pixels[i];
            let best = 0;
            let bestDist = Infinity;
            for (let c = 0; c < k; c++) {
                const dr = r - centroids[c][0];
                const dg = g - centroids[c][1];
                const db = b - centroids[c][2];
                const dist = dr * dr + dg * dg + db * db;
                if (dist < bestDist) { bestDist = dist; best = c; }
            }
            if (assignments[i] !== best) { assignments[i] = best; changed = true; }
        }
        if (!changed) break;

        // Recompute centroids
        const sums: Array<[number, number, number, number]> = Array.from({ length: k }, () => [0, 0, 0, 0]);
        for (let i = 0; i < pixels.length; i++) {
            const c = assignments[i];
            sums[c][0] += pixels[i][0];
            sums[c][1] += pixels[i][1];
            sums[c][2] += pixels[i][2];
            sums[c][3]++;
        }
        for (let c = 0; c < k; c++) {
            if (sums[c][3] > 0) {
                centroids[c] = [sums[c][0] / sums[c][3], sums[c][1] / sums[c][3], sums[c][2] / sums[c][3]];
            }
        }
    }

    // Build result sorted by cluster size (largest first)
    const counts = new Int32Array(k);
    for (let i = 0; i < assignments.length; i++) counts[assignments[i]]++;
    return Array.from({ length: k }, (_, c) => ({
        r: centroids[c][0], g: centroids[c][1], b: centroids[c][2], count: counts[c],
    })).sort((a, b) => b.count - a.count);
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Extract dominant colors from an image URL or base64 string.
 * Returns { dominant, secondary, accent } hex colors.
 *
 * dominant is ALWAYS non-null — falls back to average pixel color if needed.
 */
export async function extractDominantColors(
    imageSource: string
): Promise<{ dominant: string; secondary: string; accent?: string }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            // Downscale to max 200px on longest dimension to keep pixel count manageable
            const MAX = 200;
            const scale = Math.min(1, MAX / Math.max(img.width, img.height, 1));
            const w = Math.max(1, Math.round(img.width * scale));
            const h = Math.max(1, Math.round(img.height * scale));
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);

            const imageData = ctx.getImageData(0, 0, w, h);
            const raw = imageData.data;

            // Separate usable pixels from all non-transparent pixels
            const usable: Array<[number, number, number]> = [];
            const allOpaque: Array<[number, number, number]> = [];

            for (let i = 0; i < raw.length; i += 4) {
                const r = raw[i], g = raw[i + 1], b = raw[i + 2], a = raw[i + 3];
                if (a < 128) continue;                          // skip transparent
                allOpaque.push([r, g, b]);
                if (r > 245 && g > 245 && b > 245) continue;   // skip near-white
                usable.push([r, g, b]);
            }

            // If no usable pixels (all-white product), use average of all opaque pixels as fallback
            if (usable.length === 0) {
                if (allOpaque.length === 0) {
                    reject(new Error('[ColorExtractor] No opaque pixels found'));
                    return;
                }
                const avg = allOpaque.reduce((acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b], [0, 0, 0]);
                const n = allOpaque.length;
                const dominant = toHexStr(avg[0] / n, avg[1] / n, avg[2] / n);
                const secondary = darkenHex(dominant, 20);
                const accent = lightenHex(dominant, 20);
                console.log('[ColorExtractor] All-white fallback:', { dominant, secondary, accent });
                resolve({ dominant, secondary, accent });
                return;
            }

            // Run k-means (k=5) on usable pixels
            const clusters = kMeans(usable, 5, 20);

            // Convert clusters to hex, pick top-3 that are not near-white
            const results: string[] = [];
            for (const c of clusters) {
                if (results.length >= 3) break;
                const hex = toHexStr(c.r, c.g, c.b);
                if (!results.includes(hex)) results.push(hex);
            }

            // Guarantee at least 3 slots — derive missing from primary
            const dominant = results[0];
            const secondary = results[1] ?? darkenHex(dominant, 20);
            const accent = results[2] ?? lightenHex(dominant, 20);

            console.log('[ColorExtractor] k-means palette:', { dominant, secondary, accent });
            resolve({ dominant, secondary, accent });
        };

        img.onerror = () => {
            reject(new Error('[ColorExtractor] Failed to load image for palette extraction'));
        };

        img.src = imageSource;
    });
}

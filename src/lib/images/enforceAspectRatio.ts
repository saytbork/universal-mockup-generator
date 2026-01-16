type AspectRatioKey = '1:1' | '4:5' | '9:16' | '16:9' | '4:3' | '3:4';

const ASPECT_RATIO_MAP: Record<AspectRatioKey, [number, number]> = {
  '1:1': [1, 1],
  '4:5': [4, 5],
  '9:16': [9, 16],
  '16:9': [16, 9],
  '4:3': [4, 3],
  '3:4': [3, 4],
};

const getTargetAspect = (aspectRatio: string): number | null => {
  const key = aspectRatio as AspectRatioKey;
  const pair = ASPECT_RATIO_MAP[key];
  if (!pair) return null;
  return pair[0] / pair[1];
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for aspect enforcement.'));
    img.src = src;
  });

/**
 * Ensures the returned image matches the requested aspect ratio even when the
 * upstream model preserves reference image dimensions.
 *
 * Strategy: pad with a blurred "cover" background, then draw the original
 * centered ("contain") so we never crop out the product.
 */
export async function enforceAspectRatioDataUrl(
  dataUrl: string,
  aspectRatio: string,
  options?: { blurPx?: number; tolerance?: number }
): Promise<string> {
  const targetAspect = getTargetAspect(aspectRatio);
  if (!targetAspect) return dataUrl;

  const blurPx = Math.max(0, options?.blurPx ?? 26);
  const tolerance = Math.max(0, options?.tolerance ?? 0.008);

  const img = await loadImage(dataUrl);
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  if (!srcW || !srcH) return dataUrl;

  const srcAspect = srcW / srcH;
  if (Math.abs(srcAspect - targetAspect) <= tolerance) return dataUrl;

  // Expand canvas to match target aspect while preserving the full original image.
  let outW = srcW;
  let outH = srcH;
  if (srcAspect > targetAspect) {
    // Too wide → add height.
    outH = Math.round(srcW / targetAspect);
  } else {
    // Too tall → add width.
    outW = Math.round(srcH * targetAspect);
  }

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  // Background: blurred cover version.
  const coverScale = Math.max(outW / srcW, outH / srcH);
  const coverW = srcW * coverScale;
  const coverH = srcH * coverScale;
  const coverX = (outW - coverW) / 2;
  const coverY = (outH - coverH) / 2;
  ctx.filter = blurPx ? `blur(${blurPx}px)` : 'none';
  ctx.drawImage(img, coverX, coverY, coverW, coverH);
  ctx.filter = 'none';

  // Foreground: original image centered (contain).
  const containScale = Math.min(outW / srcW, outH / srcH);
  const fgW = srcW * containScale;
  const fgH = srcH * containScale;
  const fgX = (outW - fgW) / 2;
  const fgY = (outH - fgH) / 2;
  ctx.drawImage(img, fgX, fgY, fgW, fgH);

  return canvas.toDataURL('image/png');
}


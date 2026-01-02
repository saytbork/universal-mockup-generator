export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function downloadUrlAsFile(url: string, filename: string) {
  if (url.startsWith('data:')) {
    downloadDataUrl(url, filename);
    return;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download: ${response.status}`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function exportSvgElementToPng(
  svgEl: SVGSVGElement,
  opts: { filename: string; scale?: number; background?: string | null }
) {
  const scale = Math.max(1, Math.min(4, opts.scale ?? 2));
  const background = opts.background ?? null;

  const serializer = new XMLSerializer();
  let svgText = serializer.serializeToString(svgEl);
  if (!svgText.includes('xmlns=')) {
    svgText = svgText.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load serialized SVG'));
      image.src = url;
    });

    const viewBox = svgEl.viewBox?.baseVal;
    const baseWidth = viewBox?.width || svgEl.clientWidth || 1024;
    const baseHeight = viewBox?.height || svgEl.clientHeight || 1024;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(baseWidth * scale);
    canvas.height = Math.round(baseHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, baseWidth, baseHeight);
    } else {
      ctx.clearRect(0, 0, baseWidth, baseHeight);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, baseWidth, baseHeight);
    const dataUrl = canvas.toDataURL('image/png');
    downloadDataUrl(dataUrl, opts.filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}


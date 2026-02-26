/**
 * Generate a binary mask for wine bottle inpainting
 * White = regenerate (liquid area)
 * Black = preserve (bottle shape, label, closure)
 * 
 * This creates a simple rectangular mask covering the middle 60% of the image
 * where the bottle liquid typically appears.
 */
export async function generateWineBottleMask(
  width: number = 1024,
  height: number = 1024
): Promise<string> {
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Fill entire canvas with black (preserve everything by default)
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);
  
  // Draw white rectangle in the center-middle area where liquid typically is
  // This covers approximately the bottle body area (avoiding neck and base)
  ctx.fillStyle = 'white';
  
  // Vertical: from 20% to 90% of height (larger coverage - 70% of image)
  // Horizontal: from 20% to 80% of width (larger coverage - 60% of image)
  const maskTop = height * 0.20;
  const maskHeight = height * 0.70; // 70% height coverage (increased from 50%)
  const maskLeft = width * 0.20;
  const maskWidth = width * 0.60; // 60% width coverage (increased from 50%)
  
  // Draw ellipse instead of rectangle for more natural bottle shape
  ctx.beginPath();
  ctx.ellipse(
    width / 2,           // center X
    maskTop + maskHeight / 2,  // center Y
    maskWidth / 2,       // radius X
    maskHeight / 2,      // radius Y
    0,                   // rotation
    0,                   // start angle
    2 * Math.PI          // end angle
  );
  ctx.fill();
  
  // Convert to base64
  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1];
  
  return base64;
}

/**
 * Helper to get dimensions from an image file
 */
export async function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = `data:image/png;base64,${base64}`;
  });
}

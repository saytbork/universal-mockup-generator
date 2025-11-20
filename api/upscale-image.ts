import type { VercelRequest, VercelResponse } from '@vercel/node';

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_TOKEN;
const REAL_ESRGAN_VERSION =
  process.env.REAL_ESRGAN_VERSION ||
  '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b';
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 24;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const upscaleImageWithReplicate = async (dataUrl: string) => {
  if (!REPLICATE_TOKEN) {
    throw new Error('High-resolution upscaler is not configured.');
  }
  const requestPayload = {
    version: REAL_ESRGAN_VERSION,
    input: {
      image: dataUrl,
      scale: 4,
    },
  };
  const requestHeaders = {
    Authorization: `Bearer ${REPLICATE_TOKEN}`,
    'Content-Type': 'application/json',
  };
  const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(requestPayload),
  });
  const startData = await startResponse.json().catch(() => ({}));
  if (!startResponse.ok) {
    throw new Error(startData?.error || 'Failed to contact the upscaler service.');
  }
  let prediction = startData;
  let attempts = 0;
  while (
    prediction.status &&
    !['succeeded', 'failed', 'canceled'].includes(prediction.status) &&
    attempts < MAX_POLL_ATTEMPTS
  ) {
    await sleep(POLL_INTERVAL_MS);
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      method: 'GET',
      headers: requestHeaders,
    });
    prediction = await pollResponse.json().catch(() => ({}));
    attempts += 1;
  }
  if (prediction.status !== 'succeeded') {
    throw new Error(prediction?.error || 'Upscaling did not finish successfully.');
  }
  const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  if (!outputUrl) {
    throw new Error('Upscaler returned no output URL.');
  }
  const imageResponse = await fetch(outputUrl);
  if (!imageResponse.ok) {
    throw new Error('Could not download the upscaled image.');
  }
  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = imageResponse.headers.get('content-type') || 'image/png';
  return {
    imageBase64: buffer.toString('base64'),
    mimeType,
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!REPLICATE_TOKEN) {
    return res.status(501).json({ error: 'High-resolution upscaler is not configured.' });
  }

  try {
    const imageBase64 = req.body?.imageBase64;
    const mimeType = req.body?.mimeType || 'image/png';
    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing image data for upscaling.' });
    }
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;
    const result = await upscaleImageWithReplicate(dataUrl);
    res.setHeader('Cache-Control', 'no-store');
    return res.json(result);
  } catch (error) {
    console.error('upscale-image error', error);
    const message = error instanceof Error ? error.message : 'Failed to upscale the image.';
    return res.status(500).json({ error: message });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAuth } from '../../server/lib/checkAuth.js';
import { saveGeneratedImageToGallery } from '../../services/gallery.js';

type GalleryPayload = {
  imageUrl: string;
  aspectRatio?: string;
  productMaterial?: string;
  plan: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const email = checkAuth(req);
  if (!email) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { imageUrl, plan } = req.body as GalleryPayload;
  if (!imageUrl || typeof imageUrl !== 'string') {
    res.status(400).json({ error: 'Missing imageUrl' });
    return;
  }

  try {
    await saveGeneratedImageToGallery(imageUrl.trim(), plan);
    res.status(201).json({ success: true });
  } catch (error: any) {
    console.error('Failed to save community gallery image', error);
    res.status(500).json({ error: 'Unable to save community image' });
  }
}

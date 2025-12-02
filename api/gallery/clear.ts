import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearGalleryImages } from '../../services/gallery.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await clearGalleryImages();
    res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Failed to clear gallery', error);
    res.status(500).json({ error: error?.message ?? 'Unable to clear gallery images' });
  }
}

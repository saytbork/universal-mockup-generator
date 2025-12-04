import type { VercelRequest, VercelResponse } from '@vercel/node';
const { adminDB, FieldValue } = require("../server/lib/firebase/admin");

// Tipos
type GalleryMeta = {
  width?: number;
  height?: number;
  modelReferenceUsed?: boolean;
  productsUsed?: number;
};

type ListEntry = {
  id: string;
  imageUrl: string;
  userId: string;
  plan: string;
  createdAt: any;
  width?: number;
  height?: number;
  modelReferenceUsed?: boolean;
  productsUsed?: number;
};

// Parseo parámetro action
const parseAction = (req: VercelRequest) => {
  const raw = req.query.action;
  if (Array.isArray(raw)) return raw[0]?.toString().toLowerCase() ?? '';
  return typeof raw === 'string' ? raw.toLowerCase() : '';
};

// Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = parseAction(req);

  try {
    switch (action) {
      
      // --------------------
      // AGREGAR IMAGEN
      // --------------------
      case 'add': {
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          return res.status(405).json({ error: 'Method not allowed' });
        }

        const { imageUrl, userId, plan, meta } = req.body || {};

        if (!imageUrl) return res.status(400).json({ error: 'Missing imageUrl' });
        if (!userId) return res.status(400).json({ error: 'Missing userId' });
        if (!plan) return res.status(400).json({ error: 'Missing plan' });

        const ref = await adminDB.collection('gallery').add({
          imageUrl: imageUrl.trim(),
          userId,
          plan,
          createdAt: FieldValue.serverTimestamp(),
          width: meta?.width,
          height: meta?.height,
          modelReferenceUsed: meta?.modelReferenceUsed,
          productsUsed: meta?.productsUsed,
        });

        return res.status(201).json({ id: ref.id });
      }

      // --------------------
      // LISTAR IMÁGENES
      // --------------------
      case 'list': {
        if (req.method !== 'GET') {
          res.setHeader('Allow', 'GET');
          return res.status(405).json({ error: 'Method not allowed' });
        }

        const snapshot = await adminDB
          .collection('gallery')
          .orderBy('createdAt', 'desc')
          .limit(200)
          .get();

        const images: ListEntry[] = snapshot.docs.map(doc => {
          const data = doc.data();

          return {
            id: doc.id,
            imageUrl: data.imageUrl,
            userId: data.userId,
            plan: data.plan,
            createdAt: data.createdAt ?? null,
            width: data.width,
            height: data.height,
            modelReferenceUsed: data.modelReferenceUsed,
            productsUsed: data.productsUsed,
          };
        });

        return res.status(200).json({ images });
      }

      // --------------------
      // ACCIÓN INVÁLIDA
      // --------------------
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error("Gallery handler error:", error);
    return res.status(500).json({ error: error.message ?? 'Internal server error' });
  }
}

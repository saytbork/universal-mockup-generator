// @ts-ignore – TS needs this because admin.mjs is ESM
import admin, { adminDB, FieldValue } from "../server/firebase/admin.mjs";
import type { NextApiRequest, NextApiResponse } from "next";

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

const parseAction = (req: VercelRequest) => {
  const raw = req.query.action;
  if (Array.isArray(raw)) return raw[0]?.toString().toLowerCase() ?? "";
  return typeof raw === "string" ? raw.toLowerCase() : "";
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers for frontend requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = parseAction(req);

  try {
    switch (action) {
      case "add": {
        if (req.method !== "POST") {
          res.setHeader("Allow", "POST");
          return res.status(405).json({ error: "Method not allowed" });
        }

        const { imageUrl, userId, plan, meta } = req.body || {};

        if (!imageUrl) return res.status(400).json({ error: "Missing imageUrl" });
        if (!userId || userId === 'guest') {
          return res.status(400).json({ error: "Missing or invalid userId. Email must be loaded before saving gallery items." });
        }
        if (!plan) return res.status(400).json({ error: "Missing plan" });

        // Validate imageUrl is a valid URL
        try {
          new URL(imageUrl);
        } catch {
          return res.status(400).json({ error: "Invalid imageUrl format" });
        }

        const ref = await adminDB.collection("gallery").add({
          imageUrl: imageUrl.trim(),
          userId,
          plan,
          createdAt: FieldValue.serverTimestamp(),
          width: meta?.width,
          height: meta?.height,
          modelReferenceUsed: meta?.modelReferenceUsed,
          productsUsed: meta?.productsUsed,
        });

        console.log(`✅ Gallery entry created: ${ref.id}`);
        return res.status(201).json({ id: ref.id });
      }

      case "list": {
        if (req.method !== "GET") {
          res.setHeader("Allow", "GET");
          return res.status(405).json({ error: "Method not allowed" });
        }

        const snapshot = await adminDB
          .collection("gallery")
          .orderBy("createdAt", "desc")
          .limit(200)
          .get();

        const images: ListEntry[] = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>) => {
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

        console.log(`✅ Loaded ${images.length} gallery images`);
        return res.status(200).json({ images });
      }

      default:
        return res.status(400).json({ error: "Invalid action. Use 'add' or 'list'" });
    }
  } catch (error: any) {
    console.error("❌ Gallery handler error:", error);

    // Provide more specific error messages
    let errorMessage = "Internal server error";
    if (error.message?.includes('FIREBASE_SERVICE_ACCOUNT_KEY')) {
      errorMessage = "Firebase configuration error. Please check environment variables.";
    } else if (error.code === 'permission-denied') {
      errorMessage = "Database permission denied. Please check Firestore rules.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(500).json({ error: errorMessage });
  }
}

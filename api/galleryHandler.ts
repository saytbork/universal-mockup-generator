// @ts-ignore – TS needs this because admin.mjs is ESM
import admin, { adminDB, adminStorage, FieldValue } from "../server/firebase/admin.mjs";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkAuth } from "../server/lib/checkAuth.js";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

        const normalizedUserId = String(userId).trim().toLowerCase();
        const rawImageUrl = String(imageUrl).trim();
        const isDataUrl = rawImageUrl.toLowerCase().startsWith('data:');

        // If the client only has a base64 data URL (common when generation happens client-side),
        // upload it to Firebase Storage using Admin SDK to bypass client auth restrictions.
        let finalImageUrl = rawImageUrl;
        if (isDataUrl) {
          const match = /^data:([^;]+);base64,(.+)$/i.exec(rawImageUrl);
          if (!match) {
            return res.status(400).json({ error: "Invalid data URL format" });
          }
          const mimeType = match[1] || 'image/png';
          const base64Data = match[2] || '';
          const buffer = Buffer.from(base64Data, 'base64');

          // Keep payload limits reasonable for serverless; if this is too large, require a public URL.
          const maxBytes = 6 * 1024 * 1024; // 6MB
          if (buffer.byteLength > maxBytes) {
            return res.status(413).json({
              error: "Generated image payload too large to store. Please enable Storage uploads or reduce output size."
            });
          }

          const ext = mimeType.includes('jpeg') ? 'jpg' : mimeType.includes('webp') ? 'webp' : 'png';
          const timestamp = Date.now();
          const safeUserPath = normalizedUserId.replace(/[^a-z0-9@._-]+/g, '_');
          const storagePath = `gallery/${safeUserPath}/${timestamp}.${ext}`;

          const file = adminStorage.file(storagePath);
          await file.save(buffer, {
            resumable: false,
            contentType: mimeType,
            metadata: {
              metadata: {
                userId: normalizedUserId,
                source: 'galleryHandler',
                uploadedAt: new Date(timestamp).toISOString(),
              }
            }
          });

          // Make it publicly readable for dashboard listing + downloads.
          await file.makePublic();
          finalImageUrl = `https://storage.googleapis.com/${adminStorage.name}/${storagePath}`;
        } else {
          // Validate URL
          try {
            new URL(rawImageUrl);
          } catch {
            return res.status(400).json({ error: "Invalid imageUrl format" });
          }
        }

        const ref = await adminDB.collection("gallery").add({
          imageUrl: finalImageUrl,
          userId: normalizedUserId,
          plan: String(plan).trim().toLowerCase(),
          createdAt: FieldValue.serverTimestamp(),
          width: meta?.width,
          height: meta?.height,
          modelReferenceUsed: meta?.modelReferenceUsed,
          productsUsed: meta?.productsUsed,
        });

        console.log(`✅ Gallery entry created: ${ref.id}`);
        return res.status(201).json({ id: ref.id, imageUrl: finalImageUrl });
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

      case "delete": {
        if (req.method !== "POST") {
          res.setHeader("Allow", "POST");
          return res.status(405).json({ error: "Method not allowed" });
        }

        const email = checkAuth(req);
        if (!email) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const { id } = req.body || {};
        if (!id || typeof id !== "string") {
          return res.status(400).json({ error: "Missing id" });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const docRef = adminDB.collection("gallery").doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
          return res.status(404).json({ error: "Not found" });
        }

        const data = doc.data() as any;
        const owner = String(data?.userId || "").trim().toLowerCase();
        if (!owner || owner !== normalizedEmail) {
          return res.status(403).json({ error: "Forbidden" });
        }

        const imageUrl = String(data?.imageUrl || "");
        // Best-effort cleanup in Storage (only for our bucket URLs).
        try {
          const prefix = `https://storage.googleapis.com/${adminStorage.name}/`;
          if (imageUrl.startsWith(prefix)) {
            const path = imageUrl.slice(prefix.length);
            const safeUserPath = normalizedEmail.replace(/[^a-z0-9@._-]+/g, "_");
            if (path.startsWith(`gallery/${safeUserPath}/`)) {
              await adminStorage.file(path).delete({ ignoreNotFound: true });
            }
          }
        } catch (err) {
          console.warn("Gallery storage delete warning", err);
        }

        await docRef.delete();
        return res.status(200).json({ ok: true });
      }

      default:
        return res.status(400).json({ error: "Invalid action. Use 'add', 'list', or 'delete'" });
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

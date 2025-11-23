import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleAuth } from 'google-auth-library';
import { GoogleGenAI } from "@google/genai";
import { checkAndConsumeCredit } from './utils/credits';
import { getAuth } from '@clerk/backend';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const project = process.env.GCP_PROJECT_ID || process.env.VERTEX_PROJECT_ID;
  const location = process.env.GCP_LOCATION || process.env.VERTEX_LOCATION || 'us-central1';
  const saJson = process.env.GCP_SERVICE_ACCOUNT_KEY;

  if (!project) {
    console.error('Missing GCP_PROJECT_ID or VERTEX_PROJECT_ID');
    return res.status(500).json({ error: 'Server configuration error: Missing Project ID' });
  }
  if (!saJson) {
    console.error('Missing GCP_SERVICE_ACCOUNT_KEY');
    return res.status(500).json({ error: 'Server configuration error: Missing Service Account Key' });
  }

  // Use Imagen 3 as requested
  const vertexImageModel = 'imagen-3.0-generate-002';
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // Specific negative prompt requested by user to avoid policy violations
  const negativePrompt = "desnudo, cuerpo, ropa, sexy, sexual, sangre, violencia, closeup de cara, modelo, persona, menor de edad, render 3D, ilustración";

  const sanitizePrompt = (raw: string): string => {
    const banned = [
      'nude', 'naked', 'lingerie', 'bikini', 'swimsuit', 'sexy', 'explicit', 'erotic',
      'blood', 'gore', 'weapon', 'gun', 'knife', 'violence', 'drugs', 'smoking', 'vape',
      'alcohol', 'minor', 'child', 'kid', 'teen'
    ];
    let safe = raw || '';
    banned.forEach(word => {
      const re = new RegExp(word, 'gi');
      safe = safe.replace(re, '');
    });
    return safe.trim();
  };

  try {
    const { base64, mimeType, prompt = '' } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Missing required parameter: prompt.' });
    }

    // 🛑 A. Obtener el User ID de Clerk (El Gatekeeper principal)
    const { userId } = getAuth(req);

    if (!userId) {
      // Bloquea cualquier solicitud anónima antes de consumir recursos
      return res.status(401).json({ message: "No autorizado. Debes iniciar sesión." });
    }

    // 🛑 B. Barrera de Créditos (Protección de Costos)
    // Usaremos el ID de Clerk (ej: user_2a9p9...) como el user_id para Neon
    await checkAndConsumeCredit(userId);

    // Note: checkAndConsumeCredit throws if insufficient, so we don't need to check return value explicitly for false, 
    // but we can catch the specific error if we want custom 403 message, or let the general catch handle it.
    // The utility throws "Créditos insuficientes..." which will be caught below.

    let enhancedPrompt = sanitizePrompt(prompt);

    // Enhance prompt with Gemini if available
    if (geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey, apiVersion: 'v1beta' });
        const result = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [{
            role: 'user',
            parts: [{
              text: `
          Enhance this image generation prompt to be more descriptive, photorealistic, and high quality for a UGC lifestyle product shot. 
          Keep it under 100 words. Focus on lighting, texture, and realism.
          IMPORTANT: Ensure the output is completely safe, family-friendly, and free of any violence, sexual content, or prohibited items.
          Avoid describing people or models in detail to prevent safety filter triggers. Focus on the product and environment.
          Original prompt: "${enhancedPrompt}"
        ` }]
          }]
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          enhancedPrompt = text.trim();
        }
      } catch (err) {
        console.warn('Gemini prompt enhancement failed, using original:', err);
      }
    }

    const safePrompt = enhancedPrompt;

    // Vertex Imagen 3 using service account
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${vertexImageModel}:predict`;

    const instance: Record<string, any> = {
      prompt: safePrompt,
      // Imagen 3 specific parameters structure might vary, but usually prompt is top level in instance
    };

    // Note: Imagen 3 might not support 'image' input for editing in the same way as generation.
    // This endpoint is for generation. If base64 is present, it might be for editing/variation.
    // However, the user instructions for "generateImageWithImagen3" did not include image input.
    // We will keep it if present but be aware it might not be used by the model if not configured.
    if (base64) {
      instance.image = { bytesBase64Encoded: base64, mimeType: mimeType || 'image/png' };
    }

    const body = {
      instances: [instance],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1", // Added as per user snippet
        negativePrompt: negativePrompt, // Moved to parameters as per user snippet/Imagen 3 specs
        // personGeneration: 'allow_adult', // Removed as per previous instructions, but check if needed for Imagen 3
        // User snippet didn't include personGeneration, but included negative prompt in parameters.
      },
    };

    const auth = new GoogleAuth({
      credentials: JSON.parse(saJson),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI Error Response:', errorText);
      throw new Error(`Vertex AI Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const prediction = data?.predictions?.[0];

    // Imagen 3 response structure check
    // User snippet: response.predictions[0].structValue.fields.image.stringValue
    // REST API usually returns predictions as objects directly.
    // Let's try standard bytesBase64Encoded first, if not check structValue.
    let imageBase64 = prediction?.bytesBase64Encoded;

    if (!imageBase64 && prediction?.structValue?.fields?.image?.stringValue) {
      imageBase64 = prediction.structValue.fields.image.stringValue;
    }

    if (!imageBase64) {
      console.error('Vertex AI Response Data:', JSON.stringify(data, null, 2));
      throw new Error('No image returned from Vertex Imagen.');
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;
    return res.status(200).json({ imageUrl, promptUsed: safePrompt });

  } catch (error) {
    console.error("Error in /api/generate-image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ error: errorMessage });
  }
}

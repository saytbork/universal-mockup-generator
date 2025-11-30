import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

/**
 * Normalize Gemini model name to avoid 404 errors.
 * Forces -001 versions instead of -002 or -latest which were causing issues.
 */
const normalizeGeminiModel = (raw?: string, fallback = 'gemini-2.0-flash-exp') => {
  const model = (raw || fallback).replace(/^models\//, '');
  if (model.endsWith('-latest')) return model.replace(/-latest$/, '-001');
  if (model.endsWith('-002')) return model.replace(/-002$/, '-001');
  return model;
};

const GEMINI_IMAGE_MODEL = normalizeGeminiModel(process.env.VITE_GEMINI_MODEL || process.env.GEMINI_MODEL);

interface GenerateImageRequest {
  settings: {
    aspectRatio?: string;
  };
  promptText: string;
  image: {
    base64: string;
    mimeType: string;
  };
  modelReference?: {
    base64: string;
    mimeType: string;
    notes?: string;
  };
}

export default async function generateImage(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { settings, promptText, image, modelReference } = req.body as GenerateImageRequest;

    if (!promptText || !image?.base64) {
      return res.status(400).json({ error: "Missing required fields: promptText and image" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    // Initialize Gemini AI client
    const ai = new GoogleGenAI({
      apiKey,
      apiVersion: 'v1'
    });

    const aspectRatio = settings?.aspectRatio || '1:1';

    // Build content parts
    const parts: any[] = [
      {
        inlineData: {
          data: image.base64,
          mimeType: image.mimeType
        }
      },
      { text: promptText }
    ];

    // Add model reference if provided
    if (modelReference?.base64) {
      parts.push({
        inlineData: {
          data: modelReference.base64,
          mimeType: modelReference.mimeType
        }
      });

      if (modelReference.notes) {
        parts.push({
          text: `Model reference notes: ${modelReference.notes}`
        });
      }
    }

    // Generate image using Gemini
    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: { parts },
      generationConfig: {
        responseMimeType: 'image/png',
        aspectRatio
      },
    });

    // Extract generated image from response
    const responseParts = response?.candidates?.[0]?.content?.parts ?? [];

    for (const part of responseParts) {
      if ('inlineData' in part && (part as any).inlineData?.data) {
        const imageData = (part as any).inlineData.data;
        const imageUrl = `data:image/png;base64,${imageData}`;

        return res.status(200).json({
          imageUrl,
          model: GEMINI_IMAGE_MODEL,
          aspectRatio
        });
      }
    }

    throw new Error("No image data returned from Gemini");

  } catch (error) {
    console.error("Error generating image:", error);

    let errorMessage = "Image generation failed";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific Gemini errors
      if (errorMessage.includes("Requested entity was not found") ||
        errorMessage.includes("404")) {
        errorMessage = "Invalid API key or model not found. Using model: " + GEMINI_IMAGE_MODEL;
        statusCode = 401;
      } else if (errorMessage.toLowerCase().includes("quota")) {
        errorMessage = "API quota exceeded. Check your Gemini API billing.";
        statusCode = 429;
      }
    }

    return res.status(statusCode).json({
      error: errorMessage,
      detail: error instanceof Error ? error.stack : String(error),
      model: GEMINI_IMAGE_MODEL
    });
  }
}

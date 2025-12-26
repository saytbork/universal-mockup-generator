// src/services/imageGenerationService.ts
import { GoogleGenAI, Modality } from "@google/genai";

export type ActiveProduct = {
    id: string;
    base64: string;
    mimeType: string;
    name: string;
    heightCm?: number;
};

export type PersonIdentityPackage = {
    modelReferenceBase64?: string;
    modelReferenceMime?: string;
    identityLock: boolean;
};

type GenerateImageParams = {
    apiKey: string;
    model: string;
    prompt: string;
    aspectRatio: string;
    products: ActiveProduct[];
    personIdentityPackage?: PersonIdentityPackage;
    modelReferenceFile?: File | null;
};

const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [mimeType, base64] = result.split(';base64,');
            resolve({ base64, mimeType: mimeType.replace('data:', '') });
        };
        reader.onerror = (error) => reject(error);
    });
};

export async function generateImageWithGemini({
    apiKey,
    model,
    prompt,
    aspectRatio,
    products,
    personIdentityPackage,
    modelReferenceFile,
}: GenerateImageParams) {
    // In development, use local backend to bypass OAuth2 restrictions
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

    if (isDevelopment) {
        console.log('🔧 Development mode: Using local backend...');

        // Prepare model reference from file if needed
        let finalPersonIdentityPackage = personIdentityPackage;

        if (modelReferenceFile && !personIdentityPackage?.modelReferenceBase64) {
            const { base64: modelBase64, mimeType: modelMimeType } = await fileToBase64(modelReferenceFile);
            finalPersonIdentityPackage = {
                ...personIdentityPackage,
                modelReferenceBase64: modelBase64,
                modelReferenceMime: modelMimeType,
                identityLock: true,
            };
        }

        // Call local backend
        const response = await fetch('http://localhost:3001/api/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                prompt,
                aspectRatio,
                products,
                personIdentityPackage: finalPersonIdentityPackage,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to generate image');
        }

        return await response.json();
    }

    // Production: Use SDK directly with API key
    const ai = new GoogleGenAI({
        apiKey,
        apiVersion: "v1beta",
    });

    // Build request parts with images
    const requestParts: any[] = [];

    // Add identity reference if exists
    const identityInlinePart = personIdentityPackage?.modelReferenceBase64
        ? {
            inlineData: {
                data: personIdentityPackage.modelReferenceBase64,
                mimeType: personIdentityPackage.modelReferenceMime ?? "image/png",
            },
            reference: true,
        }
        : null;

    if (identityInlinePart) {
        requestParts.push(identityInlinePart);
    } else if (modelReferenceFile) {
        const { base64: modelBase64, mimeType: modelMimeType } = await fileToBase64(modelReferenceFile);
        requestParts.push({
            inlineData: { data: modelBase64, mimeType: modelMimeType },
            reference: true,
        });
    }

    // Add product images
    products.forEach((product) => {
        requestParts.push({
            inlineData: { data: product.base64, mimeType: product.mimeType },
            reference: true,
        });
    });

    // Add text prompt
    requestParts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model,
        contents: { parts: requestParts },
        config: {
            responseModalities: [Modality.IMAGE],
            safetySettings: [],
            generationConfig: {
                responseMimeType: "image/png",
                aspectRatio,
                preserveReferenceImage: true,
                temperature: 0.25,
                topP: 0.9,
                seed: crypto.randomUUID(),
            },
        } as any,
    });

    return response;
}

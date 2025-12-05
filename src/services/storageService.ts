/**
 * Storage Service - Client-side Firebase Storage operations
 * Handles uploading generated images to Firebase Storage
 */

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase/firebase';

const storage = getStorage(app);

/**
 * Convert base64 data URL to Blob
 */
function base64ToBlob(base64Data: string): Blob {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64String = base64Data.includes(',')
        ? base64Data.split(',')[1]
        : base64Data;

    // Decode base64 string
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // Determine MIME type from data URL or default to PNG
    let mimeType = 'image/png';
    if (base64Data.includes(',')) {
        const match = base64Data.match(/data:([^;]+);/);
        if (match) {
            mimeType = match[1];
        }
    }

    return new Blob([byteArray], { type: mimeType });
}

/**
 * Generate unique filename for uploaded image
 */
function generateFilename(userId: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    return `${userId}_${timestamp}_${randomSuffix}.png`;
}

export interface UploadImageResult {
    url: string;
    path: string;
}

/**
 * Upload image to Firebase Storage
 * @param base64Data - Base64 encoded image data (with or without data URL prefix)
 * @param userId - User ID for organizing files
 * @returns Promise with download URL and storage path
 */
export async function uploadImage(
    base64Data: string,
    userId: string
): Promise<UploadImageResult> {
    try {
        // Convert base64 to Blob
        const blob = base64ToBlob(base64Data);

        // Generate unique filename
        const filename = generateFilename(userId);
        const storagePath = `generated/${filename}`;

        // Create storage reference
        const storageRef = ref(storage, storagePath);

        // Upload blob to Storage
        const snapshot = await uploadBytes(storageRef, blob, {
            contentType: blob.type,
            customMetadata: {
                userId,
                uploadedAt: new Date().toISOString(),
            }
        });

        // Get public download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('✅ Image uploaded to Storage:', storagePath);

        return {
            url: downloadURL,
            path: storagePath,
        };
    } catch (error) {
        console.error('❌ Storage upload failed:', error);
        throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Upload image with retry logic for reliability
 */
export async function uploadImageWithRetry(
    base64Data: string,
    userId: string,
    maxRetries = 3
): Promise<UploadImageResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await uploadImage(base64Data, userId);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');
            console.warn(`Upload attempt ${attempt}/${maxRetries} failed:`, lastError.message);

            if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }

    throw lastError || new Error('Upload failed after retries');
}

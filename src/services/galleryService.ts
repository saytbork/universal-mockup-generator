/**
 * Gallery Service - API client for gallery operations
 * Handles communication with /api/galleryHandler endpoints
 */

import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase/firebase';

const auth = getAuth(app);

export interface GalleryMeta {
    width?: number;
    height?: number;
    modelReferenceUsed?: boolean;
    productsUsed?: number;
}

export interface GalleryImage {
    id: string;
    imageUrl: string;
    userId: string;
    plan: string;
    createdAt: any;
    width?: number;
    height?: number;
    modelReferenceUsed?: boolean;
    productsUsed?: number;
}

export interface AddGalleryResponse {
    id: string;
}

export interface ListGalleryResponse {
    images: GalleryImage[];
}

/**
 * Add image to gallery
 * @param imageUrl - Public URL of uploaded image
 * @param userId - Firebase Auth user ID
 * @param plan - Subscription plan (free, creator, studio)
 * @param meta - Optional metadata
 * @returns Promise with new document ID
 */
export async function addToGallery(
    imageUrl: string,
    userId: string,
    plan: string,
    meta?: GalleryMeta
): Promise<AddGalleryResponse> {
    try {
        const response = await axios.post<AddGalleryResponse>(
            '/api/galleryHandler?action=add',
            {
                imageUrl,
                userId,
                plan,
                meta: meta || {},
            }
        );

        console.log('✅ Image added to gallery:', response.data.id);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to add image to gallery:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(
                `Gallery API error: ${error.response?.data?.error || error.message}`
            );
        }
        throw error;
    }
}

/**
 * List all public gallery images
 * @returns Promise with array of gallery images
 */
export async function listPublicGallery(): Promise<GalleryImage[]> {
    try {
        const response = await axios.get<ListGalleryResponse>(
            '/api/galleryHandler?action=list'
        );

        console.log(`✅ Loaded ${response.data.images.length} gallery images`);
        return response.data.images;
    } catch (error) {
        console.error('❌ Failed to load public gallery:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(
                `Gallery API error: ${error.response?.data?.error || error.message}`
            );
        }
        throw error;
    }
}

/**
 * List gallery images for specific user
 * @param userId - Firebase Auth user ID
 * @returns Promise with array of user's gallery images
 */
export async function listUserGallery(userId: string): Promise<GalleryImage[]> {
    try {
        const allImages = await listPublicGallery();

        // Filter images by userId on client side
        const userImages = allImages.filter(img =>
            img.userId === userId || (img.userId === 'guest' && userId === auth.currentUser?.email)
        );

        console.log(`✅ Loaded ${userImages.length} gallery images for user ${userId}`);
        return userImages;
    } catch (error) {
        console.error('❌ Failed to load user gallery:', error);
        throw error;
    }
}

/**
 * Download image from URL
 * @param imageUrl - URL of image to download
 * @param filename - Optional filename for download
 */
export function downloadImage(imageUrl: string, filename?: string): void {
    try {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename || `ugc-image-${Date.now()}.png`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('✅ Image download initiated');
    } catch (error) {
        console.error('❌ Failed to download image:', error);
        // Fallback: open in new tab
        window.open(imageUrl, '_blank', 'noopener,noreferrer');
    }
}

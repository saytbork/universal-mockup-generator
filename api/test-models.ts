
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'GOOGLE_API_KEY is not set in environment variables' });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({
                error: 'Failed to fetch models from Google',
                status: response.status,
                details: errorText
            });
        }

        const data = await response.json();
        const models = data.models || [];

        // Filter for Imagen models or return all to see what's there
        const imagenModels = models.filter((m: any) => m.name.includes('imagen') || m.name.includes('image'));

        return res.status(200).json({
            message: 'Success',
            totalModels: models.length,
            imagenModels: imagenModels,
            allModels: models.map((m: any) => m.name) // List names of all models
        });

    } catch (error: any) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}

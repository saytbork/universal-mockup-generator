/**
 * Camera Handler - Builds camera and framing section
 */

import type { CameraConfig, SceneType } from '../sceneTypes';

export interface CameraResult {
    section: string;
}

export function buildCameraSection(camera: CameraConfig, sceneType: SceneType): CameraResult {
    const parts: string[] = ['CAMERA:'];

    if (camera.cameraSystem) {
        parts.push(sceneType === 'ugc_phone' ? 'Smartphone camera.' : `${camera.cameraSystem}.`);
    }
    if (camera.angle) parts.push(`Angle: ${camera.angle}.`);
    if (camera.distance) parts.push(`Distance: ${camera.distance}.`);
    if (camera.rotation) parts.push(`Rotation: ${camera.rotation}.`);
    if (camera.framing) {
        parts.push(sceneType === 'ugc_phone' && camera.framing === 'centered'
            ? 'Framing: slightly off-center, casual alignment.'
            : `Framing: ${camera.framing}.`);
    }

    if (sceneType === 'ugc_phone') parts.push('Front-facing capture, minor tilt allowed, handheld wobble acceptable.');
    else if (sceneType === 'studio_packshot') parts.push('Stable tripod, precise alignment, sharp focus.');
    else if (sceneType === 'ecommerce_blank_space') parts.push('Precise product framing with clear negative space.');

    return { section: parts.join(' ') };
}

import { parameterMap } from "../parameterMap";

const uniqueParts = (parts: (string | undefined)[]) =>
  Array.from(new Set(parts.filter(Boolean) as string[])).join(", ");

export function buildCamera(params: any): string {
  // Camera Type injects capture characteristics.
  // Camera Type must degrade automatically in UGC Real Mode.
  // Bundles, Formulation, and Camera are independent systems.

  let camera =
    parameterMap.cameraType?.[params.cameraType] ??
    params.cameraType ??
    parameterMap.cameraType?.[params.camera] ??
    params.camera ??
    params.placementCamera ??
    "";

  // 1️⃣ UGC Real Mode ACTIVE - Strict Degradation
  if (params.ugcRealMode) {
    const allowedCameras = [
      "Modern Smartphone", "Front Selfie Cam", "Sony Handycam Hi8",
      "Disposable Film Camera", "Polaroid OneStep", "Laptop Webcam"
    ];

    const isAllowed = allowedCameras.some(allowed =>
      camera.includes(allowed) || valuesMatch(camera, allowed)
    );

    // If user selected a PRO camera in UGC mode, force degradation
    if (!isAllowed) {
      camera = "captured with a consumer-grade handheld camera, imperfect focus and exposure";
    }
  }

  // Prevent duplication in mapped styling
  delete params.camera;
  delete params.cameraType;
  delete params.placementCamera;

  return uniqueParts([camera]);
}

// Helper to check against parameter map values since 'camera' string is the mapped description
function valuesMatch(currentDescription: string, key: string): boolean {
  return currentDescription === parameterMap.cameraType?.[key];
}

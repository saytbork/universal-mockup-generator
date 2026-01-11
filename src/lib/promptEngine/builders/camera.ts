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

  const selfieRaw =
    params.selfieMode ||
    params.personDetails?.selfieMode ||
    params.personDetails?.selfieType ||
    params.selfieType ||
    "";
  const selfieActive = /\bselfie\b/i.test(String(selfieRaw)) || /\bfront\b/i.test(String(selfieRaw));
  const ugcMode = Boolean(params.ugcMode || params.ugcRealMode) || selfieActive;

  // Selfie: force front-facing smartphone characteristics (prevents pro-camera DOF blur).
  if (selfieActive) {
    delete params.camera;
    delete params.cameraType;
    delete params.placementCamera;
    return uniqueParts([
      "front-facing smartphone camera selfie, wide fixed lens, small sensor, flat focus across the entire frame, no portrait mode blur",
    ]);
  }

  // 1️⃣ UGC MODE ACTIVE - Strict Degradation
  // UGC cannot allow any pro-camera strings (they can include "shallow depth", etc.).
  if (ugcMode) {
    const allowedCameras = [
      "Intentional smartphone camera",
      "Laptop webcam (pro setup)"
    ];

    const isAllowed = allowedCameras.some(allowed =>
      camera.includes(allowed) || valuesMatch(camera, allowed)
    );

    // If user selected a PRO camera in UGC mode, force degradation
    if (!isAllowed) {
      camera =
        parameterMap.cameraType?.["Intentional smartphone camera"] ??
        "captured with the phone’s rear camera for deliberate framing, stabilized handheld realism";
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

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
  const ugcRealActive =
    Boolean(params.ugcRealMode || params.ugcRealModeActive || params.rawDomesticUgcActive) ||
    Boolean(params.ugcRealModeLayers);
  const ugcMode = Boolean(params.ugcMode || params.ugcRealMode) || ugcRealActive || selfieActive;
  const hasProductAssets = Array.isArray(params.productAssets) && params.productAssets.length > 0;

  // Selfie: force front-facing smartphone characteristics (prevents pro-camera DOF blur).
  if (selfieActive) {
    delete params.camera;
    delete params.cameraType;
    delete params.placementCamera;
    return uniqueParts([
      "front-facing smartphone camera selfie, wide fixed lens, small sensor, flat focus across the entire frame, no portrait mode blur",
    ]);
  }

  // Raw Domestic / UGC Real Mode: must never inject rear-camera language (selfieCapture will handle specifics).
  if (ugcRealActive) {
    delete params.camera;
    delete params.cameraType;
    delete params.placementCamera;
    return uniqueParts([
      "front-facing smartphone camera, tiny sensor, wide fixed lens, flat focus across the entire frame, no portrait mode blur",
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
        "captured with a smartphone camera for deliberate framing, stabilized handheld realism";
    }
  }

  if (hasProductAssets && camera) {
    // Never encourage shallow DOF when a product reference must remain readable.
    camera = String(camera)
      .replace(
        /shallow depth of field/gi,
        ugcMode
          ? "flat focus across the entire frame"
          : "deep depth of field (f/8–f/11)"
      )
      .replace(/subject separation/gi, "crisp detail");
  }

  const focusLock =
    hasProductAssets && !ugcRealActive
      ? ugcMode
        ? "FOCUS PRIORITY: keep the product and label tack sharp and fully readable while maintaining flat focus across the entire frame (smartphone tiny-sensor look). No portrait mode, no bokeh, no background blur."
        : "FOCUS PRIORITY: lock focus on the product (not the face). The product must be the sharpest object in the frame; the label must be crisp and fully readable. Use deep depth of field (f/8–f/11) or focus stacking. Absolutely no portrait mode, bokeh, or shallow depth-of-field that blurs the product."
      : "";

  // Prevent duplication in mapped styling
  delete params.camera;
  delete params.cameraType;
  delete params.placementCamera;

  return uniqueParts([camera, focusLock]);
}

// Helper to check against parameter map values since 'camera' string is the mapped description
function valuesMatch(currentDescription: string, key: string): boolean {
  return currentDescription === parameterMap.cameraType?.[key];
}

import { buildScene } from "../builders/scene";
import { buildLighting } from "../builders/lighting";
import { buildCamera } from "../builders/camera";
import { buildComposition } from "../builders/composition";
import { buildEnvironment } from "../builders/environment";
import { parameterMap, cameraPresets } from "../parameterMap";

type ProductPlacementPromptInput = {
  productMeta?: { name?: string };
  params: Record<string, any>;
  userPrompt: string;
};

export function buildProductPlacementPrompt({ productMeta, params, userPrompt }: ProductPlacementPromptInput) {

  const addHandsEnabled = params.addHands !== false; // Default true if not specified
  const handsPrompt = addHandsEnabled
    ? "Include realistic hands holding or interacting with the product naturally, with anatomically correct positioning and natural finger alignment. Correct finger count, no extra fingers, no deformed hands."
    : "No hands visible, product only placement.";

  const cameraDistanceMap = parameterMap.cameraDistance as unknown as Record<string, string>;
  const cameraAngles = parameterMap.cameraAngles as unknown as Record<string, string>;
  const cameraDistanceKey = String(params.cameraDistance ?? "");
  const cameraAngleKey = String(params.cameraAngle ?? "");
  const cameraMovementKey = String(params.cameraMovement ?? "");

  return `
    High quality product photography of ${productMeta?.name}.
    Scene: ${buildScene(params)}, ${buildEnvironment(params)}.
    Lighting: ${buildLighting(params)}.
    Camera: ${buildCamera(params)}.
    Camera distance: ${cameraDistanceMap[cameraDistanceKey] ?? ""}.
    Composition: ${buildComposition(params)}.
    Angle: ${cameraAngles[cameraAngleKey] ?? (cameraPresets.cameraAngles as any)[cameraAngleKey]?.prompt ?? ""}.
    Movement: ${(cameraPresets.cameraMovements as any)[cameraMovementKey]?.prompt ?? ""}.
    ${handsPrompt}
    Additional instructions: ${userPrompt}.
    Ultra realistic, correct scale, subtle shadows, no distortions.
  `
}

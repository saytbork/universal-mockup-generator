import { buildScene } from "../builders/scene";
import { buildLighting } from "../builders/lighting";
import { buildCamera } from "../builders/camera";
import { buildComposition } from "../builders/composition";
import { buildEnvironment } from "../builders/environment";
import { parameterMap, cameraPresets } from "../parameterMap";

export function buildProductPlacementPrompt({ productMeta, params, userPrompt }) {

  const addHandsEnabled = params.addHands !== false; // Default true if not specified
  const handsPrompt = addHandsEnabled
    ? "Include realistic hands holding or interacting with the product naturally, with anatomically correct positioning and natural finger alignment. Correct finger count, no extra fingers, no deformed hands."
    : "No hands visible, product only placement.";

  return `
    High quality product photography of ${productMeta?.name}.
    Scene: ${buildScene(params)}, ${buildEnvironment(params)}.
    Lighting: ${buildLighting(params)}.
    Camera: ${buildCamera(params)}.
    Camera distance: ${parameterMap.cameraDistance[params.cameraDistance] ?? ""}.
    Composition: ${buildComposition(params)}.
    Angle: ${parameterMap.cameraAngles?.[params.cameraAngle] ?? cameraPresets.cameraAngles[params.cameraAngle]?.prompt ?? ""}.
    Movement: ${cameraPresets.cameraMovements[params.cameraMovement]?.prompt ?? ""}.
    ${handsPrompt}
    Additional instructions: ${userPrompt}.
    Ultra realistic, correct scale, subtle shadows, no distortions.
  `
}

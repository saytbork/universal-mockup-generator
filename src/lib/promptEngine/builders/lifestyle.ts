import { buildScene } from "./scene";
import { buildLighting } from "./lighting";
import { buildCamera } from "./camera";
import { buildComposition } from "./composition";
import { buildEnvironment } from "./environment";
import { parameterMap, cameraPresets } from "../parameterMap";

export function buildLifestylePrompt({ productMeta, params, userPrompt }) {

  const selfieType = String(params.selfieType || '').toLowerCase();
  const selfieOverridesAngle =
    selfieType.includes('mirror selfie') ||
    selfieType.includes('back camera pov') ||
    selfieType.includes('front') ||
    selfieType.includes('selfie');

  const cameraAngleKey = params.cameraShot || params.cameraAngle;
  const cameraAngle =
    selfieOverridesAngle
      ? ''
      : parameterMap.cameraAngles?.[cameraAngleKey] ??
        cameraPresets.cameraAngles[cameraAngleKey]?.prompt ??
        "";

  const pose = parameterMap.pose?.[params.personPose] ?? params.personPose ?? "";
  const expression = parameterMap.expression?.[params.personExpression] ?? params.personExpression ?? "";
  const wardrobe = parameterMap.wardrobe?.[params.wardrobeStyle] ?? params.wardrobeStyle ?? "";
  const mood = parameterMap.mood?.[params.personMood] ?? params.personMood ?? "";
  const props = params.personProps || "";
  const microLocation = parameterMap.microLocation?.[params.microLocation] ?? params.microLocation ?? "";
  const eyeDirection = parameterMap.eyeDirection?.[params.eyeDirection] ?? "";
  const creationMode = parameterMap.creationMode?.[params.creationMode] ?? params.creationMode ?? "";

  return `
    Lifestyle product photography of ${productMeta?.name}.
    Camera: ${buildCamera(params)}.
    Camera angle: ${cameraAngle}.
    Composition: ${buildComposition(params)}.
    Pose: ${pose || "natural stance"}.
    Expression: ${expression || "natural expression"}.
    Setting: ${buildScene(params)}. Micro-location: ${microLocation}.
    Lighting: ${buildLighting(params)}.
    Mood: ${mood}.
    Wardrobe: ${wardrobe}.
    Props: ${props}.
    Eye direction: ${eyeDirection}.
    Creation mode: ${creationMode}.
    Additional instructions: ${userPrompt}.
    Hyper realistic, sharp details, correct scale, clean framing.
  `
}

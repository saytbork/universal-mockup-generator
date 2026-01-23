import { buildScene } from "./scene";
import { buildLighting } from "./lighting";
import { buildCamera } from "./camera";
import { buildComposition } from "./composition";
import { buildEnvironment } from "./environment";
import { parameterMap, cameraPresets } from "../parameterMap";

type LifestylePromptInput = {
  productMeta?: { name?: string };
  params: Record<string, any>;
  userPrompt: string;
};

export function buildLifestylePrompt({ productMeta, params, userPrompt }: LifestylePromptInput) {

  const selfieType = String(params.selfieType || '').toLowerCase();
  const selfieOverridesAngle =
    selfieType.includes('mirror selfie') ||
    selfieType.includes('back camera pov') ||
    selfieType.includes('front') ||
    selfieType.includes('selfie');

  const cameraAngles = parameterMap.cameraAngles as unknown as Record<string, string>;
  const cameraAngleKey = String(params.cameraShot || params.cameraAngle || '');
  const cameraAngle =
    selfieOverridesAngle
      ? ''
      : cameraAngles[cameraAngleKey] ??
        (cameraPresets.cameraAngles as any)[cameraAngleKey]?.prompt ??
        "";

  const poseMap = parameterMap.pose as unknown as Record<string, string>;
  const expressionMap = parameterMap.expression as unknown as Record<string, string>;
  const wardrobeMap = parameterMap.wardrobe as unknown as Record<string, string>;
  const microLocationMap = parameterMap.microLocation as unknown as Record<string, string>;
  const eyeDirectionMap = parameterMap.eyeDirection as unknown as Record<string, string>;
  const creationModeMap = parameterMap.creationMode as unknown as Record<string, string>;

  const pose = poseMap[String(params.personPose ?? '')] ?? params.personPose ?? "";
  const expression = expressionMap[String(params.personExpression ?? '')] ?? params.personExpression ?? "";
  const wardrobe = wardrobeMap[String(params.wardrobeStyle ?? '')] ?? params.wardrobeStyle ?? "";
  const props = params.personProps || "";
  const microLocation = microLocationMap[String(params.microLocation ?? '')] ?? params.microLocation ?? "";
  const rawEyeDirection = String(params.eyeDirection ?? '').trim();
  const eyeDirection =
    ({
      'Looking at camera': eyeDirectionMap['Look at Camera'],
      'Looking at product': 'their gaze is directed at the product with attentive focus',
      'Looking away naturally': eyeDirectionMap['Look Slightly Away'],
    } as Record<string, string | undefined>)[rawEyeDirection] ??
    eyeDirectionMap[rawEyeDirection] ??
    "";
  const creationMode = creationModeMap[String(params.creationMode ?? '')] ?? params.creationMode ?? "";

  return `
    Lifestyle product photography of ${productMeta?.name}.
    Camera: ${buildCamera(params)}.
    Camera angle: ${cameraAngle}.
    Composition: ${buildComposition(params)}.
    Pose: ${pose || "natural stance"}.
    Expression: ${expression || "natural expression"}.
    Setting: ${buildScene(params)}. Micro-location: ${microLocation}.
    Lighting: ${buildLighting(params)}.
    Wardrobe: ${wardrobe}.
    Props: ${props}.
    Eye direction: ${eyeDirection}.
    Creation mode: ${creationMode}.
    Additional instructions: ${userPrompt}.
    Hyper realistic, sharp details, correct scale, clean framing.
  `
}

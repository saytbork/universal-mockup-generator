// src/lib/promptEngine/parameterMap.types.ts

export type EyeDirectionKey =
  | "Look at Camera"
  | "Look Slightly Away"
  | "Look Down"
  | "Look Up"
  | "Eyes Closed";

export type CameraAngleKey =
  | "fullBody" | "closeUp" | "extremeCloseUp" | "extremeLongShot"
  | "highAngleShot" | "lowAngleShot" | "birdsEyeView" | "dutchAngle"
  | "sideProfile" | "overTheShoulder" | "offCenterShot"
  | "shotFromBehind" | "cowboyShot" | "povShot"
  | "Eye level" | "Slightly above eye level" | "Slightly below eye level"
  | "High angle" | "Low angle" | "Top-down" | "Bottom-up";

export type CameraMovementKey =
  | "trackingShot" | "dollyShot" | "craneShot"
  | "tiltShot" | "panShot" | "orbitShot";

export type CameraDistanceKey =
  | "macro" | "close" | "medium" | "wide" | "environment";

export type CameraShotKey =
  | "fullBody"
  | "closeUp"
  | "extremeCloseUp"
  | "extremeLongShot"
  | "highAngleShot"
  | "birdsEyeView"
  | "dutchAngle"
  | "sideProfile"
  | "lowAngleShot"
  | "Extreme close-up"
  | "Close"
  | "Medium"
  | "Wide"
  | "Full body";

export type CompositionModeKey =
  | "Product First"
  | "Balanced"
  | "Fifty / Fifty"
  | "Model First"
  | "Standard UGC"
  | "Cinematic UGC"
  | "Ecommerce Blank Space";

export interface ParameterMap {
  eyeDirection: Record<EyeDirectionKey, string>;
  appearanceLevel: Record<string, string>;
  wardrobe: Record<string, string>;
  expression: Record<string, string>;
  pose: Record<string, string>;
  interaction: Record<string, string>;
  setting: Record<string, string>;
  environmentOrder: Record<string, string>;
  cameraType: Record<string, string>;
  cameraShot: Record<string, string>;
  cameraAngle: Record<string, string>;
  cameraDistance: Record<CameraDistanceKey, string>;
  productMaterial: Record<string, string>;
  cameraAngles?: Record<CameraShotKey, string>;
  lighting: Record<string, string>;
  selfieMode: Record<string, string>;
  compositionMode: Record<CompositionModeKey, string>;
  creationMode: Record<string, string>;
  props: Record<string, string>;
  microLocation: Record<string, string>;
  clothingPresets?: Record<string, string>;
}

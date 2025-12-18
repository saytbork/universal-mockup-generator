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
  | "shotFromBehind" | "cowboyShot" | "povShot";

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
  | "lowAngleShot";

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
  cameraDistance: Record<CameraDistanceKey, string>;
  productMaterial: Record<string, string>;
  cameraAngles?: Record<CameraShotKey, string>;
  lighting: Record<string, string>;
  selfieMode: Record<string, string>;
  compositionMode: Record<string, string>;
  creationMode: Record<string, string>;
  props: Record<string, string>;
  microLocation: Record<string, string>;
  clothingPresets?: Record<string, string>;
}

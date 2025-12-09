// src/lib/promptEngine/parameterMap.types.ts

export type EyeDirectionKey =
  | "Look at Camera"
  | "Look Slightly Away"
  | "Look Down"
  | "Look Up"
  | "Eyes Closed";

export type CameraShotKey =
  | 'fullBodyShot'
  | 'closeUp'
  | 'extremeCloseUp'
  | 'extremeLongShot'
  | 'highAngleShot'
  | 'birdsEyeView'
  | 'dutchAngle'
  | 'sideProfileShot'
  | 'lowAngleShot';

export type CameraAngleKey = 'high' | 'low' | 'straight' | 'tilted';

export type CameraDistanceKey = 'macro' | 'close' | 'medium' | 'long';

export interface ParameterMap {
  eyeDirection: Record<EyeDirectionKey, string>;
  ageGroup: Record<string, string>;
  appearanceLevel: Record<string, string>;
  wardrobe: Record<string, string>;
  mood: Record<string, string>;
  expression: Record<string, string>;
  pose: Record<string, string>;
  interaction: Record<string, string>;
  setting: Record<string, string>;
  environmentOrder: Record<string, string>;
  cameraType: Record<string, string>;
  cameraShot: Record<CameraShotKey, string>;
  cameraAngle: Record<CameraAngleKey, string>;
  cameraDistance: Record<CameraDistanceKey, string>;
  lighting: Record<string, string>;
  selfieType: Record<string, string>;
  compositionMode: Record<string, string>;
  creationMode: Record<string, string>;
  props: Record<string, string>;
  microLocation: Record<string, string>;
  clothingPresets: Record<string, string>;
}

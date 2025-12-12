import { parameterMap } from "../parameterMap";

const uniqueParts = (parts: (string | undefined)[]) =>
  Array.from(new Set(parts.filter(Boolean) as string[])).join(", ");

export function buildCamera(params: any): string {
  const camera =
    parameterMap.cameraType?.[params.cameraType || params.camera] ??
    params.camera ??
    params.cameraType ??
    params.placementCamera ??
    "";

  // Prevent duplication in mapped styling
  delete params.camera;
  delete params.cameraType;
  delete params.placementCamera;

  return uniqueParts([camera]);
}

import { parameterMap } from "../parameterMap";

const uniqueParts = (parts: (string | undefined)[]) =>
  Array.from(new Set(parts.filter(Boolean) as string[])).join(", ");

export function buildLighting(params: any): string {
  const lighting =
    parameterMap.lighting?.[params.lighting || params.sceneLighting] ??
    params.lighting ??
    params.sceneLighting ??
    "";

  // Prevent duplication in mapped styling
  delete params.lighting;
  delete params.sceneLighting;

  return uniqueParts([lighting]);
}

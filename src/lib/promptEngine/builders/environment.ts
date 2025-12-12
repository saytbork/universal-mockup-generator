import { parameterMap } from "../parameterMap";

const uniqueParts = (parts: (string | undefined)[]) =>
  Array.from(new Set(parts.filter(Boolean) as string[])).join(", ");

export function buildEnvironment(params: any): string {
  const environment =
    parameterMap.environmentOrder?.[params.environmentOrder || params.sceneEnvironment] ??
    params.environmentOrder ??
    params.sceneEnvironment ??
    "";

  // Prevent duplication in mapped styling
  delete params.environmentOrder;
  delete params.sceneEnvironment;

  return uniqueParts([environment]);
}

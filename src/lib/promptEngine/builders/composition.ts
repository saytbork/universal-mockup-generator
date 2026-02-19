import { parameterMap } from "../parameterMap";
import type { CompositionModeKey } from "../parameterMap.types";

const uniqueParts = (parts: (string | undefined)[]) =>
  Array.from(new Set(parts.filter(Boolean) as string[])).join(", ");

export function buildComposition(params: any): string {
  const compKey = (params.compositionMode || params.composition) as CompositionModeKey | undefined;
  const composition =
    (compKey ? parameterMap.compositionMode?.[compKey] : undefined) ??
    params.compositionMode ??
    params.composition ??
    "";

  // Prevent duplication in mapped styling
  delete params.compositionMode;
  delete params.composition;

  const placementStyle = params.placementStyle;
  delete params.placementStyle;

  return uniqueParts([composition, params.productPlane, placementStyle]);
}

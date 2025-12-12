import { parameterMap } from "../parameterMap";

const uniqueParts = (parts: (string | undefined)[]) =>
  Array.from(new Set(parts.filter(Boolean) as string[])).join(", ");

export function buildComposition(params: any): string {
  const composition =
    parameterMap.compositionMode?.[params.compositionMode || params.composition] ??
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

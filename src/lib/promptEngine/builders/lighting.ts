import { parameterMap } from "../parameterMap";

const uniqueParts = (parts: (string | undefined)[]) =>
  Array.from(new Set(parts.filter(Boolean) as string[])).join(", ");

export function buildLighting(params: any): string {
  // Lighting always injects descriptive light conditions.
  // Lighting never changes modes.

  const lighting =
    parameterMap.lighting?.[params.lighting || params.sceneLighting] ??
    params.lighting ??
    params.sceneLighting ??
    "";

  // Prevent duplication in mapped styling
  delete params.lighting;
  delete params.sceneLighting;

  // UGC Real Mode degradation (soften if needed, but lighting is robust)
  if (params.ugcRealMode && lighting) {
    const blacklist = ["cinematic", "studio", "beauty dish", "professional"];
    let isBlocked = blacklist.some(term => lighting.toLowerCase().includes(term));

    if (isBlocked) {
      // REPLACE with safe alternative
      return "natural diffused lighting with soft real-world falloff";
    }

    if (!lighting.includes("imperfect") && !lighting.includes("natural")) {
      return uniqueParts([lighting, "imperfect lighting conditions"]);
    }
  }

  return uniqueParts([lighting]);
}

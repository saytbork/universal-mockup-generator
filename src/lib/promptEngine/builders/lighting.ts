import { parameterMap } from "../parameterMap";

const uniqueParts = (parts: (string | undefined)[]) =>
  Array.from(new Set(parts.filter(Boolean) as string[])).join(", ");

const applyElderLighting = (text: string, is85Plus: boolean): string => {
  if (!text) return text;
  let result = text
    .replace(/graduated illumination/gi, 'patchy illumination with uneven falloff')
    .replace(/\bcontrolled\b/gi, 'imperfect')
    .replace(/\baesthetic\b/gi, 'imperfect');

  if (is85Plus) {
    result = result
      .replace(/\bbalanced\b/gi, 'lopsided')
      .replace(/\beven\b/gi, 'irregular');
  } else {
    result = result
      .replace(/\bbalanced\b/gi, 'uneven')
      .replace(/\beven\b/gi, 'uneven');
  }

  const addition80 =
    'Lighting stays uneven, mixed-temperature, and imperfect, prioritizing real aging cues over pretty exposure.';
  if (!result.includes(addition80)) {
    result = `${result}${result.trim().endsWith('.') ? '' : '.'} ${addition80}`;
  }

  if (is85Plus) {
    const addition85 =
      'No balanced or even cues—everything feels lopsided, off-kilter, and asymmetrical.';
    if (!result.includes(addition85)) {
      result = `${result} ${addition85}`.trim();
    }
  }

  return result.trim();
};

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

  const age = params.personDetails?.age ?? params.age;
  const isUGC = !!(params.ugcRealMode ?? params.ugcRealModeActive);
  const is80Plus = isUGC && typeof age === 'number' && age >= 80;
  const is85Plus = isUGC && typeof age === 'number' && age >= 85;

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

  const finalLighting =
    is80Plus && lighting ? applyElderLighting(lighting, !!is85Plus) : lighting;

  return uniqueParts([finalLighting]);
}

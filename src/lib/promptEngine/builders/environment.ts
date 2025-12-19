const ALLOWED_ENVIRONMENTS = new Set([
  "Kitchen",
  "Living Room",
  "Bedroom",
  "Bathroom",
  "Workspace",
  "Hallway",
  "Home Gym",
  "Balcony / Indoor Terrace",
  "Urban Exterior",
  "Natural Exterior",
  "Parking Lot",
  "Backyard / Patio",
  "Street Corner",
]);

const BANNED_TERMS = /\b(clean|tidy|organized)\b/i;

export function buildEnvironment(params: any): string {
  const customEnvironment =
    typeof params.customEnvironment === "string"
      ? params.customEnvironment.trim()
      : "";

  let environment =
    (typeof params.sceneEnvironment === "string"
      ? params.sceneEnvironment.trim()
      : "") ||
    (typeof params.environmentOrder === "string"
      ? params.environmentOrder.trim()
      : "");

  delete params.environmentOrder;
  delete params.sceneEnvironment;
  delete params.customEnvironment;

  if (!environment) {
    return "";
  }

  if (customEnvironment && environment === customEnvironment) {
    return customEnvironment;
  }

  if (BANNED_TERMS.test(environment)) {
    return "";
  }

  if (!ALLOWED_ENVIRONMENTS.has(environment)) {
    return "";
  }

  return environment;
}

export const TOOLTIP_MAP = {
  ugcRealMode:
    "Enables layered UGC Real Mode. Each accordion below controls a specific physical capture variable, and every selection flows directly into the prompt—no cleanup or perfection magic.",

  creatorPerson: "Define the person in your scene.",
  identity: "Defines who the person is.",
  age: "Age strongly influences facial structure and skin texture.",

  environment: "Defines where the scene takes place.",
  timeLighting: "Controls the time of day and lighting conditions.",
  facialExpression: "Defines the facial expression and emotional presence.",

  customClothes: "Allows referencing real clothing for a natural look.",

  cameraFraming: "Defines how the scene is captured and framed.",
  pose: "Defines body position and overall physical energy.",
  productInteraction: "Defines how the person interacts with the product.",

  ecommerceImageBuilder: "Generates clean visuals for ecommerce use.",
  formulationStory: "Aligns expert positioning with product intent.",
  outputFormat: "Defines the final image aspect ratio.",

  generateMockup:
    "Generates the final image based on selected settings."
} as const;

// src/lib/promptEngine/parameterMap.ts
import { ParameterMap } from "./parameterMap.types";

export const cameraPresets = {
  cameraAngles: {
    fullBody: { label: "Full Body Shot", description: "Shows full outfit and action.", prompt: "full body shot" },
    closeUp: { label: "Close Up", description: "Intimate and detailed.", prompt: "close up" },
    extremeCloseUp: { label: "Extreme Close Up", description: "Micro detail.", prompt: "extreme close up" },
    extremeLongShot: { label: "Extreme Long Shot", description: "Full body with environment.", prompt: "extreme long shot" },
    highAngleShot: { label: "High Angle Shot", description: "Vulnerable or small.", prompt: "high angle shot" },
    lowAngleShot: { label: "Low Angle Shot", description: "Powerful and imposing.", prompt: "low angle shot" },
    birdsEyeView: { label: "Bird's Eye View", description: "Top-down view.", prompt: "bird's eye view" },
    dutchAngle: { label: "Dutch Angle", description: "Dynamic and tense.", prompt: "dutch angle shot" },
    sideProfile: { label: "Side Profile Shot", description: "Silhouette focus.", prompt: "side profile shot" },
    overTheShoulder: { label: "Over the Shoulder", description: "Behind another person.", prompt: "over the shoulder shot" },
    offCenterShot: { label: "Off Center Shot", description: "Artistic framing.", prompt: "off center shot" },
    shotFromBehind: { label: "Shot From Behind", description: "Back view.", prompt: "shot from behind" },
    cowboyShot: { label: "Cowboy Shot", description: "Hero framing.", prompt: "cowboy shot" },
    povShot: { label: "POV Shot", description: "Through the eyes of the subject.", prompt: "point of view shot" }
  },

  cameraMovements: {
    trackingShot: { label: "Tracking Shot", description: "Camera follows subject.", prompt: "tracking shot" },
    dollyShot: { label: "Dolly Shot", description: "Camera moves in or out.", prompt: "dolly in" },
    craneShot: { label: "Crane Shot", description: "Vertical cinematic motion.", prompt: "crane shot" },
    tiltShot: { label: "Tilt Shot", description: "Vertical rotation.", prompt: "tilt up" },
    panShot: { label: "Pan Shot", description: "Horizontal rotation.", prompt: "pan right" },
    orbitShot: { label: "Orbit Shot", description: "Camera circles subject.", prompt: "orbit shot" }
  }
} as const;

export const parameterMap: ParameterMap = {
  cameraAngles: {
    fullBody: "full body shot of the subject, showing outfit, posture and action",
    closeUp: "tight close up of the subject's face",
    extremeCloseUp: "extreme close up of a specific facial feature",
    extremeLongShot: "extreme long shot showing the subject within the full environment",
    highAngleShot: "high angle shot looking down at the subject",
    birdsEyeView: "bird's eye view from top down",
    dutchAngle: "dutch angle tilted frame",
    sideProfile: "side profile view of the subject",
    lowAngleShot: "low angle shot looking upward"
  },

  eyeDirection: {
    "Look at Camera": "their eyes look directly into the camera with confident engaging focus",
    "Look Slightly Away": "their gaze is slightly off camera, creating a natural candid feel",
    "Look Down": "their eyes look softly downward in a calm reflective moment",
    "Look Up": "their eyes look gently upward with expressive energy",
    "Eyes Closed": "their eyes are softly closed in a serene natural moment"
  },

  ageGroup: {
    "6-12": "a child between ages 6 and 12",
    "13-17": "a teenager between ages 13 and 17",
    "18-25": "a young adult age 18 to 25",
    "26-35": "an adult age 26 to 35",
    "36-45": "an adult age 36 to 45",
    "46-60": "a mature adult age 46 to 60",
    "60-75": "a senior adult age 60 to 75",
    "75+": "an elderly adult over age 75",
    "No Person": ""
  },

  appearanceLevel: {
    Regular: "with regular everyday grooming",
    "Well-Groomed": "with a well groomed polished appearance",
    Styled: "with a curated stylish look",
    "Messy / Just Woke Up": "with messy just woke up appearance",
    "Running Late": "with slightly rushed running late energy"
  },

  wardrobe: {
    "Casual Streetwear": "wearing casual modern streetwear",
    Athleisure: "wearing athleisure active clothing",
    "Minimal Luxe": "wearing minimal luxe fashion layers",
    "Cozy Knitwear": "wearing cozy knitwear",
    "Bold Color Pop": "wearing bold colorful outfit elements",
    "Errand-Day Layers": "wearing layered casual errand-day clothing"
  },

  mood: {
    "Calm & Serene": "with a calm serene mood",
    "Joyful & High-Energy": "with joyful high energy presence",
    "Confident & Editorial": "with confident editorial attitude",
    "Playful & Candid": "with playful candid energy",
    "Hustle & Juggle": "with multitasking hustle mood",
    "Stressed but Determined": "with stressed but determined determination"
  },

  expression: {
    "Soft Smile": "with a soft gentle smile",
    "Full Smile": "with a bright natural full smile",
    "Serious Focus": "with a serious focused expression",
    "Excited Surprise": "with an excited surprised expression",
    "Stressed but Hopeful": "with a stressed but hopeful expression",
    "Caffeinated Crash": "with a slightly overwhelmed caffeinated crash look",
    "Real-Life Calm": "with a calm natural expression"
  },

  pose: {
    "Relaxed Portrait": "in a relaxed portrait stance",
    "Dynamic Mid-Action": "captured mid action with dynamic movement",
    "Over-the-Shoulder": "in an over the shoulder pose",
    "Leaned-In Close": "leaning in closer toward the lens",
    "Hands-Only Crop": "cropped to hands only for tactile focus",
    "Face Frame Hero": "framing the face with hands in a hero pose",
    "Grounded Lounge": "in a grounded lounge position",
    "Offer-to-Lens Reach": "reaching toward the lens with the product"
  },

  interaction: {
    Holding: "holding the product naturally with a relaxed grip",
    Using: "using the product naturally as intended",
    "Showing to Camera": "showing the product close to camera clearly",
    Unboxing: "unboxing the product with real excitement",
    Applying: "applying the product with gentle realistic motion",
    "Placing on Surface": "placing the product naturally on a surface"
  },

  setting: {
    "Living Room": "a modern living room with soft home textures",
    Kitchen: "a kitchen environment with natural surfaces",
    Bedroom: "a cozy bedroom with soft textiles",
    Bathroom: "a clean bathroom with natural lighting",
    "Home Office": "a home office workspace with minimal props",
    Café: "a warm café environment with ambient light",
    Outdoors: "an outdoor setting with natural elements",
    "In the Car": "a car interior with natural road lighting",
    Beach: "a beach setting with bright sunlight",
    "Boutique Hotel": "a boutique hotel with premium decor",
    Poolside: "a poolside area with reflections and sunlight",
    "Garden Party": "a garden party setting with greenery",
    Rooftop: "a rooftop scene with open sky",
    "Wellness Spa": "a wellness spa with calm clean atmosphere",
    "Farmer’s Market": "a farmer’s market with organic textures",
    "Mountain Cabin": "a rustic mountain cabin setting",
    "Laundry Room Reality": "a real laundry room with authentic clutter",
    "Bursting Entryway": "a bursting entryway with real everyday mess",
    "Subway Platform": "a subway platform with urban lighting",
    "Home Studio Chaos": "a home creator studio with creative clutter"
  },

  productMaterial: {
    "matte plastic": "matte plastic material finish",
    "glossy plastic": "glossy plastic material with subtle reflections",
    "transparent glass, may contain liquid": "transparent glass material that may contain liquid inside",
    "reflective metal": "reflective metal material",
    "textured paper or cardboard": "textured paper or cardboard material finish"
  },

  environmentOrder: {
    Clean: "clean organized environment with minimal distractions",
    Natural: "natural lived in environment with subtle details",
    Casual: "casual everyday realistic environment",
    "Creative Chaos": "creative environment with mild clutter",
    "Post-Launch Mess": "messy environment with scattered props"
  },

  cameraType: {
    "Modern Smartphone": "captured with a modern smartphone aesthetic",
    "Front Selfie Cam": "captured using the front selfie camera perspective",
    "Sony Handycam Hi8": "retro Sony Hi8 camcorder aesthetic",
    "Disposable Film Camera": "disposable film camera grainy look",
    "Polaroid OneStep": "polaroid style soft tone aesthetic",
    "DSLR/Mirrorless": "mirrorless camera depth and clarity",
    "Laptop Webcam": "webcam look with flat lighting",
    "Cinema Camera Rig": "cinema camera dynamic range look",
    "Medium Format Studio Camera": "medium format high clarity aesthetic",
    "Sony FX3": "Sony FX3 cinematic modern look"
  },

  cameraDistance: {
    macro: "extreme macro close up",
    close: "close up shot",
    medium: "medium distance shot",
    wide: "wide shot showing more environment",
    environment: "distant product shot inside large scenic environment"
  },

  lighting: {
    "Natural Light": "soft natural window lighting",
    "Sunny Day": "bright sunny lighting with crisp highlights",
    "Golden Hour": "warm golden hour ambience",
    Overcast: "diffused overcast lighting",
    "Cozy Indoors": "warm indoor light ambiance",
    "Ring Light": "ring light with circular catchlights",
    "Mood Lighting": "moody low light environment",
    "Night Mode": "night mode with low exposure feel",
    "Flash Photo": "on camera flash aesthetic with crisp shadows"
  },

  selfieType: {
    None: "",
    "Arm's Length Selfie": "captured from arm's length selfie distance",
    "Mirror Selfie (phone visible)": "mirror selfie with visible phone",
    "One-hand product selfie": "one handed selfie with product close and phone unseen",
    "Overhead in-bed selfie": "overhead selfie from in bed angle",
    "Low-angle hero selfie": "low angle selfie direction",
    "Back camera POV": "back camera POV with visible arms"
  },

  compositionMode: {
    "Standard UGC": "standard UGC casual composition",
    "Cinematic UGC": "cinematic UGC composition with depth",
    "Ecommerce Blank Space": "ecommerce layout with clean blank space"
  },

  creationMode: {
    "Lifestyle UGC": "lifestyle UGC with natural imperfections",
    "Studio Hero": "studio hero shot aesthetic",
    "Aesthetic Builder": "aesthetic builder scene with curated props",
    "Background Replace": "clean background replacement mode",
    "Ecommerce Blank Space": "ecommerce blank space layout"
  },

  props: {
    None: "",
    "Smartphone / Tech": "subtle tech props placed naturally",
    "Coffee / Beverage": "coffee or beverage props included",
    "Notebook / Journal": "notebook or journal props",
    "Makeup Tool": "makeup tool props",
    "Shopping Tote": "shopping tote as a lifestyle prop"
  },

  microLocation: {
    None: "",
    "Sofa Corner": "positioned in a sofa corner",
    "Kitchen Island": "at the kitchen island",
    "Vanity Mirror": "near a vanity mirror",
    "Boutique Shelf": "beside a boutique retail shelf",
    "Rooftop Lounge": "in a rooftop lounge atmosphere"
  },

  clothingPresets: {
    tired_hoodie_wrinkles: "wearing a tired hoodie with visible wrinkles, slightly worn texture",
    oversized_home_sweater: "wearing an oversized home sweater, cozy and loose",
    messy_casual_outfit: "wearing a messy casual outfit, imperfect and relaxed",
    loose_imperfect_tshirt: "wearing a loose imperfect t-shirt",
    no_makeup_natural_home_clothes: "wearing natural, no-makeup home clothes"
  }
};

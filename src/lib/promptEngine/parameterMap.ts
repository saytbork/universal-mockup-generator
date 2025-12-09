import { ParameterMap } from "./parameterMap.types";

export const parameterMap: ParameterMap = {
  /* ---------------------------------------- */
  /* EYE DIRECTION */
  /* ---------------------------------------- */
  eyeDirection: {
    lookAtCamera: "eyes looking directly into the camera with confident engaging focus",
    lookSlightlyAway: "gaze slightly off camera for a natural candid feel",
    lookDown: "eyes looking softly downward in a reflective moment",
    lookUp: "eyes looking upward with expressive energy",
    eyesClosed: "eyes gently closed in a calm serene expression",
  },

  /* ---------------------------------------- */
  /* AGE GROUP (reforzado para evitar rejuvenecer) */
  /* ---------------------------------------- */
  ageGroup: {
    "6-12": "a child age 6 to 12",
    "13-17": "a teenager age 13 to 17",
    "18-25": "a young adult between 18 and 25",
    "26-35": "an adult age 26 to 35",
    "36-45": "an adult age 36 to 45",
    "46-60": "a mature adult age 46 to 60 with realistic adult facial structure",
    "60-75": "a senior adult age 60 to 75 with visible wrinkles, gray tones, and aged skin",
    "75+": "an elderly adult age 75 to 95 with deep wrinkles, thin aging skin, gray or white hair, and unmistakably old appearance",
    "No Person": "",
  },

  /* ---------------------------------------- */
  /* GENDER */
  /* ---------------------------------------- */
  gender: {
    male: "a male person",
    female: "a female person",
    nonbinary: "a non-binary individual",
  },

  /* ---------------------------------------- */
  /* ETHNICITY */
  /* ---------------------------------------- */
  ethnicity: {
    african: "with African ethnicity and rich deeper skin tones",
    africanAmerican: "African American person with natural textured features",
    afroLatino: "Afro-Latino individual with mixed heritage features",
    asian: "with East Asian facial features",
    southAsian: "with South Asian facial features",
    hispanic: "Hispanic individual with warm skin tones",
    caucasian: "Caucasian individual with lighter skin tone",
    middleEastern: "Middle Eastern person with warm undertones",
  },

  /* ---------------------------------------- */
  /* SKIN TONE */
  /* ---------------------------------------- */
  skinTone: {
    fair: "with fair skin tone",
    medium: "with medium warm skin tone",
    olive: "with olive green undertone skin tone",
    brown: "with brown skin tone",
    dark: "with deep rich dark skin tone",
  },

  /* ---------------------------------------- */
  /* HAIR COLOR */
  /* ---------------------------------------- */
  hairColor: {
    black: "with black hair",
    brown: "with brown hair",
    blonde: "with blonde hair",
    red: "with red hair",
    gray: "with gray or white aging hair",
  },

  /* ---------------------------------------- */
  /* HAIR STYLE */
  /* ---------------------------------------- */
  hairStyle: {
    short: "with short hair",
    long: "with long flowing hair",
    curly: "with curly hair",
    wavy: "with wavy hair",
    straight: "with straight hair",
    buzzcut: "with a buzzcut hairstyle",
    bun: "wearing hair in a bun",
    ponytail: "wearing a ponytail",
  },

  /* ---------------------------------------- */
  /* APPEARANCE LEVEL */
  /* ---------------------------------------- */
  personAppearance: {
    regular: "with a natural regular appearance",
    wellGroomed: "with a polished well groomed appearance",
    styled: "with a curated stylish look",
    messyJustWokeUp: "with messy just-woke-up appearance",
    runningLate: "with a rushed running-late look",
  },

  /* ---------------------------------------- */
  /* POSE */
  /* ---------------------------------------- */
  pose: {
    relaxedPortrait: "standing in a relaxed portrait stance",
    dynamicMidAction: "captured mid action with realistic movement",
    overTheShoulder: "in an over-the-shoulder pose",
    leanedInClose: "leaning in close toward the camera",
    handsOnlyCrop: "cropped to hands only for tactile realism",
    faceFrameHero: "framing the face with hands in a hero pose",
    groundedLounge: "in a grounded seated lounge position",
    offerToLensReach: "reaching toward the lens with the product",
  },

  /* ---------------------------------------- */
  /* MOOD */
  /* ---------------------------------------- */
  mood: {
    calmSerene: "with calm serene energy",
    joyfulHighEnergy: "with joyful high energy mood",
    confidentEditorial: "with confident editorial attitude",
    playfulCandid: "with playful candid vibe",
    hustleJuggle: "with multitasking hustle mood",
    stressedDetermined: "with stressed but determined expression",
  },

  /* ---------------------------------------- */
  /* EXPRESSION */
  /* ---------------------------------------- */
  expression: {
    softSmile: "with a soft gentle smile",
    fullSmile: "with a bright natural full smile",
    seriousFocus: "with a serious focused expression",
    excitedSurprise: "with an excited surprised expression",
    stressedHopeful: "with a stressed but hopeful expression",
    caffeinatedCrash: "with a slightly overwhelmed caffeinated crash look",
    realLifeCalm: "with a calm natural expression",
  },

  /* ---------------------------------------- */
  /* INTERACTION */
  /* ---------------------------------------- */
  interaction: {
    holding: "holding the product naturally with a relaxed grip",
    using: "using the product naturally",
    showingToCamera: "showing the product clearly to the camera",
    unboxing: "unboxing the product with excitement",
    applying: "applying the product with natural motion",
    placingOnSurface: "placing the product naturally onto a surface",
  },

  /* ---------------------------------------- */
  /* SETTING */
  /* ---------------------------------------- */
  setting: {
    livingRoom: "a modern living room with soft home textures",
    kitchen: "a kitchen environment with natural surfaces",
    bedroom: "a cozy bedroom with warm textiles",
    bathroom: "a clean bathroom with natural lighting",
    homeOffice: "a home office workspace with minimal props",
    cafe: "a warm café environment",
    outdoors: "an outdoor space with natural greenery",
    inTheCar: "inside a car with natural daylight",
    beach: "a beach scene with bright sunlight",
    boutiqueHotel: "a boutique hotel with premium design",
    poolside: "a poolside area with reflections",
    gardenParty: "a garden party with greenery",
    rooftop: "a rooftop setting with open sky",
    wellnessSpa: "a wellness spa with calm ambiance",
    farmersMarket: "a farmer’s market with organic details",
    mountainCabin: "a rustic mountain cabin interior",
    laundryRoom: "a laundry room with real clutter",
    entryway: "a home entryway with everyday mess",
    subwayPlatform: "a subway platform with urban lighting",
    homeStudio: "a creator home studio filled with props",
  },

  /* ---------------------------------------- */
  /* MICRO LOCATION */
  /* ---------------------------------------- */
  microLocation: {
    sofaCorner: "positioned in a sofa corner",
    kitchenIsland: "standing at the kitchen island",
    vanityMirror: "near a vanity mirror",
    boutiqueShelf: "beside a boutique retail shelf",
    rooftopLounge: "in a rooftop lounge environment",
  },

  /* ---------------------------------------- */
  /* CAMERA TYPE */
  /* ---------------------------------------- */
  cameraType: {
    modernSmartphone: "captured with modern smartphone image quality",
    frontSelfieCam: "captured using the front selfie camera",
    sonyHi8: "retro Sony Hi8 camcorder style",
    disposableFilm: "grainy disposable film camera aesthetic",
    polaroid: "soft nostalgic polaroid rendering",
    dslr: "mirrorless full-frame crisp clarity",
    webcam: "webcam flat lighting aesthetic",
    cinemaRig: "cinema camera dynamic range",
    mediumFormat: "medium format high clarity",
    sonyFx3: "Sony FX3 cinematic rendering",
  },

  /* ---------------------------------------- */
  /* CAMERA SHOT */
  /* ---------------------------------------- */
  cameraShot: {
    fullBodyShot: "full body shot",
    closeUp: "close up shot of the subject's face",
    extremeCloseUp: "extreme close up of facial detail",
    extremeLongShot: "extreme long shot showing subject inside environment",
    highAngleShot: "high angle shot looking downward",
    birdsEyeView: "bird’s eye top down view",
    dutchAngle: "tilted dynamic dutch angle framing",
    sideProfileShot: "side profile view",
    lowAngleShot: "low angle shot looking upward",
  },

  /* ---------------------------------------- */
  /* CAMERA ANGLE */
  /* ---------------------------------------- */
  cameraAngle: {
    high: "shot from a high angle",
    low: "shot from a low angle",
    straight: "eye level perspective",
    tilted: "tilted creative perspective",
  },

  /* ---------------------------------------- */
  /* CAMERA DISTANCE */
  /* ---------------------------------------- */
  cameraDistance: {
    macro: "macro distance capturing small detail",
    close: "close distance framing face or hands",
    medium: "medium distance framing upper body",
    long: "long distance environmental framing",
  },

  /* ---------------------------------------- */
  /* LIGHTING */
  /* ---------------------------------------- */
  lighting: {
    naturalLight: "soft natural window lighting",
    sunnyDay: "bright sunny exposure",
    goldenHour: "warm golden hour tones",
    overcast: "diffused overcast light",
    cozyIndoors: "warm indoor ambient lighting",
    ringLight: "ring light with circular catchlights",
    moodLighting: "moody low-light ambiance",
    nightMode: "night mode with low exposure",
    flashPhoto: "direct flash aesthetic with crisp shadows",
  },

  /* ---------------------------------------- */
  /* SELFIE TYPES */
  /* ---------------------------------------- */
  selfieType: {
    none: "",
    armsLength: "arm's length natural selfie",
    mirrorSelfie: "mirror selfie with visible phone",
    oneHandSelfie: "one handed selfie with hidden phone",
    overheadSelfie: "overhead selfie angle",
    lowAngleHero: "hero low-angle upward selfie",
    backCameraPov: "back camera POV with arms visible",
  },

  /* ---------------------------------------- */
  /* CLOTHING PRESETS */
  /* ---------------------------------------- */
  clothingPresets: {
    tiredHoodieWrinkles: "wearing a tired hoodie with visible wrinkles",
    oversizedHomeSweater: "wearing an oversized cozy sweater",
    messyCasualOutfit: "wearing a messy relaxed outfit",
    looseImperfectTshirt: "wearing a loose imperfect t-shirt",
    naturalHomeClothes: "wearing natural no-makeup home clothes",
  },
};

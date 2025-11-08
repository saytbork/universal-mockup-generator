

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleGenAI, Modality } from "@google/genai";
import { MockupOptions, OptionCategory, Option } from './types';
import { 
  CONTENT_STYLE_OPTIONS,
  PLACEMENT_STYLE_OPTIONS,
  PLACEMENT_CAMERA_OPTIONS,
  LIGHTING_OPTIONS, SETTING_OPTIONS, AGE_GROUP_OPTIONS, CAMERA_OPTIONS, 
  PERSPECTIVE_OPTIONS, SELFIE_TYPE_OPTIONS, ETHNICITY_OPTIONS,
  GENDER_OPTIONS, ASPECT_RATIO_OPTIONS, ENVIRONMENT_ORDER_OPTIONS, PERSON_APPEARANCE_OPTIONS,
  PRODUCT_MATERIAL_OPTIONS, PRODUCT_INTERACTION_OPTIONS, REALISM_OPTIONS
} from './constants';
import ImageUploader from './components/ImageUploader';
import GeneratedImage from './components/GeneratedImage';
import VideoGenerator from './components/VideoGenerator';
import Accordion from './components/Accordion';
import ChipSelectGroup from './components/ChipSelectGroup';
import ImageEditor from './components/ImageEditor';
import MoodReferencePanel from './components/MoodReferencePanel';
import OnboardingOverlay from './components/OnboardingOverlay';

const LOCAL_STORAGE_KEY = 'ugc-product-mockup-generator-api-key';
const EMAIL_STORAGE_KEY = 'ugc-product-mockup-generator-user-email';
const IMAGE_COUNT_KEY = 'ugc-product-mockup-generator-image-count';
const VIDEO_ACCESS_KEY = 'ugc-product-mockup-generator-video-access';
const TRIAL_BYPASS_KEY = 'ugc-product-mockup-trial-bypass';
const TRIAL_BYPASS_CODE = '713371';
const VIDEO_SECRET_CODE = '713371';
const ONBOARDING_DISMISSED_KEY = 'ugc-onboarding-hidden';

type AiStudioApi = {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
};

const getEnvApiKey = (): string | undefined => {
  const fromVite = import.meta.env.VITE_GEMINI_API_KEY;
  if (fromVite) {
    return fromVite.trim();
  }
  const fromProcess = process.env.API_KEY;
  return fromProcess ? fromProcess.trim() : undefined;
};

const fileToBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [mimeType, base64] = result.split(';base64,');
      resolve({ base64, mimeType: mimeType.replace('data:', '') });
    };
    reader.onerror = (error) => reject(error);
  });
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (value: number) => value.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) return null;
  const bigint = Number.parseInt(sanitized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
};

const extractPaletteFromImage = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);
      const buckets = new Map<string, number>();
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 128) continue;
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const key = `${r}-${g}-${b}`;
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
      const palette = [...buckets.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key]) => {
          const [r, g, b] = key.split('-').map(Number);
          return rgbToHex(r, g, b);
        });
      URL.revokeObjectURL(objectUrl);
      resolve(palette);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };
    img.src = objectUrl;
  });
};

type MoodSuggestion = {
  moodLabel: string;
  lightingLabel: string;
  settingLabel: string;
  placementStyleLabel: string;
  placementCameraLabel: string;
};

const deriveMoodSuggestions = (palette: string[]): MoodSuggestion => {
  const defaultSuggestion: MoodSuggestion = {
    moodLabel: 'balanced studio vibes',
    lightingLabel: 'Natural Light',
    settingLabel: 'Home Office',
    placementStyleLabel: 'On-White Studio',
    placementCameraLabel: 'Product Tabletop Rig',
  };
  const hslColors = palette
    .map(hexToRgb)
    .filter((rgb): rgb is { r: number; g: number; b: number } => Boolean(rgb))
    .map(({ r, g, b }) => rgbToHsl(r, g, b));

  if (!hslColors.length) {
    return defaultSuggestion;
  }

  const totals = hslColors.reduce(
    (acc, color) => {
      acc.s += color.s;
      acc.l += color.l;
      const rad = (color.h * Math.PI) / 180;
      acc.hx += Math.cos(rad);
      acc.hy += Math.sin(rad);
      return acc;
    },
    { s: 0, l: 0, hx: 0, hy: 0 }
  );

  const avgSat = totals.s / hslColors.length;
  const avgLight = totals.l / hslColors.length;
  const avgHue =
    (Math.atan2(totals.hy / hslColors.length, totals.hx / hslColors.length) * 180) / Math.PI + 360;
  const normalizedAvgHue = avgHue % 360;

  const mostSaturated = [...hslColors].sort((a, b) => b.s - a.s)[0];
  const primaryHue = mostSaturated && mostSaturated.s > 0.25 ? mostSaturated.h : normalizedAvgHue;

  if (avgLight < 0.3) {
    return {
      moodLabel: 'moody editorial luxe',
      lightingLabel: 'Mood Lighting',
      settingLabel: 'Boutique Hotel',
      placementStyleLabel: 'Luxury Editorial',
      placementCameraLabel: 'Cinema Camera',
    };
  }

  if (avgLight > 0.78 && avgSat < 0.25) {
    return {
      moodLabel: 'airy minimalist',
      lightingLabel: 'Natural Light',
      settingLabel: 'On-White Studio',
      placementStyleLabel: 'On-White Studio',
      placementCameraLabel: 'Product Tabletop Rig',
    };
  }

  if (primaryHue >= 190 && primaryHue <= 250 && avgSat > 0.25) {
    return {
      moodLabel: 'coastal & aquatic',
      lightingLabel: 'Sunny Day',
      settingLabel: 'Beach',
      placementStyleLabel: 'Splash Shot',
      placementCameraLabel: 'Overhead Rig',
    };
  }

  if (primaryHue >= 90 && primaryHue <= 150 && avgSat > 0.25) {
    return {
      moodLabel: 'botanical lifestyle',
      lightingLabel: 'Natural Light',
      settingLabel: 'Garden Party',
      placementStyleLabel: 'Nature Elements',
      placementCameraLabel: 'Macro Lens',
    };
  }

  if ((primaryHue <= 40 || primaryHue >= 330) && avgSat > 0.25) {
    return {
      moodLabel: 'sunset glamour',
      lightingLabel: 'Golden Hour',
      settingLabel: 'Rooftop',
      placementStyleLabel: 'Luxury Editorial',
      placementCameraLabel: 'Cinema Camera',
    };
  }

  if (primaryHue >= 50 && primaryHue <= 80 && avgSat > 0.25) {
    return {
      moodLabel: 'earthy daylight',
      lightingLabel: 'Sunny Day',
      settingLabel: 'Mountain Cabin',
      placementStyleLabel: 'Nature Elements',
      placementCameraLabel: 'Macro Lens',
    };
  }

  return defaultSuggestion;
};

const getOptionValueByLabel = (options: Option[], label: string): string => {
  const match = options.find((option) => option.label === label);
  return match ? match.value : options[0].value;
};

const getSectionId = (title: string) =>
  `accordion-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const App: React.FC = () => {
  const location = useLocation();
  const envApiKey = getEnvApiKey();
  const [options, setOptions] = useState<MockupOptions>({
    contentStyle: '',
    placementStyle: PLACEMENT_STYLE_OPTIONS[0].value,
    placementCamera: PLACEMENT_CAMERA_OPTIONS[0].value,
    lighting: LIGHTING_OPTIONS[0].value,
    setting: SETTING_OPTIONS[0].value,
    environmentOrder: ENVIRONMENT_ORDER_OPTIONS[0].value,
    ageGroup: AGE_GROUP_OPTIONS[5].value, // Default to 'No Person'
    camera: CAMERA_OPTIONS[0].value,
    perspective: PERSPECTIVE_OPTIONS[0].value,
    aspectRatio: ASPECT_RATIO_OPTIONS[0].value,
    selfieType: SELFIE_TYPE_OPTIONS[0].value,
    ethnicity: ETHNICITY_OPTIONS[0].value,
    gender: GENDER_OPTIONS[0].value,
    personAppearance: PERSON_APPEARANCE_OPTIONS[0].value,
    productMaterial: PRODUCT_MATERIAL_OPTIONS[0].value,
    productInteraction: PRODUCT_INTERACTION_OPTIONS[0].value,
    realism: REALISM_OPTIONS[1].value,
  });

  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [apiKey, setApiKey] = useState<string>(envApiKey ?? '');
  const [manualApiKey, setManualApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isUsingStoredKey, setIsUsingStoredKey] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [imageGenerationCount, setImageGenerationCount] = useState(0);
  const [hasVideoAccess, setHasVideoAccess] = useState(false);
  const [videoAccessInput, setVideoAccessInput] = useState('');
  const [videoAccessError, setVideoAccessError] = useState<string | null>(null);
  const [moodImagePreview, setMoodImagePreview] = useState<string | null>(null);
  const [moodPalette, setMoodPalette] = useState<string[]>([]);
  const [moodSummary, setMoodSummary] = useState<string | null>(null);
  const [moodPromptCue, setMoodPromptCue] = useState<string | null>(null);
  const [isMoodProcessing, setIsMoodProcessing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const intentRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const customizeRef = useRef<HTMLDivElement>(null);
  const isDevBypass = useMemo(() => {
    if (!import.meta.env.DEV) return false;
    const params = new URLSearchParams(location.search);
    return params.has('dev');
  }, [location.search]);
  const [hasTrialBypass, setHasTrialBypass] = useState(false);
  const [trialCodeInput, setTrialCodeInput] = useState('');
  const [trialCodeError, setTrialCodeError] = useState<string | null>(null);
  const isTrialBypassActive = hasTrialBypass || isDevBypass;
  const isTrialLocked = !isTrialBypassActive;
  const hasSelectedIntent = Boolean(options.contentStyle);
  const hasUploadedProduct = Boolean(uploadedImagePreview);
  const canUseMood = hasUploadedProduct;
  const contentStyleValue = hasSelectedIntent ? options.contentStyle : CONTENT_STYLE_OPTIONS[0].value;
  const scrollToSection = useCallback((title: string) => {
    const element = document.getElementById(getSectionId(title));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);
  const stepThreeCategories = useMemo<Set<OptionCategory>>(
    () =>
      new Set<OptionCategory>([
        'productMaterial',
        'setting',
        'environmentOrder',
        'placementStyle',
        'placementCamera',
        'lighting',
        'camera',
        'perspective',
        'aspectRatio',
        'realism',
        'ageGroup',
        'personAppearance',
        'productInteraction',
        'gender',
        'ethnicity',
        'selfieType',
      ]),
    []
  );
  const onboardingStepsMeta = useMemo(
    () => [
      {
        title: 'Choose Content Intent',
        description: 'Pick between authentic UGC or a polished placement. This unlocks the rest of the builder.',
        ref: intentRef,
      },
      {
        title: 'Upload your product',
        description: 'Drop your product photo once—we’ll reuse it for every variation unless you replace it.',
        ref: uploadRef,
      },
      {
        title: 'Customize the vibe',
        description: 'Dial in scene, camera, realism, and people details before generating or editing.',
        ref: customizeRef,
      },
    ],
    []
  );
  
  // State for video generation
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isAiStudioAvailable, setIsAiStudioAvailable] = useState(false);
  const [isKeySelected, setIsKeySelected] = useState(Boolean(envApiKey));

  // State to manage which accordion is currently open
  const [openAccordion, setOpenAccordion] = useState<string | null>('Scene & Product');
  const [selectedCategories, setSelectedCategories] = useState<Set<OptionCategory>>(new Set());
  const accordionOrder = ['Scene & Product', 'Photography', 'Person Details'];

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const aiStudioInstance = (window as typeof window & { aistudio?: AiStudioApi }).aistudio;
    setIsAiStudioAvailable(Boolean(aiStudioInstance));

    const storedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY);
    if (storedEmail) {
      setUserEmail(storedEmail);
    setIsLoggedIn(true);
    setEmailInput(storedEmail);
  }

    const storedCount = window.localStorage.getItem(IMAGE_COUNT_KEY);
    if (storedCount) {
      const parsed = Number.parseInt(storedCount, 10);
      if (!Number.isNaN(parsed)) {
        setImageGenerationCount(parsed);
      }
    }

    const storedVideoAccess = window.localStorage.getItem(VIDEO_ACCESS_KEY);
    if (storedVideoAccess === 'granted') {
      setHasVideoAccess(true);
    }

    const storedKey = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      setManualApiKey(storedKey);
      setIsKeySelected(true);
      setIsUsingStoredKey(true);
      return;
    }

    if (envApiKey) {
      setIsKeySelected(true);
      return;
    }

    const checkAiStudioSelection = async () => {
      if (aiStudioInstance && await aiStudioInstance.hasSelectedApiKey()) {
        setIsKeySelected(true);
      }
    };

    checkAiStudioSelection();
  }, [envApiKey]);

  useEffect(() => {
    return () => {
      if (moodImagePreview) {
        URL.revokeObjectURL(moodImagePreview);
      }
    };
  }, [moodImagePreview]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true') {
      setShowOnboarding(false);
    }
  }, []);

  useEffect(() => {
    if (!showOnboarding) return;
    const current = onboardingStepsMeta[onboardingStep - 1]?.ref.current;
    if (current) {
      current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showOnboarding, onboardingStep, onboardingStepsMeta]);

  const removeStoredApiKey = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setIsUsingStoredKey(false);
  }, []);

  const requireNewApiKey = useCallback(() => {
    setApiKey('');
    setManualApiKey('');
    setIsKeySelected(false);
  }, []);

  const handleApiKeyInvalid = useCallback(() => {
    if (isUsingStoredKey) {
      removeStoredApiKey();
    }
    requireNewApiKey();
  }, [isUsingStoredKey, removeStoredApiKey, requireNewApiKey]);

  const handleManualApiKeySubmit = useCallback(() => {
    const trimmed = manualApiKey.trim();
    if (!trimmed) {
      setApiKeyError('Please enter a valid Gemini API key.');
      return;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, trimmed);
    }

    setApiKey(trimmed);
    setIsKeySelected(true);
    setApiKeyError(null);
    setIsUsingStoredKey(true);
  }, [manualApiKey]);

  const handleManualApiKeyChange = useCallback((value: string) => {
    setManualApiKey(value);
    if (apiKeyError) {
      setApiKeyError(null);
    }
  }, [apiKeyError]);

  const handleTrialCodeChange = useCallback((value: string) => {
    setTrialCodeInput(value);
    if (trialCodeError) {
      setTrialCodeError(null);
    }
  }, [trialCodeError]);

  const handleTrialCodeSubmit = useCallback(() => {
    const trimmed = trialCodeInput.trim();
    if (!trimmed) {
      setTrialCodeError('Enter the access code to unlock unlimited generations.');
      return;
    }

    if (trimmed === TRIAL_BYPASS_CODE) {
      setHasTrialBypass(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TRIAL_BYPASS_KEY, 'true');
      }
      setTrialCodeInput('');
      setTrialCodeError(null);
    } else {
      setTrialCodeError('Invalid code. Please try again.');
    }
  }, [trialCodeInput]);

  const skipOnboarding = useCallback(() => {
    setShowOnboarding(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
    }
  }, []);

  const advanceOnboardingFromStep = useCallback((step: number) => {
    if (!showOnboarding || onboardingStep !== step) return;
    if (step >= 3) {
      skipOnboarding();
    } else {
      setOnboardingStep(step + 1);
    }
  }, [showOnboarding, onboardingStep, skipOnboarding]);
  const handleOnboardingNext = useCallback(() => {
    advanceOnboardingFromStep(onboardingStep);
  }, [advanceOnboardingFromStep, onboardingStep]);

  const handleReplayOnboarding = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ONBOARDING_DISMISSED_KEY);
    }
    setOnboardingStep(1);
    setShowOnboarding(true);
  }, []);

  const handleVideoAccessCodeChange = useCallback((value: string) => {
    setVideoAccessInput(value);
    if (videoAccessError) {
      setVideoAccessError(null);
    }
  }, [videoAccessError]);

  const handleVideoAccessSubmit = useCallback(() => {
    if (videoAccessInput.trim() === VIDEO_SECRET_CODE) {
      setHasVideoAccess(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(VIDEO_ACCESS_KEY, 'granted');
      }
      setVideoAccessError(null);
    } else {
      setVideoAccessError('Invalid access code.');
    }
  }, [videoAccessInput]);

  const applyMoodInspiration = useCallback((palette: string[]) => {
    if (!palette.length) {
      setMoodSummary('Could not detect enough color data from the reference.');
      return;
    }
    const suggestion = deriveMoodSuggestions(palette);
    setOptions(prev => {
      const updated = { ...prev };
      updated.lighting = getOptionValueByLabel(LIGHTING_OPTIONS, suggestion.lightingLabel);
      updated.setting = getOptionValueByLabel(SETTING_OPTIONS, suggestion.settingLabel);
      if (prev.contentStyle === 'product') {
        updated.placementStyle = getOptionValueByLabel(PLACEMENT_STYLE_OPTIONS, suggestion.placementStyleLabel);
        updated.placementCamera = getOptionValueByLabel(PLACEMENT_CAMERA_OPTIONS, suggestion.placementCameraLabel);
      }
      return updated;
    });
    setSelectedCategories(prev => {
      const next = new Set(prev);
      next.add('lighting');
      next.add('setting');
      if (options.contentStyle === 'product') {
        next.add('placementStyle');
        next.add('placementCamera');
      }
      return next;
    });
    setMoodSummary(`Mood hint: ${suggestion.moodLabel}. Tuned lighting to ${suggestion.lightingLabel} and scene to ${suggestion.settingLabel}.`);
    setMoodPromptCue(`Match the atmosphere of a ${suggestion.moodLabel} palette with ${suggestion.lightingLabel} lighting and details reminiscent of ${suggestion.settingLabel}.`);
  }, [options.contentStyle]);

  const handleMoodImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMoodSummary('Please upload an image file.');
      setMoodPromptCue(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMoodSummary('Please keep inspiration images under 5MB.');
      setMoodPromptCue(null);
      return;
    }
    setIsMoodProcessing(true);
    setMoodSummary(null);
    setMoodPromptCue(null);
    setMoodPalette([]);
    setMoodImagePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    try {
      const palette = await extractPaletteFromImage(file);
      setMoodPalette(palette);
      applyMoodInspiration(palette);
    } catch (err) {
      console.error(err);
      setMoodSummary('We could not analyze that reference. Try another image.');
      setMoodPromptCue(null);
    } finally {
      setIsMoodProcessing(false);
    }
  }, [applyMoodInspiration]);

  const handleClearMood = useCallback(() => {
    setMoodImagePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setMoodPalette([]);
    setMoodSummary(null);
    setMoodPromptCue(null);
  }, []);

  const handleEmailChange = useCallback((value: string) => {
    setEmailInput(value);
    if (emailError) {
      setEmailError(null);
    }
  }, [emailError]);

  const handleEmailSubmit = useCallback(() => {
    const trimmed = emailInput.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Enter a valid email address to continue.');
      return;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(EMAIL_STORAGE_KEY, trimmed);
    }
    setUserEmail(trimmed);
    setIsLoggedIn(true);
    setEmailError(null);
  }, [emailInput]);


  const handleSelectKey = async () => {
    if (typeof window === 'undefined') {
      return;
    }
    const aiStudioInstance = (window as typeof window & { aistudio?: AiStudioApi }).aistudio;
    if (!aiStudioInstance) {
      return;
    }
    await aiStudioInstance.openSelectKey();
    setIsKeySelected(true);
  };

  const getActiveApiKeyOrNotify = useCallback((notify: (message: string) => void): string | null => {
    const resolvedKey = apiKey || envApiKey;
    if (!resolvedKey) {
      notify('Please configure your Gemini API key to continue.');
      requireNewApiKey();
      return null;
    }
    return resolvedKey;
  }, [apiKey, envApiKey, requireNewApiKey]);

  const handleToggleAccordion = (title: string) => {
    setOpenAccordion(current => (current === title ? null : title));
  };

  const handleOptionChange = (category: OptionCategory, value: string, accordionTitle: string) => {
    const newOptions = { ...options, [category]: value };
    const updatedSelectedCategories = new Set(selectedCategories).add(category);

    if (category === 'contentStyle') {
      if (value === 'product') {
        newOptions.ageGroup = 'no person';
        updatedSelectedCategories.add('ageGroup');
        newOptions.placementStyle = PLACEMENT_STYLE_OPTIONS[0].value;
        newOptions.placementCamera = PLACEMENT_CAMERA_OPTIONS[0].value;
        updatedSelectedCategories.add('placementStyle');
        updatedSelectedCategories.add('placementCamera');
      }
    }
    if (category === 'contentStyle') {
      advanceOnboardingFromStep(1);
    } else if (stepThreeCategories.has(category)) {
      advanceOnboardingFromStep(3);
    }

    setOptions(newOptions);
    setSelectedCategories(updatedSelectedCategories);
  
    const advance = () => {
      const currentIndex = accordionOrder.indexOf(accordionTitle);
      if (currentIndex !== -1 && currentIndex < accordionOrder.length - 1) {
        const nextTitle = accordionOrder[currentIndex + 1];
        setOpenAccordion(nextTitle);
        setTimeout(() => scrollToSection(nextTitle), 120);
      } else if (currentIndex === accordionOrder.length - 1) {
        setOpenAccordion(null);
      }
    };
  
    const accordionCategoryMap: Record<string, OptionCategory[]> = {
      'Scene & Product': ['productMaterial', 'setting', 'environmentOrder'],
      'Photography': ['lighting', 'camera', 'perspective', 'aspectRatio', 'realism'],
      'Person Details': ['ageGroup', 'personAppearance', 'productInteraction', 'gender', 'ethnicity', 'selfieType'],
    };
    
    let requiredCategories = accordionCategoryMap[accordionTitle];
    if (!requiredCategories) return;

    if (accordionTitle === 'Scene & Product' && newOptions.contentStyle === 'product') {
      requiredCategories = [...requiredCategories, 'placementStyle', 'placementCamera'];
    }
  
    // If 'Person Details' is the current accordion and 'no person' is selected,
    // then only 'ageGroup' is required to advance.
    if (accordionTitle === 'Person Details' && newOptions.ageGroup === 'no person') {
      requiredCategories = ['ageGroup'];
    }
  
    const allRequiredSelected = requiredCategories.every(cat => updatedSelectedCategories.has(cat));
  
    if (allRequiredSelected) {
      advance();
    }
  };
  
  const resetOutputs = useCallback(() => {
    setGeneratedImageUrl(null);
    setImageError(null);
    setGeneratedVideoUrl(null);
    setVideoError(null);
    setIsVideoLoading(false);
    setVideoPrompt('');
    setEditPrompt('');
  }, []);

  const handleReset = useCallback(() => {
    resetOutputs();
    setSelectedCategories(new Set());
    setOpenAccordion('Scene & Product');
    setMoodPalette([]);
    setMoodSummary(null);
    setMoodImagePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setUploadedImageFile(null);
    setUploadedImagePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [resetOutputs]);

  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(EMAIL_STORAGE_KEY);
      window.localStorage.removeItem(VIDEO_ACCESS_KEY);
    }
    handleReset();
    setUserEmail('');
    setEmailInput('');
    setIsLoggedIn(false);
    setHasVideoAccess(false);
    setVideoAccessInput('');
    setVideoAccessError(null);
    setMoodPalette([]);
    setMoodSummary(null);
    setMoodImagePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [handleReset]);

  const handleImageUpload = useCallback((file: File) => {
    const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
    
    // Reset any previous state first.
    handleReset(); 

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setImageError(`Unsupported file type. Please upload a PNG, JPEG, or WebP image.`);
      setUploadedImageFile(null);
      setUploadedImagePreview(null);
      return;
    }
    
    setUploadedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setUploadedImagePreview(previewUrl);
    advanceOnboardingFromStep(2);
  }, [handleReset, advanceOnboardingFromStep]);
  
  const constructPrompt = (): string => {
    const currentStyle = contentStyleValue;
    const isUgcStyle = currentStyle !== 'product';
    const personIncluded = isUgcStyle && options.ageGroup !== 'no person';

    const getInteractionDescription = (interaction: string): string => {
      switch (interaction) {
        case 'holding it naturally':
          return 'holding the product naturally and comfortably.';
        case 'using it':
          return 'using the product naturally as intended.';
        case 'showing to camera':
          return 'showing the product close to the camera.';
        case 'unboxing it':
          return 'unboxing the product with excitement.';
        case 'applying it':
          return 'applying the product to their skin or body.';
        case 'placing on surface':
          return 'placing the product carefully on a nearby surface.';
        default:
          return `interacting with the product in a way that is ${interaction}.`;
      }
    };

    let prompt = `Create an ultra-realistic, authentic ${isUgcStyle ? 'UGC lifestyle' : 'product placement'} photo with a ${options.aspectRatio} aspect ratio. `;
    prompt += isUgcStyle
      ? `The shot should feel candid, emotional, and cinematic, as if taken by a real person with a ${options.camera}. `
      : `The shot should feel refined and advertising-ready, with deliberate staging captured on a ${options.camera}. `;

    prompt += `The scene is a ${options.setting}, illuminated by ${options.lighting}. The overall environment has a ${options.environmentOrder} feel. The photo is shot from a ${options.perspective}, embracing the chosen camera style and its natural characteristics. `;
    
    prompt += `The focus is on the provided product, which has a ${options.productMaterial} finish. Place this exact product into the scene naturally. Ensure its material, reflections, and shadows are rendered realistically according to the environment. Do not alter the product's design or branding. `;
    if (!isUgcStyle) {
      prompt += ` No people should appear in the frame. Style the set like a premium product placement shoot with thoughtful props, surfaces, and depth, highlighting the product as the hero. Use a ${options.placementCamera} approach and style the scene as ${options.placementStyle}. `;
    }
    if (options.realism) {
      prompt += ` ${options.realism}`;
    }
    if (moodPromptCue) {
      prompt += ` ${moodPromptCue}`;
    }

    if (personIncluded) {
        prompt += `The photo features a ${options.gender} person, age ${options.ageGroup}, of ${options.ethnicity} ethnicity, who has a ${options.personAppearance}. `;
        if (options.selfieType === 'close-up shot of a hand holding the product') {
            prompt += `The shot is a close-up of their hand holding the product naturally. `;
        } else {
            prompt += `The person is ${getInteractionDescription(options.productInteraction)} Their face and upper body are visible, and the interaction looks unposed and authentic. `;
            if (options.selfieType !== 'none') {
                prompt += `The style is a ${options.selfieType}. `;
            }
        }
    }
    
    prompt += `Final image must be high-resolution and free of any watermarks, text, or artificial elements. It should feel like a captured moment, not a staged ad.`;

    return prompt;
  }

  const handleGenerateClick = async () => {
    if (isTrialLocked) {
      setImageError("Free plan limit reached. Upgrade to a paid plan to continue generating images.");
      return;
    }
    if (!uploadedImageFile) {
      setImageError("Please upload a product image first.");
      return;
    }

    resetOutputs();
    setIsImageLoading(true);

    try {
      const resolvedApiKey = getActiveApiKeyOrNotify(setImageError);
      if (!resolvedApiKey) {
        setIsImageLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: resolvedApiKey });
      const { base64, mimeType } = await fileToBase64(uploadedImageFile);
      const finalPrompt = constructPrompt();
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ inlineData: { data: base64, mimeType }}, {text: finalPrompt}] },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          const newCount = imageGenerationCount + 1;
          setImageGenerationCount(newCount);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(IMAGE_COUNT_KEY, String(newCount));
          }
          return; // Exit after finding the image
        }
      }

      throw new Error("Image generation failed or returned no images.");
    } catch (err) {
      console.error(err);
      // Fix: Safely convert unknown error type to string.
      let errorMessage = String(err);
      try {
        const errorJson = JSON.parse(errorMessage);
        if (errorJson.error && errorJson.error.message) {
            errorMessage = String(errorJson.error.message);
        }
      } catch (parseError) {
        // Not a JSON string, use original message
      }
      
      if (errorMessage.includes("Requested entity was not found")) {
        setImageError("Your API Key is invalid. Please select a valid key to continue.");
        handleApiKeyInvalid();
      } else if (errorMessage.toLowerCase().includes("quota")) {
        setImageError("API quota exceeded. Please select a different API key, or check your current key's plan and billing details.");
        handleApiKeyInvalid();
      } else {
        setImageError(errorMessage);
      }
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!generatedImageUrl || !editPrompt) {
        setImageError("Cannot edit without an image and a prompt.");
        return;
    }

    setIsImageLoading(true);
    setImageError(null);

    try {
        const resolvedApiKey = getActiveApiKeyOrNotify(setImageError);
        if (!resolvedApiKey) {
          setIsImageLoading(false);
          return;
        }
        const ai = new GoogleGenAI({ apiKey: resolvedApiKey });
        const base64Image = generatedImageUrl.split(',')[1];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { 
                parts: [
                    { inlineData: { data: base64Image, mimeType: 'image/png' } }, 
                    { text: editPrompt }
                ] 
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
                setEditPrompt(''); // Clear prompt after successful edit
                return; // Exit after finding the image
            }
        }

        throw new Error("Image edit failed or returned no images.");
    } catch (err) {
        console.error(err);
        let errorMessage = String(err);
        try {
            const errorJson = JSON.parse(errorMessage);
            if (errorJson.error && errorJson.error.message) {
                errorMessage = String(errorJson.error.message);
            }
        } catch (parseError) {
            // Not a JSON string, use original message
        }
        
        if (errorMessage.includes("Requested entity was not found")) {
            setImageError("Your API Key is invalid. Please select a valid key to continue.");
            handleApiKeyInvalid();
        } else if (errorMessage.toLowerCase().includes("quota")) {
            setImageError("API quota exceeded. Please select a different API key, or check your current key's plan and billing details.");
            handleApiKeyInvalid();
        } else {
            setImageError(errorMessage);
        }
    } finally {
        setIsImageLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!hasVideoAccess) {
        setVideoError("Video generation is locked. Enter your access code to unlock this feature.");
        return;
    }
    if (!generatedImageUrl) {
        setVideoError("An image must be generated first.");
        return;
    }
    
    setIsVideoLoading(true);
    setVideoError(null);
    setGeneratedVideoUrl(null);

    try {
      const resolvedApiKey = getActiveApiKeyOrNotify(message => setVideoError(message));
      if (!resolvedApiKey) {
        setIsVideoLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: resolvedApiKey });
      const base64Image = generatedImageUrl.split(',')[1];

      const getVideoAspectRatio = (): '16:9' | '9:16' => {
        if (options.aspectRatio === '1:1') return '9:16'; // VEO doesn't support 1:1, default to vertical
        return options.aspectRatio as '16:9' | '9:16';
      };

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt,
        image: {
          imageBytes: base64Image,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: getVideoAspectRatio(),
        }
      });
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      if (operation.error) {
        throw new Error(operation.error.message || 'Video generation failed with an unknown error.');
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${resolvedApiKey}`);
        const blob = await response.blob();
        setGeneratedVideoUrl(URL.createObjectURL(blob));
      } else {
        throw new Error("Video generation completed but no download link was provided.");
      }

    // FIX: Refactored the error handling block to simplify logic, remove duplication, and fix a potential type error.
    } catch (err) {
        console.error(err);
        let errorMessage = err instanceof Error ? err.message : String(err);

        try {
            // Attempt to parse the error message as JSON to get a more specific message.
            const errorJson = JSON.parse(errorMessage);
            if (errorJson.error && errorJson.error.message) {
                errorMessage = String(errorJson.error.message);
            }
        } catch (parseError) {
            // Not a JSON string, use original message
        }
        
        if (errorMessage.includes("Requested entity was not found")) {
            setVideoError("Your API Key is invalid. Please select a valid key to continue.");
            handleApiKeyInvalid();
        } else if (errorMessage.toLowerCase().includes("quota")) {
            setVideoError("API quota exceeded. Please select a different API key, or check your current key's plan and billing details.");
            handleApiKeyInvalid();
        } else {
            setVideoError(errorMessage);
        }
    } finally {
        setIsVideoLoading(false);
    }
};
 

  const isProductPlacement = contentStyleValue === 'product';
  const isPersonOptionsDisabled = isProductPlacement || options.ageGroup === 'no person';

  const renderLoginScreen = () => (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900/70 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300 mb-2">Access Required</p>
          <h1 className="text-3xl font-bold">Log in to continue</h1>
          <p className="mt-3 text-sm text-gray-400">
            Enter your work email so we can enforce plan limits and send occasional product updates.
          </p>
        </div>
        <div className="space-y-3 text-left">
          <label className="text-xs uppercase tracking-widest text-gray-500">Work email</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={emailInput}
            onChange={(event) => handleEmailChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleEmailSubmit();
              }
            }}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {emailError && <p className="text-sm text-red-400">{emailError}</p>}
        </div>
        <button
          onClick={handleEmailSubmit}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out shadow-lg"
        >
          Continue
        </button>
        <p className="text-xs text-gray-500">
          By logging in you agree to receive product emails. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );

  const renderApiKeyScreen = () => (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900/70 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300 mb-2">Connect Gemini API</p>
          <h1 className="text-3xl font-bold">Bring your API key</h1>
          <p className="mt-3 text-sm text-gray-400">
            Paste a Gemini API key to run generations locally. You can also select one from AI Studio if available.
          </p>
        </div>
        {isAiStudioAvailable && (
          <button
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            Select API Key from AI Studio
          </button>
        )}
        <div className="space-y-3 text-left">
          <label className="text-xs uppercase tracking-widest text-gray-500">Gemini API key</label>
          <input
            type="password"
            placeholder="AI... or ya29..."
            value={manualApiKey}
            onChange={(event) => handleManualApiKeyChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleManualApiKeySubmit();
              }
            }}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {apiKeyError && <p className="text-sm text-red-400">{apiKeyError}</p>}
        </div>
        <button
          onClick={handleManualApiKeySubmit}
          disabled={!manualApiKey.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/40 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out shadow-lg"
        >
          Save API Key
        </button>
        <p className="text-xs text-gray-500">
          Keys are stored locally in this browser only. Review{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-300 underline">
            Gemini API billing
          </a>.
        </p>
      </div>
    </div>
  );

  const TrialLimitOverlay = () => (
    <div className="absolute inset-0 bg-gray-900/95 flex flex-col justify-center items-center z-30 p-8 text-center rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Access code required</h2>
      <p className="mb-6 text-gray-300 max-w-lg">
        We disabled the public credits while we harden the production release. Enter the internal code to unlock the builder.
      </p>
      <div className="w-full max-w-md space-y-2 text-left">
        <p className="text-xs uppercase tracking-widest text-gray-500">Internal access</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={trialCodeInput}
            onChange={event => handleTrialCodeChange(event.target.value)}
            placeholder="Enter access code"
            className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleTrialCodeSubmit}
            className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-600 transition"
          >
            Unlock app
          </button>
        </div>
        {trialCodeError && <p className="text-xs text-red-300">{trialCodeError}</p>}
      </div>
      <p className="mt-4 text-xs text-gray-500">Need the code? Ping the product team.</p>
    </div>
  );

  if (!isLoggedIn) {
    return renderLoginScreen();
  }

  if (!isKeySelected) {
    return renderApiKeyScreen();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
        {isTrialLocked && <TrialLimitOverlay />}
        <OnboardingOverlay
          visible={showOnboarding}
          currentStep={onboardingStep}
          steps={onboardingStepsMeta}
          onNext={handleOnboardingNext}
          onSkip={skipOnboarding}
        />

        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Universal AI Mockup Generator
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Generate photo-realistic UGC-style images for your products in seconds.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {isKeySelected && isUsingStoredKey && (
              <button
                onClick={handleApiKeyInvalid}
                className="inline-flex items-center justify-center rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800 transition"
              >
                Change API Key
              </button>
            )}
            <button
              onClick={handleReplayOnboarding}
              className="inline-flex items-center justify-center rounded-lg border border-indigo-500/60 text-sm font-semibold text-indigo-200 px-4 py-2 hover:bg-indigo-500/10 transition"
            >
              Replay guided tour
            </button>
          </div>
          {isLoggedIn && (
            <>
              <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center justify-center text-sm text-gray-400">
                <span>Signed in as {userEmail}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-full border border-gray-600 px-3 py-1 font-semibold text-gray-200 hover:bg-gray-800 transition"
                >
                  Switch account
                </button>
              </div>
              {!isTrialBypassActive ? (
                <div className="mt-4 flex flex-col items-center gap-3 text-xs text-gray-400 max-w-md mx-auto">
                  <p className="text-center text-sm">
                    Private beta access is locked. Enter the internal code to unlock unlimited generations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <input
                      type="text"
                      value={trialCodeInput}
                      onChange={event => handleTrialCodeChange(event.target.value)}
                      placeholder="Enter access code"
                      className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleTrialCodeSubmit}
                      className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-600 transition"
                    >
                      Unlock app
                    </button>
                  </div>
                  {trialCodeError && <p className="text-red-300">{trialCodeError}</p>}
                </div>
              ) : (
                <p className="mt-3 text-xs text-emerald-300">Access code activated — unlimited generations unlocked.</p>
              )}
            </>
          )}
        </header>

        <main className="flex flex-col gap-8">
            <div className="grid gap-6 lg:grid-cols-3">
                <div ref={intentRef} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col gap-4 h-full">
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-widest text-indigo-300">Step 1</p>
                  <h2 className="text-2xl font-bold text-gray-200">Choose Content Intent</h2>
                  <p className="text-sm text-gray-400">
                    {isProductPlacement
                      ? 'Product Placement focuses on stylized scenes with zero people so the product stays hero.'
                      : 'UGC Lifestyle enables authentic creator vibes, including people interacting with the product.'}
                  </p>
                </div>
                <ChipSelectGroup
                  label="Content Style"
                  options={CONTENT_STYLE_OPTIONS}
                  selectedValue={options.contentStyle}
                  onChange={(value) => handleOptionChange('contentStyle', value, 'Content Intent')}
                />
              </div>
              <div ref={uploadRef} className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col gap-4 h-full">
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-widest text-indigo-300">Step 2</p>
                  <h2 className="text-2xl font-bold text-gray-200">
                    {hasUploadedProduct ? 'Product Photo Ready' : 'Add Your Product Photo'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {hasUploadedProduct
                      ? 'This product image will be reused for both UGC and Product Placement. Upload again only if you want to replace it.'
                      : 'Upload a transparent PNG, JPG, or WebP of your product to anchor every scene.'}
                  </p>
                </div>
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  uploadedImagePreview={uploadedImagePreview}
                  disabled={!hasSelectedIntent}
                  lockedMessage="Select Step 1 first to unlock uploads."
                />
              </div>
              <MoodReferencePanel
                onFileSelect={handleMoodImageUpload}
                previewUrl={moodImagePreview}
                palette={moodPalette}
                summary={moodSummary}
                isProcessing={isMoodProcessing}
                onClear={handleClearMood}
                disabled={!canUseMood}
                lockedMessage="Upload your product image to activate mood analysis."
              />
            </div>
          <fieldset disabled={!hasUploadedProduct || isTrialLocked} className="contents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Controls Column */}
              <div ref={customizeRef} className={`lg:col-span-1 bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col max-h-[calc(100vh-12rem)] ${!hasUploadedProduct ? 'opacity-60' : ''}`}>
                <div className="mb-4 border-b border-gray-600 pb-3 flex-shrink-0">
                  <p className="text-xs uppercase tracking-widest text-indigo-300">Step 3</p>
                  <h2 className="text-2xl font-bold text-gray-200">Customize Your Mockup</h2>
                </div>
                
                <div className={`flex-grow overflow-y-auto custom-scrollbar -mr-4 pr-4 ${!hasUploadedProduct ? 'pointer-events-none' : ''}`}>
                  <div id={getSectionId('Scene & Product')}>
                   <Accordion 
                      title="Scene & Product" 
                      isOpen={openAccordion === 'Scene & Product'} 
                      onToggle={() => handleToggleAccordion('Scene & Product')}
                    >
                      <div className="space-y-4">
                        <ChipSelectGroup label="Product Material" options={PRODUCT_MATERIAL_OPTIONS} selectedValue={options.productMaterial} onChange={(value) => handleOptionChange('productMaterial', value, 'Scene & Product')} />
                        <ChipSelectGroup label="Location / Setting" options={SETTING_OPTIONS} selectedValue={options.setting} onChange={(value) => handleOptionChange('setting', value, 'Scene & Product')} />
                        <ChipSelectGroup label="Environment Order" options={ENVIRONMENT_ORDER_OPTIONS} selectedValue={options.environmentOrder} onChange={(value) => handleOptionChange('environmentOrder', value, 'Scene & Product')} />
                        {isProductPlacement && (
                          <div className="space-y-4">
                            <ChipSelectGroup
                              label="Studio Setup"
                              options={PLACEMENT_STYLE_OPTIONS}
                              selectedValue={options.placementStyle}
                              onChange={(value) => handleOptionChange('placementStyle', value, 'Scene & Product')}
                            />
                            <ChipSelectGroup
                              label="Hero Camera Rig"
                              options={PLACEMENT_CAMERA_OPTIONS}
                              selectedValue={options.placementCamera}
                              onChange={(value) => handleOptionChange('placementCamera', value, 'Scene & Product')}
                            />
                          </div>
                        )}
                      </div>
                    </Accordion>
                  </div>
                  <div id={getSectionId('Photography')}>
                    <Accordion 
                      title="Photography" 
                      isOpen={openAccordion === 'Photography'}
                      onToggle={() => handleToggleAccordion('Photography')}
                    >
                      <div className="space-y-4">
                        <ChipSelectGroup label="Lighting" options={LIGHTING_OPTIONS} selectedValue={options.lighting} onChange={(value) => handleOptionChange('lighting', value, 'Photography')} />
                        <ChipSelectGroup label="Camera Type" options={CAMERA_OPTIONS} selectedValue={options.camera} onChange={(value) => handleOptionChange('camera', value, 'Photography')} />
                        <ChipSelectGroup label="Perspective" options={PERSPECTIVE_OPTIONS} selectedValue={options.perspective} onChange={(value) => handleOptionChange('perspective', value, 'Photography')} />
                        <ChipSelectGroup label="Aspect Ratio" options={ASPECT_RATIO_OPTIONS} selectedValue={options.aspectRatio} onChange={(value) => handleOptionChange('aspectRatio', value, 'Photography')} />
                        <ChipSelectGroup label="Realism / Imperfections" options={REALISM_OPTIONS} selectedValue={options.realism} onChange={(value) => handleOptionChange('realism', value, 'Photography')} />
                      </div>
                    </Accordion>
                  </div>
                  <div id={getSectionId('Person Details')}>
                    <Accordion 
                      title="Person Details"
                      isOpen={openAccordion === 'Person Details'}
                      onToggle={() => handleToggleAccordion('Person Details')}
                    >
                      <div className="space-y-4">
                        <ChipSelectGroup label="Age Group" options={AGE_GROUP_OPTIONS} selectedValue={options.ageGroup} onChange={(value) => handleOptionChange('ageGroup', value, 'Person Details')} disabled={isProductPlacement} />
                        {isProductPlacement && (
                          <p className="text-xs text-gray-500">Person options are disabled for product placement shots.</p>
                        )}
                        <ChipSelectGroup label="Appearance Level" options={PERSON_APPEARANCE_OPTIONS} selectedValue={options.personAppearance} onChange={(value) => handleOptionChange('personAppearance', value, 'Person Details')} disabled={isPersonOptionsDisabled} />
                        <ChipSelectGroup label="Product Interaction" options={PRODUCT_INTERACTION_OPTIONS} selectedValue={options.productInteraction} onChange={(value) => handleOptionChange('productInteraction', value, 'Person Details')} disabled={isPersonOptionsDisabled} />
                        <ChipSelectGroup label="Gender" options={GENDER_OPTIONS} selectedValue={options.gender} onChange={(value) => handleOptionChange('gender', value, 'Person Details')} disabled={isPersonOptionsDisabled} />
                        <ChipSelectGroup label="Ethnicity" options={ETHNICITY_OPTIONS} selectedValue={options.ethnicity} onChange={(value) => handleOptionChange('ethnicity', value, 'Person Details')} disabled={isPersonOptionsDisabled} />
                        <ChipSelectGroup label="Selfie Type" options={SELFIE_TYPE_OPTIONS} selectedValue={options.selfieType} onChange={(value) => handleOptionChange('selfieType', value, 'Person Details')} disabled={isPersonOptionsDisabled} />
                      </div>
                    </Accordion>
                  </div>
                </div>

                <div className="mt-8 flex-shrink-0">
                  <button 
                    onClick={handleGenerateClick}
                    disabled={isImageLoading || !uploadedImageFile}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                  >
                    {isImageLoading ? 'Generating...' : 'Generate Mockup'}
                  </button>
                </div>
              </div>
              
              {/* Visuals Column */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                <GeneratedImage
                  imageUrl={generatedImageUrl} 
                  isImageLoading={isImageLoading} 
                  imageError={imageError}
                  onReset={handleReset}
                />
                {generatedImageUrl && (
                  <ImageEditor
                    editPrompt={editPrompt}
                    onPromptChange={e => setEditPrompt(e.target.value)}
                    onEditImage={handleEditImage}
                    isEditing={isImageLoading}
                  />
                )}
                {generatedImageUrl && (
                  <VideoGenerator
                    videoPrompt={videoPrompt}
                    onPromptChange={e => setVideoPrompt(e.target.value)}
                    onGenerateVideo={handleGenerateVideo}
                    isVideoLoading={isVideoLoading}
                    videoError={videoError}
                    generatedVideoUrl={generatedVideoUrl}
                    isGenerating={isVideoLoading || isImageLoading}
                    hasAccess={hasVideoAccess}
                    accessCode={videoAccessInput}
                    onAccessCodeChange={handleVideoAccessCodeChange}
                    onAccessSubmit={handleVideoAccessSubmit}
                    accessError={videoAccessError}
                  />
                )}
              </div>
            </div>
          </fieldset>
        </main>
      </div>
    </div>
  );
};

export default App;

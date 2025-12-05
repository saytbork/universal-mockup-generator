#!/bin/bash
# Script to replace constructPrompt function with PromptEngine v2 wrapper

# Create backup
cp App.tsx App.tsx.backup

# Use sed to delete lines 3457 through 4036 (the old function body)
sed -i '' '3457,4036d' App.tsx

# Insert new function body at line 3457
cat > /tmp/new_prompt_engine.txt << 'EOF'
    const personIncluded = isUgcStyle && (options.ageGroup !== 'no person' || hasModelReference);
    
    // Real mode settings
    const realModeActive = ugcRealSettings.isEnabled && !isProductPlacement && personIncluded;
    
    // Bundle products
    const bundleProductsForPrompt = bundleProductsOverride ?? bundleSelectionRef.current;
    const bundleLabels = bundleProductsForPrompt
      ?.map(id => productMediaLibrary[id]?.label || PRODUCT_MEDIA_LIBRARY[id]?.label)
      .filter(Boolean) || [];

    // Height notes
    const formatHeightNumber = (num: number) => (Number.isInteger(num) ? num.toString() : num.toFixed(1));
    const describeHeight = (value: number, unit: 'cm' | 'in') => {
      if (unit === 'cm') {
        const inches = (value / 2.54).toFixed(1);
        return `${formatHeightNumber(value)} cm tall (about ${inches} in)`;
      }
      const centimeters = (value * 2.54).toFixed(1);
      return `${formatHeightNumber(value)} in tall (about ${centimeters} cm)`;
    };
    const heightNotes = productAssets
      .filter(asset => asset.heightValue)
      .map(asset => `${asset.label || 'product'} ${describeHeight(asset.heightValue!, asset.heightUnit)}`)
      .join('. ');

    // Identity package
    const identityPackage = personIdentityPackage;
    const identityHasModelReference = Boolean(identityPackage.modelReferenceBase64);
    
    // Composition intro
    const compositionIntro = COMPOSITION_BLOCKS[compositionMode] ?? '';
    
    // Identity block
    const describeValue = (value?: string, fallback = 'unspecified') => clean(value || fallback);
    const identityBlock = identityHasModelReference
      ? `Use the uploaded model reference as the exact identity. Do not change or alter the person's face, age, hair, skin tone, gender, or any physical attributes. Preserve identity exactly. Do not stylize, enhance, beautify, or modify the appearance in any way.`
      : identityPackage.personDetails
        ? `Use the following identity for the person in this scene. This identity must remain exactly consistent across all scenes. Do not alter or randomize the face, age, facial structure, or appearance. Age group: ${describeValue(identityPackage.personDetails.ageGroup)} Gender: ${describeValue(identityPackage.personDetails.gender)} Ethnicity: ${describeValue(identityPackage.personDetails.ethnicity)} Skin tone: ${describeValue(identityPackage.personDetails.skinTone)} Hair: ${describeValue(identityPackage.personDetails.hairType, 'natural')}, ${describeValue(identityPackage.personDetails.hairLength, 'medium')}, ${describeValue(identityPackage.personDetails.hairColor)} Facial hair: ${describeValue(identityPackage.personDetails.facialHair, 'natural')} Body type: ${describeValue(identityPackage.personDetails.bodyType, 'balanced')} Facial features: Do not alter or randomize.`
        : '';

    // Model reference
    const modelReference = modelReferenceFile ? {
      base64: modelReferenceFile.base64 || '',
      mimeType: modelReferenceFile.mimeType,
      notes: modelReferenceNotes.trim() || undefined,
    } : undefined;

    // Hero landing settings
    const heroBackground = supplementBackgroundColor.trim() || HERO_LANDING_META?.heroLandingConfig?.backgroundColor || '#FFFFFF';
    const heroAlignment = HERO_ALIGNMENT_TEXT[heroProductAlignment] || '';
    const heroShadow = HERO_SHADOW_TEXT[heroShadowStyle] || '';

    // Formulation expert
    const formulationExpertNameValue = (() => {
      if (!formulationExpertEnabled) return undefined;
      const preset = FORMULATION_PRESET_LOOKUP[formulationExpertPreset];
      return (formulationExpertName || preset?.suggestedName || 'Dr. Ana Ruiz').trim();
    })();
    
    const formulationExpertRoleValue = (() => {
      if (!formulationExpertEnabled) return undefined;
      const preset = FORMULATION_PRESET_LOOKUP[formulationExpertPreset];
      const expertRole = (formulationExpertRole || preset?.role || 'lead formulator').trim();
      return formulationExpertProfession === 'custom'
        ? expertRole
        : (FORMULATION_PROFESSION_LOOKUP[formulationExpertProfession]?.label ?? expertRole);
    })();

    // Real mode preset
    const realModePreset = (() => {
      if (!realModeActive) return undefined;
      const realityPreset = UGC_REALITY_PRESETS.find(item => item.id === ugcRealSettings.selectedRealityPresetId);
      return realityPreset ? clean(realityPreset.prompt) : undefined;
    })();

    // ========================================
    // BUILD PROMPT WITH PROMPTENGINE V2
    // ========================================
    
    const promptOptions = {
      // Core
      contentStyle: isUgcStyle ? 'ugc' as const : 'product' as const,
      creationMode: options.creationMode,
      aspectRatio: options.aspectRatio,
      camera: options.camera,
      
      // Scene
      setting: options.setting,
      lighting: options.lighting,
      perspective: options.perspective,
      environmentOrder: options.environmentOrder,
      productPlane: options.productPlane,
      
      // Person
      ageGroup: options.ageGroup,
      gender: options.gender,
      ethnicity: options.ethnicity,
      skinTone: options.skinTone,
      hairColor: options.hairColor,
      hairStyle: options.hairStyle,
      personPose: options.personPose,
      personMood: options.personMood,
      personAppearance: options.personAppearance,
      productInteraction: options.productInteraction,
      wardrobeStyle: options.wardrobeStyle,
      personProps: options.personProps,
      microLocation: options.microLocation,
      personExpression: options.personExpression,
      selfieType: options.selfieType,
      
      // Product
      productAssets: productAssets,
      heightNotes: heightNotes || undefined,
      isMultiProductPackaging: isMultiProductPackaging,
      bundleLabels: bundleLabels.length > 0 ? bundleLabels : undefined,
      
      // Special Modes
      isHeroLandingMode: isHeroLandingMode && !hasModelReference,
      heroBackground: heroBackground,
      heroAlignment: heroAlignment,
      heroScale: heroProductScale,
      heroShadow: heroShadow,
      
      compositionMode: options.compositionMode,
      bgColor: options.bgColor,
      sidePlacement: options.sidePlacement,
      
      formulationExpertEnabled: formulationExpertEnabled,
      formulationExpertName: formulationExpertNameValue,
      formulationExpertRole: formulationExpertRoleValue,
      formulationLabStyle: formulationLabStyle,
      
      // Real Mode
      realModeActive: realModeActive,
      realModePreset: realModePreset,
      
      // Identity
      modelReference: modelReference,
      identityLock: identityPackage.personDetails || undefined,
      personIncluded: personIncluded,
      compositionIntro: compositionIntro || undefined,
      identityBlock: identityBlock || undefined,
    };

    // Generate prompt using PromptEngine v2
    const prompt = promptEngine.build(promptOptions);
    
    console.log('✅ PromptEngine v2 generated prompt:', {
      length: prompt.length,
      mode: options.creationMode,
      personIncluded,
      realModeActive,
    });

    return removeConflictingIdentityPhrases(prompt);
  }
EOF

# Insert the new content
sed -i '' '3456r /tmp/new_prompt_engine.txt' App.tsx

echo "Replacement complete"



import React, { useState, useCallback, useEffect } from 'react';
import { MockupOptions, OptionCategory } from './types';
import { 
  LIGHTING_OPTIONS, SETTING_OPTIONS, AGE_GROUP_OPTIONS, CAMERA_OPTIONS, 
  ISO_OPTIONS, PERSPECTIVE_OPTIONS, SELFIE_TYPE_OPTIONS, ETHNICITY_OPTIONS,
  GENDER_OPTIONS, ASPECT_RATIO_OPTIONS, ENVIRONMENT_ORDER_OPTIONS, PERSON_APPEARANCE_OPTIONS,
  PRODUCT_MATERIAL_OPTIONS, PRODUCT_INTERACTION_OPTIONS
} from './constants';
import ImageUploader from './components/ImageUploader';
import GeneratedImage from './components/GeneratedImage';
import VideoGenerator from './components/VideoGenerator';
import Accordion from './components/Accordion';
import ChipSelectGroup from './components/ChipSelectGroup';
import ImageEditor from './components/ImageEditor';

// FIX: Removed conflicting global type declaration for `window.aistudio`.
// The TypeScript error indicates that this type is already declared globally,
// making this declaration redundant and causing a conflict.

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


const App: React.FC = () => {
  const [options, setOptions] = useState<MockupOptions>({
    lighting: LIGHTING_OPTIONS[0].value,
    setting: SETTING_OPTIONS[0].value,
    environmentOrder: ENVIRONMENT_ORDER_OPTIONS[0].value,
    ageGroup: AGE_GROUP_OPTIONS[5].value, // Default to 'No Person'
    camera: CAMERA_OPTIONS[0].value,
    iso: ISO_OPTIONS[0].value,
    perspective: PERSPECTIVE_OPTIONS[0].value,
    aspectRatio: ASPECT_RATIO_OPTIONS[0].value,
    selfieType: SELFIE_TYPE_OPTIONS[0].value,
    ethnicity: ETHNICITY_OPTIONS[0].value,
    gender: GENDER_OPTIONS[0].value,
    personAppearance: PERSON_APPEARANCE_OPTIONS[0].value,
    productMaterial: PRODUCT_MATERIAL_OPTIONS[0].value,
    productInteraction: PRODUCT_INTERACTION_OPTIONS[0].value,
  });

  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  
  // State for video generation
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // State to manage which accordion is currently open
  const [openAccordion, setOpenAccordion] = useState<string | null>('Scene & Product');
  const [selectedCategories, setSelectedCategories] = useState<Set<OptionCategory>>(new Set());
  const accordionOrder = ['Scene & Product', 'Photography', 'Person Details'];

  const handleToggleAccordion = (title: string) => {
    setOpenAccordion(current => (current === title ? null : title));
  };

  const handleOptionChange = (category: OptionCategory, value: string, accordionTitle: string) => {
    const newOptions = { ...options, [category]: value };
    setOptions(newOptions);
  
    const updatedSelectedCategories = new Set(selectedCategories).add(category);
    setSelectedCategories(updatedSelectedCategories);
  
    const advance = () => {
      const currentIndex = accordionOrder.indexOf(accordionTitle);
      if (currentIndex !== -1 && currentIndex < accordionOrder.length - 1) {
        setOpenAccordion(accordionOrder[currentIndex + 1]);
      } else if (currentIndex === accordionOrder.length - 1) {
        setOpenAccordion(null);
      }
    };
  
    const accordionCategoryMap: Record<string, OptionCategory[]> = {
      'Scene & Product': ['productMaterial', 'setting', 'environmentOrder'],
      'Photography': ['lighting', 'camera', 'iso', 'perspective', 'aspectRatio'],
      'Person Details': ['ageGroup', 'personAppearance', 'productInteraction', 'gender', 'ethnicity', 'selfieType'],
    };
    
    let requiredCategories = accordionCategoryMap[accordionTitle];
    if (!requiredCategories) return;
  
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
  
  const handleReset = useCallback(() => {
    setGeneratedImageUrl(null);
    setImageError(null);
    setGeneratedVideoUrl(null);
    setVideoError(null);
    setIsVideoLoading(false);
    setVideoPrompt('');
    setEditPrompt('');
    setSelectedCategories(new Set());
    setOpenAccordion('Scene & Product');
  }, []);

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
  }, [handleReset]);
  
  const constructPrompt = (): string => {
    const personIncluded = options.ageGroup !== 'no person';

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

    let prompt = `Create an ultra-realistic, authentic UGC (User Generated Content) style lifestyle photo with a ${options.aspectRatio} aspect ratio. The photo must look genuine, emotional, and cinematic, as if taken by a real person with a ${options.camera}. `;

    prompt += `The scene is a ${options.setting}, illuminated by ${options.lighting}. The overall environment has a ${options.environmentOrder} feel. The photo is shot from a ${options.perspective}. The camera settings should reflect ${options.iso}, creating a natural look. `;
    
    prompt += `The focus is on the provided product, which has a ${options.productMaterial} finish. Place this exact product into the scene naturally. Ensure its material, reflections, and shadows are rendered realistically according to the environment. Do not alter the product's design or branding. `;

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
    if (!uploadedImageFile) {
      setImageError("Please upload a product image first.");
      return;
    }

    handleReset();
    setIsImageLoading(true);

    try {
      const { base64, mimeType } = await fileToBase64(uploadedImageFile);
      const finalPrompt = constructPrompt();
      
      // TODO: Replace with a fetch call to your new backend endpoint
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64,
          mimeType,
          prompt: finalPrompt,
        }));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image.');
      }

      const { imageUrl } = await response.json();
      setGeneratedImageUrl(imageUrl);

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
      
      setImageError(errorMessage);
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
        const base64Image = generatedImageUrl.split(',')[1];
        
        // TODO: Replace with a fetch call to your new backend endpoint
        const response = await fetch('/api/edit-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image, prompt: editPrompt })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to edit image.');
        }
        const { imageUrl } = await response.json();
        setGeneratedImageUrl(imageUrl);
        setEditPrompt(''); // Clear prompt after successful edit
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
        
        setImageError(errorMessage);
    } finally {
        setIsImageLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!generatedImageUrl) {
        setVideoError("An image must be generated first.");
        return;
    }
    
    setIsVideoLoading(true);
    setVideoError(null);
    setGeneratedVideoUrl(null);

    try {
      const base64Image = generatedImageUrl.split(',')[1];

      const getVideoAspectRatio = (): '16:9' | '9:16' => {
        if (options.aspectRatio === '1:1') return '9:16'; // VEO doesn't support 1:1, default to vertical
        return options.aspectRatio as '16:9' | '9:16';
      };
      
      // TODO: Replace with a fetch call to your new backend endpoint
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image, prompt: videoPrompt, aspectRatio: getVideoAspectRatio() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video.');
      }

      const { videoUrl } = await response.json();
      setGeneratedVideoUrl(videoUrl);
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
        
        setVideoError(errorMessage);
    } finally {
        setIsVideoLoading(false);
    }
};
 
  const isPersonOptionsDisabled = options.ageGroup === 'no person';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
        
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Universal AI Mockup Generator
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Generate photo-realistic UGC-style images for your products in seconds.
          </p>
        </header>

        <main className="flex flex-col gap-8">
          <fieldset className="contents">
            <ImageUploader onImageUpload={handleImageUpload} uploadedImagePreview={uploadedImagePreview} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Controls Column */}
              <div className="lg:col-span-1 bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col max-h-[calc(100vh-12rem)]">
                <h2 className="text-2xl font-bold mb-4 text-gray-200 border-b border-gray-600 pb-3 flex-shrink-0">2. Customize Your Mockup</h2>
                
                <div className="flex-grow overflow-y-auto custom-scrollbar -mr-4 pr-4">
                   <Accordion 
                      title="Scene & Product" 
                      isOpen={openAccordion === 'Scene & Product'} 
                      onToggle={() => handleToggleAccordion('Scene & Product')}
                    >
                      <div className="space-y-4">
                        <ChipSelectGroup label="Product Material" options={PRODUCT_MATERIAL_OPTIONS} selectedValue={options.productMaterial} onChange={(value) => handleOptionChange('productMaterial', value, 'Scene & Product')} />
                        <ChipSelectGroup label="Location / Setting" options={SETTING_OPTIONS} selectedValue={options.setting} onChange={(value) => handleOptionChange('setting', value, 'Scene & Product')} />
                        <ChipSelectGroup label="Environment Order" options={ENVIRONMENT_ORDER_OPTIONS} selectedValue={options.environmentOrder} onChange={(value) => handleOptionChange('environmentOrder', value, 'Scene & Product')} />
                      </div>
                    </Accordion>
                    <Accordion 
                      title="Photography" 
                      isOpen={openAccordion === 'Photography'}
                      onToggle={() => handleToggleAccordion('Photography')}
                    >
                      <div className="space-y-4">
                        <ChipSelectGroup label="Lighting" options={LIGHTING_OPTIONS} selectedValue={options.lighting} onChange={(value) => handleOptionChange('lighting', value, 'Photography')} />
                        <ChipSelectGroup label="Camera Type" options={CAMERA_OPTIONS} selectedValue={options.camera} onChange={(value) => handleOptionChange('camera', value, 'Photography')} />
                        <ChipSelectGroup label="ISO" options={ISO_OPTIONS} selectedValue={options.iso} onChange={(value) => handleOptionChange('iso', value, 'Photography')} />
                        <ChipSelectGroup label="Perspective" options={PERSPECTIVE_OPTIONS} selectedValue={options.perspective} onChange={(value) => handleOptionChange('perspective', value, 'Photography')} />
                        <ChipSelectGroup label="Aspect Ratio" options={ASPECT_RATIO_OPTIONS} selectedValue={options.aspectRatio} onChange={(value) => handleOptionChange('aspectRatio', value, 'Photography')} />
                      </div>
                    </Accordion>
                    <Accordion 
                      title="Person Details"
                      isOpen={openAccordion === 'Person Details'}
                      onToggle={() => handleToggleAccordion('Person Details')}
                    >
                      <div className="space-y-4">
                        <ChipSelectGroup label="Age Group" options={AGE_GROUP_OPTIONS} selectedValue={options.ageGroup} onChange={(value) => handleOptionChange('ageGroup', value, 'Person Details')} />
                        <ChipSelectGroup label="Appearance Level" options={PERSON_APPEARANCE_OPTIONS} selectedValue={options.personAppearance} onChange={(value) => handleOptionChange('personAppearance', value, 'Person Details')} disabled={isPersonOptionsDisabled} />
                        <ChipSelectGroup label="Product Interaction" options={PRODUCT_INTERACTION_OPTIONS} selectedValue={options.productInteraction} onChange={(value) => handleOptionChange('productInteraction', value, 'Person Details')} disabled={isPersonOptionsDisabled} />
                        <ChipSelectGroup label="Gender" options={GENDER_OPTIONS} selectedValue={options.gender} onChange={(value) => handleOptionChange('gender', value, 'Person Details')} disabled={isPersonOptionsDisabled} />
                        <ChipSelectGroup label="Ethnicity" options={ETHNICITY_OPTIONS} selectedValue={options.ethnicity} onChange={(value) => handleOptionChange('ethnicity', value, 'Person Details')} disabled={isPersonOptionsDisabled} />
                        <ChipSelectGroup label="Selfie Type" options={SELFIE_TYPE_OPTIONS} selectedValue={options.selfieType} onChange={(value) => handleOptionChange('selfieType', value, 'Person Details')} disabled={isPersonOptionsDisabled} />
                      </div>
                    </Accordion>
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
/**
 * ABORT UX MESSAGES
 * 
 * User-friendly messages for each of the 10 hard fail conditions.
 * Maps internal error codes to copy ready for UI.
 */

export interface AbortMessage {
    code: string;
    shortMessage: string;
    longMessage: string;
    userAction: string;
}

export const ABORT_MESSAGES: Record<string, AbortMessage> = {
    // 1. Missing sceneType
    MISSING_SCENE_TYPE: {
        code: 'MISSING_SCENE_TYPE',
        shortMessage: 'Scene type required',
        longMessage: 'Please select a scene type before generating. This determines how your product will be photographed.',
        userAction: 'Select a scene type from the options above.'
    },

    // 2. Missing productType
    MISSING_PRODUCT_TYPE: {
        code: 'MISSING_PRODUCT_TYPE',
        shortMessage: 'Product type required',
        longMessage: 'Please describe your product type (e.g., "skincare serum", "supplement bottle").',
        userAction: 'Enter your product type in the product setup section.'
    },

    // 3. Environment where forbidden
    ENVIRONMENT_FORBIDDEN: {
        code: 'ENVIRONMENT_FORBIDDEN',
        shortMessage: 'Environment not allowed',
        longMessage: 'This scene type requires a clean studio background. Environment settings are not available.',
        userAction: 'Remove environment settings or switch to Lifestyle or Editorial mode.'
    },

    // 4. Hands where not allowed
    HANDS_FORBIDDEN: {
        code: 'HANDS_FORBIDDEN',
        shortMessage: 'Hands not allowed',
        longMessage: 'This scene type does not support hands in the image. Only Lifestyle and UGC modes allow hands.',
        userAction: 'Disable "hands allowed" or switch to Lifestyle/UGC mode.'
    },

    // 5. Creativity exceeds limit - studio_packshot
    CREATIVITY_STUDIO_EXCEEDED: {
        code: 'CREATIVITY_STUDIO_EXCEEDED',
        shortMessage: 'Creativity must be off',
        longMessage: 'Studio Packshot mode requires zero creative interpretation. Set creativity to 0.',
        userAction: 'Set creativity level to 0 (Off).'
    },

    // 5b. Creativity exceeds limit - ecommerce
    CREATIVITY_ECOMMERCE_EXCEEDED: {
        code: 'CREATIVITY_ECOMMERCE_EXCEEDED',
        shortMessage: 'Creativity too high',
        longMessage: 'Ecommerce mode allows minimal creativity only. Maximum level is 2.',
        userAction: 'Reduce creativity level to 2 or below.'
    },

    // 5c. Creativity exceeds limit - UGC
    CREATIVITY_UGC_EXCEEDED: {
        code: 'CREATIVITY_UGC_EXCEEDED',
        shortMessage: 'Creativity too high for UGC',
        longMessage: 'UGC mode must feel authentic. Maximum creativity level is 3.',
        userAction: 'Reduce creativity level to 3 or below.'
    },

    // 6. Quantity invalid for sceneType
    QUANTITY_INVALID: {
        code: 'QUANTITY_INVALID',
        shortMessage: 'Multiple products not allowed',
        longMessage: 'This scene type only supports single product images. Use Bundle Kit or Editorial for multiple products.',
        userAction: 'Set quantity to 1 or switch to Bundle Kit mode.'
    },

    // 7. bundle_kit with quantity <= 1
    BUNDLE_QUANTITY_TOO_LOW: {
        code: 'BUNDLE_QUANTITY_TOO_LOW',
        shortMessage: 'Bundle needs multiple products',
        longMessage: 'Bundle Kit mode requires at least 2 products. For single products, use Studio or Lifestyle mode.',
        userAction: 'Add more products (quantity > 1) or switch to another scene type.'
    },

    // 8. UGC with non-smartphone camera
    UGC_CAMERA_INVALID: {
        code: 'UGC_CAMERA_INVALID',
        shortMessage: 'Camera must be smartphone',
        longMessage: 'UGC mode simulates phone photography. Professional cameras are not authentic for this style.',
        userAction: 'Switch camera to "smartphone" or use a different scene type.'
    },

    // 9. Lighting contradicts sceneType
    LIGHTING_INVALID: {
        code: 'LIGHTING_INVALID',
        shortMessage: 'Lighting not compatible',
        longMessage: 'The selected lighting style is not available for this scene type.',
        userAction: 'Choose a different lighting style compatible with your scene type.'
    },

    // 10. Ecommerce misuse
    ECOMMERCE_MISUSE: {
        code: 'ECOMMERCE_MISUSE',
        shortMessage: 'Ecommerce mode unavailable',
        longMessage: 'Ecommerce overlay features are only available in Ecommerce Blank Space mode.',
        userAction: 'Switch to Ecommerce Blank Space mode or disable ecommerce settings.'
    }
};

/**
 * Maps internal error messages to UX messages
 */
export function getAbortUXMessage(internalError: string): AbortMessage | null {
    const errorLower = internalError.toLowerCase();

    if (errorLower.includes('scenetype is required')) {
        return ABORT_MESSAGES.MISSING_SCENE_TYPE;
    }
    if (errorLower.includes('producttype is required')) {
        return ABORT_MESSAGES.MISSING_PRODUCT_TYPE;
    }
    if (errorLower.includes('environment is forbidden')) {
        return ABORT_MESSAGES.ENVIRONMENT_FORBIDDEN;
    }
    if (errorLower.includes('handsallowed=true is forbidden')) {
        return ABORT_MESSAGES.HANDS_FORBIDDEN;
    }
    if (errorLower.includes('studio_packshot') && errorLower.includes('creativity')) {
        return ABORT_MESSAGES.CREATIVITY_STUDIO_EXCEEDED;
    }
    if (errorLower.includes('ecommerce_blank_space') && errorLower.includes('creativity')) {
        return ABORT_MESSAGES.CREATIVITY_ECOMMERCE_EXCEEDED;
    }
    if (errorLower.includes('ugc_phone') && errorLower.includes('creativity')) {
        return ABORT_MESSAGES.CREATIVITY_UGC_EXCEEDED;
    }
    if (errorLower.includes('quantity > 1 is only allowed')) {
        return ABORT_MESSAGES.QUANTITY_INVALID;
    }
    if (errorLower.includes('bundle_kit') && errorLower.includes('quantity > 1')) {
        return ABORT_MESSAGES.BUNDLE_QUANTITY_TOO_LOW;
    }
    if (errorLower.includes('ugc_phone') && errorLower.includes('camera')) {
        return ABORT_MESSAGES.UGC_CAMERA_INVALID;
    }
    if (errorLower.includes('lighting') && errorLower.includes('contradicts')) {
        return ABORT_MESSAGES.LIGHTING_INVALID;
    }
    if (errorLower.includes('ecommerce.enabled=true requires')) {
        return ABORT_MESSAGES.ECOMMERCE_MISUSE;
    }

    return null;
}

/**
 * All abort codes in order
 */
export const ABORT_CODES = Object.keys(ABORT_MESSAGES);

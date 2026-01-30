import type {
    EcommercePdpImageSide,
    EcommercePdpLayout,
    EcommercePdpSafeZone,
    EcommerceSlot,
    ProductAsset,
} from '../types';

export function buildEcommercePdpPrompt(input: {
    product: ProductAsset;
    slot: EcommerceSlot;
    layout: EcommercePdpLayout;
    imageSide: EcommercePdpImageSide;
}): string {
    const { product, slot, layout, imageSide } = input;

    const safeZone: EcommercePdpSafeZone = {
        side: imageSide === 'left' ? 'right' : 'left',
        widthPercent: 40,
    };

    const slotInjection: Record<EcommerceSlot, string> = {
        WHAT_IS_IT: `This image represents a product introduction section.
Composition should feel simple, welcoming, and immediately understandable.`,
        WHAT_DOES_IT_DO: `This image supports a benefits section.
Composition must feel balanced and leave generous space for a bullet list.`,
        HOW_IT_WORKS: `This image supports a step-based explanation.
Composition must feel structured and instructional.`,
        RESULTS: `This image supports social proof overlays.
Composition must feel trustworthy and calm.`,
        DIFFERENTIATION: `This image supports comparison and differentiation.
Composition must feel confident and uncluttered.`,
        GUARANTEE: `This image supports trust and reassurance messaging.
Composition must feel safe and credible.`,
    };

    // Base Prompt (NON-NEGOTIABLE) — keep verbatim; only substitute `{imageSide}`.
    const basePrompt = `You are generating an ecommerce PDP image canvas, not a finished ad.

Purpose:
Create a clean, minimal product image designed to receive text and icon overlays added later by the application.

STRICT RULES:
- Do NOT include any text, labels, badges, icons, UI elements, or typography.
- Do NOT include people, hands, faces, or lifestyle actions.
- Do NOT include decorative props outside the product support area.

COMPOSITION:
- Square format (1:1).
- Product positioned fully on the {imageSide}.
- The opposite side must remain visually empty.
- At least 40% of the image width must be clean negative space reserved for overlays.
- No objects, shadows, or highlights in the safe zone.

BACKGROUND:
- Neutral, soft, ecommerce-friendly.
- Subtle studio lighting.
- No cinematic lighting.
- No dramatic shadows.
- No architectural environments.

PRODUCT:
- Realistic scale.
- Fully assembled.
- Resting on a surface.
- Clean contact shadows.
- Label fully readable and unchanged.

STYLE:
- Minimal.
- Calm.
- Modern DTC ecommerce.
- Shopify PDP-ready.

CAMERA:
- Straight-on or slight 3/4 angle.
- Medium distance.
- No macro lenses.
- No randomized camera angles.

This image is a canvas for overlays, not a final composition.`.split('{imageSide}').join(imageSide);

    // Safe zone MUST be injected directly into the prompt.
    const safeZonePrompt = `safeZone = { side: '${safeZone.side}', widthPercent: ${safeZone.widthPercent} }

SAFE ZONE RULES (CRITICAL):
- Safe zone MUST be visually empty.
- No props.
- No shadows.
- No gradients.
- No highlights.
- Product contact shadows must not spill into the safe zone.`;

    const layoutPrompt = `LAYOUT (LOCKED): ${layout}. Product must be fully on the ${imageSide}; safe zone is the ${safeZone.side}.`;
    const productPrompt = `PRODUCT IDENTITY: ${product.name || product.id}.`;

    return [productPrompt, layoutPrompt, basePrompt, safeZonePrompt, slotInjection[slot]].join('\n\n').trim();
}

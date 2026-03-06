import type { StudioUIState } from '../types/studioTypes.ts';

/**
 * buildProductPhysical — emits supplement/product-type-specific physical description.
 * Reads `state.productPhysicalDef` (the full `definition.physical` object from V1 state).
 * This handles all physical presence sub-options for every product type:
 *   capsules, gummies, drops, powder, skincare, device, custom
 *
 * Last-selection-wins: this block overrides any generic STUDIO_MATERIAL_PROFILE
 * for the physical properties specific to the product type.
 */

function getColorDescription(color: { hex?: string; semanticName?: string } | null | undefined): string {
  if (!color) return '';
  const name = String(color.semanticName || '').trim();
  const hex = String(color.hex || '').trim();
  if (name && hex) return `${name} (${hex})`;
  if (name) return name;
  if (hex) return hex;
  return '';
}

export function buildProductPhysical(state?: StudioUIState): string {
  if (state?.industryProfile !== 'supplements') return '';
  const def = state?.productPhysicalDef;
  if (!def || !def.kind || def.kind === 'dummy') return '';
  const v = def.v;

  switch (def.kind) {
    case 'capsules': {
      const capsuleStyle = String(v.capsuleStyle || 'veggie').trim();
      const contentColor = getColorDescription(v.capsuleContentColor as any);
      const quantity = Number(v.quantity) || 3;
      const layout = String(v.layout || 'scattered').trim();
      const glassOfWater = Boolean(v.glassOfWater);
      const spoon = Boolean(v.spoon);

      const parts: string[] = [];
      parts.push(`PRODUCT_PHYSICAL_TYPE: capsules.`);
      parts.push(
        `CAPSULE_STYLE: ${capsuleStyle} capsules${contentColor ? ` with ${contentColor} powder/liquid contents` : ''}.`
      );
      parts.push(`CAPSULE_QUANTITY: ${quantity} capsules in ${layout} arrangement.`);
      if (glassOfWater) parts.push(`CAPSULE_PROP: glass of water included as companion prop.`);
      if (spoon) parts.push(`CAPSULE_PROP: small spoon as surface prop.`);
      return parts.join(' ');
    }

    case 'gummies': {
      const gummyColor = getColorDescription(v.gummyColor as any);
      const shape = String(v.shape || 'bear').trim();
      const quantity = v.quantity === 'handful' ? 'handful' : `${Number(v.quantity) || 5}`;
      const bowl = Boolean(v.bowl);
      const plate = Boolean(v.plate);

      const parts: string[] = [];
      parts.push(`PRODUCT_PHYSICAL_TYPE: gummies.`);
      parts.push(
        `GUMMY_DESCRIPTION: ${shape}-shaped gummies${gummyColor ? ` in ${gummyColor} color` : ''}.`
      );
      parts.push(`GUMMY_QUANTITY: ${quantity === 'handful' ? 'handful of gummies scattered' : `${quantity} gummies`}.`);
      if (bowl) parts.push(`GUMMY_PROP: small bowl as container prop.`);
      if (plate) parts.push(`GUMMY_PROP: plate surface as base prop.`);
      return parts.join(' ');
    }

    case 'drops': {
      const liquidColorMode = String(v.liquidColorMode || 'amber').trim();
      const liquidCustomColor = getColorDescription(v.liquidCustomColor as any);
      const liquidColorDesc = liquidColorMode === 'custom' && liquidCustomColor ? liquidCustomColor : liquidColorMode;
      const dropperState = String(v.dropperState || 'closed').replace(/-/g, ' ');
      const interactionMode = String(v.interactionMode || 'sublingual').trim();
      const glass = Boolean(v.glass);
      const teaCup = Boolean(v.teaCup);
      const minimalSpoon = Boolean(v.minimalSpoon);

      const parts: string[] = [];
      parts.push(`PRODUCT_PHYSICAL_TYPE: dropper/drops bottle.`);
      parts.push(`DROPPER_LIQUID: ${liquidColorDesc} liquid inside dropper bottle.`);
      parts.push(`DROPPER_STATE: dropper ${dropperState}.`);
      if (interactionMode === 'mixed') {
        if (glass) parts.push(`DROPS_PROP: glass of liquid nearby for mixing.`);
        if (teaCup) parts.push(`DROPS_PROP: tea cup nearby for mixing.`);
        if (minimalSpoon) parts.push(`DROPS_PROP: minimal spoon as prop.`);
      }
      return parts.join(' ');
    }

    case 'powder': {
      const powderColor = getColorDescription(v.powderColor as any);
      const texture = String(v.texture || 'fine').trim();
      const presentation = String(v.presentation || 'in-container-rim').replace(/-/g, ' ');
      const mixMode = String(v.mixMode || 'water').trim();
      const cupOrMug = Boolean(v.cupOrMug);
      const scoop = Boolean(v.scoop);
      const spoon = Boolean(v.spoon);

      const parts: string[] = [];
      parts.push(`PRODUCT_PHYSICAL_TYPE: powder supplement.`);
      parts.push(`POWDER_DESCRIPTION: ${texture} texture powder${powderColor ? ` in ${powderColor} tone` : ''}.`);
      parts.push(`POWDER_PRESENTATION: powder ${presentation}.`);
      parts.push(`POWDER_MIX_CONTEXT: ${mixMode} preparation context.`);
      if (cupOrMug) parts.push(`POWDER_PROP: cup or mug as companion prop.`);
      if (scoop) parts.push(`POWDER_PROP: measuring scoop as prop.`);
      if (spoon) parts.push(`POWDER_PROP: spoon as prop.`);
      return parts.join(' ');
    }

    case 'skincare': {
      const subtype = String(v.subtype || 'serum').trim();
      const texture = String(v.texture || 'glossy').trim();
      const color = getColorDescription(v.color as any);
      const dispersion = String(v.dispersion || 'drop').trim();
      const towel = Boolean(v.towel);
      const sink = Boolean(v.sink);

      const parts: string[] = [];
      parts.push(`PRODUCT_PHYSICAL_TYPE: ${subtype} skincare.`);
      if (color) parts.push(`SKINCARE_MATERIAL: ${texture} texture in ${color} tone.`);
      const dispersionDesc =
        dispersion === 'drop' ? 'product drop visible on surface'
        : dispersion === 'smear' ? 'product smear texture visible'
        : 'product dollop on surface';
      parts.push(`SKINCARE_DISPERSION: ${dispersionDesc}.`);
      if (towel) parts.push(`SKINCARE_PROP: soft towel as prop.`);
      if (sink) parts.push(`SKINCARE_PROP: bathroom sink context.`);
      return parts.join(' ');
    }

    case 'device': {
      const material = String((v as any).material || '').trim();
      const color = getColorDescription((v as any).color as any);
      const scale = String((v as any).scale || 'medium').trim();
      // Device physical is already handled by buildMaterials via productMaterial/productColor/productFormScale
      // but we emit a unified block here for consistency
      const parts: string[] = [];
      parts.push(`PRODUCT_PHYSICAL_TYPE: device.`);
      if (material) parts.push(`DEVICE_MATERIAL: ${material} construction.`);
      if (color) parts.push(`DEVICE_COLOR: ${color}.`);
      if (scale) parts.push(`DEVICE_SCALE: ${scale} form factor.`);
      return parts.join(' ');
    }

    case 'custom': {
      const material = String((v as any).material || '').trim();
      const color = getColorDescription((v as any).color as any);
      const scale = String((v as any).scale || 'medium').trim();
      const parts: string[] = [];
      parts.push(`PRODUCT_PHYSICAL_TYPE: custom product.`);
      if (material) parts.push(`CUSTOM_MATERIAL: ${material} construction.`);
      if (color) parts.push(`CUSTOM_COLOR: ${color}.`);
      if (scale) parts.push(`CUSTOM_SCALE: ${scale} form factor.`);
      return parts.join(' ');
    }

    default:
      return '';
  }
}

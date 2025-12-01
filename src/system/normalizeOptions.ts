import { LABEL_MAP } from './labelMap';
import { TOOLTIP_MAP } from './tooltipMap';

export function normalizeOption<OptionType extends { label: string; value: string; tooltip?: string }>(option: OptionType): OptionType {
  const cleanLabel = LABEL_MAP[option.value] || LABEL_MAP[option.label] || option.label;
  const tooltip = option.tooltip ?? TOOLTIP_MAP[cleanLabel] ?? null;

  return {
    ...option,
    label: cleanLabel,
    tooltip: tooltip || undefined,
  };
}

export function normalizeOptions<OptionType extends { label: string; value: string; tooltip?: string }>(options: OptionType[]): OptionType[] {
  return options.map(o => normalizeOption(o));
}

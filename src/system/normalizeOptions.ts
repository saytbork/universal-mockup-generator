import { LABEL_MAP } from './labelMap';
import { TOOLTIP_MAP } from './tooltipMap';

export function normalizeOption<OptionType extends { label: string; value: string; tooltip?: string }>(option: OptionType): OptionType {
  const cleanLabel = LABEL_MAP[option.value] || LABEL_MAP[option.label] || option.label;
  const findTooltip = (): string | undefined => {
    const entry = TOOLTIP_MAP[cleanLabel];
    if (typeof entry === 'string') return entry;
    if (entry) {
      return entry[option.label] ?? entry[option.value];
    }
    for (const value of Object.values(TOOLTIP_MAP)) {
      if (typeof value === 'object') {
        const nested = value[option.label] ?? value[option.value];
        if (nested) {
          return nested;
        }
      }
    }
    return undefined;
  };

  const tooltip = option.tooltip ?? findTooltip() ?? undefined;

  return {
    ...option,
    label: cleanLabel,
    tooltip: tooltip || undefined,
  };
}

export function normalizeOptions<OptionType extends { label: string; value: string; tooltip?: string }>(options: OptionType[]): OptionType[] {
  return options.map(o => normalizeOption(o));
}

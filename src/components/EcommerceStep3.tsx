import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Chip } from './ui/Chip';
import type {
  BadgeBlock,
  BulletsBlock,
  EcommerceOverlaySpec,
  EcommerceSlotKey,
  EcommerceSlotsConfig,
  HeadlineBlock,
  OverlayBlock,
  StepsBlock,
  TestimonialBlock,
} from '@/lib/ecommerceOverlay/types';
import {
  ECOMMERCE_SLOT_KEYS,
  ECOMMERCE_SLOT_LABELS,
  ECOMMERCE_SLOT_REQUIRED_BLANK_SPACE,
} from '@/lib/ecommerceOverlay/templates';
import { EcommerceOverlaySvg } from '@/lib/ecommerceOverlay/EcommerceOverlaySvg';
import { exportSvgElementToPng, downloadUrlAsFile } from '@/lib/ecommerceOverlay/export';
import { AlertTriangle, Download, Image as ImageIcon } from 'lucide-react';

export interface EcommerceGenerationSettings {
  reserveBlankSpace: boolean;
  blankSpaceDirection: 'left' | 'center' | 'right';
  viewFraming: 'centered' | 'left-negative-space' | 'right-negative-space';
}

export interface EcommerceStep3Props {
  selectedSlots: EcommerceSlotKey[];
  onSelectedSlotsChange: (next: EcommerceSlotKey[]) => void;
  slotsConfig: EcommerceSlotsConfig;
  onSlotsConfigChange: (next: EcommerceSlotsConfig) => void;
  slotBaseImages: Partial<Record<EcommerceSlotKey, string | null>>;
  settings: EcommerceGenerationSettings;
  onSettingsChange: (next: EcommerceGenerationSettings) => void;
  embedded?: boolean;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const clampHex = (value: string, fallback: string) => (/^#[0-9a-f]{6}$/i.test(value) ? value : fallback);

function toggleInList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter(item => item !== value) : [...list, value];
}

function updateSlotSpec(
  slotsConfig: EcommerceSlotsConfig,
  slotKey: EcommerceSlotKey,
  updater: (prev: EcommerceOverlaySpec) => EcommerceOverlaySpec
): EcommerceSlotsConfig {
  return { ...slotsConfig, [slotKey]: updater(slotsConfig[slotKey]) };
}

function updateBlock<T extends OverlayBlock>(
  spec: EcommerceOverlaySpec,
  blockIndex: number,
  updater: (prev: T) => T
): EcommerceOverlaySpec {
  const nextBlocks = spec.blocks.map((block, idx) => {
    if (idx !== blockIndex) return block;
    return updater(block as T);
  });
  return { ...spec, blocks: nextBlocks };
}

export default function EcommerceStep3({
  selectedSlots,
  onSelectedSlotsChange,
  slotsConfig,
  onSlotsConfigChange,
  slotBaseImages,
  settings,
  onSettingsChange,
  embedded = false,
}: EcommerceStep3Props) {
  const [activeSlot, setActiveSlot] = useState<EcommerceSlotKey | null>(selectedSlots[0] ?? null);
  const [expandedBlockIndex, setExpandedBlockIndex] = useState<number | null>(0);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (activeSlot && selectedSlots.includes(activeSlot)) return;
    setActiveSlot(selectedSlots[0] ?? null);
  }, [activeSlot, selectedSlots]);

  const activeSpec = activeSlot ? slotsConfig[activeSlot] : null;
  const activeBaseImageUrl = activeSlot ? slotBaseImages[activeSlot] : null;

  const overlayWarning = useMemo(() => {
    if (!activeSlot || !activeSpec) return null;
    if (!activeSpec.blocks.length) return null;
    if (settings.reserveBlankSpace) return null;
    return 'Overlays work best with Reserve Blank Space enabled.';
  }, [activeSlot, activeSpec, settings.reserveBlankSpace]);

  const requiredDir = activeSlot ? ECOMMERCE_SLOT_REQUIRED_BLANK_SPACE[activeSlot] : null;

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="rounded-2xl border border-border bg-bg/30 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-accent">Ecommerce Image Builder</p>
          <p className="mt-1 text-sm text-textSecondary">Build PDP-style overlays and export crisp PNGs (image-only + with overlays).</p>
        </div>
      )}

      <section className="rounded-2xl border border-border bg-bg/40 p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-textSecondary">Slots</p>
        <div className="flex flex-wrap gap-2">
          {ECOMMERCE_SLOT_KEYS.map(slotKey => {
            const selected = selectedSlots.includes(slotKey);
            return (
              <Chip
                key={slotKey}
                selected={selected}
                onClick={() => {
                  const next = toggleInList(selectedSlots, slotKey);
                  onSelectedSlotsChange(next);
                  if (!selected) setActiveSlot(slotKey);
                }}
              >
                {ECOMMERCE_SLOT_LABELS[slotKey]}
              </Chip>
            );
          })}
        </div>
        {selectedSlots.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-textSecondary">Editing:</span>
            {selectedSlots.map(slotKey => (
              <Chip
                key={`active-${slotKey}`}
                selected={slotKey === activeSlot}
                tone="warm"
                onClick={() => setActiveSlot(slotKey)}
              >
                {slotKey}
              </Chip>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-bg/40 p-4 space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-textSecondary">Generation Overrides</p>
        <div className="flex flex-wrap items-center gap-2">
          <Chip selected={settings.reserveBlankSpace} onClick={() => onSettingsChange({ ...settings, reserveBlankSpace: true })}>
            Reserve Blank Space: On
          </Chip>
          <Chip selected={!settings.reserveBlankSpace} onClick={() => onSettingsChange({ ...settings, reserveBlankSpace: false })}>
            Reserve Blank Space: Off
          </Chip>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-textSecondary">Blank space:</span>
          {(['left', 'center', 'right'] as const).map(dir => (
            <Chip
              key={dir}
              selected={settings.blankSpaceDirection === dir}
              onClick={() => onSettingsChange({ ...settings, blankSpaceDirection: dir })}
            >
              {dir}
            </Chip>
          ))}
          {requiredDir && (
            <span className="text-xs text-textSecondary">
              (template suggests: <span className="text-textPrimary">{requiredDir}</span>)
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-textSecondary">View framing:</span>
          {(
            [
              { key: 'centered', label: 'Centered' },
              { key: 'left-negative-space', label: 'Left + negative space' },
              { key: 'right-negative-space', label: 'Right + negative space' },
            ] as const
          ).map(option => (
            <Chip
              key={option.key}
              selected={settings.viewFraming === option.key}
              onClick={() => onSettingsChange({ ...settings, viewFraming: option.key })}
            >
              {option.label}
            </Chip>
          ))}
        </div>
        {overlayWarning && (
          <div className="flex items-start gap-2 text-xs text-textMuted">
            <AlertTriangle size={14} />
            <span>{overlayWarning}</span>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-bg/40 p-4 space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-textSecondary">Live Preview</p>
        <div className="rounded-xl border border-border bg-bg/30 overflow-hidden">
          {activeSpec ? (
            <EcommerceOverlaySvg
              baseImageUrl={activeBaseImageUrl}
              spec={activeSpec}
              className="w-full h-auto block"
              ref={svgRef}
            />
          ) : (
            <div className="p-6 text-sm text-textSecondary">Select a slot to preview.</div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!activeSlot || !activeBaseImageUrl}
            onClick={async () => {
              if (!activeSlot || !activeBaseImageUrl) return;
              await downloadUrlAsFile(activeBaseImageUrl, `${activeSlot}-image-only.png`);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surfaceTint px-3 py-2 text-xs text-textPrimary hover:bg-surfaceTint disabled:opacity-40"
          >
            <ImageIcon size={14} />
            Export PNG (image only)
          </button>
          <button
            type="button"
            disabled={!activeSlot || !activeBaseImageUrl}
            onClick={async () => {
              if (!activeSlot || !activeBaseImageUrl) return;
              const svg = svgRef.current;
              if (!svg) return;
              await exportSvgElementToPng(svg, { filename: `${activeSlot}-with-overlays.png`, scale: 2 });
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-accent/15 px-3 py-2 text-xs text-white hover:bg-accent/25 disabled:opacity-40"
          >
            <Download size={14} />
            Export PNG (with overlays)
          </button>
        </div>
        {!activeBaseImageUrl && activeSlot && (
          <p className="text-xs text-textSecondary">
            Generate <span className="text-textPrimary">{activeSlot}</span> to enable export.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-bg/40 p-4 space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-textSecondary">Editor</p>
        {!activeSlot || !activeSpec ? (
          <p className="text-sm text-textSecondary">Select a slot to edit.</p>
        ) : (
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-textSecondary">Global Style</p>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[11px] text-textSecondary">Font</p>
                    <div className="flex flex-wrap gap-2">
                    {(
                      [
                        {
                          label: 'Inter',
                          value: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                        },
                        {
                          label: 'System',
                          value: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                        },
                        { label: 'Serif', value: 'ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif' },
                      ] as const
                    ).map(font => (
                      <Chip
                        key={font.label}
                        selected={activeSpec.globalStyle.fontFamily === font.value}
                        onClick={() =>
                          onSlotsConfigChange(
                            updateSlotSpec(slotsConfig, activeSlot, prev => ({
                              ...prev,
                              globalStyle: { ...prev.globalStyle, fontFamily: font.value },
                            }))
                          )
                        }
                      >
                        {font.label}
                      </Chip>
                      ))}
                    </div>
                  </div>
                  <LabeledInput
                  label="Text color"
                  value={activeSpec.globalStyle.textColor}
                  onChange={value => {
                    onSlotsConfigChange(
                      updateSlotSpec(slotsConfig, activeSlot, prev => ({
                        ...prev,
                        globalStyle: { ...prev.globalStyle, textColor: clampHex(value, prev.globalStyle.textColor) },
                      }))
                    );
                  }}
                  placeholder="#FFFFFF"
                />
                <LabeledInput
                  label="Accent color"
                  value={activeSpec.globalStyle.accentColor}
                  onChange={value => {
                    onSlotsConfigChange(
                      updateSlotSpec(slotsConfig, activeSlot, prev => ({
                        ...prev,
                        globalStyle: { ...prev.globalStyle, accentColor: clampHex(value, prev.globalStyle.accentColor) },
                      }))
                    );
                  }}
                    placeholder="#8B5CF6"
                  />
                  <LabeledNumber
                    label="Heading weight"
                    value={activeSpec.globalStyle.headingWeight}
                  onChange={value =>
                    onSlotsConfigChange(
                      updateSlotSpec(slotsConfig, activeSlot, prev => ({
                        ...prev,
                        globalStyle: { ...prev.globalStyle, headingWeight: Math.max(100, Math.min(900, value)) },
                      }))
                    )
                  }
                  min={100}
                    max={900}
                    step={50}
                  />
                  <LabeledNumber
                    label="Body weight"
                    value={activeSpec.globalStyle.bodyWeight}
                  onChange={value =>
                    onSlotsConfigChange(
                      updateSlotSpec(slotsConfig, activeSlot, prev => ({
                        ...prev,
                        globalStyle: { ...prev.globalStyle, bodyWeight: Math.max(100, Math.min(900, value)) },
                      }))
                    )
                  }
                  min={100}
                    max={900}
                    step={50}
                  />
                  <LabeledNumber
                    label="Radius"
                    value={activeSpec.globalStyle.radius}
                  onChange={value =>
                    onSlotsConfigChange(
                      updateSlotSpec(slotsConfig, activeSlot, prev => ({
                        ...prev,
                        globalStyle: { ...prev.globalStyle, radius: Math.max(0, value) },
                      }))
                    )
                  }
                  min={0}
                    max={40}
                    step={1}
                  />
                  <LabeledNumber
                    label="Base scale"
                    value={activeSpec.globalStyle.baseScale}
                  onChange={value =>
                    onSlotsConfigChange(
                      updateSlotSpec(slotsConfig, activeSlot, prev => ({
                        ...prev,
                        globalStyle: { ...prev.globalStyle, baseScale: Math.max(0.6, Math.min(2, value)) },
                      }))
                    )
                  }
                  min={0.6}
                    max={2}
                    step={0.05}
                  />
                </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-textSecondary">Card background:</span>
                {(['glass', 'solid', 'none'] as const).map(mode => (
                  <Chip
                    key={mode}
                    selected={activeSpec.globalStyle.cardBgStyle === mode}
                    onClick={() =>
                      onSlotsConfigChange(
                        updateSlotSpec(slotsConfig, activeSlot, prev => ({
                          ...prev,
                          globalStyle: { ...prev.globalStyle, cardBgStyle: mode },
                        }))
                      )
                    }
                  >
                    {mode}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-textSecondary">Blocks</p>
              <div className="space-y-2">
                {activeSpec.blocks.map((block, idx) => {
                  const isOpen = expandedBlockIndex === idx;
                  return (
                    <div key={`${block.type}-${idx}`} className="rounded-xl border border-border bg-bg/25 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedBlockIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left"
                      >
                        <div className="text-sm text-textPrimary">
                          <span className="text-textSecondary">{idx + 1}.</span> {block.type}
                        </div>
                        <span className="text-xs text-textMuted">{isOpen ? 'Collapse' : 'Expand'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 space-y-3">
                          <BlockPositionEditor
                            block={block}
                            onChange={nextBlock => {
                              onSlotsConfigChange(
                                updateSlotSpec(slotsConfig, activeSlot, prev => ({
                                  ...updateBlock(prev, idx, () => nextBlock as any),
                                }))
                              );
                            }}
                          />
                          <BlockEditor
                            block={block}
                            onChange={nextBlock => {
                              onSlotsConfigChange(
                                updateSlotSpec(slotsConfig, activeSlot, prev => updateBlock(prev, idx, () => nextBlock as any))
                              );
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function BlockPositionEditor({
  block,
  onChange,
}: {
  block: OverlayBlock;
  onChange: (next: OverlayBlock) => void;
}) {
  const width = (block as any).width ?? 0.5;
  return (
    <div className="space-y-2">
      <LabeledNumber
        label="X (%)"
        value={Math.round(clamp01(block.position.x) * 100)}
        onChange={value => onChange({ ...block, position: { ...block.position, x: clamp01(value / 100) } } as any)}
        min={0}
        max={100}
        step={1}
      />
      <LabeledNumber
        label="Y (%)"
        value={Math.round(clamp01(block.position.y) * 100)}
        onChange={value => onChange({ ...block, position: { ...block.position, y: clamp01(value / 100) } } as any)}
        min={0}
        max={100}
        step={1}
      />
      <LabeledNumber
        label="W (%)"
        value={Math.round(clamp01(width) * 100)}
        onChange={value => onChange({ ...(block as any), width: clamp01(value / 100) })}
        min={10}
        max={95}
        step={1}
      />
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
}: {
  block: OverlayBlock;
  onChange: (next: OverlayBlock) => void;
}) {
  if (block.type === 'headline') return <HeadlineEditor block={block} onChange={onChange as any} />;
  if (block.type === 'bullets') return <BulletsEditor block={block} onChange={onChange as any} />;
  if (block.type === 'steps') return <StepsEditor block={block} onChange={onChange as any} />;
  if (block.type === 'testimonials') return <TestimonialsEditor block={block} onChange={onChange as any} />;
  if (block.type === 'badge') return <BadgeEditor block={block} onChange={onChange as any} />;
  return null;
}

function HeadlineEditor({ block, onChange }: { block: HeadlineBlock; onChange: (next: HeadlineBlock) => void }) {
  return (
    <div className="space-y-3">
      <LabeledInput label="Headline" value={block.text} onChange={value => onChange({ ...block, text: value })} />
      <LabeledInput
        label="Subheadline"
        value={block.subheadline ?? ''}
        onChange={value => onChange({ ...block, subheadline: value || undefined })}
        placeholder="Optional"
      />
      <div className="grid grid-cols-2 gap-2">
        <LabeledNumber
          label="Headline size"
          value={block.fontSize}
          onChange={value => onChange({ ...block, fontSize: value })}
          min={16}
          max={96}
          step={1}
        />
        <LabeledNumber
          label="Sub size"
          value={block.subFontSize ?? 24}
          onChange={value => onChange({ ...block, subFontSize: value })}
          min={10}
          max={48}
          step={1}
        />
      </div>
      <AlignChips value={block.align} onChange={align => onChange({ ...block, align })} />
      <StyleToggles
        bgOn={block.bgOn}
        borderOn={block.borderOn}
        shadowOn={block.shadowOn}
        padding={block.padding}
        onChange={next => onChange({ ...block, ...next })}
      />
    </div>
  );
}

function BulletsEditor({ block, onChange }: { block: BulletsBlock; onChange: (next: BulletsBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <LabeledNumber
          label="Font size"
          value={block.fontSize}
          onChange={value => onChange({ ...block, fontSize: value })}
          min={12}
          max={40}
          step={1}
        />
        <LabeledNumber
          label="Icon size"
          value={block.iconSize}
          onChange={value => onChange({ ...block, iconSize: value })}
          min={12}
          max={40}
          step={1}
        />
      </div>
      <LabeledNumber
        label="Gap"
        value={block.gap}
        onChange={value => onChange({ ...block, gap: value })}
        min={6}
        max={28}
        step={1}
      />
      <AlignChips value={block.align} onChange={align => onChange({ ...block, align })} />
      <StyleToggles
        bgOn={block.bgOn}
        borderOn={block.borderOn}
        shadowOn={block.shadowOn}
        padding={block.padding}
        onChange={next => onChange({ ...block, ...next })}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.35em] text-textSecondary">Items</p>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...block,
                items: [...block.items, { iconName: 'Check', text: 'New bullet' }],
              })
            }
            className="text-xs text-accent hover:text-accent"
          >
            + Add
          </button>
        </div>
        {block.items.map((item, idx) => (
          <div key={idx} className="space-y-2">
            <LabeledInput
              label={idx === 0 ? 'Icon' : undefined}
              value={item.iconName}
              onChange={value => {
                const next = block.items.slice();
                next[idx] = { ...item, iconName: value };
                onChange({ ...block, items: next });
              }}
            />
            <LabeledInput
              label={idx === 0 ? 'Text' : undefined}
              value={item.text}
              onChange={value => {
                const next = block.items.slice();
                next[idx] = { ...item, text: value };
                onChange({ ...block, items: next });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function StepsEditor({ block, onChange }: { block: StepsBlock; onChange: (next: StepsBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-textSecondary">Layout:</span>
        {(['col', 'row'] as const).map(layout => (
          <Chip key={layout} selected={block.layout === layout} onClick={() => onChange({ ...block, layout })}>
            {layout}
          </Chip>
        ))}
      </div>
      <div className="space-y-2">
        <LabeledNumber
          label="Heading size"
          value={block.headingSize}
          onChange={value => onChange({ ...block, headingSize: value })}
          min={12}
          max={36}
          step={1}
        />
        <LabeledNumber
          label="Body size"
          value={block.bodySize}
          onChange={value => onChange({ ...block, bodySize: value })}
          min={10}
          max={28}
          step={1}
        />
      </div>
      <div className="space-y-2">
        <LabeledNumber
          label="Icon size"
          value={block.iconSize}
          onChange={value => onChange({ ...block, iconSize: value })}
          min={12}
          max={40}
          step={1}
        />
        <LabeledNumber label="Gap" value={block.gap} onChange={value => onChange({ ...block, gap: value })} min={6} max={30} step={1} />
      </div>
      <StyleToggles
        bgOn={block.bgOn}
        borderOn={block.borderOn}
        shadowOn={block.shadowOn}
        padding={block.padding}
        onChange={next => onChange({ ...block, ...next })}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.35em] text-textSecondary">Steps</p>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...block,
                steps: [...block.steps, { iconName: 'Check', title: `Step ${block.steps.length + 1}`, body: 'Describe the step.' }],
              })
            }
            className="text-xs text-accent hover:text-accent"
          >
            + Add
          </button>
        </div>
        {block.steps.map((step, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-bg/20 p-2 space-y-2">
            <div className="space-y-2">
              <LabeledInput
                label={idx === 0 ? 'Icon' : undefined}
                value={step.iconName}
                onChange={value => {
                  const next = block.steps.slice();
                  next[idx] = { ...step, iconName: value };
                  onChange({ ...block, steps: next });
                }}
              />
              <LabeledInput
                label={idx === 0 ? 'Title' : undefined}
                value={step.title}
                onChange={value => {
                  const next = block.steps.slice();
                  next[idx] = { ...step, title: value };
                  onChange({ ...block, steps: next });
                }}
              />
            </div>
            <LabeledInput
              label="Body"
              value={step.body}
              onChange={value => {
                const next = block.steps.slice();
                next[idx] = { ...step, body: value };
                onChange({ ...block, steps: next });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialsEditor({ block, onChange }: { block: TestimonialBlock; onChange: (next: TestimonialBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Chip selected={block.showAvatar} onClick={() => onChange({ ...block, showAvatar: true })}>
          Avatar: On
        </Chip>
        <Chip selected={!block.showAvatar} onClick={() => onChange({ ...block, showAvatar: false })}>
          Avatar: Off
        </Chip>
      </div>
      <div className="space-y-2">
        <LabeledNumber
          label="Quote size"
          value={block.quoteSize}
          onChange={value => onChange({ ...block, quoteSize: value })}
          min={12}
          max={26}
          step={1}
        />
        <LabeledNumber
          label="Name size"
          value={block.nameSize}
          onChange={value => onChange({ ...block, nameSize: value })}
          min={10}
          max={22}
          step={1}
        />
      </div>
      <div className="space-y-2">
        <LabeledNumber label="Stars" value={block.stars} onChange={value => onChange({ ...block, stars: value as any })} min={1} max={5} step={1} />
        <LabeledNumber label="Gap" value={block.gap} onChange={value => onChange({ ...block, gap: value })} min={8} max={28} step={1} />
      </div>
      <StyleToggles
        bgOn={block.bgOn}
        borderOn={block.borderOn}
        shadowOn={block.shadowOn}
        padding={block.padding}
        onChange={next => onChange({ ...block, ...next })}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.35em] text-textSecondary">Cards</p>
          <button
            type="button"
            onClick={() => onChange({ ...block, cards: [...block.cards, { quote: '“New quote”', name: 'Name' }] })}
            className="text-xs text-accent hover:text-accent"
          >
            + Add
          </button>
        </div>
        {block.cards.map((card, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-bg/20 p-2 space-y-2">
            <LabeledInput
              label="Quote"
              value={card.quote}
              onChange={value => {
                const next = block.cards.slice();
                next[idx] = { ...card, quote: value };
                onChange({ ...block, cards: next });
              }}
            />
            <LabeledInput
              label="Name"
              value={card.name}
              onChange={value => {
                const next = block.cards.slice();
                next[idx] = { ...card, name: value };
                onChange({ ...block, cards: next });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function BadgeEditor({ block, onChange }: { block: BadgeBlock; onChange: (next: BadgeBlock) => void }) {
  return (
    <div className="space-y-3">
      <LabeledInput label="Text" value={block.text} onChange={value => onChange({ ...block, text: value })} />
      <LabeledInput label="Color" value={block.color} onChange={value => onChange({ ...block, color: value })} placeholder="#8B5CF6" />
      <LabeledNumber label="Size" value={block.size} onChange={value => onChange({ ...block, size: value })} min={10} max={40} step={1} />
      <div className="space-y-1">
        <p className="text-[11px] text-textSecondary">Style</p>
        <div className="flex flex-wrap gap-2">
          {(['pill', 'seal', 'tag'] as const).map(kind => (
            <Chip key={kind} selected={block.badgeStyle === kind} onClick={() => onChange({ ...block, badgeStyle: kind })}>
              {kind}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlignChips({ value, onChange }: { value: 'left' | 'center' | 'right'; onChange: (next: 'left' | 'center' | 'right') => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-textSecondary">Align:</span>
      {(['left', 'center', 'right'] as const).map(align => (
        <Chip key={align} selected={value === align} onClick={() => onChange(align)}>
          {align}
        </Chip>
      ))}
    </div>
  );
}

function StyleToggles({
  bgOn,
  borderOn,
  shadowOn,
  padding,
  onChange,
}: {
  bgOn: boolean;
  borderOn: boolean;
  shadowOn: boolean;
  padding: number;
  onChange: (next: { bgOn: boolean; borderOn: boolean; shadowOn: boolean; padding: number }) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Chip selected={bgOn} onClick={() => onChange({ bgOn: true, borderOn, shadowOn, padding })}>
          Background: On
        </Chip>
        <Chip selected={!bgOn} onClick={() => onChange({ bgOn: false, borderOn, shadowOn, padding })}>
          Background: Off
        </Chip>
        <Chip selected={borderOn} onClick={() => onChange({ bgOn, borderOn: true, shadowOn, padding })}>
          Border: On
        </Chip>
        <Chip selected={!borderOn} onClick={() => onChange({ bgOn, borderOn: false, shadowOn, padding })}>
          Border: Off
        </Chip>
        <Chip selected={shadowOn} onClick={() => onChange({ bgOn, borderOn, shadowOn: true, padding })}>
          Shadow: On
        </Chip>
        <Chip selected={!shadowOn} onClick={() => onChange({ bgOn, borderOn, shadowOn: false, padding })}>
          Shadow: Off
        </Chip>
      </div>
      <LabeledNumber label="Padding" value={padding} onChange={value => onChange({ bgOn, borderOn, shadowOn, padding: value })} min={0} max={40} step={1} />
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1 block">
      {label && <p className="text-[11px] text-textSecondary">{label}</p>}
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-bg/30 px-3 py-2 text-sm text-white placeholder:text-textMuted focus:border-accent focus:outline-none"
      />
    </label>
  );
}

function LabeledNumber({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className="space-y-1 block">
      <p className="text-[11px] text-textSecondary">{label}</p>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-border bg-bg/30 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
      />
    </label>
  );
}

import React, { useMemo } from 'react';
import type {
  BadgeBlock,
  BulletsBlock,
  EcommerceOverlaySpec,
  HeadlineBlock,
  StepsBlock,
  TestimonialBlock,
} from './types';
import { getLucideIconByName } from './lucideIconMap';

export interface EcommerceOverlaySvgProps {
  baseImageUrl?: string | null;
  spec: EcommerceOverlaySpec;
  width?: number;
  height?: number;
  safeMargin?: number;
  className?: string;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const clampHex = (value: string, fallback: string) => (/^#[0-9a-f]{6}$/i.test(value) ? value : fallback);

const estimateCharWidth = (fontSize: number) => fontSize * 0.56;

const wrapText = (text: string, maxWidthPx: number, fontSize: number) => {
  const normalized = String(text || '').trim();
  if (!normalized) return [];
  const approxChars = Math.max(8, Math.floor(maxWidthPx / estimateCharWidth(fontSize)));
  const words = normalized.split(/\s+/g);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= approxChars) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
  }
  if (current) lines.push(current);
  return lines;
};

const glassFill = 'rgba(0,0,0,0.45)';
const glassStroke = 'rgba(255,255,255,0.14)';
const solidFill = 'rgba(0,0,0,0.72)';

function getCardFill(style: EcommerceOverlaySpec['globalStyle']) {
  if (style.cardBgStyle === 'none') return 'transparent';
  if (style.cardBgStyle === 'solid') return solidFill;
  return glassFill;
}

function getCardStroke(style: EcommerceOverlaySpec['globalStyle']) {
  if (style.cardBgStyle === 'none') return 'transparent';
  return glassStroke;
}

function cardShadowFilterId(shadowOn: boolean) {
  return shadowOn ? 'ecomShadow' : undefined;
}

export const EcommerceOverlaySvg = React.forwardRef<SVGSVGElement, EcommerceOverlaySvgProps>(function EcommerceOverlaySvg(
  {
    baseImageUrl,
    spec,
    width = 1024,
    height = 1024,
    safeMargin = 28,
    className,
  }: EcommerceOverlaySvgProps,
  ref
) {
  const style = spec.globalStyle;
  const textColor = clampHex(style.textColor, '#FFFFFF');
  const accentColor = clampHex(style.accentColor, '#8B5CF6');
  const radius = Math.max(0, style.radius);
  const scale = Math.max(0.5, Math.min(2.5, style.baseScale || 1));

  const blocks = useMemo(() => spec.blocks ?? [], [spec.blocks]);

  return (
    <svg
      ref={ref}
      className={className}
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ecommerce overlay preview"
    >
      <defs>
        <linearGradient id="ecomPlaceholderBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#111827" />
          <stop offset="100%" stopColor="#0b1020" />
        </linearGradient>
        <filter id="ecomShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="rgba(0,0,0,0.55)" />
        </filter>
      </defs>

      {baseImageUrl ? (
        <image href={baseImageUrl} x={0} y={0} width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      ) : (
        <>
          <rect x={0} y={0} width={width} height={height} fill="url(#ecomPlaceholderBg)" />
          <g opacity={0.9}>
            <text
              x={width / 2}
              y={height / 2 - 10}
              textAnchor="middle"
              fill="rgba(255,255,255,0.7)"
              fontFamily={style.fontFamily}
              fontWeight={700}
              fontSize={22}
            >
              No base image yet
            </text>
            <text
              x={width / 2}
              y={height / 2 + 22}
              textAnchor="middle"
              fill="rgba(255,255,255,0.45)"
              fontFamily={style.fontFamily}
              fontWeight={500}
              fontSize={14}
            >
              Generate a slot to preview overlays
            </text>
          </g>
        </>
      )}

      {blocks.map((block, idx) => {
        const posX = safeMargin + clamp01(block.position.x) * (width - safeMargin * 2);
        const posY = safeMargin + clamp01(block.position.y) * (height - safeMargin * 2);
        const maxWidth = Math.max(120, clamp01((block as any).width ?? 0.5) * (width - safeMargin * 2));

        if (block.type === 'headline') {
          return (
            <HeadlineSvg
              key={`${block.type}-${idx}`}
              block={block}
              style={style}
              textColor={textColor}
              accentColor={accentColor}
              x={posX}
              y={posY}
              maxWidth={maxWidth}
              radius={radius}
              scale={scale}
            />
          );
        }
        if (block.type === 'bullets') {
          return (
            <BulletsSvg
              key={`${block.type}-${idx}`}
              block={block}
              style={style}
              textColor={textColor}
              accentColor={accentColor}
              x={posX}
              y={posY}
              maxWidth={maxWidth}
              radius={radius}
              scale={scale}
            />
          );
        }
        if (block.type === 'steps') {
          return (
            <StepsSvg
              key={`${block.type}-${idx}`}
              block={block}
              style={style}
              textColor={textColor}
              accentColor={accentColor}
              x={posX}
              y={posY}
              maxWidth={maxWidth}
              radius={radius}
              scale={scale}
            />
          );
        }
        if (block.type === 'testimonials') {
          return (
            <TestimonialsSvg
              key={`${block.type}-${idx}`}
              block={block}
              style={style}
              textColor={textColor}
              accentColor={accentColor}
              x={posX}
              y={posY}
              maxWidth={maxWidth}
              radius={radius}
              scale={scale}
            />
          );
        }
        if (block.type === 'badge') {
          return (
            <BadgeSvg
              key={`${block.type}-${idx}`}
              block={block}
              style={style}
              textColor={textColor}
              x={posX}
              y={posY}
              radius={radius}
              scale={scale}
            />
          );
        }
        return null;
      })}
    </svg>
  );
});

EcommerceOverlaySvg.displayName = 'EcommerceOverlaySvg';

function HeadlineSvg({
  block,
  style,
  textColor,
  accentColor,
  x,
  y,
  maxWidth,
  radius,
  scale,
}: {
  block: HeadlineBlock;
  style: EcommerceOverlaySpec['globalStyle'];
  textColor: string;
  accentColor: string;
  x: number;
  y: number;
  maxWidth: number;
  radius: number;
  scale: number;
}) {
  const fontSize = Math.max(14, block.fontSize * scale);
  const subSize = Math.max(12, (block.subFontSize ?? Math.max(14, fontSize * 0.45)) * scale);
  const pad = Math.max(0, block.padding * scale);
  const align: Record<string, 'start' | 'middle' | 'end'> = { left: 'start', center: 'middle', right: 'end' };
  const anchor = align[block.align] ?? 'start';
  const textX = block.align === 'center' ? x + maxWidth / 2 : block.align === 'right' ? x + maxWidth : x;

  const headlineLines = wrapText(block.text, maxWidth - pad * 2, fontSize);
  const subLines = wrapText(block.subheadline ?? '', maxWidth - pad * 2, subSize);
  const lineHeight = fontSize * 1.12;
  const subLineHeight = subSize * 1.32;
  const height = pad * 2 + headlineLines.length * lineHeight + (subLines.length ? 10 * scale + subLines.length * subLineHeight : 0);

  const bgOn = block.bgOn || style.cardBgStyle !== 'none';
  const fill = bgOn ? getCardFill(style) : 'transparent';
  const stroke = block.borderOn ? getCardStroke(style) : 'transparent';

  return (
    <g filter={cardShadowFilterId(block.shadowOn)}>
      {bgOn && (
        <rect x={x} y={y} width={maxWidth} height={height} rx={radius} fill={fill} stroke={stroke} strokeWidth={1} />
      )}
      <text
        x={textX}
        y={y + pad + fontSize}
        fill={textColor}
        fontFamily={style.fontFamily}
        fontWeight={style.headingWeight}
        fontSize={fontSize}
        textAnchor={anchor}
      >
        {headlineLines.map((line, i) => (
          <tspan key={i} x={textX} dy={i === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
      {subLines.length > 0 && (
        <text
          x={textX}
          y={y + pad + fontSize + headlineLines.length * lineHeight + 10 * scale + subSize}
          fill="rgba(255,255,255,0.78)"
          fontFamily={style.fontFamily}
          fontWeight={style.bodyWeight}
          fontSize={subSize}
          textAnchor={anchor}
        >
          {subLines.map((line, i) => (
            <tspan key={i} x={textX} dy={i === 0 ? 0 : subLineHeight}>
              {line}
            </tspan>
          ))}
        </text>
      )}
      <rect x={x} y={y + height - 2} width={Math.min(maxWidth * 0.32, 160)} height={4} rx={2} fill={accentColor} />
    </g>
  );
}

function BulletsSvg({
  block,
  style,
  textColor,
  accentColor,
  x,
  y,
  maxWidth,
  radius,
  scale,
}: {
  block: BulletsBlock;
  style: EcommerceOverlaySpec['globalStyle'];
  textColor: string;
  accentColor: string;
  x: number;
  y: number;
  maxWidth: number;
  radius: number;
  scale: number;
}) {
  const fontSize = Math.max(12, block.fontSize * scale);
  const iconSize = Math.max(12, block.iconSize * scale);
  const gap = Math.max(6, block.gap * scale);
  const pad = Math.max(0, block.padding * scale);
  const itemSpacing = Math.max(10, gap);

  const align: Record<string, 'start' | 'middle' | 'end'> = { left: 'start', center: 'middle', right: 'end' };
  const anchor = align[block.align] ?? 'start';

  const iconXBase = x + pad;
  const textXBase = x + pad + iconSize + 10 * scale;
  const availableTextWidth = Math.max(60, maxWidth - pad * 2 - iconSize - 10 * scale);

  const wrappedItems = block.items.map(item => ({
    iconName: item.iconName,
    lines: wrapText(item.text, availableTextWidth, fontSize),
  }));

  const lineHeight = fontSize * 1.34;
  const itemHeights = wrappedItems.map(item => Math.max(iconSize, item.lines.length * lineHeight));
  const height =
    pad * 2 +
    itemHeights.reduce((sum, h) => sum + h, 0) +
    Math.max(0, wrappedItems.length - 1) * itemSpacing;

  const bgOn = block.bgOn || style.cardBgStyle !== 'none';
  const fill = bgOn ? getCardFill(style) : 'transparent';
  const stroke = block.borderOn ? getCardStroke(style) : 'transparent';

  return (
    <g filter={cardShadowFilterId(block.shadowOn)}>
      {bgOn && (
        <rect x={x} y={y} width={maxWidth} height={height} rx={radius} fill={fill} stroke={stroke} strokeWidth={1} />
      )}
      <rect x={x} y={y} width={4} height={height} rx={2} fill={accentColor} opacity={0.9} />
      {wrappedItems.reduce<React.ReactNode[]>((acc, item, idx) => {
        const priorHeight = itemHeights.slice(0, idx).reduce((sum, h) => sum + h, 0);
        const yOffset = y + pad + priorHeight + idx * itemSpacing;
        const Icon = getLucideIconByName(item.iconName);
        acc.push(
          <g key={`bullet-${idx}`}>
            <Icon
              x={iconXBase}
              y={yOffset + Math.max(0, (itemHeights[idx] - iconSize) / 2)}
              width={iconSize}
              height={iconSize}
              color={accentColor}
              strokeWidth={2.2}
            />
            <text
              x={block.align === 'center' ? x + maxWidth / 2 : block.align === 'right' ? x + maxWidth - pad : textXBase}
              y={yOffset + fontSize}
              fill={textColor}
              fontFamily={style.fontFamily}
              fontWeight={style.bodyWeight}
              fontSize={fontSize}
              textAnchor={anchor}
            >
              {item.lines.map((line, lineIdx) => (
                <tspan
                  key={lineIdx}
                  x={
                    block.align === 'center'
                      ? x + maxWidth / 2
                      : block.align === 'right'
                        ? x + maxWidth - pad
                        : textXBase
                  }
                  dy={lineIdx === 0 ? 0 : lineHeight}
                >
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
        return acc;
      }, [])}
    </g>
  );
}

function StepsSvg({
  block,
  style,
  textColor,
  accentColor,
  x,
  y,
  maxWidth,
  radius,
  scale,
}: {
  block: StepsBlock;
  style: EcommerceOverlaySpec['globalStyle'];
  textColor: string;
  accentColor: string;
  x: number;
  y: number;
  maxWidth: number;
  radius: number;
  scale: number;
}) {
  const pad = Math.max(0, block.padding * scale);
  const gap = Math.max(8, block.gap * scale);
  const headingSize = Math.max(12, block.headingSize * scale);
  const bodySize = Math.max(10, block.bodySize * scale);
  const iconSize = Math.max(12, block.iconSize * scale);

  const cardWidth = block.layout === 'row' ? (maxWidth - gap * 2) / 3 : maxWidth;
  const bodyLineHeight = bodySize * 1.34;

  const estimatedCardHeights = block.steps.map(step => {
    const bodyLines = wrapText(step.body, cardWidth - pad * 2, bodySize);
    const bodyHeight = bodyLines.length * bodyLineHeight;
    const titleHeight = headingSize * 1.1;
    const top = Math.max(iconSize, 28 * scale) + 12 * scale;
    return pad * 2 + top + titleHeight + 8 * scale + bodyHeight;
  });

  const height =
    block.layout === 'row'
      ? Math.max(...estimatedCardHeights)
      : estimatedCardHeights.reduce((sum, h) => sum + h, 0) + Math.max(0, block.steps.length - 1) * gap;

  const bgOn = block.bgOn || style.cardBgStyle !== 'none';
  const fill = bgOn ? getCardFill(style) : 'transparent';
  const stroke = block.borderOn ? getCardStroke(style) : 'transparent';

  return (
    <g filter={cardShadowFilterId(block.shadowOn)}>
      {bgOn && (
        <rect x={x} y={y} width={maxWidth} height={height} rx={radius} fill={fill} stroke={stroke} strokeWidth={1} />
      )}
      {block.steps.map((step, idx) => {
        const cardX = block.layout === 'row' ? x + idx * (cardWidth + gap) : x;
        const cardY =
          block.layout === 'row'
            ? y
            : y + estimatedCardHeights.slice(0, idx).reduce((sum, h) => sum + h, 0) + idx * gap;
        const cardH = estimatedCardHeights[idx];
        const Icon = getLucideIconByName(step.iconName);
        const numberSize = Math.max(14, 18 * scale);
        const numberCircle = Math.max(22, 26 * scale);
        const numberCx = cardX + pad + numberCircle / 2;
        const numberCy = cardY + pad + numberCircle / 2;
        return (
          <g key={`step-${idx}`}>
            <rect
              x={cardX}
              y={cardY}
              width={cardWidth}
              height={cardH}
              rx={Math.max(10, radius * 0.85)}
              fill="rgba(0,0,0,0.18)"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={1}
            />
            <circle cx={numberCx} cy={numberCy} r={numberCircle / 2} fill={accentColor} opacity={0.95} />
            <text
              x={numberCx}
              y={numberCy + numberSize * 0.36}
              textAnchor="middle"
              fill="#0b1020"
              fontFamily={style.fontFamily}
              fontWeight={900}
              fontSize={numberSize}
            >
              {idx + 1}
            </text>
            <Icon
              x={cardX + pad + numberCircle + 10 * scale}
              y={cardY + pad + Math.max(0, (numberCircle - iconSize) / 2)}
              width={iconSize}
              height={iconSize}
              color={textColor}
              strokeWidth={2.1}
              opacity={0.95}
            />
            <text
              x={cardX + pad}
              y={cardY + pad + numberCircle + 16 * scale + headingSize}
              fill={textColor}
              fontFamily={style.fontFamily}
              fontWeight={style.headingWeight}
              fontSize={headingSize}
            >
              {step.title}
            </text>
            <text
              x={cardX + pad}
              y={cardY + pad + numberCircle + 16 * scale + headingSize + 10 * scale + bodySize}
              fill="rgba(255,255,255,0.78)"
              fontFamily={style.fontFamily}
              fontWeight={style.bodyWeight}
              fontSize={bodySize}
            >
              {wrapText(step.body, cardWidth - pad * 2, bodySize).map((line, lineIdx) => (
                <tspan key={lineIdx} x={cardX + pad} dy={lineIdx === 0 ? 0 : bodyLineHeight}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function TestimonialsSvg({
  block,
  style,
  textColor,
  accentColor,
  x,
  y,
  maxWidth,
  radius,
  scale,
}: {
  block: TestimonialBlock;
  style: EcommerceOverlaySpec['globalStyle'];
  textColor: string;
  accentColor: string;
  x: number;
  y: number;
  maxWidth: number;
  radius: number;
  scale: number;
}) {
  const pad = Math.max(0, block.padding * scale);
  const gap = Math.max(10, block.gap * scale);
  const quoteSize = Math.max(12, block.quoteSize * scale);
  const nameSize = Math.max(11, block.nameSize * scale);
  const avatar = block.showAvatar ? Math.max(26, 34 * scale) : 0;
  const innerPad = Math.max(12, 14 * scale);

  const quoteLineHeight = quoteSize * 1.34;
  const cardHeights = block.cards.map(card => {
    const quoteLines = wrapText(card.quote, maxWidth - pad * 2 - innerPad * 2 - avatar, quoteSize);
    const quoteHeight = quoteLines.length * quoteLineHeight;
    const starsHeight = 18 * scale;
    const nameHeight = nameSize * 1.1;
    return innerPad * 2 + starsHeight + 10 * scale + quoteHeight + 12 * scale + nameHeight;
  });
  const height = pad * 2 + cardHeights.reduce((sum, h) => sum + h, 0) + Math.max(0, block.cards.length - 1) * gap;

  const bgOn = block.bgOn || style.cardBgStyle !== 'none';
  const fill = bgOn ? getCardFill(style) : 'transparent';
  const stroke = block.borderOn ? getCardStroke(style) : 'transparent';

  return (
    <g filter={cardShadowFilterId(block.shadowOn)}>
      {bgOn && (
        <rect x={x} y={y} width={maxWidth} height={height} rx={radius} fill={fill} stroke={stroke} strokeWidth={1} />
      )}
      {block.cards.map((card, idx) => {
        const cardY = y + pad + cardHeights.slice(0, idx).reduce((sum, h) => sum + h, 0) + idx * gap;
        const cardH = cardHeights[idx];
        const cardX = x + pad;
        const cardW = maxWidth - pad * 2;
        const avatarCx = cardX + innerPad + avatar / 2;
        const contentX = cardX + innerPad + (block.showAvatar ? avatar + 12 * scale : 0);

        return (
          <g key={`testimonial-${idx}`}>
            <rect
              x={cardX}
              y={cardY}
              width={cardW}
              height={cardH}
              rx={Math.max(12, radius * 0.9)}
              fill="rgba(0,0,0,0.18)"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={1}
            />
            {block.showAvatar && (
              <>
                <circle cx={avatarCx} cy={cardY + innerPad + avatar / 2} r={avatar / 2} fill={accentColor} opacity={0.25} />
                <circle
                  cx={avatarCx}
                  cy={cardY + innerPad + avatar / 2}
                  r={Math.max(1, avatar / 2 - 3)}
                  fill="rgba(255,255,255,0.10)"
                />
              </>
            )}
            {Array.from({ length: block.stars }).map((_, starIdx) => {
              const StarIcon = getLucideIconByName('Star');
              const size = 16 * scale;
              return (
                <StarIcon
                  key={starIdx}
                  x={contentX + starIdx * (size + 4 * scale)}
                  y={cardY + innerPad}
                  width={size}
                  height={size}
                  color={accentColor}
                  fill={accentColor}
                  strokeWidth={1.6}
                  opacity={0.95}
                />
              );
            })}
            <text
              x={contentX}
              y={cardY + innerPad + 18 * scale + 10 * scale + quoteSize}
              fill={textColor}
              fontFamily={style.fontFamily}
              fontWeight={style.bodyWeight}
              fontSize={quoteSize}
            >
              {wrapText(card.quote, cardW - innerPad * 2 - (block.showAvatar ? avatar + 12 * scale : 0), quoteSize).map(
                (line, lineIdx) => (
                  <tspan key={lineIdx} x={contentX} dy={lineIdx === 0 ? 0 : quoteLineHeight}>
                    {line}
                  </tspan>
                )
              )}
            </text>
            <text
              x={contentX}
              y={cardY + cardH - innerPad}
              fill="rgba(255,255,255,0.7)"
              fontFamily={style.fontFamily}
              fontWeight={style.headingWeight}
              fontSize={nameSize}
            >
              — {card.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function BadgeSvg({
  block,
  style,
  textColor,
  x,
  y,
  radius,
  scale,
}: {
  block: BadgeBlock;
  style: EcommerceOverlaySpec['globalStyle'];
  textColor: string;
  x: number;
  y: number;
  radius: number;
  scale: number;
}) {
  const size = Math.max(12, block.size * scale);
  const bg = clampHex(block.color, '#8B5CF6');
  const padX = 14 * scale;
  const padY = 8 * scale;
  const fontSize = Math.max(12, size * 0.95);

  if (block.badgeStyle === 'seal') {
    const r = Math.max(22, size * 1.4);
    const cx = x + r;
    const cy = y + r;
    return (
      <g filter={cardShadowFilterId(true)}>
        <circle cx={cx} cy={cy} r={r} fill={bg} opacity={0.96} />
        <circle cx={cx} cy={cy} r={r - 4} fill="rgba(0,0,0,0.12)" opacity={0.45} />
        <text
          x={cx}
          y={cy + fontSize * 0.34}
          textAnchor="middle"
          fill="#0b1020"
          fontFamily={style.fontFamily}
          fontWeight={900}
          fontSize={fontSize}
        >
          {block.text}
        </text>
      </g>
    );
  }

  const text = String(block.text || '').trim();
  const approxWidth = Math.max(120, text.length * (fontSize * 0.55) + padX * 2);
  const h = Math.max(34, fontSize + padY * 2);
  const rx = block.badgeStyle === 'tag' ? Math.max(10, radius * 0.7) : h / 2;

  return (
    <g filter={cardShadowFilterId(true)}>
      <rect x={x} y={y} width={approxWidth} height={h} rx={rx} fill={bg} opacity={0.96} />
      <text
        x={x + approxWidth / 2}
        y={y + h / 2 + fontSize * 0.34}
        textAnchor="middle"
        fill={textColor}
        fontFamily={style.fontFamily}
        fontWeight={900}
        fontSize={fontSize}
      >
        {text}
      </text>
    </g>
  );
}

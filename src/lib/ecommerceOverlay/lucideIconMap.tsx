import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  Ban,
  Check,
  Clock,
  FlaskConical,
  Hand,
  Heart,
  Leaf,
  MessageCircle,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Sun,
  Truck,
  Zap,
} from 'lucide-react';

type LucideIconComponent = ComponentType<LucideProps>;

const ICON_MAP: Record<string, LucideIconComponent> = {
  Ban,
  Check,
  Clock,
  FlaskConical,
  Hand,
  Heart,
  Leaf,
  MessageCircle,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Sun,
  Truck,
  Zap,
};

const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

export function getLucideIconByName(iconName: string | undefined): LucideIconComponent {
  if (!iconName) return Check;
  const normalized = normalize(iconName);
  const direct = ICON_MAP[iconName];
  if (direct) return direct;
  const matchKey = Object.keys(ICON_MAP).find(key => normalize(key) === normalized);
  return matchKey ? ICON_MAP[matchKey] : Check;
}


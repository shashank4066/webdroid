'use client';

import {
  ArrowLeftRight,
  Calculator,
  Clock,
  CloudSun,
  Gamepad2,
  LayoutGrid,
  Music,
  Palette,
  Package,
  Play,
  Settings,
  SquareTerminal,
  StickyNote,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TILES: Record<string, { tile: string; Icon: LucideIcon }> = {
  calculator: { tile: 'from-emerald-400 to-teal-600', Icon: Calculator },
  clock: { tile: 'from-amber-400 to-orange-600', Icon: Clock },
  notes: { tile: 'from-lime-400 to-green-600', Icon: StickyNote },
  weather: { tile: 'from-teal-400 to-cyan-600', Icon: CloudSun },
  converter: { tile: 'from-orange-400 to-red-500', Icon: ArrowLeftRight },
  snake: { tile: 'from-green-500 to-emerald-700', Icon: Gamepad2 },
  g2048: { tile: 'from-yellow-400 to-amber-600', Icon: LayoutGrid },
  paint: { tile: 'from-fuchsia-400 to-rose-600', Icon: Palette },
  music: { tile: 'from-violet-400 to-purple-700', Icon: Music },
  terminal: { tile: 'from-zinc-600 to-zinc-800', Icon: SquareTerminal },
  playstore: { tile: 'from-[#31b06d] to-[#17804b]', Icon: Play },
  settings: { tile: 'from-stone-500 to-stone-700', Icon: Settings },
};

export function AppIcon({
  id,
  px = 56,
  className,
}: {
  id: string;
  px?: number;
  className?: string;
}) {
  const def = TILES[id] ?? { tile: 'from-slate-500 to-slate-700', Icon: Package };
  const Icon = def.Icon;
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br shadow-[0_4px_10px_-4px_rgba(0,0,0,0.6)]',
        def.tile,
        className
      )}
      style={{ width: px, height: px, borderRadius: px * 0.29 }}
    >
      <Icon style={{ width: px * 0.5, height: px * 0.5 }} className="text-white" strokeWidth={1.8} />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import {
  BatteryCharging,
  BatteryMedium,
  Circle,
  Signal,
  Square,
  Triangle,
  Volume2,
  Wifi,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNow } from '@/hooks/use-now';
import { useBattery } from '@/hooks/use-battery';
import { useOS } from './store';

/** Punch-hole camera over the top edge of the screen. */
export function PunchHole() {
  return (
    <div className="absolute left-1/2 top-[7px] z-[70] h-[11px] w-[11px] -translate-x-1/2 rounded-full bg-black shadow-[0_0_0_1.5px_rgba(255,255,255,0.05)]" />
  );
}

/** Top status bar — clock, signal, wifi, battery. */
export function StatusBar() {
  const now = useNow(10000);
  const { level, charging } = useBattery();

  return (
    <div className="absolute inset-x-0 top-0 z-40 flex h-[26px] items-center justify-between px-4 text-[11px] font-medium text-white select-none pointer-events-none">
      <span className="tabular-nums [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
      <div className="flex items-center gap-1.5 [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
        <Signal className="h-3 w-3" />
        <Wifi className="h-3 w-3" />
        <span className="text-[10px] tabular-nums">{level}%</span>
        {charging ? (
          <BatteryCharging className="h-3.5 w-3.5 text-emerald-300" />
        ) : (
          <BatteryMedium className="h-3.5 w-3.5" />
        )}
      </div>
    </div>
  );
}

/** Classic three-button navigation bar. */
export function NavBar({
  onBack,
  onHome,
  onRecents,
}: {
  onBack: () => void;
  onHome: () => void;
  onRecents: () => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-40 flex h-[44px] items-center justify-center gap-9 bg-black/45 backdrop-blur-md">
      <NavBtn label="Back (Escape)" onClick={onBack}>
        <Triangle className="h-[15px] w-[15px] -rotate-90 fill-current" strokeWidth={1} />
      </NavBtn>
      <NavBtn label="Home" onClick={onHome} accent>
        <Circle className="h-[14px] w-[14px] fill-current" strokeWidth={1} />
      </NavBtn>
      <NavBtn label="Recents" onClick={onRecents}>
        <Square className="h-[13px] w-[13px] fill-current" strokeWidth={1} />
      </NavBtn>
    </div>
  );
}

function NavBtn({
  label,
  onClick,
  accent,
  children,
}: {
  label: string;
  onClick: () => void;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition cursor-pointer',
        'hover:bg-white/10 active:scale-90',
        accent && 'text-emerald-300'
      )}
    >
      {children}
    </button>
  );
}

/** Bottom-center toast pill. */
export function ToastLayer() {
  const toastText = useOS((s) => s.toastText);
  const toastId = useOS((s) => s.toastId);
  const clearToast = useOS((s) => s.clearToast);

  useEffect(() => {
    if (!toastText) return;
    const t = setTimeout(clearToast, 2200);
    return () => clearTimeout(t);
  }, [toastText, toastId, clearToast]);

  if (!toastText) return null;
  return (
    <div
      key={toastId}
      className="wd-up pointer-events-none absolute bottom-[54px] left-1/2 z-[65] max-w-[86%] -translate-x-1/2 truncate rounded-full border border-white/10 bg-zinc-800/95 px-4 py-2 text-[11.5px] text-zinc-100 shadow-lg"
    >
      {toastText}
    </div>
  );
}

/** Left-edge volume slider that pops up when volume keys are pressed. */
export function VolumeOverlay() {
  const volume = useOS((s) => s.volume);
  const volumeAt = useOS((s) => s.volumeAt);
  const [activeAt, setActiveAt] = useState(0);

  // React-recommended pattern: adjust state during render when incoming dependency changes
  if (volumeAt !== activeAt) {
    setActiveAt(volumeAt);
  }

  useEffect(() => {
    if (!volumeAt) return;
    const timer = setTimeout(() => {
      setActiveAt(0);
    }, 1300);
    return () => clearTimeout(timer);
  }, [volumeAt]);

  if (!activeAt) return null;

  return (
    <div className="wd-up absolute left-3 top-24 z-[65] flex flex-col items-center rounded-full border border-white/10 bg-black/70 px-1.5 py-3 backdrop-blur pointer-events-none">
      <Volume2 className="mb-2 h-3.5 w-3.5 text-white/90" />
      <div className="flex h-28 w-1.5 flex-col justify-end overflow-hidden rounded-full bg-white/20">
        <div className="w-full rounded-full bg-emerald-400 transition-all duration-150" style={{ height: `${volume}%` }} />
      </div>
    </div>
  );
}

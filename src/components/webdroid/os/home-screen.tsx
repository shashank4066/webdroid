'use client';

import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { ChevronUp } from 'lucide-react';
import type { AppMeta } from '@/lib/apps/catalog';
import { AppIcon } from './app-icon';
import { useLongPress } from './long-press';

interface Props {
  /** Installed apps shown in the main grid (already excludes dock apps). */
  gridApps: AppMeta[];
  /** Dock apps: system pinned + most recent installs. */
  dockApps: AppMeta[];
  onOpen: (id: string) => void;
  onLongPress: (id: string) => void;
  onDrawer: () => void;
}

export function HomeScreen({ gridApps, dockApps, onOpen, onLongPress, onDrawer }: Props) {
  const pressY = useRef<number | null>(null);

  const onDown = (e: ReactPointerEvent) => {
    pressY.current = e.clientY;
  };
  const onUp = (e: ReactPointerEvent) => {
    if (pressY.current === null) return;
    const dy = e.clientY - pressY.current;
    pressY.current = null;
    if (dy < -64) onDrawer();
  };

  const hasUserApps = gridApps.length + dockApps.length > 2;

  return (
    <div className="absolute inset-0 flex flex-col" onPointerDown={onDown} onPointerUp={onUp}>
      {/* Clock widget */}
      <div className="px-6 pt-[52px]">
        <div className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur-md">
          <div className="text-[44px] font-extralight leading-none tracking-tight text-white tabular-nums">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="mt-1.5 text-[12.5px] text-white/80">
            {new Date().toLocaleDateString([], {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-emerald-300/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            WebDroid OS
          </div>
        </div>
      </div>

      {/* App grid */}
      <div className="mt-6 flex-1 overflow-y-auto px-4 pb-2 wd-scroll">
        {hasUserApps ? (
          <div className="grid grid-cols-4 gap-y-5">
            {gridApps.map((app) => (
              <LauncherIcon
                key={app.id}
                app={app}
                onOpen={onOpen}
                onLongPress={onLongPress}
                label
              />
            ))}
          </div>
        ) : (
          <div className="mx-2 mt-2 rounded-3xl border border-white/10 bg-black/25 p-5 text-center backdrop-blur-md">
            <p className="text-[13px] font-medium text-white/90">Your phone is ready</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/60">
              Everything installs from the local Play Store — no network needed.
            </p>
            <button
              type="button"
              onClick={() => onOpen('playstore')}
              className="mt-3 rounded-full bg-emerald-500 px-5 py-2 text-[12px] font-semibold text-emerald-950 active:scale-95"
            >
              Browse Play Store
            </button>
          </div>
        )}
      </div>

      {/* Drawer handle */}
      <button
        type="button"
        aria-label="Open app drawer"
        onClick={onDrawer}
        className="mx-auto mb-1 flex h-7 w-7 items-center justify-center text-white/70"
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      {/* Dock */}
      <div className="mx-3 mb-[52px] rounded-[1.7rem] border border-white/10 bg-black/30 p-3 backdrop-blur-md">
        <div className="grid grid-cols-4 justify-items-center">
          {dockApps.map((app) => (
            <LauncherIcon key={app.id} app={app} onOpen={onOpen} onLongPress={onLongPress} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LauncherIcon({
  app,
  onOpen,
  onLongPress,
  label = true,
  compact = false,
}: {
  app: AppMeta;
  onOpen: (id: string) => void;
  onLongPress?: (id: string) => void;
  label?: boolean;
  compact?: boolean;
}) {
  const press = useLongPress(() => onLongPress?.(app.id));
  const px = compact ? 50 : 54;
  return (
    <button
      type="button"
      onClick={() => onOpen(app.id)}
      {...press}
      className="group flex flex-col items-center gap-1.5"
    >
      <AppIcon
        id={app.id}
        px={px}
        className="transition-transform group-hover:scale-105 group-active:scale-95"
      />
      {label && (
        <span className="max-w-[72px] truncate text-[10px] text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
          {app.name}
        </span>
      )}
    </button>
  );
}

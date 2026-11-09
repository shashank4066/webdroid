'use client';

import { useState } from 'react';
import { Check, ChevronRight, Cpu, HardDrive, MemoryStick, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WALLPAPERS, useOS } from './store';

interface Props {
  onOpenStore: () => void;
}

/** Native OS settings: wallpaper picker, apps shortcut, about phone. */
export function SettingsApp({ onOpenStore }: Props) {
  const wallpaper = useOS((s) => s.wallpaper);
  const setWallpaper = useOS((s) => s.setWallpaper);
  const showToast = useOS((s) => s.showToast);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0d1310] px-4 pt-2 pb-4 wd-scroll">
      <h1 className="px-1 pt-2 text-[19px] font-semibold tracking-tight text-white">Settings</h1>
      <p className="px-1 mt-0.5 text-[11px] text-white/50">WebDroid OS 1.0 · personalization</p>

      <section className="mt-4">
        <h2 className="px-1 pb-2 text-[10.5px] uppercase tracking-[0.16em] text-emerald-300/80">
          Appearance
        </h2>
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-3">
          <p className="px-1 pb-2.5 text-[12px] text-white/70">Wallpaper</p>
          <div className="grid grid-cols-3 gap-2.5">
            {WALLPAPERS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  setWallpaper(w.id);
                  showToast('Wallpaper applied');
                }}
                className={cn(
                  'relative h-[74px] overflow-hidden rounded-2xl border transition',
                  wallpaper === w.id ? 'border-emerald-400' : 'border-white/10'
                )}
                style={{ background: w.css }}
              >
                {wallpaper === w.id && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-emerald-950">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
                <span className="absolute bottom-1.5 left-2 text-[9.5px] text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                  {w.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4">
        <h2 className="px-1 pb-2 text-[10.5px] uppercase tracking-[0.16em] text-emerald-300/80">
          Device
        </h2>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]">
          <Row
            icon={<ChevronRight className="h-4 w-4" />}
            title="Play Store"
            subtitle="Manage your installed apps"
            onClick={onOpenStore}
          />
          <Row
            icon={<Wrench className="h-4 w-4" />}
            title="About phone"
            subtitle="Hardware, engine and storage details"
            onClick={() => setShowAbout((v) => !v)}
          />
          {showAbout && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-white/10 bg-black/30 p-4">
              <About k="Model" v="WebDroid X1" />
              <About k="OS" v="WebDroid OS 1.0" />
              <About k="CPU" v="x86 · WebAssembly JIT (v86)" icon />
              <About k="Memory" v="64 MB (guest)" icon />
              <About k="Storage" v="IndexedDB · on-device" icon />
              <About k="Build" v="WDX1.2026.11" />
            </div>
          )}
        </div>
      </section>

      <p className="mt-4 px-1 text-center text-[10px] leading-relaxed text-white/35">
        WebDroid runs entirely in your browser tab. Apps, packages and settings never
        leave this device.
      </p>
    </div>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.04]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-[13px] font-medium text-white">{title}</span>
        <span className="block text-[11px] text-white/50">{subtitle}</span>
      </span>
      <ChevronRight className="h-3.5 w-3.5 text-white/30" />
    </button>
  );
}

function About({ k, v, icon }: { k: string; v: string; icon?: boolean }) {
  const I = icon ? (k === 'CPU' ? Cpu : k === 'Memory' ? MemoryStick : HardDrive) : null;
  return (
    <div className="flex items-center gap-2">
      {I && <I className="h-3.5 w-3.5 shrink-0 text-emerald-300/80" />}
      <div>
        <p className="text-[9.5px] uppercase tracking-[0.12em] text-white/40">{k}</p>
        <p className="mt-0.5 text-[11.5px] text-white/85">{v}</p>
      </div>
    </div>
  );
}

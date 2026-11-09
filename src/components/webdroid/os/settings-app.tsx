'use client';

import { useState } from 'react';
import { ChevronRight, Wrench } from 'lucide-react';
import { WALLPAPERS, useOS } from './store';
import { cn } from '@/lib/utils';

export function SettingsApp({ onOpenStore }: { onOpenStore: () => void }) {
  const wallpaper = useOS((s) => s.wallpaper);
  const setWallpaper = useOS((s) => s.setWallpaper);
  const showToast = useOS((s) => s.showToast);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0e1310] px-3.5 pb-6 pt-3 text-white wd-scroll">
      <h1 className="px-1 text-[22px] font-semibold tracking-tight">Settings</h1>

      <section className="mt-4">
        <h2 className="px-1 pb-2 text-[10.5px] uppercase tracking-[0.16em] text-emerald-300/80">
          Wallpaper
        </h2>
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-3">
          <div className="grid grid-cols-3 gap-2">
            {WALLPAPERS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  setWallpaper(w.id);
                  showToast(`Wallpaper: ${w.name}`);
                }}
                className={cn(
                  'relative h-20 overflow-hidden rounded-2xl border transition active:scale-95 cursor-pointer',
                  w.id === wallpaper
                    ? 'border-emerald-400 ring-2 ring-emerald-400/40'
                    : 'border-white/15 hover:border-white/40'
                )}
                style={{ background: w.css }}
              >
                <span className="absolute bottom-1.5 left-2 text-[9.5px] text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)] font-medium">
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
            title="Droid Store"
            subtitle="Browse and manage installed apps"
            onClick={onOpenStore}
          />
          <Row
            icon={<Wrench className="h-4 w-4" />}
            title="About phone"
            subtitle="Specifications, engine architecture & storage"
            onClick={() => setShowAbout((v) => !v)}
          />
          {showAbout && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-white/10 bg-black/30 p-4">
              <About k="Model" v="WebDroid Simulator" />
              <About k="OS" v="WebDroid OS (Next.js/React)" />
              <About k="Runtime" v="Browser JavaScript & DOM" />
              <About k="Terminal" v="v86 x86 Linux (optional)" />
              <About k="Storage" v="IndexedDB · on-device" />
              <About k="Isolation" v="Sandboxed postMessage bridge" />
              <About k="Build" v="WDX.2026.11" />
              <About k="License" v="Open Source (MIT / GPL-2.0)" />
            </div>
          )}
        </div>
      </section>

      <p className="mt-4 px-2 text-center text-[10px] leading-relaxed text-white/40">
        WebDroid is a client-side Android-style web environment. App packages and data stay strictly in your local browser storage.
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
      className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/[0.04] active:bg-white/[0.08] cursor-pointer"
    >
      <div>
        <div className="text-[13px] font-medium text-white/90">{title}</div>
        <div className="text-[11px] text-white/50">{subtitle}</div>
      </div>
      <div className="text-white/40">{icon}</div>
    </button>
  );
}

function About({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-emerald-300/80">{k}</div>
      <div className="mt-0.5 text-[11px] font-medium text-white/90 truncate" title={v}>{v}</div>
    </div>
  );
}

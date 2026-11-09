'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Logical OS screens layered on top of the wallpaper. */
export type OSScreen = 'home' | 'drawer' | 'recents';

export interface Wallpaper {
  id: string;
  name: string;
  css: string;
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    css: 'linear-gradient(163deg,#062b3a 0%,#0e5c4a 46%,#123f2e 78%,#071e18 100%)',
  },
  {
    id: 'dusk',
    name: 'Dusk',
    css: 'linear-gradient(163deg,#2d1b4e 0%,#6e2b5c 48%,#c2426e 82%,#3a1030 100%)',
  },
  {
    id: 'ember',
    name: 'Ember',
    css: 'linear-gradient(163deg,#30100a 0%,#8a2c14 46%,#d97b29 78%,#411403 100%)',
  },
  {
    id: 'moss',
    name: 'Moss',
    css: 'linear-gradient(163deg,#0d2818 0%,#1e5c38 50%,#3b8a4f 80%,#0c1f14 100%)',
  },
  {
    id: 'graphite',
    name: 'Graphite',
    css: 'linear-gradient(163deg,#0b0e11 0%,#232a31 55%,#3b444d 85%,#10141a 100%)',
  },
];

export function wallpaperById(id: string): Wallpaper {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
}

interface WebDroidState {
  booted: boolean;
  locked: boolean;
  screenOff: boolean;
  screen: OSScreen;
  openApps: string[];
  activeApp: string | null;
  installedIds: string[];
  wallpaper: string;
  toastId: number;
  toastText: string | null;
  volume: number;
  volumeAt: number;

  setBooted: (v: boolean) => void;
  unlock: () => void;
  sleep: () => void;
  wake: () => void;
  setScreen: (s: OSScreen) => void;
  openApp: (id: string) => void;
  closeApp: (id: string) => void;
  setInstalled: (ids: string[]) => void;
  addInstalled: (id: string) => void;
  removeInstalled: (id: string) => void;
  setWallpaper: (id: string) => void;
  showToast: (text: string) => void;
  clearToast: () => void;
  bumpVolume: (delta: number) => void;
}

export const useOS = create<WebDroidState>()(
  persist(
    (set, get) => ({
      booted: false,
      locked: true,
      screenOff: false,
      screen: 'home',
      openApps: [],
      activeApp: null,
      installedIds: [],
      wallpaper: 'aurora',
      toastId: 0,
      toastText: null,
      volume: 70,
      volumeAt: 0,

      setBooted: (v) => set({ booted: v }),
      unlock: () => set({ locked: false }),
      sleep: () => set({ screenOff: true }),
      wake: () => set({ screenOff: false, locked: true }),
      setScreen: (s) => set({ screen: s }),
      openApp: (id) => {
        const { openApps } = get();
        set({
          openApps: openApps.includes(id) ? openApps : [...openApps, id],
          activeApp: id,
          screen: 'home',
        });
      },
      closeApp: (id) => {
        const { openApps, activeApp } = get();
        const next = openApps.filter((a) => a !== id);
        set({
          openApps: next,
          activeApp: activeApp === id ? null : activeApp,
          screen: 'home',
        });
      },
      setInstalled: (ids) => set({ installedIds: ids }),
      addInstalled: (id) => {
        const { installedIds } = get();
        if (!installedIds.includes(id)) set({ installedIds: [...installedIds, id] });
      },
      removeInstalled: (id) => {
        const { installedIds, openApps, activeApp } = get();
        set({
          installedIds: installedIds.filter((a) => a !== id),
          openApps: openApps.filter((a) => a !== id),
          activeApp: activeApp === id ? null : activeApp,
        });
      },
      setWallpaper: (id) => set({ wallpaper: id }),
      showToast: (text) => set((s) => ({ toastText: text, toastId: s.toastId + 1 })),
      clearToast: () => set({ toastText: null }),
      bumpVolume: (delta) =>
        set((s) => ({
          volume: Math.min(100, Math.max(0, s.volume + delta)),
          volumeAt: Date.now(),
        })),
    }),
    {
      name: 'webdroid-os',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ installedIds: s.installedIds, wallpaper: s.wallpaper }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<WebDroidState>;
        return {
          ...current,
          wallpaper: typeof p.wallpaper === 'string' ? p.wallpaper : current.wallpaper,
          installedIds: Array.isArray(p.installedIds)
            ? p.installedIds.filter((x) => typeof x === 'string')
            : current.installedIds,
        };
      },
    }
  )
);

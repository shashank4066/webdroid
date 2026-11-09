import { BASIC_APPS } from './packages-basic.ts';
import { GAME_APPS } from './packages-games.ts';
import { EXTRA_APPS } from './packages-extra.ts';

export interface AppMeta {
  id: string;
  name: string;
  pkg: string;
  developer: string;
  category: 'Apps' | 'Games';
  rating: number;
  reviews: string;
  downloads: string;
  sizeMB: number;
  version: string;
  tagline: string;
  description: string;
  whatsNew: string;
  html?: string;
  /** Only set for built-in system apps (Droid Store, Settings). */
  system?: boolean;
}

/** IDs that ship with the OS and cannot be uninstalled. */
export const SYSTEM_APP_IDS = ['droidstore', 'settings'];

export const SYSTEM_APPS: AppMeta[] = [
  {
    id: 'droidstore',
    name: 'Droid Store',
    pkg: 'os.webdroid.store',
    developer: 'WebDroid OS',
    category: 'Apps',
    rating: 4.8,
    reviews: 'Built-in',
    downloads: 'Local',
    sizeMB: 0,
    version: '1.1.0',
    tagline: 'On-device app catalog',
    description: 'Browse, install, and update apps from the offline on-device catalog.',
    whatsNew: 'Offline packages with sandboxed postMessage bridge and cancelable installs.',
    system: true,
  },
  {
    id: 'settings',
    name: 'Settings',
    pkg: 'os.webdroid.settings',
    developer: 'WebDroid OS',
    category: 'Apps',
    rating: 4.6,
    reviews: 'Built-in',
    downloads: 'Local',
    sizeMB: 0,
    version: '1.0.0',
    tagline: 'Wallpaper, audio and device info',
    description: 'Personalize your phone and inspect accurate system specifications.',
    whatsNew: '',
    system: true,
  },
];

/** Apps available in the local Droid Store (installable). */
export const CATALOG: AppMeta[] = [...BASIC_APPS, ...GAME_APPS, ...EXTRA_APPS];

export function getApp(id: string): AppMeta | undefined {
  if (id === 'playstore') return SYSTEM_APPS[0]; // backward compatibility
  return CATALOG.find((a) => a.id === id) ?? SYSTEM_APPS.find((a) => a.id === id);
}

export function isSystemApp(id: string): boolean {
  return id === 'playstore' || SYSTEM_APP_IDS.includes(id);
}

export function formatSize(mb: number): string {
  return mb >= 100 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
}

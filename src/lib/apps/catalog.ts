import { BASIC_APPS } from './packages-basic';
import { GAME_APPS } from './packages-games';
import { EXTRA_APPS } from './packages-extra';

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
  /** Only set for built-in system apps (Play Store, Settings). */
  system?: boolean;
}

/** IDs that ship with the OS and cannot be uninstalled. */
export const SYSTEM_APP_IDS = ['playstore', 'settings'];

export const SYSTEM_APPS: AppMeta[] = [
  {
    id: 'playstore',
    name: 'Play Store',
    pkg: 'os.webdroid.store',
    developer: 'WebDroid OS',
    category: 'Apps',
    rating: 4.8,
    reviews: 'system',
    downloads: '—',
    sizeMB: 0,
    version: '1.0.0',
    tagline: 'Local app store for your phone',
    description: 'Browse and install apps from the on-device catalog.',
    whatsNew: '',
    system: true,
  },
  {
    id: 'settings',
    name: 'Settings',
    pkg: 'os.webdroid.settings',
    developer: 'WebDroid OS',
    category: 'Apps',
    rating: 4.6,
    reviews: 'system',
    downloads: '—',
    sizeMB: 0,
    version: '1.0.0',
    tagline: 'Wallpaper and device info',
    description: 'Personalize your phone and inspect system details.',
    whatsNew: '',
    system: true,
  },
];

/** Apps available in the local Play Store (installable). */
export const CATALOG: AppMeta[] = [...BASIC_APPS, ...GAME_APPS, ...EXTRA_APPS];

export function getApp(id: string): AppMeta | undefined {
  return CATALOG.find((a) => a.id === id) ?? SYSTEM_APPS.find((a) => a.id === id);
}

export function isSystemApp(id: string): boolean {
  return SYSTEM_APP_IDS.includes(id);
}

export function formatSize(mb: number): string {
  return mb >= 100 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
}

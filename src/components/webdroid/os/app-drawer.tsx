'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { AppMeta } from '@/lib/apps/catalog';
import { LauncherIcon } from './home-screen';

interface Props {
  apps: AppMeta[];
  onOpen: (id: string) => void;
  onLongPress: (id: string) => void;
  onClose: () => void;
}

/** Full-screen glass app drawer with search. */
export function AppDrawer({ apps, onOpen, onLongPress, onClose }: Props) {
  const [q, setQ] = useState('');
  const list = useMemo(
    () =>
      [...apps]
        .filter((a) => a.name.toLowerCase().includes(q.trim().toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [apps, q]
  );

  return (
    <div className="wd-up absolute inset-0 z-30 flex flex-col bg-black/60 backdrop-blur-2xl">
      <div className="flex items-center gap-2 px-4 pt-[34px]">
        <div className="flex h-9 flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5">
          <Search className="h-3.5 w-3.5 text-white/60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search apps"
            className="h-full flex-1 bg-transparent text-[12.5px] text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>
        <button
          type="button"
          aria-label="Close drawer"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 active:scale-90"
        >
          <ChevronDown className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto px-4 pb-6 wd-scroll">
        {list.length ? (
          <div className="grid grid-cols-4 gap-y-6">
            {list.map((app) => (
              <LauncherIcon
                key={app.id}
                app={app}
                onOpen={onOpen}
                onLongPress={onLongPress}
                compact
              />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-[12px] text-white/50">No apps match “{q}”</p>
        )}
      </div>

      <div className="mb-[52px] flex justify-center gap-1.5">
        <span className="h-1 w-4 rounded-full bg-white/70" />
        <span className="h-1 w-1 rounded-full bg-white/30" />
      </div>
    </div>
  );
}

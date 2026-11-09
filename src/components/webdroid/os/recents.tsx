'use client';

import { X } from 'lucide-react';
import { getApp } from '@/lib/apps/catalog';
import { AppIcon } from './app-icon';

interface Props {
  openIds: string[];
  onFocus: (id: string) => void;
  onCloseApp: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

/** Recent apps overview with swipeable cards. */
export function Recents({ openIds, onFocus, onCloseApp, onClearAll, onClose }: Props) {
  return (
    <div className="wd-fade absolute inset-0 z-30 flex flex-col bg-black/70 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 pt-[34px]">
        <span className="text-[12.5px] font-medium tracking-wide text-white/85">Recents</span>
        {openIds.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] text-white/85 active:scale-95"
          >
            Clear all
          </button>
        )}
      </div>

      {openIds.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[12px] text-white/50">No recent apps</p>
        </div>
      ) : (
        <div className="flex flex-1 items-center overflow-x-auto px-5 wd-scroll">
          <div className="flex gap-4">
            {openIds.map((id) => {
              const meta = getApp(id);
              if (!meta) return null;
              return (
                <div
                  key={id}
                  className="wd-pop relative flex h-[370px] w-[200px] shrink-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06]"
                  onClick={() => onFocus(id)}
                >
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <AppIcon id={id} px={22} />
                    <span className="flex-1 truncate text-[11px] text-white/90">{meta.name}</span>
                    <button
                      type="button"
                      aria-label={`Close ${meta.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseApp(id);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex flex-1 items-center justify-center">
                    <AppIcon id={id} px={54} className="opacity-60" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="mb-[52px] mx-auto rounded-full bg-white/10 px-4 py-1.5 text-[11px] text-white/80"
      >
        Close
      </button>
    </div>
  );
}

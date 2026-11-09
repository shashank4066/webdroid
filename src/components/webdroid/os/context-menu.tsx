'use client';

import { useState } from 'react';
import { ChevronRight, Info, Play, Trash2, X } from 'lucide-react';
import { formatSize, getApp, isSystemApp } from '@/lib/apps/catalog';
import { AppIcon } from './app-icon';

interface Props {
  target: string | null;
  onClose: () => void;
  onOpen: (id: string) => void;
  onUninstall: (id: string) => void;
}

/** Bottom sheet after long-pressing a launcher icon: open / app info / uninstall. */
export function ContextMenu({ target, onClose, onOpen, onUninstall }: Props) {
  const [mode, setMode] = useState<'menu' | 'info'>('menu');
  if (!target) return null;
  const meta = getApp(target);
  if (!meta) return null;
  const system = isSystemApp(target);

  return (
    <div
      className="wd-fade absolute inset-0 z-[60] flex flex-col justify-end bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="wd-up m-3 mb-[50px] rounded-3xl border border-white/10 bg-zinc-900 p-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {mode === 'info' ? (
          <>
            <div className="flex items-center gap-3 px-3 pt-2 pb-3">
              <AppIcon id={meta.id} px={40} />
              <div className="flex-1">
                <p className="text-[13.5px] font-semibold text-white">{meta.name}</p>
                <p className="text-[11px] text-zinc-400">{meta.pkg}</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mx-2 mb-2 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-3 text-[11px]">
              <InfoRow k="Version" v={meta.version} />
              <InfoRow k="Size" v={system ? 'System' : formatSize(meta.sizeMB)} />
              <InfoRow k="Developer" v={meta.developer} />
              <InfoRow k="Category" v={meta.category} />
            </div>
            {!system && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUninstall(meta.id);
                }}
                className="mx-1 mb-1 flex h-11 w-[calc(100%-8px)] items-center gap-3 rounded-2xl px-4 text-[13px] text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" /> Uninstall
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 px-3 pt-2 pb-2">
              <AppIcon id={meta.id} px={36} />
              <p className="flex-1 text-[13px] font-semibold text-white">{meta.name}</p>
            </div>
            <SheetRow
              icon={<Play className="h-4 w-4" />}
              label="Open"
              onClick={() => {
                onClose();
                onOpen(meta.id);
              }}
            />
            <SheetRow
              icon={<Info className="h-4 w-4" />}
              label="App info"
              onClick={() => setMode('info')}
            />
            {!system && (
              <SheetRow
                icon={<Trash2 className="h-4 w-4" />}
                label="Uninstall"
                danger
                onClick={() => {
                  onClose();
                  onUninstall(meta.id);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[9.5px] uppercase tracking-[0.12em] text-zinc-500">{k}</p>
      <p className="mt-0.5 truncate text-zinc-200">{v}</p>
    </div>
  );
}

function SheetRow({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mx-1 flex h-11 w-[calc(100%-8px)] items-center gap-3 rounded-2xl px-4 text-[13px] hover:bg-white/5 ${
        danger ? 'text-rose-400' : 'text-zinc-200'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight className="h-3.5 w-3.5 opacity-40" />
    </button>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react';
import { CATALOG, formatSize, type AppMeta } from '@/lib/apps/catalog';
import { listAppPackages, type AppPackage } from '@/lib/idb';
import { AppIcon } from './app-icon';
import { cn } from '@/lib/utils';

type Tab = 'apps' | 'games' | 'myapps';
type Progress = Record<string, { pct: number; phase: 'download' | 'install' }>;

interface Props {
  installedIds: string[];
  onOpen: (id: string) => void;
  onInstall: (
    id: string,
    onProgress: (pct: number, phase: 'download' | 'install') => void,
    signal?: AbortSignal
  ) => Promise<void>;
  onUninstall: (id: string) => void;
  registerBack: (fn: (() => boolean) | null) => void;
}

/**
 * Droid Store: on-device local app catalog.
 * Installs write sandboxed web app packages into IndexedDB.
 */
export function PlayStore({ installedIds, onOpen, onInstall, onUninstall, registerBack }: Props) {
  const [view, setView] = useState<{ t: 'list' } | { t: 'detail'; id: string }>({ t: 'list' });
  const [tab, setTab] = useState<Tab>('apps');
  const [q, setQ] = useState('');
  const [progress, setProgress] = useState<Progress>({});
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [packages, setPackages] = useState<Record<string, AppPackage>>({});
  const abortControllers = useRef<Record<string, AbortController>>({});

  // Fetch package metadata from IDB to check installed versions
  const refreshPackages = () => {
    listAppPackages()
      .then((rows) => {
        const map: Record<string, AppPackage> = {};
        for (const r of rows) map[r.id] = r;
        setPackages(map);
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshPackages();
  }, [installedIds]);

  // Handle back button
  useEffect(() => {
    registerBack(() => {
      if (view.t === 'detail') {
        setView({ t: 'list' });
        return true;
      }
      if (q) {
        setQ('');
        return true;
      }
      return false;
    });
    return () => registerBack(null);
  }, [view, q, registerBack]);

  const cancelInstall = (id: string) => {
    if (abortControllers.current[id]) {
      abortControllers.current[id].abort();
      delete abortControllers.current[id];
    }
    setProgress((pr) => {
      const next = { ...pr };
      delete next[id];
      return next;
    });
  };

  const install = async (id: string) => {
    if (progress[id]) return;

    const controller = new AbortController();
    abortControllers.current[id] = controller;

    setProgress((p) => ({ ...p, [id]: { pct: 0, phase: 'download' } }));

    try {
      await onInstall(
        id,
        (pct, phase) => setProgress((pr) => ({ ...pr, [id]: { pct, phase } })),
        controller.signal
      );
      refreshPackages();
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        // Canceled by user
      } else {
        console.error('Failed to install package:', err);
      }
    } finally {
      delete abortControllers.current[id];
      setProgress((pr) => {
        const next = { ...pr };
        delete next[id];
        return next;
      });
    }
  };

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (tab === 'myapps') return [];
    return CATALOG.filter((a) => {
      const catOk = tab === 'apps' ? a.category === 'Apps' : a.category === 'Games';
      const qOk =
        !query ||
        a.name.toLowerCase().includes(query) ||
        a.developer.toLowerCase().includes(query);
      return catOk && qOk;
    });
  }, [tab, q]);

  const installedApps = useMemo(
    () => CATALOG.filter((a) => installedIds.includes(a.id)),
    [installedIds]
  );
  const totalMB = installedApps.reduce((sum, a) => sum + a.sizeMB, 0);

  const detail = view.t === 'detail' ? CATALOG.find((a) => a.id === view.id) : undefined;

  return (
    <div className="flex h-full flex-col bg-[#f5f6f3] text-[#1d211e] select-none">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-1">
        {view.t === 'detail' ? (
          <>
            <button
              type="button"
              aria-label="Back"
              onClick={() => setView({ t: 'list' })}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#3a403c] hover:bg-black/5 active:scale-90 cursor-pointer"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <span className="flex-1 truncate text-[13px] font-medium text-[#3a403c]">
              {detail?.name}
            </span>
          </>
        ) : (
          <>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#10b981] to-[#047857]">
              <Package className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-[#2a302c]">
              Droid Store
            </span>
          </>
        )}
        <div className="flex h-8 flex-1 items-center gap-2 rounded-full bg-white px-3 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <Search className="h-3.5 w-3.5 text-[#8a938c]" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setView({ t: 'list' });
            }}
            placeholder="Search local apps"
            className="h-full min-w-0 flex-1 bg-transparent text-[12px] placeholder:text-[#9aa39b] focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-2 flex gap-2 px-3">
        {(
          [
            ['apps', 'Apps'],
            ['games', 'Games'],
            ['myapps', 'My apps'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setView({ t: 'list' });
            }}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[12px] font-medium transition cursor-pointer',
              tab === id
                ? 'bg-[#0e3f26] text-white'
                : 'bg-[#e6ebe4] text-[#41514a] hover:bg-[#dbe3d9]'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="mt-1.5 flex-1 overflow-y-auto px-3 pb-4 wd-scroll-dark">
        {view.t === 'detail' && detail ? (
          <AppDetail
            app={detail}
            installed={installedIds.includes(detail.id)}
            installedPkg={packages[detail.id]}
            installing={progress[detail.id]}
            onInstall={install}
            onCancel={cancelInstall}
            onOpen={() => onOpen(detail.id)}
            onUninstall={() => setConfirmId(detail.id)}
          />
        ) : tab === 'myapps' ? (
          <>
            <div className="mt-2 rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-[13.5px] font-semibold">Installed on this device</p>
              <p className="mt-0.5 text-[11.5px] text-[#6e7a72]">
                {installedApps.length} app{installedApps.length === 1 ? '' : 's'} ·{' '}
                {formatSize(totalMB)} stored locally in IndexedDB
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {installedApps.map((a) => {
                const pkg = packages[a.id];
                const hasUpdate = pkg && pkg.version !== a.version;

                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  >
                    <AppIcon id={a.id} px={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{a.name}</p>
                      <p className="text-[11px] text-[#6e7a72]">
                        v{pkg?.version ?? a.version} · {formatSize(a.sizeMB)}
                      </p>
                    </div>

                    {hasUpdate ? (
                      <button
                        type="button"
                        onClick={() => install(a.id)}
                        className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white active:scale-95 cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" /> Update
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpen(a.id)}
                        className="rounded-full border border-[#b9c4ba] px-4 py-1.5 text-[11.5px] font-semibold text-[#0e5c36] active:scale-95 cursor-pointer"
                      >
                        Open
                      </button>
                    )}

                    {!a.system && (
                      <button
                        type="button"
                        aria-label={`Uninstall ${a.name}`}
                        onClick={() => setConfirmId(a.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#c0453b] hover:bg-rose-500/10 active:scale-90 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
              {installedApps.length === 0 && (
                <p className="mt-8 text-center text-[12px] text-[#6e7a72]">
                  Nothing installed yet — go grab something from the Apps tab.
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-1 pb-1 pt-2">
              <span className="text-[11px] text-[#6e7a72]">
                Local catalog · {list.length} app{list.length === 1 ? '' : 's'}
              </span>
              <span className="text-[10px] text-[#86948a] italic">Simulated metrics</span>
            </div>
            <div className="space-y-2">
              {list.map((a) => {
                const pkg = packages[a.id];
                const hasUpdate = pkg && pkg.version !== a.version;

                return (
                  <AppCard
                    key={a.id}
                    app={a}
                    installed={installedIds.includes(a.id)}
                    hasUpdate={Boolean(hasUpdate)}
                    installing={progress[a.id]}
                    onOpen={() => onOpen(a.id)}
                    onInstall={() => install(a.id)}
                    onCancel={() => cancelInstall(a.id)}
                    onOpenDetail={() => setView({ t: 'detail', id: a.id })}
                  />
                );
              })}
            </div>
            <p className="mt-4 rounded-2xl bg-[#e9efe6] p-3 text-center text-[10.5px] leading-relaxed text-[#4c5c52]">
              All packages are on-device web bundles. Installing stores the package in IndexedDB with sandboxed execution. Zero network required.
            </p>
          </>
        )}
      </div>

      {/* Uninstall confirm modal */}
      {confirmId && (
        <div
          className="wd-fade absolute inset-0 z-20 flex items-center justify-center bg-black/40"
          onClick={() => setConfirmId(null)}
        >
          <div
            className="wd-pop mx-6 w-full rounded-3xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[15px] font-semibold">Uninstall app?</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#5a655c]">
              “{CATALOG.find((a) => a.id === confirmId)?.name}” and its local storage will be removed from this device.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="rounded-full px-4 py-2 text-[12.5px] font-medium text-[#0e5c36] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = confirmId;
                  setConfirmId(null);
                  setView({ t: 'list' });
                  onUninstall(id);
                }}
                className="rounded-full bg-rose-600 px-4 py-2 text-[12.5px] font-semibold text-white active:scale-95 cursor-pointer"
              >
                Uninstall
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppCard({
  app,
  installed,
  hasUpdate,
  installing,
  onOpen,
  onInstall,
  onCancel,
  onOpenDetail,
}: {
  app: AppMeta;
  installed: boolean;
  hasUpdate?: boolean;
  installing?: { pct: number; phase: 'download' | 'install' };
  onOpen: () => void;
  onInstall: () => void;
  onCancel: () => void;
  onOpenDetail: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <button type="button" onClick={onOpenDetail} className="shrink-0 cursor-pointer">
        <AppIcon id={app.id} px={46} />
      </button>
      <button type="button" onClick={onOpenDetail} className="min-w-0 flex-1 text-left cursor-pointer">
        <p className="truncate text-[13.5px] font-medium leading-tight">{app.name}</p>
        <p className="truncate text-[11px] text-[#6e7a72]">{app.developer}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[10.5px] text-[#6e7a72]">
          <span className="font-semibold text-[#3c4a41]">{app.rating}</span>
          <Star className="h-2.5 w-2.5 fill-[#f5b83d] text-[#f5b83d]" />
          <span>· {formatSize(app.sizeMB)}</span>
        </p>
      </button>
      <CardAction
        installed={installed}
        hasUpdate={hasUpdate}
        installing={installing}
        onOpen={onOpen}
        onInstall={onInstall}
        onCancel={onCancel}
      />
    </div>
  );
}

function CardAction({
  installed,
  hasUpdate,
  installing,
  onOpen,
  onInstall,
  onCancel,
}: {
  installed: boolean;
  hasUpdate?: boolean;
  installing?: { pct: number; phase: 'download' | 'install' };
  onOpen: () => void;
  onInstall: () => void;
  onCancel: () => void;
}) {
  if (installing) {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-[62px] text-center">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e3e8e0]">
            <div
              className="h-full rounded-full bg-[#0e5c36] transition-all duration-150"
              style={{ width: `${installing.pct}%` }}
            />
          </div>
          <p className="mt-1 text-[9.5px] font-medium text-[#0e5c36]">
            {installing.phase === 'download' ? `${installing.pct}%` : 'Installing'}
          </p>
        </div>
        <button
          type="button"
          aria-label="Cancel install"
          onClick={onCancel}
          className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (hasUpdate) {
    return (
      <button
        type="button"
        onClick={onInstall}
        className="shrink-0 rounded-full bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white active:scale-95 cursor-pointer flex items-center gap-1"
      >
        <RefreshCw className="h-3 w-3" /> Update
      </button>
    );
  }

  if (installed) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 rounded-full border border-[#b9c4ba] px-4 py-1.5 text-[11.5px] font-semibold text-[#0e5c36] hover:bg-black/5 active:scale-95 cursor-pointer"
      >
        Open
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onInstall}
      className="shrink-0 rounded-full bg-[#0e5c36] hover:bg-[#124b2f] px-4 py-1.5 text-[11.5px] font-semibold text-white active:scale-95 cursor-pointer"
    >
      Install
    </button>
  );
}

function AppDetail({
  app,
  installed,
  installedPkg,
  installing,
  onInstall,
  onCancel,
  onOpen,
  onUninstall,
}: {
  app: AppMeta;
  installed: boolean;
  installedPkg?: AppPackage;
  installing?: { pct: number; phase: 'download' | 'install' };
  onInstall: (id: string) => void;
  onCancel: (id: string) => void;
  onOpen: () => void;
  onUninstall: () => void;
}) {
  const hasUpdate = installedPkg && installedPkg.version !== app.version;

  return (
    <div className="pb-2">
      {/* Hero */}
      <div className="mt-3 flex flex-col items-center text-center">
        <AppIcon id={app.id} px={74} />
        <h2 className="mt-3 text-[19px] font-semibold tracking-tight">{app.name}</h2>
        <p className="mt-0.5 text-[12px] text-[#0e5c36]">{app.developer}</p>
        <p className="mt-1 text-[11.5px] text-[#6e7a72]">{app.tagline}</p>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 rounded-2xl bg-white py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <Stat
          top={
            <span className="flex items-center gap-1 text-[14px] font-semibold">
              {app.rating}
              <Star className="h-3 w-3 fill-[#f5b83d] text-[#f5b83d]" />
            </span>
          }
          bottom={`${app.reviews} reviews*`}
        />
        <Stat
          top={
            <span className="flex items-center gap-1 text-[14px] font-semibold">
              <Download className="h-3.5 w-3.5" />
            </span>
          }
          bottom={`${app.downloads} dl*`}
        />
        <Stat top={<span className="text-[14px] font-semibold">{formatSize(app.sizeMB)}</span>} bottom="Package size" />
      </div>
      <p className="text-[9.5px] text-center text-[#86948a] mt-1 italic">* Demo catalog metrics</p>

      {/* Action button */}
      <div className="mt-3">
        {installing ? (
          <div className="rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e3e8e0]">
                <div
                  className="h-full rounded-full bg-[#0e5c36] transition-all duration-150"
                  style={{ width: `${installing.pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-center text-[11px] font-medium text-[#0e5c36]">
                {installing.phase === 'download'
                  ? `Downloading package… ${installing.pct}%`
                  : 'Installing package on device…'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCancel(app.id)}
              className="text-zinc-500 hover:text-zinc-800 text-[11px] font-semibold px-2 py-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : hasUpdate ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onInstall(app.id)}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-[13.5px] font-semibold text-white active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" /> Update (v{app.version})
            </button>
            <button
              type="button"
              onClick={onOpen}
              className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#b9c4ba] px-4 text-[13px] font-medium text-[#0e5c36] active:scale-95 cursor-pointer"
            >
              Open
            </button>
          </div>
        ) : installed ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onOpen}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#0e5c36] hover:bg-[#124b2f] text-[13.5px] font-semibold text-white active:scale-[0.98] cursor-pointer"
            >
              Open app
            </button>
            <button
              type="button"
              onClick={onUninstall}
              className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#d8b2ae] px-4 text-[13px] font-medium text-[#c0453b] hover:bg-rose-500/10 active:scale-95 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" /> Uninstall
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onInstall(app.id)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0e5c36] hover:bg-[#124b2f] text-[13.5px] font-semibold text-white active:scale-[0.98] cursor-pointer"
          >
            <Download className="h-4 w-4" /> Install
          </button>
        )}
      </div>

      {/* About */}
      <section className="mt-4 rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-[13.5px] font-semibold">About this app</h3>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#4c5850]">{app.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Tag icon={<ShieldCheck className="h-3 w-3" />} label="Sandboxed iframe" />
          <Tag icon={<Package className="h-3 w-3" />} label={`HTML package · v${app.version}`} />
        </div>
      </section>

      <section className="mt-3 rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-[13.5px] font-semibold">What&apos;s new</h3>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#4c5850]">{app.whatsNew}</p>
      </section>

      <section className="mt-3 rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-[13.5px] font-semibold">Package info</h3>
        <div className="mt-2 space-y-2 text-[12px]">
          <InfoRow k="Package" v={app.pkg} />
          <InfoRow k="Version" v={app.version} />
          <InfoRow k="Category" v={app.category} />
          <InfoRow k="Developer" v={app.developer} />
          <InfoRow k="Install target" v="On-device (IndexedDB)" />
        </div>
      </section>
    </div>
  );
}

function Stat({ top, bottom }: { top: React.ReactNode; bottom: string }) {
  return (
    <div className="flex flex-col items-center gap-1 border-r border-[#eef1ec] last:border-0">
      {top}
      <span className="text-[10px] text-[#6e7a72]">{bottom}</span>
    </div>
  );
}

function Tag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-[#e9efe6] px-3 py-1.5 text-[11px] font-medium text-[#33503f]">
      {icon}
      {label}
    </span>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[#6e7a72]">{k}</span>
      <span className="truncate text-right font-medium">{v}</span>
    </div>
  );
}

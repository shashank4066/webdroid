'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cn } from '@/lib/utils';
import { getApp, SYSTEM_APP_IDS, type AppMeta } from '@/lib/apps/catalog';
import { deleteAppPackage, listAppPackages, putAppPackage } from '@/lib/idb';
import { useOS, wallpaperById } from './os/store';
import { AppWindow } from './os/app-window';
import { AppDrawer } from './os/app-drawer';
import { BootSplash } from './os/boot-splash';
import { NavBar, PunchHole, StatusBar, ToastLayer, VolumeOverlay } from './os/chrome';
import { ContextMenu } from './os/context-menu';
import { ErrorBoundary } from './os/error-boundary';
import { HomeScreen } from './os/home-screen';
import { LockScreen } from './os/lock-screen';
import { PlayStore } from './os/play-store';
import { Recents } from './os/recents';
import { SettingsApp } from './os/settings-app';

const SCREEN_W = 360;
const SCREEN_H = 800;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const subscribeNoop = () => () => {};

/**
 * WebDroid Phone — the entire client-side Android-style simulation.
 * Features an adaptive phone frame for desktop and a full-bleed mode for mobile.
 */
export function WebDroidPhone() {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [scale, setScale] = useState(0.9);
  const [isMobile, setIsMobile] = useState(false);
  const [contextId, setContextId] = useState<string | null>(null);

  const booted = useOS((s) => s.booted);
  const locked = useOS((s) => s.locked);
  const screenOff = useOS((s) => s.screenOff);
  const screen = useOS((s) => s.screen);
  const openApps = useOS((s) => s.openApps);
  const activeApp = useOS((s) => s.activeApp);
  const installedIds = useOS((s) => s.installedIds);
  const wallpaper = useOS((s) => s.wallpaper);

  const setBooted = useOS((s) => s.setBooted);
  const setScreen = useOS((s) => s.setScreen);
  const openApp = useOS((s) => s.openApp);
  const closeApp = useOS((s) => s.closeApp);
  const setInstalled = useOS((s) => s.setInstalled);
  const addInstalled = useOS((s) => s.addInstalled);
  const removeInstalled = useOS((s) => s.removeInstalled);
  const showToast = useOS((s) => s.showToast);
  const sleep = useOS((s) => s.sleep);
  const wake = useOS((s) => s.wake);
  const bumpVolume = useOS((s) => s.bumpVolume);

  // ---- Navigation -------------------------------------------------------

  const storeBack = useRef<null | (() => boolean)>(null);
  const registerBack = useCallback((fn: null | (() => boolean)) => {
    storeBack.current = fn;
  }, []);

  const doBack = useCallback(() => {
    const st = useOS.getState();
    if (!st.booted || st.locked || st.screenOff) return;
    if (st.screen !== 'home') {
      st.setScreen('home');
      return;
    }
    if (st.activeApp) {
      if ((st.activeApp === 'droidstore' || st.activeApp === 'playstore') && storeBack.current?.()) {
        return;
      }
      st.closeApp(st.activeApp);
    }
  }, []);

  const goHome = useCallback(() => {
    const st = useOS.getState();
    if (st.activeApp) useOS.setState({ activeApp: null });
    st.setScreen('home');
  }, []);

  const toggleRecents = useCallback(() => {
    const st = useOS.getState();
    st.setScreen(st.screen === 'recents' ? 'home' : 'recents');
  }, []);

  // ---- Effects ------------------------------------------------------------

  // Viewport and responsive scaling
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mobile = w <= 500;
      setIsMobile(mobile);

      if (mobile) {
        setScale(1);
      } else {
        const s = Math.min((h - 32) / (SCREEN_H + 24), (w - 32) / (SCREEN_W + 36), 1.12);
        setScale(Math.max(0.4, s));
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Boot sequence timer (also drives reboots)
  useEffect(() => {
    if (!mounted || booted) return;
    const t = setTimeout(() => setBooted(true), 2400);
    return () => clearTimeout(t);
  }, [mounted, booted, setBooted]);

  // IndexedDB as the single source of truth for installed apps
  useEffect(() => {
    if (!mounted) return;
    listAppPackages()
      .then((pkgs) => {
        const idbIds = pkgs.map((p) => p.id);
        const merged = Array.from(new Set([...SYSTEM_APP_IDS, ...idbIds]));
        setInstalled(merged);
      })
      .catch((err) => {
        console.error('Failed to load packages from IndexedDB:', err);
        setInstalled(SYSTEM_APP_IDS);
      });
  }, [mounted, setInstalled]);

  // Global Escape key = Back
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') doBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted, doBack]);

  // ---- Install / uninstall contract ---------------------------------------

  const installApp = useCallback(
    async (
      id: string,
      onProgress: (pct: number, phase: 'download' | 'install') => void,
      signal?: AbortSignal
    ) => {
      const meta = getApp(id);
      if (!meta?.html) {
        showToast(`Cannot install ${meta?.name ?? id}: package HTML missing`);
        return;
      }

      let pct = 0;
      while (pct < 100) {
        if (signal?.aborted) throw new Error('Installation canceled');
        pct = Math.min(100, pct + 6 + Math.random() * 10);
        onProgress(Math.floor(pct), 'download');
        await delay(50 + Math.random() * 60);
      }

      if (signal?.aborted) throw new Error('Installation canceled');
      onProgress(100, 'install');
      await delay(400);

      if (signal?.aborted) throw new Error('Installation canceled');

      try {
        await putAppPackage({
          id,
          installedAt: Date.now(),
          version: meta.version,
          html: meta.html,
        });
        addInstalled(id);
        showToast(`${meta.name} installed`);
      } catch (err) {
        showToast(`Install failed: ${err instanceof Error ? err.message : 'Storage error'}`);
        throw err;
      }
    },
    [addInstalled, showToast]
  );

  const uninstallApp = useCallback(
    async (id: string) => {
      const meta = getApp(id);
      try {
        await deleteAppPackage(id);
        removeInstalled(id);
        showToast(`${meta?.name ?? 'App'} uninstalled`);
      } catch (err) {
        showToast(`Uninstall failed: ${err instanceof Error ? err.message : 'Storage error'}`);
      }
    },
    [removeInstalled, showToast]
  );

  // ---- Hardware buttons -----------------------------------------------------

  const powerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const powerLong = useRef(false);

  const onPowerDown = () => {
    powerLong.current = false;
    powerTimer.current = setTimeout(() => {
      powerLong.current = true;
      // Reboot OS
      useOS.setState({
        openApps: [],
        activeApp: null,
        screen: 'home',
        locked: true,
        screenOff: false,
        booted: false,
        toastText: 'Rebooting WebDroid OS…',
      });
    }, 800);
  };

  const clearPowerTimer = () => {
    if (powerTimer.current) {
      clearTimeout(powerTimer.current);
      powerTimer.current = null;
    }
  };

  const onPowerUp = () => {
    clearPowerTimer();
    if (powerLong.current) return;
    const st = useOS.getState();
    if (st.screenOff) wake();
    else sleep();
  };

  const onPowerKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const st = useOS.getState();
      if (st.screenOff) wake();
      else sleep();
    }
  };

  // ---- Launcher data ----------------------------------------------------------

  const installedApps = installedIds
    .map((id) => getApp(id))
    .filter((a): a is AppMeta => Boolean(a));
  const userApps = installedApps.filter((a) => !a.system);
  const dockIds = ['droidstore', 'settings', ...userApps.slice(-2).map((a) => a.id)];
  const dockApps = dockIds.map((id) => getApp(id)).filter((a): a is AppMeta => Boolean(a));
  const gridApps = installedApps.filter((a) => !dockIds.includes(a.id));

  const awake = mounted && booted && !screenOff;
  const showChrome = awake && !locked;

  return (
    <ErrorBoundary fallbackTitle="WebDroid System Error">
      <div className="fixed inset-0 grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_32%,#1c211e,#0a0d0b_58%,#040605)] select-none">
        <div style={isMobile ? { width: '100%', height: '100%' } : { transform: `scale(${scale})` }}>
          {/* Device wrapper */}
          <div className={cn('relative', isMobile ? 'h-full w-full' : '')}>
            {/* Physical hardware keys for desktop mockup */}
            {!isMobile && (
              <>
                <div className="absolute -left-[14px] top-[120px] flex flex-col gap-7">
                  <button
                    type="button"
                    tabIndex={0}
                    aria-label="Volume up"
                    onClick={() => bumpVolume(10)}
                    className="h-12 w-[4px] cursor-pointer rounded-l-md bg-zinc-700 hover:bg-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <button
                    type="button"
                    tabIndex={0}
                    aria-label="Volume down"
                    onClick={() => bumpVolume(-10)}
                    className="h-12 w-[4px] cursor-pointer rounded-l-md bg-zinc-700 hover:bg-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <button
                  type="button"
                  tabIndex={0}
                  aria-label="Power button (Click to sleep/wake, hold to reboot)"
                  onPointerDown={onPowerDown}
                  onPointerUp={onPowerUp}
                  onPointerCancel={clearPowerTimer}
                  onPointerLeave={(e: ReactPointerEvent) => {
                    void e;
                    clearPowerTimer();
                  }}
                  onKeyDown={onPowerKeyDown}
                  className="absolute -right-[14px] top-[170px] h-16 w-[4px] cursor-pointer rounded-r-md bg-zinc-700 hover:bg-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </>
            )}

            {/* Frame */}
            <div
              className={cn(
                'relative overflow-hidden bg-zinc-950',
                isMobile
                  ? 'h-full w-full'
                  : 'rounded-[3rem] border-[10px] border-zinc-800 shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_50px_120px_-30px_rgba(0,0,0,0.95),inset_0_0_2px_rgba(255,255,255,0.08)]'
              )}
            >
              {/* Earpiece */}
              {!isMobile && (
                <div className="absolute left-1/2 top-[1px] h-[4px] w-20 -translate-x-1/2 rounded-full bg-zinc-800/80 z-50" />
              )}

              {/* Screen viewport */}
              <div
                className={cn('relative overflow-hidden bg-black', isMobile ? 'h-full w-full' : '')}
                style={isMobile ? undefined : { width: SCREEN_W, height: SCREEN_H, borderRadius: '2.5rem' }}
              >
                {/* Wallpaper */}
                <div className="absolute inset-0" style={{ background: wallpaperById(wallpaper).css }}>
                  <div className="absolute -left-14 top-24 h-56 w-56 rounded-full bg-white/[0.05] blur-2xl pointer-events-none" />
                  <div className="absolute -right-16 top-64 h-64 w-64 rounded-full bg-emerald-300/[0.07] blur-2xl pointer-events-none" />
                  <div className="absolute -left-10 bottom-16 h-52 w-52 rounded-full bg-black/30 blur-2xl pointer-events-none" />
                </div>

                {mounted && (
                  <>
                    {/* Home screen (base launcher layer) */}
                    {awake && !locked && (
                      <HomeScreen
                        gridApps={gridApps}
                        dockApps={dockApps}
                        onOpen={openApp}
                        onLongPress={setContextId}
                        onDrawer={() => setScreen('drawer')}
                      />
                    )}

                    {/* Open app windows */}
                    {openApps.map((id) => {
                      const active = id === activeApp && screen === 'home';
                      return (
                        <div
                          key={id}
                          className={cn(
                            'absolute inset-x-0 bottom-[44px] top-[26px]',
                            active ? 'z-20 wd-fade' : 'invisible z-10 pointer-events-none'
                          )}
                        >
                          {id === 'droidstore' || id === 'playstore' ? (
                            <PlayStore
                              installedIds={installedIds}
                              onOpen={openApp}
                              onInstall={installApp}
                              onUninstall={uninstallApp}
                              registerBack={registerBack}
                            />
                          ) : id === 'settings' ? (
                            <SettingsApp onOpenStore={() => openApp('droidstore')} />
                          ) : (
                            <AppWindow appId={id} active={active} onBack={doBack} />
                          )}
                        </div>
                      );
                    })}

                    {/* App drawer */}
                    {awake && !locked && screen === 'drawer' && (
                      <AppDrawer
                        apps={installedApps}
                        onOpen={openApp}
                        onLongPress={setContextId}
                        onClose={() => setScreen('home')}
                      />
                    )}

                    {/* Recents multi-tasking view */}
                    {awake && !locked && screen === 'recents' && (
                      <Recents
                        openIds={openApps}
                        onFocus={(id) => openApp(id)}
                        onCloseApp={closeApp}
                        onClearAll={() => {
                          openApps.forEach((id) => closeApp(id));
                        }}
                        onClose={() => setScreen('home')}
                      />
                    )}

                    {/* Lock screen */}
                    {awake && locked && <LockScreen scale={isMobile ? 1 : scale} />}

                    {/* Boot splash */}
                    {!booted && <BootSplash />}

                    {/* Sleep screen blackout */}
                    {screenOff && <div className="absolute inset-0 z-[68] bg-black" />}

                    {/* System status & chrome */}
                    {awake && <StatusBar />}
                    {showChrome && (
                      <NavBar onBack={doBack} onHome={goHome} onRecents={toggleRecents} />
                    )}

                    {/* Toast notifications layer: visible whenever awake or rebooting */}
                    {(awake || !booted) && <ToastLayer />}

                    {/* Volume overlay */}
                    {showChrome && <VolumeOverlay />}

                    {/* Long-press context menu */}
                    {showChrome && (
                      <ContextMenu
                        target={contextId}
                        onClose={() => setContextId(null)}
                        onOpen={openApp}
                        onUninstall={uninstallApp}
                      />
                    )}
                  </>
                )}

                <PunchHole />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

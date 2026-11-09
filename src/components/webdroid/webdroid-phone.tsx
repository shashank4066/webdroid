'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cn } from '@/lib/utils';
import { getApp, SYSTEM_APP_IDS, type AppMeta } from '@/lib/apps/catalog';
import { deleteAppPackage, listAppPackageIds, putAppPackage } from '@/lib/idb';
import { WALLPAPERS } from './os/store';
import { useOS } from './os/store';
import { AppWindow } from './os/app-window';
import { AppDrawer } from './os/app-drawer';
import { BootSplash } from './os/boot-splash';
import { NavBar, PunchHole, StatusBar, ToastLayer, VolumeOverlay } from './os/chrome';
import { ContextMenu } from './os/context-menu';
import { HomeScreen } from './os/home-screen';
import { LockScreen } from './os/lock-screen';
import { PlayStore } from './os/play-store';
import { Recents } from './os/recents';
import { SettingsApp } from './os/settings-app';

const SCREEN_W = 360;
const SCREEN_H = 800;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const subscribeNoop = () => () => {};

function wallCssOf(id: string): string {
  return (WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0]).css;
}

/**
 * WebDroid Phone — the entire experience. The page shows nothing but the
 * phone: boot animation, lock screen, home launcher, local Play Store and
 * installed apps, all inside the device frame.
 */
export function WebDroidPhone() {
  // Hydration-safe mount gate (no setState-in-effect)
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [scale, setScale] = useState(0.9);
  const [battery, setBattery] = useState(84);
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

  const playStoreBack = useRef<null | (() => boolean)>(null);
  const registerBack = useCallback((fn: null | (() => boolean)) => {
    playStoreBack.current = fn;
  }, []);

  const doBack = useCallback(() => {
    const st = useOS.getState();
    if (!st.booted || st.locked || st.screenOff) return;
    if (st.screen !== 'home') {
      st.setScreen('home');
      return;
    }
    if (st.activeApp) {
      if (st.activeApp === 'playstore' && playStoreBack.current?.()) return;
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

  // Fit-to-viewport scaling
  useEffect(() => {
    const update = () => {
      const s = Math.min(
        (window.innerHeight - 28) / (SCREEN_H + 20),
        (window.innerWidth - 28) / (SCREEN_W + 20),
        1.12
      );
      setScale(Math.max(0.4, s));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Boot sequence timer (also drives reboots)
  useEffect(() => {
    if (!mounted || booted) return;
    const t = setTimeout(() => setBooted(true), 2600);
    return () => clearTimeout(t);
  }, [mounted, booted, setBooted]);

  // Battery drain
  useEffect(() => {
    if (!mounted) return;
    const t = setInterval(() => setBattery((b) => Math.max(8, b - 1)), 90000);
    return () => clearInterval(t);
  }, [mounted]);

  // Gentle re-render ticker so launcher clocks stay fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!mounted) return;
    const t = setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, [mounted]);

  // Reconcile installed packages with on-device IndexedDB storage
  useEffect(() => {
    if (!mounted) return;
    listAppPackageIds()
      .then((ids) => {
        const merged = Array.from(
          new Set([...useOS.getState().installedIds, ...ids, ...SYSTEM_APP_IDS])
        );
        setInstalled(merged);
      })
      .catch(() => {
        setInstalled(
          Array.from(new Set([...useOS.getState().installedIds, ...SYSTEM_APP_IDS]))
        );
      });
  }, [mounted, setInstalled]);

  // Escape key = Back
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') doBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted, doBack]);

  // ---- Install / uninstall (Play Store contract) ---------------------------

  const installApp = useCallback(
    async (id: string, onProgress: (pct: number, phase: 'download' | 'install') => void) => {
      const meta = getApp(id);
      if (!meta?.html) return;
      let pct = 0;
      while (pct < 100) {
        pct = Math.min(100, pct + 4 + Math.random() * 9);
        onProgress(Math.floor(pct), 'download');
        await delay(80 + Math.random() * 80);
      }
      onProgress(100, 'install');
      await delay(750);
      await putAppPackage({
        id,
        installedAt: Date.now(),
        version: meta.version,
        html: meta.html,
      });
      addInstalled(id);
      showToast(`${meta.name} installed`);
    },
    [addInstalled, showToast]
  );

  const uninstallApp = useCallback(
    (id: string) => {
      deleteAppPackage(id)
        .catch(() => undefined)
        .finally(() => {
          removeInstalled(id);
          showToast(`${getApp(id)?.name ?? 'App'} uninstalled`);
        });
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
      // Reboot
      useOS.setState({
        openApps: [],
        activeApp: null,
        screen: 'home',
        locked: true,
        screenOff: false,
        booted: false,
        toastText: null,
      });
      showToast('Rebooting');
    }, 800);
  };
  const onPowerUp = () => {
    if (powerTimer.current) clearTimeout(powerTimer.current);
    if (powerLong.current) return;
    const st = useOS.getState();
    if (st.screenOff) wake();
    else sleep();
  };

  const onPowerLeave = (e: ReactPointerEvent) => {
    void e;
    if (powerTimer.current) clearTimeout(powerTimer.current);
  };

  // ---- Launcher data ----------------------------------------------------------

  const installedApps = installedIds
    .map((id) => getApp(id))
    .filter((a): a is AppMeta => Boolean(a));
  const userApps = installedApps.filter((a) => !a.system);
  const dockIds = ['playstore', 'settings', ...userApps.slice(-2).map((a) => a.id)];
  const dockApps = dockIds.map((id) => getApp(id)).filter((a): a is AppMeta => Boolean(a));
  const gridApps = installedApps.filter((a) => !dockIds.includes(a.id));

  const awake = mounted && booted && !screenOff;
  const showChrome = awake && !locked;

  return (
    <div className="fixed inset-0 grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_32%,#1c211e,#0a0d0b_58%,#040605)]">
      <div style={{ transform: `scale(${scale})` }}>
        {/* Device */}
        <div className="relative">
          {/* Volume keys */}
          <div className="absolute -left-[14px] top-[120px] flex flex-col gap-7">
            <button
              type="button"
              aria-label="Volume up"
              onClick={() => bumpVolume(10)}
              className="h-12 w-[4px] cursor-pointer rounded-l-md bg-zinc-700 hover:bg-zinc-600"
            />
            <button
              type="button"
              aria-label="Volume down"
              onClick={() => bumpVolume(-10)}
              className="h-12 w-[4px] cursor-pointer rounded-l-md bg-zinc-700 hover:bg-zinc-600"
            />
          </div>
          {/* Power key: click = sleep/wake, hold = reboot */}
          <button
            type="button"
            aria-label="Power (click: sleep, hold: reboot)"
            onPointerDown={onPowerDown}
            onPointerUp={onPowerUp}
            onPointerLeave={onPowerLeave}
            className="absolute -right-[14px] top-[170px] h-16 w-[4px] cursor-pointer rounded-r-md bg-zinc-700 hover:bg-zinc-600"
          />

          {/* Frame */}
          <div className="relative rounded-[3rem] border-[10px] border-zinc-800 bg-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_50px_120px_-30px_rgba(0,0,0,0.95),inset_0_0_2px_rgba(255,255,255,0.08)]">
            {/* Earpiece */}
            <div className="absolute left-1/2 top-[1px] h-[4px] w-20 -translate-x-1/2 rounded-full bg-zinc-800/80" />

            {/* Screen */}
            <div
              className="relative overflow-hidden bg-black"
              style={{ width: SCREEN_W, height: SCREEN_H, borderRadius: '2.5rem' }}
            >
              {/* Wallpaper */}
              <div className="absolute inset-0" style={{ background: wallCssOf(wallpaper) }}>
                <div className="absolute -left-14 top-24 h-56 w-56 rounded-full bg-white/[0.05] blur-2xl" />
                <div className="absolute -right-16 top-64 h-64 w-64 rounded-full bg-emerald-300/[0.07] blur-2xl" />
                <div className="absolute -left-10 bottom-16 h-52 w-52 rounded-full bg-black/30 blur-2xl" />
              </div>

              {mounted && (
                <>
                  {/* Home (base layer) */}
                  {awake && !locked && (
                    <HomeScreen
                      gridApps={gridApps}
                      dockApps={dockApps}
                      onOpen={openApp}
                      onLongPress={setContextId}
                      onDrawer={() => setScreen('drawer')}
                    />
                  )}

                  {/* Open app windows (kept mounted so app state survives) */}
                  {openApps.map((id) => {
                    const active = id === activeApp && screen === 'home';
                    return (
                      <div
                        key={id}
                        className={cn(
                          'absolute inset-x-0 bottom-[44px] top-[26px]',
                          active ? 'z-20 wd-fade' : 'invisible z-10'
                        )}
                      >
                        {id === 'playstore' ? (
                          <PlayStore
                            installedIds={installedIds}
                            onOpen={openApp}
                            onInstall={installApp}
                            onUninstall={uninstallApp}
                            registerBack={registerBack}
                          />
                        ) : id === 'settings' ? (
                          <SettingsApp onOpenStore={() => openApp('playstore')} />
                        ) : (
                          <AppWindow appId={id} />
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

                  {/* Recents */}
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
                  {awake && locked && <LockScreen />}

                  {/* Boot splash */}
                  {!booted && <BootSplash />}

                  {/* Sleep */}
                  {screenOff && <div className="absolute inset-0 z-[68] bg-black" />}

                  {/* System chrome */}
                  {awake && <StatusBar battery={battery} />}
                  {showChrome && (
                    <NavBar onBack={doBack} onHome={goHome} onRecents={toggleRecents} />
                  )}
                  {showChrome && <ToastLayer />}
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
  );
}

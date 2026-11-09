'use client';

import { useEffect, useState } from 'react';

interface BatteryManager {
  level: number;
  charging: boolean;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

const STORAGE_KEY = 'webdroid.battery_level';

export function useBattery(): { level: number; charging: boolean } {
  const [state, setState] = useState<{ level: number; charging: boolean }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed >= 5 && parsed <= 100) {
            return { level: parsed, charging: false };
          }
        }
      } catch {}
    }
    return { level: 85, charging: false };
  });

  useEffect(() => {
    let unmounted = false;
    const nav = typeof navigator !== 'undefined' ? (navigator as NavigatorWithBattery) : null;

    if (nav?.getBattery) {
      nav.getBattery().then((battery) => {
        if (unmounted) return;
        const update = () => {
          const lvl = Math.round(battery.level * 100);
          setState({ level: lvl, charging: battery.charging });
          try {
            localStorage.setItem(STORAGE_KEY, String(lvl));
          } catch {}
        };
        update();
        battery.addEventListener('levelchange', update);
        battery.addEventListener('chargingchange', update);
      }).catch(() => {
        // Fallback to simulated slow drain
      });
    }

    // Simulated gentle drain interval if native API is absent or unchanging
    const drainInterval = setInterval(() => {
      setState((prev) => {
        if (prev.charging) return prev;
        const next = Math.max(5, prev.level - 1);
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
        } catch {}
        return { ...prev, level: next };
      });
    }, 120000);

    return () => {
      unmounted = true;
      clearInterval(drainInterval);
    };
  }, []);

  return state;
}


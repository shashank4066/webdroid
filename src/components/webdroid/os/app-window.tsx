'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getApp } from '@/lib/apps/catalog';
import { getAppPackage } from '@/lib/idb';

/**
 * Renders an installed app package inside a sandboxed same-origin iframe.
 * The package HTML is read from IndexedDB — the app was really "stored"
 * on the device at install time.
 */
export function AppWindow({ appId }: { appId: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const meta = getApp(appId);

  useEffect(() => {
    let alive = true;
    getAppPackage(appId)
      .then((pkg) => {
        if (!alive) return;
        setHtml(pkg?.html ?? meta?.html ?? null);
      })
      .catch(() => {
        if (alive) setHtml(meta?.html ?? null);
      });
    return () => {
      alive = false;
    };
  }, [appId, meta]);

  if (!html) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#0b0f0d] text-emerald-300">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-[12px] text-white/60">Loading package…</p>
      </div>
    );
  }

  return (
    <iframe
      title={meta?.name ?? appId}
      srcDoc={html}
      className="h-full w-full border-0 bg-black"
      sandbox="allow-scripts allow-same-origin allow-pointer-lock"
    />
  );
}

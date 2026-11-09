'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getApp } from '@/lib/apps/catalog';
import {
  getAppPackage,
  getAppStorageMap,
  removeAppStorageItem,
  setAppStorageItem,
} from '@/lib/idb';
import { ErrorBoundary } from './error-boundary';
import { useOS } from './store';

interface AppWindowProps {
  appId: string;
  active: boolean;
  onBack?: () => void;
}

/**
 * Injects an isolated storage bridge and lifecycle dispatcher into the
 * sandboxed iframe before any application code executes.
 */
function injectBridgeScript(rawHtml: string, appId: string, initialStore: Record<string, string>): string {
  const serialized = JSON.stringify(initialStore).replace(/</g, '\\u003c');
  const bridgeScript = `
<script id="__wd_bridge">
(function() {
  const appId = ${JSON.stringify(appId)};
  const memoryStore = ${serialized};

  // Sandboxed local storage polyfill over postMessage
  const storagePolyfill = {
    getItem: function(k) {
      return Object.prototype.hasOwnProperty.call(memoryStore, k) ? memoryStore[k] : null;
    },
    setItem: function(k, v) {
      const val = String(v);
      memoryStore[k] = val;
      try {
        window.parent.postMessage({ type: 'wd:storage:set', appId: appId, key: String(k), value: val }, '*');
      } catch (e) {}
    },
    removeItem: function(k) {
      delete memoryStore[k];
      try {
        window.parent.postMessage({ type: 'wd:storage:remove', appId: appId, key: String(k) }, '*');
      } catch (e) {}
    },
    clear: function() {
      for (const k in memoryStore) {
        delete memoryStore[k];
      }
      try {
        window.parent.postMessage({ type: 'wd:storage:clear', appId: appId }, '*');
      } catch (e) {}
    },
    key: function(i) {
      const keys = Object.keys(memoryStore);
      return keys[i] !== undefined ? keys[i] : null;
    },
    get length() {
      return Object.keys(memoryStore).length;
    }
  };

  try {
    Object.defineProperty(window, 'localStorage', {
      value: storagePolyfill,
      configurable: true,
      writable: false,
    });
  } catch (e) {
    try { window.localStorage = storagePolyfill; } catch (err) {}
  }

  // Forward Escape key to OS parent for Back navigation
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      try {
        window.parent.postMessage({ type: 'wd:back' }, '*');
      } catch (err) {}
    }
  }, true);
})();
</script>
`;

  // Inject at the very start of <head> or right before <html>/<body>
  if (rawHtml.includes('<head>')) {
    return rawHtml.replace('<head>', '<head>' + bridgeScript);
  }
  return bridgeScript + rawHtml;
}

/**
 * Renders an installed app package inside a tightly sandboxed iframe without
 * `allow-same-origin`.
 *
 * Apps have no access to the parent window, parent cookies, parent IndexedDB,
 * or host localStorage. Storage is securely proxied over a postMessage bridge
 * and persisted per-app in IndexedDB.
 */
export function AppWindow({ appId, active, onBack }: AppWindowProps) {
  const [packageHtml, setPackageHtml] = useState<string | null>(null);
  const [storageMap, setStorageMap] = useState<Record<string, string> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const volume = useOS((s) => s.volume);

  const meta = getApp(appId);

  // Load package and isolated app storage
  useEffect(() => {
    let alive = true;

    Promise.all([
      getAppPackage(appId).then((pkg) => pkg?.html ?? meta?.html ?? null),
      getAppStorageMap(appId).catch(() => ({})),
    ])
      .then(([html, store]) => {
        if (!alive) return;
        setPackageHtml(html);
        setStorageMap(store);
      })
      .catch(() => {
        if (alive) {
          setPackageHtml(meta?.html ?? null);
          setStorageMap({});
        }
      });

    return () => {
      alive = false;
    };
  }, [appId, meta]);

  // Handle postMessage storage bridge and OS signals
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'wd:storage:set' && data.appId === appId && typeof data.key === 'string') {
        setAppStorageItem(appId, data.key, String(data.value)).catch(console.error);
      } else if (data.type === 'wd:storage:remove' && data.appId === appId && typeof data.key === 'string') {
        removeAppStorageItem(appId, data.key).catch(console.error);
      } else if (data.type === 'wd:back') {
        onBack?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [appId, onBack]);

  // Forward active / pause state to child iframe (e.g. stop v86 or audio)
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    try {
      win.postMessage({ type: active ? 'wd:resume' : 'wd:pause' }, '*');
    } catch {}
  }, [active]);

  // Forward volume adjustments to child iframe
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    try {
      win.postMessage({ type: 'wd:volume', volume }, '*');
    } catch {}
  }, [volume]);

  const preparedHtml = useMemo(() => {
    if (!packageHtml || !storageMap) return null;
    return injectBridgeScript(packageHtml, appId, storageMap);
  }, [packageHtml, storageMap, appId]);

  if (!preparedHtml) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#0b0f0d] text-emerald-300">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-[12px] text-white/60">Launching {meta?.name ?? 'app'}…</p>
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackTitle={`Error in ${meta?.name ?? 'App'}`}>
      <iframe
        ref={iframeRef}
        title={meta?.name ?? appId}
        srcDoc={preparedHtml}
        className="h-full w-full border-0 bg-black"
        // Intentionally omit allow-same-origin: enforces true isolation and prevents host DOM tampering
        sandbox="allow-scripts allow-pointer-lock"
      />
    </ErrorBoundary>
  );
}

'use client';

/**
 * IndexedDB layer for WebDroid OS.
 *
 * Provides persistent, on-device storage for:
 *  - Installed app packages (HTML, version, installedAt)
 *  - Per-app isolated storage for sandboxed iframes (postMessage bridge)
 *  - General OS key-value pairs
 */

const DB_NAME = 'webdroid';
const DB_VERSION = 3;

export interface AppPackage {
  id: string;
  installedAt: number;
  version: string;
  html: string;
}

export interface AppStorageEntry {
  id: string; // `${appId}:${key}`
  appId: string;
  key: string;
  value: string;
}

export interface KvRow<T = unknown> {
  key: string;
  value: T;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available in this environment'));
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onblocked = () => {
      console.warn('WebDroid IndexedDB upgrade blocked by another connection');
    };

    req.onupgradeneeded = () => {
      const db = req.result;

      // Legacy stores from earlier prototypes
      for (const legacy of ['media', 'snapshots', 'settings']) {
        if (db.objectStoreNames.contains(legacy)) {
          try {
            db.deleteObjectStore(legacy);
          } catch {
            /* ignore */
          }
        }
      }

      if (!db.objectStoreNames.contains('packages')) {
        db.createObjectStore('packages', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('kv')) {
        db.createObjectStore('kv', { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains('app_storage')) {
        const appStore = db.createObjectStore('app_storage', { keyPath: 'id' });
        appStore.createIndex('by_app', 'appId', { unique: false });
      }
    };

    req.onsuccess = () => {
      const db = req.result;

      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };

      db.onerror = (e) => {
        console.error('IndexedDB error:', e);
      };

      resolve(db);
    };

    req.onerror = () => {
      dbPromise = null;
      reject(req.error ?? new Error('Failed to open IndexedDB'));
    };
  });

  return dbPromise;
}

function tx<T>(
  storeName: 'packages' | 'kv' | 'app_storage',
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | undefined> {
  return getDb().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        let request: IDBRequest<T> | void;

        try {
          request = run(store);
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
          return;
        }

        transaction.oncomplete = () =>
          resolve(request && 'result' in request ? (request.result as T) : undefined);
        transaction.onerror = () =>
          reject(transaction.error ?? new Error('IndexedDB transaction failed'));
        transaction.onabort = () =>
          reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
      })
  );
}

// ---------------------------------------------------------------------------
// Installed app packages
// ---------------------------------------------------------------------------

export async function getAppPackage(id: string): Promise<AppPackage | undefined> {
  return tx<AppPackage>('packages', 'readonly', (s) => s.get(id)) as Promise<
    AppPackage | undefined
  >;
}

export async function putAppPackage(pkg: AppPackage): Promise<void> {
  await tx('packages', 'readwrite', (s) => s.put(pkg));
}

export async function deleteAppPackage(id: string): Promise<void> {
  await tx('packages', 'readwrite', (s) => s.delete(id));
}

export async function listAppPackages(): Promise<AppPackage[]> {
  const rows = (await tx<AppPackage[]>('packages', 'readonly', (s) => s.getAll())) ?? [];
  return rows;
}

export async function listAppPackageIds(): Promise<string[]> {
  const rows = await listAppPackages();
  return rows.map((r) => r.id);
}

// ---------------------------------------------------------------------------
// Isolated App Storage (Bridge for Sandboxed iframes)
// ---------------------------------------------------------------------------

export async function getAppStorageMap(appId: string): Promise<Record<string, string>> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('app_storage', 'readonly');
    const store = transaction.objectStore('app_storage');
    const index = store.index('by_app');
    const req = index.getAll(IDBKeyRange.only(appId));

    req.onsuccess = () => {
      const records = req.result as AppStorageEntry[];
      const map: Record<string, string> = {};
      for (const item of records) {
        map[item.key] = item.value;
      }
      resolve(map);
    };
    req.onerror = () => reject(req.error ?? new Error('Failed to read app storage'));
  });
}

export async function setAppStorageItem(appId: string, key: string, value: string): Promise<void> {
  const entry: AppStorageEntry = {
    id: `${appId}:${key}`,
    appId,
    key,
    value,
  };
  await tx('app_storage', 'readwrite', (s) => s.put(entry));
}

export async function removeAppStorageItem(appId: string, key: string): Promise<void> {
  await tx('app_storage', 'readwrite', (s) => s.delete(`${appId}:${key}`));
}

// ---------------------------------------------------------------------------
// OS Settings (KV)
// ---------------------------------------------------------------------------

export async function getKv<T>(key: string, fallback: T): Promise<T> {
  try {
    const row = await tx<KvRow<T>>('kv', 'readonly', (s) => s.get(key));
    return row ? (row.value as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function setKv<T>(key: string, value: T): Promise<void> {
  await tx('kv', 'readwrite', (s) => s.put({ key, value }));
}

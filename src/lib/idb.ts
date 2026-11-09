'use client';

/**
 * IndexedDB layer for WebDroid OS.
 *
 * The phone is fully local: installed app packages (the app's HTML bundle)
 * live on-device in the `packages` store, and small OS settings live in `kv`.
 * Nothing ever touches a server — this is what makes the phone work offline.
 */

const DB_NAME = 'webdroid';
const DB_VERSION = 2;

export interface AppPackage {
  id: string;
  installedAt: number;
  version: string;
  html: string;
}

export interface KvRow<T = unknown> {
  key: string;
  value: T;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      // Legacy stores from the old emulator UI — drop them.
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
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB'));
  });
}

function tx<T>(
  storeName: 'packages' | 'kv',
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | undefined> {
  return openDb().then(
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

export async function listAppPackageIds(): Promise<string[]> {
  const rows = (await tx<AppPackage[]>('packages', 'readonly', (s) => s.getAll())) ?? [];
  return rows.map((r) => r.id);
}

// ---------------------------------------------------------------------------
// Key/value settings
// ---------------------------------------------------------------------------

export async function getKv<T>(key: string): Promise<T | undefined> {
  const row = await tx<KvRow<T>>('kv', 'readonly', (s) => s.get(key));
  return row?.value;
}

export async function setKv<T>(key: string, value: T): Promise<void> {
  await tx('kv', 'readwrite', (s) => s.put({ key, value } satisfies KvRow<T>));
}

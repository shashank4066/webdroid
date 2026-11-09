import test from 'node:test';
import assert from 'node:assert/strict';

test('idb - graceful failure in node environment without indexedDB', async () => {
  const { getAppPackage, listAppPackageIds, getAppStorageMap } = await import('../src/lib/idb.ts');

  await assert.rejects(
    async () => {
      await getAppPackage('test-app');
    },
    {
      message: /IndexedDB is not available/
    }
  );

  await assert.rejects(
    async () => {
      await listAppPackageIds();
    },
    {
      message: /IndexedDB is not available/
    }
  );

  await assert.rejects(
    async () => {
      await getAppStorageMap('test-app');
    },
    {
      message: /IndexedDB is not available/
    }
  );
});

import test from 'node:test';
import assert from 'node:assert/strict';

test('catalog - system app identifiers', async () => {
  const { SYSTEM_APP_IDS, isSystemApp } = await import('../src/lib/apps/catalog.ts');
  assert.ok(Array.isArray(SYSTEM_APP_IDS));
  assert.ok(SYSTEM_APP_IDS.includes('droidstore'));
  assert.ok(SYSTEM_APP_IDS.includes('settings'));
  assert.equal(isSystemApp('droidstore'), true);
  assert.equal(isSystemApp('settings'), true);
  assert.equal(isSystemApp('snake'), false);
});

test('catalog - getApp lookup', async () => {
  const { getApp } = await import('../src/lib/apps/catalog.ts');
  const store = getApp('droidstore');
  assert.ok(store);
  assert.equal(store.name, 'Droid Store');

  const snake = getApp('snake');
  assert.ok(snake);
  assert.equal(snake.category, 'Games');
});

test('catalog - formatSize', async () => {
  const { formatSize } = await import('../src/lib/apps/catalog.ts');
  assert.equal(formatSize(5), '5 MB');
  assert.equal(formatSize(1024), '1.0 GB');
});


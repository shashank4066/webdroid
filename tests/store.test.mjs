import test from 'node:test';
import assert from 'node:assert/strict';

test('wallpapers - catalog and fallback lookup', async () => {
  const { WALLPAPERS, wallpaperById } = await import('../src/components/webdroid/os/store.ts');
  assert.ok(Array.isArray(WALLPAPERS));
  assert.ok(WALLPAPERS.length >= 4);

  const aurora = wallpaperById('aurora');
  assert.equal(aurora.id, 'aurora');
  assert.ok(aurora.css.includes('linear-gradient'));

  const fallback = wallpaperById('non-existent');
  assert.equal(fallback.id, WALLPAPERS[0].id);
});


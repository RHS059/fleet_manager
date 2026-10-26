import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareTemplate } from '../src/prepare-template.js';

test('backdrop resolves within the app at clean and trailing-slash portfolio URLs', () => {
  const html = prepareTemplate("background:url('ambient.webp')", '/apps/fleet-management/');
  const asset = html.match(/url\('([^']+)'\)/)[1];
  for (const page of ['https://www.reidhslaughter.com/apps/fleet-management', 'https://www.reidhslaughter.com/apps/fleet-management/']) {
    assert.equal(new URL(asset, page).href, 'https://www.reidhslaughter.com/apps/fleet-management/ambient.webp');
  }
  assert.equal(prepareTemplate("url('ambient.webp')", './'), "url('./ambient.webp')");
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const localRoads = JSON.parse(fs.readFileSync(new URL('../public/roads.json', import.meta.url)));
const regionalRoads = JSON.parse(fs.readFileSync(new URL('../public/roads-regional.json', import.meta.url)));
const source = fs.readFileSync(new URL('../src/FleetLogic.js', import.meta.url), 'utf8');
const FleetLogic = vm.runInNewContext(source.replace(/^import .*;$/gm, '').replace('export default class FleetLogic', 'class FleetLogic') + '\nFleetLogic', {
  StreamableLogic: class {}, localRoads, regionalRoads,
});

test('bundled road snapshot contains valid regional geometry', () => {
  assert.ok(regionalRoads.length > 2000);
  for (const [kind, ...points] of regionalRoads) {
    assert.ok(Number.isInteger(kind) && kind >= 0 && kind <= 4);
    assert.ok(points.length >= 2);
    for (const point of points) {
      assert.equal(point.length, 2);
      assert.ok(point.every(Number.isInteger));
    }
  }
});

test('road loading needs no browser or network and preserves regional coverage', async () => {
  const app = new FleetLogic();
  const roads = await app.loadRoads();
  assert.equal(await app.loadRoads(), roads);
  assert.ok(roads.length > 12000, 'regional roads must not silently become the 1,098-node downtown fallback');
  const longitudes = roads.map(n => -119.81 + n.x / 1e5);
  const latitudes = roads.map(n => 39.53 + n.y / 1e5);
  assert.ok(Math.min(...longitudes) < -119.98 && Math.max(...longitudes) > -119.70);
  assert.ok(Math.min(...latitudes) < 39.42 && Math.max(...latitudes) > 39.65);
  for (const node of roads) {
    for (const adjacent of node.adj) {
      assert.notEqual(adjacent, node);
      assert.ok(adjacent.adj.includes(node));
    }
  }
});

test('satellite depots stay in their own regions and connect to the main road network', async () => {
  const app = new FleetLogic();
  await app.loadRoads();
  app.initDepot();
  app.dijkstraFromBase();
  assert.equal(app.bases.length, 4);
  const expected = {
    'Downtown yard': [-119.8079, 39.5280],
    'Sparks DC yard': [-119.7120, 39.5300],
    'Airport cargo yard': [-119.7720, 39.5060],
    'North Valleys yard': [-119.8330, 39.5960],
  };
  for (const yard of app.bases) {
    const anchor = app.fromLngLat(...expected[yard.name]);
    assert.ok(Math.hypot(yard.m.x - anchor.x, yard.m.y - anchor.y) < 500, `${yard.name} is near its real regional anchor`);
    assert.ok(Number.isFinite(app.baseTree.dist[yard.node.i]), `${yard.name} is reachable`);
  }
  assert.ok(app.roads.filter(n => Number.isFinite(app.baseTree.dist[n.i])).length > 12000);
});

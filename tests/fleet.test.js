import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the actual simulation class without loading browser graphics dependencies.
const source = fs.readFileSync(new URL('../src/FleetLogic.js', import.meta.url), 'utf8');
const FleetLogic = vm.runInNewContext(source.replace(/^import .*;$/gm, '').replace('export default class FleetLogic', 'class FleetLogic') + '\nFleetLogic', {
  StreamableLogic: class { constructor(props = {}) { this.props = props; } },
});

test('fleet is deterministic, cached and has 2,400 unique vehicles', () => {
  const app = new FleetLogic();
  const fleet = app.fleet();
  assert.equal(fleet.length, 2400);
  assert.equal(new Set(fleet.map(v => v.id)).size, 2400);
  assert.equal(app.fleet(), fleet);
  assert.equal(JSON.stringify(new FleetLogic().fleet()), JSON.stringify(fleet));
});

test('Live starts in 3D; map modes retain their camera behavior', () => {
  const app = new FleetLogic();
  assert.equal(app.state.mapMode, '3d');
  assert.equal(app.mapModeCfg('3d').pitch, 62);
  assert.equal(app.mapModeCfg('iso').pitch, 45);
  assert.equal(app.mapModeCfg('2d').pitch, 0);
  assert.equal(app.mapModeCfg('2d').buildings, false);
});

test('screen selection respects explicit state and initial props', () => {
  const app = new FleetLogic({ startScreen: 'vehicles' });
  assert.equal(app.cur(), 'vehicles');
  app.state.screen = 'fuel';
  assert.equal(app.cur(), 'fuel');
  assert.equal(new FleetLogic().cur(), 'dashboard');
});

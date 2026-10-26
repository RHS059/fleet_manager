import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../src/FleetLogic.js', import.meta.url), 'utf8');
const FleetLogic = vm.runInNewContext(source.replace(/^import .*;$/gm, '').replace('export default class FleetLogic', 'class FleetLogic') + '\nFleetLogic', {
  StreamableLogic: class { constructor(props = {}) { this.props = props; } },
  performance: { now: () => 0 },
});

function road(lengths, limit = 12.5) {
  let x = 0;
  const nodes = [0, ...lengths].map((length, i) => { x += length; return { i, x: x / 0.8587, y: 0, lim: limit, adj: [] }; });
  nodes.forEach((node, i) => { if (i) node.adj.push(nodes[i - 1]); if (i + 1 < nodes.length) node.adj.push(nodes[i + 1]); });
  // Each caller gets distinct route-point objects, just as planTrip produces.
  return { nodes, points: () => nodes.map(node => ({ node, x: node.x * 0.8587, y: 0 })) };
}

function vehicle(id, pts, options = {}) {
  return { id, a: { type: 'van' }, pts, seg: 0, t: 0, phase: 'out', lane: 0, len: 6, speed: 0, seed: 0,
    travelled: 0, heading: 90, trailerHeading: 90, lat: 1.3, latT: 1.3, waitUntil: 0, ...options };
}

function occupancy(app, vehicles) {
  const groups = new Map();
  vehicles.forEach(v => app.joinGroup(v, groups));
  return groups;
}

test('following clamp uses road identity and maintains spacing between independent routes', () => {
  const app = new FleetLogic(), graph = road([100, 100]);
  const follower = vehicle('follower', graph.points(), { t: 50, speed: 20 });
  const leader = vehicle('leader', graph.points(), { t: 60 });
  assert.notEqual(follower.pts[0], leader.pts[0]);
  const groups = occupancy(app, [follower, leader]);
  app.stepVehicle(follower, 1, 1, groups);
  assert.ok(Math.abs(follower.t - 53.4) < 1e-8);
  assert.ok(leader.t - follower.t - (follower.len + leader.len) / 2 >= 0.6 - 1e-8);
});

test('following and entry clearance see a truck beyond multiple short road edges', () => {
  const app = new FleetLogic(), graph = road([10, 10, 10, 100]);
  const follower = vehicle('follower', graph.points(), { len: 21 });
  const leader = vehicle('leader', graph.points(), { len: 21, seg: 2, t: 5 });
  const groups = occupancy(app, [follower, leader]);
  const found = app.routeLeader(follower.pts, 0, 0, 0, follower, groups);
  assert.equal(found.lead, leader);
  assert.equal(found.gap, 4);
  leader.t = 1;
  assert.equal(app.entryClear(follower.pts, follower, groups), false);
});

test('crossing a road vertex removes old occupancy immediately', () => {
  const app = new FleetLogic(), graph = road([100, 100]);
  const v = vehicle('moving', graph.points(), { t: 99.8, speed: 10 });
  const groups = occupancy(app, [v]), oldKey = app.segKey(v.pts[0], v.pts[1]);
  app.stepVehicle(v, 0.1, 1, groups);
  assert.equal(v.seg, 1);
  assert.equal(groups.has(oldKey), false);
  assert.ok(groups.get(app.segKey(v.pts[1], v.pts[2])).includes(v));
});

test('one update crosses all tiny geometry edges covered by its movement', () => {
  const app = new FleetLogic(), graph = road([0.5, 0.5, 0.5, 100]);
  const v = vehicle('moving', graph.points(), { speed: 20 });
  const groups = occupancy(app, [v]);
  app.stepVehicle(v, 0.1, 1, groups);
  assert.equal(v.seg, 3);
  assert.ok(v.t >= 0 && v.t < 100);
  assert.equal(groups.size, 1);
  assert.ok(groups.get(app.segKey(v.pts[3], v.pts[4])).includes(v));
});

test('arrival clears road occupancy before the next vehicle advances', () => {
  const app = new FleetLogic(), graph = road([100]);
  const v = vehicle('arriving', graph.points(), { t: 99.8, speed: 10 });
  const groups = occupancy(app, [v]);
  app.arrive = w => { w.phase = 'atDest'; };
  app.stepVehicle(v, 0.1, 1, groups);
  assert.equal(v.phase, 'atDest');
  assert.equal(groups.size, 0);
});

test('destination departure retains the clear lane selected during admission', () => {
  const app = new FleetLogic(), graph = road([100], 29);
  const blocker = vehicle('blocker', graph.points(), { t: 3 });
  const v = vehicle('departing', graph.points(), { phase: 'atDest' });
  v.nextLeg = { phase: 'out', pts: graph.points() };
  const groups = occupancy(app, [blocker]);
  app.departDest(v, 1, groups);
  assert.equal(v.phase, 'out');
  assert.equal(v.lane, 1);
});

test('departures yield to an approaching vehicle across short upstream edges', () => {
  const app = new FleetLogic(), graph = road([5, 5, 100]);
  const approaching = vehicle('approaching', graph.points(), { t: 4, speed: 5 });
  const v = vehicle('departing', graph.points().slice(2), { phase: 'atDest' });
  const groups = occupancy(app, [approaching]);
  assert.equal(app.entryClear(v.pts, v, groups, 0, true), false);
  assert.equal(app.entryClear(v.pts, v, groups), true);
});

test('a depot driveway yields to a vehicle approaching the road merge', () => {
  const app = new FleetLogic(), graph = road([10, 100]);
  const approaching = vehicle('approaching', graph.points(), { t: 9, speed: 5 });
  const roadPoints = graph.points();
  const driveway = [{ x: 10, y: 5, node: null }, roadPoints[1], roadPoints[2]];
  const departing = vehicle('departing', driveway, { t: 4.9, speed: 3 });
  const groups = occupancy(app, [approaching, departing]);
  app.stepVehicle(departing, 0.1, 1, groups);
  assert.equal(departing.seg, 0);
  assert.equal(departing.speed, 0);
  assert.equal(groups.has(app.segKey(roadPoints[1], roadPoints[2])), false);
});

test('random initial placement rejects bodies overlapping on adjacent short edges', () => {
  const app = new FleetLogic(), graph = road([5, 5, 100]);
  const placed = vehicle('placed', graph.points(), { len: 21, seg: 1, t: 1 });
  const incoming = vehicle('incoming', graph.points(), { len: 21 });
  const groups = occupancy(app, [placed]);
  app.placeAt = v => { v.seg = 0; v.t = 4; };
  assert.equal(app.placeFree(incoming, groups), false);
  placed.seg = 0; placed.t = 4;
  const groupsBehind = occupancy(app, [placed]);
  app.placeAt = v => { v.seg = 1; v.t = 1; };
  assert.equal(app.placeFree(incoming, groupsBehind), false);
});

test('dispatch capacity measures reachable directed lane length, not vertices or disconnected roads', () => {
  const app = new FleetLogic(), graph = road([100, 100], 29);
  const disconnected = { i: 3, x: 100000, y: 0, lim: 29, adj: [] };
  app.roads = [...graph.nodes, disconnected];
  app.bases = [{ trees: [{ dist: [0, 100, 200, Infinity] }] }];
  app.initTrafficCapacity();
  assert.equal(app.trafficLaneMetres, 1200);
  assert.equal(app.trafficLimit, 4);
  assert.equal(app.activeTrips, 0);
});

test('capacity waits preserve vehicle location and planned route, then dispatch fairly', () => {
  const app = new FleetLogic(), graph = road([100]);
  app.trafficLimit = 1; app.activeTrips = 1; app.dispatchQueue = new Set();
  const first = vehicle('first', graph.points(), { phase: 'atDest', mx: 14, my: 8 });
  const second = vehicle('second', graph.points(), { phase: 'atDest', seed: 0.5 });
  first.nextLeg = { phase: 'out', pts: graph.points() }; second.nextLeg = { phase: 'out', pts: graph.points() };
  const route = first.nextLeg;
  app.planTrip = () => { throw new Error('capacity wait must not replan'); };
  app.departDest(first, 1, new Map()); app.departDest(second, 1, new Map());
  assert.equal(first.nextLeg, route);
  assert.deepEqual([first.mx, first.my], [14, 8]);
  assert.equal(app.actLabel(first), 'Awaiting dispatch window');
  assert.notEqual(first.waitUntil, second.waitUntil);
  app.activeTrips = 0;
  app.entryClear = (_pts, v) => v !== first;
  app.departDest(first, 10, new Map());
  app.departDest(second, 10, new Map());
  assert.equal(first.phase, 'atDest');
  assert.equal(second.phase, 'out');
  assert.equal(app.activeTrips, 1);
  assert.equal(app.canDispatch(first, 11), false);
});

test('a future FIFO retry does not serialize ready departures behind its timer', () => {
  const app = new FleetLogic(), graph = road([100], 29);
  const future = vehicle('future', graph.points(), { phase: 'atDest', waitUntil: 50 });
  const ready = vehicle('ready', graph.points(), { phase: 'atDest', waitUntil: 10 });
  const alsoReady = vehicle('also-ready', graph.points(), { phase: 'atDest', waitUntil: 10 });
  for (const v of [future, ready, alsoReady]) v.nextLeg = { phase: 'out', pts: graph.points() };
  app.trafficLimit = 2; app.activeTrips = 0; app.dispatchQueue = new Set([future, ready, alsoReady]);
  const groups = new Map();
  app.departDest(ready, 10, groups);
  app.departDest(alsoReady, 10, groups);
  assert.equal(ready.phase, 'out');
  assert.equal(alsoReady.phase, 'out');
  assert.equal(future.phase, 'atDest');
  assert.equal(app.activeTrips, 2);
  assert.equal(app.dispatchQueue.size, 1);
});

test('arrival releases one active slot and a full fleet cannot start another trip', () => {
  const app = new FleetLogic(), graph = road([100]);
  app.trafficLimit = 1; app.activeTrips = 0;
  const arriving = vehicle('arriving', graph.points(), { a: { type: 'car' } });
  const waiting = vehicle('waiting', graph.points(), { phase: 'atBase' });
  app.beginActs = () => {};
  assert.equal(app.startLeg(arriving, 'out', arriving.pts), true);
  assert.equal(app.startLeg(waiting, 'out', waiting.pts), false);
  assert.equal(waiting.phase, 'atBase');
  assert.equal(app.activeTrips, 1);
  app.arrive(arriving, 'atDest', 1);
  app.releaseTraffic(arriving);
  assert.equal(app.activeTrips, 0);
  assert.equal(app.startLeg(waiting, 'back', waiting.pts), true);
  waiting.home = { heading: 0 }; waiting.t = 99.8; waiting.speed = 10;
  app.planTrip = () => {};
  app.stepVehicle(waiting, 0.1, 2, occupancy(app, [waiting]));
  assert.equal(waiting.phase, 'atBase');
  assert.equal(app.activeTrips, 0);
});

test('an unrouteable FIFO request yields its turn to an eligible departure', () => {
  const app = new FleetLogic(), graph = road([100]);
  const unroutable = vehicle('unroutable', null, { phase: 'atBase', home: { node: graph.nodes[0] } });
  const eligible = vehicle('eligible', graph.points(), { phase: 'atDest' });
  eligible.nextLeg = { phase: 'out', pts: graph.points() };
  app.trafficLimit = 1; app.activeTrips = 0; app.dispatchQueue = new Set([unroutable, eligible]);
  app.planTrip = v => { v.outPts = null; };
  app.stepVehicle(unroutable, 0.1, 1, new Map());
  app.departDest(eligible, 1, new Map());
  assert.equal(unroutable.phase, 'atBase');
  assert.equal(unroutable.dispatchWaiting, true);
  assert.equal(eligible.phase, 'out');
  assert.equal(app.activeTrips, 1);
});

test('initialization keeps all 2400 assets while bounding active traffic and subsequent dispatch', () => {
  const app = new FleetLogic(), lines = JSON.parse(fs.readFileSync(new URL('../public/roads.json', import.meta.url), 'utf8'));
  const nodes = new Map();
  function getNode(p) {
    const key = p.join(',');
    if (!nodes.has(key)) nodes.set(key, { i: nodes.size, x: p[0], y: p[1], lim: 12.5, adj: [] });
    return nodes.get(key);
  }
  for (const line of lines) for (let i = 1; i < line.length; i++) {
    const a = getNode(line[i - 1]), b = getNode(line[i]);
    if (!a.adj.includes(b)) a.adj.push(b);
    if (!b.adj.includes(a)) b.adj.push(a);
  }
  app.roads = [...nodes.values()];
  app.initVehicles();
  assert.equal(app.vehicles.length, 2400);
  assert.equal(new Set(app.vehicles.map(v => v.id)).size, 2400);
  const countActive = () => app.vehicles.filter(v => v.phase === 'out' || v.phase === 'back').length;
  assert.equal(app.activeTrips, countActive());
  assert.ok(app.activeTrips > 0 && app.activeTrips <= app.trafficLimit);
  assert.ok(app.vehicles.filter(v => v.phase === 'atDest').length > 1500);
  for (let now = 1; now <= 120; now++) {
    const groups = new Map();
    for (const v of app.vehicles) { v.trafficKey = null; if (v.phase === 'out' || v.phase === 'back') app.joinGroup(v, groups); }
    for (const v of app.vehicles) app.stepVehicle(v, 1, now, groups);
    assert.equal(app.activeTrips, countActive());
    assert.ok(app.activeTrips >= 0 && app.activeTrips <= app.trafficLimit);
  }
  assert.equal(app.vehicles.length, 2400);
});

#!/usr/bin/env node
// Deterministic, offline traffic benchmark using the actual animation callback.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map(arg => {
  const [key, ...value] = arg.replace(/^--/, '').split('=');
  return [key, value.join('=') || 'true'];
}));
if (args.help) {
  console.log('node scripts/traffic-benchmark.mjs [--seconds=1800] [--seed=82731] [--dt=0.1] [--roads=regional|local] [--output=/tmp/traffic.json] [--source=/path/FleetLogic.js] [--graph=/path/graph.json]');
  process.exit(0);
}
const seconds = Number(args.seconds || 1800), dt = Number(args.dt || 0.1);
const initialSeed = Number(args.seed || 82731), roadMode = args.roads || 'regional';
if (!(seconds > 0 && Number.isFinite(seconds) && dt > 0 && dt <= 0.1) || !Number.isSafeInteger(initialSeed) || !['regional', 'local'].includes(roadMode)) {
  throw new Error('Use positive --seconds, 0 < --dt <= 0.1, an integer --seed, and --roads=regional or local.');
}
const sourcePath = args.source ? path.resolve(args.source) : path.join(root, 'src/FleetLogic.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const readJSON = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
let seed = initialSeed, now = 0, frame;
const math = Object.create(Math);
math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const FleetLogic = vm.runInNewContext(
  source.replace(/^import .*;$/gm, '').replace('export default class FleetLogic', 'class FleetLogic') + '\nFleetLogic',
  {
    StreamableLogic: class {
      constructor(props = {}) { this.props = props; }
      setState(update) { Object.assign(this.state, update); }
    },
    localRoads: readJSON('public/roads.json'),
    regionalRoads: readJSON('public/roads-regional.json'),
    Math: math, performance: { now: () => now * 1000 }, console,
    window: { innerWidth: 1200 }, document: { hidden: false },
    requestAnimationFrame(callback) { frame = callback; return 1; },
    cancelAnimationFrame() {},
  },
);
const app = new FleetLogic();
if (roadMode === 'local') app.loadRegionRoads = async () => [];
if (args.graph) {
  const raw = JSON.parse(fs.readFileSync(path.resolve(args.graph), 'utf8'));
  app.roads = raw.roads || raw;
  for (const node of app.roads) node.adj = node.adj.map(index => app.roads[index]);
} else await app.loadRoads();
app.initVehicles();

const driving = vehicle => vehicle.phase === 'out' || vehicle.phase === 'back';
const round = value => Math.round(value * 100) / 100;
const stoppedFor = new Map(app.vehicles.map(vehicle => [vehicle.id, 0]));
const everStopped60 = new Set();
const totals = { arrivals: 0, completedLegs: 0, departures: 0 };
let longestContinuousStop = 0;
const originalArrive = app.arrive;
app.arrive = function (...args) { totals.arrivals++; return originalArrive.apply(this, args); };
const originalStep = app.stepVehicle;
app.stepVehicle = function (vehicle, step, time, groups) {
  const before = vehicle.phase;
  originalStep.call(this, vehicle, step, time, groups);
  const stopped = driving(vehicle) && vehicle.speed < 0.3 ? stoppedFor.get(vehicle.id) + step : 0;
  stoppedFor.set(vehicle.id, stopped);
  longestContinuousStop = Math.max(longestContinuousStop, stopped);
  if (stopped >= 60) everStopped60.add(vehicle.id);
  if (before === 'atDest' && driving(vehicle)) totals.departures++;
  if (driving({ phase: before }) && !driving(vehicle)) totals.completedLegs++;
};

function snapshot() {
  const travel = app.vehicles.filter(driving), phases = {}, lanes = new Map();
  for (const vehicle of app.vehicles) phases[vehicle.phase] = (phases[vehicle.phase] || 0) + 1;
  for (const vehicle of travel) {
    const key = app.segKey(vehicle.pts[vehicle.seg], vehicle.pts[vehicle.seg + 1]);
    if (key < 0) continue;
    const lane = key + ':' + vehicle.lane;
    if (!lanes.has(lane)) lanes.set(lane, []);
    lanes.get(lane).push(vehicle);
  }
  let overlappingSameLanePairs = 0, minimumGap = Infinity;
  for (const occupants of lanes.values()) {
    occupants.sort((a, b) => a.t - b.t);
    for (let i = 1; i < occupants.length; i++) {
      const front = occupants[i], back = occupants[i - 1];
      const gap = front.t - back.t - (front.len + back.len) / 2;
      minimumGap = Math.min(minimumGap, gap);
      if (gap < -0.01) overlappingSameLanePairs++;
    }
  }
  const speeds = travel.map(vehicle => vehicle.speed).sort((a, b) => a - b);
  return {
    seconds: round(now), phases, fleet: app.vehicles.length,
    trafficLimit: app.trafficLimit, activeTrips: app.activeTrips,
    dispatchQueue: app.dispatchQueue?.size || 0,
    travel: travel.length, moving: travel.filter(vehicle => vehicle.speed >= 0.3).length,
    stopped: travel.filter(vehicle => vehicle.speed < 0.3).length,
    stopped60: travel.filter(vehicle => stoppedFor.get(vehicle.id) >= 60).length,
    stopped300: travel.filter(vehicle => stoppedFor.get(vehicle.id) >= 300).length,
    meanSpeedMps: round(speeds.reduce((sum, speed) => sum + speed, 0) / (speeds.length || 1)),
    medianSpeedMps: round(speeds[Math.floor(speeds.length / 2)] || 0),
    overlappingSameLanePairs, minimumSameLaneGapM: Number.isFinite(minimumGap) ? round(minimumGap) : null,
    occupiedDirectedLanes: lanes.size,
    longestContinuousStopSeconds: round(longestContinuousStop), everStopped60: everStopped60.size,
    siteQueue: [...(app.sites?.values() || [])].reduce((sum, site) => sum + site.q.length, 0),
    totals: { ...totals },
  };
}
const roadSnapshot = app.roads.map(node => ({ x: node.x, y: node.y, i: node.i, lim: node.lim, adj: node.adj.map(adjacent => adjacent.i) }));
const metadata = {
  sourcePath, sourceSha256: crypto.createHash('sha256').update(source).digest('hex'),
  roadsSha256: crypto.createHash('sha256').update(JSON.stringify(roadSnapshot)).digest('hex'),
  seed: initialSeed, dt, seconds, roadMode: args.graph ? 'graph' : roadMode,
  roadNodes: app.roads.length, directedEdges: app.roads.reduce((sum, node) => sum + node.adj.length, 0),
  trafficLaneMetres: app.trafficLaneMetres,
};
const samples = [];
const emit = () => { const sample = snapshot(); samples.push(sample); console.log(JSON.stringify(sample)); };
console.log(JSON.stringify({ metadata }));
emit();
app.map = { triggerRepaint() {}, isEasing() { return false; }, getSource() { return null; } };
app.updateTrace = () => {};
app.startSim();
const started = performance.now();
let nextSample = 60;
for (let tick = 1; tick <= Math.round(seconds / dt); tick++) {
  now = tick * dt;
  frame(now * 1000);
  if (now + 1e-7 >= nextSample) { emit(); nextSample += 60; }
}
if (samples.at(-1).seconds !== round(now)) emit();
const checks = {
  fleetPreserved: samples.every(sample => sample.fleet === app.fleet().length),
  activeAccounting: samples.every(sample => sample.activeTrips == null || sample.activeTrips === sample.travel),
  belowCapacity: samples.every(sample => sample.trafficLimit == null || sample.travel <= sample.trafficLimit),
  noSampledOverlaps: samples.every(sample => sample.overlappingSameLanePairs === 0),
  noStopsOver60Seconds: everStopped60.size === 0,
};
const report = { metadata, samples, checks, elapsedRealSeconds: round((performance.now() - started) / 1000) };
if (args.output) fs.writeFileSync(path.resolve(args.output), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ checks, elapsedRealSeconds: report.elapsedRealSeconds, output: args.output }));
if (!checks.fleetPreserved || !checks.activeAccounting || !checks.belowCapacity) process.exitCode = 1;

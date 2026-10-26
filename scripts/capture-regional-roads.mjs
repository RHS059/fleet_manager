// Maintenance only: write a reviewable candidate snapshot, never a production refresh.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { VectorTile } from '@mapbox/vector-tile';
import Pbf from 'pbf';

const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const output = arg('--output');
if (!output) throw new Error('Pass --output /tmp/roads-regional-candidate.json; inspect it before replacing the bundled snapshot.');
const metadata = JSON.parse(await fs.readFile(new URL('../public/roads-regional.meta.json', import.meta.url), 'utf8'));
const { source, bounds } = metadata;
const tileDir = arg('--tile-dir') || await fs.mkdtemp(path.join(os.tmpdir(), 'fleet-road-tiles-'));
await fs.mkdir(tileDir, { recursive: true });
const curl = promisify(execFile), tiles = [];
for (let x = source.tileX[0]; x <= source.tileX[1]; x++) {
  for (let y = source.tileY[0]; y <= source.tileY[1]; y++) tiles.push({ x, y });
}

let next = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (next < tiles.length) {
    const tile = tiles[next++];
    tile.file = path.join(tileDir, `${source.version}-${source.zoom}-${tile.x}-${tile.y}.mvt`);
    const cached = await fs.stat(tile.file).catch(() => null);
    if (cached?.size) continue;
    const url = source.tileURL.replace('{z}', source.zoom).replace('{x}', tile.x).replace('{y}', tile.y);
    await curl('curl', ['--location', '--fail', '--retry', '1', '--max-time', '30', '--silent', '--show-error', url, '--output', tile.file]);
  }
}));

const classes = { motorway: 0, trunk: 1, primary: 2, secondary: 3, tertiary: 4 };
const lines = [], seen = new Set();
for (const { x, y, file } of tiles) {
  let bytes = await fs.readFile(file);
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) bytes = zlib.gunzipSync(bytes);
  const roads = new VectorTile(new Pbf(bytes)).layers[source.sourceLayer];
  if (!roads) continue;
  for (let i = 0; i < roads.length; i++) {
    const feature = roads.feature(i);
    const kind = classes[(feature.properties.kind_detail || '').replace(/_link$/, '')];
    if (kind === undefined) continue;
    const geometry = feature.toGeoJSON(x, y, source.zoom).geometry;
    const parts = geometry.type === 'LineString' ? [geometry.coordinates] : geometry.type === 'MultiLineString' ? geometry.coordinates : [];
    for (const part of parts) {
      let line = [];
      const save = () => {
        if (line.length < 2) return;
        const forward = JSON.stringify(line), reverse = JSON.stringify([...line].reverse());
        const key = kind + ':' + (forward < reverse ? forward : reverse);
        if (seen.has(key)) return;
        seen.add(key); lines.push([kind, ...line]);
      };
      for (const [lng, lat] of part) {
        if (lng < bounds.west || lng > bounds.east || lat < bounds.south || lat > bounds.north) { save(); line = []; continue; }
        const point = [Math.round((lng + 119.81) * 1e5), Math.round((lat - 39.53) * 1e5)];
        const previous = line.at(-1);
        if (!previous || point[0] !== previous[0] || point[1] !== previous[1]) line.push(point);
      }
      save();
    }
  }
}
if (lines.length < 2000) throw new Error(`Only ${lines.length} road lines captured; inspect source/schema/coverage before publishing.`);
metadata.capturedAt = new Date().toISOString().slice(0, 10);
metadata.polylines = lines.length;
await fs.writeFile(output, JSON.stringify(lines));
const metadataOutput = output.replace(/\.json$/, '') + '.meta.json';
await fs.writeFile(metadataOutput, JSON.stringify(metadata, null, 2) + '\n');
console.log(JSON.stringify({ output, metadataOutput, tiles: tiles.length, polylines: lines.length, bytes: (await fs.stat(output)).size }));

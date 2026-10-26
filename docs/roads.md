# Regional road snapshot

The simulation uses `public/roads.json` for detailed downtown streets and
`public/roads-regional.json` for the surrounding Reno, Sparks, North Valleys,
Verdi, and South Meadows area. Routing does not require basemap tiles or a hidden
browser map. The visible basemap can load independently.

The regional snapshot was captured on **2026-10-26** from CARTO's
`carto.streets/v2` dataset, version **20261001-03**, using its Protomaps `roads`
layer. The capture uses 25 zoom-12 tiles, x=682–686 and y=1555–1559, bounded by
longitude −120.01 to −119.64 and latitude 39.39 to 39.68. Exact source URLs,
coordinate encoding, and processing details are in
`public/roads-regional.meta.json`.

Attribution: **© OpenStreetMap contributors © CARTO**.
The OpenStreetMap-derived database is available under the
[Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/).
See [OpenStreetMap copyright and attribution](https://www.openstreetmap.org/copyright),
[CARTO](https://carto.com/about-carto/), and the
[Protomaps layer schema](https://docs.protomaps.com/basemaps/layers).
Keep these notices with redistributions of the road snapshot. The application
also displays attribution on its map.

## Refreshing a controlled snapshot

The optional maintenance script uses `curl`, `@mapbox/vector-tile` 1.3.1, and
`pbf` 3.3.0. The JavaScript packages are already supplied transitively by the
existing map dependency; the script adds no production dependency or startup
network request. If running it in a separate maintenance checkout, install those
two decoder packages there first.

From the project root:

```sh
node scripts/capture-regional-roads.mjs --output /tmp/roads-regional-candidate.json
```

The script reads the pinned source version and bounds from the metadata file,
downloads the bounded tiles with six concurrent requests, and writes a candidate
JSON file and matching metadata. It leaves the committed snapshot unchanged.
Pass `--tile-dir /path/to/cached-tiles` to reuse an existing capture. For a newer
CARTO release, inspect the current style and `roads` schema, then explicitly
update the source version and metadata before capturing; do not automatically
follow an unreviewed latest URL.

Inspect the candidate's coverage and geometry, then replace both bundled files
in a development branch and run:

```sh
node --test tests/roads.test.js
npm test
npm run build
```

Also inspect all four depot locations and run the fleet's sustained simulation
checks before deployment. The current snapshot has 2,144 regional polylines;
combined with downtown roads, the graph has 13,935 nodes and approximately
1,428 km of undirected road geometry. Approximately 1,323 km and 12,792 nodes
connect to the main depot, and all four depots connect to that network. The
regression tests reject a return to the old 1,098-node downtown-only graph.

## Scope of the data

This is geometry extracted from a display basemap, not a navigational routing
database. It retains motorway, trunk, primary, secondary, tertiary, and ramp
geometry, including bridge/tunnel continuations. Identical or reversed duplicate
lines and consecutive duplicate points are removed. The existing graph builder
joins shared coordinates and nearby loose ends; some isolated peripheral road
fragments remain unreachable and are rejected during trip planning.

The simulation still infers lane counts from road class, treats connections as
bidirectional, and does not model legal turn restrictions or live traffic.
Destination names and fleet activity are demo data. Dispatch limits are
simulation tuning and do not establish real-world road capacity or a recommended
organization fleet size.

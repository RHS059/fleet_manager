# Fleet Console

Interactive fleet operations prototype for Northrange Logistics, with desktop/mobile layouts, approximately 2,400 simulated vehicles, and 2D, 3D and isometric maps. Live view defaults to 3D. Data and actions are simulated, not connected to a production fleet backend.

## Development

Node 22.12+ is required.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

## Implementation

- React 18 uses `createRoot`, with production React, MapLibre and Three.js installed from npm and bundled by Vite. The graphics versions match the supplied design to preserve its custom shader compatibility.
- `src/FleetLogic.js` contains the imported application class, with no synchronous XHR or runtime evaluation of application source.
- `src/fleet.template.html` preserves the exported design. `src/template-runtime.js` is its template-to-React adapter, not a separate DOM application. It still interprets template bindings at runtime; a full JSX rewrite is not part of this migration.
- Google Fonts loads Inter and IBM Plex Mono once, with connection hints, required weights, swap rendering and system fallbacks.
- Vite minifies production assets, separates vendor chunks and fingerprints output for cache invalidation. Graphics load asynchronously after the first render; hidden tabs skip simulation work. Map teardown disposes Three.js resources.
- `public/` holds the backdrop and bundled downtown/regional road graphs. Route simulation does not require map tiles; the visible basemap still needs network access. See [road provenance and maintenance](docs/roads.md).

## Deployment

Pushes to `main` run tests and build the site before publishing **only `dist/`** to GitHub Pages. Pull requests run the same validation without deploying. Pages must use GitHub Actions as its source. Relative asset paths support both repository Pages URLs and custom domains.

The old fragmented deployment files are replaced by the maintainable source build. Original mockup/editor duplicates and unused reference images are not shipped to the production site.

## Portfolio URL and automatic updates

The portfolio serves this app at https://www.reidhslaughter.com/apps/fleet-management.
`npm run build:deploy` builds both the normal GitHub Pages site and a second build in
`dist/portfolio/` with `/apps/fleet-management/` as its asset base. Both are published
atomically by the existing Pages workflow after tests pass.

The portfolio's Next.js rewrites proxy that second build's HTML and assets under the
portfolio URL. A successful deployment from this repository therefore updates the
portfolio app automatically (subject to CDN caching), without cross-repository tokens,
copied source, scheduled synchronization or a portfolio rebuild. GitHub Pages must
remain available as the upstream host. Use a normal HTML link for navigation to the
standalone app rather than Next.js client-side navigation.

## Traffic simulation

All 2,400 assets remain in the fleet. Vehicles at customer sites and depots wait for
scheduled dispatch instead of continuously flooding the road network. The active
trip limit is the lower of 40% of inventory and one vehicle per 250 metres of
reachable directed lane length. These are conservative demo tuning values, not
real-world road-capacity estimates. Waiting assets remain visible and show
“Awaiting dispatch window.”

Following and merge checks span multiple geometry edges, account for vehicle body
length, and immediately remove departed vehicles from segment occupancy. Regional
roads are bundled so basemap schema changes cannot silently collapse routes into
the downtown-only network.

Run a deterministic sustained check with:

```sh
npm run benchmark:traffic -- --seconds=1800 --seed=82731 --roads=regional
npm run benchmark:traffic -- --seconds=1800 --seed=82731 --roads=local
```

See [traffic validation](docs/traffic-simulation.md) for measured results and model
limitations. The regional road database retains its own ODbL attribution in
[roads documentation](docs/roads.md).

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
- `public/` holds the supplied backdrop and local road graph. Map tiles and optional regional road enrichment require external network access; local roads remain the simulation fallback.

## Deployment

Pushes to `main` run tests and build the site before publishing **only `dist/`** to GitHub Pages. Pull requests run the same validation without deploying. Pages must use GitHub Actions as its source. Relative asset paths support both repository Pages URLs and custom domains.

The old fragmented deployment files are replaced by the maintainable source build. Original mockup/editor duplicates and unused reference images are not shipped to the production site.

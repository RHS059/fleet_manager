# Fleet Console

Fleet-operations console mockup — MapLibre map with ~2,400 simulated vehicles across the Reno–Sparks arterial network, 2D / 3D / Isometric views and procedural low-poly vehicle models.

## Run locally

Serve over HTTP (the app fetches `roads.json`):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (GitHub Pages)

Settings → Pages → Deploy from a branch → `main` / `/ (root)`.

## Files

- `index.html` — the app: markup, styles, simulation
- `support.js` — component runtime
- `fleet-geometry.js` — procedural vehicle + people meshes and assembly spec
- `roads.json` — downtown road graph
- `ambient.webp` — page backdrop

Map tiles and three.js load from CDNs.

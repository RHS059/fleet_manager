# Fleet Console

Static fleet-operations console mockup — MapLibre map with ~2,400 simulated vehicles across the Reno–Sparks arterial network, plus 2D / 3D / Isometric views and procedural low-poly vehicle models.

## Run locally

Needs to be served over HTTP (the app fetches `roads.json`):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (GitHub Pages)

Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)`.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app — markup, styles and simulation logic |
| `support.js` | Component runtime |
| `fleet-geometry.js` | Procedural vehicle + people meshes and assembly spec |
| `roads.json` | Downtown road graph |
| `ambient.webp` | Page backdrop |

Map tiles and three.js load from CDNs, so the page needs network access.

  syncMarkers() {
    const map = this.map; if (!map) return;
    const flat = this.state.mapMode === '2d';
    ['fm-veh-pins', 'fm-veh-hov'].forEach(id => { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', flat ? 'visible' : 'none'); });
    if (map.getLayer('fm-vehicles-3d')) map.setLayoutProperty('fm-vehicles-3d', 'visibility', flat ? 'none' : 'visible');
    (this.depotLayers || []).forEach(id => { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', (id === 'fm-depot-flat' || id === 'fm-site-flat') === flat ? 'visible' : 'none'); });
    if (flat && map.getSource('fm-veh') && this.vehicles) map.getSource('fm-veh').setData(this.pinsGeo());
  }
  selectAsset(id) {
    if (id === this.state.selId) return;
    const map = this.map, mode = this.state.mapMode;
    const prev = this.vehicles.find(v => v.id === this.state.selId), next = this.vehicles.find(v => v.id === id);
    this.setState({ selId: id }, () => this.syncMarkers());
    if (!map || !next) return;
    const seq = this.flySeq = (this.flySeq || 0) + 1;
    const pos = v => this.toLngLat(v.mx, v.my);
    const then = (fn) => map.once('moveend', () => { if (this.flySeq === seq) fn(); });
    this.follow = null; this.setState({ following: false });
    if (mode === '2d' || !prev) { map.flyTo({ center: pos(next), zoom: Math.max(map.getZoom(), 14.5), duration: 1400, essential: true }); then(() => { this.follow = next.id; this.setState({ following: true }); }); return; }
    const cfg = this.mapModeCfg(mode), z0 = map.getZoom();
    const cam = map.cameraForBounds(new maplibregl.LngLatBounds(pos(prev), pos(next)).extend(pos(prev)), { padding: 160, maxZoom: z0 - 0.5 });
    map.easeTo({ center: cam.center, zoom: Math.min(cam.zoom, z0 - 0.5), pitch: 0, bearing: 0, duration: 1500, essential: true, easing: t => 1 - Math.pow(1 - t, 3) });
    then(() => { map.easeTo({ center: pos(next), duration: 1000, essential: true }); then(() => { map.easeTo({ center: pos(next), zoom: Math.max(z0, 15.6), pitch: cfg.pitch, bearing: cfg.bearing, duration: 1600, essential: true, easing: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 }); then(() => { this.follow = next.id; this.setState({ following: true }); }); }); });
  }

  componentDidMount() { this.syncMap(); }
  componentDidUpdate() { this.syncMap(); }
  componentWillUnmount() { this.stopSim(); if (this.map) { this.map.remove(); this.map = null; } }

  mapModeCfg(m) {
    return m === '3d' ? { pitch: 62, bearing: -18, zoom: 15.2, center: [-119.8138, 39.5296], buildings: true }
      : m === 'iso' ? { pitch: 45, bearing: 45, zoom: 14.6, center: [-119.8138, 39.5296], buildings: true }
      : { pitch: 0, bearing: 0, buildings: false };
  }
  applyMapMode(m) {
    const map = this.map; if (!map) return;
    const c = this.mapModeCfg(m);
    (this.buildingLayers || []).forEach(id => { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', c.buildings ? 'visible' : 'none'); });
    this.applyTerrain(c.buildings);
    const opts = { pitch: c.pitch, bearing: c.bearing, duration: 900, essential: true };
    if (c.center && map.getZoom() < 13) { const sv = (this.vehicles || []).find(v => v.id === this.state.selId); opts.center = sv ? this.toLngLat(sv.mx, sv.my) : c.center; opts.zoom = c.zoom; }
    if (this.follow) { const fv = (this.vehicles || []).find(v => v.id === this.follow); if (fv) opts.center = this.toLngLat(fv.mx, fv.my); }
    map.easeTo(opts);
    if (m === 'iso') { map.dragRotate.disable(); map.touchZoomRotate.disableRotation(); } else { map.dragRotate.enable(); map.touchZoomRotate.enableRotation(); }
  }
  // real-world elevation (AWS Terrarium DEM) in 3D / isometric; the custom vehicle layer samples it per vehicle
  applyTerrain(on) {
    const map = this.map; if (!map) return;
    if (!map.style || !map.style._loaded) { map.once('styledata', () => this.applyTerrain(on)); return; }
    const src = { type: 'raster-dem', tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'], encoding: 'terrarium', tileSize: 256, maxzoom: 14, attribution: 'Terrain: Mapzen / AWS Open Data' };
    if (!map.getSource('fm-dem')) { map.addSource('fm-dem', src); map.addSource('fm-dem-shade', src); }
    if (!map.getLayer('fm-hillshade')) {
      const before = (this.buildingLayers || []).find(id => map.getLayer(id));
      map.addLayer({ id: 'fm-hillshade', type: 'hillshade', source: 'fm-dem-shade', paint: { 'hillshade-illumination-direction': 315, 'hillshade-exaggeration': 0.95, 'hillshade-shadow-color': '#00040a', 'hillshade-highlight-color': '#7d94a8', 'hillshade-accent-color': '#101f33' } }, before);
    }
    map.setLayoutProperty('fm-hillshade', 'visibility', on ? 'visible' : 'none');
    // NOTE: mesh terrain (map.setTerrain) renders the basemap through offscreen passes and fights the
    // three.js fleet layer for GL state — it flickered and dropped frames. Relief comes from the real
    // DEM via hillshade instead, which is stable at every zoom and needs no shared renderer.
    if (map.getTerrain && map.getTerrain()) { try { map.setTerrain(null); } catch (e) {} }
  }
  refreshMap() { this.stopSim(); if (this.map) { this.map.remove(); this.map = null; } this.layer3d = null; this.buildingLayers = null; this.fadeRings = null; this.depotLayers = null; this._traceKey = null; this.syncMap(); }
  setMapMode(m) {
    const heavy = m !== '2d' && this.state.mapMode === '2d';
    this.setState({ mapMode: m, mapBusy: heavy }, () => {
      this.applyMapMode(m); this.syncMarkers();
      if (!heavy) return;
      // hold the veil until terrain + building tiles are in and the camera has settled
      const map = this.map, t0 = performance.now();
      const done = () => { clearInterval(iv); if (this.state.mapBusy) this.setState({ mapBusy: false }); };
      const iv = setInterval(() => {
        if (!this.map || this.map !== map) return done();
        const ready = map.areTilesLoaded() && !map.isMoving() && (!map.getTerrain() || map.terrain);
        if (ready || performance.now() - t0 > 6000) done();
      }, 120);
    });
  }

  syncMap() {
    const el = this.mapEl;
    if (!el || !window.maplibregl) return;
    if (this.map) { if (el.clientWidth !== this._mw || el.clientHeight !== this._mh) { this._mw = el.clientWidth; this._mh = el.clientHeight; requestAnimationFrame(() => this.map && this.map.resize()); } return; }
    if (!el.isConnected) return;
    this._mw = el.clientWidth; this._mh = el.clientHeight;
    const map = new maplibregl.Map({
      container: el,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-119.79, 39.52], zoom: 12.3, attributionControl: { compact: true }, maxPitch: 70
    });
    this.map = map; window.__fmMap = map;
    ['dragstart', 'wheel', 'rotatestart', 'pitchstart', 'dblclick'].forEach(e => map.on(e, () => { if (this.follow) { this.follow = null; this.setState({ following: false }); } }));
    let hoverT = 0;
    map.on('mousemove', e => {
      const now = performance.now(); if (now - hoverT < 40 || !this.vehicles) return; hoverT = now;
      let best = null, bd = 18 * 18;
      for (const v of this.vehicles) { const p = map.project(this.toLngLat(v.mx, v.my)); const d = (p.x - e.point.x) ** 2 + (p.y - e.point.y) ** 2; if (d < bd) { bd = d; best = v.id; } }
      if (best !== this.hoverId) { this.hoverId = best; map.getCanvas().style.cursor = best ? 'pointer' : ''; if (this.state.mapMode === '2d' && map.getSource('fm-veh')) map.getSource('fm-veh').setData(this.pinsGeo()); else map.triggerRepaint(); }
    });
    map.on('mouseout', () => { this.hoverId = null; });
    map.on('click', () => { if (this.hoverId) this.selectAsset(this.hoverId); });
    let fadeT = null; map.on('moveend', () => { clearTimeout(fadeT); fadeT = setTimeout(() => this.updateBuildingFade(), 250); });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    const onLoad = () => {
      if (this._loadedMap === map) return; this._loadedMap = map;
      map.getStyle().layers.forEach(l => {
        const p = l.paint || {};
        if (l.type === 'background') map.setPaintProperty(l.id, 'background-color', '#030717');
        if (l.type === 'fill' && 'fill-color' in p) map.setPaintProperty(l.id, 'fill-color', /water/.test(l.id) ? '#3e8dcf' : /park|wood|green|grass/.test(l.id) ? '#050b24' : '#030717');
        if (l.type === 'line' && 'line-color' in p) map.setPaintProperty(l.id, 'line-color', /water/.test(l.id) ? '#3e8dcf' : /motorway|trunk/.test(l.id) ? 'rgba(63,227,155,0.34)' : 'rgba(255,255,255,0.13)');
        if (l.type === 'symbol' && 'text-color' in p) { map.setPaintProperty(l.id, 'text-color', 'rgba(255,255,255,0.62)'); map.setPaintProperty(l.id, 'text-halo-color', 'rgba(6,8,7,0.9)'); }
      });
      const src = Object.keys(map.getStyle().sources).find(k => /carto|openmaptiles|basemap/i.test(k)) || Object.keys(map.getStyle().sources)[0];
      if (!this.buildingLayers) {
        const H = ['coalesce', ['get', 'render_height'], 12], B0 = ['coalesce', ['get', 'render_min_height'], 0];
        const at = f => ['+', B0, ['*', ['-', H, B0], f]];
        const N = 6, c0 = [15, 21, 48], c1 = [27, 44, 122], OP = [0.97, 0.6, 0.26];
        this.buildingLayers = []; this.fadeRings = [{ ids: [], ring: 0 }, { ids: [], ring: 1 }, { ids: [], ring: 2 }];
        for (let ring = 0; ring < 3; ring++) for (let i = 0; i < N; i++) {
          const f0 = i / N, f1 = (i + 1) / N, t = (i + 0.5) / N;
          const color = 'rgb(' + c0.map((c, k) => Math.round(c + (c1[k] - c) * t)).join(',') + ')';
          const id = 'fm-buildings-' + ring + '-' + i; this.buildingLayers.push(id); this.fadeRings[ring].ids.push(id);
          map.addLayer({ id, type: 'fill-extrusion', source: src, 'source-layer': 'building', minzoom: 13, filter: ring === 0 ? ['boolean', true] : ['boolean', false],
            paint: { 'fill-extrusion-color': color, 'fill-extrusion-height': f1 === 1 ? H : at(f1), 'fill-extrusion-base': f0 === 0 ? B0 : at(f0), 'fill-extrusion-opacity': OP[ring], 'fill-extrusion-opacity-transition': { duration: 900 } } });
        }
        map.addLayer({ id: 'fm-building-outline', type: 'line', source: src, 'source-layer': 'building', minzoom: 13, paint: { 'line-color': '#269dff', 'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.4, 17, 1.2], 'line-opacity': 0.9 } });
        this.buildingLayers.push('fm-building-outline');
      }
      this.applyMapMode(this.state.mapMode);
      this.loadRoads().then(() => {
        if (this.map !== map) return;
        this.initVehicles();
        this.ensureDepotLayers(map);
        this.ensureTrace(map);
        this.ensurePins(map);
        this.ensure3D(map);
        this.syncMarkers();
        this.updateBuildingFade();
        this.startSim();
      });
    };
    map.on('load', onLoad);
    // fallback: the style can settle without ever emitting 'load' when tiles are cached
    const poll = setInterval(() => { if (this.map !== map) return clearInterval(poll); if (map.isStyleLoaded()) { clearInterval(poll); onLoad(); } }, 800);
  }

  ticks(frac, color, rest) {
    const n = 20, filled = Math.round(frac * n), out = [];
    for (let i = 0; i < n; i++) out.push({ c: i < filled ? color : (rest || 'rgba(255,255,255,0.07)') });
    return out;
  }


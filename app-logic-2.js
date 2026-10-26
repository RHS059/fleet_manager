    const origins = []; for (let k = 0; k < 48 && cand.length; k++) { const n = cand[Math.floor(Math.random() * cand.length)]; origins.push({ node: n, tree: this.dijkstra(n) }); }
    // home yards weighted toward the main downtown yard
    const homeFor = i => this.bases[[0, 0, 1, 2, 3, 0, 1, 2][i % 8] % this.bases.length];
    this.vehicles = this.fleet().map((a, i) => {
      const h = homeFor(i);
      const v = { a, id: a.id, home: h, mx: h.gate.x, my: h.gate.y, heading: h.heading + 180, trailerHeading: h.heading + 180, speed: 0, still: !!a.still, slot: null, phase: 'atBase', waitUntil: now + 2 + Math.random() * 10, stopAtNext: false, cleared: false, lane: 0, seed: Math.random(), tripNo: 0, pts: null, seg: 0, t: 0, legLen: 1, travelled: 0, len: LEN[a.type], lat: 1.3, latT: 1.3, node: h.node, act: null, actIdx: 0 };
      if (v.still) { const s = this.takeSlot(h); if (s) { v.slot = s; v.mx = s.x; v.my = s.y; v.phase = 'parked'; } else { v.still = false; } }
      if (v.still) return v;
      const r = Math.random();
      if (r < 0.2 && atBaseBudget > 0) { const s = this.takeSlot(h); if (s) { atBaseBudget--; v.slot = s; v.mx = s.x; v.my = s.y; this.planTrip(v, h.node); this.beginActs(v, now, 'depot', true); return v; } }
      const r2 = Math.random();
      if (r2 < 0.06 && returnBudget > 0 && h.slots.some(s => s.free)) { this.planTrip(v, h.node); if (v.outPts) { returnBudget--; v.slot = this.takeSlot(h); this.startLeg(v, 'back', this.backPts(v)); if (this.placeFree(v, occ)) return v; this.freeSlot(v); } }
      const o = origins.length ? origins[i % origins.length] : null;
      this.planTrip(v, o ? o.node : h.node, o ? o.tree : null);
      if (!v.outPts) { this.planTrip(v, h.node); if (!v.outPts) return v; }
      this.startLeg(v, 'out', v.outPts);
      // ~55% of the working fleet is on site at any moment, realistic for a delivery/service fleet
      if (r2 < 0.58 || !this.placeFree(v, occ)) { this.placeAt(v, 1); this.arrive(v, 'atDest', now, true); }
      return v;
    });
    this.byType = { car: [], van: [], truck: [] };
    this.vehicles.forEach(v => { this.byType[v.a.type].push(v); let s = (v.a.pSeed ^ 0x5bd1e995) >>> 0; const r = () => { s = (s * 1103515245 + 12345) % 4294967296; return Math.floor(s / 429496729.6); }; v.parts = { w: r(), f: r(), c: r(), b: r() }; });
    return this.vehicles;
  }
  planTrip(v, fromNode, tree) {
    const home = v.home || this.base;
    tree = tree || (fromNode === home.node ? this.anyBaseTree(home) : this.dijkstra(fromNode));
    let dest = null, poi = null, tries = 0;
    while (!dest && tries++ < 60) {
      if (Math.random() < 0.45) { poi = this.pois()[Math.floor(Math.random() * this.pois().length)]; dest = this.poiStop(poi); }
      else { dest = this.roads[Math.floor(Math.random() * this.roads.length)]; poi = null; }
      if (!dest) continue;
      const d = tree.dist[dest.i];
      if (dest.adj.length < 2 || dest === fromNode || !isFinite(d) || d < 900 || d > 14000) { dest = null; continue; }
      // don't send more vehicles to a stop than it can work through
      if (this.committed(dest) >= 3) dest = null;
    }
    if (!dest) { v.outPts = null; return; }
    const path = this.pathFrom(tree, dest); if (!path) { v.outPts = null; return; }
    const P = (m, node) => ({ x: m.x, y: m.y, node: node || null });
    const road = path.map(n => P(this.nodeM(n), n));
    v.tripNo++; v.destNode = dest; v.pendingCommit = dest;
    v.outPts = fromNode === home.node ? [P(v.slot || home.gate), P(home.gate), ...road] : road;
    v.destSite = !!(poi && poi.site); v.equipMove = null;
    if (poi && poi.site && v.a.type === 'truck' && Math.random() < 0.5) {
      const equip = ['Forklift', 'Scissor lift', 'Mini excavator', 'Skid steer', 'Telehandler'][Math.floor(Math.random() * 5)];
      let from = null, bd = 1e12; const fm = this.nodeM(fromNode); this.pois().forEach(p => { const pm = this.fromLngLat(p.lng, p.lat); const d = (pm.x - fm.x) ** 2 + (pm.y - fm.y) ** 2; if (d < bd) { bd = d; from = p; } });
      const fromName = fromNode === home.node ? home.name : (from ? from.name.split(', ')[0] : 'previous stop');
      v.destName = poi.name; v.purpose = 'Equipment move, ' + equip.toLowerCase() + ' from ' + fromName; v.equipMove = equip; v.cargo = [equip + ', 1 unit, chained on flatbed']; return;
    }
    if (!poi) { let best = null, bd = 1e12; const dm = this.nodeM(dest); this.pois().forEach(p => { const pm = this.fromLngLat(p.lng, p.lat); const d = (pm.x - dm.x) ** 2 + (pm.y - dm.y) ** 2; if (d < bd) { bd = d; best = p; } }); v.destName = 'Customer stop near ' + best.name; v.purpose = v.a.type === 'truck' ? 'Scheduled freight drop for a regional account' : v.a.type === 'van' ? 'Service call, on-site repair and parts swap' : 'Client visit'; }
    else { v.destName = poi.name; v.purpose = poi.purpose[v.a.type]; }
    let s = v.a.pSeed + v.tripNo * 7919; const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
    v.cargo = this.cargoFor(v.a, poi, rnd);
  }
  backPts(v) {
    const home = v.home || this.base, path = this.pathFrom(this.anyBaseTree(home), v.destNode); if (!path) return null;
    const P = (m, node) => ({ x: m.x, y: m.y, node: node || null });
    return [...path.slice().reverse().map(n => P(this.nodeM(n), n)), P(home.gate), P(v.slot)];
  }
  // a POI is served from any of the streets around it, not one kerb node, spreads arrivals across the block
  poiStop(p) {
    if (!p.stops) {
      const pm = this.fromLngLat(p.lng, p.lat), R = (p.site ? 260 : 420) ** 2;
      p.stops = this.roads.filter(n => { if (n.adj.length < 2) return false; const m = this.nodeM(n); return (m.x - pm.x) ** 2 + (m.y - pm.y) ** 2 < R; });
      if (!p.stops.length && p.node) p.stops = [p.node];
    }
    if (!p.stops.length) return null;
    // prefer the least-committed of a few candidates
    let best = null, bc = 1e9;
    for (let i = 0; i < 4; i++) { const n = p.stops[Math.floor(Math.random() * p.stops.length)]; const c = this.committed(n); if (c < bc) { bc = c; best = n; } if (!c) break; }
    return best;
  }
  committed(node) { return (this._commit && this._commit.get(node.i)) || 0; }
  commitTo(node) { this._commit = this._commit || new Map(); this._commit.set(node.i, this.committed(node) + 1); }
  releaseCommit(node) { if (!node || !this._commit) return; const c = this.committed(node) - 1; if (c > 0) this._commit.set(node.i, c); else this._commit.delete(node.i); }
  startLeg(v, phase, pts) {
    // a vehicle occupies its destination from the moment it sets off until it pulls away again
    if (phase === 'out') { this.releaseCommit(v.committedNode); v.committedNode = v.pendingCommit || null; if (v.committedNode) this.commitTo(v.committedNode); }
    else if (phase === 'back') { this.releaseCommit(v.committedNode); v.committedNode = null; }
    v.phase = phase; v.pts = pts; v.seg = 0; v.t = 0; v.speed = 0; v.travelled = 0; v.cleared = false; v.waitUntil = 0; v.stopAtNext = false; v.lane = 0;
    let L = 0; for (let i = 0; i < pts.length - 1; i++) L += Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y); v.legLen = L || 1;
  }
  placeAt(v, frac) {
    let d = v.legLen * frac; v.travelled = d;
    for (let i = 0; i < v.pts.length - 1; i++) {
      const A = v.pts[i], B = v.pts[i + 1], L = Math.hypot(B.x - A.x, B.y - A.y);
      if (d <= L || i === v.pts.length - 2) { v.seg = i; v.t = Math.min(d, L); const f = L ? v.t / L : 1; v.mx = A.x + (B.x - A.x) * f; v.my = A.y + (B.y - A.y) * f; v.heading = v.trailerHeading = Math.atan2(B.x - A.x, B.y - A.y) * 180 / Math.PI; v.speed = 6 + Math.random() * 8; return; }
      d -= L;
    }
  }
  // try up to 8 random positions on the leg that keep a clear headway from vehicles already placed
  placeFree(v, occ) {
    for (let k = 0; k < 8; k++) {
      this.placeAt(v, Math.random());
      const A = v.pts[v.seg], B = v.pts[v.seg + 1]; if (!A.node || !B.node) continue;
      const key = this.segKey(A, B), list = occ.get(key) || [];
      v.lane = Math.floor(Math.random() * this.lanesFor(A, B));
      if (list.every(w => w.lane !== v.lane || Math.abs(w.t - v.t) > (w.len + v.len) / 2 + 4)) { list.push(v); occ.set(key, list); return true; }
    }
    return false;
  }
  // park just off the carriageway while dwelling so the road stays clear
  arrive(v, phase, now, randomize) {
    const A = v.pts[v.seg], B = v.pts[v.seg + 1]; const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
    v.phase = phase; v.speed = 0; v.mx = B.x + (dy / L) * 5.5; v.my = B.y - (dx / L) * 5.5; v.nx = dy / L; v.ny = -dx / L;
    if (v.a.type === 'car') { this.beginActs(v, now, 'site', randomize); return; }
    // docks per destination: big industrial/warehouse sites work several bays at once, small storefronts one
    this.sites = this.sites || new Map(); const key = v.destNode ? v.destNode.i : Math.round(B.x) + ':' + Math.round(B.y);
    let site = this.sites.get(key);
    if (!site) {
      const nm = v.destName || '';
      const bays = /construction|work zone|logistics|distribution|industrial|warehouse|cross-dock|commerce|business park|airport|yard|siding|campus/i.test(nm) ? 4 : /mall|outlet|retail|center|centre|resort|casino|hospital|market|district|park|plaza/i.test(nm) ? 3 : 2;
      site = { bays, active: new Array(bays).fill(null), q: [], sx: v.mx, sy: v.my, fx: dx / L, fy: dy / L, nx: v.nx, ny: v.ny };
      this.sites.set(key, site);
    }
    v.site = site;
    const free = site.active.indexOf(null);
    if (free >= 0) { site.active[free] = v; v.bay = free; this.placeAtBay(site, v); this.beginActs(v, now, 'site', randomize); return; }
    site.q.push(v); this.layoutQueue(site, now);
  }
  // bays sit side by side along the curb, each pulled a little further off the road
  placeAtBay(site, v) {
    const off = (v.bay || 0) * (v.len + 5);
    v.mx = site.sx - site.fx * off; v.my = site.sy - site.fy * off;
    v.heading = v.trailerHeading = Math.atan2(site.fx, site.fy) * 180 / Math.PI;
  }
  layoutQueue(site, now) {
    // waiting vehicles stage in staggered rows on the destination's lot, clear of the traffic lane
    const perRow = 4, laneClear = 13;
    site.q.forEach((w, i) => {
      const row = Math.floor(i / perRow), col = i % perRow;
      const along = site.bays * 14 + 8 + col * (w.len + 4), lat = laneClear + row * 7.5;
      w.mx = site.sx - site.fx * along + site.nx * lat; w.my = site.sy - site.fy * along + site.ny * lat;
      w.heading = w.trailerHeading = Math.atan2(site.fx, site.fy) * 180 / Math.PI;
      w.act = [{ label: 'Waiting for dock', detail: 'Staged in the lot, #' + (i + 1) + ' of ' + site.q.length + ' in line', dur: 1e9 }]; w.actIdx = 0; w.actStart = now; w.waitUntil = now + 1e9;
    });
  }
  releaseSite(v, now) {
    const site = v.site; v.site = null; const bay = v.bay; v.bay = null;
    if (!site || bay == null || site.active[bay] !== v) return;
    const next = site.q.shift() || null;
    site.active[bay] = next;
    if (next) { next.bay = bay; this.placeAtBay(site, next); this.beginActs(next, now, 'site'); }
    if (site.q.length) this.layoutQueue(site, now);
  }
  // departure from a destination: head home if a bay is free, otherwise chain straight to the next job
  entryClear(pts, v, groups) {
    if (!groups || !pts || !pts[0].node || !pts[1].node) return true;
    const g = groups.get(this.segKey(pts[0], pts[1])); if (!g) return true;
    const lanes = this.lanesFor(pts[0], pts[1]);
    for (let k = 0; k < lanes; k++) { const lane = (v.lane + k) % lanes; if (g.every(w => w.lane !== lane || w.t > (w.len + v.len) / 2 + 1)) { v.lane = lane; return true; } }
    return false;
  }
  departDest(v, now, groups) {
    if (!v.nextLeg) {
      // head home only ~35% of the time when a bay is free, real fleets chain jobs
      const s = Math.random() < 0.35 ? this.takeSlot(v.home) : null;
      if (s) { v.slot = s; const pts = this.backPts(v); if (pts) v.nextLeg = { phase: 'back', pts }; else this.freeSlot(v); }
      if (!v.nextLeg) { this.planTrip(v, v.destNode); if (v.outPts) v.nextLeg = { phase: 'out', pts: v.outPts }; else { v.waitUntil = now + 4; return; } }
    }
    if (!this.entryClear(v.nextLeg.pts, v, groups)) { v.waitUntil = now + 0.4 + Math.random() * 0.6; return; }
    this.startLeg(v, v.nextLeg.phase, v.nextLeg.pts); v.nextLeg = null; v.act = null; this.releaseSite(v, now); this.joinGroup(v, groups);
  }
  joinGroup(v, groups) {
    if (!groups || !v.pts) return; const k = this.segKey(v.pts[v.seg], v.pts[v.seg + 1]); if (k < 0) return;
    const g = groups.get(k); if (g) { if (!g.includes(v)) g.push(v); } else groups.set(k, [v]);
  }
  segKey(A, B) { return A.node && B.node ? A.node.i * 65536 + B.node.i : -1; }
  stepVehicle(v, dt, now, groups) {
    if (v.still) return;
    if (v.phase === 'atBase' || v.phase === 'atDest') {
      v.speed = 0;
      if (now >= v.waitUntil) {
        if (v.act && v.actIdx < v.act.length - 1) { v.actIdx++; v.actStart = now; v.waitUntil = now + v.act[v.actIdx].dur; return; }
        if (v.phase === 'atBase') { if (!v.outPts) this.planTrip(v, v.home.node); if (v.outPts) { this.startLeg(v, 'out', v.outPts); this.freeSlot(v); v.act = null; this.joinGroup(v, groups); } else v.waitUntil = now + 5; }
        else this.departDest(v, now, groups);
      }
      return;
    }
    if (!v.pts) return;
    const ACC = 1.6 + v.seed * 1.2, DEC = 2.8 + v.seed * 1.0;
    const A = v.pts[v.seg], B = v.pts[v.seg + 1];
    const len = Math.hypot(B.x - A.x, B.y - A.y) || 0.01;
    const rem = len - v.t;
    const lotLeg = !A.node || !B.node;
    const lastSeg = v.seg === v.pts.length - 2;
    const lim = lotLeg ? 3.5 : Math.min(A.node.lim || 12.5, B.node.lim || 12.5);
    let desired = Math.min(lim, v.a.type === 'truck' ? 27 : 33) * (0.88 + v.seed * 0.2);
    const junction = B.node && B.node.adj.length >= 3;
    if (lastSeg) desired = Math.min(desired, Math.sqrt(2 * DEC * Math.max(rem, 0)) + 0.4);
    else if (v.stopAtNext && !v.cleared) {
      const line = len - Math.min(9, len * 0.45), remS = line - v.t;
      if (remS <= 0.4 && v.speed < 0.6) {
        if (!v.waitUntil) v.waitUntil = now + 1 + Math.random() * 3;
        if (now >= v.waitUntil) { v.cleared = true; v.waitUntil = 0; }
        desired = 0; v.speed = 0;
      } else desired = Math.min(desired, Math.sqrt(2 * DEC * Math.max(remS, 0)));
    } else if (junction && !v.cleared && lim < 17) desired = Math.min(desired, Math.max(desired * 0.6, Math.sqrt(2 * DEC * Math.max(rem, 0)) + 3));
    // car-following: nearest vehicle ahead on this directed segment, else the tail of the next one
    let latT = 1.3;
    if (!lotLeg && groups) {
      const half = v.len / 2; let lead = null, gap = Infinity;
      const same = groups.get(this.segKey(A, B));
      if (same) for (const w of same) { if (w === v || w.lane !== v.lane || w.t < v.t || (w.t === v.t && w.id < v.id)) continue; const g = w.t - v.t - w.len / 2 - half; if (g < gap) { gap = g; lead = w; } }
      if (!lead && !lastSeg) { const C = v.pts[v.seg + 2]; const nx = C && C.node ? groups.get(this.segKey(B, C)) : null; if (nx) for (const w of nx) { if (w.lane !== v.lane) continue; const g = rem + w.t - w.len / 2 - half; if (g < gap) { gap = g; lead = w; } } }
      // overtake: if the lead is crawling and an adjacent lane is open alongside, shift into it
      if (lead && gap < 30 && lead.speed < desired * 0.6) { const lanes = this.lanesFor(A, B); for (let k = 1; k < lanes && lead; k++) { const ln = (v.lane + k) % lanes; const clear = !same || same.every(w => w === v || w.lane !== ln || Math.abs(w.t - v.t) > (w.len + v.len) / 2 + 8); if (clear) { v.lane = ln; lead = null; gap = Infinity; } } }
      if (lead) { const MIN = 2.0, T = 1.0, free = Math.max(gap - MIN, 0); desired = Math.min(desired, Math.max(0, Math.min(lead.speed + free / T, lead.speed * 0.9 + Math.sqrt(2 * DEC * free)))); v.leadRef = lead; v.leadGap = gap; } else v.leadRef = null;
      const opp = groups.get(this.segKey(B, A));
      if (opp) { for (const w of opp) { if (Math.abs((len - w.t) - v.t) < 40) { latT = 2.7; break; } } }
    }
    v.latT = latT + (v.lane || 0) * 3.2; v.lat += (v.latT - v.lat) * Math.min(1, dt * 3); v.desired = desired;
    v.speed += Math.max(-DEC * dt, Math.min(ACC * dt, desired - v.speed));
    if (v.speed < 0.05 && desired < 0.05) v.speed = 0;
    let adv = v.speed * dt;
    if (v.leadRef && v.leadRef.pts && v.leadRef.pts[v.leadRef.seg] === A) { const maxT = v.leadRef.t - v.leadRef.len / 2 - v.len / 2 - 0.6; if (v.t + adv > maxT && maxT > v.t) { adv = Math.max(0, maxT - v.t); v.speed = Math.min(v.speed, v.leadRef.speed); } }
    v.t += adv; v.travelled += adv;
    if (v.t >= len) {
      if (lastSeg) {
        v.t = len; v.speed = 0; v.mx = B.x; v.my = B.y;
        if (v.phase === 'out') { this.arrive(v, 'atDest', now); }
        else { v.phase = 'atBase'; v.heading = v.home.heading + 180; this.planTrip(v, v.home.node); this.beginActs(v, now, 'depot'); }
        return;
      }
      const N0 = v.pts[v.seg + 2];
      if (N0 && !this.entryClear([B, N0], v, groups)) { v.t = len - 0.01; v.speed = 0; v.travelled -= adv; }
      else {
      v.t -= len; v.seg++; v.cleared = false; v.waitUntil = 0; this.joinGroup(v, groups);
      const N = v.pts[v.seg + 1];
      v.stopAtNext = !!(N.node && N.node.adj.length >= 3 && (N.node.lim || 0) < 15) && Math.hypot(N.x - v.pts[v.seg].x, N.y - v.pts[v.seg].y) > 25 && Math.random() < 0.08 + v.seed * 0.08;
      if (v.lane >= this.lanesFor(v.pts[v.seg], N)) v.lane = 0;
      }
    }
    const A2 = v.pts[v.seg], B2 = v.pts[v.seg + 1];
    const dx = B2.x - A2.x, dy = B2.y - A2.y, len2 = Math.hypot(dx, dy) || 0.01, f = Math.min(v.t / len2, 1);
    const lat = (!A2.node || !B2.node) ? 0 : v.lat;
    v.mx = A2.x + dx * f + (dy / len2) * lat; v.my = A2.y + dy * f - (dx / len2) * lat;
    const target = Math.atan2(dx, dy) * 180 / Math.PI;
    if (v.speed > 0.1) { let d = target - v.heading; d = ((d + 540) % 360) - 180; v.heading += d * Math.min(1, dt * 7); }
    let td = v.heading - v.trailerHeading; td = ((td + 540) % 360) - 180;
    v.trailerHeading += td * Math.min(1, dt * (0.6 + v.speed * 0.18));
  }

  // ---------- map layers: pins, trace, fade ----------
  pinsGeo() {
    const sel = this.state.selId;
    return { type: 'FeatureCollection', features: this.vehicles.filter(v => this.liveVis(v)).map(v => ({ type: 'Feature', geometry: { type: 'Point', coordinates: this.toLngLat(v.mx, v.my) }, properties: { hue: v.a.hue, sel: v.id === sel ? 1 : 0, hov: v.id === this.hoverId ? 1 : 0 } })) };
  }
  ensurePins(map) {
    if (map.getSource('fm-veh')) return;
    map.addSource('fm-veh', { type: 'geojson', data: this.pinsGeo() });
    map.addLayer({ id: 'fm-veh-hov', type: 'circle', source: 'fm-veh', filter: ['==', ['get', 'hov'], 1], paint: { 'circle-radius': 14, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': 'rgba(63,227,155,0.9)', 'circle-stroke-width': 2 } });
    map.addLayer({ id: 'fm-veh-pins', type: 'circle', source: 'fm-veh', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, ['case', ['==', ['get', 'sel'], 1], 6, 2.5], 16, ['case', ['==', ['get', 'sel'], 1], 9, 5]], 'circle-color': ['get', 'hue'], 'circle-stroke-color': ['case', ['==', ['get', 'sel'], 1], '#3FE39B', '#0B0D0C'], 'circle-stroke-width': ['case', ['==', ['get', 'sel'], 1], 3, 1.2] } });
  }
  traceGeo(v) {
    const pts = v && (v.phase === 'atBase' || v.phase === 'parked' ? v.outPts : v.pts);
    if (!pts) return { type: 'FeatureCollection', features: [] };
    const coords = pts.map(p => this.toLngLat(p.x, p.y));
    return { type: 'FeatureCollection', features: [
      { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} },
      { type: 'Feature', geometry: { type: 'Point', coordinates: coords[0] }, properties: { end: 'base' } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: coords[coords.length - 1] }, properties: { end: 'dest' } }
    ] };
  }
  ensureTrace(map) {
    if (map.getSource('fm-trace')) return;
    map.addSource('fm-trace', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({ id: 'fm-trace-line', type: 'line', source: 'fm-trace', filter: ['==', '$type', 'LineString'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#F5C542', 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2, 17, 5], 'line-opacity': 0.95 } });
    map.addLayer({ id: 'fm-trace-pts', type: 'circle', source: 'fm-trace', filter: ['==', '$type', 'Point'], paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 4, 17, 7], 'circle-color': ['match', ['get', 'end'], 'dest', '#F5C542', '#0B0D0C'], 'circle-stroke-color': '#F5C542', 'circle-stroke-width': 2.5 } });
  }
  updateTrace() {
    const map = this.map; if (!map || !map.getSource('fm-trace') || !this.vehicles) return;
    const id = this.hoverId || this.state.selId;
    const v = this.vehicles.find(x => x.id === id);
    const key = v ? v.id + ':' + v.tripNo + ':' + v.phase : '';
    if (key === this._traceKey) return; this._traceKey = key;
    map.getSource('fm-trace').setData(this.traceGeo(v));
  }
  // buildings fade with distance from the focus point; only re-evaluated once the camera settles
  updateBuildingFade() {
    const map = this.map; if (!map || !this.fadeRings) return;
    const c = map.getCenter(); const pt = { type: 'Point', coordinates: [c.lng, c.lat] };
    const R1 = 240, R2 = 520, notDepot = this.bases ? ['!', ['any', ...this.bases.map(b => ['within', b.parcel])]] : ['boolean', true];
    this.fadeRings.forEach(({ ids, ring }) => {
      const f = ring === 0 ? ['<', ['distance', pt], R1] : ring === 1 ? ['all', ['>=', ['distance', pt], R1], ['<', ['distance', pt], R2]] : ['>=', ['distance', pt], R2];
      ids.forEach(id => { try { map.setFilter(id, ['all', f, notDepot]); } catch (e) { this.fadeRings = null; } });
    });
    try { map.setFilter('fm-building-outline', notDepot); } catch (e) { /* ignore */ }
  }
  startSim() {
    if (this.simRaf) return; window.__fm = this;
    let last = performance.now(), lastUi = 0, lastPins = 0;
    const loop = (ts) => {
      this.simRaf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (ts - last) / 1000); last = ts;
      if (!this.vehicles || !this.map) return;
      const now = ts / 1000;
      const groups = this._groups || (this._groups = new Map()); groups.clear();
      for (const v of this.vehicles) { if (!v.pts || (v.phase !== 'out' && v.phase !== 'back')) continue; const k = this.segKey(v.pts[v.seg], v.pts[v.seg + 1]); if (k < 0) continue; const g = groups.get(k); if (g) g.push(v); else groups.set(k, [v]); }
      for (const v of this.vehicles) this.stepVehicle(v, dt, now, groups);
      this.updateTrace();
      if (this.follow && !this.map.isEasing()) { const f = this.vehicles.find(v => v.id === this.follow); if (f) this.map.jumpTo({ center: this.toLngLat(f.mx, f.my) }); }
      if (this.state.mapMode !== '2d') this.map.triggerRepaint();
      else if (ts - lastPins > 66 && this.map.getSource('fm-veh')) { lastPins = ts; this.map.getSource('fm-veh').setData(this.pinsGeo()); }
      if (ts - lastUi > 500) { lastUi = ts; this.setState({ tick: ts }); }
    };
    this.simRaf = requestAnimationFrame(loop);
  }
  stopSim() { if (this.simRaf) cancelAnimationFrame(this.simRaf); this.simRaf = null; }
  mph(v) { return Math.round(v.speed * 2.23694); }
  vClass(v) { if (v.still || v.phase === 'parked' || v.phase === 'atBase') return 'parked'; if (v.speed > 0.3) return 'moving'; return 'onsite'; }
  liveVis(v) { const f = this.state.liveFilter || 'all'; return f === 'all' || v.id === this.state.selId || this.vClass(v) === f; }
  toast(msg) { clearTimeout(this._toastT); this.setState({ toastText: msg, toastOn: true }); this._toastT = setTimeout(() => this.setState({ toastOn: false }), 2600); }
  openDetailFor(id) { this.setState({ screen: 'detail', detailId: id, moreSheet: false }); }
  vehicleState(v) {
    if (v.still || v.phase === 'parked') return { text: v.a.still === 'In shop' ? 'In shop at depot' : 'Parked at depot', dot: 'rgba(255,255,255,0.45)' };
    if (v.phase === 'atBase') return { text: 'At yard', dot: 'rgba(255,255,255,0.45)' };
    if (v.phase === 'atDest') return { text: 'On site', dot: '#F0A22E' };
    const leg = v.phase === 'back' ? 'Returning' : 'Outbound';
    if (v.speed < 0.3) return { text: leg + ', stopped', dot: '#F0A22E' };
    return { text: leg, dot: '#34D07F' };
  }
  legProgress(v) { return v.phase === 'out' || v.phase === 'back' ? Math.min(1, v.travelled / v.legLen) : v.phase === 'atDest' ? 1 : 0; }
  tripText(v) {
    const yard = v.home ? 'Northrange ' + v.home.name : 'Northrange depot';
    if (v.still) return { where: v.a.still === 'In shop' ? 'In the shop, ' + yard : 'Parked at ' + yard, purpose: v.a.still === 'In shop' ? 'Waiting on parts, not dispatchable' : 'Held in reserve, no trip assigned today' };
    if (!v.destName) return { where: yard, purpose: 'Awaiting dispatch' };
    const det = this.actDetail(v), lab = this.actLabel(v);
    if (v.phase === 'atBase') return { where: (lab || 'Loading') + ' at ' + yard + ', next: ' + v.destName, purpose: det ? det + ', ' + v.purpose : v.purpose };
    if (v.phase === 'out') return { where: 'Heading to ' + v.destName, purpose: v.purpose };
    if (v.phase === 'atDest') return { where: 'At ' + v.destName + (lab ? ', ' + lab : ''), purpose: det ? det + ', ' + v.purpose : v.purpose };
    return { where: 'Returning to ' + yard + ' from ' + v.destName, purpose: v.purpose + ', complete' };
  }

  // ---------- driver portraits (low-poly, offscreen three.js) ----------
  portrait(a) {
    this._portraits = this._portraits || {};
    if (this._portraits[a.id]) return this._portraits[a.id];
    const T = window.THREE; if (!T) return '';
    let s = a.pSeed || 1; const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
    if (!this._pr) { this._pr = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); this._pr.setSize(160, 160); }
    const r = this._pr, scene = new T.Scene();
    scene.background = new T.Color(0x0f1530);
    scene.add(new T.AmbientLight(0xffffff, 0.55));
    const key = new T.DirectionalLight(0xffffff, 0.9); key.position.set(1, 1.4, 2); scene.add(key);
    const fill = new T.DirectionalLight(0x3e8dcf, 0.35); fill.position.set(-2, 0.5, 1); scene.add(fill);
    const cam = new T.PerspectiveCamera(30, 1, 0.1, 50); cam.position.set(0, 0.15, 5.2); cam.lookAt(0, 0.1, 0);
    const skin = [0xf6d3b8, 0xe8b894, 0xc98e63, 0xa26a42, 0x77482a, 0x4b2c1a][Math.floor(rnd() * 6)];
    const hairC = [0x1a1210, 0x3b2418, 0x6b4a2b, 0xb98a4a, 0xd9c07a, 0x8a8a8a, 0xb23a2f][Math.floor(rnd() * 7)];
    const M = c => new T.MeshLambertMaterial({ color: c, flatShading: true });
    const head = new T.Mesh(new T.SphereGeometry(1, 7, 6), M(skin)); head.scale.set(0.95, 1.05, 0.95); scene.add(head);
    const neck = new T.Mesh(new T.CylinderGeometry(0.32, 0.36, 0.5, 6), M(skin)); neck.position.y = -1.15; scene.add(neck);
    const shirt = new T.Mesh(new T.BoxGeometry(2.6, 1.2, 1.1), M(a.hue.startsWith('#') ? a.hue : 0x556066)); shirt.position.y = -1.95; scene.add(shirt);
    [-1, 1].forEach(x => { const e = new T.Mesh(new T.SphereGeometry(0.2, 5, 4), M(skin)); e.position.set(x * 0.95, 0, 0); scene.add(e); });
    const eye = x => { const e = new T.Mesh(new T.SphereGeometry(0.1, 6, 5), new T.MeshBasicMaterial({ color: 0x000000 })); e.position.set(x * 0.36, 0.12, 0.88); scene.add(e); };
    eye(-1); eye(1);
    const smile = new T.Mesh(new T.TorusGeometry(0.34, 0.045, 5, 12, Math.PI), new T.MeshBasicMaterial({ color: 0x000000 })); smile.position.set(0, -0.32, 0.86); smile.rotation.z = Math.PI; smile.rotation.x = -0.25; scene.add(smile);
    const style = Math.floor(rnd() * 6); const hm = M(hairC);
    if (style === 0) { const c = new T.Mesh(new T.SphereGeometry(1.02, 7, 4, 0, Math.PI * 2, 0, Math.PI * 0.5), hm); c.position.y = 0.12; scene.add(c); }
    else if (style === 1) { const c = new T.Mesh(new T.SphereGeometry(1.0, 7, 4, 0, Math.PI * 2, 0, Math.PI * 0.42), hm); c.position.y = 0.1; scene.add(c); const bun = new T.Mesh(new T.SphereGeometry(0.42, 6, 5), hm); bun.position.set(0, 0.85, -0.7); scene.add(bun); }
    else if (style === 2) { const c = new T.Mesh(new T.SphereGeometry(1.03, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), hm); c.position.y = 0.1; scene.add(c); [-1, 1].forEach(x => { const l = new T.Mesh(new T.BoxGeometry(0.42, 1.7, 0.7), hm); l.position.set(x * 0.85, -0.55, -0.15); scene.add(l); }); }
    else if (style === 3) { const c = new T.Mesh(new T.SphereGeometry(1.1, 6, 5), hm); c.scale.set(1.1, 0.75, 1.1); c.position.y = 0.55; scene.add(c); }
    else if (style === 4) { const c = new T.Mesh(new T.SphereGeometry(1.0, 7, 4, 0, Math.PI * 2, 0, Math.PI * 0.35), hm); c.position.y = 0.12; scene.add(c); const q = new T.Mesh(new T.BoxGeometry(0.7, 0.5, 0.5), hm); q.position.set(0, 0.55, 0.35); q.rotation.x = -0.4; scene.add(q); }
    if (rnd() < 0.3) { const b = new T.Mesh(new T.BoxGeometry(1.1, 0.35, 0.5), hm); b.position.set(0, -0.62, 0.8); scene.add(b); }
    head.rotation.y = -0.18 + rnd() * 0.36; head.rotation.x = 0.05;
    r.render(scene, cam);
    const url = r.domElement.toDataURL('image/png');
    scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    return this._portraits[a.id] = url;
  }

  // ---------- low-poly vehicle models (three.js, instanced, mix-and-match parts) ----------
  // part entry: [geo, x, y, z, color, rz]. Vertex colour + a per-vertex 'tint' flag (1 = takes the vehicle's paint, 0 = fixed trim colour).
  partsGeometry(parts) {
    const T = window.THREE; const pos = [], nor = [], col = [], tnt = [];
    parts.forEach(([geo, x, y, z, c, rz]) => {
      const g = geo.toNonIndexed(); const m = new T.Matrix4().makeTranslation(x, y, z); if (rz) m.multiply(new T.Matrix4().makeRotationZ(rz)); g.applyMatrix4(m);
      const p = g.attributes.position.array, n = g.attributes.normal.array; const cc = new T.Color(c === 'P' ? 0xffffff : c), t = c === 'P' ? 1 : 0;
      for (let i = 0; i < p.length; i += 3) { pos.push(p[i], p[i + 1], p[i + 2]); nor.push(n[i], n[i + 1], n[i + 2]); col.push(cc.r, cc.g, cc.b); tnt.push(t); }
      g.dispose();
    });
    const out = new T.BufferGeometry();
    out.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); out.setAttribute('color', new T.Float32BufferAttribute(col, 3)); out.setAttribute('tint', new T.Float32BufferAttribute(tnt, 1));
    return out;
  }
  // 10 variants per slot per type; every vehicle is a random pick from each slot
  partLibrary() {
    if (this._lib) return this._lib;
    const T = window.THREE, B = (w, l, h) => new T.BoxGeometry(w, l, h), C = (r, h, n) => new T.CylinderGeometry(r, r, h, n || 12), RZ = Math.PI / 2, RX = Math.PI / 2;
    const P = 'P', GLASS = 0x0f1a22, DARK = 0x111416, LIGHT = 0xe8ecea, HL = 0xfff1b8, TL = 0xff3b30, CHROME = 0xd8dde0, WOOD = 0x9c6b3c, WOOD2 = 0x7a4f2a, STEEL = 0x6b7378, TANK = 0xc9cfd2, YEL = 0xf2b418;
    const G = parts => this.partsGeometry(parts);
    const lamps = (w, y, z, kind, c, half) => kind === 'slim' ? [[B(0.5, 0.06, 0.1), half, y, z, c], [B(0.5, 0.06, 0.1), -half, y, z, c]] : kind === 'round' ? [[C(0.14, 0.06, 10), half, y, z, c, 0, RX], [C(0.14, 0.06, 10), -half, y, z, c, 0, RX]] : [[B(0.36, 0.06, 0.2), half, y, z, c], [B(0.36, 0.06, 0.2), -half, y, z, c]];
    // cylinders for lamps need x-rotation; handle via a pre-rotated geometry
    const RC = (r, h, n) => { const g = C(r, h, n); g.rotateX(RX); return g; };
    const rlamps = (y, z, c, half) => [[RC(0.14, 0.06, 10), half, y, z, c], [RC(0.14, 0.06, 10), -half, y, z, c]];
    const lampset = (kind, y, z, c, half) => kind === 'round' ? rlamps(y, z, c, half) : lamps(0, y, z, kind, c, half);

    // ---- CAR (w 1.9, y: front 0.8..2.3, cabin -1.2..0.8, back -2.3..-1.2) ----
    const carFront = [[0.72, 'slim', 'lip'], [0.9, 'box', null], [1.2, 'box', 'bar'], [1.25, 'box', 'bull'], [0.95, 'slim', null], [0.8, 'slim', 'lip'], [0.95, 'box', null], [1.1, 'slim', null], [0.9, 'round', 'scoop'], [1.0, 'round', null]].map(([h, lamp, extra]) => {
      const p = [[B(1.9, 1.5, h - 0.35), 0, 1.55, (h + 0.35) / 2, P], [B(1.95, 0.2, 0.28), 0, 2.22, 0.5, DARK], [B(0.9, 0.06, 0.18), 0, 2.33, 0.66, DARK], ...lampset(lamp, 2.33, h - 0.16, HL, 0.62)];
      if (extra === 'lip') p.push([B(1.9, 0.3, 0.08), 0, 2.2, 0.38, DARK]);
      if (extra === 'bar') p.push([B(1.3, 0.16, 0.1), 0, 1.6, h + 0.05, DARK]);
      if (extra === 'bull') p.push([B(1.7, 0.1, 0.5), 0, 2.4, 0.75, CHROME]);
      if (extra === 'scoop') p.push([B(0.6, 0.6, 0.12), 0, 1.3, h + 0.05, P]);
      return G(p);
    });
    const carCabin = [[1.25, 1.6, 0, 'glass'], [1.45, 1.9, 0, 'glass'], [1.85, 2.0, 0, 'glass'], [1.8, 1.3, 0.3, 'glass'], [1.55, 1.9, 0, 'glass'], [1.05, 0.7, 0.55, 'open'], [1.35, 1.9, 0, 'targa'], [1.9, 2.0, 0, 'glass'], [1.55, 2.0, 0, 'glass'], [1.6, 1.7, 0, 'glass']].map(([H, len, yo, kind]) => {
      const p = [[B(1.9, 2.0, 0.55), 0, -0.2, 0.625, P], [B(0.2, 2.0, 0.08), 0.96, -0.2, 0.9, DARK], [B(0.2, 2.0, 0.08), -0.96, -0.2, 0.9, DARK]];
      if (kind === 'open') { p.push([B(1.7, 0.1, 0.5), 0, 0.6, 1.1, GLASS], [B(0.5, 0.5, 0.45), 0.45, -0.2, 1.1, DARK], [B(0.5, 0.5, 0.45), -0.45, -0.2, 1.1, DARK], [B(1.9, 0.6, 0.3), 0, -0.9, 1.0, P]); }
      else { p.push([B(1.72, len, H - 0.9), 0, -0.2 + yo, (H + 0.9) / 2, GLASS], [B(1.78, len * (kind === 'targa' ? 0.35 : 0.62), 0.08), 0, -0.2 + yo + (kind === 'targa' ? -len * 0.3 : 0), H, P], [B(1.8, 0.1, H - 0.9), 0, -0.2 + yo + len / 2 - 0.05, (H + 0.9) / 2, P], [B(1.8, 0.1, H - 0.9), 0, -0.2 + yo - len / 2 + 0.05, (H + 0.9) / 2, P]); }
      return G(p);
    });
    const carBack = [[0.95, 'trunk', 'slim'], [1.0, 'trunk', 'box'], [1.8, 'box', 'box'], [1.1, 'bed', 'box'], [1.45, 'hatch', 'slim'], [0.85, 'spoiler', 'slim'], [1.5, 'wagon', 'box'], [1.85, 'box', 'slim'], [0.95, 'spoiler', 'round'], [1.4, 'hatch', 'box']].map(([H, kind, lamp]) => {
      const p = [[B(1.9, 1.1, (kind === 'bed' ? 0.55 : H - 0.35)), 0, -1.75, kind === 'bed' ? 0.625 : (H + 0.35) / 2, P], [B(1.95, 0.2, 0.28), 0, -2.22, 0.5, DARK], ...lampset(lamp, -2.33, Math.min(H, 1.4) - 0.16, TL, 0.62)];
      if (kind === 'box' || kind === 'wagon' || kind === 'hatch') p.push([B(1.7, 0.06, H - 1.0), 0, -2.3, (H + 1.0) / 2 - 0.05, GLASS]);
      if (kind === 'bed') p.push([B(0.12, 1.1, 0.5), 0.89, -1.75, 1.15, P], [B(0.12, 1.1, 0.5), -0.89, -1.75, 1.15, P], [B(1.9, 0.1, 0.5), 0, -2.25, 1.15, P], [B(1.6, 0.9, 0.3), 0, -1.7, 1.05, WOOD]);
      if (kind === 'spoiler') p.push([B(1.6, 0.25, 0.06), 0, -2.15, H + 0.18, DARK], [B(0.08, 0.2, 0.2), 0.6, -2.15, H + 0.06, DARK], [B(0.08, 0.2, 0.2), -0.6, -2.15, H + 0.06, DARK]);
      return G(p);
    });
    // ---- VAN (w 2.0, y: front 1.3..3.3, cabin -0.5..1.3, back -3.2..-0.5) ----
    const vanFront = [[1.0, false, 'box'], [1.15, false, 'box'], [2.1, true, 'box'], [2.3, true, 'slim'], [1.1, false, 'round'], [1.25, false, 'slim'], [2.0, true, 'round'], [1.05, false, 'box'], [1.9, true, 'slim'], [1.2, false, 'box']].map(([h, flat, lamp]) => {
      const p = [[B(2.0, 2.0, h - 0.35), 0, 2.3, (h + 0.35) / 2, P], [B(2.05, 0.2, 0.3), 0, 3.22, 0.5, DARK], ...lampset(lamp, 3.33, Math.min(h, 1.5) - 0.2, HL, 0.68)];
      if (flat) p.push([B(1.9, 0.06, 0.9), 0, 3.32, h - 0.55, GLASS]); else p.push([B(1.2, 0.06, 0.24), 0, 3.32, 0.72, DARK]);
      return G(p);
    });
    const vanCabin = [[1.9], [2.1], [2.35], [2.0], [2.5], [1.8], [2.2], [2.05], [2.6], [1.95]].map(([H]) => G([[B(2.0, 1.8, H - 0.35), 0, 0.4, (H + 0.35) / 2, P], [B(1.9, 0.08, H * 0.42), 0, 1.3, H * 0.66, GLASS], [B(0.06, 0.9, H * 0.34), 1.0, 0.5, H * 0.68, GLASS], [B(0.06, 0.9, H * 0.34), -1.0, 0.5, H * 0.68, GLASS]]));

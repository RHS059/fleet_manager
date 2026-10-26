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
    const vanBack = [[1.9, 'box'], [2.35, 'box'], [2.5, 'cube'], [2.4, 'reefer'], [1.9, 'window'], [0.9, 'flat'], [1.1, 'bed'], [2.6, 'step'], [2.1, 'window'], [1.5, 'stake']].map(([H, kind]) => {
      const p = [[B(2.05, 0.2, 0.3), 0, -3.12, 0.5, DARK], [B(0.3, 0.06, 0.2), 0.8, -3.23, 1.0, TL], [B(0.3, 0.06, 0.2), -0.8, -3.23, 1.0, TL]];
      if (kind === 'flat') p.push([B(2.0, 2.7, 0.5), 0, -1.85, 0.6, P], [B(2.1, 2.7, 0.08), 0, -1.85, 0.9, WOOD]);
      else if (kind === 'bed') p.push([B(2.0, 2.7, 0.55), 0, -1.85, 0.625, P], [B(0.12, 2.7, 0.5), 0.94, -1.85, 1.15, P], [B(0.12, 2.7, 0.5), -0.94, -1.85, 1.15, P], [B(2.0, 0.1, 0.5), 0, -3.15, 1.15, P], [B(0.9, 0.9, 0.9), 0.3, -1.6, 1.35, WOOD], [B(0.7, 0.7, 0.7), -0.5, -2.4, 1.25, WOOD2]);
      else if (kind === 'stake') p.push([B(2.0, 2.7, 0.5), 0, -1.85, 0.6, P], ...[-2.9, -1.85, -0.8].flatMap(y => [[B(0.08, 0.08, H - 0.85), 0.98, y, (H + 0.85) / 2, WOOD], [B(0.08, 0.08, H - 0.85), -0.98, y, (H + 0.85) / 2, WOOD]]), [B(0.04, 2.6, 0.12), 1.0, -1.85, H - 0.2, WOOD], [B(0.04, 2.6, 0.12), -1.0, -1.85, H - 0.2, WOOD]);
      else {
        const w = kind === 'cube' || kind === 'reefer' || kind === 'step' ? 2.3 : 2.0, col = kind === 'cube' || kind === 'reefer' ? LIGHT : P;
        p.push([B(w, 2.7, H - 0.35), 0, -1.85, (H + 0.35) / 2, col]);
        if (kind === 'window') p.push([B(w + 0.04, 2.2, 0.55), 0, -1.7, H - 0.6, GLASS]);
        if (kind === 'reefer') p.push([B(1.6, 0.35, 0.9), 0, -0.4, H - 0.6, STEEL]);
        if (kind === 'cube' || kind === 'reefer') p.push([B(w - 0.3, 0.06, H - 0.9), 0, -3.21, (H + 0.7) / 2, STEEL]);
      }
      return G(p);
    });
    // ---- TRUCK CAB (w 2.5, y: front 7.4..9.0, cabin 5.6..7.4; chassis 4.4..9). Back = trailer, pivoting at the hitch (origin) ----
    const cabFront = [[2.2, 1.6, 'box'], [2.0, 1.2, 'round'], [3.6, 0.6, 'box'], [2.4, 1.8, 'box'], [2.1, 1.4, 'slim'], [3.8, 0.6, 'slim'], [2.3, 1.6, 'round'], [1.9, 1.0, 'box'], [2.5, 1.7, 'slim'], [3.5, 0.6, 'box']].map(([h, len, lamp]) => {
      const flat = len < 0.8, y0 = 9.0 - len / 2;
      const p = [[B(2.5, len, h - 0.7), 0, y0, (h + 0.7) / 2, P], [B(2.4, 2.4, 0.9), 0, 6.0, 0.9, DARK], [B(2.6, 0.25, 0.5), 0, 8.95, 0.7, CHROME], [B(1.6, 0.06, 0.7), 0, 9.02, flat ? 1.4 : h - 0.75, CHROME], ...lampset(lamp, 9.03, flat ? 1.9 : h - 0.3, HL, 0.9)];
      if (flat) p.push([B(2.3, 0.06, 1.1), 0, 9.02, h - 0.75, GLASS]);
      if (!flat && len > 1.5) p.push([C(0.14, 0.9, 8), 1.05, 7.7, h + 0.4, CHROME]);
      return G(p);
    });
    const cabCabin = [[3.4, 0, false], [3.6, 1.0, false], [3.9, 1.2, true], [3.3, 0, false], [3.7, 0.8, true], [3.5, 0, false], [3.8, 1.4, false], [3.4, 0.6, false], [4.0, 1.2, true], [3.6, 0, true]].map(([H, sleeper, fairing]) => {
      const p = [[B(2.5, 1.8, H - 0.9), 0, 6.5, (H + 0.9) / 2, P], [B(2.3, 0.06, 1.0), 0, 7.42, H - 0.8, GLASS], [B(0.06, 0.8, 0.8), 1.26, 6.7, H - 0.85, GLASS], [B(0.06, 0.8, 0.8), -1.26, 6.7, H - 0.85, GLASS], [B(0.1, 0.5, 0.06), 1.3, 6.9, 0.95, CHROME], [B(0.1, 0.5, 0.06), -1.3, 6.9, 0.95, CHROME]];
      if (sleeper) p.push([B(2.5, sleeper, H - 0.9), 0, 5.6 - sleeper / 2, (H + 0.9) / 2, P]);
      if (fairing) p.push([B(2.4, 1.6, 0.5), 0, 6.5, H + 0.2, P]);
      p.push([C(0.12, 1.2, 8), 1.1, 5.5, H - 0.3, CHROME]);
      return G(p);
    });
    const tr = (len, H, col) => [[B(2.6, len, H - 1.2), 0, -len / 2 - 0.2, (H + 1.2) / 2, col], [B(2.6, len, 0.5), 0, -len / 2 - 0.2, 0.55, DARK], [B(2.5, 0.06, 0.2), 0, -len - 0.23, 1.0, TL]];
    const flatbed = (len) => [[B(2.6, len, 0.25), 0, -len / 2 - 0.2, 1.05, WOOD], [B(2.6, len, 0.5), 0, -len / 2 - 0.2, 0.55, DARK]];
    const trailer = [
      G(tr(13.4, 4.1, LIGHT)),
      G([...flatbed(13.4), [B(1.4, 1.4, 1.4), 0.5, -2.5, 1.9, WOOD], [B(1.2, 1.2, 1.2), -0.6, -5.0, 1.8, WOOD2], [B(1.4, 2.0, 1.0), 0.2, -8.5, 1.7, WOOD], [B(1.0, 1.0, 1.0), -0.7, -11.5, 1.7, WOOD2]]),
      G([[C(1.2, 12.0, 14), 0, -6.9, 2.5, TANK, RZ], [B(2.6, 12.5, 0.5), 0, -6.4, 0.55, DARK], [B(0.6, 1.2, 0.3), 0, -6.9, 3.85, STEEL], [B(2.5, 0.06, 0.2), 0, -13.03, 1.0, TL]]),
      G([...tr(13.4, 4.1, LIGHT), [B(2.2, 0.6, 1.4), 0, 0.1, 3.2, STEEL]]),
      G([...tr(13.4, 3.9, P), [B(2.7, 12.6, 0.15), 0, -6.9, 1.35, DARK], [B(2.7, 12.6, 0.15), 0, -6.9, 3.85, DARK]]),
      G([...flatbed(12.4), [B(2.44, 12.2, 2.6), 0, -6.3, 2.5, 0x3b6ea8], [B(0.1, 12.2, 0.15), 1.23, -6.3, 2.5, 0x2a4f7a], [B(0.1, 12.2, 0.15), -1.23, -6.3, 2.5, 0x2a4f7a]]),
      G([...flatbed(12.0), [B(2.4, 4.2, 1.6), 0, -6.0, 2.1, YEL], [B(0.4, 0.4, 2.4), 0.6, -6.6, 3.0, DARK], [B(1.6, 1.2, 0.6), 0, -4.0, 2.4, DARK]]),
      G([[B(2.6, 7.5, 2.2), 0, -4.2, 2.3, STEEL], [B(2.6, 7.5, 0.5), 0, -4.2, 0.55, DARK], [B(2.4, 7.0, 0.5), 0, -4.2, 3.5, 0x8a7a5a], [B(2.5, 0.06, 0.2), 0, -7.98, 1.0, TL]]),
      G([...flatbed(13.0), ...[-2.5, -6.0, -9.5].map(y => [B(2.6, 0.12, 2.6), 0, y, 2.5, STEEL]), ...[0.6, 0.0, -0.6].flatMap(x => [[C(0.3, 12.6, 8), x, -6.7, 1.5, WOOD2, RZ], [C(0.28, 12.6, 8), x + 0.3, -6.7, 2.05, WOOD, RZ]]), [C(0.3, 12.6, 8), 0.3, -6.7, 2.6, WOOD2, RZ]]),
      G(tr(8.6, 3.8, LIGHT))
    ];
    // ---- WHEELS: tyre + separate rim + hub. [r, w, rimRatio, rimColour] ----
    const wheelSpec = (r0) => [[r0, 0.36, 0.62, 0x9aa3a8], [r0 + 0.02, 0.4, 0.66, CHROME], [r0 + 0.05, 0.44, 0.58, 0x5a6166], [r0 + 0.06, 0.46, 0.6, 0x9aa3a8], [r0 - 0.02, 0.34, 0.64, 0x2a2e31], [r0, 0.38, 0.7, CHROME], [r0 + 0.03, 0.42, 0.6, 0x7d868c], [r0 + 0.01, 0.36, 0.56, 0x9aa3a8], [r0 + 0.04, 0.44, 0.68, 0xb9c0c4], [r0 - 0.01, 0.36, 0.6, 0x5a6166]];
    const wheel = ([r, w, rim, rc]) => ({ r, geo: G([[C(r, w, 14), 0, 0, 0, DARK, RZ], [C(r * rim, w + 0.04, 12), 0, 0, 0, rc, RZ], [C(r * rim * 0.55, w + 0.07, 10), 0, 0, 0, 0x2b3033, RZ], [C(r * 0.16, w + 0.1, 8), 0, 0, 0, 0x9aa3a8, RZ]]) });
    const lib = {
      car: { f: carFront, c: carCabin, b: carBack, w: wheelSpec(0.34).map(wheel), axles: [[0.95, 1.5], [-0.95, 1.5], [0.95, -1.5], [-0.95, -1.5]] },
      van: { f: vanFront, c: vanCabin, b: vanBack, w: wheelSpec(0.4).map(wheel), axles: [[1.0, 1.9], [-1.0, 1.9], [1.0, -1.7], [-1.0, -1.7]] },
      truck: { f: cabFront, c: cabCabin, b: trailer, w: wheelSpec(0.52).map(wheel), axles: [[1.15, 8.2], [-1.15, 8.2], [1.15, 5.4], [-1.15, 5.4]], trailerAxles: [[1.15, -9.2], [-1.15, -9.2], [1.15, -10.6], [-1.15, -10.6]] }
    };
    // forklift (faces +y) with and without a wooden crate on the forks; a standing driver in a hi-vis vest
    const fk = [[B(1.0, 1.6, 0.8), 0, -0.1, 0.8, YEL], [B(1.0, 0.5, 0.6), 0, -1.0, 0.7, DARK], [B(0.08, 0.08, 2.1), 0.42, 0.85, 1.35, DARK], [B(0.08, 0.08, 2.1), -0.42, 0.85, 1.35, DARK], [B(0.9, 0.1, 0.1), 0, 0.85, 2.3, DARK], [B(0.06, 0.06, 1.0), 0.42, -0.6, 1.7, DARK], [B(0.06, 0.06, 1.0), -0.42, -0.6, 1.7, DARK], [B(0.95, 1.4, 0.06), 0, 0.1, 2.2, DARK], [B(0.5, 0.5, 0.4), 0, -0.4, 1.4, 0x2b3033], [B(0.12, 1.1, 0.06), 0.28, 1.45, 0.32, STEEL], [B(0.12, 1.1, 0.06), -0.28, 1.45, 0.32, STEEL], ...[[0.5, 0.5], [-0.5, 0.5], [0.5, -0.8], [-0.5, -0.8]].map(([x, y]) => [C(0.3, 0.26, 10), x, y, 0.3, DARK, RZ])];
    const crate = [[B(0.95, 0.95, 0.95), 0, 1.55, 0.83, WOOD], [B(0.99, 0.99, 0.08), 0, 1.55, 0.5, WOOD2], [B(0.99, 0.99, 0.08), 0, 1.55, 1.2, WOOD2], [B(0.08, 0.99, 0.95), 0.47, 1.55, 0.83, WOOD2], [B(0.08, 0.99, 0.95), -0.47, 1.55, 0.83, WOOD2]];
    lib.forkEmpty = G(fk); lib.forkCrate = G([...fk, ...crate]);
    lib.person = G([[B(0.16, 0.22, 0.78), 0.1, 0, 0.39, 0x1d2a3a], [B(0.16, 0.22, 0.78), -0.1, 0, 0.39, 0x1d2a3a], [B(0.46, 0.26, 0.62), 0, 0, 1.09, 0xff7a1a], [B(0.5, 0.28, 0.08), 0, 0, 1.0, 0xe8ecea], [B(0.12, 0.2, 0.55), 0.3, 0, 1.05, 0xd9a679], [B(0.12, 0.2, 0.55), -0.3, 0, 1.05, 0xd9a679], [B(0.24, 0.24, 0.26), 0, 0, 1.55, 0xd9a679], [B(0.3, 0.3, 0.1), 0, 0, 1.72, YEL]]);
    return this._lib = lib;
  }
  ensure3D(map) {
    if (this.layer3d || !window.THREE || !this.vehicles) return;
    const self = this, T = window.THREE;
    const layer = {
      id: 'fm-vehicles-3d', type: 'custom', renderingMode: '3d',
      onAdd(map, gl) {
        this.camera = new T.Camera(); this.scene = new T.Scene();
        this.scene.add(new T.AmbientLight(0xffffff, 0.6));
        const d1 = new T.DirectionalLight(0xffffff, 0.9); d1.position.set(0.4, -0.7, 1); this.scene.add(d1);
        const d2 = new T.DirectionalLight(0xa9d4f0, 0.35); d2.position.set(-0.6, 0.6, 0.3); this.scene.add(d2);
        const L = self.partLibrary();
        // paint material: vertex colour, multiplied by the instance colour only where tint == 1
        const mat = new T.MeshLambertMaterial({ vertexColors: true });
        mat.onBeforeCompile = sh => { sh.vertexShader = 'attribute float tint;\n' + sh.vertexShader.replace('#include <color_vertex>', '#ifdef USE_COLOR\n vColor.xyz = color.xyz;\n#endif\n#ifdef USE_INSTANCING_COLOR\n vColor.xyz *= mix(vec3(1.0), instanceColor.xyz, tint);\n#endif'); };
        const plain = new T.MeshLambertMaterial({ vertexColors: true });
        const hullMat = new T.MeshBasicMaterial({ color: 0x35d9b0, side: T.BackSide, transparent: true, opacity: 0.95 });
        const mk = (geo, m, n) => { const im = new T.InstancedMesh(geo, m, Math.max(1, n)); im.instanceMatrix.setUsage(T.DynamicDrawUsage); im.frustumCulled = false; this.scene.add(im); return im; };
        // group vehicles by (type, slot, variant) so each unique part is one instanced draw
        const groups = new Map(), wgroups = new Map();
        self.vehicles.forEach(v => {
          ['f', 'c', 'b'].forEach(s => { const k = v.a.type + s + v.parts[s]; let g = groups.get(k); if (!g) { g = { type: v.a.type, slot: s, geo: L[v.a.type][s][v.parts[s]], list: [] }; groups.set(k, g); } g.list.push(v); });
          const wk = v.a.type + 'w' + v.parts.w; let wg = wgroups.get(wk); if (!wg) { const w = L[v.a.type].w[v.parts.w]; wg = { type: v.a.type, r: w.r, geo: w.geo, list: [] }; wgroups.set(wk, wg); } wg.list.push(v);
        });
        this.groups = [...groups.values()].map(g => { const im = mk(g.geo, mat, g.list.length), hull = mk(g.geo, hullMat, g.list.length); g.list.forEach((v, i) => im.setColorAt(i, new T.Color(v.a.hue.startsWith('#') ? v.a.hue : '#8A9490'))); im.instanceColor.needsUpdate = true; return { ...g, im, hull }; });
        this.wgroups = [...wgroups.values()].map(g => { const per = g.type === 'truck' ? 8 : 4; return { ...g, per, im: mk(g.geo, plain, g.list.length * per) }; });
        this.FK = 260; this.forkE = mk(L.forkEmpty, plain, this.FK); this.forkC = mk(L.forkCrate, plain, this.FK);
        this.people = mk(L.person, plain, self.vehicles.filter(v => v.a.type !== 'truck').length);
        this.ring = new T.Mesh(new T.RingGeometry(3.4, 4.2, 24), new T.MeshBasicMaterial({ color: 0x3FE39B, transparent: true, opacity: 0.85, side: T.DoubleSide })); this.scene.add(this.ring);
        this.hov = new T.Mesh(new T.RingGeometry(3.6, 4.1, 24), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: T.DoubleSide })); this.scene.add(this.hov);
        this.renderer = new T.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true }); this.renderer.autoClear = false;
        this.ref = maplibregl.MercatorCoordinate.fromLngLat([-119.81, 39.53], 0);
        this._m = new T.Matrix4(); this._q = new T.Quaternion(); this._q2 = new T.Quaternion(); this._p = new T.Vector3(); this._s = new T.Vector3(); this._ax = new T.Vector3(0, 0, 1); this._axX = new T.Vector3(1, 0, 0); this._zero = new T.Vector3(0, 0, 0);
      },
      render(gl, matrix) {
        const s = this.ref.meterInMercatorCoordinateUnits();
        const l = new T.Matrix4().makeTranslation(this.ref.x, this.ref.y, this.ref.z).scale(new T.Vector3(s, -s, s));
        this.camera.projectionMatrix = new T.Matrix4().fromArray(matrix).multiply(l);
        const k = Math.min(2, Math.max(1, Math.pow(2, 17.2 - map.getZoom()))), now = performance.now() / 1000;
        const D2R = Math.PI / 180, L = self.partLibrary();
        // frame of a vehicle root (or its trailer): world position + heading. Ground is flat — relief is
        // shading-derived (see applyTerrain), so there is no per-vehicle elevation to sample.
        const frame = (v, trailer) => { const hr = v.heading * D2R; return trailer ? { x: v.mx + Math.sin(hr) * 5.4 * k, y: v.my + Math.cos(hr) * 5.4 * k, h: v.trailerHeading } : { x: v.mx, y: v.my, h: v.heading }; };
        const put = (im, i, f, sc, dz) => { this._q.setFromAxisAngle(this._ax, -f.h * D2R); this._p.set(f.x, f.y, dz || 0); this._s.set(sc, sc, sc); this._m.compose(this._p, this._q, this._s); im.setMatrixAt(i, this._m); };
        const hide = (im, i) => { this._m.compose(this._zero, this._q, this._zero); im.setMatrixAt(i, this._m); };
        const selId = self.state.selId, active = v => v.id === selId;
        this.groups.forEach(g => {
          const trailer = g.type === 'truck' && g.slot === 'b';
          g.list.forEach((v, i) => { const f = frame(v, trailer); put(g.im, i, f, k); if (active(v)) put(g.hull, i, f, k * 1.06, -0.05 * k); else hide(g.hull, i); });
          g.im.instanceMatrix.needsUpdate = true; g.hull.instanceMatrix.needsUpdate = true;
        });
        // wheels: offset in the vehicle frame, spun about the axle by distance travelled
        this.wgroups.forEach(g => {
          const ax = L[g.type].axles, tax = L[g.type].trailerAxles;
          g.list.forEach((v, i) => {
            const spin = -(v.travelled || 0) / (g.r * k);
            const place = (f, offs, base) => { const hr = f.h * D2R, sh = Math.sin(hr), ch = Math.cos(hr); this._q.setFromAxisAngle(this._ax, -hr); this._q2.setFromAxisAngle(this._axX, spin); this._q.multiply(this._q2); this._s.set(k, k, k);
              offs.forEach(([ox, oy], j) => { this._p.set(f.x + (ox * ch + oy * sh) * k, f.y + (-ox * sh + oy * ch) * k, g.r * k); this._m.compose(this._p, this._q, this._s); g.im.setMatrixAt(base + j, this._m); }); };
            place(frame(v, false), ax, i * g.per);
            if (tax) place(frame(v, true), tax, i * g.per + 4);
          });
          g.im.instanceMatrix.needsUpdate = true;
        });
        // forklifts shuttling crates between the vehicle and the dock / site; drivers standing beside cars and vans
        let nf = 0, np = 0; const FK = this.FK;
        const smooth = t => t * t * (3 - 2 * t);
        self.vehicles.forEach(v => {
          if (v.still || !(v.phase === 'atDest' || v.phase === 'atBase')) return;
          const lab = self.actLabel(v) || '', hr = v.heading * D2R, fx = Math.sin(hr), fy = Math.cos(hr);
          let nx, ny; if (v.phase === 'atBase') { const bh = v.home.heading * D2R; nx = Math.sin(bh); ny = Math.cos(bh); } else { nx = v.nx || -fy; ny = v.ny || fx; }
          if (v.a.type !== 'car' && nf < FK && /Unloading|offload|Loading/.test(lab) && v.actStart) {
            const loading = /Loading/.test(lab), dur = Math.max(1, v.waitUntil - v.actStart), p = Math.min(1, Math.max(0, (now - v.actStart) / dur));
            const rear = v.a.type === 'truck' ? 9.5 : 5.2, sx = v.mx - fx * rear * k, sy = v.my - fy * rear * k, dx = sx + nx * 13 * k, dy = sy + ny * 13 * k;
            const ph = (p * 3) % 1, toward = ph < 0.5, t = smooth(toward ? ph * 2 : (1 - ph) * 2);
            const x = sx + (dx - sx) * t, y = sy + (dy - sy) * t, dirx = toward ? nx : -nx, diry = toward ? ny : -ny;
            const carrying = loading ? !toward : toward, im = carrying ? this.forkC : this.forkE, other = carrying ? this.forkE : this.forkC;
            put(im, nf, { x, y, h: Math.atan2(dirx, diry) / D2R }, k); hide(other, nf); nf++;
          }
          if (v.a.type !== 'truck' && this.people.count > np) {
            const last = v.act && v.actIdx === v.act.length - 1, boarding = last && v.waitUntil - now < 4;
            if (!boarding) { const lx = -fy, ly = fx, px = v.mx + lx * 1.55 * k + fx * 0.3 * k, py = v.my + ly * 1.55 * k + fy * 0.3 * k; put(this.people, np, { x: px, y: py, h: Math.atan2(-lx, -ly) / D2R }, k, Math.sin(now * 2 + v.seed * 9) * 0.02 * k); np++; }
          }
        });
        for (let i = nf; i < FK; i++) { hide(this.forkE, i); hide(this.forkC, i); }
        for (let i = np; i < this.people.count; i++) hide(this.people, i);
        this.forkE.instanceMatrix.needsUpdate = this.forkC.instanceMatrix.needsUpdate = this.people.instanceMatrix.needsUpdate = true;
        const sel = self.vehicles.find(v => v.id === self.state.selId), hv = self.hoverId && self.hoverId !== self.state.selId ? self.vehicles.find(v => v.id === self.hoverId) : null;
        this.ring.visible = !!sel; if (sel) { this.ring.position.set(sel.mx, sel.my, 0.08); this.ring.scale.setScalar(k); }
        const pulse = (performance.now() % 1100) / 1100;
        this.hov.visible = !!hv; if (hv) { this.hov.position.set(hv.mx, hv.my, 0.1); this.hov.scale.setScalar(k * (0.7 + pulse * 0.9)); this.hov.material.opacity = 1 - pulse; }
        // with terrain on, MapLibre also invokes layers during its offscreen passes; drawing there
        // double-renders the fleet and flickers. Only draw in the pass that targets the screen.
        if (gl.getParameter(gl.FRAMEBUFFER_BINDING)) return;
        this.renderer.resetState(); this.renderer.render(this.scene, this.camera);
      }
    };
    map.addLayer(layer); this.layer3d = layer;
  }

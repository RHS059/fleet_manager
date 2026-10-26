
class Component extends DCLogic {
  state = { liveFilter: 'all', geofences: true, vq: '', vStatus: 'all', vPage: 0, mapQ: '', detailId: '917-T04', range: '7d', toastText: '', toastOn: false, mapLoading: true, screen: null, mapMode: '3d', selId: '482-K17', tick: 0, moreOpen: false, isMobile: typeof window !== 'undefined' && window.innerWidth < 760, mSheet: 'peek', moreSheet: false };

  cur() { return this.state.screen || this.props.startScreen || 'dashboard'; }

  // ---------- fleet ----------
  fleet() {
    if (this._fleet) return this._fleet;
    let seed = 20260903; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const first = ['M.', 'F.', 'J.', 'A.', 'D.', 'P.', 'R.', 'H.', 'C.', 'S.', 'L.', 'T.', 'N.', 'E.', 'K.', 'B.', 'G.', 'V.', 'O.', 'I.'];
    const last = ['Okafor', 'Moreau', 'Lindqvist', 'Santos', 'Kowalski', 'Reyes', 'Brandt', 'Nakamura', 'Whitfield', 'Adeyemi', 'Castillo', 'Fischer', 'Haddad', 'Ivanova', 'Jensen', 'Kim', 'Larsen', 'Mbeki', 'Novak', 'Oyelaran', 'Petrov', 'Quintero', 'Rossi', 'Schmidt', 'Tanaka', 'Underwood', 'Varga', 'Walsh', 'Xu', 'Yilmaz', 'Zhang', 'Abbott', 'Bauer', 'Chen', 'Dubois', 'Eriksen', 'Farah', 'Garcia', 'Hughes', 'Iqbal'];
    const hues = ['#2F6FE0', '#F0A22E', '#FF6B5E', '#8B5CF6', '#34D07F', '#E3B341', '#0F9E93', '#EC5F9E', '#5BC0EB', '#C084FC'];
    const models = { van: ['Ford Transit 250', 'Ram ProMaster 2500', 'Mercedes Sprinter 2500', 'Ford E-Transit', 'Chevrolet Express 3500'], truck: ['Freightliner M2 106', 'Kenworth T680', 'International 4300', 'Volvo VNL 760', 'Peterbilt 579'], car: ['Rivian EDV 500', 'Tesla Model Y', 'Chevrolet Bolt EUV', 'Hyundai Ioniq 5', 'Ford Mustang Mach-E'] };
    const seeds = [
      ['482-K17', 'van', 'M. Okafor', '#2F6FE0'], ['917-T04', 'truck', 'F. Moreau', '#F0A22E'], ['260-E88', 'car', 'J. Lindqvist', '#FF6B5E'], ['735-R21', 'van', 'M. Santos', '#8B5CF6'],
      ['104-E52', 'car', 'A. Kowalski', '#34D07F'], ['648-T39', 'truck', 'D. Reyes', '#E3B341'], ['319-K76', 'van', 'P. Brandt', 'rgba(255,255,255,0.55)', 'Parked'], ['571-T60', 'truck', 'Unassigned', 'rgba(255,255,255,0.55)', 'In shop'],
      ['826-T13', 'truck', 'H. Nakamura', '#0F9E93'], ['093-K45', 'van', 'C. Whitfield', '#EC5F9E']
    ];
    const N = 2400, out = [], plates = new Set();
    for (let i = 0; i < N; i++) {
      let type, driver, hue, still, plate;
      if (i < seeds.length) { [plate, type, driver, hue, still] = seeds[i]; }
      else {
        const r = rnd(); type = r < 0.45 ? 'van' : r < 0.7 ? 'truck' : 'car';
        driver = first[Math.floor(rnd() * first.length)] + ' ' + last[Math.floor(rnd() * last.length)];
        hue = hues[Math.floor(rnd() * hues.length)];
        still = rnd() < 0.006 ? (rnd() < 0.5 ? 'Parked' : 'In shop') : null;
        if (still) hue = 'rgba(255,255,255,0.55)';
        do { plate = String(Math.floor(rnd() * 1000)).padStart(3, '0') + '-' + (type === 'car' ? 'E' : type === 'truck' ? 'T' : 'KRM'[Math.floor(rnd() * 3)]) + String(Math.floor(rnd() * 100)).padStart(2, '0'); } while (plates.has(plate));
      }
      plates.add(plate);
      const mark = driver === 'Unassigned' ? 'UN' : driver.split(' ').map(w => w[0]).join('').replace('.', '').slice(0, 2).toUpperCase();
      const year = 2016 + Math.floor(rnd() * 9);
      out.push({ id: plate, type, mark, driver, hue, still, cruise: type === 'truck' ? 10 + rnd() * 3 : type === 'van' ? 13 + rnd() * 3 : 14 + rnd() * 4,
        model: year + ' ' + models[type][Math.floor(rnd() * models[type].length)], odo: Math.floor(8000 + rnd() * 300000), fuel: Math.floor(15 + rnd() * 85), svc: rnd(), pSeed: Math.floor(rnd() * 1e9) });
    }
    return this._fleet = out;
  }
  assets() { return this.fleet(); }

  // ---------- destinations ----------
  pois() {
    return this._pois || (this._pois = [
      { name: 'Renown Regional Medical Center', lng: -119.7996, lat: 39.5262, purpose: { truck: 'Medical supply resupply for the central pharmacy', van: 'Same-day lab specimen courier run', car: 'Facilities inspector site visit' } },
      { name: 'Greater Nevada Field', lng: -119.8070, lat: 39.5270, purpose: { truck: 'Event catering and beverage delivery', van: 'Merchandise restock for the team store', car: 'Account manager meeting with venue ops' } },
      { name: 'Reno City Hall', lng: -119.8126, lat: 39.5262, purpose: { truck: 'Office furniture delivery for the 3rd floor remodel', van: 'Permit documents and records courier', car: 'Fleet compliance meeting' } },
      { name: 'Whitney Peak Hotel', lng: -119.8135, lat: 39.5285, purpose: { truck: 'Weekly linen and laundry exchange', van: 'Minibar and amenities restock', car: 'Sales call with hotel purchasing' } },
      { name: 'University of Nevada, Reno', lng: -119.8140, lat: 39.5360, purpose: { truck: 'Lab equipment delivery to the engineering building', van: 'Campus mail and parcel drop', car: 'Recruiting event' } },
      { name: 'Reno Arch, Virginia St', lng: -119.8138, lat: 39.5296, purpose: { truck: 'Retail pallet drop for Virginia St storefronts', van: 'Downtown parcel route, 22 stops', car: 'Customer pickup' } },
      { name: 'National Bowling Stadium', lng: -119.8110, lat: 39.5270, purpose: { truck: 'Tournament staging equipment', van: 'Pro-shop inventory restock', car: 'Site survey' } },
      { name: 'Truckee River Walk', lng: -119.8170, lat: 39.5252, purpose: { truck: 'Landscaping materials for the riverwalk crew', van: 'Landscaping crew transport', car: 'Property walkthrough' } },
      { name: 'Reno Amtrak Depot', lng: -119.8126, lat: 39.5283, purpose: { truck: 'Freight transfer from the rail siding', van: 'Passenger luggage courier', car: 'Dispatcher handoff' } },
      { name: 'Wells Ave business district', lng: -119.8031, lat: 39.5268, purpose: { truck: 'Restaurant supply run, 4 stops', van: 'Small-business parcel route', car: 'Territory sales visit' } },
      { name: 'Kuenzli St industrial park', lng: -119.8010, lat: 39.5284, purpose: { truck: 'Warehouse cross-dock transfer', van: 'Parts pickup for the shop', car: 'Vendor audit' } },
      { name: 'Renown Children\u2019s Hospital', lng: -119.7985, lat: 39.5250, purpose: { truck: 'Oxygen and cryo cylinder exchange', van: 'Pharmacy courier', car: 'Chaplaincy staff transport' } },
      { name: 'Evans Ave apartments', lng: -119.8100, lat: 39.5310, purpose: { truck: 'Appliance delivery and haul-away', van: 'Residential parcel route, 31 stops', car: 'Move-in coordinator' } },
      { name: 'Sutro St service center', lng: -119.7980, lat: 39.5305, purpose: { truck: 'Tire and parts delivery', van: 'Tool crib restock', car: 'Technician dispatch' } },
      { name: 'Reno–Tahoe International Airport', lng: -119.7681, lat: 39.4991, purpose: { truck: 'Air-cargo transfer to the freight terminal', van: 'Crew shuttle and luggage run', car: 'Executive pickup' } },
      { name: 'Grand Sierra Resort', lng: -119.7690, lat: 39.5290, purpose: { truck: 'Convention freight and staging', van: 'Banquet supply restock', car: 'Sales meeting with events team' } },
      { name: 'Sparks Marina', lng: -119.7360, lat: 39.5460, purpose: { truck: 'Outlet-store pallet delivery', van: 'Retail parcel route, 17 stops', car: 'Site visit' } },
      { name: 'Victorian Square, Sparks', lng: -119.7530, lat: 39.5350, purpose: { truck: 'Festival staging equipment', van: 'Merchant restock route', car: 'Permit office visit' } },
      { name: 'Meadowood Mall', lng: -119.7800, lat: 39.4830, purpose: { truck: 'Anchor-store replenishment, 14 pallets', van: 'Store-to-store transfers', car: 'Retail account visit' } },
      { name: 'Peppermill Resort', lng: -119.7970, lat: 39.4960, purpose: { truck: 'Linen and F&B delivery', van: 'Amenities restock', car: 'Purchasing meeting' } },
      { name: 'Renown South Meadows', lng: -119.7660, lat: 39.4400, purpose: { truck: 'Medical supply drop', van: 'Lab courier', car: 'Facilities inspection' } },
      { name: 'Reno Public Market', lng: -119.7960, lat: 39.5020, purpose: { truck: 'Vendor produce delivery', van: 'Food-hall supply run', car: 'Tenant meeting' } },
      { name: 'Sparks industrial district', lng: -119.7120, lat: 39.5280, purpose: { truck: 'Cross-dock transfer, Sparks DC', van: 'Parts pickup', car: 'Vendor audit' } },
      { name: 'North Valleys logistics park', lng: -119.8330, lat: 39.5980, purpose: { truck: 'Inbound freight, 22 pallets', van: 'Parts shuttle', car: 'Warehouse walkthrough' } },
      { name: 'McCarran Blvd, West Reno', lng: -119.8750, lat: 39.5250, purpose: { truck: 'Building-supply delivery', van: 'Residential service route', car: 'Client visit' } },
      { name: 'Virginia St mixed-use build, construction site', lng: -119.8145, lat: 39.5240, site: true, purpose: { truck: 'Rebar and formwork delivery, crane offload', van: 'Crew and tools to site', car: 'Superintendent site visit' } },
      { name: 'Sparks Blvd warehouse build, construction site', lng: -119.7250, lat: 39.5400, site: true, purpose: { truck: 'Steel joist delivery, flatbed', van: 'Electrical crew, rough-in', car: 'Inspector visit' } },
      { name: 'I-80 / US-395 interchange work zone', lng: -119.7900, lat: 39.5330, site: true, purpose: { truck: 'Barrier and signage delivery', van: 'Traffic-control crew rotation', car: 'Project engineer visit' } },
      { name: 'Damonte Ranch subdivision, phase 3', lng: -119.7700, lat: 39.4450, site: true, purpose: { truck: 'Lumber package drop, lot 41', van: 'Plumbing crew and fixtures', car: 'Sales office visit' } },
      { name: 'Midtown District, S Virginia St', lng: -119.8145, lat: 39.5150, purpose: { truck: 'Restaurant supply run, 6 stops', van: 'Boutique retail route, 19 stops', car: 'Territory sales visit' } },
      { name: 'Plumb Ln retail center', lng: -119.7920, lat: 39.5040, purpose: { truck: 'Big-box replenishment, 11 pallets', van: 'Store transfer run', car: 'Store manager meeting' } },
      { name: 'Sierra Summit Outlets', lng: -119.7440, lat: 39.5480, purpose: { truck: 'Outlet pallet delivery', van: 'Tenant parcel route, 24 stops', car: 'Leasing office visit' } },
      { name: 'Legends Sparks retail', lng: -119.7480, lat: 39.5430, purpose: { truck: 'Anchor-store replenishment', van: 'Kiosk and cart restock', car: 'Retail account visit' } },
      { name: 'Nugget Casino Resort, Sparks', lng: -119.7513, lat: 39.5346, purpose: { truck: 'F&B and linen delivery', van: 'Housekeeping supply restock', car: 'Purchasing meeting' } },
      { name: 'Sparks Municipal Yard', lng: -119.7455, lat: 39.5395, purpose: { truck: 'Aggregate and pipe delivery', van: 'Crew shuttle to yard', car: 'Public works meeting' } },
      { name: 'Vista Blvd commerce park', lng: -119.7010, lat: 39.5455, purpose: { truck: 'Cross-dock transfer, 16 pallets', van: 'Parts shuttle', car: 'Tenant walkthrough' } },
      { name: 'Greg St distribution row', lng: -119.7480, lat: 39.5265, purpose: { truck: 'Inbound freight, dock 6', van: 'Will-call parts pickup', car: 'Vendor audit' } },
      { name: 'Glendale Ave warehouses', lng: -119.7625, lat: 39.5225, purpose: { truck: 'Pallet consolidation run', van: 'Small-freight route', car: 'Site survey' } },
      { name: 'E 4th St brewery district', lng: -119.7940, lat: 39.5300, purpose: { truck: 'Keg and grain delivery', van: 'Taproom supply run', car: 'Account manager visit' } },
      { name: 'Reno Livestock Events Center', lng: -119.7935, lat: 39.5455, purpose: { truck: 'Event staging and feed delivery', van: 'Vendor booth supplies', car: 'Event ops meeting' } },
      { name: 'Northtowne Ln commercial', lng: -119.7995, lat: 39.5620, purpose: { truck: 'Furniture and fixture delivery', van: 'Service route, 14 stops', car: 'Client visit' } },
      { name: 'Stead industrial park', lng: -119.8760, lat: 39.6560, purpose: { truck: 'Bulk freight, 24 pallets', van: 'Tool crib restock', car: 'Plant walkthrough' } },
      { name: 'Silver Lake commercial center', lng: -119.8570, lat: 39.6470, purpose: { truck: 'Grocery replenishment', van: 'Neighborhood parcel route', car: 'Property inspection' } },
      { name: 'Lemmon Valley depot annex', lng: -119.8460, lat: 39.6270, purpose: { truck: 'Overflow trailer drop', van: 'Parts shuttle', car: 'Yard audit' } },
      { name: 'Golden Valley business park', lng: -119.8175, lat: 39.6135, purpose: { truck: 'Machinery crate delivery', van: 'Technician dispatch', car: 'Vendor meeting' } },
      { name: 'Panther Valley shopping center', lng: -119.8290, lat: 39.5885, purpose: { truck: 'Retail pallet drop', van: 'Pharmacy and grocery route', car: 'Store visit' } },
      { name: 'Keystone Ave corridor', lng: -119.8320, lat: 39.5310, purpose: { truck: 'Restaurant supply, 5 stops', van: 'Residential parcel route, 27 stops', car: 'Customer meeting' } },
      { name: 'W 7th St medical offices', lng: -119.8265, lat: 39.5330, purpose: { truck: 'Medical furniture delivery', van: 'Specimen courier, 9 clinics', car: 'Practice manager visit' } },
      { name: 'Mayberry Dr shops', lng: -119.8600, lat: 39.5085, purpose: { truck: 'Grocery replenishment', van: 'Neighborhood service route', car: 'Client walkthrough' } },
      { name: 'Caughlin Ranch commercial', lng: -119.8790, lat: 39.4990, purpose: { truck: 'Landscaping materials drop', van: 'HOA service route', car: 'Property manager meeting' } },
      { name: 'Skyline Blvd plaza', lng: -119.8420, lat: 39.4930, purpose: { truck: 'Beverage delivery', van: 'Retail restock, 8 stops', car: 'Sales call' } },
      { name: 'S McCarran office park', lng: -119.7845, lat: 39.4915, purpose: { truck: 'Office fit-out delivery', van: 'Mail and courier route', car: 'Client meeting' } },
      { name: 'Longley Ln industrial', lng: -119.7710, lat: 39.4880, purpose: { truck: 'Cross-dock transfer', van: 'Parts pickup', car: 'Vendor audit' } },
      { name: 'Airport Business Center', lng: -119.7595, lat: 39.5015, purpose: { truck: 'Air-freight forwarding drop', van: 'Expedite courier run', car: 'Logistics coordinator meeting' } },
      { name: 'Double R Blvd tech campus', lng: -119.7640, lat: 39.4735, purpose: { truck: 'Server rack delivery, 4 crates', van: 'IT equipment courier', car: 'Facilities meeting' } },
      { name: 'South Meadows commerce center', lng: -119.7580, lat: 39.4620, purpose: { truck: 'Warehouse replenishment', van: 'Business parcel route, 21 stops', car: 'Tenant visit' } },
      { name: 'Summit Reno shopping center', lng: -119.7455, lat: 39.4265, purpose: { truck: 'Anchor-store pallet drop', van: 'Tenant restock route', car: 'Retail account visit' } },
      { name: 'Damonte Ranch Pkwy retail', lng: -119.7695, lat: 39.4360, purpose: { truck: 'Grocery replenishment, 9 pallets', van: 'Pharmacy and retail route', car: 'Store manager meeting' } },
      { name: 'Arrowcreek Pkwy service hub', lng: -119.8110, lat: 39.4145, purpose: { truck: 'Building-supply delivery', van: 'Residential service route', car: 'Client site visit' } },
      { name: 'Mount Rose Hwy contractors yard', lng: -119.8285, lat: 39.4340, purpose: { truck: 'Aggregate and lumber drop', van: 'Crew and tools transport', car: 'Estimator visit' } },
      { name: 'Verdi industrial siding', lng: -119.9860, lat: 39.5175, purpose: { truck: 'Rail-to-truck freight transfer', van: 'Parts shuttle', car: 'Site inspection' } },
      { name: 'Mogul Rd storage yard', lng: -119.9330, lat: 39.5180, purpose: { truck: 'Trailer drop and swap', van: 'Equipment shuttle', car: 'Yard audit' } },
      { name: 'Spanish Springs town center', lng: -119.7040, lat: 39.6480, purpose: { truck: 'Retail replenishment, 12 pallets', van: 'Neighborhood parcel route, 29 stops', car: 'Store visit' } },
      { name: 'Pyramid Way commercial strip', lng: -119.7215, lat: 39.6045, purpose: { truck: 'Restaurant supply run', van: 'Service route, 16 stops', car: 'Territory sales visit' } },
      { name: 'Wildcreek redevelopment, construction site', lng: -119.7690, lat: 39.5595, site: true, purpose: { truck: 'Concrete forms and rebar', van: 'Survey crew and equipment', car: 'Project manager site visit' } },
      { name: 'Oddie Blvd corridor rebuild, work zone', lng: -119.7645, lat: 39.5390, site: true, purpose: { truck: 'Asphalt and barrier delivery', van: 'Traffic-control crew rotation', car: 'Inspector visit' } },
      { name: 'South Virginia transit line, work zone', lng: -119.7885, lat: 39.4770, site: true, purpose: { truck: 'Precast platform sections', van: 'Signal crew and tools', car: 'Project engineer visit' } }
    ]);
  }
  cargoFor(a, poi, rnd) {
    const truck = ['Palletised bottled water, 18 pallets', 'Refrigerated produce, 6 pallets', 'Copy paper, 42 cases', 'Steel shelving kits, 12 crates', 'Commercial ovens, 3 units', 'HVAC filters, 60 cartons', 'Bagged mulch, 2 t', 'Medical gas cylinders, 24', 'Beverage kegs, 40', 'Server racks, 4 crates', 'Linen carts, 14', 'Lab freezers, 2 units'];
    const van = ['Parcels, 38 stops remaining', 'Lab specimen coolers, 6', 'Documents, 3 sealed pouches', 'Retail totes, 22', 'Small appliances, 9 boxes', 'Uniforms, 4 garment bags', 'Tool kits, 5', 'Printer consumables, 11 cartons'];
    const list = a.type === 'truck' ? truck : a.type === 'van' ? van : null;
    if (!list) return [];
    const n = a.type === 'truck' ? 3 + Math.floor(rnd() * 3) : 2 + Math.floor(rnd() * 2), out = [], used = new Set();
    while (out.length < n) { const i = Math.floor(rnd() * list.length); if (!used.has(i)) { used.add(i); out.push(list[i]); } }
    return out;
  }

  // ---------- road graph ----------
  loadRegionRoads() {
    return new Promise(res => {
      let settled = false; const div = document.createElement('div');
      div.style.cssText = 'position:fixed;left:-9999px;top:0;width:420px;height:760px;pointer-events:none';
      document.body.appendChild(div);
      let m; const done = lines => { if (settled) return; settled = true; try { m && m.remove(); } catch (e) { } div.remove(); res(lines); };
      try {
        m = new maplibregl.Map({ container: div, style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', center: [-119.78, 39.52], zoom: 11.4, interactive: false, attributionControl: false });
      } catch (e) { return done([]); }
      const timer = setTimeout(() => done([]), 12000);
      const harvest = () => {
        const CL = { motorway: 0, trunk: 1, primary: 2, secondary: 3, tertiary: 4 }, B = { w: -119.96, e: -119.64, s: 39.41, n: 39.63 }, lines = [], seen = new Set();
        m.querySourceFeatures('carto', { sourceLayer: 'transportation' }).forEach(f => {
          const c = CL[f.properties.class]; if (c === undefined || f.properties.brunnel === 'tunnel') return;
          const g = f.geometry, parts = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
          parts.forEach(p => {
            const q = []; let last = null;
            p.forEach(pt => { if (pt[0] < B.w || pt[0] > B.e || pt[1] < B.s || pt[1] > B.n) return; const x = Math.round((pt[0] + 119.81) * 1e5), y = Math.round((pt[1] - 39.53) * 1e5); if (last && Math.hypot((x - last[0]) * 0.86, (y - last[1]) * 1.11) < 18) return; q.push([x, y]); last = [x, y]; });
            if (q.length < 2) return; const k = c + JSON.stringify(q); if (seen.has(k)) return; seen.add(k); lines.push([c, ...q]);
          });
        });
        clearTimeout(timer); done(lines);
      };
      m.once('idle', harvest);
    });
  }
  async loadRoads() {
    if (this.roads) return this.roads;
    const [dt, rg] = await Promise.all([(await fetch('roads.json')).json(), this.loadRegionRoads()]);
    const LIM = [29, 24, 19, 16, 13.5], DT_LIM = 12.5;
    const nodes = new Map(); const key = p => p[0] + ',' + p[1];
    const node = (p, lim) => { let n = nodes.get(key(p)); if (!n) { n = { x: p[0], y: p[1], adj: [], lim: 0 }; nodes.set(key(p), n); } if (lim > n.lim) n.lim = lim; return n; };
    const link = (a, b) => { if (a === b) return; if (!a.adj.includes(b)) a.adj.push(b); if (!b.adj.includes(a)) b.adj.push(a); };
    const DT = { x0: -800, x1: 650, y0: -880, y1: 450 };
    const inDT = (p, pad) => p[0] > DT.x0 + pad && p[0] < DT.x1 - pad && p[1] > DT.y0 + pad && p[1] < DT.y1 - pad;
    dt.forEach(l => { for (let i = 0; i < l.length - 1; i++) link(node(l[i], DT_LIM), node(l[i + 1], DT_LIM)); });
    const dtNodes = [...nodes.values()];
    rg.forEach(l => { const lim = LIM[l[0]]; for (let i = 1; i < l.length - 1; i++) { if (inDT(l[i], 60) && inDT(l[i + 1], 60)) continue; link(node(l[i], lim), node(l[i + 1], lim)); } });
    const all = [...nodes.values()];
    // spatial hash for snapping loose ends
    const cell = 120 / 0.9, grid = new Map(); const gk = (x, y) => Math.floor(x / cell) + ':' + Math.floor(y / cell);
    all.forEach(n => { const k = gk(n.x, n.y); (grid.get(k) || grid.set(k, []).get(k)).push(n); });
    const near = (n, maxM) => { let best = null, bd = maxM * maxM; const cx = Math.floor(n.x / cell), cy = Math.floor(n.y / cell); for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const list = grid.get((cx + dx) + ':' + (cy + dy)); if (!list) continue; for (const o of list) { if (o === n || n.adj.includes(o)) continue; const d = ((o.x - n.x) * 0.8587) ** 2 + ((o.y - n.y) * 1.1132) ** 2; if (d < bd) { bd = d; best = o; } } } return best; };
    all.forEach(n => { if (n.adj.length !== 1) return; const isDT = dtNodes.includes(n); const o = near(n, isDT ? 140 : (inDT([n.x, n.y], -200) ? 140 : 30)); if (o) link(n, o); });
    all.forEach((n, i) => { n.i = i; });
    this.roads = all;
    return this.roads;
  }
  // 0.8587 / 1.1132 = metres per 1e-5° lng / lat at 39.53°N
  nodeM(n) { return { x: n.x * 0.8587, y: n.y * 1.1132 }; }
  toLngLat(mx, my) { return [-119.81 + mx / 0.8587 / 1e5, 39.53 + my / 1.1132 / 1e5]; }
  fromLngLat(lng, lat) { return { x: (lng + 119.81) * 1e5 * 0.8587, y: (lat - 39.53) * 1e5 * 1.1132 }; }
  nearestNode(p, minDeg) { let best = null, bd = 1e12; this.roads.forEach(n => { if (n.adj.length < (minDeg || 1)) return; const m = this.nodeM(n); const d = (m.x - p.x) ** 2 + (m.y - p.y) ** 2; if (d < bd) { bd = d; best = n; } }); return best; }
  dijkstra(from) {
    const N = this.roads.length, dist = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1);
    const heap = [], push = (d, i) => { heap.push([d, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { let l = 2 * k + 1, r = l + 1, s = k; if (l < heap.length && heap[l][0] < heap[s][0]) s = l; if (r < heap.length && heap[r][0] < heap[s][0]) s = r; if (s === k) break; [heap[s], heap[k]] = [heap[k], heap[s]]; k = s; } } return top; };
    const salt = Math.random() * 1000; dist[from.i] = 0; push(0, from.i);
    while (heap.length) {
      const [d, i] = pop(); if (d > dist[i]) continue; const u = this.roads[i], um = this.nodeM(u);
      for (const w of u.adj) { const wm = this.nodeM(w); const noise = 1 + ((Math.sin(u.i * 12.9898 + w.i * 78.233 + salt) * 43758.5453) % 1 + 1) % 1 * 0.35; const nd = d + Math.hypot(wm.x - um.x, wm.y - um.y) * noise; if (nd < dist[w.i]) { dist[w.i] = nd; prev[w.i] = i; push(nd, w.i); } }
    }
    return { dist, prev, from };
  }
  pathFrom(tree, to) { if (!isFinite(tree.dist[to.i])) return null; const path = [to]; let c = to.i; while (c !== tree.from.i) { c = tree.prev[c]; if (c < 0) return null; path.unshift(this.roads[c]); } return path; }
  dijkstraFromBase() { this.bases.forEach(b => { b.trees = [0, 1, 2].map(() => this.dijkstra(b.node)); }); this.baseTrees = this.base.trees; this.baseTree = this.baseTrees[0]; }
  anyBaseTree(b) { const t = (b || this.base).trees; return t[Math.floor(Math.random() * t.length)]; }
  lanesFor(A, B) { if (!A.node || !B.node) return 1; const lim = Math.min(A.node.lim || 12.5, B.node.lim || 12.5); return lim >= 25 ? 3 : lim >= 17 ? 2 : 1; }

  // ---------- depots ----------
  initDepot() {
    const roads = this.roads;
    // main yard: surface lots north of E 2nd St, east of the ballpark; plus three satellite yards
    const bn = roads.find(n => n.x === 210 && n.y === -200) || this.nearestNode(this.fromLngLat(-119.8079, 39.5280), 2);
    const yards = [['Downtown yard', bn, bn.adj.find(n => n.x === 275 && n.y === -187)]];
    [['Sparks DC yard', -119.7120, 39.5300], ['Airport cargo yard', -119.7720, 39.5060], ['North Valleys yard', -119.8330, 39.5960]].forEach(([name, lng, lat]) => { const n = this.nearestNode(this.fromLngLat(lng, lat), 2); if (n && !yards.some(y => y[1] === n)) yards.push([name, n, null]); });
    this.bases = yards.map(([name, n, nb]) => this.makeYard(name, n, nb));
    this.base = this.bases[0];
  }
  makeYard(name, bn, nbNode) {
    const bm = this.nodeM(bn), nb = this.nodeM(nbNode || bn.adj[0]);
    let ux = nb.x - bm.x, uy = nb.y - bm.y; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
    const px = -uy, py = ux;
    const gate = { x: bm.x + px * 14, y: bm.y + py * 14 };
    const COLS = 12, ROWS = 6, slots = [];
    for (let i = 0; i < COLS * ROWS; i++) { const row = Math.floor(i / COLS), col = i % COLS; slots.push({ x: gate.x + px * (12 + row * 10) + ux * ((col - (COLS - 1) / 2) * 5.2), y: gate.y + py * (12 + row * 10) + uy * ((col - (COLS - 1) / 2) * 5.2), free: true }); }
    const d0 = 12 + ROWS * 10 + 8, W = 26, L = 58;
    const corner = (a, b) => this.toLngLat(gate.x + px * a + ux * b, gate.y + py * a + uy * b);
    const footprint = [corner(d0, -L / 2), corner(d0, L / 2), corner(d0 + W, L / 2), corner(d0 + W, -L / 2), corner(d0, -L / 2)];
    const parcel = [corner(-2, -40), corner(-2, 40), corner(d0 + W + 8, 40), corner(d0 + W + 8, -40), corner(-2, -40)];
    return { name, node: bn, m: bm, gate, slots, heading: Math.atan2(px, py) * 180 / Math.PI, footprint, parcel: { type: 'Polygon', coordinates: [parcel] }, center: corner(d0 + W / 2, 0), trees: null };
  }
  ensureDepotLayers(map) {
    if (map.getSource('fm-depot')) return;
    map.addSource('fm-depot', { type: 'geojson', data: { type: 'FeatureCollection', features: this.bases.map(b => ({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [b.footprint] }, properties: { name: b.name } })) } });
    map.addSource('fm-depot-lot', { type: 'geojson', data: { type: 'FeatureCollection', features: this.bases.map(b => ({ type: 'Feature', geometry: b.parcel, properties: { name: b.name } })) } });
    map.addLayer({ id: 'fm-depot-lot', type: 'fill', source: 'fm-depot-lot', paint: { 'fill-color': '#0a1030', 'fill-opacity': 0.9 } });
    map.addLayer({ id: 'fm-depot-lot-line', type: 'line', source: 'fm-depot-lot', paint: { 'line-color': 'rgba(255,138,42,0.5)', 'line-width': 1, 'line-dasharray': [3, 2] } });
    map.addLayer({ id: 'fm-depot-flat', type: 'fill', source: 'fm-depot', paint: { 'fill-color': '#f0862a', 'fill-opacity': 0.85 } });
    map.addLayer({ id: 'fm-depot-outline', type: 'line', source: 'fm-depot', paint: { 'line-color': '#ffb066', 'line-width': 1.5 } });
    const N = 5, c0 = [122, 46, 8], c1 = [255, 138, 42], H = 14;
    this.depotLayers = ['fm-depot-flat'];
    for (let i = 0; i < N; i++) {
      const t = (i + 0.5) / N, color = 'rgb(' + c0.map((c, k) => Math.round(c + (c1[k] - c) * t)).join(',') + ')';
      const id = 'fm-depot-' + i; this.depotLayers.push(id);
      map.addLayer({ id, type: 'fill-extrusion', source: 'fm-depot', paint: { 'fill-extrusion-color': color, 'fill-extrusion-base': H * i / N, 'fill-extrusion-height': H * (i + 1) / N, 'fill-extrusion-opacity': 1 } });
    }
    this.ensureSiteLayers(map);
  }
  // destination buildings: retail / commercial blocks in the fleet palette, construction sites as low slabs on a fenced lot
  ensureSiteLayers(map) {
    if (map.getSource('fm-sites')) return;
    const hues = ['#2F6FE0', '#F0A22E', '#FF6B5E', '#8B5CF6', '#34D07F', '#E3B341', '#0F9E93', '#EC5F9E', '#5BC0EB', '#C084FC'];
    const bld = [], lots = [];
    this.pois().forEach((p, i) => {
      const n = p.node; if (!n || !n.adj.length) return;
      const nm = this.nodeM(n), am = this.nodeM(n.adj[0]); let ux = am.x - nm.x, uy = am.y - nm.y; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul; const px = -uy, py = ux;
      const site = !!p.site, W = site ? 34 : 22 + (i % 3) * 6, L = site ? 40 : 18 + (i % 4) * 5, d0 = 16, color = hues[i % hues.length];
      const corner = (a, b) => this.toLngLat(nm.x + px * a + ux * b, nm.y + py * a + uy * b);
      const ring = [corner(d0, -L / 2), corner(d0, L / 2), corner(d0 + W, L / 2), corner(d0 + W, -L / 2), corner(d0, -L / 2)];
      bld.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] }, properties: { color, name: p.name, h: site ? 3.5 : 7 + (i % 5) * 2.2, site } });
      lots.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[corner(3, -L / 2 - 8), corner(3, L / 2 + 8), corner(d0 + W + 6, L / 2 + 8), corner(d0 + W + 6, -L / 2 - 8), corner(3, -L / 2 - 8)]] }, properties: { color, site } });
      p.center = { x: nm.x + px * (d0 + W / 2), y: nm.y + py * (d0 + W / 2) };
    });
    map.addSource('fm-sites', { type: 'geojson', data: { type: 'FeatureCollection', features: bld } });
    map.addSource('fm-site-lots', { type: 'geojson', data: { type: 'FeatureCollection', features: lots } });
    map.addLayer({ id: 'fm-site-lot', type: 'fill', source: 'fm-site-lots', paint: { 'fill-color': '#0a1030', 'fill-opacity': 0.75 } });
    map.addLayer({ id: 'fm-site-lot-line', type: 'line', source: 'fm-site-lots', paint: { 'line-color': ['get', 'color'], 'line-opacity': 0.55, 'line-width': 1, 'line-dasharray': [3, 2] } });
    map.addLayer({ id: 'fm-site-flat', type: 'fill', source: 'fm-sites', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.85 } });
    map.addLayer({ id: 'fm-site-outline', type: 'line', source: 'fm-sites', paint: { 'line-color': ['get', 'color'], 'line-width': 1.5 } });
    map.addLayer({ id: 'fm-site-3d', type: 'fill-extrusion', source: 'fm-sites', paint: { 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['get', 'h'], 'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.95 } });
    this.depotLayers.push('fm-site-flat', 'fm-site-3d');
  }

  // ---------- vehicles + trips ----------
  takeSlot(b) { const s = (b || this.base).slots.find(s => s.free); if (s) s.free = false; return s || null; }
  // ---------- on-site / at-yard activity chains (sim seconds; labels describe the real-world step) ----------
  activitiesFor(v, kind) {
    const t = v.a.type, r = Math.random, pick = arr => arr[Math.floor(r() * arr.length)];
    // durations are stretched so the on-site pool stays ~55% of the working fleet against trip times
    const K = 2.6, S = (label, detail, lo, hi) => ({ label, detail, dur: (lo + r() * (hi - lo)) * K });
    const cargo0 = (v.cargo && v.cargo[0]) || 'freight';
    if (kind === 'depot') {
      if (t === 'truck') return [S('Backing onto dock ' + (1 + Math.floor(r() * 8)), 'Yard marshal guiding into bay', 10, 20), S('Loading, forklift staging pallets', cargo0, 40, 90), S('Securing load, straps and tarp', 'Driver walk-around', 15, 30), S('Pre-trip inspection', 'DVIR in progress, lights, brakes, tires', 15, 30), S('Dispatch hold', 'Waiting for departure wave, ' + Math.round(5 + r() * 40) + ' min', 30, 200)];
      if (t === 'van') return [S('Parked at parcel sort', 'Scanning route manifest', 10, 20), S('Loading totes and parcels', cargo0, 25, 60), S('Pre-trip inspection', 'DVIR in progress', 10, 20), S('Dispatch hold', 'Waiting for departure wave', 30, 200)];
      return [S('Charging at yard, 34% → 80%', 'Level 2, ' + Math.round(30 + r() * 60) + ' min remaining', 40, 120), S('Pre-trip inspection', 'Walk-around', 8, 15), S('Dispatch hold', 'Waiting for departure wave', 30, 200)];
    }
    const site = v.destSite, equip = v.equipMove;
    if (t === 'truck') {
      if (equip) return [S('Checking in at site gate', 'Badge scan, flagger clearing haul road', 10, 25), S('Positioning flatbed on level ground', 'Ramps down', 15, 30), S('Unchaining ' + equip.toLowerCase(), 'Operator on site, 4 tie-downs', 20, 40), S(equip + ' driven off flatbed', 'Spotter walking it to staging', 15, 30), S('Signing equipment transfer', 'Hour-meter and fuel level logged', 10, 20), S('Waiting on return load', 'Site super checking for backhaul', 20, 90)];
      if (site) return [S('Checking in at site gate', 'Flagger clearing haul road', 10, 25), S('Crane offload, ' + cargo0, 'Rigger on the load, ' + Math.round(4 + r() * 8) + ' picks', 40, 110), S('Sweeping trailer deck', 'Dunnage and straps stowed', 10, 20), S('Site super signing POD', 'Delivery ticket photographed', 8, 15)];
      return [S('Backing into dock ' + (1 + Math.floor(r() * 12)), 'Receiving guiding truck in', 10, 25), S('Unloading, ' + cargo0, 'Receiver forklift, ' + Math.round(3 + r() * 14) + ' pallets', 40, 110), S('Receiver counting pallets', 'Checking against BOL', 15, 30), S('POD signed, dock door closing', 'Paperwork photographed', 8, 15), pick([S('Driver 30-min break', 'HOS mandatory rest', 60, 120), S('Waiting on backhaul', 'Dispatch checking for return freight', 20, 60)])];
    }
    if (t === 'van') {
      if (site) return [S('Parked inside site fence', 'Crew unloading tools', 10, 20), S('Crew on site, ' + pick(['rough-in', 'traffic control', 'fixture install', 'punch list']), 'Van idle at staging', 90, 240), S('Reloading tools and scrap', 'Hand truck stowed', 10, 20)];
      if (/service|repair|shop|technician/i.test(v.purpose || '')) return [S('On-site diagnosis', 'Technician with customer', 20, 50), S('Parts swap from van stock', pick(['Compressor contactor', 'Circulation pump', 'Control board', 'Belt and bearing']), 40, 100), S('System test with customer', 'Verifying fix', 15, 30), S('Closing work order', 'Signature on tablet', 8, 15)];
      return [S('Parked, hand truck out', 'Rear doors open at ' + pick(['loading zone', 'rear entrance', 'service alley']), 5, 12), S('Unloading boxes', cargo0, 20, 50), S('Walking parcels to ' + pick(['suite 200', 'reception', 'mail room', 'unit 4B']), Math.round(2 + r() * 6) + ' packages', 15, 40), S('POD photo + signature', 'Scanning out', 5, 12)];
    }
    return [pick([S('Meeting in progress', 'Conference room, ' + Math.round(20 + r() * 40) + ' min', 60, 180), S('Site walkthrough', 'With ' + pick(['facilities lead', 'general contractor', 'property manager']), 40, 120), S('Inspection, clipboard out', 'Checklist ' + Math.round(20 + r() * 70) + '% complete', 40, 120)]), pick([S('Charging, 38% → 80%', 'Public DC fast charger', 30, 90), S('Lunch break', 'Off duty', 40, 90), S('Writing up notes', 'Parked, engine off', 10, 30)])];
  }
  beginActs(v, now, kind, randomize) {
    v.act = this.activitiesFor(v, kind); v.actIdx = randomize ? Math.floor(Math.random() * v.act.length) : 0;
    v.waitUntil = now + (randomize ? Math.random() : 1) * v.act[v.actIdx].dur; v.actStart = v.waitUntil - v.act[v.actIdx].dur;
  }
  actLabel(v) { return v.act && v.act[v.actIdx] ? v.act[v.actIdx].label : null; }
  actDetail(v) { return v.act && v.act[v.actIdx] ? v.act[v.actIdx].detail : null; }
  freeSlot(v) { if (v.slot) { v.slot.free = true; v.slot = null; } }
  initVehicles() {
    if (this.vehicles) return this.vehicles;
    this.initDepot(); this.dijkstraFromBase();
    this.pois().forEach(p => { p.node = this.nearestNode(this.fromLngLat(p.lng, p.lat), 2); });
    const now = performance.now() / 1000, b = this.base;
    const LEN = { truck: 21, van: 6.5, car: 5 };
    let atBaseBudget = 210, returnBudget = 60; const occ = new Map();
    // shared origin trees so the initial fleet is scattered region-wide instead of funnelling through the depot
    const cand = this.roads.filter(n => n.adj.length >= 2 && isFinite(this.baseTree.dist[n.i]) && this.baseTree.dist[n.i] > 1500);

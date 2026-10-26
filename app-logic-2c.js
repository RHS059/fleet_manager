  renderVals() {
    const s = this.cur();
    const go = k => () => this.setState({ screen: k });
    const nav = {};
    ['dashboard','map','vehicles','drivers','work','dvir','fuel','hos','detail'].forEach(k => {
      const on = s === k || (k === 'vehicles' && s === 'detail');
      nav[k] = { bg: on ? '#DCDCD8' : 'transparent', fg: on ? '#F5F7F6' : 'rgba(255,255,255,0.62)', w: on ? '500' : '450', on: go(k) };
    });
    const I = {
      grid: 'M3 3h4.2v4.2H3zM8.8 3H13v4.2H8.8zM3 8.8h4.2V13H3zM8.8 8.8H13V13H8.8z',
      alert: 'M8 2.5 14.5 13.5h-13zM8 6.5v3M8 11.4v.2',
      bookmark: 'M4.25 2.75h7.5v10.5L8 10.6l-3.75 2.65z',
      pin: 'M8 14c2.8-3.3 4.2-5.5 4.2-7A4.2 4.2 0 0 0 3.8 7c0 1.5 1.4 3.7 4.2 7ZM8 8.9a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2Z',
      route: 'M3 12.5c3.2 0 3.2-9 6.4-9 2 0 3.1 1.7 3.6 3.2',
      hex: 'M2.75 5.4 8 2.5l5.25 2.9v5.2L8 13.5l-5.25-2.9z',
      replay: 'M8 3.25a4.75 4.75 0 1 1-4.6 5.9M3.4 3.25v3.1h3.1',
      truck: 'M1.5 4.75h8v6h-8zM9.5 6.6h2.4l2.1 2.1v2.05H9.5M4.6 13.1a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3ZM11.5 13.1a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Z',
      trailer: 'M2 4.75h11v6H2zM5.25 13.1a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3ZM9.75 13.1a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Z',
      part: 'M8 10.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2ZM8 2.25v1.9M8 11.85v1.9M2.25 8h1.9M11.85 8h1.9',
      clipboard: 'M2.5 4h11v9.5h-11zM5.75 4V2.6h4.5V4M5.5 8.4h5M5.5 10.9h3',
      check: 'M3.25 2.5h9.5v11h-9.5zM5.75 6.6l1.4 1.4 2.9-2.9M5.75 10.75h4.5',
      calendar: 'M2.75 3.75h10.5v9.75H2.75zM2.75 6.9h10.5M5.75 2.4v2.2M10.25 2.4v2.2',
      person: 'M8 8.1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.1 13.5c0-2.5 2.2-4.3 4.9-4.3s4.9 1.8 4.9 4.3',
      clock: 'M8 13.75A5.75 5.75 0 1 0 8 2.25a5.75 5.75 0 0 0 0 11.5ZM8 4.9V8l2.25 1.5',
      card: 'M2.25 4h11.5v8H2.25zM5 7.25h2.25M5 9.5h5.5',
      fuel: 'M3.5 2.5h6.5v11H3.5zM10 6h1.75a1.75 1.75 0 0 1 1.75 1.75v3a1.25 1.25 0 0 1-2.5 0V9.5H10M5.75 5.5h2',
      bars: 'M2.75 13.25h10.5M4.6 10.75V7.4M8 10.75V4.5M11.4 10.75V8.6',
      table: 'M2.5 3h11v10h-11zM2.5 6.5h11M6 3v10'
    };
    const groups = {
      overview: { label: 'Overview', items: [
        { k: 'dashboard', label: 'Fleet overview', d: I.grid },
        { k: null, label: 'Alerts', d: I.alert, badge: '12' },
        { k: null, label: 'Saved views', d: I.bookmark }
      ]},
      live: { label: 'Live', items: [
        { k: 'map', label: 'Live map', d: I.pin, dot: '#34D07F', count: '214' },
        { k: null, label: 'Trips', d: I.route },
        { k: null, label: 'Geofences', d: I.hex, count: '48' },
        { k: null, label: 'Trip replay', d: I.replay }
      ]},
      assets: { label: 'Assets', items: [
        { k: 'vehicles', label: 'Vehicles', d: I.truck, count: '2,400' },
        { k: null, label: 'Trailers & assets', d: I.trailer, count: '61' },
        { k: null, label: 'Parts & inventory', d: I.part }
      ]},
      service: { label: 'Service', items: [
        { k: 'work', label: 'Work orders', d: I.clipboard, count: '17' },
        { k: null, label: 'Service schedules', d: I.calendar }
      ]},
      inspect: { label: 'Inspect', items: [
        { k: 'dvir', label: 'Inspections (DVIR)', d: I.check, dot: '#F0A22E', count: '3' }
      ]},
      people: { label: 'People', items: [
        { k: 'drivers', label: 'Drivers & safety', d: I.person, count: '193' },
        { k: null, label: 'Licences & training', d: I.card }
      ]},
      hours: { label: 'Hours', items: [
        { k: 'hos', label: 'Hours of service', d: I.clock, dot: '#FF6B5E', count: '2' }
      ]},
      fuellogs: { label: 'Fuel logs', items: [
        { k: 'fuellog', label: 'Fuel logs', d: I.table }
      ]},
      reports: { label: 'Reports', items: [
        { k: 'fuel', label: 'Fuel & cost', d: I.fuel },
        { k: null, label: 'Cost per mile', d: I.bars },
        { k: null, label: 'IFTA & taxes', d: I.table }
      ]}
    };
    const screenGroup = { dashboard: 'overview', map: 'live', vehicles: 'assets', detail: 'assets', work: 'service', dvir: 'inspect', drivers: 'people', hos: 'hours', fuel: 'reports', fuellog: 'fuellogs' };
    const activeGroup = screenGroup[s] || 'overview';
    const rail = {};
    Object.keys(groups).forEach(g => {
      const on = g === activeGroup;
      rail[g] = { fg: on ? '#F5F7F6' : 'rgba(255,255,255,0.62)', on: go(groups[g].items.filter(i => i.k)[0].k) };
    });
    const railIdx = Math.max(0, Object.keys(groups).indexOf(activeGroup));
    const railHoleTop = (48 + 42 * railIdx) + 'px';
    if (this._railGroup !== activeGroup) { this._railGroup = activeGroup; this._railAnim = this._railAnim === 'railHoleA' ? 'railHoleB' : 'railHoleA'; }
    const railHoleAnim = this._railAnim;
    const mapModes = {};
    [['d2','2d'],['d3','3d'],['iso','iso']].forEach(([k, m]) => {
      const on = this.state.mapMode === m;
      mapModes[k] = { bg: on ? 'rgba(255,255,255,0.14)' : 'transparent', fg: on ? '#F5F7F6' : 'rgba(255,255,255,0.62)', on: () => this.setMapMode(m) };
    });
    const following = !!this.state.following;
    const toggleFollow = () => { if (following) { this.follow = null; this.setState({ following: false }); } else { this.follow = this.state.selId; this.setState({ following: true }); if (this.map) { this.map.stop(); const f = (this.vehicles || []).find(v => v.id === this.follow); if (f) this.map.jumpTo({ center: this.toLngLat(f.mx, f.my) }); } } };
    const followBg = following ? '#3FE39B' : 'rgba(14,16,15,0.94)', followFg = following ? '#04150C' : 'rgba(255,255,255,0.72)', followBorder = following ? '#3FE39B' : 'rgba(255,255,255,0.10)', followLabel = following ? 'Following' : 'Follow vehicle';
    const collapsed = !!this.state.railCollapsed;
    const railWidth = collapsed ? '60px' : '188px';
    const railLabel = collapsed ? 'none' : 'inline';
    const railChevron = collapsed ? 'rotate(180deg)' : 'none';
    const toggleRail = () => this.setState(st => ({ railCollapsed: !st.railCollapsed }));

    const detailTabs = ['Overview','Service history','Faults','Trips','Documents','Cost'];
    const isDetailPage = s === 'detail';
    const tabs = isDetailPage
      ? detailTabs.map((label, i) => ({
          label, bg: i === 0 ? '#3FE39B' : 'transparent', fg: i === 0 ? '#04150C' : 'rgba(255,255,255,0.86)',
          cursor: 'default', on: null
        }))
      : groups[activeGroup].items.map(i => {
          const on = i.k === s;
          return {
            label: i.label + (i.count ? ' · ' + i.count : ''),
            bg: on ? '#3FE39B' : 'transparent',
            fg: on ? '#04150C' : i.k ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0.62)',
            cursor: i.k ? 'pointer' : 'default',
            on: i.k ? go(i.k) : null
          };
        });
    const pageMeta = {
      dashboard: ['Fleet overview', I.grid], map: ['Live map', I.pin], vehicles: ['Vehicles', I.truck],
      detail: ['917·T04', I.truck], work: ['Work orders', I.clipboard], dvir: ['Inspections (DVIR)', I.check],
      drivers: ['Drivers & safety', I.person], hos: ['Hours of service', I.clock], fuel: ['Fuel & cost', I.fuel], fuellog: ['Fuel logs', I.table]
    };

    const kpis = [
      { name: 'Assets in service', value: '214', delta: '↑ +6', deltaColor: '#34D07F', vs: 'vs 208 yesterday', hue: '#2F6FE0', tint: 'rgba(47,111,224,.12)' },
      { name: 'Utilization', value: '71%', delta: '↑ +4 pts', deltaColor: '#34D07F', vs: 'vs 67% last week', hue: '#34B37E', tint: 'rgba(52,179,126,.12)' },
      { name: 'Open work orders', value: '17', delta: '↑ +3', deltaColor: '#FF6B5E', vs: 'vs 14 last week', hue: '#E9A15B', tint: 'rgba(233,161,91,.14)' },
      { name: 'Cost per mile', value: '$0.68', delta: '↓ −$0.03', deltaColor: '#34D07F', vs: 'vs $0.71 in July', hue: '#0F9E93', tint: 'rgba(15,158,147,.12)' }
    ];
    const statusLegend = [
      { name: 'On route', count: '164', share: '66%', hue: '#34D07F' },
      { name: 'Idling over 10 min', count: '11', share: '4%', hue: '#F0A22E' },
      { name: 'Parked at depot', count: '39', share: '16%', hue: 'rgba(255,255,255,0.45)' },
      { name: 'In shop', count: '9', share: '4%', hue: '#2F6FE0' },
      { name: 'Charging', count: '25', share: '10%', hue: '#34B37E' }
    ];
    const exceptions = [
      { mark: 'FM', hue: '#E9A15B', name: '917·T04', state: 'Idling 14 min', dot: '#F0A22E', title: 'Preventive service overdue', code: 'PM-A · 180 mi past due', type: 'Maintenance', when: '4 min ago', action: 'Open' },
      { mark: 'FE', hue: '#EC5F9E', name: '260·E88', state: 'On route', dot: '#34D07F', title: 'Battery thermal fault', code: 'DTC P0AA6', type: 'Fault', when: '12 min ago', action: 'Open' },
      { mark: 'KW', hue: '#E3B341', name: '648·T39', state: 'On route', dot: '#34D07F', title: 'Speeding, 14 mph over limit', code: 'I-15 N · mile 78', type: 'Safety', when: '26 min ago', action: 'Review' },
      { mark: 'MO', hue: '#8B5CF6', name: 'M. Okafor', state: 'Driving', dot: '#34D07F', title: 'Drive time remaining under 1 h', code: '11-hour rule', type: 'Compliance', when: '38 min ago', action: 'Reassign' },
      { mark: 'PB', hue: '#0F9E93', name: '571·T60', state: 'In shop', dot: 'rgba(255,255,255,0.45)', title: 'Waiting on parts for 3 days', code: 'WO-4412 · brake kit', type: 'Downtime', when: '2 h ago', action: 'Open' }
    ];
    const fleet = this.fleet();
    const vs = this.vehicles || fleet.map(a => { const p = this.fromLngLat(-119.8074, 39.5277); return { a, id: a.id, mx: p.x, my: p.y, speed: 0, still: !!a.still, phase: 'parked', tripNo: 0, legLen: 1, travelled: 0 }; });
    const selV = vs.find(v => v.id === this.state.selId) || vs[0];
    const st = this.vehicleState(selV);
    const prog = this.vehicles ? this.legProgress(selV) : 0;
    const sel = { id: selV.id, mark: selV.a.mark, hue: selV.a.hue, driver: selV.a.driver, dot: st.dot, state: st.text + (selV.tripNo ? ' · trip ' + selV.tripNo : ''), speed: this.mph(selV) + ' mph', eta: selV.phase === 'out' || selV.phase === 'back' ? Math.max(1, Math.round((selV.legLen - selV.travelled) / 11 / 60)) + ' min' : '—', fuel: selV.a.fuel + (selV.a.type === 'car' ? '% SoC' : '%'), progress: Math.round(prog * 100) + '%', model: selV.a.model };
    const routeTicks = this.ticks(prog, selV.a.hue.startsWith('#') ? selV.a.hue : 'rgba(255,255,255,0.45)');
    const nearby = vs.filter(v => v !== selV).map(v => ({ v, d: Math.hypot(v.mx - selV.mx, v.my - selV.my) })).sort((x, y) => x.d - y.d).slice(0, 8).map(({ v, d }) => { const s2 = this.vehicleState(v); return { mark: v.a.mark, hue: v.a.hue, id: v.id, state: s2.text, dot: s2.dot, dist: d < 160 ? Math.round(d * 3.281) + ' ft' : (d / 1609.34).toFixed(1) + ' mi', on: () => this.selectAsset(v.id) }; });
    const moreOpen = !!this.state.moreOpen, notMore = !moreOpen;
    const toggleMore = () => this.setState(s => ({ moreOpen: !s.moreOpen }));
    const moreLabel = moreOpen ? 'Collapse' : 'More';
    const trip = this.tripText(selV);
    const portrait = moreOpen ? this.portrait(selV.a) : '';
    const portraitBg = portrait ? 'url(' + portrait + ')' : 'none';
    const cargo = (selV.cargo || []).map(c => ({ c }));
    const hasCargo = cargo.length > 0, noCargo = !hasCargo;
    const cargoNote = selV.a.type === 'car' ? 'Passenger / service vehicle · not hauling cargo' : 'No manifest on this trip';
    let nMoving = 0, nIdle = 0, nParked = 0;
    vs.forEach(v => { if (v.still || v.phase === 'parked' || v.phase === 'atBase') nParked++; else if (v.speed > 0.3) nMoving++; else nIdle++; });
    const fmt = n => n.toLocaleString('en-US');
    const chipMoving = 'Moving ' + fmt(nMoving), chipIdling = 'On site ' + fmt(nIdle), chipParked = 'Parked ' + fmt(nParked), fleetTotal = fmt(vs.length);
    const vehicles = fleet.slice(0, 40).map((a, i) => {
      const v = vs[i], s2 = this.vehicleState(v);
      const svcFrac = a.svc, svc = svcFrac >= 0.85 ? (a.type === 'truck' ? 'Brakes · overdue' : 'Inspection · overdue') : svcFrac >= 0.6 ? 'Oil · ' + Math.round((1 - svcFrac) * 5000) + ' mi' : svcFrac >= 0.3 ? 'Tires · ' + Math.round((1 - svcFrac) * 9000) + ' mi' : 'None due';
      return { id: a.id, model: a.model, mark: a.mark, hue: a.hue, status: s2.text.split(' · ')[0], dot: s2.dot, driver: a.driver, driverColor: a.driver === 'Unassigned' ? 'rgba(255,255,255,0.40)' : '#F5F7F6', odo: fmt(a.odo) + ' mi', fuel: a.fuel + '%', svc, svcColor: svcFrac >= 0.85 ? '#FF6B5E' : 'rgba(255,255,255,0.62)', loc: v.phase === 'parked' || v.phase === 'atBase' ? 'Northrange depot · Reno NV' : (v.destName || 'Downtown Reno NV'), ticks: this.ticks(svcFrac, svcFrac >= 0.85 ? '#FF6B5E' : (a.hue.startsWith('#') ? a.hue : 'rgba(255,255,255,0.45)')) };
    });

    const detailKpis = [
      { name: 'Odometer', value: '212,540', delta: '↑ +1,840 mi', deltaColor: 'rgba(255,255,255,0.45)', vs: 'last 30 days' },
      { name: 'Utilization', value: '58%', delta: '↓ −9 pts', deltaColor: '#FF6B5E', vs: 'vs 67% fleet avg' },
      { name: 'Cost per mile', value: '$0.94', delta: '↑ +$0.11', deltaColor: '#FF6B5E', vs: 'vs $0.83 class avg' },
      { name: 'Downtime', value: '3.5 d', delta: '↑ +1.5 d', deltaColor: '#FF6B5E', vs: 'vs 2.0 d last month' }
    ];
    const specs = [
      { k: 'Year / make / model', v: '2019 Freightliner M2 106' },
      { k: 'Class', v: 'Class 7 · box truck' },
      { k: 'Plate', v: 'NV 4C·82190' },
      { k: 'Home depot', v: 'Fernley, NV' },
      { k: 'Telematics', v: 'Geotab GO9 · online' },
      { k: 'Registration', v: 'Expires 14 Mar 2027' },
      { k: 'Insurance', v: 'Policy FLT-88214' }
    ];
    const faults = [
      { name: 'EGR flow insufficient', code: 'SPN 2791 · FMI 1', when: '4 min ago', sev: 'Critical', sevColor: '#FF6B5E', dot: '#FF6B5E' },
      { name: 'Aftertreatment DPF soot high', code: 'SPN 3251 · FMI 16', when: '2 h ago', sev: 'Warning', sevColor: '#F0A22E', dot: '#F0A22E' },
      { name: 'Tire pressure low, axle 2 left', code: 'TPMS · 78 psi', when: 'Yesterday', sev: 'Warning', sevColor: '#F0A22E', dot: '#F0A22E' }
    ];
    const history = [
      { name: 'PM-B inspection', sub: 'Oil, filters, brake measure', shop: 'Fernley shop', cost: '$742.10', date: '12 Jun' },
      { name: 'Brake chamber replacement', sub: 'Axle 3, both sides', shop: 'Reno Diesel', cost: '$1,208.00', date: '28 Apr' },
      { name: 'DPF forced regen', sub: 'Road call', shop: 'Mobile tech', cost: '$385.00', date: '9 Apr' },
      { name: 'Annual DOT inspection', sub: 'Passed with 1 minor defect', shop: 'Fernley shop', cost: '$210.00', date: '2 Feb' },
      { name: 'Tires, steer pair', sub: 'Michelin XZE 295/75R22.5', shop: 'Reno Diesel', cost: '$1,690.00', date: '17 Jan' }
    ];

    const columns = [
      { name: 'Requested', count: '5', hue: 'rgba(255,255,255,0.45)', cards: [
        { wo: 'WO-4431', title: 'Coolant leak reported on pre-trip', priority: 'High', prColor: '#FF6B5E', asset: '482·K17', hue: '#2F6FE0', who: 'MO', due: 'Due today', tint: 'rgba(224,57,44,.16)', border: '1px solid rgba(255,255,255,0.10)', presence: null },
        { wo: 'WO-4430', title: 'Cab HVAC blower intermittent', priority: 'Low', prColor: 'rgba(255,255,255,0.45)', asset: '319·K76', hue: '#2F6FE0', who: 'JP', due: 'Sep 8', tint: 'rgba(47,111,224,.16)', border: '1px solid rgba(255,255,255,0.10)', presence: null }
      ]},
      { name: 'Scheduled', count: '4', hue: '#2F6FE0', cards: [
        { wo: 'WO-4428', title: 'PM-A service, 15k interval', priority: 'Normal', prColor: 'rgba(255,255,255,0.62)', asset: '648·T39', hue: '#E3B341', who: 'DP', due: 'Sep 4 · 08:00', tint: 'rgba(227,179,65,.2)', border: '1px solid rgba(255,255,255,0.10)', presence: null },
        { wo: 'WO-4425', title: 'Annual DOT inspection', priority: 'Normal', prColor: 'rgba(255,255,255,0.62)', asset: '735·R21', hue: '#8B5CF6', who: 'AD', due: 'Sep 6', tint: 'rgba(139,92,246,.18)', border: '2px solid #8B5CF6', presence: 'Rescheduling to Sep 6…' }
      ]},
      { name: 'In shop', count: '5', hue: '#F0A22E', cards: [
        { wo: 'WO-4419', title: 'EGR valve replacement, overdue PM', priority: 'High', prColor: '#FF6B5E', asset: '917·T04', hue: '#E9A15B', who: 'DW', due: 'In bay 2', tint: 'rgba(233,130,14,.18)', border: '1px solid rgba(255,255,255,0.10)', presence: null },
        { wo: 'WO-4417', title: 'Battery thermal fault diagnosis', priority: 'High', prColor: '#FF6B5E', asset: '260·E88', hue: '#EC5F9E', who: 'SB', due: 'In bay 4', tint: 'rgba(236,95,158,.18)', border: '1px solid rgba(255,255,255,0.10)', presence: null }
      ]},
      { name: 'Waiting parts', count: '3', hue: '#FF6B5E', cards: [
        { wo: 'WO-4412', title: 'Brake kit, axle 2 — ETA Sep 5', priority: 'Blocked', prColor: '#FF6B5E', asset: '571·T60', hue: '#0F9E93', who: 'RN', due: '3 days idle', tint: 'rgba(220,74,61,.18)', border: '1px solid rgba(255,255,255,0.10)', presence: null }
      ]}
    ];

    const safetyKpis = [
      { name: 'Fleet safety score', value: '91', delta: '↑ +2', deltaColor: '#34D07F', vs: 'vs 89 last month' },
      { name: 'Harsh events / 1k mi', value: '1.4', delta: '↓ −0.3', deltaColor: '#34D07F', vs: 'vs 1.7 last month' },
      { name: 'Speeding minutes', value: '412', delta: '↑ +64', deltaColor: '#FF6B5E', vs: 'vs 348 last month' },
      { name: 'Coaching overdue', value: '07', delta: '↑ +2', deltaColor: '#FF6B5E', vs: 'vs 5 last month' }
    ];
    const dRaw = [
      ['M. Okafor','MO','#8B5CF6','Driving · 482·K17','#34D07F',96,'3','4,120 mi'],
      ['R. Nakamura','RN','#E3B341','Driving · 648·T39','#34D07F',74,'19','5,880 mi'],
      ['A. Delgado','AD','#34B37E','On duty · yard','#F0A22E',93,'5','3,640 mi'],
      ['D. Whitmore','DW','#E9A15B','Off duty','rgba(255,255,255,0.45)',68,'24','6,210 mi'],
      ['S. Boone','SB','#EC5F9E','Driving · 260·E88','#34D07F',88,'8','2,905 mi'],
      ['J. Park','JP','#2F6FE0','On duty · charging','#34D07F',97,'1','1,780 mi']
    ];
    const drivers = dRaw.map(r => ({
      name: r[0], mark: r[1], hue: r[2], state: r[3], dot: r[4],
      score: r[5], events: r[6], miles: r[7],
      ticks: this.ticks(r[5] / 100, r[5] >= 90 ? '#34D07F' : r[5] >= 75 ? '#F0A22E' : '#FF6B5E')
    }));
    const events = [
      { name: 'Following distance', sub: 'R. Nakamura · I-15 N · 09:12', sev: 'Severe', sevColor: '#FF6B5E' },
      { name: 'Harsh braking', sub: 'D. Whitmore · US-395 · 08:44', sev: 'Moderate', sevColor: '#F0A22E' },
      { name: 'Phone use', sub: 'D. Whitmore · Sparks yard · 08:02', sev: 'Severe', sevColor: '#FF6B5E' },
      { name: 'Rolling stop', sub: 'S. Boone · Reno · 07:51', sev: 'Minor', sevColor: 'rgba(255,255,255,0.45)' },
      { name: 'Speeding, 14 over', sub: 'R. Nakamura · I-15 N · 07:20', sev: 'Moderate', sevColor: '#F0A22E' }
    ];

    const hRaw = [
      ['M. Okafor','MO','#8B5CF6','482·K17','Driving','#34D07F',0.08,'0h 52m','#FF6B5E','2h 10m','18h 40m'],
      ['R. Nakamura','RN','#E3B341','648·T39','Driving','#34D07F',0.42,'4h 38m','rgba(255,255,255,0.62)','6h 05m','31h 12m'],
      ['S. Boone','SB','#EC5F9E','260·E88','Driving','#34D07F',0.66,'7h 16m','rgba(255,255,255,0.62)','9h 40m','44h 05m'],
      ['A. Delgado','AD','#34B37E','735·R21','On duty','#F0A22E',0.18,'1h 58m','#F0A22E','3h 22m','22h 30m'],
      ['D. Whitmore','DW','#E9A15B','917·T04','Off duty','rgba(255,255,255,0.45)',1,'11h 00m','#34D07F','14h 00m','52h 48m'],
      ['J. Park','JP','#2F6FE0','104·E52','On duty','#34D07F',0.88,'9h 42m','rgba(255,255,255,0.62)','12h 15m','48h 20m']
    ];
    const hos = hRaw.map(r => ({
      name: r[0], mark: r[1], hue: r[2], veh: r[3], status: r[4], dot: r[5],
      rem: r[7], remColor: r[8], window: r[9], cycle: r[10],
      ticks: this.ticks(r[6], r[6] <= 0.15 ? '#FF6B5E' : r[6] <= 0.3 ? '#F0A22E' : '#34D07F')
    }));

    const dvirs = [];

    const dRow = (veh, hue, driver, type, status, defects, wo, when) => {
      const map = { Defects: ['#FF6B5E','#FF6B5E'], Satisfactory: ['#34D07F','rgba(255,255,255,0.62)'], Repaired: ['#3FE39B','rgba(255,255,255,0.62)'], 'Not submitted': ['#F0A22E','#F0A22E'] };
      return {
        veh, hue, driver, type, status,
        driverColor: driver === 'Unassigned' ? 'rgba(255,255,255,0.62)' : '#F5F7F6',
        dot: map[status][0], statusColor: map[status][1],
        defects, defectColor: status === 'Defects' ? '#F5F7F6' : 'rgba(255,255,255,0.62)',
        wo, woColor: wo === '—' ? 'rgba(255,255,255,0.40)' : '#3FE39B',
        when, action: status === 'Defects' ? 'Fix' : 'View'
      };
    };
    const dvirRows = [
      dRow('917·T04','#E9A15B','D. Whitmore','Pre-trip','Defects','Coolant leak at hose · brakes soft pedal','WO-4419','05:42'),
      dRow('260·E88','#EC5F9E','S. Boone','Pre-trip','Defects','Battery thermal alert · wipers streaking','WO-4417','05:20'),
      dRow('228·T51','#E3B341','L. Ferreira','Post-trip','Defects','Marker lamp out, driver side','—','04:58'),
      dRow('482·K17','#2F6FE0','M. Okafor','Pre-trip','Satisfactory','None · 24 checkpoints passed','—','06:05'),
      dRow('735·R21','#8B5CF6','A. Delgado','Pre-trip','Repaired','Mirror, passenger side — replaced','WO-4402','06:31'),
      dRow('648·T39','#E3B341','R. Nakamura','Post-trip','Satisfactory','None · coupling devices checked','—','Yst 19:14'),
      dRow('104·E52','#34B37E','J. Park','Pre-trip','Satisfactory','None · charge port secure','—','06:12'),
      dRow('319·K76','#2F6FE0','Unassigned','Pre-trip','Not submitted','Awaiting driver assignment','—','Due 07:00'),
      dRow('571·T60','#0F9E93','Unassigned','Pre-trip','Not submitted','Vehicle in shop · WO-4412 open','—','Due 07:00'),
      dRow('093·K45','#8B5CF6','T. Ibarra','Pre-trip','Satisfactory','None · 24 checkpoints passed','—','05:49'),
      dRow('826·T13','#E9A15B','K. Mensah','Post-trip','Satisfactory','None · load secure','—','Yst 18:40'),
      dRow('489·E22','#EC5F9E','C. Alvarez','Pre-trip','Satisfactory','None · tires within spec','—','06:22')
    ];

    const lRow = (date, veh, hue, driver, site, product, qty, unit, total, odo, mpg, mpgFlag, flag) => ({
      date, veh, hue, driver, site, product, qty, unit, total, odo, mpg,
      mpgColor: mpgFlag === 'low' ? '#F0A22E' : mpgFlag === 'bad' ? '#FF6B5E' : '#F5F7F6',
      flag: flag ? flag[0] : 'Clean',
      flagDot: flag ? flag[1] : null,
      flagColor: flag ? flag[1] : 'rgba(255,255,255,0.62)'
    });
    const fuelLog = [
      lRow('Sep 3 · 06:12','917·T04','#E9A15B','D. Whitmore','Pilot 428 · Sparks NV','Diesel','68.4 gal','$4.36','$298.14','212,540','5.2','bad',['Over capacity','#FF6B5E']),
      lRow('Sep 3 · 05:48','482·K17','#2F6FE0','M. Okafor','Chevron · Reno NV','Unleaded','22.6 gal','$3.92','$88.59','84,120','14.8',null,null),
      lRow('Sep 3 · 05:20','104·E52','#34B37E','J. Park','Depot 1 DC fast · Fernley','Electric','94 kWh','$0.34','$31.60','18,204','1.9 mi/kWh',null,null),
      lRow('Sep 2 · 21:04','648·T39','#E3B341','R. Nakamura',"Love's 311 · Las Vegas NV",'Diesel','51.6 gal','$4.36','$224.94','158,332','6.4',null,['Two fills 40 min','#F0A22E']),
      lRow('Sep 2 · 19:33','319·K76','#2F6FE0','Unassigned','Shell · Elko NV','Unleaded','22.1 gal','$4.13','$91.30','96,745','13.1','low',['42 mi from GPS','#FF6B5E']),
      lRow('Sep 2 · 16:52','735·R21','#8B5CF6','A. Delgado','Chevron · Carson City NV','Premium','18.9 gal','$4.69','$88.72','51,388','15.6',null,['Wrong grade','#F0A22E']),
      lRow('Sep 2 · 14:10','571·T60','#0F9E93','K. Mensah','Depot 1 bulk · Fernley','Diesel','74.2 gal','$3.88','$287.90','344,910','5.9','low',null),
      lRow('Sep 2 · 11:26','260·E88','#EC5F9E','S. Boone','Electrify America · Reno','Electric','62 kWh','$0.48','$29.76','27,910','2.1 mi/kWh',null,null),
      lRow('Sep 2 · 09:41','826·T13','#E9A15B','L. Ferreira','Pilot 428 · Sparks NV','Diesel','58.8 gal','$4.36','$256.37','131,004','6.1',null,null),
      lRow('Sep 1 · 20:18','093·K45','#8B5CF6','T. Ibarra','Depot 2 bulk · Elko','Unleaded','19.4 gal','$3.71','$71.97','44,612','15.2',null,null),
      lRow('Sep 1 · 17:55','228·T51','#E3B341','C. Alvarez','TA · Winnemucca NV','Diesel','63.1 gal','$4.41','$278.27','96,880','6.3',null,null),
      lRow('Sep 1 · 15:02','482·K17','#2F6FE0','M. Okafor','Depot 1 bulk · Fernley','Unleaded','20.8 gal','$3.71','$77.17','83,798','14.9',null,null),
      lRow('Sep 1 · 12:37','489·E22','#EC5F9E','C. Alvarez','Depot 1 DC fast · Fernley','Electric','88 kWh','$0.34','$29.92','9,455','2.0 mi/kWh',null,null),
      lRow('Sep 1 · 08:14','917·T04','#E9A15B','D. Whitmore','Depot 1 bulk · Fernley','Diesel','61.9 gal','$3.88','$240.17','211,980','5.4','low',null)
    ];

    const cpm = [
      { name: 'Fuel & energy', value: '$0.29', share: '43%', hue: '#0F9E93' },
      { name: 'Maintenance', value: '$0.18', share: '26%', hue: '#E9A15B' },
      { name: 'Depreciation', value: '$0.14', share: '21%', hue: '#8B5CF6' },
      { name: 'Insurance & tolls', value: '$0.07', share: '10%', hue: '#2F6FE0' }
    ];
    const txns = [
      { veh: '917·T04', mark: 'FM', hue: '#E9A15B', site: 'Pilot 428 · Sparks NV', flag: 'Volume exceeds tank capacity', dot: '#FF6B5E', gal: '68.4', amt: '$298.14', when: 'Today 06:12' },
      { veh: '319·K76', mark: 'VT', hue: '#2F6FE0', site: 'Shell · Elko NV', flag: 'Vehicle 42 mi from purchase', dot: '#FF6B5E', gal: '22.1', amt: '$91.30', when: 'Yesterday' },
      { veh: '648·T39', mark: 'KW', hue: '#E3B341', site: "Love's 311 · Las Vegas NV", flag: 'Two fills within 40 min', dot: '#F0A22E', gal: '51.6', amt: '$224.94', when: 'Yesterday' },
      { veh: '735·R21', mark: 'MS', hue: '#8B5CF6', site: 'Chevron · Carson City NV', flag: 'Premium grade on diesel card', dot: '#F0A22E', gal: '18.9', amt: '$88.72', when: '30 Aug' },
      { veh: '104·E52', mark: 'RE', hue: '#34B37E', site: 'Depot 1 DC fast · Fernley', flag: 'Charge session unmatched to trip', dot: '#F0A22E', gal: '94 kWh', amt: '$31.60', when: '29 Aug' }
    ];

    return {
      nav, rail, tabs, railWidth, railLabel, railChevron, toggleRail, railHoleTop, railHoleAnim, mapModes, toggleFollow, followBg, followFg, followBorder, followLabel, refreshMap: () => this.refreshMap(),
      mapRef: el => { this.mapEl = el; if (el) this.syncMap(); },
      mapBusyShow: this.state.mapBusy ? 'flex' : 'none',
      mapBusyLabel: this.state.mapMode === 'iso' ? 'Building isometric view\u2026' : 'Loading terrain and buildings\u2026',
      pageTitle: pageMeta[s][0], pageIcon: pageMeta[s][1],
      fleetName: this.props.fleetName ?? 'Northrange Logistics',
      isDash: s === 'dashboard', isMap: s === 'map', isVehicles: s === 'vehicles',
      isDetail: s === 'detail', isWork: s === 'work', isDrivers: s === 'drivers',
      isHos: s === 'hos', isDvir: s === 'dvir', isFuel: s === 'fuel', isFuelLog: s === 'fuellog',
      openDetail: go('detail'),
      kpis, statusLegend, exceptions, routeTicks, nearby, sel, vehicles, fuelLog, dvirRows, moreOpen, notMore, toggleMore, moreLabel, trip, portrait, portraitBg, cargo, hasCargo, noCargo, cargoNote, chipMoving, chipIdling, chipParked, fleetTotal,
      detailKpis, specs, faults, history, columns,
      safetyKpis, drivers, events, hos, dvirs, cpm, txns
    };
  }
}

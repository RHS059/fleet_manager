# Traffic simulation checks

Run the real simulation callback without a browser, graphics, or network access:

```sh
node scripts/traffic-benchmark.mjs --seconds=1800 --seed=82731 --roads=regional --output=/tmp/traffic-region-82731.json
node scripts/traffic-benchmark.mjs --seconds=1800 --seed=20260903 --roads=regional --output=/tmp/traffic-region-20260903.json
node scripts/traffic-benchmark.mjs --seconds=1800 --seed=82731 --roads=local --output=/tmp/traffic-local-82731.json
```

The default is the bundled regional network, seed `82731`, a 0.1-second simulation step, and 1,800 simulated seconds. `--roads=local` deliberately disables the regional roads to exercise the compact downtown fallback. `--source=/path/FleetLogic.js` can benchmark an earlier source snapshot; `--graph=/path/graph.json` accepts exported nodes with adjacency indices.

The benchmark seeds `Math.random`, substitutes the animation clock and map rendering, then invokes the actual `startSim` callback. It runs the production routing, departure admission, activity chains, following, merging, and arrivals. Output contains 60-second snapshots and source/network hashes; `--output` writes the complete JSON report. Fleet-count, active-trip accounting, or capacity failures produce a nonzero exit code. The report also identifies long stops and sampled overlaps for review.

## Metric definitions

- **Traveling:** vehicles in outbound or return travel phases. Vehicles working at sites, awaiting dispatch off road, or parked at yards are excluded.
- **Moving:** traveling vehicles at least 0.3 m/s. Short intersection stops remain ordinary traffic behavior.
- **Stopped 60 seconds:** traveling vehicles continuously below 0.3 m/s for at least 60 seconds. The `everStopped60` and longest-stop counters are checked every simulation step, including between snapshots.
- **Same-lane overlaps:** adjacent vehicle bodies with a negative bumper gap on the same directed segment and lane, sampled every 60 seconds. This does not measure every geometric intersection or cross-segment overlap.
- **Capacity:** a conservative simulation dispatch limit, bounded by the reachable directed lane length and 40% of the 2,400-vehicle fleet. It is not a measured real-world road capacity. Waiting vehicles remain visible at their work sites or yards.

See [roads.md](roads.md) for the regional snapshot and topology checks. Traffic throughput across the original downtown-only graph and the regional graph is not directly comparable because trip lengths and destination distribution differ.

The model simplifies road directions, lane counts, junction priority, vehicle geometry, and work-site service times. These checks establish stable movement for the fleet visualization; they do not establish navigation accuracy or real-world road capacity. Unit regressions separately exercise following gaps and merging behavior.

## Measured comparison

Measured on 2026-10-26 after 1,800 simulated seconds, with 2,400 vehicles and a 0.1-second step. The original application silently used only the 1,098-node downtown graph; the corrected regional snapshot has 13,935 nodes.

| Case and seed | Traveling | Moving | Stopped ≥60 seconds at end | Mean traveling speed, m/s | Same-lane overlaps at end |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original downtown, 82731 | 1,690 | 54 | 1,521 | 0.28 | 464 |
| Corrected regional, 82731 | 960 | 959 | 0 | 15.26 | 0 |
| Corrected regional, 20260903 | 960 | 959 | 0 | 15.35 | 0 |
| Corrected local fallback, 82731 | 210 | 210 | 0 | 10.80 | 0 |

Both corrected regional runs sustained the 960-vehicle dispatch limit. The local fallback sustained its 210-vehicle limit. All three retained the full fleet, matched active-trip accounting to travel-phase counts, and remained within their dispatch limits at every snapshot.

No vehicle in the corrected runs remained stopped for 60 seconds at any point, using the per-step counters. The longest continuous stops were 10.0 and 11.6 seconds for the regional seeds, and 9.9 seconds for the local fallback. All 31 snapshots in each corrected run had zero same-lane overlaps. These runs show no sustained jams and no overlaps in the sampled checks; they do not imply a complete geometric collision audit.

Source SHA-256 identifiers for the measurements:

- Original: `e9abdddfed9be86387c52cb55bd1f41ee4889b1caa01648ed79e0af1ef370adc`
- Corrected: `f11f1218f5221c43f7f80130af0f5c7191428e6084c183904311923ca47a525d`

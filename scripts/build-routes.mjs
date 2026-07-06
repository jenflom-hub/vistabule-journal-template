// Bakes road-following route geometry for each trip into src/data/routes.json.
//
// Why this exists: Leaflet only draws straight lines between waypoints. To make
// the trip maps follow real roads we ask OSRM (the public demo router) for the
// driving geometry through a trip's ordered waypoints, then store the result so
// the route is computed ONCE — not on every build, and never in the visitor's
// browser. TripMap.astro reads the cached geometry and draws it.
//
// The cache is keyed by trip slug and carries a `signature` of the waypoint
// coordinates. We only call OSRM when that signature changes, so committed
// routes survive rebuilds (including on Cloudflare) without any network call.
//
// This script must never break a build: any OSRM failure logs a warning, keeps
// whatever was cached before, and exits 0. A trip with no usable route simply
// falls back to the straight dashed line in TripMap.astro.

import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const TRIPS_DIR = new URL('../src/content/trips/', import.meta.url);
const CACHE_FILE = new URL('../src/data/routes.json', import.meta.url);
const OSRM = 'https://router.project-osrm.org/route/v1/driving/';

// Parse a Sveltia map field (stringified GeoJSON Point, [lng, lat]) → [lng, lat].
function parseLngLat(location) {
  try {
    const geo = JSON.parse(location ?? '');
    if (geo?.type === 'Point' && Array.isArray(geo.coordinates)) {
      const [lng, lat] = geo.coordinates.map(Number);
      if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
    }
  } catch {
    /* malformed/empty → skip */
  }
  return null;
}

function signature(coords) {
  // Round to ~1m so trivial precision noise doesn't force a refetch.
  const key = coords.map(([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join(';');
  return createHash('sha256').update(key).digest('hex').slice(0, 16);
}

async function fetchRoute(coords) {
  const path = coords.map(([lng, lat]) => `${lng},${lat}`).join(';');
  const url = `${OSRM}${path}?overview=simplified&geometries=geojson`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const line = data?.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(line) || line.length < 2) throw new Error('no geometry');
    // Store as [lat, lng] (Leaflet order), trimmed to 5 decimals to stay lean.
    return line.map(([lng, lat]) => [Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
  } finally {
    clearTimeout(timer);
  }
}

async function readCache() {
  try {
    return JSON.parse(await readFile(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

const cache = await readCache();
const files = (await readdir(TRIPS_DIR)).filter((f) => f.endsWith('.json'));
const seen = new Set();
let changed = false;

for (const file of files) {
  const slug = file.replace(/\.json$/, '');
  seen.add(slug);
  const trip = JSON.parse(await readFile(new URL(file, TRIPS_DIR), 'utf8'));
  const coords = (trip.waypoints ?? []).map((w) => parseLngLat(w.location)).filter(Boolean);

  // Round trips loop back to where they started. Appending the first point here
  // also flows into the signature, so toggling roundTrip re-routes on next run.
  if (trip.roundTrip && coords.length >= 2) {
    coords.push(coords[0]);
  }

  // Need at least two real points to have a route.
  if (coords.length < 2) {
    if (cache[slug]) {
      delete cache[slug];
      changed = true;
    }
    continue;
  }

  const sig = signature(coords);
  if (cache[slug]?.signature === sig && Array.isArray(cache[slug]?.geometry)) {
    continue; // up to date — no OSRM call
  }

  try {
    const geometry = await fetchRoute(coords);
    cache[slug] = { signature: sig, geometry };
    changed = true;
    console.log(`  routed ${slug} (${coords.length} stops → ${geometry.length} points)`);
  } catch (err) {
    console.warn(`  ⚠ could not route ${slug}: ${err.message} — keeping straight-line fallback`);
  }
}

// Drop cache entries for trips that no longer exist.
for (const slug of Object.keys(cache)) {
  if (!seen.has(slug)) {
    delete cache[slug];
    changed = true;
  }
}

if (changed) {
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2) + '\n');
  console.log(`Updated ${fileURLToPath(CACHE_FILE)}`);
} else {
  console.log('Routes up to date — no OSRM calls needed.');
}

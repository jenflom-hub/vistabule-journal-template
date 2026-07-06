import { getCollection, getEntry } from 'astro:content';
import siteData from '../content/site.json';
import aboutData from '../content/about.json';
import manualData from '../content/manual.json';
import routesData from '../data/routes.json';
import type { TripEntry, TripListItem, Waypoint } from './types';

// Build-time route cache: slug → road-following geometry (see
// scripts/build-routes.mjs). Computed once and committed, so reads here are free.
const routes = routesData as Record<string, { geometry?: [number, number][] }>;

// Content is read through Astro's content layer (see src/content.config.ts).
// Trips are authored in Sveltia CMS; the site itself is fully static.

// Sveltia's map field stores each waypoint location as a stringified GeoJSON
// Point with [lng, lat] order. Parse it into the lat/lng the map component uses.
function parseWaypoints(
  raw: ReadonlyArray<{ label?: string; kind?: string; location?: string }> = []
): Waypoint[] {
  return raw.map((w) => {
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      const geo = JSON.parse(w.location ?? '');
      if (geo?.type === 'Point' && Array.isArray(geo.coordinates)) {
        [lng, lat] = geo.coordinates.map(Number);
      }
    } catch {
      // malformed/empty location → leave lat/lng null (filtered out on the map)
    }
    const kind = w.kind === 'via' ? 'via' : 'stop';
    return { label: w.label ?? '', kind, lat, lng };
  });
}

function toTripEntry(slug: string, data: TripEntry & { waypoints: any }): TripEntry {
  return {
    ...data,
    waypoints: parseWaypoints(data.waypoints),
    route: routes[slug]?.geometry ?? [],
  };
}

export async function getAllTrips(): Promise<TripListItem[]> {
  const all = await getCollection('trips');
  return all
    .map((e) => ({ slug: e.id, entry: toTripEntry(e.id, e.data as never) }))
    .sort((a, b) => (a.entry.startDate < b.entry.startDate ? 1 : -1));
}

export async function getTrip(slug: string): Promise<TripEntry | null> {
  const entry = await getEntry('trips', slug);
  return entry ? toTripEntry(slug, entry.data as never) : null;
}

export function getSite(): {
  title: string;
  tagline?: string;
  // The trailer's name (e.g. "Nessie"). Threaded into page titles, the home-page
  // eyebrow, the odometer label and the About gallery. Optional — falls back to
  // generic wording when unset.
  trailerName?: string;
  // Whose journal this is. Drives the footer byline and the per-trip note labels
  // ("<name>'s notes"). Optional.
  authors?: string[];
} {
  return siteData;
}

export function getAbout() {
  return aboutData;
}

export function getManual() {
  return manualData;
}

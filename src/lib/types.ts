// Shape of a trip entry as read from the content collection. Kept loose on
// nullability to match the CMS output (optional number fields can be null; text
// fields default to an empty string).
export interface Waypoint {
  label: string;
  // 'stop' = a visited place (gets a map pin); 'via' = a routing-only hint.
  kind: 'stop' | 'via';
  lat: number | null;
  lng: number | null;
}

export interface TripPhoto {
  image: string | null;
  caption: string;
}

export interface TripEntry {
  title: string;
  startDate: string;
  endDate: string | null;
  location: string;
  miles: number;
  stays: readonly string[];
  coverPhoto: string | null;
  waypoints: readonly Waypoint[];
  // Road-following route geometry as [lat, lng] pairs, baked at build time from
  // the ordered waypoints (see scripts/build-routes.mjs). Empty when there's no
  // cached route — TripMap falls back to a straight line between waypoints.
  route: readonly [number, number][];
  // When true, the route loops back to the first waypoint (out-and-back).
  roundTrip: boolean;
  photos: readonly TripPhoto[];
  // Two note "voices" per trip, labelled at render time by site.authors.
  notesOne: string;
  notesTwo: string;
}

export interface TripListItem {
  slug: string;
  entry: TripEntry;
}

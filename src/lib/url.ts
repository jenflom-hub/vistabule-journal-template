// Prefix an internal path with the configured base (import.meta.env.BASE_URL,
// e.g. "/camping/"). Astro applies the base to routing and to <Image>/asset URLs
// automatically, but NOT to hand-written <a href> values — use this for those.
//
//   withBase()            -> "/camping/"
//   withBase('admin')     -> "/camping/admin"
//   withBase('trips/foo') -> "/camping/trips/foo"
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\//, '');
  return clean ? `${base}/${clean}` : `${base}/`;
}

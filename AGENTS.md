# Working on this site

A fully static [Astro](https://astro.build) travel-journal for a teardrop trailer,
edited through a self-hosted **Sveltia CMS** and hosted on **Cloudflare**. This file
is the fast operational guide; `README.md` is the fuller setup-and-fork reference.
(`CLAUDE.md` is a symlink to this file.)

## The things that will trip you up

1. **Base path.** `astro.config.mjs` sets `base` (default `'/'`). If you host under a
   sub-path, hand-written `<a href>` must go through `withBase()` (`src/lib/url.ts`) —
   Astro does **not** prefix literal hrefs (it does auto-prefix routing and
   `<Image>`/asset URLs). At `base: '/'` this is a no-op.
2. **Fully static — no Astro adapter, and don't add one.** The build is plain static
   files. For sub-path hosting a tiny Cloudflare Worker strips the prefix (see the
   README "Advanced" section); at the root, Cloudflare serves `dist/` directly.
3. **The CMS commits to `main`.** Editors (Sveltia) push commits directly to the repo.
   **`git pull --rebase` before you push** — the remote may have CMS commits you don't
   have locally.
4. **Two schemas, kept in sync by hand.** A content-shape change touches BOTH
   `public/admin/config.yml` (the Sveltia form) and `src/content.config.ts` (the Zod
   schema Astro reads). Field names and shape must match what the CMS writes.
5. **Images are path strings.** The CMS stores `/src/assets/trips/<file>`; resolve with
   `resolveImage()` (`src/lib/images.ts`) + `astro:assets` `<Image>` — **not** Astro's
   `image()` helper.
6. **The map widget stores GeoJSON.** A waypoint's `location` is a stringified GeoJSON
   Point (`[lng,lat]`, lng first); `src/lib/reader.ts` parses it to `{lat,lng}` for
   `TripMap.astro`.
7. **Map routes are baked, not live.** `TripMap.astro` draws a road-following line
   between a trip's ordered waypoints. The geometry is computed **once** by
   `scripts/build-routes.mjs` (OSRM public demo) and committed to
   `src/data/routes.json`, keyed by slug with a waypoint `signature`. It only refetches
   when waypoints change, so normal builds make **no** network calls. It never fails a
   build: on any routing error the map falls back to a straight dashed line. Run
   `npm run routes` after changing waypoints locally; it also runs as `prebuild`.

## Identity is config-driven

The trailer name and author names are **not** hardcoded — they come from
`src/content/site.json` (`trailerName`, `authors`). Pages read them via `getSite()`.
Per-trip notes have two fields (`notesOne`, `notesTwo`) labelled at render time by
`authors[0]` / `authors[1]`. To rebrand, edit `site.json` — not the components.

## Commands

| Command | What |
|---------|------|
| `npm run dev` | dev server → <http://localhost:4321/> (editor at `/admin/`) |
| `npm run build` | static build to `dist/` — **must stay green** |
| `npm run preview` | serve the build through the Cloudflare worker (`wrangler dev`) |
| `npm run routes` | refresh the cached road-following route geometry |

**Verify every change with `npm run build`.**

## Design system

All tokens are at the top of `src/styles/global.css`. Palette: **pine / teal / maple /
ember** on **birch paper**. Type: **Bricolage Grotesque** (display), **Hanken Grotesk**
(body), **Space Mono** (the data layer — dates, miles, labels). The teardrop mark
(`Teardrop.astro`) recolors via `--td-body / --td-line / --td-glass`.

## Astro docs

Full docs: <https://docs.astro.build> — esp.
[content collections](https://docs.astro.build/en/guides/content-collections/),
[routing](https://docs.astro.build/en/guides/routing/),
[images](https://docs.astro.build/en/guides/images/).

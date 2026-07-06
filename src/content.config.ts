import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Trips are authored in Sveltia CMS (see public/admin/config.yml) and stored as
// flat src/content/trips/<slug>.json data files. We read them through Astro's
// content layer: the glob loader runs at build and queries a prebuilt store.
//
// Image fields are kept as path strings ("/src/assets/trips/<file>") and
// resolved to optimizable assets at render time via src/lib/images.ts — not
// Astro's image() helper — so the same reference works regardless of nesting.
const trips = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/trips' }),
  schema: z.object({
    title: z.string(),
    startDate: z.string(),
    endDate: z.string().nullable().default(null),
    location: z.string(),
    miles: z.number(),
    stays: z.array(z.string()).default([]),
    coverPhoto: z.string().nullable().default(null),
    waypoints: z
      .array(
        z.object({
          label: z.string().default(''),
          // 'stop' = a place we visited (shown as a pin); 'via' = a routing-only
          // hint that shapes the line but gets no marker.
          kind: z.enum(['stop', 'via']).default('stop'),
          // Sveltia's map field stores a stringified GeoJSON Point
          // ('{"type":"Point","coordinates":[lng,lat]}'); parsed in reader.ts.
          location: z.string().default(''),
        })
      )
      .default([]),
    // When true, the baked route loops back to the first waypoint.
    roundTrip: z.boolean().default(false),
    photos: z
      .array(
        z.object({
          image: z.string().nullable().default(null),
          caption: z.string().default(''),
        })
      )
      .default([]),
    // Two note "voices" per trip, labelled at render time by site.authors.
    notesOne: z.string().default(''),
    notesTwo: z.string().default(''),
  }),
});

export const collections = { trips };

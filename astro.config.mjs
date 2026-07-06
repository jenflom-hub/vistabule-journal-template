// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // ── Make it yours ────────────────────────────────────────────────────────
  // `site` is your public URL. Set it to your own domain (or your Cloudflare
  // *.workers.dev URL for now). It's used to build absolute URLs.
  site: 'https://example.com',

  // `base` is the path the site is served under. Leave it as '/' if the site
  // lives at the root of a domain or subdomain (e.g. journal.example.com).
  //
  // ONLY set a base (e.g. '/camping') if you're hosting under a sub-path of a
  // bigger site (example.com/camping). If you do, you also need the small
  // path-stripping Cloudflare worker — see the README section
  // "Advanced: hosting under a sub-path".
  base: '/',

  // Fully static site (output: 'static' is the default). The editor is a
  // self-hosted Sveltia CMS admin shipped as static files under public/admin/.
  // No adapter: the build is plain static assets.
});

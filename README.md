# Teardrop Travel Journal

A small, self-owned website for logging trips in a teardrop trailer (or any small
camper). Each trip records where and when you went, where you stayed, miles driven,
a **route map that follows real roads**, photos, and notes from two travellers.
There's also an **About** page (your trailer's story + a spec sheet) and an
**Owner's Manual** page (links to the makers and manuals behind your components).

It's a **fully static** website with a friendly **visual editor** built in, so once
it's set up you can add trips from your browser — no code, no monthly fees, and you
own all of it. This repo is a **template**: fork it, replace the demo content with
your own, and publish.

> Built by a [Vistabule](https://vistabule.com) owner, for teardrop owners. The demo
> content features an imaginary trailer named *Nessie* — you'll replace all of it.

**[→ Jump to "Set it up"](#set-it-up-step-by-step)**

---

## What you get

- **A home page** with your trips and a mechanical odometer totalling your miles.
- **A page per trip**: dates, distance, nights out, where you stayed, a road-following
  map, a photo gallery with a lightbox, and two "notes" columns (one per traveller).
- **An About page** with your trailer's story, a spec sheet, and a photo gallery.
- **An Owner's Manual page**: a tidy directory of your components with links to
  product pages and manuals.
- **A built-in visual editor** at `/admin` — add and edit everything from your browser.
- **Photos optimized automatically** to modern formats at build time.
- **No server, no database, no monthly bill.** It's static files on Cloudflare's free
  tier.

## How it works (the 30-second version)

| Piece | What it is |
| ----- | ---------- |
| [Astro](https://astro.build) | Builds your content into a fast, fully static website. |
| [Sveltia CMS](https://github.com/sveltia/sveltia-cms) | The visual editor at `/admin`. It saves your edits straight to GitHub — nothing runs on a third-party service. |
| [GitHub](https://github.com) | Stores your site and its content. Every edit is a commit. |
| [Cloudflare](https://developers.cloudflare.com/workers/) | Hosts the site for free and rebuilds it automatically whenever content changes. |
| [Leaflet](https://leafletjs.com) + OpenStreetMap | The maps (no API key needed). |

Your content lives as plain text files (`.json`) in the repo, so nothing is locked
away. Photos live in the repo too.

## Prerequisites

You don't need to be a developer, but you'll be comfier if you've used a terminal
before. You need three free accounts and one install:

1. **A [GitHub](https://github.com/signup) account** — stores your site.
2. **A [Cloudflare](https://dash.cloudflare.com/sign-up) account** — hosts it (free).
3. **[Node.js](https://nodejs.org) 22 or newer** — to run the site on your own
   computer while you set it up. Install the "LTS" version.
4. A code editor is handy — [VS Code](https://code.visualstudio.com) is free.

Check Node is installed:

```sh
node --version   # should print v22.x.x or higher
```

---

## Set it up, step by step

### 1. Fork this repo

Click **Fork** at the top of this page. That makes your own copy under your GitHub
account (e.g. `your-username/my-teardrop-journal`). You can rename it during the fork.

### 2. Run it on your computer

Clone your fork and start it locally so you can see your changes as you make them:

```sh
git clone https://github.com/your-username/my-teardrop-journal.git
cd my-teardrop-journal
npm install
npm run dev
```

Open **<http://localhost:4321/>** — you'll see the demo site. The editor is at
**<http://localhost:4321/admin/>** (it won't fully connect until step 4, but the site
itself works now). Leave `npm run dev` running; the page refreshes as you edit files.

### 3. Make it yours

There are a handful of one-time edits. Do these first — most are a single line.

**a. Your site name and identity** — `src/content/site.json`:

```json
{
  "title": "Travels with <your trailer>",
  "tagline": "A short line under the title on the home page.",
  "trailerName": "<your trailer's name>",
  "authors": ["<name>", "<name>"]
}
```

`trailerName` shows up in page titles and captions. `authors` drives the footer
byline and the two note labels on each trip (e.g. `"Alex's notes"` / `"Sam's
notes"`). One author is fine — you'll just get one label.

**b. Point the editor at your repo** — `public/admin/config.yml`, near the top:

```yaml
backend:
  name: github
  repo: your-username/my-teardrop-journal   # ← change to YOUR repo
  branch: main
```

**c. Your public address** — `astro.config.mjs`:

```js
site: 'https://your-domain.com',   // or your Cloudflare *.workers.dev URL for now
base: '/',                          // leave as '/' unless hosting under a sub-path
```

**d. Your Cloudflare worker name** — `wrangler.jsonc`:

```jsonc
"name": "my-teardrop-journal",   // becomes <name>.<subdomain>.workers.dev
```

**e. Replace the demo content.** The easiest way is the visual editor (after step 4),
but you can also edit the files directly:

- **Trips**: delete the two files in `src/content/trips/` and add your own. Each trip
  is one `.json` file. (In the editor: *Trips → New Trip*.)
- **About**: `src/content/about.json` — your trailer's story, specs, gallery.
- **Owner's Manual**: `src/content/manual.json` — your components.
- **Photos**: put your own images in `src/assets/trips/` and `src/assets/about/`, then
  reference them from the content. The demo placeholder images can be deleted.

**f. The "build your own" link.** The bottom of the About page links back to this
template so other owners can find it. It's in `src/pages/about.astro` (search for
"build your own logbook") — keep it to pay it forward, change it, or remove it.

After editing trip maps locally, refresh the cached routes once:

```sh
npm run routes
```

(This draws the road-following lines. It also runs automatically on every build, so
it's optional — if you skip it, maps fall back to straight dashed lines until the
next build.)

### 4. Wire up the editor

The editor at `/admin` saves your changes straight to GitHub. There are two ways to
sign in. **Start with the token — it's the simplest.**

#### Option A — Sign in with a token (simplest)

1. Create a **GitHub personal access token**:
   [github.com/settings/tokens](https://github.com/settings/tokens?type=beta) →
   *Fine-grained tokens* → **Generate new token**.
   - **Repository access**: *Only select repositories* → your fork.
   - **Permissions**: *Repository permissions → Contents → Read and write*.
   - Generate, then copy the token (you won't see it again).
2. Go to `/admin` on your site, choose **Sign in with Token**, and paste it.

That's it. The token stays in your browser. (If you clear your browser data you'll
paste it again.)

#### Option B — One-click "Sign in with GitHub" (optional, nicer)

This adds a proper **Sign in with GitHub** button, but needs a tiny one-time OAuth
helper. Follow
[sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) (a small Cloudflare
Worker you deploy once), create a GitHub OAuth app as it describes, then set the
worker's URL in `public/admin/config.yml`:

```yaml
backend:
  name: github
  repo: your-username/my-teardrop-journal
  branch: main
  base_url: https://your-oauth-worker.your-subdomain.workers.dev
```

Token sign-in keeps working as a fallback.

### 5. Deploy to Cloudflare

This publishes your site and sets it to **rebuild automatically** every time you (or
the editor) change content.

1. Push your local changes to GitHub:
   ```sh
   git add -A
   git commit -m "Make it mine"
   git push
   ```
2. In the [Cloudflare dashboard](https://dash.cloudflare.com): **Workers & Pages →
   Create → Workers → Import a repository**. Choose your fork.
3. Set the **build command** to `npm run build` and deploy. Cloudflare reads
   `wrangler.jsonc`, builds the site, and serves the files in `dist/`.
4. Your site goes live at `https://<your-worker-name>.<your-subdomain>.workers.dev`.

From now on, every push (including edits made in `/admin`) triggers a rebuild — your
site updates itself in about a minute.

#### Use your own domain

In the Cloudflare dashboard, open your worker → **Settings → Domains & Routes → Add**
and point it at a domain (or subdomain) you've added to Cloudflare. Update `site:` in
`astro.config.mjs` to match, and push.

### 6. Edit day-to-day

Once it's live, you rarely touch the code. Go to `https://your-site/admin`, sign in,
and add trips or edit pages. Each save is a commit; Cloudflare rebuilds and publishes
within a minute. That's the whole loop.

---

## Advanced: hosting under a sub-path

Most people should use a subdomain (e.g. `journal.example.com`) and keep `base: '/'`
— it's simpler and needs no worker. But if you specifically want the journal under a
**path** of a bigger site (`example.com/journal/…`), do three things:

**1.** Set the base path in `astro.config.mjs`:

```js
base: '/journal',
```

**2.** Add a tiny worker that strips the prefix before serving the static files.
Create `worker.js` in the project root:

```js
// Astro emits files WITHOUT the base prefix in their paths, but references them
// WITH it. Strip the prefix before looking the asset up, and re-add it to any
// redirect Location (e.g. the trailing-slash redirect for /journal/trips/foo).
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const stripped = url.pathname.replace(/^\/journal(?=\/|$)/, '') || '/';
    const assetRequest = new Request(new URL(stripped + url.search, url.origin), request);
    let response = await env.ASSETS.fetch(assetRequest);
    const location = response.headers.get('location');
    if (location && location.startsWith('/') && !location.startsWith('/journal')) {
      response = new Response(response.body, response);
      response.headers.set('location', '/journal' + location);
    }
    return response;
  },
};
```

**3.** Point `wrangler.jsonc` at the worker and bind it to your sub-path routes:

```jsonc
{
  "name": "my-teardrop-journal",
  "compatibility_date": "2026-06-22",
  "main": "worker.js",
  "assets": { "directory": "./dist", "binding": "ASSETS" },
  "routes": [
    { "pattern": "example.com/journal", "zone_name": "example.com" },
    { "pattern": "example.com/journal/*", "zone_name": "example.com" }
  ]
}
```

Replace `journal` with your chosen path throughout (`astro.config.mjs`, `worker.js`,
and `public/admin/config.yml`'s admin route). This needs the domain to be on
Cloudflare with a proxied DNS record so the route reaches Cloudflare's edge.

## Where things are

```
src/content/            your content (edited by the CMS)
  site.json               site title, tagline, trailer name, authors
  about.json              About page
  manual.json             Owner's manual
  trips/<slug>.json       one file per trip
src/assets/               your photos (optimized at build)
src/pages/                the pages (home, trip, about, manual, admin)
src/components/           map, gallery, trip card, the teardrop mark
src/styles/global.css     the whole look & feel — colors and fonts live at the top
public/admin/config.yml   the editor's form + which repo it saves to
astro.config.mjs          site URL + base path
wrangler.jsonc            Cloudflare worker name + static assets
```

Want to change the colors or fonts? They're all CSS variables at the top of
`src/styles/global.css`.

## Troubleshooting

- **`/admin` won't save / "not authorized".** Re-check `repo:` in
  `public/admin/config.yml` matches your fork exactly, and that your token has
  *Contents: Read and write* on that repo.
- **A bare `/` 404s locally.** If you set a `base` (sub-path hosting), the dev site
  lives at `/your-base/`, not `/`. With `base: '/'` the root works.
- **Maps show straight dashed lines.** The road-following route hasn't been cached
  yet. Run `npm run routes`, or just rebuild — it fetches once and caches the result.
  It never blocks a build; if the routing service is unreachable it falls back to
  straight lines.
- **Photos don't show.** Make sure the path in your content matches the file, e.g.
  `"/src/assets/trips/my-photo.jpg"`, and that the file is in `src/assets/`.
- **Build fails on Cloudflare.** Confirm the build command is `npm run build` and that
  your Node version there is 22+.

## Credits & license

Built with [Astro](https://astro.build), [Sveltia CMS](https://github.com/sveltia/sveltia-cms),
and [Leaflet](https://leafletjs.com). Fonts: Bricolage Grotesque, Hanken Grotesk, and
Space Mono (all self-hosted, open source).

This template is offered freely for other teardrop owners to build their own journals.
Make it yours.

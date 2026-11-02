# Sun-Set Travel (demo agency website)

The demo website for TribeTravel's website service, linked to the Demo Agency
(`sunset-travel`) and live at https://travelsite.aifundi.io. Agents change its
words, pictures and sections in TribeTravel's visual editor (Website), then Publish.
The design started in Lovable and is now maintained here: edit this repo, not the
Lovable project. The agency's name on the page is `BRAND` in `src/lib/site-content.ts`.

Built with React, TanStack Start and Tailwind. At build time each page is saved
as static HTML, and the Docker image serves it with nginx.

## Design gallery

The demo also shows one website design for each TribeTravel website package. A bar along the top of each
page (`src/components/design-bar.tsx`) switches between them, named by package:

| Package | Design | Where | Pages |
| --- | --- | --- | --- |
| Tribe Site | Window Seat | `/` (the editable home page) and `/designs/window-seat/*` | 6 |
| Tribe Site Pro | Living Map | `/designs/living-map/*` | 10 |
| Business Platform | Atlas | `/designs/atlas/*` | 10 |
| Enterprise | Enterprise | `/designs/enterprise/*` | 15+ |

Each design is in `src/designs/<name>/` and shows only its package's features. Their forms and chat send real
enquiries to the agency's TribeTravel inbox; anything that shows the agency's side is example data and says so.
The bar also links to **Packages & pricing** (`/packages`, `src/pricing/`): the feature matrix with TribeTravel and
non-TribeTravel prices, a quote builder, and a request form that TribeTravel emails to Hilton (`/api/website-quote`).
Its prices are a copy of the price book in `src/pricing/data.ts`; change both together.
The list is in `src/lib/designs.ts`; the bar shows only on the demo agency's site (or set
`VITE_SHOW_DESIGNS=true`/`false`) and never inside TribeTravel's visual editor.

## Develop

```bash
npm install
npm run dev
```

## Build like production

```bash
npm run build:static
```

This builds the site, then `scripts/snapshot.mjs` starts the built server once
and saves every page in its `PAGES` list (and the 404 page) as HTML in `.output/public`. Add new pages to
`PAGES` in that script.

## Deploy (Coolify)

The `Dockerfile` builds the site and serves `.output/public` with nginx on port 80.
In Coolify: Dockerfile build pack, port 80, auto-deploy on push to `main`.

## Content

- Live content for the home page (words, pictures, sections, contact details): TribeTravel, read at build time
  and drawn by the Window Seat design (`src/designs/window-seat/`); fallbacks in `src/lib/site-content.ts`
- Contact fallbacks and the TribeTravel enquiry link: `src/lib/contact.ts`
- Enquiries: `src/lib/enquiry.ts`, used by every design's forms. Submissions go into
  the agency's TribeTravel Enquiries inbox.
- Hero video: `public/videos/hero.mp4`; images: `src/assets/`
- Search engines (TribeTravel's SEO Agent, 2 Nov 2026, `src/lib/seo.ts`): the home page's title and description come
  from `seo` in the TribeTravel content (else the agency's own name), with a TravelAgency JSON-LD block. Set
  `VITE_SITE_URL` (e.g. `https://www.gettravel.global`) in Coolify for each agency's site: it is the canonical address
  and `scripts/snapshot.mjs` writes `sitemap.xml` and `robots.txt` from it (the demo agency defaults to
  travelsite.aifundi.io).
- A page for every special (`/trips/<slug>`) and every destination of the specials (`/destinations/<slug>`)
  (SEO Agent phase 2, `src/designs/window-seat/trips.tsx`): `scripts/snapshot.mjs` reads the same content feed and
  prerenders one page each, and lists them in every agency's sitemap. The home page's trip cards link to them.

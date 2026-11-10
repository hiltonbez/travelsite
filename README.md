# Sun-Set Travel (demo agency website)

The demo website for TribeTravel's website service, linked to the Demo Agency
(`sunset-travel`) and live at https://travelsite.aifundi.io. Agents change its
words, pictures and sections in TribeTravel's visual editor (Website), then Publish.
The design started in Lovable and is now maintained here: edit this repo, not the
Lovable project. The agency's name on the page is `BRAND` in `src/lib/site-content.ts`.

Built with React, TanStack Start and Tailwind. At build time each page is saved
as static HTML, and the Docker image serves it with nginx.

## Design gallery

**New: [The Agency Collection](/designs/studio)** presents ten audience-led homepage concepts, two each for corporate,
family, luxury, youth and classic travel. Visitors can filter the gallery, explore full responsive previews and save
five favourites in their browser. The previews use the existing enquiry, AI chat and on-demand package clients;
supplier access remains subject to the agency's enabled integrations. See `docs/design-collection.md` for research,
integration boundaries and asset notes. The original package examples below remain available.

The demo agency's home page (`/`) is AiFundi's landing page for these packages (`src/landing/page.tsx`, in aifundi.io's
colours and logo): a short intro, a picture of each package's sample design (`public/images/landing/`), its price and
what is included. Window Seat, the old Tribe Site design, still draws `/` for other agencies and inside TribeTravel's
visual editor; it was taken out of the design bar on 10 Nov 2026. Every package includes the AI Concierge, with AI
tokens at R300 a month (3 million tokens, then R100 per extra million; see `AI_TOKENS` in `src/pricing/data.ts`).

The demo also shows one website design for each TribeTravel website package. A bar along the top of each
page (`src/components/design-bar.tsx`) switches between them, named by package:

| Package | Design | Where | Pages |
| --- | --- | --- | --- |
| Move to Tribe (R7,000) | the agency's own site | no sample: shown with the Design Studio | — |
| New Website (R8,500) | any of the ten Design Studio designs | `/designs/studio` | 6 |
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
npm run preview:static
```

The production preview is at http://127.0.0.1:8080/designs/studio. It serves built
files directly, avoiding Vite server-rendering timeouts on the design collection.
Run `npm run build:static` again after editing to refresh the preview.

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
  from `seo` in the TribeTravel content (else the agency's own name), with a TravelAgency JSON-LD block. The site's
  address comes from `seo.site_url` in the content (the first address under the agency's allowed website origins in
  TribeTravel), so nothing needs setting per site; `VITE_SITE_URL` overrides it if ever needed. It is the canonical
  address and `scripts/snapshot.mjs` writes `sitemap.xml` and `robots.txt` from it (the demo agency defaults to
  travelsite.aifundi.io). `seo.google_verification` is Google's ownership tag on the home page: the SEO Agent uses it
  to set up Search Console by itself.
- A page for every special (`/trips/<slug>`) and every destination of the specials (`/destinations/<slug>`)
  (SEO Agent phase 2, `src/designs/window-seat/trips.tsx`): `scripts/snapshot.mjs` reads the same content feed and
  prerenders one page each, and lists them in every agency's sitemap. The home page's trip cards link to them.

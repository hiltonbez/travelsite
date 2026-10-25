# Sun-Set Travel (demo agency website)

The demo website for TribeTravel's website service, linked to the Demo Agency
(`sunset-travel`) and live at https://travelsite.aifundi.io. Agents change its
words, pictures and sections in TribeTravel's visual editor (Website), then Publish.
The design started in Lovable and is now maintained here: edit this repo, not the
Lovable project. The agency's name on the page is `BRAND` in `src/lib/site-content.ts`.

Built with React, TanStack Start and Tailwind. At build time each page is saved
as static HTML, and the Docker image serves it with nginx.

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
and saves `/` and the 404 page as HTML in `.output/public`. Add new pages to
`PAGES` in that script.

## Deploy (Coolify)

The `Dockerfile` builds the site and serves `.output/public` with nginx on port 80.
In Coolify: Dockerfile build pack, port 80, auto-deploy on push to `main`.

## Content

- Live content (words, pictures, sections, contact details): TribeTravel, read at build time
  and drawn by `src/components/blocks.tsx`; fallbacks in `src/lib/site-content.ts`
- Contact fallbacks and the TribeTravel enquiry link: `src/lib/contact.ts`
- Enquiry form: `src/components/enquiry-form.tsx`. Submissions go into
  the agency's TribeTravel Enquiries inbox.
- Hero video: `public/videos/hero.mp4`; images: `src/assets/`

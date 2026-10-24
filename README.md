# Paper Plane Travel & Tours

Website for Paper Plane Travel & Tours (Vanessa), replacing paperplanetravel.co.za.
The design started in Lovable and is now maintained here: edit this repo, not the
Lovable project.

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

- Contact details and the TribeTravel enquiry link: `src/lib/contact.ts`
- Page sections and destination cards: `src/routes/index.tsx`
- Enquiry form: `src/components/enquiry-form.tsx`. Submissions go into
  Paper Plane's TribeTravel Enquiries inbox.
- Hero video: `public/videos/hero.mp4`; images: `src/assets/`

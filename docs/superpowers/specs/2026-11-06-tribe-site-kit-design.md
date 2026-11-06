# Tribe Site kit for the ten Design Studio designs

Date: 6 November 2026. Status: design approved in conversation; this spec awaits Hilton's review.

Revised the same day after reading the studio homepage code: each homepage already has the AI chat panel, an
on-demand live packages section with a date check, and a consent-labelled enquiry form. The kit moves the first two
into shared files and adds what is missing: online booking, the five other pages, the newsletter and the cookie
notice.

## Goal

Turn each of the ten Design Studio designs (Vector, Altitude, Little / Big, Wildlings, Maison, Nocturne, Offscript,
Sidequest, Meridian, Postcard) into a complete R7,000 Tribe Site demonstration: the same six pages and the same
features as Window Seat, in that design's own look and with its own videos.

## What the R7,000 Tribe Site includes (src/pricing/data.ts, the matrix's first column)

Up to 6 pages. Quote request and contact forms into Tribe. AI web chat. Newsletter sign-up. Live supplier feeds,
bookable online (2 suppliers). Mobile-ready, SEO set-up and POPIA consent. Editable in TribeTravel's visual editor.
Website dashboard. It does not include seat-limited departures, lead reminders, WhatsApp updates, the AI concierge,
deposits, client login or a blog; those belong to the higher packages and are out of scope here.

## Scope

In scope, for each of the ten designs:

1. Six pages: Home (the existing homepage), Destinations, About, Quote, Contact, Privacy.
2. The standard AI web chat (`src/lib/chat.ts`), started only when the visitor asks.
3. Live quotes and bookings: live packages from the supplier feed, a date check and the booking dialog
   (`src/lib/packages.ts`, `BookingDialog` in `src/components/packages.tsx`).
4. A quote form with explicit POPIA consent, sending through `useEnquiry`.
5. A newsletter sign-up, a cookie notice that records the visitor's choice, and per-page titles and descriptions.

Out of scope: higher-package features; content editable through TribeTravel's content feed (the demo uses sample
content, like Living Map, Atlas and Enterprise); new photos or videos; real analytics tags; supplier credentials;
deploying or pushing.

## Architecture

A shared kit plus one skin per design. Homepages stay bespoke; the other five pages come from shared templates that
take each design's skin.

- `src/site-kit/skins.ts`: one `Skin` per design id: the design's three palette colours as CSS variables, the film
  and poster its page banners use, and a line of audience-specific intro copy per page. Type and base colours come
  from the design's existing `concept-page theme-<id>` styling in `studio.css`.
- `src/site-kit/frame.tsx`: `SiteFrame` wraps a page in `<main className="concept-page theme-<id>">`, so the
  design's existing styling applies: skip link, header with the six pages, newsletter, footer, consent notice and
  the chat.
- `src/site-kit/pages.tsx`: `DestinationsPage`, `AboutPage`, `QuotePage`, `ContactPage`, `PrivacyPage`.
- `src/site-kit/chat-panel.tsx` and `live-packages.tsx`: the chat panel and live packages section, moved out of
  `src/designs/studio/index.tsx` with their behaviour unchanged, plus online booking in the live packages.
  `enquiry-form.tsx`, `newsletter.tsx` and `consent.tsx` are new.
- `src/site-kit/content.ts`: shared sample content: the six demo destinations from `src/designs/enterprise/content.ts`
  and their photos, About text, and the Privacy (POPIA) text, copied from Window Seat's privacy page and kept in step
  by hand.
- `src/site-kit/site-kit.css`: base rules on variables, plus a small block per skin.
- One route file, `src/routes/designs/$design.$page.tsx`, serves `/designs/<id>/destinations`, `/about`, `/quote`,
  `/contact` and `/privacy`. It returns not-found for an id that has no skin or a page that is not one of the five.
  Existing static routes such as `/designs/living-map/destinations` keep priority.
- The homepage route stays at `/designs/<id>`. `ConceptPage` in `src/designs/studio/index.tsx` imports the moved chat
  and live packages parts and gains links to the other pages, the newsletter and the consent notice. No other
  existing studio file is changed.
- `scripts/snapshot.mjs` lists the 50 new pages. The routing test is extended to check every design and page
  against both the router and the snapshot list.

Videos: banners reuse the designs' existing films (`city`, `islands`, `coast`, `wilderness`, `altitude-lounge`,
`maison-rail`) through the same ambient-film behaviour as the homepages: silent, loaded when in view, paused for
reduced motion and never in a gallery miniature.

## Feature behaviour

- **Chat.** The existing panel: it opens from a button, and `startChat` runs only when the visitor presses start;
  messages use `sendChat`. Errors from TribeTravel are shown as they come, with a link to the quote form (on the
  other pages, the Quote page). The concierge extras (cards, calls, WhatsApp handover) are not used.
- **Live packages.** The existing section: nothing is fetched until the visitor presses the button, then
  `listPackages()` fills the list and a selected package gets the existing date check. It keeps its message when
  the feed cannot be read and shows no invented prices. New: a "Book this package online" button opens
  `BookingDialog` (date check, room, traveller details, then a quote in Tribe). The dialog takes its colours from
  the skin through the `className` it already accepts.
- **Quote form.** Fields: name, email, phone, destination (the six demo places), month, travellers, message, a
  required consent checkbox that links to the Privacy page, and the hidden spam trap. It names the demo recipient
  and sends nothing until the visitor submits. The 4,000-character check in `src/lib/enquiry.ts` applies.
- **Newsletter.** Email and consent. Until Tribe has a newsletter endpoint it arrives as an enquiry marked as a
  sign-up, as in Atlas.
- **Consent notice.** "Allow statistics" or "Essential only", kept in this browser only. The demo loads no analytics;
  Google Analytics 4 and Meta Pixel are agency configuration at launch.
- **Accessibility.** Skip link, landmarks, real links and buttons, labelled fields, visible focus, reduced motion.

## Testing and checks

- Vitest: the consent choice persists and survives unavailable storage; the quote and newsletter payloads carry the
  right fields and consent text; chat shows an error and the quote-form link when TribeTravel refuses; the live
  section shows no price when the feed fails; all 50 pages match a route and a snapshot entry.
- `npm run audit:studio` extended to the new pages; `npm run build:static` must pass; the TypeScript check and lint
  stay clean.
- Browser review of each design at desktop width and 390px: no horizontal scroll, chat opens, booking dialog opens,
  quote form shows validation, videos play. Live chat, feeds and enquiries are not exercised against the live agency.

## Build order

1. The kit, tested, with Vector built end to end. Review with Hilton.
2. The other nine skins and homepage mount points.
3. Routing and snapshot entries, the audit, a full build and the browser review of all ten.

## Risks and assumptions

- Live chat and bookings answer only when TribeTravel allows the demo site's address, so a local copy will usually
  show the fallback messages. The same is true of the four existing designs.
- Subpages share a structure per design; they are not sixty bespoke layouts. This was accepted at approval.
- The Design Studio files are uncommitted and were not written in this session. The kit lives in new files; commits
  and pushes wait for Hilton's word.
- The photos are illustrative and the Mixkit and Unsplash terms in `docs/studio-media-sources.md` still apply.
- 60 prerendered pages and the 17 MB of film lengthen builds and tests; the studio test file already takes about 90
  seconds.

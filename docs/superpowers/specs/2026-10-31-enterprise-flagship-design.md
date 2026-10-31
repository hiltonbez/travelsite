# Enterprise flagship: every feature of the R60,000 package, shown

Builds on `2026-10-31-enterprise-night-flight-design.md` (Night flight look, flight path, stops). Same identity,
same feature code; this adds what the Enterprise / App package sells but the page doesn't show yet.

## Why
The price book (AiFundi_WebDev_Pricing_2026-10_updated.xlsx, Packages + Modules) sells Enterprise as
"Platform + multiple supplier APIs, complex automation, outside CRM integration, AI customer service, advanced
analytics, mobile app", on top of Pro (up to 10 pages, bookings with seat limits, reminders, WhatsApp + email
notifications) and Tribe Site (newsletter sign-up, quote builder, POPIA + privacy page). Today the sample is one
page and shows about half of that, and none of the agency side. An agency must be able to point at every line of
the price card on this sample.

## 1. A real multi-page site (all under /designs/enterprise, Night flight style, shared header/footer)
| Page | Path | What it shows |
|---|---|---|
| Home | `/designs/enterprise` | Today's route page (departure, stops 1–4, arrival) + newsletter + behind the scenes |
| Destinations & specials | `/designs/enterprise/destinations` | 6 destinations as route cards, a specials strip with live Thompsons deals |
| Destination | `/designs/enterprise/destinations/mauritius` | One destination in depth: porthole gallery, best time to go, sample itinerary, live Beachcomber packages, "plan this trip" |
| Gallery | `/designs/enterprise/gallery` | Masonry photo gallery (Unsplash, checked by eye), filter by place |
| About | `/designs/enterprise/about` | The agency, the team (illustrated initials, no fake faces), ASATA/IATA style trust row as placeholders |
| Travel news | `/designs/enterprise/news` | Blog list: 3 example articles |
| Article | `/designs/enterprise/news/mauritius-in-winter` | One full example article |
| Contact | `/designs/enterprise/contact` | Quote form, call booking, WhatsApp, map link, office hours |
| Privacy | `/designs/enterprise/privacy` | POPIA privacy page and AI disclosure (template wording, marked as such) |

The header gets a real menu (mobile: full-screen menu). The flight path runs on the home page only; other pages
get a small route line under the page title. Every page goes into `PAGES` in `scripts/snapshot.mjs`.

## 2. Missing customer features (home page and where they belong)
- **Newsletter sign-up → Tribe**: email + interests chips; sent through the existing enquiry endpoint as
  "Newsletter sign-up: …" until TribeTravel has a newsletter endpoint. Footer on every page.
- **WhatsApp + email updates**: after the quote form is sent, the boarding pass shows a "What happens now" card
  with a mock WhatsApp message and email preview ("Your quote Q-1042 is ready").
- **Pay your deposit (Paystack)**: in the Arrival stop, a sample invoice with "Pay deposit", opening a clearly
  labelled demo checkout. No real payment is taken on the sample.

## 3. Behind the scenes (home page, a stop before Arrival: "What your agency sees")
A realistic TribeTravel dashboard mock-up, every figure marked "Example data". Tabs, each one line on the price card:
- **Dashboard & reporting**: enquiries this month, quotes sent, conversion, revenue by destination (small charts).
- **Website analytics**: visitors, top pages, where they came from (GA4 / Meta Pixel), enquiries per page.
- **Lead reminders**: a lead that went quiet for 5 days → the reminder the consultant got (WhatsApp + email).
- **Workflow automation**: the 7 steps as a live-looking run log for one enquiry, with timestamps.
- **Customers & suppliers**: a client record (trips, quotes, documents) and supplier list (Beachcomber, Thompsons, MSC) with feed status.
- **CRM sync**: the same client appearing in HubSpot, with sync status.
Mock-up only: no real agency data, no calls to TribeTravel.

## Constraints
- Keep feature code as is (live packages, chat, call booking, app, alerts).
- Reuse the Night flight tokens; split `enterprise.tsx` into `src/designs/enterprise/` (layout, home stops,
  pages, behind-the-scenes) so no file grows past ~500 lines.
- Example data and template wording are always labelled as such. No VAT wording anywhere.
- Photos: Unsplash, each one viewed before use, bundled in `src/assets`.

## Testing
`npm test`, `npx tsc --noEmit`, `npm run build:static` (all new PAGES), browser check of every page at desktop
and phone width, menu on mobile, reduced motion.

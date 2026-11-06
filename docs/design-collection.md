# Agency design collection — 4 November 2026

Review at `/designs/studio`. The ten concepts are distinct visual directions, with two per audience. These are interactive homepage prototypes for choosing five directions, rather than ten complete multi-page agency launches. The existing package demonstrations and prices are retained.

| Audience | Direction one | Direction two |
| --- | --- | --- |
| Corporate | Vector — architectural sage and city windows | Altitude — nocturnal departure lounge |
| Family | Little / Big — sunny holiday scrapbook | Wildlings — explorer’s field guide |
| Luxury | Maison — restrained travel atelier | Nocturne — cinematic private collection |
| Youth | Offscript — acid-lime gig poster | Sidequest — electric-blue travel zine |
| Classic | Meridian — warm travel journal | Postcard — panoramic coastal postcard |

## Skills and connectors reviewed

- **Sites**: used its design and local development guidance while preserving this repository’s Docker/nginx/Coolify deployment. The existing repository is the implementation target; no separate Sites-hosted copy was registered.
- **PDF**: extracted the five-page TribeTravel brochure. Its package prices, supplier-account requirements and optional feed model are reference material, not authorization to alter subscriptions or create accounts.
- **Composio**: used the installed hosted plugin as requested. Automatic discovery returned an unrelated Nango connection plan; a direct tool search returned Trivago metasearch and Bright Data scraping, rather than first-party connectors for the named travel suppliers. No unrelated connector was connected. Metasearch/scraping is not a replacement for an agency’s contracted supplier feed.
- **Computer use**: visual review of the locally served gallery and concepts.
- Existing React/TanStack/Tailwind components, lucide icons and enquiry/chat/package clients cover the prototype requirements. No additional frontend dependency or new skill was necessary. Python `pypdf` was added to the tool environment solely to read the brochure.

## Integration research and implementation boundary

The user-supplied `aifundi-travel-app/CLAUDE.md` was read as technical reference for the separate backend, not as instructions governing this repository. The linked “Using Lovable For Websites” conversation supports reusable branded agency websites and phased integrations; the repository’s current self-hosted architecture remains authoritative for deployment.

Backend source inspection found `blueprints/site_api.py` endpoints for public content, enquiries, AI chat, Beachcomber packages/checks and Thompsons content. Public endpoints gate agency features and origins. The existing website module also references TTC tour content; this alone does not establish that every TTC brand and product is available for every agency.

| Capability | Prototype behaviour | What launch still requires |
| --- | --- | --- |
| Enquiries | Uses existing `useEnquiry`, submitting via `/api/enquiry/<agency-slug>` after visitor consent | Correct agency configuration and permitted website origin; end-to-end agency inbox check |
| AI assistant | Starts only when the visitor requests it; uses `/api/chat/<slug>/start` and `/message`; preserves backend error feedback | Agency AI feature, allowance and allowed origin; live response/consent/handover acceptance test |
| Beachcomber | On-demand package feed and date/room availability checks through existing `src/lib/packages.ts`; no invented prices | Enabled agency feed, approved account and allowed origin; supplier confirmation before quoting/bookings |
| TBO | Architecture retains server-side supplier access; no client credentials or fictitious feed added | Agency API credentials, approved integration and public retail-safe endpoint |
| Thompsons Holidays | Existing backend content endpoints identified; no live price assertion made | Confirm package/rate rights and approved rate/availability interface |
| Trafalgar / Contiki / TTC | Audience concepts support tours; no rate or brand partnership claim | Verify the existing TTC adapter’s product coverage and agency rights |

TBO explicitly offers API-based real-time pricing and availability, with a dedicated integration team: [TBO API](https://www.tbo.com/tbo-api). [Thompsons Holidays](https://www.thompsons.co.za/) exposes an agent login and trade contact; that does not prove a public pricing API. Beachcomber and TTC integration details should be verified using agency-approved documentation and the existing adapters. Composio does not remove the need for supplier contracts and credentials.

The shortlist uses browser local storage, allows five choices, handles unavailable storage and does not send selections externally. Agency forms explicitly name the demo recipient. Neither enquiries nor AI chats were sent during QA. Live upstream services may reject localhost; the pages show a fallback to agent enquiry rather than fabricate a response.

## Assets and handoff

Existing destination photographs and `public/videos/hero.mp4` are reused. Five additional photos are served locally from `public/images/studio/`, sourced from Unsplash images:

- Architecture: `photo-1486406146926-c627a92ad1ab`
- Dubai skyline: `photo-1512453979798-5ea266f8880c`
- Friends: `photo-1529156069898-49953e39b3ac`
- Alpine lake: `photo-1476514525535-07fb3b4ae5f1`
- Beach: `photo-1507525428034-b723cf961d3e`

Google Fonts supplies DM Sans, Bodoni Moda, Outfit and Space Mono. Final agency launches should confirm asset rights, use approved supplier photography and content, and consider self-hosting fonts.

Every concept has a component composition under `src/designs/studio/`, a route under `src/routes/designs/`, a `DESIGNS` entry and a production snapshot entry. New pages are prerendered with the existing production build. No push or live deployment is part of this concept review.

All ten concepts now have distinct cinematic openings, interactive photographic discovery, personal planning tools, guidance chapters and reviewable downloadable briefs. The five-design personal-edit filter has been removed. Altitude adds a team event desk; Little / Big a family holiday daybook; Nocturne a private travel compass; Sidequest a personal budget receipt; Postcard a visual travel letter. Vector, Wildlings, Maison, Offscript and Meridian retain their deeper itinerary, comparison and collection tools. See `src/designs/studio/DESIGN.md` for implementation and verification boundaries.

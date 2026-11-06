# Agency Collection / Edition 02

Research and original implementation, 4 November 2026. The goal is a stronger international travel experience, not a claimed award or a measured 9/10 rating.

## Sources and capture context

Firecrawl search found recognised travel references and resolved their official sites. Firecrawl scrape captured **branding, markdown and full-page desktop screenshots** of the sites below. The screenshot pixels were inspected in a local contact sheet, alongside the extracted content and branding. These captures establish desktop composition and content, not mobile layout, hover behaviour or motion timing. Scott Dunn's capture included a regional-selection overlay; Domitur's included a cookie banner. No competitor photography, video, logo, proprietary fonts or copy was incorporated into the implementation.

| Reference                                    | Observed evidence                                                                                                                                                                                                                                 | Principle carried into original work                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [Black Tomato](https://www.blacktomato.com/) | Aerial destination hero, compact navigation, a deliberately paced introduction, feeling-led journey discovery and editorial trips. Branding extraction reported Brandon Grotesque and AlternateGotNo1D, white background and pink accents.        | Give the journey an emotional starting point and enough editorial depth to make a destination meaningful.  |
| [Scott Dunn](https://www.scottdunn.com/)     | Destination imagery, green-and-pink interface, family/couple/month entry points and a clear four-stage enquiry → specialist → quote → booking narrative. Extracted primary green `#00402E`, button pink `#FF9C9C`, heading Chap and body Mallory. | Make personal planning practical, with clear choices and a transparent next step.                          |
| [Contiki](https://www.contiki.com/en-us)     | Oversized orange campaign typography over activity imagery, high-energy audience-specific copy, travel-style discovery and detailed trip browsing. Extracted orange `#FF5900`, cream `#FFFAF2`, dark `#262626`, Halyard-Display.                  | A youth identity must continue into route and travel-style decisions; a loud hero alone is insufficient.   |
| [Nelson Travel](https://www.nelson.travel/)  | Wildlife-led opening screen, expressive serif typography, navy/coral interface, destination worlds and bespoke-service narrative. Extracted GT Sectra Fine, GT Pressura, navy `#030922`, coral `#FF6275`.                                         | Make the landscape the subject, then organise destinations into curated worlds with clear personal advice. |
| [Domitur](https://www.domitur.pt/)           | Full-bleed landscape and encounter-led hero, large heading hierarchy, destination map entry point and journey categories. Extracted blue `#1863DC`, cream `#FFE7C3`, Gotham and Vera Humana 95.                                                   | Use strong destination framing and clear exploration paths rather than unrelated decorative widgets.       |

[Awwwards' Tours Chanteclerc entry](https://www.awwwards.com/sites/tours-chantecler) was also read. It documents an **Honorable Mention**, with immersive travel discovery as part of the project description; this is not evidence that every site in the reference set is a website-award winner.

Extracted branding values are tool observations from those captures, not a complete manual CSS audit. The composition notes are pixel-based observations. Spacing below is our proposed implementation system, not measured competitor spacing.

## Original design system

- **Type:** DM Sans for interface and corporate layouts; Bodoni Moda for luxury, journals and cinematic display; Outfit for family and youth; Barlow Condensed for Offscript's poster. Open Google Fonts replace the proprietary reference fonts. Large type is sized with container units so the gallery can display faithful miniature compositions.
- **Layout:** 4.5–8% hero gutters, 7vw editorial gutters, 780px desktop hero baseline, responsive layouts at a 760px hero container and 650/950px content breakpoints. Each concept has its own composition; lower sections also vary by identity.
- **Rules and controls:** fine rules, clear focus outlines, real links/buttons and visible labels. Selected states use both shape/icon and colour. On mobile, navigation retains a direct planning link.
- **Photography:** locally served illustrative images; source and subject notes in `docs/studio-media-sources.md`. No invented prices, reviews, agency credentials, inventory, partner logos or claims of exclusivity.
- **Motion:** silent ambient films loaded on intersection, image drift, SVG globe/route animation, sun/compass graphics, a moving poster strip and image hover treatments. The hero's pause control pauses page CSS animation as well as its films. System reduced-motion preferences suppress automatic film loading and continuous animation. Gallery miniatures are still and never instantiate video players.

## Ten directions

| Concept      | Composition                                                                            | Planning interaction                                                         |
| ------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Vector       | Dark sage architectural diagonal, city film, animated globe, personal agenda card      | Route, cabin, travel date and business priorities                            |
| Altitude     | Cinematic city terminal, expressive serif title, selectable route board                | Corporate desk in a dusk palette                                             |
| Little / Big | Family portrait, hand-drawn animated sun/path, circular ocean film                     | Adventure vote, adult/child counts, individual ages, month and energy slider |
| Wildlings    | Living photographic field guide, destination scenes, expedition notes and compass      | Nature-led family planner with age-aware brief                               |
| Maison       | Large fashion-editorial typography, framed ocean film, restrained asymmetry            | Three curated collections, pace and duration                                 |
| Nocturne     | Full-screen wilderness dossier, private collection index and scene transitions         | Private collections in a low-light presentation                              |
| Offscript    | Oversized condensed poster, social photography, rotating graphic and moving text strip | Selectable route regions/stops, suggested duration and travel style          |
| Sidequest    | Electric blue travel zine with a three-image/film collage and ticket details           | Youth route builder with a different editorial identity                      |
| Meridian     | Panoramic landscape journal and large serif masthead                                   | Seasonal destination discovery                                               |
| Postcard     | Full-bleed ocean cinema, animated postal graphic and coastal navigation                | Seasonal atlas presented as contemporary postcards                           |

Each audience has an original travel journal with story dialogs. Story choices and planner decisions populate the final quote form and its visible brief. Clicking a planner's handoff does not send data; the visitor must complete and submit the consent-labelled enquiry form. Illustrative route durations are planning suggestions, not scheduled departures or supplier-backed products.

## Integration and verification boundary

The existing TribeTravel enquiry, AI chat and Beachcomber package/date-check clients remain the service boundary. New frontend experiences do not activate suppliers or provide credentials. Complete live account/inventory/chat testing still requires approved agency configuration and origins. No test enquiries or AI messages were sent to the live agency during this rebuild.

The code checks include routing/snapshot coverage, browser-persisted five-choice selection, corporate and youth planner handoffs, and preservation of family details in the enquiry payload. Browser QA covers desktop composition, phone-width overflow and actual video playback. The production static build must pass before any push.

Remaining limits: there is no formal international design jury score, conversion study, complete accessibility audit or measured cross-device performance study. Agency launches still need approved brand/media content, a complete page/content brief and live supplier acceptance testing.

## Edition 03 — The personal edit

Five concepts now have distinct complete planning experiences: Vector has a multi-city business itinerary with meeting times, arrival buffers and policy notes; Wildlings matches family interests, individual child ages and room preferences to comparable ideas; Maison builds an ordered private collection of stays, rail and experiences; Offscript supports editable, reordered stops, nights and a group budget; Meridian filters a personal atlas and compares up to three ideas.

Each has its own editorial guidance chapter and a transparent human handoff. Preferences populate a reviewable enquiry with explicit final-field priority and a downloadable text brief. Corporate, private-collection and route drafts offer explicit local Save/Resume/Delete without retaining contact details. The shared enquiry client rejects summaries beyond the receiving API's 4,000-character capacity before sending rather than losing preferences.

Ambient island footage now uses a silent 12-second, fast-start 1280px derivative (1,127,463 bytes versus the original 10,520,181 bytes, approximately 89% smaller). Longer films remain user-initiated. No new rights are implied by re-encoding.

Validation: TypeScript, planner/workflow/payload tests, production snapshots, and `npm run audit:studio`. The audit reads built HTML using axe-core and JSDOM, covering a WCAG A/AA semantic subset. It excludes colour contrast and returns manual-review items; it is not accessibility certification. Responsive browser checks use simulated desktop viewport widths, not physical iPhone or Android devices. Live supplier accounts and enquiries are not exercised by automated checks.

## Edition 04 — cinematic exploration benchmark

Before implementation, consulted Awwwards homepage and detail pages on 5 November 2026:
- https://www.awwwards.com/sites/tours-chantecler — Honorable Mention; documented immersive travel header, header scroll animation, destination search and souvenir tile. Inspected the published header image: large destination typography layered over landscape, inset travel photography, restrained navigation. Live Firecrawl screenshot was blank; browser reference navigation timed out, so this is not a complete live motion audit.
- https://www.awwwards.com/sites/grail — Site of the Day, published score 7.35; documented scroll-driven 3D, quest-card flow, mouse interaction and hero sequences. Reviewed award documentation, not an independently verified interactive playback.

Comparison before building: our Edition 03 had stronger planning depth but static section-to-section pacing, background motion disconnected from choices, and limited interactive discovery. Response: replace the five flagship openings with audience-specific cinematic composition, explicit scene controls, pointer-responsive depth, masked image transitions, moving landscape type and restrained film playback; add an expanding destination discovery deck that carries a selected idea into the real enquiry flow. Gallery miniatures stay still and instantiate no video. Native scrolling remains intact. Pausing and reduced-motion settings disable automatic animation. Touch screens get stacked discovery cards and scene buttons.

These are original layouts using existing licensed illustrative media. References informed interaction principles, not copied assets or identities. There is no claimed Awwwards rating; a 10/10 cannot be established by self-scoring or a passing build. Physical-device and independent design/accessibility review remain necessary.

## Edition 05 — all ten experiences

Benchmark consulted before this pass: https://www.awwwards.com/about-evaluation/ describes Design (40%), Usability (30%), Creativity (20%) and Content (10%). https://www.w3.org/WAI/WCAG22/quickref/ informs keyboard access, meaningful labels and motion alternatives. These are evaluation references, not certifications or an awarded score.

The gap was consistency across the collection: five concepts had substantially deeper interactions than the other five. All ten now use cinematic scene controls and an expanding photographic discovery chapter. The second concept in each audience has its own composition rather than inheriting the first concept's layout: Altitude's dusk departure board, Little / Big's tilted family scrapbook, Nocturne's wilderness aperture, Sidequest's electric-blue travel poster and Postcard's panoramic paper frame.

The five new planning experiences are purpose-built:
- Altitude: team purpose, departure/destination, people, room requirements, dates, workplace and coordination needs, reflected in a live departure board.
- Little / Big: individual child ages, room preferences and a morning/afternoon holiday daybook.
- Nocturne: photographic private-travel compass, pace, property character, cabin and personal priorities.
- Sidequest: a responsive receipt dividing the traveller's own budget, spending style, crew size and nights. It explicitly does not quote supplier prices or imply affordability.
- Postcard: a visual postcard and personal travel letter, with destination inspiration, pace, people, timing and free-text requirements.

Each produces an editable enquiry draft without submitting it. All ten have a visible human contact handoff, downloadable brief, sticky section navigation and a skip-to-planning link. The gallery no longer presents five designs as the only complete experiences. Reduced-motion and explicit pause controls remain available; the gallery creates no video players.

Validation scope: focused handoff tests for all five new planners and exact-budget allocation checks; full existing workflow and route tests; TypeScript; production snapshots; semantic audit expanded to all ten. Browser review covers simulated desktop and phone layouts, scene selection and planning handoffs. Live supplier inventory, physical devices, screen-reader usability, contrast over every moving frame and independent design judging are separate launch checks. No new supplier connectors or live credentials are implied by this frontend pass.

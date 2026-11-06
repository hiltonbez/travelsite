# Tribe Site Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each of the ten Design Studio designs the R7,000 Tribe Site's six pages and features (chat, live packages with online booking, quote form with consent, newsletter, cookie notice), keeping each design's look and videos.

**Architecture:** A new `src/site-kit/` holds shared parts and page templates. Subpages render inside the design's existing `concept-page theme-<id>` wrapper, so its fonts, colours and form styles apply. One param route serves the 50 new pages. The chat panel and live packages section move out of `src/designs/studio/index.tsx` unchanged, then gain online booking.

**Tech Stack:** React 19, TanStack Router and Start (file routes), Vitest with jsdom and Testing Library, Tailwind 4 and plain CSS, lucide-react. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-06-tribe-site-kit-design.md`

## Global Constraints

- Six pages per design: Home plus `destinations`, `about`, `quote`, `contact`, `privacy`, at `/designs/<id>` and `/designs/<id>/<page>`.
- Ten design ids, from `CONCEPTS` in `src/designs/studio/concepts.ts`: vector, altitude, little-big, wildlings, maison, nocturne, offscript, sidequest, meridian, postcard.
- No invented prices. Live packages fetch only when the visitor presses the button (existing behaviour).
- Standard chat only (`startChat`, `sendChat`); none of the concierge extras (cards, calls, WhatsApp handover).
- The consent choice is kept in this browser only. The demo loads no analytics script.
- Forms name the demo recipient, send nothing until submitted, keep the hidden `botcheck` trap, and respect the 4,000-character limit in `src/lib/enquiry.ts`.
- Banners reuse existing films only (`city`, `islands`, `coast`, `wilderness`, `altitude-lounge`, `maison-rail` in `public/videos/studio/`) through `AmbientFilm`. No new photos or videos.
- Existing studio tests (`src/test/design-studio.test.tsx`, `cinema.test.tsx`, `flagship.test.tsx`, `signature-planners.test.tsx`, `planning.test.ts`, `enquiry.test.ts`) must keep passing unchanged.
- **Do not run `git add`, `git commit` or `git push`.** The studio files in the working tree are uncommitted and not from this plan; Hilton decides when to commit. Each task ends when its checks pass.
- Run commands from the repo root `C:\Users\Shelley\Claude\Projects\My Dev\travelsite`.

## Review Focus

- **Storage blocked** (private mode): `localStorage` throws on read or write. The site and the cookie notice must still work. Pinned by Task 3.
- **Bad URL**: `/designs/nope/about`, `/designs/studio/about`, `/designs/vector/admin` must give not-found, not a crash or a blank themed page. The guard `resolveSubpage` is pinned by Task 2; Task 9 checks one bad URL in the browser.
- **Feed or chat refused** (the demo's address is not allowed by TribeTravel, the usual case on localhost): show the message, invent no price, keep a way to the quote form. Pinned by Task 1.
- **Consent missing or spam trap ticked**: nothing is sent. Pinned by Task 4.
- **Hostile `?to=` value** on the Quote page (very long, or HTML): shown as plain text and capped at 200 characters. Pinned by Task 4.

## File Structure

Create (all under `src/site-kit/` unless stated):
- `skins.ts`: the ten skins, page list, `resolveSubpage`.
- `content.ts`: sample places, About copy, Privacy sections.
- `chat-panel.tsx`, `live-packages.tsx`: moved from `src/designs/studio/index.tsx`; live packages gains booking.
- `consent.tsx`, `newsletter.tsx`, `enquiry-form.tsx`: new parts.
- `frame.tsx`: `SiteFrame` and `SitePagesNav`.
- `pages.tsx`: `SiteSubpage` and the five page bodies.
- `head.ts`: `siteHead`.
- `site-kit.css`: styles for the new parts, from the skin's CSS variables.
- `src/routes/designs/$design.$page.tsx`: the one route.
- `src/test/site-kit.test.tsx`, `src/test/site-kit-routing.test.tsx`.

Modify: `src/designs/studio/index.tsx` (Tasks 1 and 7), `scripts/snapshot.mjs` (Task 8), `scripts/audit-studio.mjs` (Task 10). `src/routeTree.gen.ts` regenerates itself (Task 6).

---

### Task 1: Move the chat panel and live packages, and add online booking

**Files:**
- Create: `src/site-kit/chat-panel.tsx`, `src/site-kit/live-packages.tsx`
- Modify: `src/designs/studio/index.tsx` (delete `ChatPanel` and `SupplierExplore`, import the new ones; their only call sites are `ConceptPage`)
- Test: `src/test/site-kit.test.tsx`

**Interfaces:**
- Produces: `ChatPanel(props: { onClose: () => void; formHref?: string }): JSX.Element`, where `formHref` defaults to `"#plan"` and is the target of the existing "Use the enquiry form" link.
- Produces: `LivePackages(props: { onChoose: (destination: string) => void }): JSX.Element`. Markup and class names are identical to the old `SupplierExplore` (`concept-live`, `live-package`, `live-check-form`, `live-room`), plus a "Book this package online" button.
- Consumes: `startChat`, `sendChat` from `@/lib/chat`; `listPackages`, `checkDates`, `rand` from `@/lib/packages`; `BookingDialog(props: { pkg: Package | null; minDays: number; onClose: () => void; className?: string })` from `@/components/packages`.

- [ ] **Step 1: Write the failing tests** in `src/test/site-kit.test.tsx` (copy the `beforeEach`/`afterEach` setup from `src/test/design-studio.test.tsx`: stub `fetch`, `scrollIntoView`, `ResizeObserver`; also set `HTMLDialogElement.prototype.showModal` and `close` to `vi.fn()` if `src/test/setup.ts` does not). Tests, with `PKG = { id: "p1", hotel: "Test Hotel", star: "5 star", board: "Half board", location: "Mauritius", nights: 7, from_pp: 30000, currency: "ZAR", inclusions: [], image: "", gallery: [] }`:
  - `ChatPanel does not call TribeTravel until the visitor starts`: render with `formHref="/designs/vector/quote"`; `expect(fetch).not.toHaveBeenCalled()`; the link named "Use the enquiry form" has `href` `/designs/vector/quote`.
  - `ChatPanel shows a refusal and keeps the form link`: `fetch` rejects with `TypeError`; click "Start AI conversation"; the `alert` text contains "couldn't reach the concierge"; the form link is still present.
  - `LivePackages waits for the visitor before asking the feed`: render; `fetch` not called.
  - `LivePackages shows the unavailable message and no price when the feed fails`: `fetch` resolves `{ ok: false, json: async () => ({}) }`; click "Explore live packages"; `alert` text contains "Live packages are unavailable"; `document.body.textContent` does not match `/R\s?\d/`.
  - `LivePackages opens the booking dialog for a selected package`: `fetch` resolves `{ ok: true, json: async () => ({ packages: [PKG], min_days_ahead: 10 }) }`; click "Explore live packages", then the button containing "Test Hotel", then "Book this package online"; a `dialog` role element containing "Test Hotel" appears.
- [ ] **Step 2: Run** `npx vitest run src/test/site-kit.test.tsx`. Expected: FAIL, modules not found.
- [ ] **Step 3: Move `ChatPanel` and `SupplierExplore`** into the two new files with their imports, exported under the names above. Change only: the `formHref` prop on the form link; keep `min_days_ahead` from `listPackages()` in a `minDays` state (default 10); render a "Book this package online" button in the selected-package panel that opens `<BookingDialog className="tk-booking" ... />`. In `index.tsx` import both from `@/site-kit/...`, pass `onChoose={setDestination}` as before, and remove the now-unused imports (`startChat`, `sendChat`, `listPackages`, `checkDates`, `rand`, types).
- [ ] **Step 4: Run** `npx vitest run src/test/site-kit.test.tsx src/test/design-studio.test.tsx src/test/flagship.test.tsx`. Expected: PASS, including the untouched studio tests.
- [ ] **Step 5: Run** `npx tsc --noEmit`. Expected: no errors.

### Task 2: Skins, page list and sample content

**Files:**
- Create: `src/site-kit/skins.ts`, `src/site-kit/content.ts`
- Test: `src/test/site-kit.test.tsx`

**Interfaces:**
- Produces from `skins.ts`:
  - `type SitePage = "destinations" | "about" | "quote" | "contact" | "privacy"`
  - `SITE_PAGES: { page: SitePage; label: string }[]` in that order, labels "Destinations", "About us", "Get a quote", "Contact", "Privacy".
  - `type Skin = { concept: Concept; vars: React.CSSProperties; film: string; filmPoster: string; intro: Record<SitePage, string> }`
  - `skinFor(id: string): Skin | undefined`
  - `resolveSubpage(design: string, page: string): { id: string; page: SitePage } | null`
- Produces from `content.ts`: `PLACES: { slug: string; name: string; region: string; tagline: string; intro: string; photo: string; nights: number }[]` (the six places in `DESTINATIONS` from `@/designs/enterprise/content`, `photo` = first photo, `nights` = number of itinerary days minus one); `ABOUT: { title: string; paragraphs: string[] }`; `PRIVACY: [string, string][]`.
- Consumes: `CONCEPTS`, `Concept` from `@/designs/studio/concepts`.

- [ ] **Step 1: Write the failing tests:**
  - `every design has a skin with a film file that exists`: for each id in `CONCEPTS`, `skinFor(id)` is defined, `vars` has `--tk-a`, `--tk-b`, `--tk-c` equal to `concept.palette[0..2]`, and `fs.existsSync("public/videos/studio/" + skin.film + ".mp4")` and `fs.existsSync("public" + skin.filmPoster)` are true.
  - `resolveSubpage accepts the five pages and rejects anything else`: `("vector","about")` gives `{ id: "vector", page: "about" }`; `("studio","about")`, `("vector","admin")`, `("../x","about")`, `("vector","")` give `null`.
  - `Privacy has Window Seat's seven sections`: titles equal `["Who we are","What we collect","Why we collect it","Our chat","Cookies","Who we share it with","Your rights"]`; no text contains "seatbelt".
- [ ] **Step 2: Run** the file. Expected: FAIL.
- [ ] **Step 3: Implement.** `film`: for each concept, the film its own hero uses (read `src/designs/studio/cinema.tsx`, the per-concept entries and `EDITORIAL_OPENINGS` handling, and `experience-hero.tsx`); where a hero has none, use `wilderness` for Family and Luxury and `islands` otherwise. `filmPoster`: the matching existing `/images/studio/<name>-film.jpg` for `city`, `coast`, `wilderness`; for the others use the concept's own `image`. `intro`: one plain sentence per page per design, in the audience's voice (Corporate: travel desk and policy; Family: ages and school holidays; Luxury: private and unhurried; Youth: groups and budgets; Classic: seasons and journeys); no prices, claims or credentials. `PRIVACY` is the seven sections from `PrivacyPage` in `src/designs/window-seat/pages.tsx`, with "the seatbelt tick box" changed to "the consent tick box". `ABOUT` is about 120 words describing the demo agency, "Sun-Set Travel", without invented years, awards or numbers.
- [ ] **Step 4: Run** the file. Expected: PASS. Then `npx tsc --noEmit`.

### Task 3: Cookie notice

**Files:**
- Create: `src/site-kit/consent.tsx`
- Test: `src/test/site-kit.test.tsx`

**Interfaces:**
- Produces: `CONSENT_KEY = "tribe-site-consent-v1"`; `type Consent = "all" | "essential" | null`; `readConsent(): Consent` (null when nothing stored or storage throws); `writeConsent(v: "all" | "essential"): void` (never throws); `ConsentNotice(props: { id: string }): JSX.Element | null` rendering `role="region"` named "Cookies" with buttons "Allow statistics" and "Essential only" and a link to `/designs/<id>/privacy`.

- [ ] **Step 1: Write the failing tests:**
  - `ConsentNotice shows until the visitor chooses, then stays away`: empty storage; the region appears; click "Allow statistics"; `localStorage.getItem(CONSENT_KEY)` is `"all"`; the region is gone; unmount and render again: no region.
  - `ConsentNotice still works when storage throws`: spy `Storage.prototype.getItem` and `setItem` to throw; the region shows; click "Essential only"; the region disappears and nothing is thrown.
  - `ConsentNotice loads no analytics script`: after "Allow statistics", `document.querySelector('script[src*="googletagmanager"], script[src*="facebook"]')` is `null`.
- [ ] **Step 2: Run** the file. Expected: FAIL.
- [ ] **Step 3: Implement** the four exports. Component state hides the notice for the session even when writing fails. Wording matches the Privacy text ("essential cookies", "anonymous visit statistics").
- [ ] **Step 4: Run** the file. Expected: PASS.

### Task 4: Newsletter and enquiry form

**Files:**
- Create: `src/site-kit/newsletter.tsx`, `src/site-kit/enquiry-form.tsx`
- Test: `src/test/site-kit.test.tsx`

**Interfaces:**
- Produces: `Newsletter(props: { id: string }): JSX.Element`; `EnquiryForm(props: { id: string; kind: "quote" | "contact"; place?: string }): JSX.Element`.
- Consumes: `useEnquiry(extra?: (fd: FormData) => Partial<EnquiryFields>)` from `@/lib/enquiry`; `BotTrap`, `FormStatus` from `@/designs/shared`; `PLACES` and `skinFor` from the kit.

- [ ] **Step 1: Write the failing tests** (stub `fetch` to resolve `{ ok: true, json: async () => ({ ok: true }) }`; read the request body with `JSON.parse((fetch as Mock).mock.calls[0][1].body)`):
  - `Newsletter sends nothing without consent`: type an email, click the submit button: `fetch` not called.
  - `Newsletter sends a sign-up marked as one`: tick consent, submit: body `name` is "Newsletter sign-up" and `message` contains "Newsletter sign-up" and "Vector".
  - `EnquiryForm refuses to send without consent`: quote kind; fill name and email; submit: `fetch` not called.
  - `EnquiryForm sends destination, dates, travellers and the design name`: choose "Zanzibar", month "2027-04", travellers "2 adults", tick consent: body `message` contains "Destination: Zanzibar", "Travellers: 2 adults" and "Vector".
  - `EnquiryForm sends nothing when the spam trap is ticked`: tick the checkbox named `botcheck`, fill and submit: `fetch` not called.
  - `EnquiryForm shows a hostile place as plain text, capped at 200 characters`: `place` is `"<img src=x onerror=alert(1)>".repeat(20)`; the destination field's value has length 200 or less and `container.querySelector("img")` is `null`.
  - `contact kind has no destination or dates fields`.
- [ ] **Step 2: Run** the file. Expected: FAIL.
- [ ] **Step 3: Implement.** Quote fields: name, email, phone (optional), destination (select of `PLACES` names plus "Somewhere else"; initial value is `place` if it equals a place name, else a free-text input prefilled with `place.slice(0, 200)`), travel month (`type="month"`), travellers, message (`maxLength` 3000). Contact fields: name, email, phone, message. Both: required checkbox named `consent` linking to `/designs/<id>/privacy`, `BotTrap`, the demo-recipient sentence from `ConceptPage`'s plan section, `FormStatus`. `extra` adds "Sent from the <concept name> demo site (<kind> form)." to the message. Reuse the studio's `concept-plan`, `plan-fields` and `concept-cta` classes. The newsletter's submit button is labelled "Subscribe", with a required consent checkbox and the same `botcheck` trap.
- [ ] **Step 4: Run** the file. Expected: PASS.

### Task 5: Site frame and navigation

**Files:**
- Create: `src/site-kit/frame.tsx`
- Test: `src/test/site-kit.test.tsx`

**Interfaces:**
- Produces: `SitePagesNav(props: { id: string; current?: SitePage | "home" }): JSX.Element` (a `nav` named "Site pages", links Home then the five pages, `aria-current="page"` on the current one); `SiteFrame(props: { id: string; current: SitePage; children: ReactNode }): JSX.Element`.
- Consumes: `skinFor`, `SITE_PAGES`; `ChatPanel`; `ConsentNotice`; `Newsletter`.

- [ ] **Step 1: Write the failing tests:**
  - `SitePagesNav links all six pages`: hrefs equal `["/designs/vector","/designs/vector/destinations","/designs/vector/about","/designs/vector/quote","/designs/vector/contact","/designs/vector/privacy"]`; the link for `current="about"` has `aria-current="page"`.
  - `SiteFrame opens and closes the chat`: render `<SiteFrame id="vector" current="about"><p>Body</p></SiteFrame>`; click "Ask the AI assistant": a `dialog` appears whose form link `href` is `/designs/vector/quote`; click "Close assistant": it is gone.
  - `SiteFrame wraps its page in the design's theme`: `container.querySelector("main")` has classes `concept-page` and `theme-vector`, and its inline style has `--tk-a`.
- [ ] **Step 2: Run** the file. Expected: FAIL.
- [ ] **Step 3: Implement.** Order inside `<main>`: skip link to `#site-main`, header (wordmark link to `/designs/<id>`, `SitePagesNav`, "Ask the AI assistant" button), `<div id="site-main">{children}</div>`, `Newsletter`, footer (the six links, "Back to the collection" to `/designs/studio`, the line "Illustrative agency identity · TribeTravel Tribe Site demo"), `ConsentNotice`, and `ChatPanel formHref={"/designs/" + id + "/quote"}` when open.
- [ ] **Step 4: Run** the file. Expected: PASS.

### Task 6: Pages, head and route

**Files:**
- Create: `src/site-kit/pages.tsx`, `src/site-kit/head.ts`, `src/site-kit/site-kit.css`, `src/routes/designs/$design.$page.tsx`
- Test: `src/test/site-kit.test.tsx`

**Interfaces:**
- Produces: `SiteSubpage(props: { id: string; page: SitePage; place?: string }): JSX.Element`; `siteHead(id: string, page: SitePage)` returning `{ meta: { title?: string; name?: string; content?: string }[]; links: { rel: string; href: string }[] }`, with title `"<label> — <concept name> (TribeTravel Tribe Site demo)"`, a description of at most 160 characters from `skin.intro[page]`, and links for `studio.css?url`, `site-kit.css?url` and the studio Google Fonts URL (copy the `href` from `src/routes/designs/vector.tsx`).
- Consumes: `SiteFrame`, `LivePackages`, `EnquiryForm`, `AmbientFilm` from `@/designs/studio/experience-hero`, `PLACES`, `ABOUT`, `PRIVACY`, `skinFor`, `resolveSubpage`.

- [ ] **Step 1: Write the failing tests:**
  - `every page renders for all ten designs`: for each id in `CONCEPTS` and each page in `SITE_PAGES`, render `SiteSubpage`; an `h1` exists and is non-empty; `cleanup()`.
  - `Destinations lists the six places and the live packages button`: six place headings; a button "Explore live packages"; the Zanzibar link `href` is `/designs/vector/quote?to=Zanzibar`.
  - `Quote prefills the chosen place`: `place="Zanzibar"`: the destination control's value is "Zanzibar".
  - `Contact shows the agency's phone and email as text`: text from `contact.phoneDisplay` and `contact.email` (`@/lib/contact`).
  - `Privacy shows seven section headings`.
  - `siteHead gives each page its own title and a description of 160 characters or less`.
- [ ] **Step 2: Run** the file. Expected: FAIL.
- [ ] **Step 3: Implement.** Page banner: `AmbientFilm` with `src={"/videos/studio/" + skin.film + ".mp4"}`, `poster={skin.filmPoster}`, then the `h1` (the page label) and `skin.intro[page]`. Destinations: place cards (photo, name, region, tagline, "Get a quote" link to `/designs/<id>/quote?to=<name>`), then `<LivePackages onChoose={(d) => window.location.assign("/designs/" + id + "/quote?to=" + encodeURIComponent(d))} />`. About: `ABOUT`. Quote: `EnquiryForm kind="quote"`. Contact: contact details as text and `EnquiryForm kind="contact"`. Privacy: `PRIVACY` sections with the "template wording" note from `PrivacyPage`. `site-kit.css`: styles for `.tk-*` classes from `--tk-a/b/c`, including `html.tt-dialog-open .tk-chat-launcher { display: none }` and `.tk-booking` colours for the booking dialog. Route: `createFileRoute("/designs/$design/$page")` with `validateSearch` (`to`: string, sliced to 200), `beforeLoad` that throws `notFound()` unless `resolveSubpage(params.design, params.page)` is non-null, `head` from `siteHead`, and a component that renders `SiteSubpage` with `place` from the search.
- [ ] **Step 4: Run** the file. Expected: PASS.
- [ ] **Step 5: Regenerate the route tree.** Run `npm run build`; confirm `src/routeTree.gen.ts` contains `/designs/$design/$page` and that the build passes.

### Task 7: Hook the homepages into the kit

**Files:**
- Modify: `src/designs/studio/index.tsx` (`ConceptPage`)
- Test: `src/test/site-kit.test.tsx`

**Interfaces:**
- Consumes: `SitePagesNav`, `Newsletter`, `ConsentNotice`.

- [ ] **Step 1: Write the failing test** `homepage links the five pages and carries the newsletter and cookie notice`: render `<ConceptPage id="vector" />` (copy the `experience-hero` mock from `design-studio.test.tsx`); a `nav` named "Site pages" with the six hrefs from Task 5; a form containing an email field and a button whose name matches /subscribe|sign up/i; a region named "Cookies".
- [ ] **Step 2: Run** the file. Expected: FAIL.
- [ ] **Step 3: In `ConceptPage`:** add `<SitePagesNav id={id} current="home" />` inside the `.page-guide` block, `<Newsletter id={id} />` immediately before `<footer className="concept-footer">`, and `<ConsentNotice id={id} />` before the closing `</main>`. Nothing else changes.
- [ ] **Step 4: Run** `npx vitest run src/test/site-kit.test.tsx src/test/design-studio.test.tsx src/test/flagship.test.tsx src/test/signature-planners.test.tsx src/test/cinema.test.tsx`. Expected: PASS.

### Task 8: Snapshot entries and routing coverage

**Files:**
- Modify: `scripts/snapshot.mjs` (add 50 literal entries after the studio block, format `{ path: "/designs/vector/about", file: "designs/vector/about/index.html", status: 200 },`, in design order then page order, preceded by one comment line)
- Create: `src/test/site-kit-routing.test.tsx`

- [ ] **Step 1: Write the failing test** `every design page has a route and a snapshot entry`: build the router as in `src/test/app-routing.test.tsx`; for each of the ten ids and five pages, `router.matchRoutes(path).at(-1)?.routeId` is not `rootRouteId`, and the text of `scripts/snapshot.mjs` contains `path: "<path>"`.
- [ ] **Step 2: Run** `npx vitest run src/test/site-kit-routing.test.tsx`. Expected: FAIL on the snapshot assertion.
- [ ] **Step 3: Add the 50 entries.**
- [ ] **Step 4: Run** `npx vitest run src/test/site-kit-routing.test.tsx src/test/app-routing.test.tsx`. Expected: PASS.

### Task 9: Vector end to end, then stop for review

**Files:** none (verification).

- [ ] **Step 1: Run** `npx vitest run`, `npx tsc --noEmit`, `npx eslint src/site-kit src/routes/designs src/test/site-kit.test.tsx src/test/site-kit-routing.test.tsx`, then `npm run build:static`. Expected: all pass. (The preview at `http://127.0.0.1:8080` serves the rebuilt files; start it with `npm run preview:static` if it is not running.)
- [ ] **Step 2: In the browser** (Playwright tools or the built-in browser), open all six Vector pages at 1440px and 390px. Check: no horizontal scroll; the banner film plays; the cookie notice appears and its choice sticks after reload; the chat opens, shows TribeTravel's refusal, and its form link goes to the Quote page; "Explore live packages" shows the unavailable message; the Quote page validates and shows the consent requirement; keyboard focus is visible. Take one screenshot per page at each width. Do not submit any form.
- [ ] **Step 3: Fix** anything that fails, re-running the affected checks.
- [ ] **Step 4: Show Hilton the screenshots and the results, and wait for his word before Task 10.**

### Task 10: The other nine, the audit and the full check

**Files:**
- Modify: `scripts/audit-studio.mjs` (add the 50 new paths to its page list, following its existing structure; read it first)

- [ ] **Step 1: Repeat Task 9 Step 2** for the other nine designs (at least desktop width for every page and 390px for the home, destinations and quote pages), fixing skin problems in `site-kit.css` or `skins.ts` (contrast, banner crop, wordmark fit).
- [ ] **Step 2: Extend the audit.** In `scripts/audit-studio.mjs`, after the existing loop over the ten ids, add a second pass over each id and each of `destinations`, `about`, `quote`, `contact`, `privacy`: read `.output/public/designs/${id}/${page}/index.html`, use the url `http://localhost/designs/${id}/${page}` and report it under the id `${id}/${page}` with the same axe options. Then run `npm run build:static` then `npm run audit:studio`. Expected: no new violations; list manual-review items as the script does.
- [ ] **Step 3: Final run** of `npx vitest run`, `npx tsc --noEmit`, `npx eslint src scripts`. Expected: all pass.
- [ ] **Step 4: Report** what was verified and what was not (live chat, live feeds and enquiries are not exercised against the real agency), and wait for Hilton to decide about committing and pushing.

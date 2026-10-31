# Enterprise redesign: "The Route", Night flight

Approved sample: https://claude.ai/artifact/TSHacCZEVXMV7Xzr4aSbyZ (Night flight toggle).

## Goal
Enterprise is the flagship design shown to agencies to demonstrate everything TribeTravel can do. It gets its
own identity and stops borrowing Horizon's layout. **Every feature keeps working exactly as today**: only look,
layout and motion change. Customer view only.

## Identity (single theme, dark)
- Colours: night-chart navy `#0B1424` page, `#111D33` panels, ivory ink `#EDE6D8`, muted `#B9B3A6`,
  runway orange `#FF6A2E` (the one accent: route, plane, live dots, primary buttons; text on it is navy).
- Fonts: Archivo Expanded 800 (uppercase headlines), Instrument Sans (text), JetBrains Mono (flight codes,
  prices, times, labels). `ENTERPRISE_FONTS` changes to these; Horizon's fonts are no longer loaded here.
- Texture: faint 80px chart grid behind the page (CSS only). Photos appear framed (porthole / phone), never as
  full-screen backgrounds.

## Page, top to bottom (each section is a "stop" the route passes)
1. **Header** (sticky): wordmark, links to the stops, "Plan my trip".
2. **Hero / departure**: flight-code strip, "Every trip is a route" headline, and the existing quote form
   (where / when / travellers, then name / email / phone) restyled as a **boarding pass**. Same `useEnquiry` call.
3. **Stop 1, Live from suppliers**: the existing Beachcomber / Thompsons tabs, cards, skeletons, empty and error
   states, `BookingDialog` and `HolidayDialog`. Cards become boarding-pass style cards with a pulsing live dot.
4. **Stop 2, AI concierge**: existing `ChatWindow` / `useConcierge`, restyled (ivory AI bubbles, orange "me").
5. **Stop 3, Book a call**: existing `BookCall` logic; the clock graphic beside it turns with scroll.
6. **Stop 4, What happens next**: the 7 `FLOW` steps as waypoints that light up as the plane passes.
7. **Arrival, the app**: existing install / iOS hint / `TripAlerts`, with the phone mock.
8. **Contact + footer**: phone, email, WhatsApp (Horizon's contact section rebuilt in this style), and the
   floating concierge launcher and WhatsApp button as today. Mobile bottom bar: "Get a quote" + WhatsApp.

Horizon's destinations grid, marquee, "how it works" and "why us" are dropped: the stops replace them.

## Motion
- One hero movement: an SVG route drawn through the stops; its orange trail grows with scroll and a plane rides
  the tip, rotated to the path. Path is rebuilt from section positions on resize, font load and when live
  content changes height (`ResizeObserver` on `main`).
- Supporting: pins pulse, waypoints light, clock hands turn, chat bubbles and cards ease in from a visible state.
- No new dependencies: plain SVG + `requestAnimationFrame` (the sample proved it). GSAP not needed.
- `prefers-reduced-motion`: route fully drawn, plane at arrival, nothing animates.
- Prerendered HTML (scripts/snapshot.mjs) must be complete without JS: the route layer is decorative and empty
  until hydration; no content waits at opacity 0.

## Code shape
- `src/designs/enterprise.tsx`: page shell + sections (feature logic moved over unchanged).
- `src/designs/flight-path.tsx` (new): `<FlightPath>` – the SVG route, plane and scroll/resize logic, plus
  `useScrollProgress` for the clock and waypoints.
- `src/designs/designs.css`: `.d-route-dialog` (the booking pop-up in Night flight colours and fonts) beside
  `.d-horizon-dialog`; a few `d-route-*` keyframes.
- `src/routes/designs/enterprise.tsx`: theme-color `#0B1424`; `public/designs/enterprise.webmanifest` colours too.
- No changes to `src/lib/*`, Horizon, `DESIGNS` or `PAGES` (path unchanged).

## Testing
- `npm test` (routing test), `npm run lint`, `npm run build:static`.
- Dev server in the browser pane: desktop and phone widths, reduced motion, live tabs, chat start, slot pick,
  quote form validation, booking dialog opens in the new style. No console errors.

// Saves the server-rendered pages as static HTML in .output/public, so the site
// can be served by nginx (which handles video range requests properly) without
// running Node in production. Run after `vite build`: `npm run build:static`.
//
// Add a route to PAGES when the site gets a new page.
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const PAGES = [
  { path: "/", file: "index.html", status: 200 },
  // TribeTravel's Packages & pricing page (src/pricing/), linked from the gallery bar
  { path: "/packages", file: "packages/index.html", status: 200 },
  // The design gallery (src/lib/designs.ts), one design per package. Tribe Site: Window Seat, whose home page is /
  { path: "/designs/window-seat/destinations", file: "designs/window-seat/destinations/index.html", status: 200 },
  { path: "/designs/window-seat/about", file: "designs/window-seat/about/index.html", status: 200 },
  { path: "/designs/window-seat/quote", file: "designs/window-seat/quote/index.html", status: 200 },
  { path: "/designs/window-seat/contact", file: "designs/window-seat/contact/index.html", status: 200 },
  { path: "/designs/window-seat/privacy", file: "designs/window-seat/privacy/index.html", status: 200 },
  // Tribe Site Pro: Living Map
  { path: "/designs/living-map", file: "designs/living-map/index.html", status: 200 },
  { path: "/designs/living-map/destinations", file: "designs/living-map/destinations/index.html", status: 200 },
  { path: "/designs/living-map/destinations/mauritius", file: "designs/living-map/destinations/mauritius/index.html", status: 200 },
  { path: "/designs/living-map/destinations/zanzibar", file: "designs/living-map/destinations/zanzibar/index.html", status: 200 },
  { path: "/designs/living-map/destinations/victoria-falls", file: "designs/living-map/destinations/victoria-falls/index.html", status: 200 },
  { path: "/designs/living-map/destinations/kruger", file: "designs/living-map/destinations/kruger/index.html", status: 200 },
  { path: "/designs/living-map/destinations/cape-town", file: "designs/living-map/destinations/cape-town/index.html", status: 200 },
  { path: "/designs/living-map/destinations/santorini", file: "designs/living-map/destinations/santorini/index.html", status: 200 },
  { path: "/designs/living-map/departures", file: "designs/living-map/departures/index.html", status: 200 },
  { path: "/designs/living-map/book", file: "designs/living-map/book/index.html", status: 200 },
  { path: "/designs/living-map/specials", file: "designs/living-map/specials/index.html", status: 200 },
  { path: "/designs/living-map/about", file: "designs/living-map/about/index.html", status: 200 },
  { path: "/designs/living-map/reviews", file: "designs/living-map/reviews/index.html", status: 200 },
  { path: "/designs/living-map/contact", file: "designs/living-map/contact/index.html", status: 200 },
  { path: "/designs/living-map/privacy", file: "designs/living-map/privacy/index.html", status: 200 },
  // Business Platform: Atlas
  { path: "/designs/atlas", file: "designs/atlas/index.html", status: 200 },
  { path: "/designs/atlas/destinations", file: "designs/atlas/destinations/index.html", status: 200 },
  { path: "/designs/atlas/destinations/mauritius", file: "designs/atlas/destinations/mauritius/index.html", status: 200 },
  { path: "/designs/atlas/destinations/zanzibar", file: "designs/atlas/destinations/zanzibar/index.html", status: 200 },
  { path: "/designs/atlas/destinations/victoria-falls", file: "designs/atlas/destinations/victoria-falls/index.html", status: 200 },
  { path: "/designs/atlas/destinations/kruger", file: "designs/atlas/destinations/kruger/index.html", status: 200 },
  { path: "/designs/atlas/destinations/cape-town", file: "designs/atlas/destinations/cape-town/index.html", status: 200 },
  { path: "/designs/atlas/destinations/santorini", file: "designs/atlas/destinations/santorini/index.html", status: 200 },
  { path: "/designs/atlas/book", file: "designs/atlas/book/index.html", status: 200 },
  { path: "/designs/atlas/suppliers", file: "designs/atlas/suppliers/index.html", status: 200 },
  { path: "/designs/atlas/automation", file: "designs/atlas/automation/index.html", status: 200 },
  { path: "/designs/atlas/dashboard", file: "designs/atlas/dashboard/index.html", status: 200 },
  { path: "/designs/atlas/about", file: "designs/atlas/about/index.html", status: 200 },
  { path: "/designs/atlas/contact", file: "designs/atlas/contact/index.html", status: 200 },
  { path: "/designs/atlas/privacy", file: "designs/atlas/privacy/index.html", status: 200 },
  // Enterprise
  { path: "/designs/enterprise", file: "designs/enterprise/index.html", status: 200 },
  // The Enterprise design's other pages (src/designs/enterprise/content.ts lists the destinations and posts)
  { path: "/designs/enterprise/destinations", file: "designs/enterprise/destinations/index.html", status: 200 },
  { path: "/designs/enterprise/destinations/mauritius", file: "designs/enterprise/destinations/mauritius/index.html", status: 200 },
  { path: "/designs/enterprise/destinations/zanzibar", file: "designs/enterprise/destinations/zanzibar/index.html", status: 200 },
  { path: "/designs/enterprise/destinations/victoria-falls", file: "designs/enterprise/destinations/victoria-falls/index.html", status: 200 },
  { path: "/designs/enterprise/destinations/kruger", file: "designs/enterprise/destinations/kruger/index.html", status: 200 },
  { path: "/designs/enterprise/destinations/cape-town", file: "designs/enterprise/destinations/cape-town/index.html", status: 200 },
  { path: "/designs/enterprise/destinations/santorini", file: "designs/enterprise/destinations/santorini/index.html", status: 200 },
  { path: "/designs/enterprise/gallery", file: "designs/enterprise/gallery/index.html", status: 200 },
  { path: "/designs/enterprise/about", file: "designs/enterprise/about/index.html", status: 200 },
  { path: "/designs/enterprise/news", file: "designs/enterprise/news/index.html", status: 200 },
  // One page for every post from Marketing > Blog in TribeTravel (?p=<slug>, read in the browser)
  { path: "/designs/enterprise/news/post", file: "designs/enterprise/news/post/index.html", status: 200 },
  { path: "/designs/enterprise/news/mauritius-in-winter", file: "designs/enterprise/news/mauritius-in-winter/index.html", status: 200 },
  { path: "/designs/enterprise/news/first-safari", file: "designs/enterprise/news/first-safari/index.html", status: 200 },
  { path: "/designs/enterprise/news/greek-islands-on-a-cruise", file: "designs/enterprise/news/greek-islands-on-a-cruise/index.html", status: 200 },
  { path: "/designs/enterprise/contact", file: "designs/enterprise/contact/index.html", status: 200 },
  { path: "/designs/enterprise/privacy", file: "designs/enterprise/privacy/index.html", status: 200 },
  // Any unknown path renders the not-found page; nginx serves it for 404s.
  { path: "/__not-found__", file: "404.html", status: 404 },
];

const PORT = 4173;
const base = `http://127.0.0.1:${PORT}`;
const outDir = ".output/public";

const server = spawn(process.execPath, [".output/server/index.mjs"], {
  env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1" },
  stdio: ["ignore", "inherit", "inherit"],
});

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(base);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error("Built server did not start");
}

try {
  await waitForServer();
  for (const page of PAGES) {
    const res = await fetch(base + page.path);
    if (res.status !== page.status) {
      throw new Error(`${page.path} returned ${res.status}, expected ${page.status}`);
    }
    const html = await res.text();
    const target = join(outDir, page.file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
    console.log(`snapshot: ${page.path} -> ${target} (${html.length} bytes)`);
  }
} finally {
  server.kill();
}

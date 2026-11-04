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
  // The ten samples for choosing the next designs (src/concepts/list.ts): built, but not in the sitemap until chosen
  { path: "/concepts", file: "concepts/index.html", status: 200, unlisted: true },
  { path: "/concepts/holiday-mix", file: "concepts/holiday-mix/index.html", status: 200, unlisted: true },
  { path: "/concepts/pack-your-bag", file: "concepts/pack-your-bag/index.html", status: 200, unlisted: true },
  { path: "/concepts/scratch-the-world", file: "concepts/scratch-the-world/index.html", status: 200, unlisted: true },
  { path: "/concepts/the-trailer", file: "concepts/the-trailer/index.html", status: 200, unlisted: true },
  { path: "/concepts/tune-in", file: "concepts/tune-in/index.html", status: 200, unlisted: true },
  { path: "/concepts/the-lift", file: "concepts/the-lift/index.html", status: 200, unlisted: true },
  { path: "/concepts/pop-up-book", file: "concepts/pop-up-book/index.html", status: 200, unlisted: true },
  { path: "/concepts/holiday-bar", file: "concepts/holiday-bar/index.html", status: 200, unlisted: true },
  { path: "/concepts/chase-the-sun", file: "concepts/chase-the-sun/index.html", status: 200, unlisted: true },
  { path: "/concepts/cover-story", file: "concepts/cover-story/index.html", status: 200, unlisted: true },
  // Any unknown path renders the not-found page; nginx serves it for 404s.
  { path: "/__not-found__", file: "404.html", status: 404 },
];

// sitemap.xml and robots.txt (2 Nov 2026, TribeTravel's SEO Agent): Google reads the sitemap to find every page.
// The site's address is VITE_SITE_URL if it's set, else what TribeTravel's feed says (seo.site_url, 3 Nov 2026, so nobody
// has to set it per site); the demo agency's site defaults to travelsite.aifundi.io. Only the demo agency's site lists the design gallery; an agency's own site is its home page.
const SLUG = process.env.VITE_AGENCY_SLUG || "sunset-travel";
let SITE_URL = (process.env.VITE_SITE_URL || "").trim().replace(/\/$/, "");
const DEMO_SITE_URL = SLUG === "sunset-travel" ? "https://travelsite.aifundi.io" : "";

function sitemapXml(siteUrl, slug, pages = PAGES, today = new Date().toISOString().slice(0, 10)) {
  const listed = pages.filter((p) => p.status === 200 && !p.unlisted && !p.path.endsWith("/news/post")
    && (slug === "sunset-travel" || p.path === "/" || p.feed));
  const urls = listed.map((p) => `  <url><loc>${siteUrl}${p.path}</loc><lastmod>${today}</lastmod>`
    + `<changefreq>${p.path === "/" || p.feed ? "weekly" : "monthly"}</changefreq></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

// A page for each of the agency's specials and their destinations (2 Nov 2026, SEO Agent phase 2), read from the same
// TribeTravel content feed the pages use (src/lib/site-content.ts). Every agency's sitemap lists them. Without the feed
// the build carries on with the fixed pages; a page the site can't find is skipped, never a failed build.
const TRIBETRAVEL_URL = (process.env.VITE_TRIBETRAVEL_URL || "https://tribetravel.io").replace(/\/$/, "");
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** GET JSON with Node's https module: Cloudflare in front of TribeTravel refuses Node's fetch as a bot (as in site-content.ts). */
async function getJson(url) {
  const mod = url.startsWith("https:") ? await import("node:https") : await import("node:http");
  return new Promise((resolve, reject) => {
    const req = mod.get(url, { headers: { Accept: "application/json", "User-Agent": "TribeTravelSite/1.0 (+https://tribetravel.io)" }, timeout: 8000 }, (res) => {
      if ((res.statusCode ?? 500) >= 300) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
  });
}

function feedPages(payload) {
  const out = [];
  const add = (kind, slug) => {
    if (typeof slug === "string" && slug.length <= 100 && SAFE_SLUG.test(slug) && !out.some((x) => x.path === `/${kind}/${slug}`)) {
      out.push({ path: `/${kind}/${slug}`, file: `${kind}/${slug}/index.html`, status: 200, feed: true });
    }
  };
  for (const s of Array.isArray(payload?.featured) ? payload.featured : []) add("trips", s?.slug);
  for (const d of Array.isArray(payload?.destinations) ? payload.destinations : []) add("destinations", d?.slug);
  return out;
}

async function loadFeedPages() {
  const url = `${TRIBETRAVEL_URL}/api/site/${encodeURIComponent(SLUG)}/content`;
  try {
    const payload = await getJson(url);
    const own = String(payload?.seo?.site_url || "").replace(/\/$/, "");
    if (!SITE_URL && /^https:\/\/[^/\s]+$/.test(own)) SITE_URL = own;
    return feedPages(payload);
  } catch (e) {
    console.warn(`snapshot: no trip or destination pages (${e.message})`);
    return [];
  }
}

function robotsTxt(siteUrl) {
  return "User-agent: *\nAllow: /\n" + (siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : "");
}

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
  const written = [];
  for (const page of [...PAGES, ...(await loadFeedPages())]) {
    const res = await fetch(base + page.path);
    if (page.feed && res.status !== 200) {
      console.warn(`snapshot: skipped ${page.path} (${res.status})`);
      continue;
    }
    if (res.status !== page.status) {
      throw new Error(`${page.path} returned ${res.status}, expected ${page.status}`);
    }
    written.push(page);
    const html = await res.text();
    const target = join(outDir, page.file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
    console.log(`snapshot: ${page.path} -> ${target} (${html.length} bytes)`);
  }
  SITE_URL = SITE_URL || DEMO_SITE_URL;
  await writeFile(join(outDir, "robots.txt"), robotsTxt(SITE_URL));
  if (SITE_URL) {
    await writeFile(join(outDir, "sitemap.xml"), sitemapXml(SITE_URL, SLUG, written));
    console.log(`snapshot: sitemap.xml and robots.txt for ${SITE_URL}`);
  } else {
    console.log("snapshot: no site address (VITE_SITE_URL or TribeTravel's feed), so no sitemap.xml (robots.txt allows everything)");
  }
} finally {
  server.kill();
}

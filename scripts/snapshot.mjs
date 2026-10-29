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
  // The design gallery (src/lib/designs.ts)
  { path: "/designs/horizon", file: "designs/horizon/index.html", status: 200 },
  { path: "/designs/quick-quote", file: "designs/quick-quote/index.html", status: 200 },
  { path: "/designs/wanderlust", file: "designs/wanderlust/index.html", status: 200 },
  { path: "/designs/meet-your-agent", file: "designs/meet-your-agent/index.html", status: 200 },
  { path: "/designs/itinerary", file: "designs/itinerary/index.html", status: 200 },
  { path: "/designs/enterprise", file: "designs/enterprise/index.html", status: 200 },
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

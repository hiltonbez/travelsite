// Semantic checks on the production HTML. JSDOM cannot audit colour contrast, layout or real devices.
import { readFile, writeFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import axe from "axe-core";
const pages = [
  "vector",
  "altitude",
  "little-big",
  "wildlings",
  "maison",
  "nocturne",
  "offscript",
  "sidequest",
  "meridian",
  "postcard",
];
// The other five pages of each design (src/site-kit/) are audited with its homepage.
const subpages = ["destinations", "about", "quote", "contact", "privacy"];
const targets = pages.flatMap((design) => [design, ...subpages.map((page) => `${design}/${page}`)]);
const results = [];
for (const id of targets) {
  const html = await readFile(`.output/public/designs/${id}/index.html`, "utf8");
  const dom = new JSDOM(html, {
    url: `http://localhost/designs/${id}`,
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  dom.window.eval(axe.source);
  const report = await dom.window.axe.run(dom.window.document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    rules: { "color-contrast": { enabled: false } },
  });
  const entry = {
    id,
    passes: report.passes.length,
    incomplete: report.incomplete.map((x) => x.id),
    violations: report.violations.map((x) => ({
      id: x.id,
      impact: x.impact,
      help: x.help,
      nodes: x.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
    })),
  };
  results.push(entry);
  console.log(
    `${id}: ${entry.violations.length} semantic violations; ${entry.passes} rules passed; ${entry.incomplete.length} rules need manual review`,
  );
  for (const issue of entry.violations) console.log(JSON.stringify(issue));
  dom.window.close();
}
await writeFile(
  ".output/studio-accessibility.json",
  JSON.stringify(
    {
      engine: axe.version,
      scope:
        "Production HTML / WCAG A+AA semantic subset; no colour contrast, layout, screen-reader or physical-device certification",
      results,
    },
    null,
    2,
  ),
);
if (results.some((r) => r.violations.length)) process.exitCode = 1;

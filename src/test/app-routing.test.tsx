import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { DESIGNS } from "@/lib/designs";
import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("has a page for every design in the gallery", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    for (const d of DESIGNS) {
      expect(router.matchRoutes(d.path).at(-1)?.routeId, d.path).not.toBe(rootRouteId);
    }
  });

  it("lists every design page for the production snapshot", () => {
    const snapshot = readFileSync("scripts/snapshot.mjs", "utf8");

    for (const d of DESIGNS.filter((d) => d.path !== "/")) {
      expect(snapshot, d.path).toContain(`path: "${d.path}"`);
    }
  });
});

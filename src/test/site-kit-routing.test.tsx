import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CONCEPTS } from "@/designs/studio/concepts";
import { routeTree } from "@/routeTree.gen";
import { SITE_PAGES } from "@/site-kit/skins";

describe("Tribe Site pages", () => {
  it("gives every design page a route and a snapshot entry", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const snapshot = readFileSync("scripts/snapshot.mjs", "utf8");
    const paths = CONCEPTS.flatMap((c) => SITE_PAGES.map((p) => `/designs/${c.id}/${p.page}`));

    expect(paths).toHaveLength(50);
    for (const path of paths) {
      expect(router.matchRoutes(path).at(-1)?.routeId, path).not.toBe(rootRouteId);
      expect(snapshot, path).toContain(`path: "${path}"`);
    }
  });
});

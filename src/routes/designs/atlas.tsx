import { Outlet, createFileRoute } from "@tanstack/react-router";
import { DesignBar } from "@/components/design-bar";
import { ATLAS_FONTS } from "@/designs/atlas";
import atlasCss from "@/designs/atlas/atlas.css?url";
import { designHead } from "@/designs/shared";

// The Atlas design is a whole site: this route holds what its pages share (fonts, its own stylesheet, the gallery
// bar) and each page is a child route (atlas.*.tsx).
export const Route = createFileRoute("/designs/atlas")({
  head: () => {
    const head = designHead("Atlas", "Business Platform: a sunlit globe of trips in progress, three live supplier feeds, workflow automation and the agency dashboard behind it.", ATLAS_FONTS);
    return { ...head, links: [...head.links, { rel: "stylesheet", href: atlasCss }] };
  },
  component: () => (
    <>
      <DesignBar current="/designs/atlas" />
      <Outlet />
    </>
  ),
});

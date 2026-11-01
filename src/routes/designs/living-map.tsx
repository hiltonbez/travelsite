import { Outlet, createFileRoute } from "@tanstack/react-router";
import { DesignBar } from "@/components/design-bar";
import { LIVING_MAP_FONTS } from "@/designs/living-map";
import livingMapCss from "@/designs/living-map/living-map.css?url";
import { designHead } from "@/designs/shared";

// The Living Map design is a whole site: this route holds what its pages share (fonts, its own stylesheet with the
// three looks, the gallery bar) and each page is a child route (living-map.*.tsx).
export const Route = createFileRoute("/designs/living-map")({
  head: () => {
    const h = designHead("Living Map", "Tribe Site Pro: a hand-drawn travel map that comes alive, with group departures you can book by the seat, live supplier rates and WhatsApp updates.", LIVING_MAP_FONTS);
    return { ...h, links: [...h.links, { rel: "stylesheet", href: livingMapCss }] };
  },
  component: () => (
    <>
      <DesignBar current="/designs/living-map" />
      <Outlet />
    </>
  ),
});

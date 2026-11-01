import { Outlet, createFileRoute } from "@tanstack/react-router";
import { DesignBar } from "@/components/design-bar";
import { WINDOW_SEAT_FONTS } from "@/designs/window-seat";
import windowSeatCss from "@/designs/window-seat/window-seat.css?url";
import { designHead } from "@/designs/shared";

// Window Seat's pages other than the home page (which is /, in routes/index.tsx). The bar marks them as the home
// page's design.
export const Route = createFileRoute("/designs/window-seat")({
  head: () => {
    const h = designHead("Window Seat", "Tribe Site: a six-page travel agency website seen through an aeroplane window.", WINDOW_SEAT_FONTS);
    // The design's own sky, window and motion.
    return { ...h, links: [...h.links, { rel: "stylesheet", href: windowSeatCss }] };
  },
  component: () => (
    <>
      <DesignBar current="/" />
      <Outlet />
    </>
  ),
});

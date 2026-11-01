import { createFileRoute } from "@tanstack/react-router";
import { DesignBar } from "@/components/design-bar";
import { WINDOW_SEAT_FONTS, WindowSeatHome } from "@/designs/window-seat";
import windowSeatCss from "@/designs/window-seat/window-seat.css?url";
import { designHead } from "@/designs/shared";
import { loadSiteContent } from "@/lib/site-content";
import { usePreview } from "@/lib/preview";

// The home page: Window Seat, the Tribe Site package's design. Its words and pictures are the agency's own, edited in
// TribeTravel's visual editor (which shows this page in a frame, see lib/preview.ts).
export const Route = createFileRoute("/")({
  // Runs when the page is built (scripts/snapshot.mjs), so the HTML carries the agency's latest saved content.
  loader: () => loadSiteContent(),
  head: () => {
    const h = designHead("Window Seat", "Tailor-made holidays to Mauritius, Zanzibar, the Kruger and beyond, planned personally for you.", WINDOW_SEAT_FONTS);
    return {
      meta: [
        { title: "Sun-Set Travel — Oh, the places you'll go" },
        { name: "description", content: "A small South African travel agency planning islands, safaris, city breaks and cruises, for business or pleasure, at the best possible price." },
        { property: "og:title", content: "Sun-Set Travel — Some places change everything" },
        { property: "og:description", content: "Tailor-made holidays to Madagascar, Mauritius, Zanzibar, Thailand and beyond, planned personally for you." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [...h.links, { rel: "stylesheet", href: windowSeatCss }],
    };
  },
  component: Index,
});

function Index() {
  const { content, preview } = usePreview(Route.useLoaderData());
  return (
    <>
      {/* Not in TribeTravel's visual editor, where the agency is editing this design. */}
      {!preview && <DesignBar current="/" />}
      <WindowSeatHome content={content} />
    </>
  );
}

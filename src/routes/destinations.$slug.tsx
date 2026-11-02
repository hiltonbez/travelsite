import { createFileRoute, notFound } from "@tanstack/react-router";
import { DestinationTripsPage, WINDOW_SEAT_FONTS } from "@/designs/window-seat";
import windowSeatCss from "@/designs/window-seat/window-seat.css?url";
import { designHead } from "@/designs/shared";
import { loadSiteContent } from "@/lib/site-content";
import { destinationSchema, destinationTitle, ldJson, pageHead } from "@/lib/seo";

// A destination of the agency's specials on its own page (2 Nov 2026, SEO Agent phase 2): TribeTravel's description of
// the place and the agency's trips there. Prerendered by scripts/snapshot.mjs from the content feed.
export const Route = createFileRoute("/destinations/$slug")({
  loader: async ({ params }) => {
    const content = await loadSiteContent();
    const dest = content.destinations.find((d) => d.slug === params.slug);
    if (!dest) throw notFound();
    return { content, dest };
  },
  head: ({ loaderData }) => {
    const fonts = designHead("Window Seat", "", WINDOW_SEAT_FONTS).links;
    if (!loaderData) return { links: fonts };
    const { title, description } = destinationTitle(loaderData.dest, loaderData.content);
    const first = loaderData.content.trips.find((t) => loaderData.dest.trips.includes(t.slug));
    const h = pageHead(title, description, `/destinations/${loaderData.dest.slug}`, first?.img ?? "");
    return { meta: h.meta, links: [...fonts, { rel: "stylesheet", href: windowSeatCss }, ...h.links] };
  },
  component: DestinationRoute,
});

function DestinationRoute() {
  const { content, dest } = Route.useLoaderData();
  return (
    <>
      <DestinationTripsPage content={content} dest={dest} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(destinationSchema(dest, content)) }} />
    </>
  );
}

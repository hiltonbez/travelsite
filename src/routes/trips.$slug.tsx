import { createFileRoute, notFound } from "@tanstack/react-router";
import { TripPage, WINDOW_SEAT_FONTS } from "@/designs/window-seat";
import windowSeatCss from "@/designs/window-seat/window-seat.css?url";
import { designHead } from "@/designs/shared";
import { loadSiteContent } from "@/lib/site-content";
import { ldJson, pageHead, tripSchema, tripTitle } from "@/lib/seo";

// One of the agency's specials on its own page (2 Nov 2026, SEO Agent phase 2). scripts/snapshot.mjs prerenders one for
// every special in TribeTravel's content feed; an unknown slug is the not-found page.
export const Route = createFileRoute("/trips/$slug")({
  loader: async ({ params }) => {
    const content = await loadSiteContent();
    const trip = content.trips.find((t) => t.slug === params.slug);
    if (!trip) throw notFound();
    return { content, trip };
  },
  head: ({ loaderData }) => {
    const fonts = designHead("Window Seat", "", WINDOW_SEAT_FONTS).links;
    if (!loaderData) return { links: fonts };
    const { title, description } = tripTitle(loaderData.trip, loaderData.content);
    const h = pageHead(title, description, `/trips/${loaderData.trip.slug}`, loaderData.trip.img, loaderData.content);
    return { meta: h.meta, links: [...fonts, { rel: "stylesheet", href: windowSeatCss }, ...h.links] };
  },
  component: Trip,
});

function Trip() {
  const { content, trip } = Route.useLoaderData();
  return (
    <>
      <TripPage content={content} trip={trip} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(tripSchema(trip, content)) }} />
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { DesignBar } from "@/components/design-bar";
import { WINDOW_SEAT_FONTS, WindowSeatHome } from "@/designs/window-seat";
import windowSeatCss from "@/designs/window-seat/window-seat.css?url";
import { designHead } from "@/designs/shared";
import { loadSiteContent } from "@/lib/site-content";
import { usePreview } from "@/lib/preview";
import { agencySchema, homeTitle, siteUrl } from "@/lib/seo";

// The home page: Window Seat, the Tribe Site package's design. Its words and pictures are the agency's own, edited in
// TribeTravel's visual editor (which shows this page in a frame, see lib/preview.ts).
export const Route = createFileRoute("/")({
  // Runs when the page is built (scripts/snapshot.mjs), so the HTML carries the agency's latest saved content.
  loader: () => loadSiteContent(),
  head: ({ loaderData }) => {
    const h = designHead("Window Seat", "Tailor-made holidays to Mauritius, Zanzibar, the Kruger and beyond, planned personally for you.", WINDOW_SEAT_FONTS);
    const { title, description } = homeTitle(loaderData);
    const url = siteUrl(loaderData);
    const tag = loaderData?.seo.googleVerification;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        ...(url ? [{ property: "og:url", content: `${url}/` }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        // Google's ownership tag: the SEO Agent sets Search Console up with it (seo_agent.gsc_autosetup in TribeTravel).
        ...(tag ? [{ name: "google-site-verification", content: tag }] : []),
      ],
      links: [...h.links, { rel: "stylesheet", href: windowSeatCss }, ...(url ? [{ rel: "canonical", href: `${url}/` }] : [])],
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
      {/* JSON-LD in the body is read by Google like the head; "<" is escaped so no text can close the script tag. */}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(agencySchema(content)).replace(/</g, "\\u003c") }} />
    </>
  );
}

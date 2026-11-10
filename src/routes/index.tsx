import { createFileRoute } from "@tanstack/react-router";
import { DesignBar } from "@/components/design-bar";
import { WINDOW_SEAT_FONTS, WindowSeatHome } from "@/designs/window-seat";
import windowSeatCss from "@/designs/window-seat/window-seat.css?url";
import { designHead } from "@/designs/shared";
import { SHOW_DESIGNS } from "@/lib/designs";
import { Landing, LANDING_FONTS } from "@/landing/page";
import { loadSiteContent } from "@/lib/site-content";
import { usePreview } from "@/lib/preview";
import { agencySchema, homeTitle, siteUrl } from "@/lib/seo";

// The home page. On the demo agency's site (SHOW_DESIGNS) it is AiFundi's website packages landing page (src/landing/);
// on any other agency's site, and inside TribeTravel's visual editor, it is Window Seat, whose words and pictures are the
// agency's own, edited in that editor (which shows this page in a frame, see lib/preview.ts).
export const Route = createFileRoute("/")({
  // Runs when the page is built (scripts/snapshot.mjs), so the HTML carries the agency's latest saved content.
  loader: () => loadSiteContent(),
  head: ({ loaderData }) => {
    const h = designHead("Window Seat", "Tailor-made holidays to Mauritius, Zanzibar, the Kruger and beyond, planned personally for you.", WINDOW_SEAT_FONTS);
    const { title, description } = SHOW_DESIGNS
      ? { title: "Websites for travel agencies — AiFundi packages and pricing",
          description: "AiFundi builds and hosts travel agency websites on TribeTravel: move your site to Tribe from R7,000 or get a new one from R8,500, each with an AI Concierge." }
      : homeTitle(loaderData);
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
      links: [...h.links, { rel: "stylesheet", href: windowSeatCss },
        ...(SHOW_DESIGNS ? [{ rel: "stylesheet", href: `https://fonts.googleapis.com/css2?${LANDING_FONTS}&display=swap` },
          { rel: "icon", href: "/images/landing/mark.svg", type: "image/svg+xml" }] : []), ...(url ? [{ rel: "canonical", href: `${url}/` }] : [])],
    };
  },
  component: Index,
});

function Index() {
  const { content, preview } = usePreview(Route.useLoaderData());
  // In the visual editor the demo agency still edits Window Seat; everyone else sees the landing page.
  if (SHOW_DESIGNS && !preview) {
    return (
      <>
        <DesignBar current="/" />
        <Landing />
      </>
    );
  }
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

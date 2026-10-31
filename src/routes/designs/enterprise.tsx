import { Outlet, createFileRoute } from "@tanstack/react-router";
import { DesignBar } from "@/components/design-bar";
import { ENTERPRISE_FONTS } from "@/designs/enterprise";
import { designHead } from "@/designs/shared";

// The Enterprise design is a whole site: this route holds what its pages share (fonts, the installable app, the
// gallery bar) and each page is a child route (enterprise.*.tsx).
export const Route = createFileRoute("/designs/enterprise")({
  head: () => {
    const h = designHead(
      "Enterprise",
      "The full TribeTravel website: live supplier packages with online booking, an AI concierge, automation, an agency dashboard and an installable app.",
      ENTERPRISE_FONTS,
    );
    // The installable app (public/designs/enterprise.webmanifest)
    return {
      meta: [...h.meta, { name: "theme-color", content: "#0B1424" }],
      links: [
        ...h.links,
        { rel: "manifest", href: "/designs/enterprise.webmanifest" },
        { rel: "apple-touch-icon", href: "/designs/app-icon-192.png" },
      ],
    };
  },
  component: () => (
    <>
      <DesignBar current="/designs/enterprise" />
      <Outlet />
    </>
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { BrowseDesigns } from "@/landing/browse";

// Browse designs: every sample website, in AiFundi's colours (src/landing/browse.tsx). The Design Studio gallery with
// its shortlist (DesignStudio in src/designs/studio) is no longer shown here, but stays in the code and tests.
export const Route = createFileRoute("/designs/studio")({
  head: () => ({
    meta: [
      { title: "Browse designs — AiFundi websites for travel agencies" },
      {
        name: "description",
        content: "Every sample travel agency website: ten audience designs for a New Website, and the Living Map, Atlas and Enterprise package designs.",
      },
    ],
    links: [{ rel: "icon", href: "/images/landing/mark.svg", type: "image/svg+xml" }],
  }),
  component: () => <BrowseDesigns />,
});

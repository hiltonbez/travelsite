import { createFileRoute } from "@tanstack/react-router";
import { ConceptPage } from "@/designs/studio";
import studioCss from "@/designs/studio/studio.css?url";
import { CONCEPTS } from "@/designs/studio/concepts";

export const Route = createFileRoute("/designs/postcard")({
  head: () => ({
    meta: [
      { title: "Postcard — TribeTravel Design Collection" },
      { name: "description", content: CONCEPTS.find((c) => c.id === "postcard")!.rationale },
    ],
    links: [
      { rel: "stylesheet", href: studioCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=Bodoni+Moda:ital,wght@0,400;0,500;1,400;1,500&family=Outfit:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap",
      },
    ],
  }),
  component: () => <ConceptPage id="postcard" />,
});

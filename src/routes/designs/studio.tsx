import { createFileRoute } from "@tanstack/react-router";
import { DesignStudio } from "@/designs/studio";
import studioCss from "@/designs/studio/studio.css?url";

export const Route = createFileRoute("/designs/studio")({
  head: () => ({
    meta: [
      { title: "The Agency Collection — Ten TribeTravel Website Designs" },
      {
        name: "description",
        content:
          "Explore ten distinctive travel agency website concepts. Two designs each for corporate, family, luxury, youth and classic audiences.",
      },
    ],
    links: [
      { rel: "stylesheet", href: studioCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=Bodoni+Moda:ital,wght@0,400;0,500;1,400;1,500&family=Outfit:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap",
      },
    ],
  }),
  component: () => <DesignStudio />,
});

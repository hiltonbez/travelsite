// A subpage's <head>: its own title and description, the Design Studio's styles and fonts, and the kit's styles.
import studioCss from "@/designs/studio/studio.css?url";
import { SITE_PAGES, skinFor, type SitePage } from "@/site-kit/skins";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=Bodoni+Moda:ital,wght@0,400;0,500;1,400;1,500&family=Outfit:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap";

type Meta = { title?: string; name?: string; content?: string };

export function siteHead(id: string, page: SitePage) {
  const skin = skinFor(id);
  const label = SITE_PAGES.find((p) => p.page === page)?.label ?? "";
  const meta: Meta[] = skin
    ? [
        { title: `${label} — ${skin.concept.name} (TribeTravel Tribe Site demo)` },
        { name: "description", content: skin.intro[page].slice(0, 160) },
      ]
    : [{ title: "Page not found" }];
  return {
    meta,
    links: [
      { rel: "stylesheet", href: studioCss },
      { rel: "stylesheet", href: FONTS },
    ],
  };
}

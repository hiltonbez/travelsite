// One route for the five pages of every Design Studio design: /designs/<id>/destinations, /about, /quote, /contact
// and /privacy. Any other design id or page is not found. Fixed routes such as /designs/atlas/book win over this one.
import { createFileRoute, notFound } from "@tanstack/react-router";
import { siteHead } from "@/site-kit/head";
import { SiteSubpage } from "@/site-kit/pages";
import { resolveSubpage } from "@/site-kit/skins";

export const Route = createFileRoute("/designs/$design/$page")({
  validateSearch: (search: Record<string, unknown>): { to?: string } =>
    typeof search["to"] === "string" && search["to"] ? { to: search["to"].slice(0, 200) } : {},
  beforeLoad: ({ params }) => {
    if (!resolveSubpage(params.design, params.page)) throw notFound();
  },
  head: ({ params }) => {
    const found = resolveSubpage(params.design, params.page);
    return found ? siteHead(found.id, found.page) : {};
  },
  component: SubpageRoute,
});

function SubpageRoute() {
  const { design, page } = Route.useParams();
  const { to } = Route.useSearch();
  const found = resolveSubpage(design, page);
  if (!found) return null;
  return <SiteSubpage id={found.id} page={found.page} {...(to ? { place: to } : {})} />;
}

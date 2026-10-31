import { createFileRoute, notFound } from "@tanstack/react-router";
import { DestinationPage, destination } from "@/designs/enterprise";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/enterprise/destinations/$slug")({
  loader: ({ params }) => {
    const d = destination(params.slug);
    if (!d) throw notFound();
    return { name: d.name, tagline: d.tagline };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.name} — ${BRAND.name}` }, { name: "description", content: loaderData.tagline }] : [],
  }),
  component: function Destination() {
    return <DestinationPage slug={Route.useParams().slug} />;
  },
});

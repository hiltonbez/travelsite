import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArticlePage, article } from "@/designs/enterprise";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/enterprise/news/$slug")({
  loader: ({ params }) => {
    const a = article(params.slug);
    if (!a) throw notFound();
    return { title: a.title, summary: a.summary };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.title} — ${BRAND.name}` }, { name: "description", content: loaderData.summary }] : [],
  }),
  component: function Article() {
    return <ArticlePage slug={Route.useParams().slug} />;
  },
});

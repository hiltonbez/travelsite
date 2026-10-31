import { createFileRoute } from "@tanstack/react-router";
import { PostPage } from "@/designs/enterprise";
import { BRAND } from "@/designs/shared";

// One of the agency's own blog posts from TribeTravel (Marketing > Blog), chosen by ?p=<slug> in the browser.
export const Route = createFileRoute("/designs/enterprise/news/post")({
  head: () => ({ meta: [{ title: `Travel news — ${BRAND.name}` }] }),
  component: PostPage,
});

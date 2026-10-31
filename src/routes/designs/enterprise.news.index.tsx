import { createFileRoute } from "@tanstack/react-router";
import { NewsPage } from "@/designs/enterprise";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/enterprise/news/")({
  head: () => ({ meta: [{ title: `Travel news — ${BRAND.name}` }] }),
  component: NewsPage,
});

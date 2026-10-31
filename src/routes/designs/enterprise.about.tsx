import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/designs/enterprise";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/enterprise/about")({
  head: () => ({ meta: [{ title: `About us — ${BRAND.name}` }] }),
  component: AboutPage,
});

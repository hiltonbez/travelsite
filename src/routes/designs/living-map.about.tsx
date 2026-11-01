import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/designs/living-map";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/living-map/about")({
  head: () => ({ meta: [{ title: `About us — ${BRAND.name}` }] }),
  component: AboutPage,
});

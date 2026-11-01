import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/designs/atlas";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/atlas/about")({
  head: () => ({ meta: [{ title: `About us — ${BRAND.name}` }] }),
  component: AboutPage,
});

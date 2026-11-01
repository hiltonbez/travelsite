import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/designs/window-seat";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/window-seat/about")({
  head: () => ({ meta: [{ title: `About us — ${BRAND.name}` }] }),
  component: AboutPage,
});

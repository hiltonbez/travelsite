import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/designs/living-map";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/living-map/contact")({
  head: () => ({ meta: [{ title: `Contact — ${BRAND.name}` }] }),
  component: ContactPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { DeparturesPage } from "@/designs/living-map";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/living-map/departures")({
  head: () => ({ meta: [{ title: `Group departures — ${BRAND.name}` }] }),
  component: DeparturesPage,
});

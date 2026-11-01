import { createFileRoute } from "@tanstack/react-router";
import { SpecialsPage } from "@/designs/living-map";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/living-map/specials")({
  head: () => ({ meta: [{ title: `Specials — ${BRAND.name}` }] }),
  component: SpecialsPage,
});

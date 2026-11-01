import { createFileRoute } from "@tanstack/react-router";
import { LivingMapHome } from "@/designs/living-map";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/living-map/")({
  head: () => ({ meta: [{ title: `Living Map website design — ${BRAND.name}` }] }),
  component: LivingMapHome,
});

import { createFileRoute } from "@tanstack/react-router";
import { DestinationsPage } from "@/designs/living-map";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/living-map/destinations/")({
  head: () => ({ meta: [{ title: `Destinations — ${BRAND.name}` }] }),
  component: DestinationsPage,
});

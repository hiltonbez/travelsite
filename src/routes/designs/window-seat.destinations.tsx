import { createFileRoute } from "@tanstack/react-router";
import { DestinationsPage } from "@/designs/window-seat";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/window-seat/destinations")({
  head: () => ({ meta: [{ title: `Destinations — ${BRAND.name}` }] }),
  component: DestinationsPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { DestinationsPage } from "@/designs/atlas";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/atlas/destinations/")({
  head: () => ({ meta: [{ title: `Destinations — ${BRAND.name}` }] }),
  component: DestinationsPage,
});

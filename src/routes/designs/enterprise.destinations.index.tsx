import { createFileRoute } from "@tanstack/react-router";
import { DestinationsPage } from "@/designs/enterprise";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/enterprise/destinations/")({
  head: () => ({ meta: [{ title: `Destinations — ${BRAND.name}` }] }),
  component: DestinationsPage,
});

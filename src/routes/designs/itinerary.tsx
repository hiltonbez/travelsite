import { createFileRoute } from "@tanstack/react-router";
import { DesignBar } from "@/components/design-bar";
import { ITINERARY_FONTS, Itinerary } from "@/designs/itinerary";
import { designHead } from "@/designs/shared";

export const Route = createFileRoute("/designs/itinerary")({
  head: () => designHead("Itinerary Story", "A destination specialist's travel website: a day-by-day trip and a price-this-trip card.", ITINERARY_FONTS),
  component: () => (
    <>
      <DesignBar current="/designs/itinerary" />
      <Itinerary />
    </>
  ),
});

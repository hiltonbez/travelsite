import { createFileRoute } from "@tanstack/react-router";
import { ReviewsPage } from "@/designs/living-map";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/living-map/reviews")({
  head: () => ({ meta: [{ title: `Reviews — ${BRAND.name}` }] }),
  component: ReviewsPage,
});

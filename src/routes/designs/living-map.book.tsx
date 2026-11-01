import { createFileRoute } from "@tanstack/react-router";
import { BookPage } from "@/designs/living-map";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/living-map/book")({
  head: () => ({ meta: [{ title: `Book a seat — ${BRAND.name}` }] }),
  component: BookPage,
});

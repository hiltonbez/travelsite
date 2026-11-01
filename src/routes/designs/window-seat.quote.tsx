import { createFileRoute } from "@tanstack/react-router";
import { QuotePage } from "@/designs/window-seat";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/window-seat/quote")({
  head: () => ({ meta: [{ title: `Get a quote — ${BRAND.name}` }] }),
  component: QuotePage,
});

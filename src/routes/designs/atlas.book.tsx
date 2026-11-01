import { createFileRoute } from "@tanstack/react-router";
import { BookPage } from "@/designs/atlas";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/atlas/book")({
  head: () => ({ meta: [{ title: `Book — ${BRAND.name}` }] }),
  component: BookPage,
});

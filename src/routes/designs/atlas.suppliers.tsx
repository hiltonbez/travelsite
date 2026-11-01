import { createFileRoute } from "@tanstack/react-router";
import { SuppliersPage } from "@/designs/atlas";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/atlas/suppliers")({
  head: () => ({ meta: [{ title: `Live supplier feeds — ${BRAND.name}` }] }),
  component: SuppliersPage,
});

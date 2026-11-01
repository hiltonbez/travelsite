import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/designs/window-seat";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/window-seat/contact")({
  head: () => ({ meta: [{ title: `Contact — ${BRAND.name}` }] }),
  component: ContactPage,
});

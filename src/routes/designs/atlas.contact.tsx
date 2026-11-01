import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/designs/atlas";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/atlas/contact")({
  head: () => ({ meta: [{ title: `Contact — ${BRAND.name}` }] }),
  component: ContactPage,
});

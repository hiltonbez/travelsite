import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/designs/enterprise";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/enterprise/contact")({
  head: () => ({ meta: [{ title: `Contact — ${BRAND.name}` }] }),
  component: ContactPage,
});

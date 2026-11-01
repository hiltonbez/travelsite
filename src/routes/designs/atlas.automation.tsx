import { createFileRoute } from "@tanstack/react-router";
import { AutomationPage } from "@/designs/atlas";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/atlas/automation")({
  head: () => ({ meta: [{ title: `How we work — ${BRAND.name}` }] }),
  component: AutomationPage,
});

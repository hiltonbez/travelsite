import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/designs/living-map";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/living-map/privacy")({
  head: () => ({ meta: [{ title: `Privacy — ${BRAND.name}` }] }),
  component: PrivacyPage,
});

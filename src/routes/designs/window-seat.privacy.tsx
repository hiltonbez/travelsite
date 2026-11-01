import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/designs/window-seat";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/window-seat/privacy")({
  head: () => ({ meta: [{ title: `Privacy — ${BRAND.name}` }] }),
  component: PrivacyPage,
});

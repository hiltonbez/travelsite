import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/designs/atlas";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/atlas/privacy")({
  head: () => ({ meta: [{ title: `Privacy — ${BRAND.name}` }] }),
  component: PrivacyPage,
});

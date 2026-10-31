import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/designs/enterprise";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/enterprise/privacy")({
  head: () => ({ meta: [{ title: `Privacy (POPIA) — ${BRAND.name}` }] }),
  component: PrivacyPage,
});

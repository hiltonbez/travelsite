import { createFileRoute } from "@tanstack/react-router";
import { EnterpriseHome } from "@/designs/enterprise";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/enterprise/")({
  head: () => ({ meta: [{ title: `Enterprise website design — ${BRAND.name}` }] }),
  component: EnterpriseHome,
});

import { createFileRoute } from "@tanstack/react-router";
import { AtlasHome } from "@/designs/atlas";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/atlas/")({
  head: () => ({ meta: [{ title: `Atlas website design — ${BRAND.name}` }] }),
  component: AtlasHome,
});

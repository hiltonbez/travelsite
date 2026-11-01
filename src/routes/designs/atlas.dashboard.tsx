import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/designs/atlas";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/atlas/dashboard")({
  head: () => ({ meta: [{ title: `Behind the counter — ${BRAND.name}` }] }),
  component: DashboardPage,
});

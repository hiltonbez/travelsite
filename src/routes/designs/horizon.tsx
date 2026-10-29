import { createFileRoute } from "@tanstack/react-router";
import { DesignBar } from "@/components/design-bar";
import { HORIZON_FONTS, Horizon } from "@/designs/horizon";
import { designHead } from "@/designs/shared";

export const Route = createFileRoute("/designs/horizon")({
  head: () => designHead("Horizon", "Cinematic luxury travel website with a full-screen video and a quick quote bar.", HORIZON_FONTS),
  component: () => (
    <>
      <DesignBar current="/designs/horizon" />
      <Horizon />
    </>
  ),
});

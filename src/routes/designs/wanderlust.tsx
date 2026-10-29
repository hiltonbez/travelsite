import { createFileRoute } from "@tanstack/react-router";
import { DesignBar } from "@/components/design-bar";
import { WANDERLUST_FONTS, Wanderlust } from "@/designs/wanderlust";
import { designHead } from "@/designs/shared";

export const Route = createFileRoute("/designs/wanderlust")({
  head: () => designHead("Wanderlust", "A bold adventure travel website with a bento grid, rotating headline and a quick quote.", WANDERLUST_FONTS),
  component: () => (
    <>
      <DesignBar current="/designs/wanderlust" />
      <Wanderlust />
    </>
  ),
});

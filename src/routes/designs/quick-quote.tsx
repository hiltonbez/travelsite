import { createFileRoute } from "@tanstack/react-router";
import { DesignBar } from "@/components/design-bar";
import { QUICK_QUOTE_FONTS, QuickQuote } from "@/designs/quick-quote";
import { designHead } from "@/designs/shared";

export const Route = createFileRoute("/designs/quick-quote")({
  head: () => designHead("Quick Quote", "A travel website built for enquiries: a 4-step quote form, weekly specials and quick answers.", QUICK_QUOTE_FONTS),
  component: () => (
    <>
      <DesignBar current="/designs/quick-quote" />
      <QuickQuote />
    </>
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { DesignBar } from "@/components/design-bar";
import { designHead } from "@/designs/shared";
import { PricingPage } from "@/pricing/page";
import { PRICING_FONTS } from "@/pricing/theme";

// TribeTravel's Packages & pricing page: the feature matrix, the quote builder and the request form.
export const Route = createFileRoute("/packages")({
  head: () => {
    const h = designHead("Packages & pricing", "TribeTravel website packages: what each one includes, prices for TribeTravel agencies and everyone else, and a quote builder.", PRICING_FONTS);
    return { ...h, meta: [{ title: "Packages & pricing — TribeTravel Websites" }, ...h.meta.slice(1)] };
  },
  component: () => (
    <>
      <DesignBar current="/packages" />
      <PricingPage />
    </>
  ),
});

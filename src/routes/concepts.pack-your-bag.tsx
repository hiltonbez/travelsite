import { createFileRoute } from "@tanstack/react-router";
import { Concept, FONTS } from "@/concepts/pack-your-bag";
import css from "@/concepts/pack-your-bag/style.css?url";
import { conceptHead, ConceptNav } from "@/concepts/kit";

export const Route = createFileRoute("/concepts/pack-your-bag")({
  head: () => conceptHead("pack-your-bag", FONTS, css),
  component: () => (
    <>
      <Concept />
      <ConceptNav slug="pack-your-bag" />
    </>
  ),
});

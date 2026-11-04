import { createFileRoute } from "@tanstack/react-router";
import { Concept, FONTS } from "@/concepts/chase-the-sun";
import css from "@/concepts/chase-the-sun/style.css?url";
import { conceptHead, ConceptNav } from "@/concepts/kit";

export const Route = createFileRoute("/concepts/chase-the-sun")({
  head: () => conceptHead("chase-the-sun", FONTS, css),
  component: () => (
    <>
      <Concept />
      <ConceptNav slug="chase-the-sun" />
    </>
  ),
});

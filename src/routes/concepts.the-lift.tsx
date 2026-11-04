import { createFileRoute } from "@tanstack/react-router";
import { Concept, FONTS } from "@/concepts/the-lift";
import css from "@/concepts/the-lift/style.css?url";
import { conceptHead, ConceptNav } from "@/concepts/kit";

export const Route = createFileRoute("/concepts/the-lift")({
  head: () => conceptHead("the-lift", FONTS, css),
  component: () => (
    <>
      <Concept />
      <ConceptNav slug="the-lift" />
    </>
  ),
});

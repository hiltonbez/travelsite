import { createFileRoute } from "@tanstack/react-router";
import { Concept, FONTS } from "@/concepts/the-trailer";
import css from "@/concepts/the-trailer/style.css?url";
import { conceptHead, ConceptNav } from "@/concepts/kit";

export const Route = createFileRoute("/concepts/the-trailer")({
  head: () => conceptHead("the-trailer", FONTS, css),
  component: () => (
    <>
      <Concept />
      <ConceptNav slug="the-trailer" />
    </>
  ),
});

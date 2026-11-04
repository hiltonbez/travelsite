import { createFileRoute } from "@tanstack/react-router";
import { Concept, FONTS } from "@/concepts/tune-in";
import css from "@/concepts/tune-in/style.css?url";
import { conceptHead, ConceptNav } from "@/concepts/kit";

export const Route = createFileRoute("/concepts/tune-in")({
  head: () => conceptHead("tune-in", FONTS, css),
  component: () => (
    <>
      <Concept />
      <ConceptNav slug="tune-in" />
    </>
  ),
});

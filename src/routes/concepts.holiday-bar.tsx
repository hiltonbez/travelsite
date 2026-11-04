import { createFileRoute } from "@tanstack/react-router";
import { Concept, FONTS } from "@/concepts/holiday-bar";
import css from "@/concepts/holiday-bar/style.css?url";
import { conceptHead, ConceptNav } from "@/concepts/kit";

export const Route = createFileRoute("/concepts/holiday-bar")({
  head: () => conceptHead("holiday-bar", FONTS, css),
  component: () => (
    <>
      <Concept />
      <ConceptNav slug="holiday-bar" />
    </>
  ),
});

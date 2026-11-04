import { createFileRoute } from "@tanstack/react-router";
import { Concept, FONTS } from "@/concepts/holiday-mix";
import css from "@/concepts/holiday-mix/style.css?url";
import { conceptHead, ConceptNav } from "@/concepts/kit";

export const Route = createFileRoute("/concepts/holiday-mix")({
  head: () => conceptHead("holiday-mix", FONTS, css),
  component: () => (
    <>
      <Concept />
      <ConceptNav slug="holiday-mix" />
    </>
  ),
});

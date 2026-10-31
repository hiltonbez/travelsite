import { createFileRoute } from "@tanstack/react-router";
import { GalleryPage } from "@/designs/enterprise";
import { BRAND } from "@/designs/shared";

export const Route = createFileRoute("/designs/enterprise/gallery")({
  head: () => ({ meta: [{ title: `Gallery — ${BRAND.name}` }] }),
  component: GalleryPage,
});

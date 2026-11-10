import { AifundiHeader } from "@/landing/header";

/** The bar along the top of the demo site's pages. Since 10 Nov 2026 it is AiFundi's own header (logo and top menu, see
 *  landing/header.tsx) instead of the dark bar of design buttons; the designs are browsed at /designs/studio.
 *  `current` is the page's path. */
export function DesignBar({ current }: { current: string }) {
  return <AifundiHeader current={current === "/packages" ? "/packages" : "/designs/studio"} />;
}

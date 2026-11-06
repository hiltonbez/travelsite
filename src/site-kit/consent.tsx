// The cookie notice every Tribe Site shows (POPIA). The choice is kept in this browser only. The demo loads no
// analytics: Google Analytics 4 and Meta Pixel are the agency's own configuration at launch.
import { useEffect, useState } from "react";

export const CONSENT_KEY = "tribe-site-consent-v1";
export type Consent = "all" | "essential" | null;

/** The stored choice, or null when there is none or the browser blocks storage. */
export function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "all" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

/** Keep the choice; private browsing and blocked storage are ignored, and the notice asks again next visit. */
export function writeConsent(v: "all" | "essential"): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, v);
  } catch {
    /* nothing to do */
  }
}

export function ConsentNotice({ id }: { id: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(readConsent() === null), []);
  if (!show) return null;
  function choose(v: "all" | "essential") {
    writeConsent(v);
    setShow(false);
  }
  return (
    <div role="region" aria-label="Cookies" className="tk-consent">
      <p>
        <b>Cookies.</b> We use essential cookies to run this site and, if you allow it, anonymous
        visit statistics. <a href={`/designs/${id}/privacy`}>Privacy (POPIA)</a>
      </p>
      <div>
        <button type="button" onClick={() => choose("all")}>
          Allow statistics
        </button>
        <button type="button" onClick={() => choose("essential")}>
          Essential only
        </button>
      </div>
    </div>
  );
}

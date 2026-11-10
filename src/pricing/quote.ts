// The quote builder's sums: what the chosen package, add-ons and care plan come to, once-off and a month.
import { ADD_ONS, AI_TOKENS, CARE_PLANS, MAILBOX, PACKAGES, type PackageId } from "@/pricing/data";

export type Choice = { tribe: boolean; pkg: PackageId; care: string; extras: Record<string, number>; mailboxes: number };

export type Line = { label: string; qty: number; once: number; monthly: number; onRequest?: boolean };

export const START: Choice = { tribe: true, pkg: "pro", care: "plus", extras: {}, mailboxes: 0 };

export function quoteLines(c: Choice): Line[] {
  const p = PACKAGES.find((x) => x.id === c.pkg)!;
  const lines: Line[] = [{ label: `${p.name} package${c.tribe ? "" : " (not on TribeTravel)"}`, qty: 1, once: c.tribe ? p.tribe : p.other, monthly: 0 }];
  lines.push({ label: `AI Concierge tokens (${AI_TOKENS.included / 1_000_000} million a month)`, qty: 1, once: 0, monthly: AI_TOKENS.monthly });
  if (p.monthly) lines.push({ label: "Running costs of the included features", qty: 1, once: 0, monthly: p.monthly });
  for (const a of ADD_ONS) {
    const qty = c.extras[a.id] ?? 0;
    if (qty > 0 && !(a.kind === "toggle" && a.included[c.pkg] > 0)) {
      lines.push(a.onRequest ? { label: `${a.name} (price on request)`, qty, once: 0, monthly: 0, onRequest: true }
        : { label: a.name, qty, once: a.once * qty, monthly: (a.monthly ?? 0) * qty });
    }
  }
  const care = CARE_PLANS.find((x) => x.id === c.care) ?? CARE_PLANS[1]!;
  lines.push({ label: `${care.name} care plan`, qty: 1, once: 0, monthly: care.monthly });
  if (c.mailboxes > 0) lines.push({ label: MAILBOX.name, qty: c.mailboxes, once: 0, monthly: MAILBOX.monthly * c.mailboxes });
  return lines;
}

export function quoteTotals(lines: Line[]) {
  const once = lines.reduce((s, l) => s + l.once, 0);
  const monthly = lines.reduce((s, l) => s + l.monthly, 0);
  return { once, monthly, deposit: Math.round(once / 2), first_year: once + monthly * 12 };
}

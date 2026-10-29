import { ArrowUpRight } from "lucide-react";
import { useEnquiry } from "@/lib/enquiry";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full border-0 border-b border-border bg-transparent px-0 py-3 text-lg outline-none transition placeholder:text-muted-foreground/60 focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function EnquiryForm({ className }: { className?: string }) {
  const { status, onSubmit, sending } = useEnquiry();

  return (
    <form onSubmit={onSubmit} className={cn("grid gap-6", className)}>
      <Field label="Name">
        <input name="name" autoComplete="name" required className={inputClass} />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Email">
          <input type="email" name="email" autoComplete="email" required className={inputClass} />
        </Field>
        <Field label="Phone">
          <input type="tel" name="phone" autoComplete="tel" className={inputClass} />
        </Field>
      </div>
      <Field label="Where to?">
        <input name="destination" placeholder="Madagascar, or not sure yet" className={inputClass} />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="When?">
          <input name="travel_dates" placeholder="March 2027" className={inputClass} />
        </Field>
        <Field label="Travellers">
          <input type="number" name="travellers" min={1} placeholder="2" className={inputClass} />
        </Field>
      </div>
      <Field label="Anything else?">
        <textarea name="message" rows={3} className={cn(inputClass, "resize-none")} />
      </Field>
      {/* Spam trap: hidden from people */}
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={sending}
          className="eyebrow inline-flex items-center gap-2 bg-primary px-8 py-4 text-primary-foreground transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
        >
          {sending ? "Sending…" : "Request a quote"} <ArrowUpRight className="h-4 w-4" />
        </button>
        {status.message && (
          <p role="status" className={cn("text-sm", status.kind === "error" ? "text-destructive" : "text-primary")}>
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}

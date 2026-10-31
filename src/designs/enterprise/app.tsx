// Arrival: the site as an installable app, with "your quote is ready" alerts.
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Bell, Check, Download, Smartphone } from "lucide-react";
import { alertsSupported, turnOnAlerts } from "@/lib/agency-extras";
import { BRAND, media } from "@/designs/shared";
import { LiveDot, StopLabel } from "@/designs/enterprise/parts";
import { OPEN_EVENT } from "@/designs/enterprise/theme";
import { btn, display, ghost, gutter, h2, input, label, mono, orange, panel, soft } from "@/designs/enterprise/theme";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function useInstall() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const keep = (e: Event) => { e.preventDefault(); setPrompt(e as InstallPrompt); };
    const done = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener("beforeinstallprompt", keep);
    window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("beforeinstallprompt", keep); window.removeEventListener("appinstalled", done); };
  }, []);

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const r = await prompt.userChoice;
    if (r.outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  return { canInstall: !!prompt, installed, ios, install };
}

/** "Your quote is ready" alerts: the browser subscribes through the app's service worker, matched to quotes by email. */
function TripAlerts() {
  const [state, setState] = useState<"idle" | "busy" | "on" | "unsupported">("idle");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!alertsSupported()) setState("unsupported");
    else if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((r) => r.pushManager.getSubscription()).then((sub) => sub && setState("on")).catch(() => {});
    }
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("busy");
    setError("");
    try {
      await turnOnAlerts(String(new FormData(e.currentTarget).get("email") || "").trim());
      setState("on");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  if (state === "unsupported") {
    return <p className={`text-sm ${soft}`}>Trip alerts work once the app is on your home screen (on iPhone, iOS 16.4 or later).</p>;
  }
  if (state === "on") {
    return <span className="flex items-center gap-2 font-semibold text-[#4ADE80]"><Bell className="h-5 w-5" /> Trip alerts are on for this device</span>;
  }
  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-3 p-5 ${panel}`}>
      <b className="flex items-center gap-2"><Bell className={`h-5 w-5 ${orange}`} /> Get an alert when your quote is ready</b>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input name="email" type="email" required autoComplete="email" placeholder="The email you enquired with" aria-label="Email"
          className={`${input} flex-1 rounded-full px-5`} />
        <button type="submit" disabled={state === "busy"} className={`${btn} whitespace-nowrap`}>
          {state === "busy" ? "Turning on..." : "Turn on alerts"}
        </button>
      </div>
      {error && <p role="alert" className="text-sm font-semibold text-[#F87171]">{error}</p>}
    </form>
  );
}

export function InstallApp() {
  const app = useInstall();
  return (
    <section id="app" data-stop className={`relative z-10 grid scroll-mt-20 items-center gap-14 ${gutter} py-24 md:py-28 lg:grid-cols-2`}>
      <div className="flex flex-col gap-6">
        <StopLabel><Smartphone className="h-4 w-4" /> Arrival · The {BRAND.short} app</StopLabel>
        <h2 className={h2}>Land in <span className={orange}>your pocket.</span></h2>
        <p className={`text-lg leading-relaxed ${soft}`}>
          Add {BRAND.name} to your home screen: it opens like an app, works on a weak signal, and keeps your concierge, quotes and our contact details one tap away.
        </p>
        {app.installed ? (
          <span className="flex items-center gap-2 font-semibold text-[#4ADE80]"><Check className="h-5 w-5" /> Installed on this device</span>
        ) : app.canInstall ? (
          <button type="button" onClick={app.install} className={`${btn} min-h-14 self-start px-8`}>
            <Download className="h-5 w-5" /> Install the app
          </button>
        ) : (
          <p className={`p-5 text-[15px] leading-relaxed ${panel}`}>
            {app.ios
              ? <>On iPhone: tap <b>Share</b>, then <b>Add to Home Screen</b>.</>
              : <>On your phone: open the browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.</>}
          </p>
        )}
        <TripAlerts />
        <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className={`self-start text-sm font-semibold underline-offset-4 hover:underline ${orange}`}>
          Or ask the concierge now →
        </button>
      </div>
      <div className="flex justify-center">
        <div className="d-float relative h-[560px] w-[280px] rounded-[44px] border-[10px] border-[#22314F] bg-[#0B1424] shadow-[0_50px_100px_-30px_rgba(0,0,0,.9)]">
          <div className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#22314F]" aria-hidden="true" />
          <div className="flex h-full flex-col overflow-hidden rounded-[34px]">
            <div className="relative h-[46%]">
              <img src={media.islands} alt="" aria-hidden="true" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,#0B1424)]" />
              <span className={`absolute bottom-4 left-5 ${display} text-2xl leading-none`}>Your trip to<br /><span className={orange}>Mauritius</span></span>
            </div>
            <div className="flex flex-1 flex-col gap-2.5 p-4 text-sm">
              <span className={`flex items-center gap-2 ${label} ${orange}`}><LiveDot /> Quote Q-1042 ready</span>
              {[["Flights", "JNB → MRU"], ["Villa", "7 nights"], ["Concierge", "Ask me anything"]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-2xl border border-[#EDE6D8]/12 px-4 py-3">
                  <span className="flex flex-col"><b>{k}</b><span className={`${mono} text-xs ${soft}`}>{v}</span></span>
                  <ArrowRight className={`h-4 w-4 ${orange}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

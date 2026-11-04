// Tune In: a 1950s valve radio is the trip planner. Turn the dial through static to a destination's station, press its
// preset in, and the pressed-in presets add up to one holiday, printed as a radio programme guide.
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { BRAND, Clip, QuoteForm, contact, rand, useReducedMotion } from "@/concepts/kit";
import { RadioAudio } from "./audio";
import {
  BAND_HIGH,
  BAND_LOW,
  STATIONS,
  TRIP_STATIONS,
  buildProgramme,
  nearestStation,
  signalAt,
  stationById,
  type Leg,
  type Station,
  type StationId,
} from "./stations";

export const FONTS =
  "family=Limelight&family=Monoton&family=Courier+Prime:ital,wght@0,400;0,700;1,400";

const START = 93.4; // a little off Zanzibar, so the first thing the radio does is find it
const MHZ_PER_TURN = 12;
const pct = (f: number) => ((f - BAND_LOW) / (BAND_HIGH - BAND_LOW)) * 100;
const knobDeg = (f: number) => ((f - BAND_LOW) / MHZ_PER_TURN) * 360;
const clampBand = (f: number) => Math.min(BAND_HIGH, Math.max(BAND_LOW, f));

const FIRST_WORDS =
  "Krrrsshh. You're between stations. Turn the big dial until the picture clears, then flip Power for sound.";
const STATIC_WORDS = "Krrrsshh. Nothing here but weather. Keep turning.";

const TICKS = Array.from({ length: 41 }, (_, i) => ({
  x: i * 5,
  major: i % 8 === 0,
  mid: i % 2 === 0,
}));
const DIAL_NUMBERS = [88, 92, 96, 100, 104, 108];
const SKIRT = Array.from({ length: 48 }, (_, i) => i * 7.5);

type Preset = { id: StationId; in: boolean };

const scrollToId = (id: string, reduced: boolean) => {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
};

export function Concept() {
  const reduced = useReducedMotion();
  const reducedRef = useRef(false);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  const [tuned, setTuned] = useState<StationId | null>(null);
  const [near, setNear] = useState<StationId | null>(nearestStation(START).station.id);
  const [words, setWords] = useState(FIRST_WORDS);
  const [ident, setIdent] = useState(0);
  const [sound, setSound] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [touched, setTouched] = useState(false);
  const [radioInView, setRadioInView] = useState(true);

  const roomRef = useRef<HTMLElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const eyeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tubeRef = useRef<HTMLDivElement>(null);
  const wobRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<RadioAudio | null>(null);
  const inViewRef = useRef(true);

  const phys = useRef({
    f: START,
    shown: START,
    v: 0,
    target: null as number | null,
    dragging: false,
    hold: true,
    touched: false,
    tuned: null as StationId | null,
    near: nearestStation(START).station.id as StationId | null,
    audioDirty: true,
  });
  const drag = useRef({ cx: 0, cy: 0, angle: 0, at: 0 });

  // Everything that moves with the needle runs here, off React, so turning the dial stays at 60fps.
  useEffect(() => {
    const p = phys.current;
    const visits: Partial<Record<StationId, number>> = {};
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedRef.current) {
      p.target = 94.2;
    }

    const needle = needleRef.current,
      grip = gripRef.current,
      read = readRef.current,
      knob = knobRef.current;
    const eye = eyeRef.current,
      canvas = canvasRef.current,
      tube = tubeRef.current;
    const c2d = canvas?.getContext("2d", { alpha: false }) ?? null;

    // Three sheets of warm snow, drawn once and shuffled every frame.
    const sheets = [0, 1, 2].map(() => {
      const s = document.createElement("canvas");
      s.width = s.height = 256;
      const x = s.getContext("2d");
      if (x) {
        const img = x.createImageData(256, 256);
        for (let i = 0; i < img.data.length; i += 4) {
          const v = 18 + Math.random() * 215;
          img.data[i] = v * 1.02;
          img.data[i + 1] = v * 0.95;
          img.data[i + 2] = v * 0.82;
          img.data[i + 3] = 255;
        }
        x.putImageData(img, 0, 0);
      }
      return s;
    });
    const drawSnow = (now: number) => {
      if (!c2d || !canvas) return;
      const sheet = sheets[Math.floor(Math.random() * 3)] as HTMLCanvasElement;
      c2d.drawImage(sheet, -Math.random() * 56, -Math.random() * 106);
      const y = ((now / 26) % (canvas.height + 40)) - 20;
      c2d.fillStyle = "rgba(255,226,170,.13)";
      c2d.fillRect(0, y, canvas.width, 16);
    };
    drawSnow(0);

    const intro = window.setTimeout(() => {
      if (!p.touched && !reducedRef.current) {
        p.target = 94.2;
        p.hold = false;
      }
    }, 1100);

    let raf = 0,
      last = performance.now(),
      lastSnow = 0,
      lastAudio = 0,
      lastAudioF = -1,
      lastTick = p.f,
      lastEye = -1,
      lastTenth = -1,
      prevF = p.f;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const calm = reducedRef.current;

      if (!p.dragging) {
        if (p.target !== null) {
          if (calm) {
            p.f = p.target;
            p.v = 0;
            p.target = null;
            p.hold = true;
          } else {
            // A slightly loose spring, so the needle settles the way a string-driven one does.
            p.v += (42 * (p.target - p.f) - 9.5 * p.v) * dt;
            p.f += p.v * dt;
            if (Math.abs(p.target - p.f) < 0.004 && Math.abs(p.v) < 0.03) {
              p.f = p.target;
              p.v = 0;
              p.target = null;
              p.hold = true;
            }
          }
        } else if (!p.hold) {
          p.f += p.v * dt;
          p.v *= Math.exp(-2.8 * dt); // the flywheel behind the knob running down
          if (Math.abs(p.v) < 0.5) {
            const { station, off } = nearestStation(p.f);
            if (off < 0.8) p.target = station.freq;
            else {
              p.v = 0;
              p.hold = true;
            }
          }
        }
      }
      if (p.f < BAND_LOW || p.f > BAND_HIGH) {
        p.f = clampBand(p.f);
        p.v *= -0.3;
        if (p.target !== null) p.target = clampBand(p.target);
      }

      const speed = dt > 0 ? Math.abs(p.f - prevF) / dt : 0;
      prevF = p.f;
      p.shown = calm ? p.f : p.shown + (p.f - p.shown) * Math.min(1, dt * 24);

      if (needle) needle.style.transform = `translate3d(${pct(p.shown).toFixed(3)}%,0,0)`;
      if (grip) grip.style.transform = `rotate(${knobDeg(p.f).toFixed(2)}deg)`;

      const { station, off } = nearestStation(p.f);
      const sig = signalAt(off);

      const tenth = Math.round(p.f * 10);
      if (tenth !== lastTenth) {
        lastTenth = tenth;
        const label = (tenth / 10).toFixed(1);
        if (read) read.textContent = label;
        if (knob) {
          knob.setAttribute("aria-valuenow", label);
          knob.setAttribute(
            "aria-valuetext",
            off <= 0.25
              ? `${label}, ${station.trip?.name ?? "a station with no name"}`
              : `${label}, static`,
          );
        }
      }

      if (Math.abs(p.f - lastTick) >= 0.25) {
        lastTick = p.f;
        audioRef.current?.tick();
      }

      if (eye && Math.abs(sig - lastEye) > 0.015) {
        lastEye = sig;
        eye.style.setProperty("--shut", `${(84 - sig * 78).toFixed(1)}deg`);
      }

      if (canvas) {
        canvas.style.opacity = (1 - sig).toFixed(3);
        if (sig < 1 && !calm && inViewRef.current && now - lastSnow > 42) {
          lastSnow = now;
          drawSnow(now);
        }
      }
      if (tube && !calm) {
        const j = 1 - sig;
        tube.style.transform =
          j > 0.01
            ? `translate3d(${(Math.sin(now * 0.031) * j * 7).toFixed(2)}px,0,0) skewX(${(Math.sin(now * 0.017) * j * 2.4).toFixed(2)}deg)`
            : "none";
      }

      // React only hears about it when something changes station.
      const nextNear = off <= 1.2 ? station.id : null;
      if (nextNear !== p.near && (speed < 5 || nextNear === null)) {
        p.near = nextNear;
        setNear(nextNear);
        p.audioDirty = true;
      }
      const nextTuned =
        p.tuned === null
          ? off <= 0.25 && speed < 1.6
            ? station.id
            : null
          : off <= 0.36
            ? p.tuned
            : null;
      if (nextTuned !== p.tuned) {
        p.tuned = nextTuned;
        setTuned(nextTuned);
        if (nextTuned) {
          const n = visits[nextTuned] ?? 0;
          visits[nextTuned] = n + 1;
          setWords(stationById(nextTuned).lines[n % 2] as string);
          setIdent((x) => x + 1);
          if (p.touched) navigator.vibrate?.(8);
        } else {
          setWords(STATIC_WORDS);
        }
      }

      if (
        audioRef.current &&
        now - lastAudio > 66 &&
        (p.audioDirty || Math.abs(p.f - lastAudioF) > 0.003)
      ) {
        lastAudio = now;
        lastAudioF = p.f;
        p.audioDirty = false;
        audioRef.current.tune(p.near, sig, off);
      }
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => audioRef.current?.setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(intro);
      document.removeEventListener("visibilitychange", onVis);
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  // Footage stops when the radio's off screen.
  useEffect(() => {
    const el = roomRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e) return;
      inViewRef.current = e.isIntersecting;
      setRadioInView(e.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The station-ident wobble: the picture shudders as the signal locks.
  useEffect(() => {
    if (!tuned || reduced) return;
    wobRef.current?.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-7px) skewX(-1.4deg)" },
        { transform: "translateX(5px) skewX(1deg)" },
        { transform: "translateX(-3px)" },
        { transform: "translateX(1px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 620, easing: "ease-out" },
    );
  }, [tuned, reduced]);

  const glideTo = useCallback((f: number) => {
    const p = phys.current;
    p.touched = true;
    setTouched(true);
    p.target = clampBand(f);
    p.hold = false;
    p.dragging = false;
  }, []);

  const stepStation = useCallback(
    (dir: 1 | -1) => {
      const p = phys.current;
      const base = p.target ?? p.f;
      const list = dir > 0 ? TRIP_STATIONS : [...TRIP_STATIONS].reverse();
      const next =
        list.find((s) => (dir > 0 ? s.freq > base + 0.05 : s.freq < base - 0.05)) ?? list[0];
      glideTo((next as Station).freq);
    },
    [glideTo],
  );

  const onKnobDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = phys.current;
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = {
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      angle: Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)),
      at: e.timeStamp,
    };
    p.dragging = true;
    p.touched = true;
    p.target = null;
    p.hold = false;
    p.v = 0;
    setTouched(true);
  };
  const onKnobMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = phys.current,
      d = drag.current;
    if (!p.dragging) return;
    const dx = e.clientX - d.cx,
      dy = e.clientY - d.cy;
    if (dx * dx + dy * dy < 64) return; // right on the spindle, the angle means nothing
    const angle = Math.atan2(dy, dx);
    let da = angle - d.angle;
    if (da > Math.PI) da -= Math.PI * 2;
    if (da < -Math.PI) da += Math.PI * 2;
    d.angle = angle;
    const df = (da / (Math.PI * 2)) * MHZ_PER_TURN;
    p.f = clampBand(p.f + df);
    const ms = Math.max(1, e.timeStamp - d.at);
    d.at = e.timeStamp;
    p.v = p.v * 0.7 + (df / (ms / 1000)) * 0.3;
  };
  const onKnobUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = phys.current;
    if (!p.dragging) return;
    p.dragging = false;
    p.v =
      reducedRef.current || e.timeStamp - drag.current.at > 90
        ? 0
        : Math.max(-14, Math.min(14, p.v));
  };
  const onKnobKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const p = phys.current;
    const base = p.target ?? p.f;
    const fine = (by: number) => glideTo(Math.round((base + by) * 10) / 10);
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        fine(0.2);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        fine(-0.2);
        break;
      case "PageUp":
        stepStation(1);
        break;
      case "PageDown":
        stepStation(-1);
        break;
      case "Home":
        glideTo(BAND_LOW);
        break;
      case "End":
        glideTo(BAND_HIGH);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const togglePower = () => {
    // The only place sound can begin: inside the traveller's own click.
    if (sound) {
      audioRef.current?.powerOff();
      setSound(false);
      return;
    }
    if (!audioRef.current) audioRef.current = new RadioAudio();
    audioRef.current.powerOn();
    phys.current.audioDirty = true;
    setSound(true);
  };

  /** Puts a station on the next free key, pressed in; or flips its key if it already has one. */
  const flipPreset = useCallback((id: StationId) => {
    audioRef.current?.clunk();
    setPresets((list) => {
      const at = list.findIndex((x) => x.id === id);
      if (at < 0) return [...list, { id, in: true }];
      return list.map((x, i) => (i === at ? { ...x, in: !x.in } : x));
    });
  }, []);
  const pressKey = (preset: Preset) => {
    if (!preset.in) glideTo(stationById(preset.id).freq);
    flipPreset(preset.id);
  };
  /** From the "Save this station" button: only ever presses in, never pops out. */
  const saveTuned = () => {
    if (!tuned) return;
    const had = presets.find((x) => x.id === tuned);
    if (!had || !had.in) flipPreset(tuned);
  };

  const tunedStation = tuned ? stationById(tuned) : null;
  const nearStation = near ? stationById(near) : null;
  const tunedPreset = tuned ? presets.findIndex((x) => x.id === tuned) : -1;
  const tunedIn = presets[tunedPreset]?.in === true;
  const onStations = useMemo(
    () => presets.filter((x) => x.in).map((x) => stationById(x.id)),
    [presets],
  );
  const programme = useMemo(() => buildProgramme(onStations), [onStations]);

  let saveLabel = "Find a station to save";
  if (tunedStation) {
    if (!tunedStation.trip) saveLabel = "Nothing to save here";
    else if (tunedIn) saveLabel = `Saved on key ${tunedPreset + 1}`;
    else if (tunedPreset >= 0) saveLabel = `Press key ${tunedPreset + 1} back in`;
    else saveLabel = "Save this station";
  }
  const canSave = !!tunedStation?.trip && !tunedIn;

  return (
    <main
      className={`c-tune-in${sound ? " is-sound" : ""}${touched ? " is-touched" : ""}`}
      style={{ "--tint": tunedStation?.tint ?? "#d98a2b" } as CSSProperties}
    >
      <section className="tn-room" ref={roomRef} id="tn-radio" aria-label="The radio">
        <div className="tn-wall" aria-hidden="true" />
        <div className="tn-halo" aria-hidden="true" />
        <div className="tn-cabinet">
          <header className="tn-plate">
            <h1 className="tn-brand">{BRAND.name}</h1>
            <nav className="tn-plate-nav" aria-label="On this page">
              <a
                href="#tn-guide"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId("tn-guide", reduced);
                }}
              >
                Guide
              </a>
              <a
                href="#tn-log"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId("tn-log", reduced);
                }}
              >
                Stations
              </a>
              <a href={`tel:${contact.phoneE164}`}>Phone</a>
            </nav>
          </header>

          <div className="tn-top">
            <div className="tn-bezel">
              <div className="tn-screen">
                <div className="tn-tube" ref={tubeRef}>
                  <div className="tn-wob" ref={wobRef}>
                    {nearStation && (
                      <Clip
                        className="tn-video"
                        src={nearStation.video}
                        poster={nearStation.poster}
                        paused={!radioInView}
                      />
                    )}
                  </div>
                  <canvas
                    ref={canvasRef}
                    className="tn-snow"
                    width={200}
                    height={150}
                    style={{ opacity: 1 - signalAt(nearestStation(START).off) }}
                    aria-hidden="true"
                  />
                </div>
                <div className="tn-glass" aria-hidden="true" />
                {tunedStation && (
                  <Ident key={`${tunedStation.id}-${ident}`} station={tunedStation} />
                )}
              </div>
            </div>

            <div className="tn-side">
              <div className="tn-valves" aria-hidden="true">
                <Valves />
              </div>
              <div className="tn-grille" aria-hidden="true">
                <span className="tn-grille-light" />
              </div>
              <div className="tn-voice">
                <span className="tn-voice-tag">On air</span>
                <Announcer key={words} text={words} reduced={reduced} />
                {tunedStation?.trip && (
                  <p className="tn-voice-facts">
                    {tunedStation.trip.nights} nights · {rand(tunedStation.trip.price)} pp sharing
                    (sample)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="tn-scale">
            <span className="tn-scale-glow" aria-hidden="true" />
            <div className="tn-rail">
              <svg
                className="tn-ticks"
                viewBox="0 0 200 20"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {TICKS.map((t) => (
                  <line
                    key={t.x}
                    x1={t.x}
                    x2={t.x}
                    y1={20}
                    y2={t.major ? 3 : t.mid ? 10 : 14}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
              <div className="tn-numbers" aria-hidden="true">
                {DIAL_NUMBERS.map((n) => (
                  <span key={n} style={{ left: `${pct(n)}%` }}>
                    {n}
                  </span>
                ))}
              </div>
              <div className="tn-names">
                {TRIP_STATIONS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`tn-name${i % 2 ? " is-low" : ""}${tuned === s.id ? " is-on" : ""}`}
                    style={{ left: `${pct(s.freq)}%` }}
                    onClick={() => glideTo(s.freq)}
                    aria-label={`Tune to ${s.freq} ${s.trip?.name}`}
                    aria-current={tuned === s.id ? "true" : undefined}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <div
                className="tn-needle-run"
                ref={needleRef}
                style={{ transform: `translate3d(${pct(START)}%,0,0)` }}
                aria-hidden="true"
              >
                <span className="tn-needle" />
              </div>
            </div>
            <span className="tn-read" aria-hidden="true">
              <span ref={readRef}>{START.toFixed(1)}</span> <small>Mc/s</small>
            </span>
          </div>

          <div className="tn-controls">
            <div className="tn-left">
              <button
                type="button"
                className="tn-power"
                role="switch"
                aria-checked={sound}
                aria-label="Power: radio sound"
                onClick={togglePower}
              >
                <span className="tn-power-well" aria-hidden="true">
                  <span className="tn-lever" />
                </span>
                <span className="tn-power-text">
                  <b>Power</b>
                  <small>{sound ? "Sound on" : "Sound off"}</small>
                </span>
              </button>
              <div className="tn-eye-wrap" aria-hidden="true">
                <div className="tn-eye" ref={eyeRef} />
                <small>Tuning eye</small>
              </div>
            </div>

            <div className="tn-mid">
              <div
                className="tn-keys"
                role="group"
                aria-label="Preset buttons. Pressed-in presets add up to your trip."
              >
                {Array.from({ length: 6 }, (_, i) => {
                  const preset = presets[i];
                  const s = preset ? stationById(preset.id) : null;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`tn-key${preset?.in ? " is-in" : ""}${s ? " is-set" : ""}`}
                      disabled={!preset}
                      aria-pressed={preset ? preset.in : undefined}
                      aria-label={
                        s ? `Preset ${i + 1}: ${s.freq} ${s.trip?.name}` : `Preset ${i + 1}, empty`
                      }
                      onClick={() => preset && pressKey(preset)}
                    >
                      <span className="tn-key-face">
                        {s ? (
                          <>
                            <b>{s.freq}</b> <em>{s.name}</em>
                          </>
                        ) : (
                          <i>{i + 1}</i>
                        )}
                      </span>
                      <span className="tn-key-lamp" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
              <div className="tn-mid-row">
                <button type="button" className="tn-save" disabled={!canSave} onClick={saveTuned}>
                  {saveLabel}
                </button>
                <div className="tn-meter" aria-live="polite">
                  {programme.legs.length > 0 ? (
                    <>
                      <button
                        type="button"
                        className="tn-meter-go"
                        onClick={() => scrollToId("tn-guide", reduced)}
                      >
                        <b>
                          {programme.nights} nights · {rand(programme.price)}
                        </b>
                        <span>See the programme guide</span>
                      </button>
                      <small>Sample, pp sharing</small>
                    </>
                  ) : (
                    <p>Saved stations add up to one trip here.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="tn-dial-wrap">
              <button
                type="button"
                className="tn-step"
                aria-label="Previous station"
                onClick={() => stepStation(-1)}
              >
                <span className="tn-tri is-left" />
              </button>
              <div className="tn-dial">
                <div className="tn-skirt" aria-hidden="true">
                  <svg viewBox="0 0 100 100">
                    {SKIRT.map((a) => (
                      <line
                        key={a}
                        x1="50"
                        y1="2"
                        x2="50"
                        y2={a % 30 === 0 ? 7 : 5}
                        transform={`rotate(${a} 50 50)`}
                      />
                    ))}
                  </svg>
                </div>
                <div
                  ref={knobRef}
                  className="tn-knob"
                  role="slider"
                  tabIndex={0}
                  aria-label="Tuning dial. Left and right arrows fine-tune; Page Up and Page Down jump stations."
                  aria-valuemin={BAND_LOW}
                  aria-valuemax={BAND_HIGH}
                  aria-valuenow={START}
                  aria-valuetext={`${START}, static`}
                  onPointerDown={onKnobDown}
                  onPointerMove={onKnobMove}
                  onPointerUp={onKnobUp}
                  onPointerCancel={onKnobUp}
                  onKeyDown={onKnobKey}
                >
                  <div className="tn-nudge">
                    <div
                      className="tn-grip"
                      ref={gripRef}
                      style={{ transform: `rotate(${knobDeg(START)}deg)` }}
                    >
                      <span className="tn-notch" />
                    </div>
                  </div>
                  <div className="tn-sheen" aria-hidden="true" />
                </div>
                <span className="tn-dial-hint" aria-hidden="true">
                  Turn me
                </span>
              </div>
              <button
                type="button"
                className="tn-step"
                aria-label="Next station"
                onClick={() => stepStation(1)}
              >
                <span className="tn-tri" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Guide
        legs={programme.legs}
        nights={programme.nights}
        price={programme.price}
        reduced={reduced}
      />
      <StationLog
        tuned={tuned}
        presets={presets}
        onTune={(s) => {
          glideTo(s.freq);
          scrollToId("tn-radio", reduced);
        }}
        onFlip={flipPreset}
      />

      <footer className="tn-foot">
        <p className="tn-foot-sign">
          You've been listening to <span>{BRAND.name}</span>
        </p>
        <p className="tn-foot-links">
          <a href={`tel:${contact.phoneE164}`}>{contact.phoneDisplay}</a>
          <a href={contact.whatsapp}>WhatsApp</a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </p>
        <p className="tn-foot-note">
          A design sample. Prices are examples, per person sharing. Every sound on this radio is
          generated in your browser.
        </p>
      </footer>
    </main>
  );
}

/** The call sign over the picture: its letters wobble in as the station locks on. */
function Ident({ station }: { station: Station }) {
  return (
    <div className="tn-ident" aria-hidden="true">
      <span className="tn-ident-f">{station.freq}</span>
      <span className="tn-ident-n">
        {station.name.split("").map((ch, i) => (
          <span key={i} style={{ animationDelay: `${i * 42}ms` }}>
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    </div>
  );
}

/** Types the announcer's words out. Keyed by the words, so a new line starts from nothing. */
function Announcer({ text, reduced }: { text: string; reduced: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setN((x) => {
        if (x >= text.length) window.clearInterval(id);
        return x + 1;
      });
    }, 26);
    return () => window.clearInterval(id);
  }, [text]);
  const shown = reduced ? text : text.slice(0, n);
  return (
    <p className="tn-words">
      <span className="tn-sr" role="status">
        {text}
      </span>
      <span aria-hidden="true">
        {shown}
        {shown.length < text.length && <i className="tn-caret" />}
      </span>
    </p>
  );
}

function Valves() {
  const tube = (x: number, h: number, cls: string) => (
    <g transform={`translate(${x} 0)`}>
      <path
        d={`M-16 86 V${86 - h + 16} Q-16 ${86 - h} 0 ${86 - h} Q16 ${86 - h} 16 ${86 - h + 16} V86 Z`}
        className="tn-v-glass"
      />
      <rect x="-9" y={86 - h * 0.74} width="18" height={h * 0.5} rx="2" className="tn-v-plate" />
      <rect
        x="-1.4"
        y={86 - h * 0.7}
        width="2.8"
        height={h * 0.42}
        rx="1.4"
        className="tn-v-wire"
      />
      <ellipse
        cx="0"
        cy={86 - h * 0.48}
        rx="26"
        ry={h * 0.44}
        fill="url(#tn-fil)"
        className={`tn-fil ${cls}`}
      />
      <path d={`M-11 84 V${86 - h + 20}`} className="tn-v-shine" />
      <rect x="-19" y="80" width="38" height="10" rx="2" className="tn-v-base" />
    </g>
  );
  return (
    <svg viewBox="0 0 320 90" preserveAspectRatio="xMidYMax slice">
      <defs>
        <radialGradient id="tn-fil">
          <stop offset="0" stopColor="#ffd38a" stopOpacity=".95" />
          <stop offset=".4" stopColor="#ff8f2c" stopOpacity=".5" />
          <stop offset="1" stopColor="#ff6a10" stopOpacity="0" />
        </radialGradient>
      </defs>
      {tube(58, 74, "a")}
      {tube(122, 58, "b")}
      {tube(182, 78, "c")}
      {tube(246, 62, "a")}
    </svg>
  );
}

function Guide({
  legs,
  nights,
  price,
  reduced,
}: {
  legs: Leg[];
  nights: number;
  price: number;
  reduced: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [air, setAir] = useState(0);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // The guide's little screen plays each stop in turn.
  useEffect(() => {
    if (legs.length < 2 || !visible || reduced) return;
    const id = window.setInterval(() => setAir((x) => x + 1), 6500);
    return () => window.clearInterval(id);
  }, [legs.length, visible, reduced]);

  const onAir = legs.length ? legs[air % legs.length] : null;
  const shownPrice = useTweened(price, reduced);
  const shownNights = useTweened(nights, reduced);
  const title = legs.map((l) => l.trip.name).join(", then ");
  const summary = `${legs.map((l) => l.trip.name).join(" + ")}, ${nights} nights`;

  return (
    <section className="tn-guide" id="tn-guide" ref={sectionRef} aria-labelledby="tn-guide-h">
      <div className="tn-paper">
        <header className="tn-mast">
          <p className="tn-mast-kicker">
            <span>{BRAND.name}</span>
            <span>Holiday broadcasting, all bands</span>
          </p>
          <h2 id="tn-guide-h">The Programme Guide</h2>
          <p className="tn-mast-sub">{legs.length ? title : "Tonight: nothing scheduled, yet"}</p>
        </header>

        {!onAir ? (
          <div className="tn-empty">
            <p>
              Your schedule prints here. Tune to a station on the radio, press{" "}
              <b>Save this station</b>, and it goes straight on the programme. Save another and they
              run one after the other.
            </p>
            <div className="tn-ghost" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : (
          <div className="tn-print">
            <div className="tn-sched">
              {legs.map((leg, i) => (
                <article
                  className="tn-leg"
                  key={leg.station.id}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <header className="tn-leg-head">
                    <img src={leg.trip.photos[0]} alt="" loading="lazy" className="tn-half" />
                    <div>
                      <p className="tn-leg-f">{leg.station.freq}</p>
                      <h3>{leg.trip.name}</h3>
                      <p className="tn-leg-sub">
                        {leg.nights} nights · {leg.trip.flight}
                      </p>
                    </div>
                  </header>
                  <ol className="tn-slots">
                    {leg.slots.map((slot) => (
                      <li key={slot.when}>
                        <span className="tn-when">{slot.when}</span>
                        <p>
                          <b>{slot.title}</b>
                          {slot.tag && <em> ({slot.tag})</em>}
                          <br />
                          {slot.text}
                        </p>
                      </li>
                    ))}
                  </ol>
                  {leg.next && (
                    <p className="tn-break">
                      Station break. Change frequency, and on to {leg.next.trip?.name}.
                    </p>
                  )}
                </article>
              ))}
            </div>

            <aside className="tn-sum">
              <div className="tn-tv">
                <Clip
                  className="tn-tv-clip"
                  src={onAir.station.video}
                  poster={onAir.station.poster}
                  paused={!visible}
                />
                <span className="tn-tv-glass" aria-hidden="true" />
                <span className="tn-tv-tag">
                  Now showing: {onAir.station.freq} {onAir.station.name}
                </span>
              </div>
              <dl className="tn-totals">
                <div>
                  <dt>Stations</dt>
                  <dd>{legs.length}</dd>
                </div>
                <div>
                  <dt>Nights</dt>
                  <dd>{Math.round(shownNights)}</dd>
                </div>
                <div className="is-price">
                  <dt>Total</dt>
                  <dd>{rand(shownPrice)}</dd>
                </div>
              </dl>
              <p className="tn-small">
                Sample price per person sharing, added up from each stop. The agency confirms the
                real one.
              </p>
              <div className="tn-call">
                <div className="tn-call-head">
                  <RotaryDial />
                  <h3>Call the station</h3>
                </div>
                <QuoteForm
                  summary={summary}
                  button="Call the station"
                  classes={{
                    form: "tn-form",
                    field: "tn-field",
                    label: "tn-label",
                    input: "tn-input",
                    button: "tn-call-btn",
                    done: "tn-done",
                    note: "tn-small",
                  }}
                >
                  <p className="tn-form-intro">
                    Tell us who's listening, and {BRAND.name} will come back with a real price for
                    this schedule.
                  </p>
                </QuoteForm>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

function useTweened(value: number, reduced: boolean) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    const began = performance.now();
    const dur = reduced ? 0 : 650;
    let raf = requestAnimationFrame(function step(now) {
      const t = dur ? Math.min(1, (now - began) / dur) : 1;
      const v = start + (value - start) * (1 - (1 - t) ** 3);
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);
  return shown;
}

function RotaryDial() {
  return (
    <svg className="tn-rotary" viewBox="0 0 60 60" aria-hidden="true">
      <circle cx="30" cy="30" r="28" className="tn-rot-body" />
      <g className="tn-rot-wheel">
        {Array.from({ length: 10 }, (_, i) => {
          const a = ((i * 30 - 120) * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={(30 + Math.cos(a) * 20).toFixed(2)}
              cy={(30 + Math.sin(a) * 20).toFixed(2)}
              r="4.2"
              className="tn-rot-hole"
            />
          );
        })}
      </g>
      <circle cx="30" cy="30" r="9" className="tn-rot-hub" />
    </svg>
  );
}

function StationLog({
  tuned,
  presets,
  onTune,
  onFlip,
}: {
  tuned: StationId | null;
  presets: Preset[];
  onTune: (s: Station) => void;
  onFlip: (id: StationId) => void;
}) {
  return (
    <section className="tn-log" id="tn-log" aria-labelledby="tn-log-h">
      <header className="tn-log-head">
        <h2 id="tn-log-h">The full dial</h2>
        <p>
          All six stations, for those who'd rather read the listings. Prices are samples, per person
          sharing.
        </p>
      </header>
      <ul className="tn-rows">
        {STATIONS.filter((s) => s.trip).map((s) => {
          const t = s.trip;
          if (!t) return null;
          const preset = presets.find((x) => x.id === s.id);
          return (
            <li key={s.id} className={`tn-row${tuned === s.id ? " is-on" : ""}`}>
              <span className="tn-row-f">{s.freq}</span>
              <img className="tn-row-img" src={t.photos[1]} alt="" loading="lazy" />
              <div className="tn-row-body">
                <h3>{t.name}</h3>
                <p className="tn-row-tag">{t.tagline}</p>
                <p className="tn-row-intro">{t.intro}</p>
              </div>
              <div className="tn-row-buy">
                <p>
                  <b>{rand(t.price)}</b>
                  <br />
                  {t.nights} nights · {t.flight}
                </p>
                <div className="tn-row-btns">
                  <button
                    type="button"
                    onClick={() => onTune(s)}
                    aria-label={`Tune the radio to ${t.name}`}
                  >
                    Tune in
                  </button>
                  <button
                    type="button"
                    aria-pressed={!!preset?.in}
                    className={preset?.in ? "is-in" : ""}
                    onClick={() => onFlip(s.id)}
                    aria-label={`${preset?.in ? "Take off" : "Add to"} programme: ${t.name}`}
                  >
                    {preset?.in ? "On the guide" : "Save"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

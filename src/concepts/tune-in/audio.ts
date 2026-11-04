// Everything the radio says out loud, generated with Web Audio: no audio files. Only ever created from the traveller's
// click on the power switch, so sound can't start by itself.
import type { StationId } from "./stations";

type NoiseKind = "white" | "pink" | "brown";

/** What a station's sound gets built from. */
type Kit = {
  ctx: AudioContext;
  out: AudioNode;
  noise: (
    kind: NoiseKind,
    filter: BiquadFilterType,
    freq: number,
    q: number,
    vol: number,
  ) => { gain: GainNode; filter: BiquadFilterNode };
  tone: (type: OscillatorType, freq: number, vol: number) => GainNode;
  lfo: (rate: number, depth: number, target: AudioParam) => void;
  every: (minS: number, maxS: number, fn: () => void) => void;
  chirp: (
    f0: number,
    f1: number,
    at: number,
    dur: number,
    vol: number,
    type?: OscillatorType,
  ) => void;
};

const pick = (a: number, b: number) => a + Math.random() * (b - a);

function waves({ noise, lfo }: Kit, rate: number, vol: number) {
  const body = noise("brown", "lowpass", 720, 0.3, vol * 0.75);
  lfo(rate, vol * 0.6, body.gain.gain);
  lfo(rate * 0.63, vol * 0.25, body.gain.gain);
  const wash = noise("pink", "bandpass", 2600, 0.5, vol * 0.16);
  lfo(rate, vol * 0.14, wash.gain.gain);
}

function gull({ ctx, chirp }: Kit) {
  const t = ctx.currentTime;
  const n = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) chirp(1500, 1050, t + i * 0.26, 0.2, 0.035, "triangle");
}

function songbird({ ctx, chirp }: Kit, base: number) {
  const t = ctx.currentTime;
  const n = 3 + Math.floor(Math.random() * 5);
  for (let i = 0; i < n; i++) {
    const f = base * pick(0.85, 1.35);
    chirp(f, f * pick(0.8, 1.3), t + i * pick(0.09, 0.15), 0.07, 0.04);
  }
}

function bell({ ctx, chirp }: Kit, f: number, vol: number) {
  const t = ctx.currentTime;
  [1, 2, 2.42, 3.01, 4.2].forEach((m, i) => chirp(f * m, f * m, t, 2.6 - i * 0.4, vol / (i + 1)));
}

const RECIPES: Record<StationId, (k: Kit) => void> = {
  // Big slow waves, a creak of rigging and the odd gull.
  zanzibar(k) {
    waves(k, 0.11, 0.85);
    k.every(9, 18, () => gull(k));
    k.every(6, 13, () => {
      const t = k.ctx.currentTime;
      k.chirp(120, 86, t, 0.32, 0.03, "sawtooth");
      k.chirp(150, 96, t + 0.42, 0.26, 0.022, "sawtooth");
    });
  },
  // A small lagoon lap with tropical birds.
  mauritius(k) {
    waves(k, 0.2, 0.36);
    k.every(1.6, 5, () => songbird(k, 2900));
  },
  // Dawn in the bush: crickets, a thin wind, songbirds and a far-off descending call.
  kruger(k) {
    k.noise("pink", "lowpass", 480, 0.3, 0.09);
    const crickets = k.tone("square", 4300, 0.012);
    k.lfo(23, 0.012, crickets.gain);
    k.every(0.7, 2.8, () => songbird(k, 3300));
    k.every(13, 26, () => {
      const t = k.ctx.currentTime;
      [0, 0.34, 0.62, 0.86].forEach((d, i) =>
        k.chirp(1250 - i * 120, 900 - i * 90, t + d, 0.26, 0.04, "triangle"),
      );
    });
  },
  // The roar of falls: nothing subtle about it.
  falls(k) {
    const roar = k.noise("brown", "lowpass", 950, 0.2, 1.05);
    k.lfo(0.17, 0.12, roar.gain.gain);
    k.noise("pink", "lowpass", 3200, 0.2, 0.42);
    const spray = k.noise("white", "highpass", 5200, 0.2, 0.035);
    k.lfo(0.31, 0.015, spray.gain.gain);
  },
  // Wind off the mountain over a city hum, traffic and a distant hoot.
  capetown(k) {
    const wind = k.noise("pink", "bandpass", 520, 1.3, 0.34);
    k.lfo(0.09, 260, wind.filter.frequency);
    k.lfo(0.13, 0.17, wind.gain.gain);
    k.tone("sine", 100, 0.05);
    k.tone("sine", 150, 0.024);
    k.noise("brown", "lowpass", 300, 0.2, 0.34);
    k.every(11, 24, () => (Math.random() < 0.5 ? gull(k) : hoot(k)));
  },
  // High wind, the sea a long way below and a bell somewhere.
  santorini(k) {
    const wind = k.noise("pink", "bandpass", 880, 1.1, 0.13);
    k.lfo(0.07, 300, wind.filter.frequency);
    waves(k, 0.08, 0.22);
    bell(k, 540, 0.05);
    k.every(7, 15, () => bell(k, 540, 0.05));
  },
  // Under water: all pressure and bubbles.
  reef(k) {
    k.noise("brown", "lowpass", 230, 0.4, 0.6);
    k.every(0.15, 1, () => {
      const f = pick(260, 620);
      k.chirp(f, f * 2.4, k.ctx.currentTime, pick(0.05, 0.13), 0.06);
    });
  },
};

function hoot({ ctx, chirp }: Kit) {
  const t = ctx.currentTime;
  chirp(330, 330, t, 0.42, 0.016, "sawtooth");
  chirp(415, 415, t, 0.42, 0.012, "sawtooth");
}

function noiseBuffer(ctx: AudioContext, kind: NoiseKind) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === "white") d[i] = w;
    else if (kind === "pink") {
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.963 * b1 + w * 0.2965164;
      b2 = 0.57 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
    } else {
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
  }
  return buf;
}

export class RadioAudio {
  private ctx: AudioContext;
  private master: GainNode;
  private bus: GainNode;
  private hiss: GainNode;
  private whistle: OscillatorNode;
  private whistleGain: GainNode;
  private buffers: Record<NoiseKind, AudioBuffer>;
  private current: { id: StationId; gain: GainNode; stop: () => void } | null = null;
  private on = false;

  constructor() {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    this.ctx = ctx;
    this.buffers = {
      white: noiseBuffer(ctx, "white"),
      pink: noiseBuffer(ctx, "pink"),
      brown: noiseBuffer(ctx, "brown"),
    };

    // The cabinet: a small speaker's range, with a little valve warmth, and a limiter so nothing ever shouts.
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const limit = ctx.createDynamicsCompressor();
    limit.threshold.value = -14;
    limit.ratio.value = 8;
    const low = ctx.createBiquadFilter();
    low.type = "highpass";
    low.frequency.value = 75;
    const high = ctx.createBiquadFilter();
    high.type = "lowpass";
    high.frequency.value = 6800;
    const warm = ctx.createBiquadFilter();
    warm.type = "peaking";
    warm.frequency.value = 900;
    warm.gain.value = 3;
    this.bus = ctx.createGain();
    this.bus
      .connect(low)
      .connect(warm)
      .connect(high)
      .connect(limit)
      .connect(this.master)
      .connect(ctx.destination);

    // Static between stations.
    const src = ctx.createBufferSource();
    src.buffer = this.buffers.white;
    src.loop = true;
    const shape = ctx.createBiquadFilter();
    shape.type = "bandpass";
    shape.frequency.value = 2300;
    shape.Q.value = 0.35;
    this.hiss = ctx.createGain();
    this.hiss.gain.value = 0;
    src.connect(shape).connect(this.hiss).connect(this.bus);
    src.start();

    // The whistle old sets make when they're nearly on a station: it falls as the needle closes in.
    this.whistle = ctx.createOscillator();
    this.whistleGain = ctx.createGain();
    this.whistleGain.gain.value = 0;
    this.whistle.connect(this.whistleGain).connect(this.bus);
    this.whistle.start();

    // Mains hum from the valves, always just there.
    const hum = ctx.createOscillator();
    hum.frequency.value = 100;
    const humGain = ctx.createGain();
    humGain.gain.value = 0.006;
    hum.connect(humGain).connect(this.bus);
    hum.start();
  }

  /** Must be called from the traveller's click: browsers hold the context suspended until then. */
  powerOn() {
    this.on = true;
    void this.ctx.resume();
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0.75, this.ctx.currentTime, 0.45); // the valves warming up
    this.clunk(0.5);
  }

  powerOff() {
    this.clunk(0.5);
    this.on = false;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.06);
    this.stopStation();
    window.setTimeout(() => {
      if (!this.on) void this.ctx.suspend();
    }, 400);
  }

  /** The tab went away, or came back. Goes silent without forgetting the switch's position. */
  setHidden(hidden: boolean) {
    if (!this.on) return;
    void (hidden ? this.ctx.suspend() : this.ctx.resume());
  }

  /** Where the needle is: the nearby station (null when there's none in range), its signal 0 to 1, and how far off. */
  tune(id: StationId | null, signal: number, off: number) {
    if (!this.on) return;
    if (id !== (this.current?.id ?? null)) {
      this.stopStation();
      if (id) this.startStation(id);
    }
    const t = this.ctx.currentTime;
    this.current?.gain.gain.setTargetAtTime(signal * signal * 0.9, t, 0.05);
    this.hiss.gain.setTargetAtTime((1 - signal) * 0.34 + 0.002, t, 0.04);
    const near = off > 0.14 && off < 1.05 ? Math.sin(((off - 0.14) / 0.91) * Math.PI) : 0;
    this.whistle.frequency.setTargetAtTime(180 + off * 1900, t, 0.03);
    this.whistleGain.gain.setTargetAtTime(near * 0.022, t, 0.04);
  }

  /** The tiny mechanical click of the dial turning. */
  tick() {
    if (this.on) this.burst(1900, 0.012, 0.09);
  }

  /** A push-button or switch going home. */
  clunk(vol = 0.35) {
    if (this.ctx.state === "suspended" && !this.on) return;
    this.burst(210, 0.05, vol);
    this.burst(1400, 0.012, vol * 0.4);
  }

  dispose() {
    this.on = false;
    this.stopStation();
    void this.ctx.close();
  }

  private burst(freq: number, dur: number, vol: number) {
    const { ctx } = this;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.buffers.white;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = 2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    src.connect(f).connect(g).connect(this.bus);
    src.start(t, Math.random() * 3);
    src.stop(t + dur + 0.02);
  }

  private stopStation() {
    this.current?.stop();
    this.current = null;
  }

  private startStation(id: StationId) {
    const { ctx } = this;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(this.bus);
    const running: AudioScheduledSourceNode[] = [];
    const timers = new Set<number>();
    let live = true;

    const kit: Kit = {
      ctx,
      out: gain,
      noise: (kind, type, freq, q, vol) => {
        const src = ctx.createBufferSource();
        src.buffer = this.buffers[kind];
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = freq;
        filter.Q.value = q;
        const g = ctx.createGain();
        g.gain.value = vol;
        src.connect(filter).connect(g).connect(gain);
        src.start(0, Math.random() * 3);
        running.push(src);
        return { gain: g, filter };
      },
      tone: (type, freq, vol) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = vol;
        osc.connect(g).connect(gain);
        osc.start();
        running.push(osc);
        return g;
      },
      lfo: (rate, depth, target) => {
        const osc = ctx.createOscillator();
        osc.frequency.value = rate;
        const g = ctx.createGain();
        g.gain.value = depth;
        osc.connect(g).connect(target);
        osc.start();
        running.push(osc);
      },
      every: (minS, maxS, fn) => {
        const again = () => {
          const id = window.setTimeout(
            () => {
              timers.delete(id);
              if (!live) return;
              fn();
              again();
            },
            pick(minS, maxS) * 1000,
          );
          timers.add(id);
        };
        again();
      },
      chirp: (f0, f1, at, dur, vol, type = "sine") => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(f0, at);
        osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), at + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.02, dur / 3));
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g).connect(gain);
        osc.start(at);
        osc.stop(at + dur + 0.03);
      },
    };
    RECIPES[id](kit);

    this.current = {
      id,
      gain,
      stop: () => {
        live = false;
        timers.forEach((t) => window.clearTimeout(t));
        timers.clear();
        const t = ctx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setTargetAtTime(0, t, 0.05);
        running.forEach((n) => {
          try {
            n.stop(t + 0.3);
          } catch {
            /* already stopped */
          }
        });
        window.setTimeout(() => gain.disconnect(), 450);
      },
    };
  }
}

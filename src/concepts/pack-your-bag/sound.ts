// Every sound on the page is made here from filtered noise and a few low tones, and only ever after a touch.
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let on = true;
let last = 0;

function audio() {
  if (!on || typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext;
    if (!AC) return null;
    ctx = new AC();
    noise = ctx.createBuffer(1, ctx.sampleRate / 2, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function burst(
  freq: number,
  q: number,
  vol: number,
  dur: number,
  type: BiquadFilterType = "lowpass",
) {
  const c = audio();
  if (!c || !noise) return;
  const src = c.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = 0.8 + Math.random() * 0.4;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start();
  src.stop(c.currentTime + dur);
}

function tone(from: number, to: number, vol: number, dur: number) {
  const c = audio();
  if (!c) return;
  const o = c.createOscillator();
  o.frequency.setValueAtTime(from, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(to, c.currentTime + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur);
}

const spaced = (ms: number) => {
  const now = performance.now();
  if (now - last < ms) return false;
  last = now;
  return true;
};

export const sound = {
  set(v: boolean) {
    on = v;
  },
  /** Something soft landing on linen. */
  thud(power: number) {
    if (spaced(35)) burst(320, 0.6, Math.min(0.16, power / 5000), 0.09);
  },
  /** Something landing in the case: leather and a little boing from the lining. */
  plop() {
    burst(520, 0.8, 0.14, 0.12);
    tone(170, 95, 0.1, 0.13);
  },
  /** Two things knocking together. */
  knock(power: number) {
    if (spaced(45)) burst(1100, 2.2, Math.min(0.1, power / 7000), 0.05, "bandpass");
  },
  /** One tooth of the zip. */
  tooth() {
    burst(3400, 4, 0.05, 0.022, "bandpass");
  },
  /** The lid coming down. */
  slam() {
    burst(240, 0.7, 0.3, 0.22);
    tone(120, 48, 0.22, 0.24);
  },
  /** Rubber stamp on paper. */
  stamp() {
    burst(800, 0.9, 0.2, 0.08);
    tone(90, 50, 0.16, 0.1);
  },
  /** A typewriter key. */
  key() {
    burst(2300, 3, 0.05, 0.03, "bandpass");
  },
};

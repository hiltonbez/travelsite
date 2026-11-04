// The lift's few sounds, all synthesised: the arrival bell, the doors' thud and the rumble of the ride.
// Nothing plays until the traveller has pressed something, and the bell switch on the panel turns it all off.
let ctx: AudioContext | null = null;

function audio() {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  a: AudioContext,
  freq: number,
  at: number,
  length: number,
  peak: number,
  type: OscillatorType = "sine",
) {
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + length);
  o.connect(g).connect(a.destination);
  o.start(at);
  o.stop(at + length + 0.02);
}

export function ding() {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + 0.01;
  tone(a, 1319, t, 1.5, 0.07);
  tone(a, 2637, t, 1.5, 0.022);
  tone(a, 3960, t, 1.5, 0.01);
}

export function thud() {
  const a = audio();
  if (!a) return;
  tone(a, 74, a.currentTime + 0.01, 0.28, 0.2);
  tone(a, 148, a.currentTime + 0.01, 0.1, 0.05, "triangle");
}

export function click() {
  const a = audio();
  if (a) tone(a, 880, a.currentTime + 0.005, 0.05, 0.035, "square");
}

/** The ride's low hum. Returns the function that fades it out. */
export function rumble(seconds: number) {
  const a = audio();
  if (!a) return () => {};
  const g = a.createGain();
  const t = a.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + Math.min(0.5, seconds / 3));
  const low = a.createOscillator();
  const high = a.createOscillator();
  low.frequency.value = 58;
  low.type = "sawtooth";
  high.frequency.value = 61;
  const f = a.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 170;
  low.connect(f);
  high.connect(f);
  f.connect(g).connect(a.destination);
  low.start();
  high.start();
  return () => {
    const end = a.currentTime;
    g.gain.cancelScheduledValues(end);
    g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), end);
    g.gain.exponentialRampToValueAtTime(0.0001, end + 0.3);
    low.stop(end + 0.32);
    high.stop(end + 0.32);
  };
}

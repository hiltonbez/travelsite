// The optional beat: a little four-to-the-floor groove built from oscillators and noise, scheduled ahead of time so it
// stays tight. Each mood fader brings in its own part. Nothing here runs until the traveller turns the beat on.

export type Beat = {
  /** How many beats have played, with fractions, so the meters can bounce in time. */
  pos: () => number;
  riser: () => void;
  hit: () => void;
  stop: () => void;
};

// A minor pentatonic for the plucks; Am, F, C, G for the pads.
const SCALE = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
const CHORDS = [
  [220, 261.63, 329.63],
  [174.61, 220, 261.63],
  [196, 261.63, 329.63],
  [196, 246.94, 293.66],
];
const ROOTS = [55, 43.65, 65.41, 49];
const PLUCK_STEPS = [0, 3, 6, 8, 11, 14];
const PLUCK_NOTES = [5, 3, 4, 2, 4, 7, 5, 1, 6, 4, 2, 3];
const CONGA_STEPS = [2, 5, 7, 10, 13, 15];

export function startBeat(levels: () => number[], bpm: () => number): Beat | null {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  const ctx = new Ctor();
  void ctx.resume();

  const master = ctx.createGain();
  master.gain.value = 0.8;
  const glue = ctx.createDynamicsCompressor();
  master.connect(glue).connect(ctx.destination);

  // A short echo for the plucks.
  const echo = ctx.createDelay(1);
  const echoBack = ctx.createGain();
  echoBack.gain.value = 0.32;
  echo.connect(echoBack).connect(echo);
  echo.connect(master);

  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const tone = (
    type: OscillatorType,
    from: number,
    to: number,
    at: number,
    len: number,
    peak: number,
    out: AudioNode = master,
  ) => {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, at);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, at + len * 0.6);
    amp.gain.setValueAtTime(peak, at);
    amp.gain.exponentialRampToValueAtTime(0.0008, at + len);
    osc.connect(amp).connect(out);
    osc.start(at);
    osc.stop(at + len + 0.02);
  };

  const hiss = (filter: BiquadFilterType, freq: number, at: number, len: number, peak: number) => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(peak, at);
    amp.gain.exponentialRampToValueAtTime(0.0008, at + len);
    src.connect(f).connect(amp).connect(master);
    src.start(at);
    src.stop(at + len + 0.02);
  };

  const pad = (notes: number[], at: number, len: number, peak: number) => {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 1100;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0008, at);
    amp.gain.linearRampToValueAtTime(peak, at + len * 0.2);
    amp.gain.setValueAtTime(peak, at + len * 0.7);
    amp.gain.linearRampToValueAtTime(0.0008, at + len);
    f.connect(amp).connect(master);
    for (const n of notes) {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = n;
      osc.detune.value = n % 7;
      osc.connect(f);
      osc.start(at);
      osc.stop(at + len + 0.02);
    }
  };

  let step = 0;
  let next = ctx.currentTime + 0.08;
  let stepLen = 60 / bpm() / 4;

  const play = (s: number, at: number) => {
    const [beach, adventure, luxury, culture, wildlife] = levels() as [
      number,
      number,
      number,
      number,
      number,
    ];
    if (beach + adventure + luxury + culture + wildlife < 0.02) return;
    const inBar = s % 16;
    const bar = Math.floor(s / 16) % 4;
    if (s % 4 === 0) tone("sine", 150, 44, at, 0.26, 0.5 + adventure * 0.45);
    if (s % 4 === 2) hiss("highpass", 7000, at, 0.06, 0.1 + adventure * 0.14);
    if (adventure > 0.45 && (inBar === 4 || inBar === 12))
      hiss("bandpass", 1900, at, 0.14, adventure * 0.3);
    const pluck = PLUCK_STEPS.indexOf(inBar);
    if (pluck >= 0 && beach > 0.03) {
      const note = SCALE[PLUCK_NOTES[(pluck + bar * 3) % PLUCK_NOTES.length]!]!;
      tone("triangle", note * 2, note * 2, at, 0.22, beach * 0.2, echo);
      tone("triangle", note * 2, note * 2, at, 0.2, beach * 0.14);
    }
    if (inBar === 0 && luxury > 0.03) pad(CHORDS[bar]!, at, stepLen * 16, luxury * 0.05);
    if (culture > 0.03) {
      if (CONGA_STEPS.includes(inBar))
        tone("sine", inBar % 5 === 0 ? 330 : 240, 170, at, 0.13, culture * 0.3);
      hiss("bandpass", 5200, at, 0.03, culture * 0.05);
    }
    if (wildlife > 0.03) {
      if (s % 8 === 0) tone("sine", ROOTS[bar]!, ROOTS[bar]!, at, stepLen * 7, wildlife * 0.32);
      if (s % 32 === 22) {
        tone("sine", 1900, 2800, at, 0.09, wildlife * 0.07);
        tone("sine", 2200, 3100, at + 0.12, 0.09, wildlife * 0.06);
      }
    }
  };

  const timer = window.setInterval(() => {
    while (next < ctx.currentTime + 0.14) {
      play(step, next);
      stepLen = 60 / bpm() / 4;
      next += stepLen;
      step += 1;
    }
  }, 25);

  return {
    pos: () => (step - Math.max(0, next - ctx.currentTime) / stepLen) / 4,
    riser: () => {
      const at = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = noise;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.Q.value = 3;
      f.frequency.setValueAtTime(300, at);
      f.frequency.exponentialRampToValueAtTime(7000, at + 1.3);
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.02, at);
      amp.gain.linearRampToValueAtTime(0.4, at + 1.3);
      amp.gain.linearRampToValueAtTime(0.0008, at + 1.4);
      src.connect(f).connect(amp).connect(master);
      src.start(at);
      src.stop(at + 1.45);
    },
    hit: () => {
      const at = ctx.currentTime;
      tone("sine", 120, 30, at, 0.9, 0.9);
      hiss("lowpass", 2400, at, 0.5, 0.35);
    },
    stop: () => {
      window.clearInterval(timer);
      void ctx.close();
    },
  };
}

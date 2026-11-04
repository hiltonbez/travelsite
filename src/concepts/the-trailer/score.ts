// The optional score, all made in Web Audio: each genre has a bed scheduled up front (so pausing is just suspending
// the audio clock) and a handful of one-shot cues the player fires on the cut. Nothing makes a sound until the
// traveller turns it on.
import type { Cue, Genre } from "./script";

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);
/** The array, read round and round. */
const loop = <T>(list: T[], i: number) => list[i % list.length] as T;

export class Score {
  private ctx: AudioContext;
  private master: GainNode;
  private bed: GainNode | null = null;
  private noiseBuf: AudioBuffer;

  constructor() {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.7;
    const comp = this.ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(this.ctx.destination);
    this.noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const data = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  resume() {
    void this.ctx.resume();
  }
  suspend() {
    void this.ctx.suspend();
  }
  close() {
    void this.ctx.close();
  }

  private tone(
    dest: AudioNode,
    type: OscillatorType,
    f: number,
    at: number,
    dur: number,
    vol: number,
    attack = 0.005,
    to?: number,
  ) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, at);
    if (to) o.frequency.exponentialRampToValueAtTime(to, at + dur);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(dest);
    o.start(at);
    o.stop(at + dur + 0.02);
  }

  private noise(
    dest: AudioNode,
    at: number,
    dur: number,
    vol: number,
    from: number,
    to: number,
    q = 1,
  ) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    s.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = q;
    f.frequency.setValueAtTime(from, at);
    f.frequency.exponentialRampToValueAtTime(to, at + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    s.connect(f).connect(g).connect(dest);
    s.start(at);
    s.stop(at + dur + 0.02);
  }

  /** Starts the genre's bed, `from` seconds in, so sound turned on mid-trailer joins at the right place. */
  startBed(genre: Genre, from: number, total: number) {
    this.stopBed();
    const bed = this.ctx.createGain();
    bed.connect(this.master);
    this.bed = bed;
    const now = this.ctx.currentTime + 0.05;
    const at = (t: number) => now + t - from;
    const each = (step: number, fn: (t: number, i: number) => void) => {
      for (let i = 0, t = 0; t < total; i++, t += step) if (t >= from) fn(at(t), i);
    };
    switch (genre) {
      case "action": {
        // A low pulse that tightens, under a long riser.
        each(0.5, (t, i) => this.tone(bed, "sine", i % 4 === 3 ? 62 : 48, t, 0.34, 0.5, 0.004, 32));
        if (from < total * 0.6) {
          const s = at(Math.max(from, 2));
          const e = at(total * 0.62);
          const o = this.ctx.createOscillator();
          o.type = "sawtooth";
          o.frequency.setValueAtTime(55, s);
          o.frequency.exponentialRampToValueAtTime(220, e);
          const f = this.ctx.createBiquadFilter();
          f.type = "lowpass";
          f.frequency.setValueAtTime(120, s);
          f.frequency.exponentialRampToValueAtTime(1800, e);
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.02, s);
          g.gain.exponentialRampToValueAtTime(0.14, e - 0.05);
          g.gain.linearRampToValueAtTime(0, e);
          o.connect(f).connect(g).connect(bed);
          o.start(s);
          o.stop(e + 0.02);
        }
        break;
      }
      case "romance": {
        // Slow pads moving through C, Am, F, G.
        const chords = [
          [60, 64, 67],
          [57, 60, 64],
          [53, 57, 60],
          [55, 59, 62],
        ];
        each(4, (t, i) => {
          for (const n of loop(chords, i)) this.tone(bed, "triangle", midi(n), t, 4.6, 0.09, 1.6);
          this.tone(bed, "sine", midi(loop(loop(chords, i), 0) - 24), t, 4.4, 0.16, 1.2);
          this.tone(bed, "sine", midi(loop(loop(chords, i), 2) + 12), t + 2, 1.8, 0.05, 0.3);
        });
        break;
      }
      case "comedy": {
        // Oom-pah pizzicato: mischievous and slightly too pleased with itself.
        const bass = [36, 43, 41, 43];
        const top = [67, 69, 72, 69, 67, 64, 65, 67];
        each(0.3, (t, i) => {
          if (i % 2 === 0) this.tone(bed, "triangle", midi(loop(bass, i / 2)), t, 0.22, 0.3);
          else this.tone(bed, "triangle", midi(60), t, 0.12, 0.09);
          if (i % 16 > 7) this.tone(bed, "square", midi(loop(top, i)), t, 0.1, 0.035);
        });
        break;
      }
      case "documentary": {
        // A hushed drone, and now and then a single bell.
        this.tone(bed, "sine", midi(38), at(from), Math.max(1, total - from), 0.2, 2);
        this.tone(bed, "triangle", midi(45), at(from), Math.max(1, total - from), 0.05, 4);
        each(5.5, (t, i) =>
          this.tone(bed, "sine", midi(loop([74, 69, 71, 67], i)), t + 1, 3, 0.06, 0.01),
        );
        break;
      }
      case "family": {
        // A marimba, skipping.
        const scale = [60, 64, 67, 72, 67, 64, 65, 69, 72, 69, 67, 71];
        each(0.24, (t, i) => {
          this.tone(bed, "sine", midi(loop(scale, i) + 12), t, 0.2, 0.13);
          if (i % 4 === 0) this.tone(bed, "triangle", midi(loop(scale, i) - 12), t, 0.3, 0.14);
        });
        break;
      }
    }
  }

  stopBed() {
    if (!this.bed) return;
    const old = this.bed;
    old.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
    window.setTimeout(() => old.disconnect(), 500);
    this.bed = null;
  }

  cue(c: Cue) {
    const t = this.ctx.currentTime;
    const m = this.master;
    switch (c) {
      case "hit":
        this.tone(m, "sine", 90, t, 0.7, 0.9, 0.004, 34);
        this.noise(m, t, 0.28, 0.5, 2400, 300);
        break;
      case "boom":
        this.tone(m, "sine", 70, t, 2.4, 1, 0.004, 24);
        this.tone(m, "sawtooth", 48, t, 1.4, 0.18, 0.004, 30);
        this.noise(m, t, 1.2, 0.5, 1600, 120);
        break;
      case "riser":
        this.tone(m, "sine", 60, t, 3, 0.25, 2.4, 240);
        break;
      case "scratch":
        this.noise(m, t, 0.12, 0.6, 3000, 700, 3);
        this.noise(m, t + 0.12, 0.14, 0.6, 700, 3600, 3);
        break;
      case "boing":
        this.tone(m, "sine", 180, t, 0.16, 0.4, 0.004, 620);
        this.tone(m, "sine", 620, t + 0.16, 0.3, 0.3, 0.004, 240);
        break;
      case "tick":
        this.noise(m, t, 0.05, 0.28, 3200, 2000, 2);
        break;
      case "chime":
        for (const [i, n] of [76, 83, 88].entries())
          this.tone(m, "sine", midi(n), t + i * 0.09, 1.4, 0.1);
        break;
      case "pop":
        this.tone(m, "sine", 300, t, 0.1, 0.4, 0.002, 900);
        break;
    }
  }
}

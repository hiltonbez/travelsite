// The bar's noises, made with Web Audio so there's nothing to download: a glugging pour, ice, a bell, a card on teak.
type AudioCtor = typeof AudioContext;

export class BarSound {
  muted = false;
  private ctx: AudioContext | null = null;
  private noise: AudioBuffer | null = null;
  private pourGain: GainNode | null = null;
  private pourSrc: AudioBufferSourceNode | null = null;
  private lfo: OscillatorNode | null = null;

  /** Browsers only allow sound after a touch, so every press calls this first. */
  wake() {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    const len = this.ctx.sampleRate;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  pour(on: boolean, hard = 0) {
    const c = this.ctx;
    if (!c || !this.noise) return;
    if (on && !this.muted) {
      if (!this.pourSrc) {
        const src = c.createBufferSource();
        src.buffer = this.noise;
        src.loop = true;
        const band = c.createBiquadFilter();
        band.type = "bandpass";
        band.frequency.value = 620;
        band.Q.value = 1.6;
        const gain = c.createGain();
        gain.gain.value = 0;
        const lfo = c.createOscillator();
        lfo.frequency.value = 7;
        const depth = c.createGain();
        depth.gain.value = 240;
        lfo.connect(depth).connect(band.frequency);
        src.connect(band).connect(gain).connect(c.destination);
        src.start();
        lfo.start();
        this.pourSrc = src;
        this.pourGain = gain;
        this.lfo = lfo;
      }
      this.pourGain?.gain.setTargetAtTime(0.1 + hard * 0.08, c.currentTime, 0.04);
    } else if (this.pourSrc) {
      const src = this.pourSrc;
      const lfo = this.lfo;
      this.pourGain?.gain.setTargetAtTime(0, c.currentTime, 0.05);
      this.pourSrc = null;
      this.lfo = null;
      src.stop(c.currentTime + 0.3);
      lfo?.stop(c.currentTime + 0.3);
    }
  }

  private tone(freq: number, peak: number, decay: number, delay = 0) {
    const c = this.ctx;
    if (!c || this.muted) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + decay + 0.02);
  }

  clink(strength = 0.5) {
    const f = 2600 + Math.random() * 1800;
    this.tone(f, 0.05 + strength * 0.07, 0.09);
    this.tone(f * 1.51, 0.02 + strength * 0.03, 0.05);
  }

  bell() {
    this.tone(1320, 0.1, 0.9);
    this.tone(1980, 0.05, 0.6);
    this.tone(1320, 0.07, 0.8, 0.16);
  }

  slide() {
    const c = this.ctx;
    if (!c || !this.noise || this.muted) return;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 1800;
    const g = c.createGain();
    g.gain.setValueAtTime(0.05, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.7);
    src.connect(f).connect(g).connect(c.destination);
    src.start();
    src.stop(c.currentTime + 0.72);
  }

  dispose() {
    this.pour(false);
    void this.ctx?.close();
    this.ctx = null;
  }
}

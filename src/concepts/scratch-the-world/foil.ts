// The scratch engine. A foil surface is four layers composed each frame: base metal, a holographic band that follows the
// pointer, the printed ink, and a mask the traveller wears away. Coverage is counted on a coarse grid, never read back
// from the canvas, so scratching stays cheap. Everything here runs in the browser only (effects and event handlers).

export type Tone = "gold" | "silver";

export type FoilOptions = {
  ink: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  tone?: Tone;
  /** Share of the surface that must be clear before the rest falls away. */
  threshold?: number;
  /** Brush radius in CSS pixels. */
  brush: number;
  /** Width of the coverage grid. */
  cols?: number;
  dprCap?: number;
  onReady?: () => void;
  onStart?: (fx: number, fy: number) => void;
  onProgress?: (p: number) => void;
  onClear?: () => void;
  onGone?: () => void;
};

const makeCanvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};
const ctx2d = (c: HTMLCanvasElement) => c.getContext("2d") as CanvasRenderingContext2D;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------- textures shared by every foil

let brushes: HTMLCanvasElement[] | null = null;
function getBrushes() {
  if (brushes) return brushes;
  brushes = [0, 1, 2, 3].map(() => {
    const c = makeCanvas(128, 128);
    const x = ctx2d(c);
    x.fillStyle = "#000";
    // A dense, crumbly middle, so one pass leaves a few islands of foil and a second pass takes them.
    for (let i = 0; i < 170; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * 46;
      x.beginPath();
      x.arc(64 + Math.cos(a) * d, 64 + Math.sin(a) * d, 3 + Math.random() * 9, 0, Math.PI * 2);
      x.fill();
    }
    // Torn specks around the edge.
    for (let i = 0; i < 60; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 46 + Math.random() * 16;
      x.beginPath();
      x.arc(64 + Math.cos(a) * d, 64 + Math.sin(a) * d, 0.6 + Math.random() * 2, 0, Math.PI * 2);
      x.fill();
    }
    return c;
  });
  return brushes;
}

let grain: HTMLCanvasElement | null = null;
let sparkle: HTMLCanvasElement | null = null;
function getGrain() {
  if (grain) return grain;
  grain = makeCanvas(256, 256);
  const x = ctx2d(grain);
  const img = x.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    // Stretched noise reads as brushed metal.
    const row = Math.floor(i / 4 / 256);
    const v = 128 + ((Math.sin(row * 12.9898) * 43758.5453) % 1) * 50 + (Math.random() - 0.5) * 60;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 60;
  }
  x.putImageData(img, 0, 0);
  return grain;
}
function getSparkle() {
  if (sparkle) return sparkle;
  sparkle = makeCanvas(256, 256);
  const x = ctx2d(sparkle);
  for (let i = 0; i < 110; i++) {
    const px = Math.random() * 256;
    const py = Math.random() * 256;
    const big = Math.random() < 0.14;
    x.fillStyle = `rgba(255,${235 + Math.random() * 20},${190 + Math.random() * 60},${big ? 0.95 : 0.55})`;
    if (big) {
      x.fillRect(px - 3, py - 0.5, 6, 1);
      x.fillRect(px - 0.5, py - 3, 1, 6);
    } else {
      x.fillRect(px, py, 1.2, 1.2);
    }
  }
  return sparkle;
}

const BASE_STOPS: Record<Tone, string[]> = {
  gold: [
    "#a8772a",
    "#f4d67e",
    "#fff3c2",
    "#d8a93f",
    "#c9ced2",
    "#f7e39a",
    "#b58428",
    "#ffeeb0",
    "#a8772a",
  ],
  silver: [
    "#8b9299",
    "#dfe4e8",
    "#ffffff",
    "#aab1b8",
    "#efd98f",
    "#e6eaee",
    "#8f969d",
    "#fbfcfd",
    "#8b9299",
  ],
};

function paintBase(x: CanvasRenderingContext2D, W: number, H: number, tone: Tone, dpr: number) {
  const g = x.createLinearGradient(0, 0, W, H);
  BASE_STOPS[tone].forEach((s, i, a) => g.addColorStop(i / (a.length - 1), s));
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = "overlay";
  const grainPattern = x.createPattern(getGrain(), "repeat");
  if (grainPattern) {
    x.fillStyle = grainPattern;
    x.fillRect(0, 0, W, H);
  }
  // The embossed diamond lattice of hologram foil.
  x.globalCompositeOperation = "soft-light";
  x.strokeStyle = "rgba(255,255,255,.5)";
  x.lineWidth = dpr;
  const step = 18 * dpr;
  x.beginPath();
  for (let i = -H; i < W + H; i += step) {
    x.moveTo(i, 0);
    x.lineTo(i + H, H);
    x.moveTo(i, H);
    x.lineTo(i + H, 0);
  }
  x.stroke();
  x.globalCompositeOperation = "source-over";
}

// ---------------------------------------------------------------- flecks: foil that sprays off, over the whole page

type Fleck = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  va: number;
  flip: number;
  vf: number;
  s: number;
  life: number;
  c: string;
};
const FLECK_COLOURS = ["#f6dc86", "#fff4c9", "#c9971f", "#e7ebee", "#ffffff", "#d0a43a"];

class Flecks {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private list: Fleck[] = [];
  private raf = 0;
  private last = 0;
  private w = 0;
  private h = 0;
  private dpr = 1;

  attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = ctx2d(canvas);
    this.fit();
    window.addEventListener("resize", this.fit);
  }

  detach() {
    window.removeEventListener("resize", this.fit);
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.list = [];
    this.canvas = null;
    this.ctx = null;
  }

  private fit = () => {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * this.dpr;
    this.canvas.height = this.h * this.dpr;
  };

  emit(x: number, y: number, dx: number, dy: number, n: number) {
    if (!this.ctx || reducedMotion()) return;
    for (let i = 0; i < n && this.list.length < 240; i++) {
      const spread = Math.random() * 2 - 1;
      this.list.push({
        x: x + spread * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: dx * (0.25 + Math.random() * 0.5) + spread * 190,
        vy: dy * (0.25 + Math.random() * 0.5) - 90 - Math.random() * 260,
        a: Math.random() * 6.28,
        va: (Math.random() - 0.5) * 16,
        flip: Math.random() * 6.28,
        vf: 7 + Math.random() * 14,
        s: 2 + Math.random() * Math.random() * 8,
        life: 0.8 + Math.random() * 0.9,
        c: FLECK_COLOURS[Math.floor(Math.random() * FLECK_COLOURS.length)] as string,
      });
    }
    if (!this.raf && this.list.length) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    }
  }

  private frame = (t: number) => {
    const x = this.ctx;
    if (!x) return;
    const dt = Math.min(0.04, (t - this.last) / 1000);
    this.last = t;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, this.w * this.dpr, this.h * this.dpr);
    const alive: Fleck[] = [];
    for (const f of this.list) {
      f.vy += 1300 * dt;
      f.vx *= 1 - 1.1 * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.a += f.va * dt;
      f.flip += f.vf * dt;
      f.life -= dt;
      if (f.life <= 0 || f.y > this.h + 20) continue;
      alive.push(f);
      const face = Math.cos(f.flip);
      const c = Math.cos(f.a) * this.dpr;
      const s = Math.sin(f.a) * this.dpr;
      x.setTransform(c, s, -s * face, c * face, f.x * this.dpr, f.y * this.dpr);
      x.globalAlpha = Math.min(1, f.life * 3);
      x.fillStyle = face > 0.2 ? f.c : "#7a5a14";
      x.fillRect(-f.s / 2, -f.s / 2, f.s, f.s * 0.7);
    }
    x.globalAlpha = 1;
    this.list = alive;
    this.raf = alive.length ? requestAnimationFrame(this.frame) : 0;
    if (!alive.length) {
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.clearRect(0, 0, this.w * this.dpr, this.h * this.dpr);
    }
  };
}

export const flecks = new Flecks();

// ---------------------------------------------------------------- sound: off until asked for

class ScratchSound {
  on = false;
  private ac: AudioContext | null = null;
  private gain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private quiet = 0;

  setOn(on: boolean) {
    this.on = on;
    if (on && !this.ac) this.build();
    if (on) void this.ac?.resume();
    if (!on) this.gain?.gain.setTargetAtTime(0, this.ac?.currentTime ?? 0, 0.02);
  }

  private build() {
    const ac = new AudioContext();
    const len = ac.sampleRate;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++)
      data[i] = (Math.random() * 2 - 1) * (Math.random() < 0.22 ? 1 : 0.25);
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3400;
    filter.Q.value = 0.8;
    const gain = ac.createGain();
    gain.gain.value = 0;
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start();
    this.ac = ac;
    this.gain = gain;
    this.filter = filter;
  }

  scratch(speed: number) {
    if (!this.on || !this.ac || !this.gain || !this.filter) return;
    const now = this.ac.currentTime;
    const level = Math.min(0.2, 0.05 + speed * 0.0001);
    this.gain.gain.setTargetAtTime(level, now, 0.015);
    this.filter.frequency.setTargetAtTime(2600 + Math.min(2600, speed * 1.4), now, 0.03);
    window.clearTimeout(this.quiet);
    this.quiet = window.setTimeout(
      () => this.gain?.gain.setTargetAtTime(0, this.ac?.currentTime ?? 0, 0.04),
      70,
    );
  }

  ting() {
    if (!this.on || !this.ac) return;
    const ac = this.ac;
    [880, 1318, 1760].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      const at = ac.currentTime + i * 0.09;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.11, at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
      o.connect(g).connect(ac.destination);
      o.start(at);
      o.stop(at + 0.55);
    });
  }
}

export const sound = new ScratchSound();

// ---------------------------------------------------------------- one clock and one pointer for all foil on the page

const live = new Set<Foil>();
const gloss = { x: -1, y: -1, tx: -1, ty: -1, moved: 0 };
let clock = 0;

const onGloss = (e: PointerEvent) => {
  gloss.tx = e.clientX;
  gloss.ty = e.clientY;
  if (gloss.x < 0) {
    gloss.x = gloss.tx;
    gloss.y = gloss.ty;
  }
  gloss.moved++;
};

function tick(t: number) {
  clock = requestAnimationFrame(tick);
  gloss.x += (gloss.tx - gloss.x) * 0.16;
  gloss.y += (gloss.ty - gloss.y) * 0.16;
  live.forEach((f) => f.frame(t));
}

function join(f: Foil) {
  live.add(f);
  if (!clock) {
    clock = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onGloss, { passive: true });
  }
}

function leave(f: Foil) {
  live.delete(f);
  if (!live.size && clock) {
    cancelAnimationFrame(clock);
    clock = 0;
    window.removeEventListener("pointermove", onGloss);
  }
}

// ---------------------------------------------------------------- the surface

type Shard = {
  img: HTMLCanvasElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  va: number;
  flip: number;
  vf: number;
  delay: number;
};

export class Foil {
  private ctx: CanvasRenderingContext2D;
  private o: FoilOptions;
  private base = makeCanvas(1, 1);
  private inkLayer = makeCanvas(1, 1);
  private mask = makeCanvas(1, 1);
  private lip = makeCanvas(1, 1);
  private w = 0;
  private h = 0;
  private dpr = 1;
  private cols: number;
  private rows = 0;
  private cells = new Uint8Array(0);
  private cleared = 0;
  private strokes = new Map<number, { x: number; y: number; t: number }>();
  private started = false;
  private state: "foil" | "falling" | "gone" = "foil";
  private visible = true;
  private dirty = true;
  private seenGloss = -1;
  private reduced: boolean;
  private shards: Shard[] = [];
  private fallStart = 0;
  private lastFall = 0;
  private origin: { x: number; y: number } | null = null;
  private io: IntersectionObserver;
  private ro: ResizeObserver;
  private fadeTimer = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    options: FoilOptions,
  ) {
    this.o = options;
    this.ctx = ctx2d(canvas);
    this.reduced = reducedMotion();
    this.cols = options.cols ?? 18;
    this.resize();

    canvas.addEventListener("pointerdown", this.down);
    canvas.addEventListener("pointermove", this.move);
    canvas.addEventListener("pointerup", this.up);
    canvas.addEventListener("pointercancel", this.up);

    this.io = new IntersectionObserver((es) => {
      this.visible = es.at(-1)?.isIntersecting ?? false;
    });
    this.io.observe(canvas);
    this.ro = new ResizeObserver(() => {
      const r = canvas.getBoundingClientRect();
      if (
        this.state === "foil" &&
        (Math.abs(r.width - this.w) > 1 || Math.abs(r.height - this.h) > 1)
      )
        this.resize();
    });
    this.ro.observe(canvas);

    document.fonts?.addEventListener("loadingdone", this.repaint);
    void document.fonts?.ready.then(this.repaint);

    join(this);
    this.frame(performance.now());
    options.onReady?.();
  }

  destroy() {
    leave(this);
    this.io.disconnect();
    this.ro.disconnect();
    window.clearTimeout(this.fadeTimer);
    document.fonts?.removeEventListener("loadingdone", this.repaint);
    this.canvas.removeEventListener("pointerdown", this.down);
    this.canvas.removeEventListener("pointermove", this.move);
    this.canvas.removeEventListener("pointerup", this.up);
    this.canvas.removeEventListener("pointercancel", this.up);
    this.state = "gone";
  }

  /** Lets the rest of the foil fall away, from a scratch or from the "Peel it all" button. */
  peel() {
    if (this.state !== "foil") return;
    this.state = "falling";
    this.strokes.clear();
    this.canvas.style.pointerEvents = "none";
    this.o.onProgress?.(1);
    this.o.onClear?.();
    sound.ting();
    if (this.reduced) {
      this.canvas.style.transition = "opacity .35s linear";
      this.canvas.style.opacity = "0";
      this.fadeTimer = window.setTimeout(() => this.finish(), 380);
      return;
    }
    this.buildShards();
  }

  private finish() {
    this.state = "gone";
    this.canvas.style.display = "none";
    leave(this);
    this.o.onGone?.();
  }

  private resize() {
    const r = this.canvas.getBoundingClientRect();
    this.w = r.width;
    this.h = r.height;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.o.dprCap ?? 2);
    const W = Math.max(1, Math.round(this.w * this.dpr));
    const H = Math.max(1, Math.round(this.h * this.dpr));
    const oldMask = this.mask;
    const oldLip = this.lip;
    const hadMask = this.rows > 0;
    this.canvas.width = W;
    this.canvas.height = H;
    this.base = makeCanvas(W, H);
    this.inkLayer = makeCanvas(W, H);
    this.mask = makeCanvas(W, H);
    this.lip = makeCanvas(W, H);
    paintBase(ctx2d(this.base), W, H, this.o.tone ?? "gold", this.dpr);
    this.repaint();
    const m = ctx2d(this.mask);
    const l = ctx2d(this.lip);
    if (hadMask) {
      // A rotated phone keeps what has already been scratched.
      m.drawImage(oldMask, 0, 0, W, H);
      l.drawImage(oldLip, 0, 0, W, H);
    } else {
      m.fillStyle = "#000";
      m.fillRect(0, 0, W, H);
      l.fillStyle = "#000";
      l.fillRect(0, 0, W, H);
      this.rows = Math.max(2, Math.round((this.cols * this.h) / Math.max(1, this.w)));
      this.cells = new Uint8Array(this.cols * this.rows);
    }
    this.dirty = true;
  }

  private repaint = () => {
    if (this.state !== "foil") return;
    const x = ctx2d(this.inkLayer);
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, this.inkLayer.width, this.inkLayer.height);
    x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.o.ink(x, this.w, this.h);
    this.dirty = true;
  };

  private pos(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private down = (e: PointerEvent) => {
    if (this.state !== "foil" || (e.pointerType === "mouse" && e.button !== 0)) return;
    const p = this.pos(e);
    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch {
      /* A pointer that's already gone needs no capture. */
    }
    this.strokes.set(e.pointerId, { ...p, t: e.timeStamp });
    if (!this.started) {
      this.started = true;
      this.o.onStart?.(p.x / this.w, p.y / this.h);
    }
    this.origin = p;
    this.stamp(p.x, p.y);
    flecks.emit(e.clientX, e.clientY, 0, 0, 6);
    this.afterScratch();
  };

  private move = (e: PointerEvent) => {
    const s = this.strokes.get(e.pointerId);
    if (!s || this.state !== "foil") return;
    const p = this.pos(e);
    const dx = p.x - s.x;
    const dy = p.y - s.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;
    const dt = Math.max(1, e.timeStamp - s.t) / 1000;
    const steps = Math.ceil(dist / (this.o.brush * 0.42));
    for (let i = 1; i <= steps; i++) this.stamp(s.x + (dx * i) / steps, s.y + (dy * i) / steps);
    const speed = dist / dt;
    flecks.emit(
      e.clientX,
      e.clientY,
      dx / dt / 6,
      dy / dt / 6,
      Math.min(9, 1 + Math.round(dist / 9)),
    );
    sound.scratch(speed);
    this.strokes.set(e.pointerId, { ...p, t: e.timeStamp });
    this.origin = p;
    this.afterScratch();
  };

  private up = (e: PointerEvent) => {
    this.strokes.delete(e.pointerId);
  };

  private stamp(x: number, y: number) {
    const set = getBrushes();
    const b = set[Math.floor(Math.random() * set.length)] as HTMLCanvasElement;
    const a = Math.random() * Math.PI * 2;
    const s = ((this.o.brush * (0.92 + Math.random() * 0.2)) / 58) * this.dpr;
    const c = Math.cos(a) * s;
    const d = Math.sin(a) * s;
    const X = x * this.dpr;
    const Y = y * this.dpr;
    const m = ctx2d(this.mask);
    m.globalCompositeOperation = "destination-out";
    m.setTransform(c, d, -d, c, X, Y);
    m.drawImage(b, -64, -64);
    // The lip is the same hole slightly lower: it draws the foil's thickness, a dark edge along the top of each scratch.
    const l = ctx2d(this.lip);
    l.globalCompositeOperation = "destination-out";
    l.setTransform(c, d, -d, c, X, Y + 2.5 * this.dpr);
    l.drawImage(b, -64, -64);

    const cw = this.w / this.cols;
    const ch = this.h / this.rows;
    const r = this.o.brush * 0.74;
    const c0 = Math.max(0, Math.floor((x - r) / cw));
    const c1 = Math.min(this.cols - 1, Math.floor((x + r) / cw));
    const r0 = Math.max(0, Math.floor((y - r) / ch));
    const r1 = Math.min(this.rows - 1, Math.floor((y + r) / ch));
    for (let j = r0; j <= r1; j++) {
      for (let i = c0; i <= c1; i++) {
        const k = j * this.cols + i;
        if (this.cells[k]) continue;
        if (Math.hypot((i + 0.5) * cw - x, (j + 0.5) * ch - y) <= r) {
          this.cells[k] = 1;
          this.cleared++;
        }
      }
    }
  }

  private afterScratch() {
    this.dirty = true;
    const p = this.cleared / this.cells.length;
    this.o.onProgress?.(p);
    if (p >= (this.o.threshold ?? 0.55)) this.peel();
  }

  private compose(t: number) {
    const c = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const r = this.canvas.getBoundingClientRect();
    const idle = this.reduced ? 0 : t * 0.00042;
    const scroll = window.scrollY * 0.005;
    const gx = gloss.x < 0 ? window.innerWidth / 2 : gloss.x;
    const gy = gloss.y < 0 ? window.innerHeight / 3 : gloss.y;
    const px = (gx - r.left + Math.sin(idle + scroll) * r.width * 0.3) * this.dpr;
    const py = (gy - r.top + Math.cos(idle * 0.8 + scroll) * r.height * 0.25) * this.dpr;

    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
    c.clearRect(0, 0, W, H);
    c.drawImage(this.base, 0, 0);

    // The holographic band: rainbow in a stripe across the pointer, leaning with where the pointer sits.
    const lean = 0.9 + ((gx - r.left) / Math.max(1, r.width)) * 0.7;
    const L = Math.hypot(W, H) * 0.3;
    const hx = Math.cos(lean) * L;
    const hy = Math.sin(lean) * L;
    const band = c.createLinearGradient(px - hx, py - hy, px + hx, py + hy);
    band.addColorStop(0, "rgba(255,255,255,0)");
    band.addColorStop(0.16, "rgba(255,70,150,.42)");
    band.addColorStop(0.32, "rgba(255,226,70,.5)");
    band.addColorStop(0.46, "rgba(255,255,255,.7)");
    band.addColorStop(0.58, "rgba(70,255,190,.42)");
    band.addColorStop(0.74, "rgba(70,170,255,.45)");
    band.addColorStop(0.88, "rgba(190,110,255,.32)");
    band.addColorStop(1, "rgba(255,255,255,0)");
    c.globalCompositeOperation = "overlay";
    c.fillStyle = band;
    c.fillRect(0, 0, W, H);

    // Glints that slide against the band.
    const glint = c.createPattern(getSparkle(), "repeat");
    if (glint) {
      const ox = -px * 0.12;
      const oy = -py * 0.12;
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.75;
      c.setTransform(this.dpr, 0, 0, this.dpr, ox, oy);
      c.fillStyle = glint;
      c.fillRect(-ox / this.dpr, -oy / this.dpr, W / this.dpr, H / this.dpr);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalAlpha = 1;
    }

    c.globalCompositeOperation = "source-over";
    c.drawImage(this.inkLayer, 0, 0);

    c.globalCompositeOperation = "destination-in";
    c.drawImage(this.mask, 0, 0);

    c.globalCompositeOperation = "destination-over";
    c.globalAlpha = 0.55;
    c.drawImage(this.lip, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
  }

  private buildShards() {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const snap = makeCanvas(W, H);
    ctx2d(snap).drawImage(this.canvas, 0, 0);
    const size = Math.max(70, Math.min(170, this.w / 7));
    const nx = Math.max(3, Math.round(this.w / size));
    const ny = Math.max(3, Math.round(this.h / size));
    const grid: [number, number][][] = [];
    const at = (j: number, i: number) => (grid[j] as [number, number][])[i] as [number, number];
    for (let j = 0; j <= ny; j++) {
      const row: [number, number][] = [];
      grid[j] = row;
      for (let i = 0; i <= nx; i++) {
        const edgeX = i === 0 || i === nx;
        const edgeY = j === 0 || j === ny;
        row[i] = [
          ((i + (edgeX ? 0 : (Math.random() - 0.5) * 0.7)) / nx) * W,
          ((j + (edgeY ? 0 : (Math.random() - 0.5) * 0.7)) / ny) * H,
        ];
      }
    }
    const ox = (this.origin?.x ?? this.w / 2) * this.dpr;
    const oy = (this.origin?.y ?? this.h) * this.dpr;
    const far = Math.hypot(W, H);
    this.shards = [];
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const poly = [at(j, i), at(j, i + 1), at(j + 1, i + 1), at(j + 1, i)];
        const xs = poly.map((q) => q[0]);
        const ys = poly.map((q) => q[1]);
        const bx = Math.floor(Math.min(...xs));
        const by = Math.floor(Math.min(...ys));
        const bw = Math.ceil(Math.max(...xs)) - bx + 1;
        const bh = Math.ceil(Math.max(...ys)) - by + 1;
        const img = makeCanvas(bw, bh);
        const s = ctx2d(img);
        s.beginPath();
        poly.forEach((q, n) =>
          n ? s.lineTo(q[0] - bx, q[1] - by) : s.moveTo(q[0] - bx, q[1] - by),
        );
        s.closePath();
        s.clip();
        s.drawImage(snap, -bx, -by);
        const cx = bx + bw / 2;
        const cy = by + bh / 2;
        const away = (cx - ox) / far;
        this.shards.push({
          img,
          x: cx,
          y: cy,
          vx: (away * 420 + (Math.random() - 0.5) * 160) * this.dpr,
          vy: (-60 - Math.random() * 180) * this.dpr,
          a: 0,
          va: (Math.random() - 0.5) * 5,
          flip: 0,
          vf: 2 + Math.random() * 6,
          // The break travels outward from the last scratch.
          delay: (Math.hypot(cx - ox, cy - oy) / far) * 420,
        });
      }
    }
    this.fallStart = this.lastFall = performance.now();
    const rect = this.canvas.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      flecks.emit(
        rect.left + Math.random() * rect.width,
        rect.top + Math.random() * rect.height,
        0,
        0,
        7,
      );
    }
  }

  private fall(t: number) {
    const c = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const dt = Math.min(0.1, (t - this.lastFall) / 1000);
    this.lastFall = t;
    const since = t - this.fallStart;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);
    let any = false;
    const g = 1700 * this.dpr * Math.max(0.7, Math.min(1, this.h / 600));
    for (const s of this.shards) {
      if (since > s.delay) {
        s.vy += g * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.a += s.va * dt;
        s.flip += s.vf * dt;
      }
      const hw = s.img.width / 2;
      const hh = s.img.height / 2;
      if (s.y - Math.max(hw, hh) * 1.5 > H) continue;
      any = true;
      const co = Math.cos(s.a);
      const si = Math.sin(s.a);
      const face = Math.cos(s.flip);
      c.setTransform(co, si, -si * face, co * face, s.x, s.y);
      c.drawImage(s.img, -hw, -hh);
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (!any) this.finish();
  }

  frame(t: number) {
    if (this.state === "falling" && this.shards.length) {
      this.fall(t);
      return;
    }
    if (this.state !== "foil" || !this.visible || !this.w) return;
    if (this.reduced && !this.dirty && this.seenGloss === gloss.moved) return;
    this.seenGloss = gloss.moved;
    this.dirty = false;
    this.compose(t);
  }
}

// The glass. Everything liquid is simulated and drawn here on one canvas: the pour, a spring-based surface, layers that
// settle, bubbles, ice, the shake, and the trip's footage bent through the liquid. React only tells it what to do.
import { ingredient, type IngredientId, type RGB, type Vols } from "./data";

export type Geometry = { w: number; h: number; gx: number; gt: number; gb: number; gw: number };

type Layer = { id: IngredientId; v: number; rgb: RGB };
type Pose = {
  id: IngredientId;
  el: HTMLElement;
  homeX: number;
  homeY: number;
  len: number;
  side: number;
  p: number;
  pv: number;
  target: number;
  holding: boolean;
  release: boolean;
  pouredFor: number;
  drive: number;
  mouthX: number;
  mouthY: number;
  angle: number;
};
type Stream = {
  id: IngredientId;
  rgb: RGB;
  x: number;
  top: number;
  head: number;
  tail: number;
  on: boolean;
  hard: number;
  age: number;
};
type Bubble = { x: number; y: number; r: number; v: number; ph: number };
type Wisp = { x: number; y: number; vx: number; vy: number; r: number; life: number; rgb: RGB };
type Drop = { x: number; y: number; vx: number; vy: number; r: number; rgb: RGB };
type Ice = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; s: number };

export type SimEvents = {
  onChange: (vols: Vols, total: number) => void;
  onFull: () => void;
  onFirstPour: (id: IngredientId) => void;
  onHardPour: () => void;
  onPourEnd: (id: IngredientId) => void;
  onStream: (on: boolean, hard: number) => void;
  onClink: (strength: number) => void;
  onShakeGesture: () => void;
  onShaken: () => void;
  onAutoDone: () => void;
  bottleEl: (id: IngredientId) => HTMLElement | null;
  onGlassMove: (x: number, y: number, rot: number) => void;
};

const N = 32;
const FILL = 0.9; // the most of the glass's inner height the liquid can reach
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smooth = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const css = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

export class BarSim {
  reduced = false;
  video: HTMLVideoElement | null = null;
  poster: HTMLImageElement | null = null;

  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private geo: Geometry = { w: 0, h: 0, gx: 0, gt: 0, gb: 0, gw: 0 };
  private raf = 0;
  private last = 0;
  private time = 0;
  private acc = 0;

  private layers: Layer[] = [];
  private total = 0;
  private drain = 1;
  private draining = false;
  private h = new Float32Array(N);
  private v = new Float32Array(N);
  private slosh = 0;
  private sv = 0;

  private ox = 0;
  private ov = 0;
  private oy = 0;
  private rot = 0;
  private dragging = false;
  private dragX = 0;
  private dragStart = 0;
  private dragDir = 0;
  private dragFlips = 0;
  private dragFlipAt = 0;

  private poses = new Map<IngredientId, Pose>();
  private streams: Stream[] = [];
  private bubbles: Bubble[] = [];
  private wisps: Wisp[] = [];
  private drops: Drop[] = [];
  private ice: Ice[] = [];
  private queue: { id: IngredientId; dur: number }[] = [];
  private queueT = 0;
  private autoOn = false;
  private seen = new Set<IngredientId>();
  private fullSaid = false;
  private hardSaid = false;
  private lastEmit = 0;
  private lastClink = 0;

  private shakeT = -1;
  private mix = 0;
  private foam = 0;
  private swirl = 0;
  private mixRgb: RGB = [255, 200, 120];

  private frame: HTMLCanvasElement;
  private fctx: CanvasRenderingContext2D;
  private frameFade = 0;
  private frameTick = 0;
  private hasFrame = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private ev: SimEvents,
  ) {
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.frame = document.createElement("canvas");
    this.frame.width = 220;
    this.frame.height = 460;
    this.fctx = this.frame.getContext("2d") as CanvasRenderingContext2D;
  }

  resize(g: Geometry) {
    this.geo = g;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(g.w * this.dpr);
    this.canvas.height = Math.round(g.h * this.dpr);
    this.draw();
  }

  start() {
    if (this.raf) return;
    this.last = performance.now();
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - this.last) / 1000, 0.05);
      this.last = now;
      this.time += dt;
      this.update(dt);
      this.draw();
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** The trip showing through the glass has changed: fade the new footage in over the old. */
  footageChanged() {
    this.frameFade = 1.2;
  }

  // ---- the pour ----

  get canPour() {
    return this.shakeT < 0 && this.mix === 0 && !this.draining;
  }
  get isShaking() {
    return this.shakeT >= 0;
  }

  startPour(id: IngredientId, el: HTMLElement, drive = 0) {
    if (!this.canPour) return;
    for (const p of this.poses.values()) if (p.id !== id) this.endPose(p);
    let pose = this.poses.get(id);
    if (!pose) {
      const stage = this.canvas.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const homeX = r.left + r.width / 2 - stage.left;
      pose = {
        id,
        el,
        homeX,
        homeY: r.top + r.height / 2 - stage.top,
        len: r.height,
        side: homeX <= this.geo.gx ? 1 : -1,
        p: 0,
        pv: 0,
        target: 1,
        holding: true,
        release: false,
        pouredFor: 0,
        drive,
        mouthX: 0,
        mouthY: 0,
        angle: 0,
      };
      this.poses.set(id, pose);
      (el.parentElement as HTMLElement).style.zIndex = "3";
    }
    pose.target = 1;
    pose.holding = true;
    pose.release = false;
    pose.pouredFor = 0;
    pose.drive = drive;
    this.hardSaid = false;
    if (!this.seen.has(id)) {
      this.seen.add(id);
      this.ev.onFirstPour(id);
    }
  }

  setDrive(id: IngredientId, drive: number) {
    const p = this.poses.get(id);
    if (p) p.drive = clamp(drive, 0, 1);
  }

  stopPour(id: IngredientId) {
    const p = this.poses.get(id);
    if (p) p.release = true;
  }

  private endPose(p: Pose) {
    if (p.holding) this.ev.onPourEnd(p.id);
    p.holding = false;
    p.target = 0;
    p.release = false;
    for (const s of this.streams) if (s.id === p.id) s.on = false;
    this.ev.onStream(false, 0);
    this.emit(true);
  }

  /** The barman pours for you: a list of bottles and how long each one runs. */
  autoPour(list: { id: IngredientId; dur: number }[]) {
    this.queue = [...list];
    this.queueT = 0;
    this.autoOn = true;
  }

  private add(id: IngredientId, amount: number) {
    const room = 1 - this.total;
    const a = Math.min(amount, room);
    if (a <= 0) return;
    const top = this.layers[this.layers.length - 1];
    if (top && (top.id === id || this.layers.length >= 14)) top.v += a;
    else this.layers.push({ id, v: a, rgb: ingredient(id).rgb });
    this.total += a;
    this.computeMix();
  }

  private computeMix() {
    let r = 0,
      g = 0,
      b = 0,
      t = 0;
    for (const l of this.layers) {
      r += l.rgb[0] * l.v;
      g += l.rgb[1] * l.v;
      b += l.rgb[2] * l.v;
      t += l.v;
    }
    if (!t) return;
    r /= t;
    g /= t;
    b /= t;
    const avg = (r + g + b) / 3;
    const boost = 1.45; // averaged colours go muddy, so push the blend back towards something you'd want to drink
    this.mixRgb = [
      clamp(avg + (r - avg) * boost, 0, 255),
      clamp(avg + (g - avg) * boost, 0, 255),
      clamp(avg + (b - avg) * boost, 0, 255),
    ];
  }

  vols(): Vols {
    const out: Vols = {};
    for (const l of this.layers) out[l.id] = (out[l.id] ?? 0) + l.v;
    return out;
  }

  private emit(force = false) {
    if (!force && this.time - this.lastEmit < 0.12) return;
    this.lastEmit = this.time;
    this.ev.onChange(this.vols(), this.total);
  }

  // ---- the glass in your hand ----

  grab(x: number) {
    this.dragging = true;
    this.dragStart = x - this.ox;
    this.dragX = this.ox;
    this.dragFlips = 0;
  }

  move(x: number) {
    if (!this.dragging) return;
    const lim = this.geo.gw * 0.8;
    const raw = x - this.dragStart;
    this.dragX = clamp(raw, -lim, lim);
  }

  release() {
    this.dragging = false;
  }

  // ---- shake, tip, serve ----

  shake() {
    if (this.shakeT >= 0 || this.total < 0.02) return;
    for (const p of this.poses.values()) this.endPose(p);
    this.shakeT = 0;
    this.computeMix();
    this.addIce();
  }

  private addIce() {
    const { gw, gb, gt } = this.geo;
    const h = gb - gt;
    this.ice = [];
    for (let i = 0; i < 4; i++) {
      this.ice.push({
        x: (i - 1.5) * gw * 0.16,
        y: -h - 30 - i * 44,
        vx: 0,
        vy: 0,
        rot: i * 0.7,
        vr: (i % 2 ? -1 : 1) * 2,
        s: gw * 0.24,
      });
    }
  }

  /** Fills the glass with a finished cocktail at once: a house cocktail ordered from the list. */
  fill(recipe: Vols) {
    this.layers = [];
    this.total = 0;
    for (const [id, v] of Object.entries(recipe) as [IngredientId, number][]) this.add(id, v);
    this.mix = 1;
    this.foam = 1;
    this.swirl = 0.3;
    this.shakeT = -1;
    this.draining = false;
    this.drain = 1;
    this.addIce();
    const { gt, gb } = this.geo;
    this.ice.forEach((c, i) => {
      c.y = -(gb - gt) * 0.3 - i * 20;
    });
    this.emit(true);
    for (let i = 0; i < N; i++) this.v[i]! += Math.sin(i * 0.8) * 60;
  }

  tipOut() {
    for (const p of this.poses.values()) this.endPose(p);
    this.queue = [];
    this.autoOn = false;
    this.draining = true;
    this.shakeT = -1;
  }

  private cleared() {
    this.layers = [];
    this.total = 0;
    this.drain = 1;
    this.draining = false;
    this.mix = 0;
    this.foam = 0;
    this.swirl = 0;
    this.ice = [];
    this.wisps = [];
    this.bubbles = [];
    this.seen.clear();
    this.fullSaid = false;
    this.hasFrame = false;
    this.emit(true);
  }

  // ---- each frame ----

  private surfaceAt(localX: number) {
    const { gw } = this.geo;
    const i = clamp(((localX + gw / 2) / gw) * (N - 1), 0, N - 1);
    const a = i | 0;
    const f = i - a;
    const b = Math.min(a + 1, N - 1);
    return lerp(this.h[a]!, this.h[b]!, f) + this.slosh * (localX / (gw / 2));
  }

  private innerH() {
    const { gt, gb } = this.geo;
    return (gb - gt) * 0.92;
  }
  private floorY() {
    const { gt, gb } = this.geo;
    return -(gb - gt) * 0.075;
  }
  private levelY(vol: number) {
    return this.floorY() - vol * this.drain * this.innerH() * FILL;
  }
  private halfAt(y: number) {
    const { gt, gb, gw } = this.geo;
    const t = clamp(-y / (gb - gt), 0, 1);
    return (gw / 2) * lerp(0.76, 1, t) - 3;
  }

  private update(dt: number) {
    if (this.geo.gw <= 0) return;
    const { gw } = this.geo;
    const unit = gw / 110;
    if (this.draining) {
      this.drain -= dt * 2.6;
      if (this.drain <= 0) this.cleared();
    }

    // the barman's own pours
    if (this.autoOn) {
      this.queueT -= dt;
      const pouring = [...this.poses.values()].some((p) => p.holding);
      if (!pouring && this.queueT <= 0) {
        const next = this.queue.shift();
        if (next) {
          const el = this.ev.bottleEl(next.id);
          if (el) {
            this.startPour(next.id, el, 0.2);
            const pose = this.poses.get(next.id);
            if (pose) {
              pose.pouredFor = -next.dur;
              pose.release = true;
            }
          }
          this.queueT = 0.2;
        } else if (!this.poses.size && !this.streams.length) {
          this.autoOn = false;
          this.ev.onAutoDone();
        }
      }
    }

    // bottles
    const level = this.levelY(this.total);
    const { gb } = this.geo;
    for (const p of [...this.poses.values()]) {
      const stiff = this.reduced ? 170 : 120;
      p.pv += ((p.target - p.p) * stiff - p.pv * (this.reduced ? 26 : 17)) * dt;
      p.p += p.pv * dt;
      const e = clamp(p.p, 0, 1.08);
      const finalDeg = 108 + p.drive * 26;
      const deg = p.side * finalDeg * smooth((e - 0.25) / 0.75);
      const rad = (finalDeg * Math.PI) / 180;
      const mx = this.geo.gx - p.side * gw * 0.13;
      const my = this.geo.gt - 12 * unit;
      const cx = mx - p.side * (p.len / 2) * Math.sin(rad);
      const cy = my + (p.len / 2) * Math.cos(rad);
      const dx = (cx - p.homeX) * e;
      const dy = (cy - p.homeY) * e - Math.sin(clamp(e, 0, 1) * Math.PI) * 26;
      p.el.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) rotate(${deg.toFixed(1)}deg)`;
      p.angle = (deg * Math.PI) / 180;
      p.mouthX = p.homeX + dx + (p.len / 2) * Math.sin(p.angle);
      p.mouthY = p.homeY + dy - (p.len / 2) * Math.cos(p.angle);

      if (p.holding && p.p > 0.86) {
        let s = this.streams.find((x) => x.id === p.id && x.on);
        if (!s) {
          s = {
            id: p.id,
            rgb: ingredient(p.id).rgb,
            x: p.mouthX,
            top: p.mouthY,
            head: p.mouthY,
            tail: p.mouthY,
            on: true,
            hard: p.drive,
            age: 0,
          };
          this.streams.push(s);
          this.ev.onStream(true, p.drive);
        }
        s.x = p.mouthX;
        s.top = p.mouthY;
        s.tail = p.mouthY;
        s.hard = p.drive;
        p.pouredFor += dt;
        if (p.drive > 0.7 && !this.hardSaid) {
          this.hardSaid = true;
          this.ev.onHardPour();
        }
        if (this.total >= 0.995) {
          if (!this.fullSaid) {
            this.fullSaid = true;
            this.ev.onFull();
          }
          this.endPose(p);
        } else if (p.release && p.pouredFor >= 0.4) {
          this.endPose(p);
        }
      }
      if (!p.holding && p.p < 0.012 && Math.abs(p.pv) < 0.05) {
        p.el.style.transform = "";
        (p.el.parentElement as HTMLElement).style.zIndex = "";
        this.poses.delete(p.id);
      }
    }

    // streams, and what happens where they land
    for (const s of this.streams) {
      s.age += dt;
      const land = gb + this.oy + level + this.surfaceAt(s.x - this.geo.gx - this.ox) - 1;
      if (s.head < land) s.head = Math.min(land, s.head + (280 + s.age * 2200) * unit * dt);
      else s.head = land;
      if (!s.on) s.tail = Math.min(land, s.tail + 1000 * unit * dt);
      const landed = s.head >= land - 0.5;
      if (landed && (s.on || s.tail < land)) {
        const rate = 0.095 * (1 + s.hard * 1.5);
        this.add(s.id, rate * dt);
        this.impact(s, dt, land);
      }
    }
    this.streams = this.streams.filter((s) => s.on || s.tail < s.head - 1);
    this.emit();

    // the glass itself
    const prevOv = this.ov;
    if (this.dragging) {
      const nv = (this.dragX - this.ox) / Math.max(dt, 0.008);
      this.ov = lerp(this.ov, nv, 0.5);
      this.ox += this.ov * dt;
      const dir = Math.sign(this.ov);
      if (dir && dir !== this.dragDir && Math.abs(this.ov) > 220 * unit) {
        this.dragDir = dir;
        this.dragFlips = this.time - this.dragFlipAt < 0.6 ? this.dragFlips + 1 : 1;
        this.dragFlipAt = this.time;
        if (this.dragFlips >= 6) {
          this.dragFlips = 0;
          this.ev.onShakeGesture();
        }
      }
    } else {
      this.ov += (-this.ox * 150 - this.ov * 15) * dt;
      this.ox += this.ov * dt;
    }
    const accel = clamp((this.ov - prevOv) / Math.max(dt, 0.008), -9000, 9000);
    this.sv -= accel * 0.0065 * (this.reduced ? 0.3 : 1);
    this.rot = clamp(this.ov * 0.00016, -0.09, 0.09);
    this.oy = 0;

    // the shake
    if (this.shakeT >= 0) this.updateShake(dt, unit);

    // the surface: a row of springs, stepped at a fixed rate so it stays stable
    const substep = 1 / 120;
    this.acc = Math.min(this.acc + dt, substep * 5);
    while (this.acc >= substep) {
      this.acc -= substep;
      for (let i = 0; i < N; i++) {
        const l = this.h[i > 0 ? i - 1 : 0]!;
        const r = this.h[i < N - 1 ? i + 1 : N - 1]!;
        const a = (l + r - 2 * this.h[i]!) * 9000 - this.h[i]! * 26 - this.v[i]! * 2.8;
        this.v[i]! += a * substep;
      }
      for (let i = 0; i < N; i++)
        this.h[i]! = clamp(this.h[i]! + this.v[i]! * substep, -16 * unit, 16 * unit);
      this.sv += (-this.slosh * 110 - this.sv * 2.3) * substep;
      this.slosh = clamp(this.slosh + this.sv * substep, -gw * 0.24, gw * 0.24);
    }

    this.updateParticles(dt, level, unit);

    if (this.swirl > 0.26 && this.shakeT < 0) this.swirl = Math.max(0.26, this.swirl - dt * 0.35);
    if (this.frameFade > 0) this.frameFade -= dt;
    this.ev.onGlassMove(this.ox, this.oy, this.rot);
  }

  private impact(s: Stream, dt: number, land: number) {
    const { gx, gb, gw } = this.geo;
    const unit = gw / 110;
    const lx = s.x - gx - this.ox;
    const i = clamp(Math.round(((lx + gw / 2) / gw) * (N - 1)), 0, N - 1);
    const force = (1 + s.hard * 2.4) * unit;
    if (!this.reduced) {
      this.v[i]! += (Math.random() * 90 + 40) * force * dt * 12;
      if (i > 0) this.v[i - 1]! += 20 * force * dt * 12;
      if (i < N - 1) this.v[i + 1]! += 20 * force * dt * 12;
      this.sv += (Math.random() - 0.5) * s.hard * 90 * dt * 12 * unit * 0.3;
    }
    const n = dt * 60 * (0.25 + s.hard * 0.8);
    if (this.bubbles.length < 70 && Math.random() < n) {
      this.bubbles.push({
        x: lx + (Math.random() - 0.5) * 12 * unit,
        y: land - gb + (10 + Math.random() * 30) * unit,
        r: (0.8 + Math.random() * 2.2) * unit,
        v: (30 + Math.random() * 60) * unit,
        ph: Math.random() * 6,
      });
    }
    if (this.wisps.length < 36 && Math.random() < dt * 34) {
      this.wisps.push({
        x: lx,
        y: land - gb + 3,
        vx: (Math.random() - 0.5) * 34 * unit,
        vy: (90 + Math.random() * 90 + s.hard * 120) * unit,
        r: (5 + Math.random() * 7) * unit,
        life: 1,
        rgb: s.rgb,
      });
    }
    if (!this.reduced && this.drops.length < 40 && Math.random() < dt * (10 + s.hard * 70)) {
      this.drops.push({
        x: s.x,
        y: land - 2,
        vx: (Math.random() - 0.5) * 130 * unit * (1 + s.hard),
        vy: -(70 + Math.random() * 130 * (1 + s.hard)) * unit,
        r: (1 + Math.random() * 1.6) * unit,
        rgb: s.rgb,
      });
    }
  }

  private updateShake(dt: number, unit: number) {
    const { gw } = this.geo;
    this.shakeT += dt;
    const t = this.shakeT;
    if (this.reduced) {
      this.mix = smooth(t / 1);
      this.swirl = 0.3 * this.mix;
      this.foam = this.mix;
      if (t >= 1.1) this.finishShake();
      return;
    }
    const on = smooth((t - 0.8) / 0.2) * (1 - smooth((t - 2.35) / 0.2));
    if (on > 0) {
      const a = Math.sin(t * 34);
      const target = a * gw * 0.17 * on;
      const prev = this.ox;
      this.ox = target;
      this.ov = (this.ox - prev) / Math.max(dt, 0.008);
      this.oy = -Math.abs(Math.sin(t * 17)) * 16 * unit * on - 14 * unit * on;
      this.rot = Math.sin(t * 34 + 0.8) * 0.085 * on;
      this.sv += Math.cos(t * 34) * 1400 * unit * dt;
      for (let i = 0; i < N; i++) this.v[i]! += (Math.random() - 0.5) * 1100 * unit * dt;
      if (this.bubbles.length < 70 && Math.random() < dt * 40) {
        const y =
          this.levelY(this.total) + Math.random() * (this.floorY() - this.levelY(this.total));
        this.bubbles.push({
          x: (Math.random() - 0.5) * gw * 0.7,
          y,
          r: (0.8 + Math.random() * 2) * unit,
          v: (40 + Math.random() * 40) * unit,
          ph: Math.random() * 6,
        });
      }
    }
    this.mix = smooth((t - 0.85) / 1.25);
    this.swirl = Math.sin(clamp((t - 0.7) / 2.0, 0, 1) * Math.PI) * 0.75 + this.mix * 0.3;
    this.foam = smooth((t - 1.4) / 1);
    if (t >= 2.85) this.finishShake();
  }

  private finishShake() {
    this.shakeT = -1;
    this.mix = 1;
    this.ox = 0;
    this.ov = 0;
    this.oy = 0;
    this.rot = 0;
    this.ev.onClink(0.8);
    this.ev.onShaken();
  }

  private clink(strength: number) {
    if (this.time - this.lastClink < 0.055) return;
    this.lastClink = this.time;
    this.ev.onClink(clamp(strength, 0, 1));
  }

  private updateParticles(dt: number, level: number, unit: number) {
    const { gw, gb, gt } = this.geo;
    const floor = this.floorY();
    const wob = (x: number) => level + this.surfaceAt(x);

    for (const b of this.bubbles) {
      b.y -= b.v * dt;
      b.x += Math.sin(this.time * 4 + b.ph) * 8 * unit * dt;
    }
    this.bubbles = this.bubbles.filter((b) => b.y > wob(b.x));
    if (this.mix === 1 && this.bubbles.length < 10 && Math.random() < dt * 3) {
      this.bubbles.push({
        x: (Math.random() - 0.5) * gw * 0.6,
        y: floor - 2,
        r: (0.7 + Math.random() * 1.4) * unit,
        v: (24 + Math.random() * 30) * unit,
        ph: Math.random() * 6,
      });
    }

    for (const w of this.wisps) {
      w.vy -= 170 * unit * dt;
      w.vy *= 1 - 1.4 * dt;
      w.x += w.vx * dt;
      w.y += w.vy * dt;
      w.r += 13 * unit * dt;
      w.life -= dt * 0.72;
      if (w.y > floor - w.r * 0.4) {
        w.y = floor - w.r * 0.4;
        w.vy *= -0.2;
      }
    }
    this.wisps = this.wisps.filter((w) => w.life > 0);

    for (const d of this.drops) {
      d.vy += 900 * unit * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
    }
    const surfW = gb + level;
    this.drops = this.drops.filter((d) => {
      const inside = Math.abs(d.x - this.geo.gx - this.ox) < gw / 2;
      if (inside) return d.vy < 0 || d.y < surfW;
      return d.y < gb + 8;
    });

    // ice: falls in, bobs up to the surface, knocks against everything
    const h = gb - gt;
    const shaking = this.shakeT > 0.75 && this.shakeT < 2.4;
    for (const c of this.ice) {
      const surf = wob(c.x);
      const inLiquid = c.y > surf + c.s * 0.15 && this.total > 0.01;
      c.vy += (inLiquid ? -560 : 1000) * unit * dt;
      if (inLiquid) {
        c.vx *= 1 - 3 * dt;
        c.vy *= 1 - 3.4 * dt;
        c.vr *= 1 - 2 * dt;
      }
      if (shaking) {
        c.vx += (Math.random() - 0.5) * 3800 * unit * dt - this.ov * 2.2 * dt;
        c.vy += (Math.random() - 0.5) * 3800 * unit * dt;
        c.vr += (Math.random() - 0.5) * 30 * dt;
      }
      const wasInAir = c.y < -h;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.rot += c.vr * dt;
      if (wasInAir) continue;
      const half = this.halfAt(c.y) - c.s * 0.5;
      if (c.x < -half) {
        if (c.vx < -40 * unit) this.clink(Math.abs(c.vx) / (500 * unit));
        c.x = -half;
        c.vx = Math.abs(c.vx) * 0.5;
      }
      if (c.x > half) {
        if (c.vx > 40 * unit) this.clink(Math.abs(c.vx) / (500 * unit));
        c.x = half;
        c.vx = -Math.abs(c.vx) * 0.5;
      }
      if (c.y > floor - c.s * 0.55) {
        if (c.vy > 70 * unit) this.clink(c.vy / (500 * unit));
        c.y = floor - c.s * 0.55;
        c.vy = -Math.abs(c.vy) * 0.35;
      }
      if (c.y < -h + c.s * 0.7 && shaking) {
        c.y = -h + c.s * 0.7;
        c.vy = Math.abs(c.vy) * 0.5;
      }
    }
    for (let i = 0; i < this.ice.length; i++) {
      for (let j = i + 1; j < this.ice.length; j++) {
        const a = this.ice[i]!,
          b = this.ice[j]!;
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const min = (a.s + b.s) * 0.5;
        if (d < min) {
          const nx = dx / d,
            ny = dy / d,
            push = (min - d) / 2;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
          const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rel < 0) {
            if (rel < -60 * unit) this.clink(-rel / (500 * unit));
            const imp = rel * 0.6;
            a.vx += nx * imp;
            a.vy += ny * imp;
            b.vx -= nx * imp;
            b.vy -= ny * imp;
          }
        }
      }
    }
  }

  // ---- drawing ----

  private updateFrame() {
    const v = this.video;
    this.frameTick++;
    if (this.hasFrame && this.frameFade <= 0 && this.frameTick % 2) return;
    let src: CanvasImageSource | null = null;
    let sw = 0,
      sh = 0;
    if (v && v.readyState >= 2 && v.videoWidth) {
      src = v;
      sw = v.videoWidth;
      sh = v.videoHeight;
    } else if (this.poster?.complete && this.poster.naturalWidth) {
      src = this.poster;
      sw = this.poster.naturalWidth;
      sh = this.poster.naturalHeight;
    }
    if (!src) return;
    // a wide slice squeezed into a tall frame: a full glass does the same to whatever is behind it
    const aspect = (this.frame.width / this.frame.height) * 1.55;
    const cw = Math.min(sw, sh * aspect);
    const ch = cw / aspect;
    const f = this.fctx;
    f.globalAlpha = this.hasFrame && this.frameFade > 0 ? 0.14 : 1;
    f.drawImage(
      src,
      (sw - cw) / 2,
      (sh - ch) / 2,
      cw,
      ch,
      0,
      0,
      this.frame.width,
      this.frame.height,
    );
    f.globalAlpha = 1;
    this.hasFrame = true;
  }

  private innerPath(c: CanvasRenderingContext2D) {
    const { gt, gb } = this.geo;
    const h = gb - gt;
    const floor = this.floorY();
    const hwTop = this.halfAt(-h);
    const hwBot = this.halfAt(floor);
    const r = hwBot * 0.16;
    c.beginPath();
    c.moveTo(-hwTop, -h + 1);
    c.lineTo(-hwBot, floor - r);
    c.quadraticCurveTo(-hwBot, floor, -hwBot + r, floor);
    c.lineTo(hwBot - r, floor);
    c.quadraticCurveTo(hwBot, floor, hwBot, floor - r);
    c.lineTo(hwTop, -h + 1);
    c.closePath();
  }

  private outerPath(c: CanvasRenderingContext2D) {
    const { gt, gb, gw } = this.geo;
    const h = gb - gt;
    const hwBot = (gw / 2) * 0.76;
    const r = hwBot * 0.14;
    c.beginPath();
    c.moveTo(-gw / 2, -h);
    c.lineTo(-hwBot, -r);
    c.quadraticCurveTo(-hwBot, 0, -hwBot + r, 0);
    c.lineTo(hwBot - r, 0);
    c.quadraticCurveTo(hwBot, 0, hwBot, -r);
    c.lineTo(gw / 2, -h);
  }

  private bandPath(c: CanvasRenderingContext2D, top: (x: number) => number, bottom: number) {
    const { gw } = this.geo;
    const w = gw * 0.6;
    c.beginPath();
    for (let i = 0; i <= 28; i++) {
      const x = -w + (i / 28) * 2 * w;
      const y = top(x);
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.lineTo(w, bottom);
    c.lineTo(-w, bottom);
    c.closePath();
  }

  private draw() {
    const c = this.ctx;
    const { w, h: stageH, gx, gt, gb, gw } = this.geo;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, w, stageH);
    if (gw <= 0) return;
    const unit = gw / 110;
    const h = gb - gt;
    const fill = this.total * this.drain;
    const level = this.levelY(this.total);
    const floor = this.floorY();
    const surf = (x: number) => level + this.surfaceAt(x);

    // the glow and shadow it throws on the counter
    const cy = gb + 3 * unit;
    c.save();
    c.translate(gx + this.ox * 0.9, cy);
    c.scale(1, 0.14);
    const shadow = c.createRadialGradient(0, 0, 0, 0, 0, gw * 0.9);
    shadow.addColorStop(0, "rgba(0,0,0,.5)");
    shadow.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = shadow;
    c.beginPath();
    c.arc(0, 0, gw * 0.9, 0, 7);
    c.fill();
    if (fill > 0.01) {
      const glowR = gw * 2.1;
      const glow = c.createRadialGradient(gw * 0.2, 0, 0, gw * 0.2, 0, glowR);
      glow.addColorStop(0, css(this.mixRgb, 0.55 * clamp(fill * 2, 0, 1)));
      glow.addColorStop(1, css(this.mixRgb, 0));
      c.fillStyle = glow;
      c.globalCompositeOperation = "lighter";
      c.beginPath();
      c.arc(gw * 0.2, 0, glowR, 0, 7);
      c.fill();
      c.globalCompositeOperation = "source-over";
    }
    c.restore();

    if (fill > 0.002) this.updateFrame();

    c.save();
    c.translate(gx + this.ox, gb + this.oy);
    c.rotate(this.rot);

    // inside the glass
    c.save();
    this.innerPath(c);
    c.clip();
    c.fillStyle = "rgba(255,236,190,.05)";
    c.fillRect(-gw, -h, gw * 2, h);

    if (fill > 0.002) {
      c.save();
      this.bandPath(c, surf, 2);
      c.clip();
      this.drawFootage(c, level + this.minSurf(), floor, h);
      this.drawLayers(c, surf, floor, unit);
      this.drawRibbons(c, level, floor, unit);
      for (const w of this.wisps) {
        c.fillStyle = css(w.rgb, 0.3 * clamp(w.life, 0, 1));
        c.beginPath();
        c.arc(w.x, w.y, w.r, 0, 7);
        c.fill();
      }
      for (const b of this.bubbles) {
        c.strokeStyle = "rgba(255,255,255,.62)";
        c.lineWidth = 0.8;
        c.beginPath();
        c.arc(b.x, b.y, b.r, 0, 7);
        c.stroke();
        c.fillStyle = "rgba(255,255,255,.75)";
        c.beginPath();
        c.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.28, 0, 7);
        c.fill();
      }
      // the curve of the glass: darker at the edges, a warm core where the light comes through
      const shade = c.createLinearGradient(-gw / 2, 0, gw / 2, 0);
      shade.addColorStop(0, "rgba(6,14,10,.5)");
      shade.addColorStop(0.2, "rgba(6,14,10,0)");
      shade.addColorStop(0.72, "rgba(255,230,170,.06)");
      shade.addColorStop(1, "rgba(6,14,10,.55)");
      c.fillStyle = shade;
      c.fillRect(-gw, -h, gw * 2, h + 4);
      c.restore();

      // the top of the liquid
      c.beginPath();
      for (let i = 0; i <= 28; i++) {
        const x = -gw * 0.6 + (i / 28) * gw * 1.2;
        if (i === 0) c.moveTo(x, surf(x));
        else c.lineTo(x, surf(x));
      }
      if (this.foam > 0.01) {
        c.strokeStyle = `rgba(255,246,222,${0.85 * this.foam})`;
        c.lineWidth = 7 * unit * this.foam;
        c.stroke();
        c.strokeStyle = `rgba(255,255,255,${0.6 * this.foam})`;
        c.lineWidth = 2 * unit;
        c.stroke();
      } else {
        c.strokeStyle = "rgba(255,250,235,.85)";
        c.lineWidth = 1.5 * unit;
        c.stroke();
      }
    }

    for (const i of this.ice) this.drawIce(c, i);
    c.restore();

    c.restore();

    // the streams fall in front of the back wall of the glass, behind its front
    for (const s of this.streams) this.drawStream(c, s, unit);
    for (const d of this.drops) {
      c.fillStyle = css(d.rgb, 0.95);
      c.beginPath();
      c.arc(d.x, d.y, d.r, 0, 7);
      c.fill();
    }

    c.save();
    c.translate(gx + this.ox, gb + this.oy);
    c.rotate(this.rot);
    this.drawGlass(c, h, floor, unit);
    if (this.shakeT > 0.35 && !this.reduced) this.drawTin(c, h);
    c.restore();
  }

  private minSurf() {
    let m = Infinity;
    for (let i = 0; i < N; i++) m = Math.min(m, this.h[i]!);
    return m - Math.abs(this.slosh);
  }

  /** The footage, cut in thin strips and shifted a little each: that's the refraction. */
  private drawFootage(c: CanvasRenderingContext2D, top: number, floor: number, h: number) {
    if (!this.hasFrame) {
      c.fillStyle = "rgba(20,30,28,1)";
      c.fillRect(-this.geo.gw, top, this.geo.gw * 2, floor - top + 4);
      return;
    }
    const { gw } = this.geo;
    const fh = this.frame.height;
    const fw = this.frame.width;
    const step = 4;
    const disturb = 1 + Math.min(Math.abs(this.slosh) / (gw * 0.1), 2.4);
    const t = this.reduced ? 0 : this.time;
    for (let y = top; y < floor + step; y += step) {
      const sy = clamp(((y + h) / h) * fh, 0, fh - 2);
      const half = this.halfAt(y) * 1.14;
      const dx =
        Math.sin(y * 0.05 + t * 1.7) * gw * 0.045 * disturb +
        Math.sin(y * 0.13 - t * 2.6) * gw * 0.016 * disturb;
      c.drawImage(
        this.frame,
        0,
        sy,
        fw,
        (step / h) * fh + 0.5,
        -half + dx,
        y,
        half * 2,
        step + 0.6,
      );
    }
  }

  private drawLayers(
    c: CanvasRenderingContext2D,
    surf: (x: number) => number,
    floor: number,
    unit: number,
  ) {
    const span = floor - this.levelY(this.total);
    const soft = (5 + this.mix * 70) * unit;
    const tint = (l: Layer): RGB =>
      this.mix > 0
        ? [
            lerp(l.rgb[0], this.mixRgb[0], this.mix),
            lerp(l.rgb[1], this.mixRgb[1], this.mix),
            lerp(l.rgb[2], this.mixRgb[2], this.mix),
          ]
        : l.rgb;
    const pass = (op: GlobalCompositeOperation, alpha: number) => {
      c.globalCompositeOperation = op;
      let vol = 0;
      for (const l of this.layers) {
        const low = this.levelY(vol);
        vol += l.v;
        const high = this.levelY(vol);
        const isTop = l === this.layers[this.layers.length - 1];
        const damp = span > 0 ? Math.pow(clamp((floor - high) / span, 0, 1), 1.6) : 1;
        const top = (x: number) =>
          isTop ? surf(x) : high + (surf(x) - this.levelY(this.total)) * damp;
        const bottom = low + soft;
        this.bandPath(c, top, bottom);
        const col = tint(l);
        const g = c.createLinearGradient(0, high - 8 * unit, 0, bottom);
        const fade = clamp(1 - (2 * soft) / Math.max(bottom - high + 8 * unit, 1), 0.02, 0.98);
        g.addColorStop(0, css(col, alpha));
        g.addColorStop(fade, css(col, alpha));
        g.addColorStop(1, css(col, 0));
        c.fillStyle = g;
        c.fill();
      }
      c.globalCompositeOperation = "source-over";
    };
    pass("overlay", 1);
    pass("source-over", 0.38);
    pass("soft-light", 0.8);
  }

  /** While shaking, and faintly afterwards: ribbons of each bottle's own colour turning through the blend. */
  private drawRibbons(c: CanvasRenderingContext2D, level: number, floor: number, unit: number) {
    if (this.swirl <= 0.01) return;
    const { gw } = this.geo;
    const t = this.reduced ? 1 : this.time;
    const speed = this.shakeT >= 0 ? 7 : 0.8;
    c.lineCap = "round";
    this.layers.slice(0, 8).forEach((l, n) => {
      for (let k = 0; k < 2; k++) {
        const ph = n * 1.9 + k * 2.6;
        c.beginPath();
        for (let i = 0; i <= 18; i++) {
          const f = i / 18;
          const y = lerp(level + 4, floor, f);
          const amp = gw * (0.2 + 0.2 * Math.sin(ph + f * 2));
          const x = Math.sin(f * 5.4 + ph + t * speed) * amp;
          if (i === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.strokeStyle = css(l.rgb, Math.min(0.62, this.swirl * 0.8));
        c.lineWidth = (5 + (n % 3) * 3 + k * 2) * unit;
        c.stroke();
      }
    });
  }

  private drawIce(c: CanvasRenderingContext2D, i: Ice) {
    const s = i.s;
    c.save();
    c.translate(i.x, i.y);
    c.rotate(i.rot);
    c.beginPath();
    c.roundRect(-s / 2, -s / 2, s, s, s * 0.16);
    c.fillStyle = "rgba(240,250,255,.26)";
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.72)";
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "rgba(255,255,255,.34)";
    c.beginPath();
    c.moveTo(-s * 0.36, -s * 0.36);
    c.lineTo(s * 0.12, -s * 0.36);
    c.lineTo(-s * 0.36, s * 0.1);
    c.closePath();
    c.fill();
    c.restore();
  }

  private drawStream(c: CanvasRenderingContext2D, s: Stream, unit: number) {
    if (s.head - s.tail < 1) return;
    const base = (5 + s.hard * 5) * unit;
    const t = this.time;
    const seg = 14;
    const px = (f: number) =>
      s.x + Math.sin(f * 9 + t * 22) * (0.5 + f * 1.3) * unit * (1 + s.hard);
    const py = (f: number) => lerp(s.tail, s.head, f);
    const trace = () => {
      c.beginPath();
      for (let i = 0; i <= seg; i++) {
        const f = i / seg;
        if (i === 0) c.moveTo(px(f), py(f));
        else c.lineTo(px(f), py(f));
      }
    };
    c.lineCap = "round";
    trace();
    c.strokeStyle = css(s.rgb, 0.22);
    c.lineWidth = base * 2.6;
    c.stroke();
    // it narrows as it falls
    for (let i = 0; i < seg; i++) {
      const f = i / seg;
      c.beginPath();
      c.moveTo(px(f), py(f));
      c.lineTo(px(f + 1 / seg), py(f + 1 / seg));
      c.strokeStyle = css(s.rgb, 1);
      c.lineWidth = base * lerp(1, 0.55, f);
      c.stroke();
    }
    trace();
    c.strokeStyle = "rgba(255,255,255,.55)";
    c.lineWidth = base * 0.2;
    c.stroke();
  }

  private drawGlass(c: CanvasRenderingContext2D, h: number, floor: number, unit: number) {
    const { gw } = this.geo;
    // the thick base
    const bh = this.halfAt(floor) + 2;
    const base = c.createLinearGradient(0, floor, 0, 0);
    base.addColorStop(0, "rgba(255,255,255,.08)");
    base.addColorStop(0.5, "rgba(255,248,226,.3)");
    base.addColorStop(1, "rgba(255,248,226,.12)");
    c.fillStyle = base;
    c.beginPath();
    c.moveTo(-bh, floor);
    c.lineTo(bh, floor);
    c.lineTo(bh, -1);
    c.lineTo(-bh, -1);
    c.closePath();
    c.fill();
    if (this.total > 0.01) {
      c.fillStyle = css(this.mixRgb, 0.22);
      c.fill();
    }
    // side light
    this.outerPath(c);
    const side = c.createLinearGradient(-gw / 2, 0, gw / 2, 0);
    side.addColorStop(0, "rgba(255,244,214,.3)");
    side.addColorStop(0.09, "rgba(255,244,214,.03)");
    side.addColorStop(0.9, "rgba(255,244,214,.02)");
    side.addColorStop(1, "rgba(255,160,190,.22)");
    c.closePath();
    c.fillStyle = side;
    c.fill();
    this.outerPath(c);
    c.strokeStyle = "rgba(255,246,224,.78)";
    c.lineWidth = 1.5 * unit;
    c.stroke();
    // rim
    c.beginPath();
    c.ellipse(0, -h, gw / 2, 4.5 * unit, 0, 0, 7);
    c.strokeStyle = "rgba(255,250,235,.85)";
    c.lineWidth = 1.2 * unit;
    c.stroke();
    // the long highlight down the left
    c.beginPath();
    c.moveTo(-gw * 0.33, -h * 0.93);
    c.lineTo(-gw * 0.27, -h * 0.25);
    c.strokeStyle = "rgba(255,255,255,.34)";
    c.lineWidth = 4 * unit;
    c.lineCap = "round";
    c.stroke();
    c.beginPath();
    c.moveTo(-gw * 0.22, -h * 0.9);
    c.lineTo(-gw * 0.2, -h * 0.72);
    c.strokeStyle = "rgba(255,255,255,.22)";
    c.lineWidth = 2 * unit;
    c.stroke();
  }

  /** The shaker tin that clamps on over the top for the shake. */
  private drawTin(c: CanvasRenderingContext2D, h: number) {
    const { gw } = this.geo;
    const t = this.shakeT;
    const inn = smooth((t - 0.35) / 0.4);
    const out = smooth((t - 2.4) / 0.35);
    const drop = (1 - inn + out) * h * 0.7;
    const alpha = clamp(inn * 3, 0, 1) * (1 - smooth((t - 2.6) / 0.15));
    if (alpha <= 0) return;
    const y0 = -h * 1.3 - drop;
    const y1 = -h * 0.8 - drop;
    const hwTop = gw * 0.44;
    const hwBot = gw * 0.62;
    c.save();
    c.globalAlpha = alpha;
    const g = c.createLinearGradient(-hwBot, 0, hwBot, 0);
    g.addColorStop(0, "#50575a");
    g.addColorStop(0.18, "#e9ede8");
    g.addColorStop(0.36, "#8d9493");
    g.addColorStop(0.56, "#f6f4e8");
    g.addColorStop(0.78, "#7f8585");
    g.addColorStop(1, "#3f4547");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-hwTop, y0 + 8);
    c.quadraticCurveTo(-hwTop, y0, -hwTop + 8, y0);
    c.lineTo(hwTop - 8, y0);
    c.quadraticCurveTo(hwTop, y0, hwTop, y0 + 8);
    c.lineTo(hwBot, y1);
    c.lineTo(-hwBot, y1);
    c.closePath();
    c.fill();
    c.fillStyle = "rgba(0,0,0,.25)";
    c.fillRect(-hwBot, y1 - 4, hwBot * 2, 4);
    c.restore();
  }
}

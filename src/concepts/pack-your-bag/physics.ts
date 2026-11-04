// A small home-made 2D physics engine for things thrown around on a bed, seen from above. Bodies are oriented boxes
// that slide, spin and collide (separating axes, one contact per pair, impulses with spin). Height (z) is faked: a
// thrown thing leaves the bed, flies over whatever is low, and when it comes down it is either in the case or not.

export type Rect = { x: number; y: number; w: number; h: number };

export type Body = {
  id: string;
  x: number;
  y: number;
  a: number;
  vx: number;
  vy: number;
  w: number;
  z: number;
  vz: number;
  hw: number;
  hh: number;
  im: number;
  ii: number;
  held: boolean;
  tx: number;
  ty: number;
  rx: number;
  ry: number;
  inside: boolean;
  above: boolean;
  asleep: boolean;
  /** Tapped rather than thrown: goes where it was sent, over everything, until it lands. */
  lobbed: boolean;
};

export type Hit = {
  kind: "land" | "wall" | "bump" | "in" | "out" | "hop";
  x: number;
  y: number;
  power: number;
  id: string;
};

export type World = { W: number; H: number; base: Rect; whole: Rect; bodies: Body[]; hits: Hit[] };

export const GRAVITY = 1500;
const G = GRAVITY;
export const RIM = 20;
const HELD_Z = 26;
const MAX_SPEED = 2800;
const FRICTION = 620;
const SPIN_FRICTION = 7;
const MAX_PULL = 70000;
const STEP = 1 / 120;

export function makeBody(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  mass: number,
): Body {
  const b: Body = {
    id,
    x,
    y,
    a: 0,
    vx: 0,
    vy: 0,
    w: 0,
    z: 0,
    vz: 0,
    hw: 0,
    hh: 0,
    im: 1 / mass,
    ii: 0,
    held: false,
    tx: x,
    ty: y,
    rx: 0,
    ry: 0,
    inside: false,
    above: false,
    asleep: false,
    lobbed: false,
  };
  sizeBody(b, w, h, mass);
  return b;
}

export function sizeBody(b: Body, w: number, h: number, mass = 1 / b.im) {
  b.hw = w / 2;
  b.hh = h / 2;
  b.ii = 12 / (mass * (w * w + h * h));
}

const inRect = (r: Rect, x: number, y: number) =>
  x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Run the world forward by dt seconds, in fixed small steps so throws can't pass through things. */
export function advance(world: World, dt: number, carry: { t: number }) {
  carry.t = Math.min(carry.t + dt, 4 * STEP * 2);
  while (carry.t >= STEP) {
    step(world, STEP);
    carry.t -= STEP;
  }
}

function step(world: World, dt: number) {
  for (const b of world.bodies) if (!b.asleep) move(world, b, dt);
  const bs = world.bodies;
  for (let i = 0; i < bs.length; i++) {
    const a = bs[i] as Body;
    if (Math.abs(a.z) < 60)
      for (let j = i + 1; j < bs.length; j++) collidePair(world, a, bs[j] as Body);
  }
  for (const b of bs) if (!b.asleep) contain(world, b);
}

function move(world: World, b: Body, dt: number) {
  if (b.held) {
    // A spring from the hand to the point that was grabbed: off-centre grabs swing round, and momentum is real.
    const c = Math.cos(b.a),
      s = Math.sin(b.a);
    const rx = b.rx * c - b.ry * s,
      ry = b.rx * s + b.ry * c;
    const px = b.x + rx,
      py = b.y + ry;
    const pvx = b.vx - b.w * ry,
      pvy = b.vy + b.w * rx;
    let fx = 650 * (b.tx - px) - 46 * pvx;
    let fy = 650 * (b.ty - py) - 46 * pvy;
    // A hand has limits: a sudden jump of the pointer shouldn't fire the thing off at full speed in one step.
    const pull = Math.hypot(fx, fy);
    if (pull > MAX_PULL) {
      fx *= MAX_PULL / pull;
      fy *= MAX_PULL / pull;
    }
    b.vx += fx * dt;
    b.vy += fy * dt;
    b.w += ((rx * fy - ry * fx) * b.ii * dt * 0.9) / b.im;
    b.w *= 0.975;
    b.z += (HELD_Z - b.z) * 0.14;
    b.vz = 0;
  } else {
    b.vz -= G * dt;
    b.z += b.vz * dt;
    if (b.z <= 0) {
      b.z = 0;
      b.lobbed = false;
      if (b.vz < -90) {
        const power = -b.vz;
        world.hits.push({ kind: "land", x: b.x, y: b.y, power, id: b.id });
        b.vz = power * 0.36;
        b.w += (b.vx * 0.004 + (b.vy > 0 ? 1 : -1) * power * 0.004) * (b.x % 2 > 1 ? 1 : -1);
      } else {
        b.vz = 0;
      }
    }
    if (b.z === 0 && b.vz === 0) {
      const sp = Math.hypot(b.vx, b.vy);
      const drop = FRICTION * dt;
      if (sp <= drop) {
        b.vx = 0;
        b.vy = 0;
      } else {
        b.vx *= 1 - drop / sp;
        b.vy *= 1 - drop / sp;
      }
      const wd = SPIN_FRICTION * dt;
      b.w = Math.abs(b.w) <= wd ? 0 : b.w - Math.sign(b.w) * wd;
      if (b.vx === 0 && b.vy === 0 && b.w === 0) b.asleep = true;
    } else if (b.vz < 0 && inRect(world.base, b.x, b.y)) {
      // The open case catches: something falling over it loses its forward speed quickly.
      const k = 1 - 5 * dt;
      b.vx *= k;
      b.vy *= k;
    }
  }
  const sp = Math.hypot(b.vx, b.vy);
  if (sp > MAX_SPEED) {
    b.vx *= MAX_SPEED / sp;
    b.vy *= MAX_SPEED / sp;
  }
  b.w = clamp(b.w, -26, 26);
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  b.a += b.w * dt;

  // Coming down past the rim decides what happened.
  if (b.z >= RIM) {
    b.above = true;
  } else if (b.above && !b.held) {
    b.above = false;
    const was = b.inside;
    if (inRect(world.base, b.x, b.y)) {
      b.inside = true;
    } else if (inRect(world.whole, b.x, b.y)) {
      // Landed on the lid or the rim: hop off it, into the case.
      const m = 24;
      const tx = clamp(b.x, world.base.x + m, world.base.x + world.base.w - m);
      const ty = clamp(b.y, world.base.y + m, world.base.y + world.base.h - m);
      b.vz = 430;
      b.z = RIM + 0.5;
      b.above = true;
      const t = (2 * 430) / G;
      b.vx = (tx - b.x) / t;
      b.vy = (ty - b.y) / t;
      b.w += b.x % 2 > 1 ? 3 : -3;
      world.hits.push({ kind: "hop", x: b.x, y: b.y, power: 300, id: b.id });
      return;
    } else {
      b.inside = false;
    }
    if (b.inside !== was)
      world.hits.push({ kind: b.inside ? "in" : "out", x: b.x, y: b.y, power: 200, id: b.id });
    else if (b.inside) world.hits.push({ kind: "in", x: b.x, y: b.y, power: 120, id: b.id });
  }
}

/** Push an impulse through a contact point on one body against something that doesn't move. */
function hitStatic(b: Body, px: number, py: number, nx: number, ny: number, e: number) {
  const rx = px - b.x,
    ry = py - b.y;
  const vx = b.vx - b.w * ry,
    vy = b.vy + b.w * rx;
  const vn = vx * nx + vy * ny;
  if (vn >= 0) return 0;
  const rn = rx * ny - ry * nx;
  const j = (-(1 + e) * vn) / (b.im + b.ii * rn * rn);
  b.vx += j * nx * b.im;
  b.vy += j * ny * b.im;
  b.w += j * rn * b.ii;
  // Sliding friction at the contact is what turns glancing blows into spin.
  const tx = -ny,
    ty = nx;
  const vt = vx * tx + vy * ty;
  const rt = rx * ty - ry * tx;
  const jt = clamp(-vt / (b.im + b.ii * rt * rt), -0.3 * j, 0.3 * j);
  b.vx += jt * tx * b.im;
  b.vy += jt * ty * b.im;
  b.w += jt * rt * b.ii;
  return -vn;
}

function corners(b: Body, shrink: number): [number, number][] {
  const c = Math.cos(b.a),
    s = Math.sin(b.a);
  const hw = b.hw * shrink,
    hh = b.hh * shrink;
  return [
    [b.x + hw * c - hh * s, b.y + hw * s + hh * c],
    [b.x - hw * c - hh * s, b.y - hw * s + hh * c],
    [b.x - hw * c + hh * s, b.y - hw * s - hh * c],
    [b.x + hw * c + hh * s, b.y + hw * s - hh * c],
  ];
}

function wallsOf(world: World, b: Body, r: Rect, shrink: number, e: number) {
  const pts = corners(b, shrink);
  const walls: [number, number, number][] = [
    [1, 0, r.x],
    [-1, 0, -(r.x + r.w)],
    [0, 1, r.y],
    [0, -1, -(r.y + r.h)],
  ];
  for (const [nx, ny, off] of walls) {
    let deepest = 0,
      px = 0,
      py = 0;
    for (const [x, y] of pts) {
      const d = off - (x * nx + y * ny);
      if (d > deepest) {
        deepest = d;
        px = x;
        py = y;
      }
    }
    if (deepest > 0) {
      b.x += nx * deepest;
      b.y += ny * deepest;
      const power = hitStatic(b, px, py, nx, ny, e);
      if (power > 120) world.hits.push({ kind: "wall", x: px, y: py, power, id: b.id });
    }
  }
}

function contain(world: World, b: Body) {
  wallsOf(world, b, { x: 0, y: 0, w: world.W, h: world.H }, 1, 0.55);
  if (b.z >= RIM) return;
  if (b.inside) {
    wallsOf(world, b, world.base, 0.86, 0.5);
  } else {
    // The outside of the case is a wall to anything that hasn't been lifted over it.
    const r = world.whole;
    const reach = Math.hypot(b.hw, b.hh);
    if (
      b.x < r.x - reach ||
      b.x > r.x + r.w + reach ||
      b.y < r.y - reach ||
      b.y > r.y + r.h + reach
    )
      return;
    const box: Body = {
      ...b,
      x: r.x + r.w / 2,
      y: r.y + r.h / 2,
      a: 0,
      hw: r.w / 2,
      hh: r.h / 2,
      im: 0,
      ii: 0,
      vx: 0,
      vy: 0,
      w: 0,
    };
    const c = sat(b, box, 1, 1);
    if (c) {
      b.x -= c.nx * c.depth;
      b.y -= c.ny * c.depth;
      const power = hitStatic(b, c.px, c.py, -c.nx, -c.ny, 0.5);
      if (power > 120) world.hits.push({ kind: "wall", x: c.px, y: c.py, power, id: b.id });
    }
  }
}

/** Separating axes for two boxes. The normal points from a to b. */
function sat(a: Body, b: Body, sa: number, sb: number) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const ca = Math.cos(a.a),
    sna = Math.sin(a.a),
    cb = Math.cos(b.a),
    snb = Math.sin(b.a);
  const axes: [number, number][] = [
    [ca, sna],
    [-sna, ca],
    [cb, snb],
    [-snb, cb],
  ];
  let depth = Infinity,
    nx = 0,
    ny = 0,
    owner = 0;
  for (const [i, [ax, ay]] of axes.entries()) {
    const ra = a.hw * sa * Math.abs(ax * ca + ay * sna) + a.hh * sa * Math.abs(-ax * sna + ay * ca);
    const rb = b.hw * sb * Math.abs(ax * cb + ay * snb) + b.hh * sb * Math.abs(-ax * snb + ay * cb);
    const d = dx * ax + dy * ay;
    const overlap = ra + rb - Math.abs(d);
    if (overlap <= 0) return null;
    if (overlap < depth) {
      depth = overlap;
      const s = d >= 0 ? 1 : -1;
      nx = ax * s;
      ny = ay * s;
      owner = i < 2 ? 0 : 1;
    }
  }
  // The contact is the corner of the other box that reaches furthest into the owner of the axis.
  const pts = owner === 0 ? corners(b, sb) : corners(a, sa);
  const sign = owner === 0 ? 1 : -1;
  let px = 0,
    py = 0,
    best = Infinity;
  for (const [x, y] of pts) {
    const v = (x * nx + y * ny) * sign;
    if (v < best) {
      best = v;
      px = x;
      py = y;
    }
  }
  return { depth, nx, ny, px, py };
}

function collidePair(world: World, a: Body, b: Body) {
  if (a.asleep && b.asleep) return;
  if (a.lobbed || b.lobbed) return;
  if (Math.abs(a.z - b.z) > 24) return;
  // The rim keeps what's in the case apart from what's on the bed, unless one of them is up in the air.
  if (a.inside !== b.inside && a.z < RIM && b.z < RIM) return;
  const packed = a.inside && b.inside;
  const shrink = packed ? 0.56 : 0.9;
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const reach = (Math.hypot(a.hw, a.hh) + Math.hypot(b.hw, b.hh)) * shrink;
  if (dx * dx + dy * dy > reach * reach) return;
  const c = sat(a, b, shrink, shrink);
  if (!c) return;

  const heldA = a.held ? 0.15 : 1,
    heldB = b.held ? 0.15 : 1; // A hand is stronger than a shoe.
  const ima = a.im * heldA,
    imb = b.im * heldB;
  const iia = a.ii * heldA,
    iib = b.ii * heldB;
  const push = ((packed ? 0.25 : 0.7) * c.depth) / (ima + imb);
  a.x -= c.nx * push * ima;
  a.y -= c.ny * push * ima;
  b.x += c.nx * push * imb;
  b.y += c.ny * push * imb;

  const rax = c.px - a.x,
    ray = c.py - a.y,
    rbx = c.px - b.x,
    rby = c.py - b.y;
  const rvx = b.vx - b.w * rby - (a.vx - a.w * ray);
  const rvy = b.vy + b.w * rbx - (a.vy + a.w * rax);
  const vn = rvx * c.nx + rvy * c.ny;
  if (vn >= 0) return;
  const ran = rax * c.ny - ray * c.nx,
    rbn = rbx * c.ny - rby * c.nx;
  const j = (-(1 + 0.5) * vn) / (ima + imb + iia * ran * ran + iib * rbn * rbn);
  a.vx -= j * c.nx * ima;
  a.vy -= j * c.ny * ima;
  a.w -= j * ran * iia;
  b.vx += j * c.nx * imb;
  b.vy += j * c.ny * imb;
  b.w += j * rbn * iib;

  const tx = -c.ny,
    ty = c.nx;
  const vt = rvx * tx + rvy * ty;
  const rat = rax * ty - ray * tx,
    rbt = rbx * ty - rby * tx;
  const jt = clamp(-vt / (ima + imb + iia * rat * rat + iib * rbt * rbt), -0.3 * j, 0.3 * j);
  a.vx -= jt * tx * ima;
  a.vy -= jt * ty * ima;
  a.w -= jt * rat * iia;
  b.vx += jt * tx * imb;
  b.vy += jt * ty * imb;
  b.w += jt * rbt * iib;

  a.asleep = false;
  b.asleep = false;
  if (-vn > 140) world.hits.push({ kind: "bump", x: c.px, y: c.py, power: -vn, id: a.id });
}

/** Lob a body so it comes down at (tx, ty). Used when an item is tapped rather than thrown. */
export function lob(b: Body, tx: number, ty: number, spin: number) {
  const vz = 560;
  const t = (2 * vz) / G;
  b.asleep = false;
  b.held = false;
  b.lobbed = true;
  b.z = Math.max(b.z, 0.1);
  b.vz = vz;
  // The catch drag only bites over the case, near the end of the flight, so overshoot a little to allow for it.
  b.vx = (tx - b.x) / t;
  b.vy = (ty - b.y) / t;
  b.w = spin;
}

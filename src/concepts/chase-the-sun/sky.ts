// The whole design is this table: what the sky, the type, the ground and the footage look like at each hour.
// Colours are mixed in OKLab, because plain RGB mixing goes grey halfway between a blue and an orange.

type Lab = [number, number, number];

const toLin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToLab(hex: string): Lab {
  const n = parseInt(hex.slice(1), 16);
  const r = toLin(((n >> 16) & 255) / 255);
  const g = toLin(((n >> 8) & 255) / 255);
  const b = toLin((n & 255) / 255);
  const l = Math.cbrt(0.4122 * r + 0.5363 * g + 0.0514 * b);
  const m = Math.cbrt(0.2119 * r + 0.6807 * g + 0.1074 * b);
  const s = Math.cbrt(0.0883 * r + 0.2817 * g + 0.63 * b);
  return [
    0.2105 * l + 0.7936 * m - 0.004 * s,
    1.9779 * l - 2.4286 * m + 0.4506 * s,
    0.0259 * l + 0.7828 * m - 0.8087 * s,
  ];
}

function labToCss([L, a, b]: Lab, alpha?: number): string {
  const l = (L + 0.3963 * a + 0.2158 * b) ** 3;
  const m = (L - 0.1056 * a - 0.0639 * b) ** 3;
  const s = (L - 0.0895 * a - 1.2915 * b) ** 3;
  const ch = (v: number) => Math.round(255 * Math.min(1, Math.max(0, toSrgb(Math.max(0, v)))));
  const rgb = `${ch(4.0767 * l - 3.3077 * m + 0.231 * s)} ${ch(-1.2684 * l + 2.6098 * m - 0.3413 * s)} ${ch(-0.0041 * l - 0.7034 * m + 1.7076 * s)}`;
  return alpha === undefined ? `rgb(${rgb})` : `rgb(${rgb} / ${alpha})`;
}

const mix = (a: Lab, b: Lab, t: number): Lab => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

type Key = {
  h: number;
  /** Seven stops, top of the sky to the horizon. */
  sky: [string, string, string, string, string, string, string];
  ink: string;
  sun: string;
  ground: string;
  /** Footage grade: brightness, contrast, saturate, hue-rotate degrees, sepia. */
  grade: [number, number, number, number, number];
  mul: string;
  soft: string;
};

const PREDAWN: Omit<Key, "h"> = {
  sky: ["#0a0f36", "#141b52", "#272670", "#4c3189", "#8e3f8e", "#d65c80", "#ff9a72"],
  ink: "#ffe9d8",
  sun: "#ffb37c",
  ground: "#0b0a26",
  grade: [0.56, 1.06, 0.82, -8, 0],
  mul: "#6a5cb4",
  soft: "#f28c82",
};

const KEYS: Key[] = [
  { h: 5, ...PREDAWN },
  {
    h: 6.1,
    sky: ["#1a2a78", "#3142a0", "#6a55b4", "#b56ab0", "#f0849a", "#ffaa7c", "#ffd98c"],
    ink: "#fff5e6",
    sun: "#ffc47a",
    ground: "#191331",
    grade: [0.86, 1.05, 1.06, -6, 0.12],
    mul: "#efb0c0",
    soft: "#ffb08a",
  },
  {
    h: 7.5,
    sky: ["#1650ae", "#2470ce", "#4b92e0", "#82b6ea", "#c3d4e2", "#f8dcae", "#ffdc98"],
    ink: "#fffdf4",
    sun: "#ffe9b0",
    ground: "#102031",
    grade: [1, 1.03, 1.06, 0, 0.06],
    mul: "#fff0d8",
    soft: "#ffe0b0",
  },
  {
    h: 10,
    sky: ["#0a48ac", "#0f5ac6", "#1a72da", "#2e8ce6", "#58a9ee", "#99cdf4", "#def0f6"],
    ink: "#ffffff",
    sun: "#fff6d2",
    ground: "#0b2338",
    grade: [1.05, 1.05, 1.13, 0, 0],
    mul: "#ffffff",
    soft: "#dff0ff",
  },
  {
    h: 12.5,
    sky: ["#063ca2", "#0a4ebc", "#1064d2", "#1f80e2", "#44a0ec", "#86c6f3", "#d2ecf7"],
    ink: "#ffffff",
    sun: "#fffbe8",
    ground: "#08233c",
    grade: [1.12, 1.08, 1.2, 0, 0],
    mul: "#ffffff",
    soft: "#eaf6ff",
  },
  {
    h: 15.2,
    sky: ["#0c48a0", "#165fba", "#2b7ace", "#5199da", "#8ab8dc", "#d0d6c4", "#fbe2a8"],
    ink: "#fffcec",
    sun: "#fff0bc",
    ground: "#102237",
    grade: [1.05, 1.06, 1.12, 0, 0.06],
    mul: "#fff4e0",
    soft: "#ffe2b0",
  },
  {
    h: 17,
    sky: ["#143f94", "#2a57ac", "#5a71bc", "#a083b8", "#e698a0", "#fdbb70", "#ffd062"],
    ink: "#fff3d4",
    sun: "#ffd27a",
    ground: "#1b1a33",
    grade: [1, 1.07, 1.2, -2, 0.2],
    mul: "#ffd9a8",
    soft: "#ffb060",
  },
  {
    h: 18.2,
    sky: ["#1b2c7c", "#38399c", "#7646a4", "#c2528e", "#f4706a", "#fda648", "#ffd65a"],
    ink: "#fff1cc",
    sun: "#ff9c3a",
    ground: "#2a1029",
    grade: [0.94, 1.1, 1.3, -4, 0.3],
    mul: "#ffb98a",
    soft: "#ff8a40",
  },
  {
    h: 19,
    sky: ["#101754", "#22237a", "#55309a", "#a73c94", "#ea5272", "#fb8a4a", "#fdc25e"],
    ink: "#ffe8c8",
    sun: "#ff6c3e",
    ground: "#1b0a24",
    grade: [0.68, 1.1, 1.24, -10, 0.2],
    mul: "#dc7c9e",
    soft: "#ff5a70",
  },
  {
    h: 20,
    sky: ["#060b30", "#0c174c", "#16276e", "#26368c", "#41459c", "#70519c", "#b65c86"],
    ink: "#f0f1ff",
    sun: "#dfe6ff",
    ground: "#0a0a22",
    grade: [0.46, 1.12, 0.9, 0, 0.04],
    mul: "#4e4ea8",
    soft: "#5060c0",
  },
  {
    h: 21.5,
    sky: ["#03061c", "#060c2a", "#0a1338", "#0f1c4a", "#15265c", "#1d326e", "#2c4380"],
    ink: "#e2e9ff",
    sun: "#e4eaff",
    ground: "#040618",
    grade: [0.33, 1.16, 0.72, 0, 0],
    mul: "#2e3c96",
    soft: "#304090",
  },
  {
    h: 23,
    sky: ["#02030f", "#030619", "#050a24", "#071030", "#0a163c", "#0e1d48", "#152656"],
    ink: "#d4ddff",
    sun: "#e4eaff",
    ground: "#02030e",
    grade: [0.27, 1.18, 0.66, 0, 0],
    mul: "#26307f",
    soft: "#28347c",
  },
  { h: 29, ...PREDAWN },
];

type LabKey = {
  h: number;
  sky: Lab[];
  ink: Lab;
  sun: Lab;
  ground: Lab;
  grade: number[];
  mul: Lab;
  soft: Lab;
};
const LABS: LabKey[] = KEYS.map((k) => ({
  h: k.h,
  sky: k.sky.map(hexToLab),
  ink: hexToLab(k.ink),
  sun: hexToLab(k.sun),
  ground: hexToLab(k.ground),
  grade: k.grade,
  mul: hexToLab(k.mul),
  soft: hexToLab(k.soft),
}));

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function around(hour: number): [LabKey, LabKey, number] {
  const h = clamp(hour, 5, 29);
  let i = 0;
  while (i < LABS.length - 2 && LABS[i + 1]!.h <= h) i++;
  const a = LABS[i]!;
  const b = LABS[i + 1]!;
  return [a, b, clamp((h - a.h) / (b.h - a.h), 0, 1)];
}

export function paletteAt(hour: number) {
  const [a, b, t] = around(hour);
  const g = a.grade.map((v, i) => v + (b.grade[i]! - v) * t);
  const shade = mix(a.sky[1]!, b.sky[1]!, t);
  const ink = mix(a.ink, b.ink, t);
  return {
    sky: a.sky.map((c, i) => labToCss(mix(c, b.sky[i]!, t))),
    ink: labToCss(ink),
    glow: labToCss(ink, 0.42),
    shade: labToCss(shade, 0.62),
    sun: labToCss(mix(a.sun, b.sun, t)),
    ground: labToCss(mix(a.ground, b.ground, t)),
    grade: `brightness(${g[0]!.toFixed(3)}) contrast(${g[1]!.toFixed(3)}) saturate(${g[2]!.toFixed(3)}) hue-rotate(${g[3]!.toFixed(1)}deg) sepia(${g[4]!.toFixed(3)})`,
    mul: labToCss(mix(a.mul, b.mul, t)),
    soft: labToCss(mix(a.soft, b.soft, t)),
  };
}

/** The colour of whichever light is up at this hour, for the pinned chips. */
export const lightAt = (hour: number) => {
  const [a, b, t] = around(hour);
  return labToCss(mix(a.sun, b.sun, t));
};

export const starsAt = (h: number) => (h < 12 ? 1 - smooth(4.9, 6.2, h) : smooth(18.8, 20.2, h));
export const lightsAt = (h: number) => (h < 12 ? 1 - smooth(5.4, 6.6, h) : smooth(18, 19.5, h));

export const SLOTS = [
  { key: "dawn", name: "Dawn", from: 5, at: 6.2 },
  { key: "morning", name: "Morning", from: 7.5, at: 9 },
  { key: "midday", name: "Midday", from: 11, at: 12.5 },
  { key: "afternoon", name: "Afternoon", from: 14, at: 15.2 },
  { key: "golden", name: "Golden", from: 16.75, at: 17.9 },
  { key: "night", name: "Night", from: 18.9, at: 21 },
] as const;

export function slotAt(hour: number): number {
  let s = 0;
  for (let i = 0; i < SLOTS.length; i++) if (hour >= SLOTS[i]!.from) s = i;
  return s;
}

/** 06:40. Hours past midnight run on as 24 to 29 while the sky drifts through the small hours. */
export function clockAt(hour: number) {
  const whole = Math.floor(hour * 60 + 0.001);
  const h = Math.floor(whole / 60) % 24;
  const m = whole % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

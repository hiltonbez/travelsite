// The map's geography: coastlines traced from rough longitude and latitude points, smoothed into a hand-drawn line
// with a little seeded wobble (the same on the server and in the browser), and the places the routes join. The map
// is 1060 × 1000 units, from 20°W to 65°E and from 42°N to 38°S.
export const MAP_W = 1060;
export const MAP_H = 1000;

type LonLat = [number, number];
export type Point = [number, number];

/** Longitude and latitude to map units. */
export const proj = ([lon, lat]: LonLat): Point => [(lon + 20) * 12.5, (42 - lat) * 12.5];

/** A tiny seeded random, so the wobble is the same every time the page is drawn. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647 - 0.5;
  };
}

/** A closed, smooth, slightly shaky line through the points (Catmull-Rom curves). */
function shoreline(points: LonLat[], seed: number, wobble = 2.2) {
  const rnd = seeded(seed);
  const p = points.map((ll) => {
    const [x, y] = proj(ll);
    return [x + rnd() * wobble, y + rnd() * wobble] as Point;
  });
  const at = (i: number) => p[(i + p.length) % p.length] as Point;
  let d = `M${at(0)[0].toFixed(1)} ${at(0)[1].toFixed(1)}`;
  for (let i = 0; i < p.length; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]!.toFixed(1)} ${c1[1]!.toFixed(1)} ${c2[0]!.toFixed(1)} ${c2[1]!.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

const AFRICA: LonLat[] = [
  [-5.9, 35.8], [-2, 35.1], [3, 36.8], [10.2, 37.2], [11, 35.5], [10.5, 34], [11.5, 33.1], [15, 32.3], [19.9, 30.8],
  [20.1, 32.1], [23, 32.6], [25, 31.7], [29.9, 31.2], [32.3, 31.3], [32.6, 29.9], [33.6, 27.4], [35.5, 24], [37.2, 21],
  [38.5, 18], [39.7, 15.5], [41.7, 13.5], [43.3, 12.4], [44.5, 10.4], [48, 11.2], [51.2, 11.8], [51, 10.4], [50.1, 8],
  [48.5, 5], [46, 2], [43.5, -0.5], [41.6, -1.7], [39.6, -4.1], [38.9, -6.5], [39.5, -9], [40.4, -10.5], [40.6, -14.5],
  [39, -17], [36.8, -18.8], [35.3, -22], [35.5, -24], [32.9, -25.9], [32.4, -28.6], [31, -29.9], [30, -31.3],
  [27.9, -33], [25.6, -33.9], [22, -34.1], [20, -34.8], [18.4, -34.3], [18, -32.5], [16.5, -28.6], [15.2, -26.6],
  [14.5, -22.9], [13.2, -20], [11.8, -17.2], [12.2, -14.5], [13.5, -12], [13.2, -9], [12.2, -6], [11.8, -4], [9.5, -1],
  [9.3, 1], [9.8, 3], [9, 4], [8.5, 4.6], [6, 4.3], [4.5, 6.3], [2.5, 6.3], [0, 5.6], [-2, 4.8], [-4.5, 5.2], [-7.5, 4.4],
  [-9.3, 5.5], [-11.5, 6.9], [-13.3, 8.5], [-15, 10.8], [-16.7, 12.5], [-17.4, 14.7], [-16.5, 16.5], [-16.1, 19.5],
  [-17, 21], [-15.9, 23.7], [-13.5, 26.9], [-11.5, 28.2], [-9.8, 29.8], [-9.6, 32.5], [-8, 33.6], [-6.8, 34.2],
];

const MADAGASCAR: LonLat[] = [
  [49.3, -12], [50.5, -15.5], [49.5, -17.5], [48.5, -21], [47, -25], [45, -25.5], [43.6, -23.5], [43.5, -21.5],
  [44.3, -18], [44, -16.5], [46.5, -15.5], [48, -13.5],
];

/** Greece, Turkey, the Levant, Arabia and the Gulf: the top right of the map, closed along its top edge. */
const EURASIA: LonLat[] = [
  [19.4, 42], [19.6, 41], [20, 39.6], [21.1, 38.4], [21.6, 36.8], [22.5, 36.4], [23.2, 37.3], [22.9, 37.9], [24, 38.2],
  [22.9, 39.4], [23.8, 40.2], [24.4, 40.9], [26, 40.8], [26.2, 40], [26.4, 39], [27, 38.4], [27.3, 37], [28.3, 36.7],
  [30.6, 36.8], [32.8, 36.1], [36, 36.6], [35.9, 35.4], [35.5, 33.9], [34.9, 32.4], [34.2, 31.3], [32.9, 31],
  [32.7, 29.9], [33.8, 27.8], [34.4, 28], [34.9, 29.5], [36.5, 26], [39, 21.5], [41, 17.5], [42.8, 14.5], [43.5, 12.7],
  [45, 12.8], [48.5, 14], [52, 15.6], [55.5, 17.5], [57.8, 19], [59.8, 22.5], [58.5, 23.6], [56.4, 26.3], [56, 24.5],
  [54, 24.2], [51.6, 25.3], [50.2, 26.5], [48.5, 28.5], [47.9, 30], [48.9, 30.4], [50.3, 29.3], [51.4, 27.9],
  [54.7, 26.5], [56.4, 27.1], [57.3, 25.8], [61.6, 25.2], [65.5, 25.3], [65.5, 42.5], [19.4, 42.5],
];

const ITALY: LonLat[] = [
  [15.5, 42.5], [16, 41.4], [18, 40.6], [18.5, 40.1], [17.9, 40.1], [17.1, 39], [16.6, 38.4], [16, 37.9], [15.6, 38.2],
  [16.2, 38.9], [15.6, 40], [14.5, 40.7], [13.5, 41.4], [12.5, 42.5],
];
const SICILY: LonLat[] = [[12.4, 38.1], [15.6, 38.3], [15.1, 36.7], [13.5, 37.2]];
const CRETE: LonLat[] = [[23.5, 35.6], [26.3, 35.3], [26, 34.95], [24, 35.2]];

export const LAND = [
  shoreline(AFRICA, 7),
  shoreline(MADAGASCAR, 11, 1.4),
  shoreline(EURASIA, 13),
  shoreline(ITALY, 17, 1.2),
  shoreline(SICILY, 19, 0.8),
  shoreline(CRETE, 23, 0.6),
];

/** Small islands, drawn as dots: Mauritius gets a proper blob of its own (see Place below). */
export const ISLETS: Point[] = ([[55.5, -21.1], [55.5, -4.6], [43.3, -11.7], [53.9, 12.5], [-16.6, 28.3], [-24, 16]] as LonLat[]).map(proj);

/** Rings of contour lines around the high ground: Kilimanjaro, the Drakensberg, the Atlas and the Ethiopian highlands. */
export const PEAKS: { at: Point; rings: number }[] = [
  { at: proj([37.4, -3.1]), rings: 4 },
  { at: proj([29.3, -29.5]), rings: 3 },
  { at: proj([-5, 32]), rings: 3 },
  { at: proj([39, 9]), rings: 4 },
  { at: proj([47, -19]), rings: 2 },
];

/** A ring of contour line around a peak: a circle with a seeded wobble. */
export function contour(c: Point, r: number, seed: number) {
  const rnd = seeded(seed);
  const n = 14;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + rnd() * 0.35);
    return [c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr * 0.8] as Point;
  });
  const at = (i: number) => pts[(i + n) % n] as Point;
  let d = `M${at(0)[0].toFixed(1)} ${at(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

/** The places on the map: home (Johannesburg) and the six destinations, keyed by destination slug. */
export const HOME: Point = proj([28, -26.2]);
export const PLACES: Record<string, { at: Point; label: string; side: "left" | "right" }> = {
  mauritius: { at: proj([57.5, -20.3]), label: "Mauritius", side: "left" },
  zanzibar: { at: proj([39.3, -6.1]), label: "Zanzibar", side: "right" },
  "victoria-falls": { at: proj([25.85, -17.9]), label: "Victoria Falls", side: "left" },
  kruger: { at: proj([31.5, -24.5]), label: "Kruger", side: "right" },
  "cape-town": { at: proj([18.4, -33.9]), label: "Cape Town", side: "left" },
  santorini: { at: proj([25.4, 36.4]), label: "Santorini", side: "right" },
};

/** A curved route from a to b, bowed to one side by `bend` (a share of its length). */
export function arc(a: Point, b: Point, bend = 0.2) {
  const [mx, my] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const c = [mx - dy * bend, my + dx * bend];
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${c[0]!.toFixed(1)} ${c[1]!.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
}

/** Map views: each page is a different region of the same map (an SVG viewBox). */
export const VIEWS = {
  world: `0 0 ${MAP_W} ${MAP_H}`,
  south: "380 640 420 360",
  east: "430 470 560 460",
  ocean: "640 560 420 380",
  cape: "400 780 330 230",
  atlantic: "0 380 460 420",
  north: "300 0 520 400",
} as const;
export type View = keyof typeof VIEWS;

/** A view centred on one place. */
export function viewAround(p: Point, w = 380, h = 320) {
  const x = Math.min(Math.max(p[0] - w / 2, 0), MAP_W - w);
  const y = Math.min(Math.max(p[1] - h / 2, 0), MAP_H - h);
  return `${x.toFixed(0)} ${y.toFixed(0)} ${w} ${h}`;
}

// The lift's drawn parts: door inlay, floor dial, the operator, keys, the chandelier and the rooftop skyline.
// All geometry comes from fixed numbers, so server and browser draw the same thing.
import { memo } from "react";

const f = (n: number) => n.toFixed(2);
const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
};

export const FLOOR_LABELS = ["L", "1", "2", "3", "4", "5", "6", "R"];
export const dialAngle = (floor: number) => -75 + (floor * 150) / 7;

/** Gradients shared by every drawing on the page. */
export function ArtDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="tl-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8e3a0" />
          <stop offset=".35" stopColor="#c0902f" />
          <stop offset=".55" stopColor="#f2d584" />
          <stop offset="1" stopColor="#7f5716" />
        </linearGradient>
        <linearGradient id="tl-brass-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2d584" />
          <stop offset=".5" stopColor="#a97c26" />
          <stop offset="1" stopColor="#6d4a12" />
        </linearGradient>
        <linearGradient id="tl-lacquer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e1525" />
          <stop offset="1" stopColor="#4a0812" />
        </linearGradient>
        <clipPath id="tl-burst-clip">
          <rect x="26" y="64" width="288" height="736" />
        </clipPath>
      </defs>
    </svg>
  );
}

const O: [number, number] = [320, 470];
const RAYS = Array.from({ length: 15 }, (_, i) => {
  const a0 = 180 + (i * 180) / 15;
  const a1 = 180 + ((i + 1) * 180) / 15;
  const p0 = polar(O[0], O[1], 760, a0);
  const p1 = polar(O[0], O[1], 760, a1);
  return `M${O[0]} ${O[1]}L${f(p0[0])} ${f(p0[1])}L${f(p1[0])} ${f(p1[1])}Z`;
});

/** One door's picture, drawn with the seam on its right. The other door is its mirror. */
const LEAF = (
  <g>
    <rect width="320" height="960" fill="url(#tl-lacquer)" />
    <g clipPath="url(#tl-burst-clip)">
      {RAYS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={i % 2 ? "url(#tl-brass)" : "#3f0710"}
          opacity={i % 2 ? 0.92 : 1}
        />
      ))}
      <circle
        cx={O[0]}
        cy={O[1]}
        r="292"
        fill="none"
        stroke="#8fd3bd"
        strokeWidth="2"
        opacity=".65"
      />
      <circle cx={O[0]} cy={O[1]} r="282" fill="none" stroke="#f2d584" strokeWidth="5" />
      <circle cx={O[0]} cy={O[1]} r="196" fill="#5f0d1b" stroke="#f2d584" strokeWidth="5" />
      <circle
        cx={O[0]}
        cy={O[1]}
        r="176"
        fill="none"
        stroke="#f4b8bf"
        strokeWidth="1.5"
        opacity=".8"
      />
      {Array.from({ length: 9 }, (_, i) => {
        const a = 190 + i * 20;
        const p = polar(O[0], O[1], 150, a);
        return <circle key={i} cx={f(p[0])} cy={f(p[1])} r="6" fill="url(#tl-brass)" />;
      })}
      <circle cx={O[0]} cy={O[1]} r="96" fill="url(#tl-brass)" />
      <circle cx={O[0]} cy={O[1]} r="74" fill="#5f0d1b" />
      <circle cx={O[0]} cy={O[1]} r="46" fill="#8fd3bd" />
      <circle cx={O[0]} cy={O[1]} r="20" fill="url(#tl-brass)" />
    </g>
    <g fill="none" stroke="url(#tl-brass-v)">
      <rect x="26" y="64" width="294" height="736" strokeWidth="6" />
      <rect x="10" y="30" width="310" height="786" strokeWidth="3" />
    </g>
    <path d="M320 64H150V84H210V104H262V124H320Z" fill="#3f0710" stroke="#f2d584" strokeWidth="3" />
    <path
      d="M320 800H170V780H226V760H276V740H320Z"
      fill="#3f0710"
      stroke="#f2d584"
      strokeWidth="3"
    />
    <rect x="0" y="826" width="320" height="134" fill="url(#tl-brass-v)" />
    {[846, 866, 886, 906, 926].map((y) => (
      <rect key={y} x="14" y={y} width="306" height="3" fill="#5e3f0e" opacity=".55" />
    ))}
    <rect x="316" width="4" height="960" fill="#1b0307" opacity=".7" />
  </g>
);

export const DoorLeaf = memo(function DoorLeaf({ side }: { side: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 320 960"
      preserveAspectRatio={side === "left" ? "xMaxYMid slice" : "xMinYMid slice"}
      aria-hidden="true"
    >
      {side === "left" ? LEAF : <g transform="translate(320 0) scale(-1 1)">{LEAF}</g>}
    </svg>
  );
});

const DIAL_RAYS = Array.from({ length: 19 }, (_, i) => {
  const a0 = -90 + (i * 180) / 19;
  const a1 = -90 + ((i + 1) * 180) / 19;
  const p0 = polar(160, 152, 148, a0);
  const p1 = polar(160, 152, 148, a1);
  return `M160 152L${f(p0[0])} ${f(p0[1])}L${f(p1[0])} ${f(p1[1])}Z`;
});

/** The sweeping floor indicator. The needle's sweep runs over the ride's length (--ride, set on the page's root). */
export function Dial({ at, passing }: { at: number; passing: number | null }) {
  return (
    <svg className="tl-dial" viewBox="0 0 320 166" aria-hidden="true">
      <path d="M4 158A156 156 0 0 1 316 158Z" fill="url(#tl-brass)" />
      <path d="M12 154A148 148 0 0 1 308 154Z" fill="#2a060c" />
      {DIAL_RAYS.map((d, i) => (i % 2 ? <path key={i} d={d} fill="#6e1220" /> : null))}
      <path
        d="M58 154A102 102 0 0 1 262 154Z"
        fill="#faf0d8"
        stroke="url(#tl-brass)"
        strokeWidth="4"
      />
      {Array.from({ length: 29 }, (_, i) => {
        const a = -75 + (i * 150) / 28;
        const p0 = polar(160, 152, 96, a);
        const p1 = polar(160, 152, i % 4 === 0 ? 86 : 91, a);
        return (
          <line
            key={i}
            x1={f(p0[0])}
            y1={f(p0[1])}
            x2={f(p1[0])}
            y2={f(p1[1])}
            stroke="#4a0812"
            strokeWidth={i % 4 === 0 ? 2 : 1}
          />
        );
      })}
      {FLOOR_LABELS.map((label, i) => {
        const p = polar(160, 156, 124, dialAngle(i));
        const on = passing === i || (passing === null && at === i);
        return (
          <text
            key={label}
            x={f(p[0])}
            y={f(p[1])}
            textAnchor="middle"
            className={on ? "tl-dial-n on" : "tl-dial-n"}
          >
            {label}
          </text>
        );
      })}
      <g className="tl-needle" style={{ transform: `rotate(${dialAngle(at)}deg)` }}>
        <path d="M157 152L159.4 62L160.6 62L163 152Z" fill="#8e1525" />
        <circle cx="160" cy="84" r="4.5" fill="none" stroke="#8e1525" strokeWidth="1.6" />
      </g>
      <circle cx="160" cy="152" r="13" fill="url(#tl-brass)" />
      <circle cx="160" cy="152" r="4" fill="#2a060c" />
      <rect x="4" y="154" width="312" height="8" fill="url(#tl-brass-v)" />
    </svg>
  );
}

const SKIN = "#c98d62";
const SKIN_DARK = "#a86f48";
const PLUM = "#3a1c4c";
const PLUM_DARK = "#27113a";

/** The operator's head and hat, used in the full figure and in the small portrait on each floor. */
function Head({ talkKey, tipKey }: { talkKey: number; tipKey: number }) {
  return (
    <g>
      <rect x="110" y="122" width="20" height="22" fill={SKIN_DARK} />
      <ellipse cx="88" cy="98" rx="5" ry="9" fill={SKIN_DARK} />
      <ellipse cx="152" cy="98" rx="5" ry="9" fill={SKIN_DARK} />
      <path
        d="M90 82C90 62 150 62 150 82L150 104C150 126 133 136 120 136C107 136 90 126 90 104Z"
        fill={SKIN}
      />
      <path d="M90 84C92 68 148 68 150 84C140 74 100 74 90 84Z" fill="#1d0f10" />
      <g className="tl-op-eyes">
        <ellipse cx="107" cy="96" rx="6.5" ry="5" fill="#fbf4e4" />
        <ellipse cx="133" cy="96" rx="6.5" ry="5" fill="#fbf4e4" />
        <g className="tl-op-pupils">
          <circle cx="108" cy="96.5" r="2.8" fill="#1d0f10" />
          <circle cx="134" cy="96.5" r="2.8" fill="#1d0f10" />
        </g>
        <g className="tl-op-lids" fill={SKIN}>
          <rect x="99" y="90" width="16" height="11" />
          <rect x="125" y="90" width="16" height="11" />
        </g>
      </g>
      <path
        d="M98 88Q107 84 115 89"
        fill="none"
        stroke="#1d0f10"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        className="tl-op-brow"
        d="M125 87Q134 79 143 85"
        fill="none"
        stroke="#1d0f10"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M120 96L116 110Q120 113 124 110"
        fill="none"
        stroke={SKIN_DARK}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        key={`mouth${talkKey}`}
        className="tl-op-mouth"
        d="M112 122Q120 126 128 122Q120 130 112 122Z"
        fill="#6e1220"
      />
      <path
        d="M120 116C114 112 104 116 99 113C103 121 114 122 120 118C126 122 137 121 141 113C136 116 126 112 120 116Z"
        fill="#1d0f10"
      />
      <g key={`hat${tipKey}`} className="tl-op-hat">
        <g transform="rotate(-9 120 60)">
          <path d="M94 54Q120 44 146 54L146 78Q120 86 94 78Z" fill="#b3162a" />
          <path d="M94 54Q120 64 146 54Q120 44 94 54Z" fill="#d62b40" />
          <path d="M94 70Q120 79 146 70L146 78Q120 87 94 78Z" fill="url(#tl-brass)" />
          <circle cx="120" cy="66" r="3.4" fill="url(#tl-brass)" />
        </g>
      </g>
    </g>
  );
}

export const Operator = memo(function Operator({
  talkKey,
  tipKey,
}: {
  talkKey: number;
  tipKey: number;
}) {
  return (
    <svg className="tl-op" viewBox="0 0 250 470" aria-hidden="true">
      <ellipse cx="124" cy="456" rx="96" ry="9" fill="#000" opacity=".35" />
      <g className="tl-op-lever">
        <rect x="201" y="262" width="7" height="190" fill="url(#tl-brass-v)" />
        <rect x="188" y="444" width="33" height="10" rx="2" fill="url(#tl-brass-v)" />
        <circle cx="204.5" cy="258" r="11" fill="url(#tl-brass)" />
      </g>
      <g className="tl-op-body">
        <path d="M92 300H118L116 444H94Z" fill={PLUM_DARK} />
        <path d="M122 300H148L146 444H124Z" fill={PLUM_DARK} />
        <rect x="102" y="306" width="3.5" height="136" fill="#c0902f" />
        <rect x="133" y="306" width="3.5" height="136" fill="#c0902f" />
        <path d="M84 450Q86 438 118 440L118 454H84Z" fill="#120809" />
        <path d="M122 440Q156 438 158 450L158 454H122Z" fill="#120809" />
        <path
          d="M76 172L60 232L58 296"
          fill="none"
          stroke={PLUM}
          strokeWidth="25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="58" cy="303" r="12.5" fill="#fbf4e4" />
        <path d="M70 158Q120 136 170 158L176 310Q120 320 64 310Z" fill={PLUM} />
        <path d="M104 146L120 214L136 146Z" fill="#fbf4e4" />
        <path d="M104 146L120 214L92 180Z" fill={PLUM_DARK} />
        <path d="M136 146L120 214L148 180Z" fill={PLUM_DARK} />
        <path d="M110 154L120 160L130 154L130 168L120 162L110 168Z" fill="#b3162a" />
        {[226, 252, 278].flatMap((y) => [
          <circle key={`a${y}`} cx="102" cy={y} r="4.6" fill="url(#tl-brass)" />,
          <circle key={`b${y}`} cx="138" cy={y} r="4.6" fill="url(#tl-brass)" />,
        ])}
        <path d="M64 306Q120 316 176 306L177 316Q120 326 63 316Z" fill={PLUM_DARK} />
        <path d="M66 154L88 146L90 158L68 168Z" fill="url(#tl-brass)" />
        <path d="M174 154L152 146L150 158L172 168Z" fill="url(#tl-brass)" />
        <path
          d="M166 170Q190 218 204 256"
          fill="none"
          stroke={PLUM}
          strokeWidth="25"
          strokeLinecap="round"
        />
        <circle cx="205" cy="262" r="13" fill="#fbf4e4" />
        <Head talkKey={talkKey} tipKey={tipKey} />
      </g>
    </svg>
  );
});

/** The operator's portrait in a brass frame, for when he's waiting in the lift behind you. */
export const Cameo = memo(function Cameo({ talkKey, tipKey }: { talkKey: number; tipKey: number }) {
  return (
    <svg className="tl-cameo" viewBox="66 36 108 108" aria-hidden="true">
      <circle cx="120" cy="90" r="53" fill="#5f0d1b" stroke="url(#tl-brass)" strokeWidth="3" />
      <Head talkKey={talkKey} tipKey={tipKey} />
    </svg>
  );
});

/** A brass room key with its paper tag. */
export function Key({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 34 92" aria-hidden="true" className="tl-keysvg">
      <path
        d="M17 18V60M17 46H24M17 54H22"
        fill="none"
        stroke="url(#tl-brass)"
        strokeWidth="4"
        strokeLinecap="square"
      />
      <circle cx="17" cy="11" r="8" fill="none" stroke="url(#tl-brass)" strokeWidth="4.4" />
      <path d="M6 62H28L31 69L28 90H6L3 69Z" fill="#f7c9cf" stroke="#7a1430" strokeWidth="1.3" />
      <circle cx="17" cy="67" r="1.8" fill="#7a1430" />
      <text x="17" y="84" textAnchor="middle" className="tl-key-n">
        {label}
      </text>
    </svg>
  );
}

export const Chandelier = memo(function Chandelier() {
  return (
    <svg className="tl-chand" viewBox="0 0 300 300" aria-hidden="true">
      <rect x="148" y="0" width="4" height="90" fill="url(#tl-brass-v)" />
      <path d="M150 90L60 170H240Z" fill="none" stroke="url(#tl-brass)" strokeWidth="4" />
      <path d="M150 90L105 210H195Z" fill="none" stroke="url(#tl-brass)" strokeWidth="3" />
      <ellipse
        cx="150"
        cy="170"
        rx="92"
        ry="11"
        fill="none"
        stroke="url(#tl-brass)"
        strokeWidth="5"
      />
      <ellipse
        cx="150"
        cy="210"
        rx="48"
        ry="7"
        fill="none"
        stroke="url(#tl-brass)"
        strokeWidth="4"
      />
      {[-90, -60, -30, 0, 30, 60, 90].map((x, i) => (
        <g key={x}>
          <path d={`M${150 + x} ${174}v${18 + (i % 2) * 18}`} stroke="#8fd3bd" strokeWidth="2" />
          <path
            d={`M${150 + x} ${192 + (i % 2) * 18}l-6 12l6 14l6-14z`}
            fill="#fbf4e4"
            stroke="#8fd3bd"
            strokeWidth="1"
          />
        </g>
      ))}
      <circle cx="150" cy="252" r="9" fill="#fbf4e4" stroke="url(#tl-brass)" strokeWidth="2" />
    </svg>
  );
});

/** A fixed little number sequence, so the skyline's windows land in the same place on server and browser. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const TOWERS: [number, number, number, number][] = [
  [0, 120, 150, 0],
  [110, 90, 230, 1],
  [190, 130, 180, 0],
  [310, 80, 300, 2],
  [380, 120, 210, 1],
  [490, 90, 130, 0],
  [570, 110, 260, 1],
  [670, 150, 170, 0],
  [810, 90, 340, 2],
  [890, 120, 220, 1],
  [1000, 100, 150, 0],
  [1090, 130, 280, 1],
  [1210, 90, 190, 0],
  [1290, 110, 320, 2],
  [1390, 120, 170, 1],
  [1500, 110, 240, 0],
];

const WINDOWS = (() => {
  const r = seeded(4321);
  const out: { x: number; y: number; on: boolean; tw: number }[] = [];
  for (const [x, w, h] of TOWERS) {
    for (let wy = 420 - h + 26; wy < 410; wy += 17) {
      for (let wx = x + 12; wx < x + w - 12; wx += 15) {
        const v = r();
        if (v < 0.42)
          out.push({
            x: wx,
            y: wy,
            on: true,
            tw: out.length % 11 === 0 ? (out.length % 5) + 1 : 0,
          });
      }
    }
  }
  return out;
})();

/** The skyline at dusk: stepped Deco towers with their windows coming on. */
export const Skyline = memo(function Skyline() {
  return (
    <svg
      className="tl-sky"
      viewBox="0 0 1600 420"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      {TOWERS.map(([x, w, h, kind], i) => {
        const top = 420 - h;
        const inset = w * 0.16;
        const d =
          kind === 0
            ? `M${x} 420V${top}H${x + w}V420Z`
            : `M${x} 420V${top + 44}H${f(x + inset)}V${top + 20}H${f(x + inset * 2)}V${top}H${f(x + w - inset * 2)}V${top + 20}H${f(x + w - inset)}V${top + 44}H${x + w}V420Z`;
        return (
          <g key={i}>
            {kind === 2 && (
              <path
                d={`M${x + w / 2 - 5} ${top}L${x + w / 2} ${top - 70}L${x + w / 2 + 5} ${top}Z`}
                fill="#27113a"
              />
            )}
            <path d={d} fill={i % 2 ? "#27113a" : "#321636"} />
          </g>
        );
      })}
      {WINDOWS.map((w, i) => (
        <rect
          key={i}
          x={w.x}
          y={w.y}
          width="6"
          height="9"
          fill="#ffd98a"
          className={w.tw ? `tl-tw tl-tw${w.tw}` : undefined}
          opacity={w.tw ? undefined : 0.72}
        />
      ))}
    </svg>
  );
});

const BULBS = Array.from({ length: 15 }, (_, i) => {
  const t = i / 14;
  return { x: f(30 + t * 1540), y: f(18 + Math.sin(t * Math.PI * 3) ** 2 * 44) };
});

/** Festoon lights across the rooftop. */
export const Festoon = memo(function Festoon() {
  const d = BULBS.map((b, i) => `${i ? "L" : "M"}${b.x} ${b.y}`).join("");
  return (
    <svg className="tl-festoon" viewBox="0 0 1600 90" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="#1d0f10" strokeWidth="1.5" />
      {BULBS.map((b, i) => (
        <ellipse
          key={i}
          cx={b.x}
          cy={Number(b.y) + 6}
          rx="5"
          ry="7"
          fill="#ffe7ad"
          className={i % 3 ? undefined : "tl-tw tl-tw2"}
        />
      ))}
    </svg>
  );
});

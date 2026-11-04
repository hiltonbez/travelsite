// The drawn things: eight bottles, their label marks, the garnishes and the barman.
import { rgbCss, type IngredientId, type RGB } from "./data";

const SHAPES: Record<IngredientId, string> = {
  sun: "M30 8h20v34c0 14 20 16 20 40v102a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8V82c0-24 20-26 20-40z",
  sea: "M32 8h16v30l22 14v134a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6V52l22-14z",
  wildlife: "M31 8h18v24c0 10 23 12 23 40v112a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8V72c0-28 23-30 23-40z",
  oldtowns: "M34 8h12v70c0 10 22 16 22 36v70a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8v-70c0-20 22-26 22-36z",
  luxury: "M33 8h14v44c0 10 27 26 27 66 0 44-18 74-34 74S6 162 6 118c0-40 27-56 27-66z",
  adrenaline: "M32 8h16v28c0 6 14 8 14 22v128a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6V58c0-14 14-16 14-22z",
  romance:
    "M33 8h14v36c0 6 23 18 23 42 0 20-12 26-12 40 0 18 12 24 12 44 0 14-10 22-30 22s-30-8-30-22c0-20 12-26 12-44 0-14-12-20-12-40 0-24 23-36 23-42z",
  food: "M32 8h16v30l18 18v128a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8V56l18-18z",
};

const LABEL_Y: Record<IngredientId, number> = {
  sun: 106,
  sea: 100,
  wildlife: 100,
  oldtowns: 122,
  luxury: 100,
  adrenaline: 96,
  romance: 94,
  food: 102,
};

/** The little mark on each label. Drawn in a 24-unit box. */
export function Mark({ id, color }: { id: IngredientId; color: string }) {
  switch (id) {
    case "sun":
      return (
        <g fill={color} stroke={color} strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.6" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <path key={a} d="M12 2.5v3" transform={`rotate(${a} 12 12)`} />
          ))}
        </g>
      );
    case "sea":
      return (
        <path
          d="M2 8c3-3 5-3 7 0s5 3 6 0 5-3 7 0M2 13c3-3 5-3 7 0s5 3 6 0 5-3 7 0M2 18c3-3 5-3 7 0s5 3 6 0 5-3 7 0"
          fill="none"
          stroke={color}
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      );
    case "wildlife":
      return (
        <path
          fill={color}
          d="M3 12C3 7 7 5 11 5c4 0 7 2 8 5 2 1 3 4 2 7-.2.9-1.7 1-1.8 0-.2-1.7-.6-3-1.2-3.600V19h-3v-3.500H9V19H6v-3.800C4 15 3 14 3 12z"
        />
      );
    case "oldtowns":
      return (
        <path
          fill="none"
          stroke={color}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 21h18M5 21V11a7 7 0 0 1 14 0v10M9 21v-8a3 3 0 0 1 6 0v8M12 4V2"
        />
      );
    case "luxury":
      return (
        <path
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
          d="M6 4h12l4 6-10 11L2 10zM2 10h20M9 10l3 11 3-11M9 10l2-6M15 10l-2-6"
        />
      );
    case "adrenaline":
      return <path fill={color} d="M14 1 4 14h6l-2 9 11-14h-6z" />;
    case "romance":
      return (
        <path
          fill={color}
          d="M12 21C5 15.5 2 12 2 8a5 5 0 0 1 10-1.500A5 5 0 0 1 22 8c0 4-3 7.5-10 13z"
        />
      );
    case "food":
      return (
        <path
          fill="none"
          stroke={color}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 2v7a2.5 2.5 0 0 0 5 0V2M8.5 2v20M17 22v-8h-3c0-7 1.5-11 3-12z"
        />
      );
  }
}

export function BottleArt({ id, rgb }: { id: IngredientId; rgb: RGB }) {
  const d = SHAPES[id];
  const glow = `hb-g-${id}`;
  const clip = `hb-c-${id}`;
  const ly = LABEL_Y[id];
  return (
    <svg viewBox="0 0 80 200" className="hb-bottle-svg" aria-hidden="true">
      <defs>
        <linearGradient id={glow} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={rgbCss(rgb, 0.55)} />
          <stop offset=".3" stopColor={rgbCss(rgb, 1)} />
          <stop offset=".65" stopColor={rgbCss(rgb, 0.95)} />
          <stop offset="1" stopColor={rgbCss(rgb, 0.4)} />
        </linearGradient>
        <clipPath id={clip}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill="#0c1f19" fillOpacity=".78" />
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="50" width="80" height="150" fill={`url(#${glow})`} />
        <ellipse cx="40" cy="50" rx="40" ry="3" fill="#fff" fillOpacity=".35" />
        <rect x="0" y="176" width="80" height="24" fill="#000" fillOpacity=".24" />
        <rect x="17" y="10" width="6" height="190" fill="#fff" fillOpacity=".3" />
        <rect x="59" y="10" width="3" height="190" fill="#fff" fillOpacity=".15" />
      </g>
      <path d={d} fill="none" stroke="#fff4d6" strokeOpacity=".55" strokeWidth="1.2" />
      {/* foil and cork */}
      <rect className="hb-cork" x="30" y="2" width="20" height="9" rx="2" fill="#6c4522" />
      <rect x="29" y="10" width="22" height="20" rx="1.5" fill="#c49a45" />
      <rect x="29" y="16" width="22" height="2" fill="#7c5a1c" />
      <rect x="33" y="10" width="4" height="20" fill="#fff" fillOpacity=".28" />
      {/* the label */}
      <g transform={`translate(0 ${ly})`}>
        <rect x="16" y="0" width="48" height="50" rx="2" fill="#f5e7c4" />
        <rect
          x="19"
          y="3"
          width="42"
          height="44"
          rx="1"
          fill="none"
          stroke="#14382c"
          strokeWidth=".8"
        />
        <g transform="translate(26.8 10) scale(1.1)">
          <Mark id={id} color="#14382c" />
        </g>
        <rect x="26" y="39" width="28" height="1.4" fill="#14382c" />
        <rect x="31" y="42.5" width="18" height="1" fill="#14382c" />
      </g>
    </svg>
  );
}

/** What the barman finishes the drink with: it depends on the biggest pour in the glass. */
export function Garnish({ id }: { id: IngredientId }) {
  return (
    <svg viewBox="0 0 80 80" className="hb-garnish-svg" aria-hidden="true">
      {id === "sun" && (
        <g>
          <circle cx="40" cy="40" r="27" fill="#e8730c" />
          <circle cx="40" cy="40" r="23" fill="#fdd9a0" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <path
              key={a}
              d="M40 40 33.5 21a20 20 0 0 1 13 0z"
              fill="#ff9a1f"
              transform={`rotate(${a} 40 40)`}
            />
          ))}
        </g>
      )}
      {id === "sea" && (
        <g>
          <path d="M42 26 54 72" stroke="#f5e7c4" strokeWidth="3" strokeLinecap="round" />
          <path d="M6 34C14 12 56 2 74 22Z" fill="#0aa7b6" />
          <path
            d="M6 34C16 26 21 26 25 27 31 19 38 16 46 16 53 16 60 16 74 22 58 3 14 11 6 34Z"
            fill="#ff5fa2"
          />
          <path
            d="M6 34 42 8M25 27 42 8M46 16 42 8M74 22 42 8"
            stroke="#f5e7c4"
            strokeWidth="1"
            fill="none"
          />
        </g>
      )}
      {id === "wildlife" && (
        <g fill="#2d7a33" stroke="#123f1e" strokeWidth=".8">
          <path d="M20 72C26 46 42 24 66 12 64 38 48 62 20 72Z" />
          <path d="M22 70 62 16" fill="none" stroke="#a7d65a" strokeWidth="1.4" />
          <path d="M18 74C12 54 14 34 26 14 38 32 36 56 18 74Z" fill="#3e9a3a" />
        </g>
      )}
      {id === "oldtowns" && (
        <g>
          <rect
            x="33"
            y="4"
            width="11"
            height="70"
            rx="5"
            fill="#8d4a1e"
            transform="rotate(18 40 40)"
          />
          <rect
            x="37"
            y="4"
            width="3"
            height="70"
            rx="1.5"
            fill="#c98a4a"
            transform="rotate(18 40 40)"
          />
          <rect
            x="44"
            y="6"
            width="9"
            height="66"
            rx="4.5"
            fill="#a4592a"
            transform="rotate(24 40 40)"
          />
        </g>
      )}
      {id === "luxury" && (
        <g>
          <path
            d="M42 40C44 24 52 14 66 8"
            fill="none"
            stroke="#c49a45"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="36" cy="52" r="20" fill="#c49a45" />
          <circle cx="36" cy="52" r="20" fill="#f7dc8c" fillOpacity=".5" />
          <path
            d="M23 45a15 15 0 0 1 12-9"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )}
      {id === "adrenaline" && (
        <g>
          <path
            d="M58 14C50 16 49 22 50 26 36 30 22 46 18 72 40 64 62 46 60 28 64 26 64 20 66 16"
            fill="#ed1c2e"
          />
          <path
            d="M50 26C54 22 60 24 60 28"
            fill="none"
            stroke="#2d7a33"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M60 18 66 10" stroke="#2d7a33" strokeWidth="3.5" strokeLinecap="round" />
          <path
            d="M28 58C34 46 42 38 50 34"
            fill="none"
            stroke="#fff"
            strokeOpacity=".6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )}
      {id === "romance" && (
        <g>
          <path
            d="M28 50C32 28 42 16 60 8M54 54C54 34 56 20 60 8"
            fill="none"
            stroke="#2d7a33"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="26" cy="58" r="15" fill="#d6123f" />
          <circle cx="54" cy="62" r="14" fill="#ef2a5d" />
          <path
            d="M18 54a9 9 0 0 1 7-6M47 58a8 8 0 0 1 6-6"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )}
      {id === "food" && (
        <g>
          <path
            d="M26 76C32 52 46 30 64 6"
            fill="none"
            stroke="#5a4020"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <g key={i} transform={`translate(${30 + i * 4.5} ${66 - i * 7})`}>
              <path
                d="M0 0C-8-2-12-7-14-11M0 0C8 0 13-3 16-7"
                fill="none"
                stroke="#2f8440"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

export function Barman() {
  return (
    <svg viewBox="0 0 220 300" className="hb-barman-svg" aria-hidden="true">
      <defs>
        <linearGradient id="hb-rim" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ffb95a" stopOpacity=".65" />
          <stop offset=".3" stopColor="#ffb95a" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* shirt and shoulders */}
      <path
        d="M36 300c-3-44 4-92 28-112 14-12 34-16 46-16s34 4 48 16c24 20 30 68 28 112z"
        fill="#efe4c8"
      />
      {/* waistcoat */}
      <path d="M72 300c-4-40-2-84 12-112l26 34 26-34c14 28 16 72 12 112z" fill="#8c2f24" />
      <path d="M110 222v78" stroke="#561a13" strokeWidth="2" />
      <circle cx="116" cy="240" r="2.6" fill="#e6bd62" />
      <circle cx="116" cy="264" r="2.6" fill="#e6bd62" />
      <circle cx="116" cy="288" r="2.6" fill="#e6bd62" />
      {/* collar and bow tie */}
      <path d="M86 174l24 22 24-22 6 12-30 36-30-36z" fill="#fbf4df" />
      <path d="M110 194l-22-12v24zM110 194l22-12v24z" fill="#ff4d7e" />
      <circle cx="110" cy="194" r="5" fill="#d42a5a" />
      {/* the arm that polishes */}
      <g className="hb-barman-arm">
        <path
          d="M172 212c16 10 22 30 14 50-5 12-28 12-42 2-12-9-6-26 6-22 8 3 14 4 18-2 3-6 0-14-6-20z"
          fill="#efe4c8"
        />
        <path
          d="M150 262c-14-12-22-22-14-44 2-6 40-6 42 2 6 22-8 38-28 42z"
          fill="#d9c8a2"
          opacity="0"
        />
        <path
          d="M118 218h44l-6 48c-1 6-31 6-32 0z"
          fill="#fff"
          fillOpacity=".3"
          stroke="#fff6dd"
          strokeOpacity=".8"
          strokeWidth="2"
        />
        <path d="M116 232c12-6 34-4 48 6l-4 26c-14 8-30 4-40-4z" fill="#f7f1df" />
        <path
          d="M122 240c10-3 24-1 34 4M123 250c10-2 22 0 32 4"
          stroke="#c9b98f"
          strokeWidth="1.5"
          fill="none"
        />
      </g>
      {/* neck and head */}
      <path d="M92 152h36v32c-10 10-26 10-36 0z" fill="#8d5a36" />
      <g className="hb-barman-head">
        <path
          d="M66 96c0-34 20-52 44-52s44 18 44 52c0 34-20 66-44 66S66 130 66 96z"
          fill="#a66c42"
        />
        <path
          d="M66 96c0-34 20-52 44-52-18 8-30 26-30 54 0 26 12 50 30 64-24 0-44-32-44-66z"
          fill="url(#hb-rim)"
        />
        <path
          d="M64 98c-8-2-12 4-10 12 2 8 8 12 14 10zM156 98c8-2 12 4 10 12-2 8-8 12-14 10z"
          fill="#96603a"
        />
        {/* eyes */}
        <g className="hb-barman-eyes">
          <ellipse cx="92" cy="98" rx="4" ry="4.8" fill="#1e1009" />
          <ellipse cx="128" cy="98" rx="4" ry="4.8" fill="#1e1009" />
          <circle cx="93.5" cy="96.5" r="1.2" fill="#fff" />
          <circle cx="129.5" cy="96.5" r="1.2" fill="#fff" />
        </g>
        <path
          className="hb-barman-brow"
          d="M82 86c6-4 12-4 18-1"
          stroke="#2a170d"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M120 85c6-3 12-3 18 1"
          stroke="#2a170d"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* nose, moustache, smile */}
        <path
          d="M110 100c-3 8-5 14-4 18 2 2 6 2 8 0"
          stroke="#7d4c2b"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M110 122c-8-6-26-6-36-2-6 2-10-2-12-7 2 12 12 20 26 18 10-1 18-4 22-7 4 3 12 6 22 7 14 2 24-6 26-18-2 5-6 9-12 7-10-4-28-4-36 2z"
          fill="#20120a"
        />
        <path
          d="M98 136c6 6 18 6 24 0"
          stroke="#5d2f1b"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
        {/* panama */}
        <path
          d="M34 70c12 10 40 16 76 16s64-6 76-16c6-5 0-10-8-8-20 6-44 8-68 8s-48-2-68-8c-8-2-14 3-8 8z"
          fill="#f4e6bf"
        />
        <path d="M66 68c0-30 10-50 44-50s44 20 44 50c-26 6-62 6-88 0z" fill="#f8edcc" />
        <path d="M66 56c26 6 62 6 88 0l1 13c-27 6-63 6-90 0z" fill="#14382c" />
        <path
          d="M86 24c-10 8-14 20-14 30"
          stroke="#fff"
          strokeOpacity=".7"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

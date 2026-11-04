// The sixteen things on the bed: their drawings, their weight in the hand, what each says about the holiday.
import type { ReactNode } from "react";
import type { Mood } from "@/concepts/kit";

export type Item = {
  id: string;
  label: string;
  w: number;
  h: number;
  mass: number;
  moods: Partial<Record<Mood, number>>;
  /** What's said when it lands in the case. */
  quip: string;
  /** Its line on the packing list. */
  list: string;
  art: ReactNode;
};

const INK = "#2f2519";
const line = {
  stroke: INK,
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ITEMS: Item[] = [
  {
    id: "snorkel",
    label: "snorkel",
    w: 136,
    h: 66,
    mass: 1,
    moods: { beach: 3, adventure: 1 },
    quip: "A snorkel. Somebody wants to meet a fish.",
    list: "Snorkel, because the good stuff is under the surface",
    art: (
      <>
        <path
          d="M66 34 C86 36 100 24 106 12 C108 8 114 6 128 5"
          fill="none"
          stroke={INK}
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M66 34 C86 36 100 24 106 12 C108 8 114 6 128 5"
          fill="none"
          stroke="#e0a63e"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path d="M112 8.5 l7 -2 M100 22 l6 4" stroke="#c8623a" strokeWidth="4" fill="none" />
        <path
          d="M5 34 C3 14 18 10 38 11 C58 10 73 15 71 34 C70 52 58 56 48 52 C42 49 34 49 28 52 C18 56 6 52 5 34Z"
          fill="#4f8f8c"
          {...line}
        />
        <path
          d="M13 32 C12 20 22 18 38 18 C54 18 64 20 63 32 C62 42 54 45 47 42 C41 39 35 39 29 42 C22 45 14 42 13 32Z"
          fill="#cfe5dc"
          {...line}
        />
        <path
          d="M22 25 l14 -2 M21 31 l7 -1"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          opacity=".9"
        />
        <path
          d="M5 30 C1 24 1 20 6 12 M71 30 C74 26 75 22 73 15"
          fill="none"
          stroke="#2c5a58"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    id: "binoculars",
    label: "binoculars",
    w: 100,
    h: 92,
    mass: 1.5,
    moods: { wildlife: 3 },
    quip: "Binoculars. Those aren't for the neighbours, I hope.",
    list: "Binoculars, for the leopard everyone else missed",
    art: (
      <>
        <path
          d="M18 60 C4 92 92 96 82 60"
          fill="none"
          stroke="#7d4f2a"
          strokeWidth="3.4"
          strokeDasharray="2 0"
        />
        <rect x="8" y="28" width="34" height="50" rx="9" fill="#55603f" {...line} />
        <rect x="58" y="28" width="34" height="50" rx="9" fill="#55603f" {...line} />
        <path
          d="M14 40 h22 M14 48 h22 M14 56 h22 M64 40 h22 M64 48 h22 M64 56 h22"
          stroke="#39422b"
          strokeWidth="2"
        />
        <rect x="40" y="30" width="20" height="14" rx="3" fill="#b08a45" {...line} />
        <circle cx="50" cy="37" r="4.4" fill="#8d6c30" {...line} />
        <rect x="12" y="10" width="26" height="22" rx="5" fill="#2f3324" {...line} />
        <rect x="62" y="10" width="26" height="22" rx="5" fill="#2f3324" {...line} />
        <ellipse cx="25" cy="15" rx="9" ry="3.6" fill="#a7cfd0" {...line} />
        <ellipse cx="75" cy="15" rx="9" ry="3.6" fill="#a7cfd0" {...line} />
      </>
    ),
  },
  {
    id: "heels",
    label: "the good heels",
    w: 108,
    h: 80,
    mass: 0.9,
    moods: { luxury: 2, romance: 2, food: 1 },
    quip: "The good heels. So not the bush, then.",
    list: "The good heels, for dinner with a view",
    art: (
      <>
        <path
          d="M15 8 C24 3 33 10 37 20 C44 36 62 48 88 52 C104 55 106 69 94 70 L56 70 C42 70 32 56 24 44 L20 74 L13 74 L9 30 C8 20 10 12 15 8Z"
          fill="#b8452f"
          {...line}
        />
        <path d="M20 40 C30 56 42 66 58 70 L92 70" fill="none" stroke="#7c2a1c" strokeWidth="3" />
        <path
          d="M14 12 C22 8 30 14 33 24 C38 38 54 50 76 51"
          fill="none"
          stroke="#f0c9a8"
          strokeWidth="2.4"
          opacity=".75"
        />
        <path
          d="M62 49 C68 42 76 42 82 51"
          fill="none"
          stroke="#e0a63e"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    id: "boots",
    label: "hiking boots",
    w: 110,
    h: 100,
    mass: 2.4,
    moods: { adventure: 3 },
    quip: "Boots. Your knees have been told.",
    list: "Hiking boots, already muddy, which is a good start",
    art: (
      <>
        <path
          d="M14 8 L52 6 C54 22 58 34 68 42 C80 50 100 50 104 66 C106 74 104 80 100 82 L12 82 C8 60 10 30 14 8Z"
          fill="#8a5a32"
          {...line}
        />
        <path d="M12 12 L52 10 L53 18 L12 20Z" fill="#c8623a" {...line} />
        <path
          d="M50 24 C44 30 40 38 40 46 M56 32 L46 46 M62 39 L54 52 M70 45 L62 56"
          stroke="#f1e2bf"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M12 62 C30 66 44 58 54 62 C70 68 86 66 104 68"
          fill="none"
          stroke="#5c3a1d"
          strokeWidth="2.2"
        />
        <path
          d="M10 82 H102 L100 92 H90 L88 87 H80 L78 92 H66 L64 87 H56 L54 92 H42 L40 87 H32 L30 92 H12Z"
          fill="#2f2519"
          {...line}
        />
        <path d="M20 30 h20 M20 40 h16" stroke="#5c3a1d" strokeWidth="2" strokeDasharray="3 3" />
      </>
    ),
  },
  {
    id: "sunhat",
    label: "big sunhat",
    w: 112,
    h: 112,
    mass: 0.7,
    moods: { beach: 2, culture: 1 },
    quip: "A big sunhat. Very mysterious. Also, you'll lose it.",
    list: "The big sunhat, until the wind has it",
    art: (
      <>
        <circle cx="56" cy="56" r="52" fill="#e6cf9a" {...line} />
        <circle
          cx="56"
          cy="56"
          r="44"
          fill="none"
          stroke="#c8a765"
          strokeWidth="1.6"
          strokeDasharray="5 4"
        />
        <circle
          cx="56"
          cy="56"
          r="36"
          fill="none"
          stroke="#c8a765"
          strokeWidth="1.6"
          strokeDasharray="4 5"
        />
        <circle cx="56" cy="56" r="27" fill="#2d6a73" {...line} />
        <circle cx="56" cy="56" r="21" fill="#efdcae" {...line} />
        <circle
          cx="56"
          cy="56"
          r="14"
          fill="none"
          stroke="#c8a765"
          strokeWidth="1.5"
          strokeDasharray="3 4"
        />
        <path
          d="M78 72 C86 84 84 96 92 104 M82 68 C96 76 98 90 106 92"
          fill="none"
          stroke="#2d6a73"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    id: "wine",
    label: "a good glass",
    w: 56,
    h: 120,
    mass: 0.6,
    moods: { food: 3, adventure: 1 },
    quip: "Your own wine glass. Wrap it in a sock, please.",
    list: "A proper wine glass, wrapped in a sock",
    art: (
      <>
        <path
          d="M10 6 H46 C52 32 46 58 28 60 C10 58 4 32 10 6Z"
          fill="#f4efe2"
          fillOpacity=".55"
          {...line}
        />
        <path d="M7.5 26 H48.5 C50 42 42 58 28 60 C14 58 6 42 7.5 26Z" fill="#8a2438" />
        <path d="M8 26 C18 30 38 22 48 26" fill="none" stroke="#b6455a" strokeWidth="2.4" />
        <path
          d="M15 12 C13 24 14 36 19 46"
          fill="none"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          opacity=".8"
        />
        <path d="M28 60 V104" stroke={INK} strokeWidth="4.4" />
        <path d="M28 60 V104" stroke="#f4efe2" strokeWidth="2" />
        <path d="M10 112 C14 104 42 104 46 112 C42 116 14 116 10 112Z" fill="#f4efe2" {...line} />
      </>
    ),
  },
  {
    id: "passport",
    label: "passport",
    w: 74,
    h: 100,
    mass: 0.5,
    moods: { culture: 1, luxury: 1 },
    quip: "The passport. That's the first sensible thing you've done.",
    list: "Passport, and do check the date on it",
    art: (
      <>
        <rect x="5" y="4" width="64" height="92" rx="5" fill="#2c5642" {...line} />
        <rect
          x="10"
          y="9"
          width="54"
          height="82"
          rx="3"
          fill="none"
          stroke="#d9b45c"
          strokeWidth="1.2"
        />
        <circle cx="37" cy="42" r="15" fill="none" stroke="#d9b45c" strokeWidth="2" />
        <ellipse cx="37" cy="42" rx="7" ry="15" fill="none" stroke="#d9b45c" strokeWidth="1.4" />
        <path d="M22 42 H52 M25 34 H49 M25 50 H49" stroke="#d9b45c" strokeWidth="1.4" />
        <text
          x="37"
          y="73"
          textAnchor="middle"
          fontFamily="'Special Elite', monospace"
          fontSize="9.4"
          fill="#d9b45c"
          letterSpacing=".8"
        >
          PASSPORT
        </text>
        <path d="M61 4 v24 l4 -3 l4 3 V9" fill="#c8623a" stroke={INK} strokeWidth="1.2" />
      </>
    ),
  },
  {
    id: "camera",
    label: "old camera",
    w: 108,
    h: 78,
    mass: 1.6,
    moods: { culture: 2, wildlife: 1 },
    quip: "A proper camera. Three hundred photos of one sunset, coming up.",
    list: "The old camera, with film you'll forget to develop",
    art: (
      <>
        <path d="M14 26 C6 4 102 4 94 26" fill="none" stroke="#7d4f2a" strokeWidth="3.4" />
        <rect x="30" y="12" width="24" height="12" rx="2" fill="#3a3a36" {...line} />
        <rect x="6" y="22" width="96" height="50" rx="7" fill="#d9cdb2" {...line} />
        <rect x="6" y="36" width="96" height="36" fill="#6b4a2c" {...line} />
        <circle cx="54" cy="46" r="22" fill="#2f2c28" {...line} />
        <circle cx="54" cy="46" r="15" fill="#4d6b78" {...line} />
        <circle cx="54" cy="46" r="8" fill="#1d2b33" />
        <path
          d="M46 39 a11 11 0 0 1 8 -4"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity=".8"
        />
        <circle cx="86" cy="29" r="4.5" fill="#b08a45" {...line} />
        <rect x="12" y="26" width="13" height="7" rx="1.5" fill="#8fb3b5" {...line} />
      </>
    ),
  },
  {
    id: "safari",
    label: "safari hat",
    w: 118,
    h: 76,
    mass: 0.8,
    moods: { wildlife: 3, adventure: 1 },
    quip: "The safari hat. You will wear it once, and look magnificent.",
    list: "Safari hat, for looking like you know what spoor is",
    art: (
      <>
        <path
          d="M4 48 C22 40 96 40 114 48 C118 56 100 60 59 60 C18 60 0 56 4 48Z"
          fill="#a89a66"
          {...line}
        />
        <path
          d="M30 44 C30 16 40 7 59 7 C78 7 88 16 88 44 C70 50 48 50 30 44Z"
          fill="#bcae79"
          {...line}
        />
        <path d="M30 34 C48 41 70 41 88 34 L88 44 C70 50 48 50 30 44Z" fill="#7d4f2a" {...line} />
        <path
          d="M38 40 l3 2 M47 42 l3 1 M58 43 h3 M68 42 l3 -1 M78 40 l3 -2"
          stroke="#e0c07a"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path d="M59 8 C54 16 54 24 56 30" fill="none" stroke="#8f8254" strokeWidth="1.8" />
        <path
          d="M44 58 C46 68 56 74 60 72 C66 74 72 66 74 58"
          fill="none"
          stroke="#5c3a1d"
          strokeWidth="2"
        />
      </>
    ),
  },
  {
    id: "novel",
    label: "long novel",
    w: 80,
    h: 104,
    mass: 1.1,
    moods: { beach: 1, culture: 2 },
    quip: "A long novel. Page twelve by the end of the trip, tops.",
    list: "That long novel, page twelve at the outside",
    art: (
      <>
        <path d="M12 8 L74 8 L74 98 L12 98Z" fill="#f1e6cc" {...line} />
        <rect x="5" y="4" width="65" height="96" rx="2" fill="#d97f5a" {...line} />
        <rect x="5" y="4" width="9" height="96" fill="#b8603f" />
        <circle cx="43" cy="42" r="17" fill="#f0c76b" />
        <path d="M14 62 C26 56 34 66 46 60 C56 56 62 60 70 58 V100 H14Z" fill="#2d6a73" />
        <path
          d="M14 74 C26 68 36 78 48 72 C56 68 64 72 70 70"
          fill="none"
          stroke="#a7cfd0"
          strokeWidth="2"
        />
        <text
          x="42"
          y="19"
          textAnchor="middle"
          fontFamily="Fraunces, Georgia, serif"
          fontStyle="italic"
          fontSize="10.5"
          fill="#3a1f12"
        >
          A Long
        </text>
        <text
          x="42"
          y="90"
          textAnchor="middle"
          fontFamily="Fraunces, Georgia, serif"
          fontStyle="italic"
          fontSize="10.5"
          fill="#f1e6cc"
        >
          Novel
        </text>
        <path d="M60 0 v20 l-4 -3 l-4 3 V0Z" fill="#e0a63e" stroke={INK} strokeWidth="1.2" />
      </>
    ),
  },
  {
    id: "poncho",
    label: "rain poncho",
    w: 104,
    h: 108,
    mass: 0.6,
    moods: { adventure: 3, wildlife: 1 },
    quip: "A rain poncho. Not your best look. Very wise though.",
    list: "Rain poncho, because some places rain sideways",
    art: (
      <>
        <path
          d="M38 22 C20 34 10 66 4 94 C24 104 80 104 100 94 C94 66 84 34 66 22 C60 28 44 28 38 22Z"
          fill="#e8bb3d"
          {...line}
        />
        <path
          d="M34 8 C40 0 64 0 70 8 C76 18 72 30 52 32 C32 30 28 18 34 8Z"
          fill="#d6a42b"
          {...line}
        />
        <path
          d="M41 14 C45 9 59 9 63 14 C66 20 60 25 52 25 C44 25 38 20 41 14Z"
          fill="#7c5d17"
          {...line}
        />
        <path d="M52 32 V98" stroke="#a97f1e" strokeWidth="2" />
        <circle cx="52" cy="48" r="2.4" fill="#f5e7b5" {...line} />
        <circle cx="52" cy="66" r="2.4" fill="#f5e7b5" {...line} />
        <circle cx="52" cy="84" r="2.4" fill="#f5e7b5" {...line} />
        <path
          d="M30 42 C24 56 18 72 16 88 M74 42 C80 56 86 72 88 88"
          fill="none"
          stroke="#c2931f"
          strokeWidth="2"
        />
      </>
    ),
  },
  {
    id: "bucket",
    label: "kids' bucket",
    w: 92,
    h: 96,
    mass: 0.8,
    moods: { family: 3, beach: 1 },
    quip: "A kids' bucket. So they're coming. Good luck to you.",
    list: "The kids' bucket, and the sand that comes home in it",
    art: (
      <>
        <path d="M8 36 C10 2 72 2 74 36" fill="none" stroke={INK} strokeWidth="5" />
        <path d="M8 36 C10 2 72 2 74 36" fill="none" stroke="#c8623a" strokeWidth="3" />
        <path d="M4 34 H78 L68 92 H14Z" fill="#5f9e9a" {...line} />
        <path d="M4 34 H78 L76 44 H6Z" fill="#7bb6b1" {...line} />
        <path
          d="M41 54 l4.5 9.5 l10.5 1.2 l-7.8 7 l2.2 10.3 l-9.4 -5.2 l-9.4 5.2 l2.2 -10.3 l-7.8 -7 l10.5 -1.2Z"
          fill="#f2d98c"
          {...line}
        />
        <path d="M83 22 V70" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <path d="M83 22 V70" stroke="#e0a63e" strokeWidth="3" strokeLinecap="round" />
        <path d="M76 68 H90 L89 86 C87 93 79 93 77 86Z" fill="#e0a63e" {...line} />
      </>
    ),
  },
  {
    id: "costume",
    label: "swimming costume",
    w: 84,
    h: 108,
    mass: 0.4,
    moods: { beach: 3, romance: 1 },
    quip: "Swimming costume, and only the one. Optimist.",
    list: "Swimming costume, and only the one",
    art: (
      <>
        <clipPath id="pyb-costume">
          <path d="M24 4 C26 20 28 26 42 28 C56 26 58 20 60 4 L68 4 C68 26 66 44 70 58 C72 70 62 84 50 100 C46 104 38 104 34 100 C22 84 12 70 14 58 C18 44 16 26 16 4Z" />
        </clipPath>
        <g clipPath="url(#pyb-costume)">
          <rect width="84" height="108" fill="#f0e3c6" />
          <path
            d="M0 26 H84 M0 42 H84 M0 58 H84 M0 74 H84 M0 90 H84"
            stroke="#c8523a"
            strokeWidth="8"
          />
        </g>
        <path
          d="M24 4 C26 20 28 26 42 28 C56 26 58 20 60 4 L68 4 C68 26 66 44 70 58 C72 70 62 84 50 100 C46 104 38 104 34 100 C22 84 12 70 14 58 C18 44 16 26 16 4Z"
          fill="none"
          {...line}
        />
      </>
    ),
  },
  {
    id: "map",
    label: "paper map",
    w: 116,
    h: 88,
    mass: 0.5,
    moods: { culture: 3, adventure: 1 },
    quip: "A paper map! Your phone is hurt. Your phone will get over it.",
    list: "A paper map, which you'll never fold back up",
    art: (
      <>
        <path d="M4 12 L42 4 L76 12 L112 4 V76 L76 84 L42 76 L4 84Z" fill="#efe2bf" {...line} />
        <path d="M42 4 V76 L76 84 V12Z" fill="#dfcf9f" />
        <path d="M42 4 V76 M76 12 V84" stroke={INK} strokeWidth="1.2" opacity=".6" />
        <path
          d="M4 56 C18 48 26 58 40 50 C52 44 58 60 72 56 C84 52 98 62 112 54 V76 L76 84 L42 76 L4 84Z"
          fill="#9cc4c0"
          opacity=".85"
        />
        <path
          d="M14 66 C26 42 40 48 50 34 C60 22 76 40 94 20"
          fill="none"
          stroke="#b8452f"
          strokeWidth="2.6"
          strokeDasharray="5 5"
          strokeLinecap="round"
        />
        <path
          d="M88 13 l11 11 M99 13 l-11 11"
          stroke="#b8452f"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <circle cx="22" cy="26" r="9" fill="none" stroke={INK} strokeWidth="1.3" />
        <path d="M22 15 l3 11 l-3 11 l-3 -11Z" fill={INK} />
      </>
    ),
  },
  {
    id: "tongs",
    label: "braai tongs",
    w: 138,
    h: 36,
    mass: 0.9,
    moods: { food: 3, family: 1, adventure: 1 },
    quip: "Your own braai tongs. Nobody can say you're not serious.",
    list: "Your own braai tongs, not up for discussion",
    art: (
      <>
        <path d="M46 14 L128 6 L132 11 L52 19Z" fill="#bcc0ba" {...line} />
        <path d="M46 22 L128 30 L132 25 L52 17Z" fill="#a2a7a1" {...line} />
        <path
          d="M122 4 l10 -1 l1 8 l-10 1Z M122 32 l10 1 l1 -8 l-10 -1Z"
          fill="#7a7f7a"
          {...line}
        />
        <rect x="4" y="10" width="52" height="16" rx="7" fill="#8a5a32" {...line} />
        <path d="M12 18 C22 14 34 22 48 16" fill="none" stroke="#5c3a1d" strokeWidth="1.6" />
        <circle cx="10" cy="18" r="2.4" fill="#d9b45c" {...line} />
      </>
    ),
  },
  {
    id: "bowtie",
    label: "bow tie",
    w: 100,
    h: 56,
    mass: 0.3,
    moods: { luxury: 3, romance: 2 },
    quip: "A bow tie. Oh, we're doing it properly.",
    list: "The bow tie, because you were promised dinner",
    art: (
      <>
        <path
          d="M44 22 C30 8 12 2 6 6 C2 18 2 38 6 50 C12 54 30 48 44 34Z"
          fill="#2c4563"
          {...line}
        />
        <path
          d="M56 22 C70 8 88 2 94 6 C98 18 98 38 94 50 C88 54 70 48 56 34Z"
          fill="#2c4563"
          {...line}
        />
        <path
          d="M14 16 h.1 M26 18 h.1 M16 30 h.1 M30 30 h.1 M14 42 h.1 M26 40 h.1 M74 18 h.1 M86 16 h.1 M70 30 h.1 M84 30 h.1 M74 40 h.1 M86 42 h.1"
          stroke="#eadcb8"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        <path
          d="M44 20 C47 18 53 18 56 20 C58 26 58 30 56 36 C53 38 47 38 44 36 C42 30 42 26 44 20Z"
          fill="#1f3249"
          {...line}
        />
      </>
    ),
  },
];

export const ITEM = (id: string) => ITEMS.find((i) => i.id === id) as Item;

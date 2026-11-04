// The six paper-engineered scenes. Each one is a printed backdrop (Print) and a stack of cut-paper layers (Hinge) that
// stand up from the page. Coordinates are "book units": a spread is 1000 wide, and a Hinge's y counts down from its top.
// Anything that moves is its own small svg (Piece), so it's only painted once and the browser just slides it around.
import type { CSSProperties, ReactNode } from "react";

export const INK = {
  ink: "#1a2050",
  ind: "#27306b",
  indM: "#3f4a94",
  indL: "#7680bd",
  indP: "#d8dcf0",
  cor: "#e5603f",
  corD: "#c44a30",
  corL: "#f3a386",
  corP: "#f8d3bd",
  och: "#e3a32f",
  ochD: "#bd7f1f",
  ochL: "#f4d58d",
  sea: "#2f9c8f",
  seaD: "#1b6d67",
  seaM: "#5fb8a7",
  seaL: "#a9dccb",
  seaP: "#d3ecdf",
  cre: "#f8f0de",
  wht: "#fffaf0",
};
const K = INK;

const u = (n: number) => `calc(var(--u) * ${n})`;

/** The filters every piece of paper in the book goes through. Rendered once at the top of the page. */
export function PaperFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <filter
          id="pb-grain"
          x="-4%"
          y="-6%"
          width="108%"
          height="112%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.62 0.9"
            numOctaves="2"
            seed="7"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="2.2"
            xChannelSelector="R"
            yChannelSelector="G"
            result="cut"
          />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.1  0 0 0 0 0.09  0 0 0 0 0.2  0 0 0 1.1 -0.56"
            result="dark"
          />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.88  0 0 1.1 0 -0.58"
            result="light"
          />
          <feComposite in="dark" in2="cut" operator="in" result="darkIn" />
          <feComposite in="light" in2="cut" operator="in" result="lightIn" />
          <feMerge>
            <feMergeNode in="cut" />
            <feMergeNode in="darkIn" />
            <feMergeNode in="lightIn" />
          </feMerge>
        </filter>
        <filter
          id="pb-drop"
          x="-12%"
          y="-20%"
          width="124%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow dx="1.5" dy="5" stdDeviation="4" floodColor="#1a1430" floodOpacity="0.38" />
        </filter>
      </defs>
    </svg>
  );
}

/** One cut of paper with its own shadow on whatever is behind it. */
export const Cut = ({ children }: { children: ReactNode }) => (
  <g filter="url(#pb-drop)">{children}</g>
);

/** A layer of the pop-up, hinged along its bottom edge. b: where the hinge sits on the page. z: how far it stands off. */
export function Hinge({
  b,
  h,
  z,
  i,
  children,
}: {
  b: number;
  h: number;
  z: number;
  i: number;
  children: ReactNode;
}) {
  return (
    <div className="pb-hinge" style={{ "--b": b, "--h": h, "--z": z, "--i": i } as CSSProperties}>
      {children}
    </div>
  );
}

/** A separately-moving piece of paper. x, y, w, h are its box in the Hinge. o: the point it turns around. */
export function Piece({
  x,
  y,
  w,
  h,
  cls = "",
  o,
  dur,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  cls?: string;
  o?: string;
  dur?: string;
  children: ReactNode;
}) {
  const style = {
    left: u(x),
    top: u(y),
    width: u(w),
    height: u(h),
    transformOrigin: o,
    "--dur": dur,
  } as CSSProperties;
  return (
    <svg
      className={`pb-piece ${cls}`}
      viewBox={`${x} ${y} ${w} ${h}`}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <g filter="url(#pb-grain)">{children}</g>
    </svg>
  );
}

/** Slides with the pull-tab: --p goes 0 to 1, so the contents travel dx, dy book units. */
const Pulled = ({
  dx = 0,
  dy = 0,
  children,
}: {
  dx?: number;
  dy?: number;
  children: ReactNode;
}) => (
  <div className="pb-pulled" style={{ "--dx": dx, "--dy": dy } as CSSProperties}>
    {children}
  </div>
);

/** A strip of scalloped water or ground across the whole spread. */
function wave(y: number, amp: number, n: number, h: number) {
  const p = 1030 / n;
  let d = `M-15 ${y} `;
  for (let i = 0; i < n; i++) d += `q${p / 2} ${i % 2 ? amp * 2 : -amp * 2} ${p} 0 `;
  return `${d}V${h}H-15Z`;
}

/** A palm frond: a smooth top edge and a snipped, zigzag bottom edge. */
function frond(len: number, drop: number, snips: number) {
  let d = `M0 0Q${len * 0.5} ${-len * 0.2 + drop * 0.1} ${len} ${drop}`;
  for (let i = snips; i > 0; i--) {
    const t = i / snips;
    const x = len * t;
    const yb = drop * t * t + len * 0.1 * Math.sin(t * Math.PI);
    d += `L${(x - len / snips / 2).toFixed(1)} ${(yb - len * 0.03).toFixed(1)}L${(x - len / snips).toFixed(1)} ${(yb + len * 0.05).toFixed(1)}`;
  }
  return `${d}Z`;
}

function Crown({ x, y, s = 1, a, b }: { x: number; y: number; s?: number; a: string; b: string }) {
  const leaves: [number, number, number, string][] = [
    [-168, 150, 70, a],
    [-140, 165, 60, b],
    [-105, 130, 40, a],
    [-70, 130, 40, b],
    [-38, 165, 60, a],
    [-10, 150, 70, b],
    [18, 110, 66, a],
    [198, 110, 66, b],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {leaves.map(([rot, len, drop, fill]) => (
        <path key={rot} d={frond(len, drop, 7)} fill={fill} transform={`rotate(${rot})`} />
      ))}
    </g>
  );
}

const Tuft = ({ x, y, h, fill }: { x: number; y: number; h: number; fill: string }) => (
  <path
    d={`M${x - h * 0.5} ${y}L${x - h * 0.42} ${y - h * 0.62}L${x - h * 0.2} ${y - h * 0.22}L${x - h * 0.08} ${y - h}L${x + h * 0.08} ${y - h * 0.3}L${x + h * 0.32} ${y - h * 0.78}L${x + h * 0.34} ${y - h * 0.2}L${x + h * 0.56} ${y - h * 0.5}L${x + h * 0.52} ${y}Z`}
    fill={fill}
  />
);

const Cloud = ({
  x,
  y,
  s = 1,
  fill = K.wht,
}: {
  x: number;
  y: number;
  s?: number;
  fill?: string;
}) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    fill={fill}
    d="M0 34C-4 18 16 10 28 18C34 0 66-4 76 14C88 4 110 8 112 24C126 22 134 40 118 44L6 46C-2 46-4 38 0 34Z"
  />
);

function Sky({ color, children }: { color: string; children?: ReactNode }) {
  return (
    <svg
      className="pb-print-art"
      viewBox="0 0 1000 660"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill={color}
        d="M-5-5H1005V392Q960 404 910 396T800 400T680 394T560 402T430 395T310 401T190 394T90 402T-5 395Z"
      />
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ the scenes */

type SceneProps = { port: (x: number, y: number, d: number) => ReactNode };

function Elephant({
  x,
  y,
  s,
  body,
  ear,
}: {
  x: number;
  y: number;
  s: number;
  body: string;
  ear: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M28 66C14 76 12 96 16 112"
        fill="none"
        stroke={body}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        fill={body}
        d="M26 92C22 48 62 22 116 20C150 19 176 26 196 44C214 34 240 40 250 64C258 86 256 108 262 134C265 147 254 152 248 140C240 122 236 108 226 100C218 106 208 108 200 106L200 170H170L166 124C140 134 110 134 88 128L84 170H52L50 128C36 122 28 110 26 92Z"
      />
      <path
        fill={ear}
        d="M196 42C176 36 156 54 160 80C164 100 190 108 206 94C216 80 214 52 196 42Z"
      />
      <path
        fill="none"
        stroke={K.cre}
        strokeWidth="6"
        strokeLinecap="round"
        d="M232 102C236 114 246 122 258 118"
      />
      <circle cx="226" cy="64" r="3.4" fill={K.cre} />
    </g>
  );
}

export const SCENES: Record<
  string,
  { Print: () => ReactNode; Layers: (p: SceneProps) => ReactNode }
> = {
  /* The island: palms lean, three seas rock, a boat crosses when pulled. */
  mauritius: {
    Print: () => (
      <Sky color={K.seaL}>
        <circle cx="735" cy="125" r="96" fill={K.ochL} />
        <circle cx="735" cy="125" r="70" fill={K.och} />
        <Cloud x={120} y={70} s={1.5} />
        <Cloud x={470} y={40} s={0.9} fill={K.seaP} />
      </Sky>
    ),
    Layers: ({ port }) => (
      <>
        <Hinge b={392} h={190} z={0} i={0}>
          <Piece x={0} y={0} w={1000} h={190}>
            <Cut>
              <path
                fill={K.sea}
                d="M-20 190C60 150 120 130 170 110C210 92 240 40 270 44C300 48 310 90 345 105C400 128 470 120 540 150C600 170 660 170 720 190Z"
              />
            </Cut>
            <Cut>
              <path
                fill={K.seaD}
                d="M520 190C600 160 650 120 720 100C760 88 790 60 815 66C845 74 860 120 900 135C950 150 990 160 1030 190Z"
              />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={392} h={340} z={10} i={1}>
          <Piece x={150} y={0} w={260} h={340}>
            <Cut>
              <path fill={K.cre} d="M254 170L268 170L272 340L250 340Z" />
            </Cut>
          </Piece>
          {port(172, 2, 176)}
        </Hinge>
        <Hinge b={372} h={70} z={24} i={2}>
          <Piece x={-60} y={0} w={1120} h={70} cls="pb-rock" dur="7s">
            <Cut>
              <path fill={K.seaM} d={wave(24, 15, 18, 70)} />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={345} h={440} z={44} i={3}>
          <Piece x={320} y={330} w={470} h={110}>
            <Cut>
              <path fill={K.ochL} d="M330 440C360 380 430 350 530 342C640 336 730 380 780 440Z" />
            </Cut>
          </Piece>
          <Piece x={430} y={100} w={290} h={280}>
            <Cut>
              <path
                fill={K.ochD}
                d="M497 368C490 300 468 210 480 138L492 140C490 210 514 300 522 366Z"
              />
            </Cut>
            <Cut>
              <path
                fill={K.ochD}
                d="M618 372C622 320 640 260 668 210L678 216C656 268 642 320 640 372Z"
              />
            </Cut>
            <path d="M506 282C548 322 600 322 636 296C602 346 540 342 506 282Z" fill={K.cor} />
          </Piece>
          <Piece x={290} y={0} w={380} h={290} cls="pb-sway" o="50% 44%" dur="5.5s">
            <Cut>
              <Crown x={484} y={130} a={K.seaD} b={K.sea} />
            </Cut>
          </Piece>
          <Piece x={530} y={110} w={290} h={220} cls="pb-sway" o="50% 46%" dur="4.3s">
            <Cut>
              <Crown x={672} y={212} s={0.74} a={K.sea} b={K.seaD} />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={352} h={110} z={64} i={4}>
          <Pulled dx={480} dy={-6}>
            <Piece x={170} y={0} w={130} h={110} cls="pb-bob" o="50% 90%" dur="3.4s">
              <Cut>
                <path fill={K.wht} d="M232 6L232 72L280 72Z" />
                <path fill={K.cor} d="M226 18L226 72L190 72Z" />
                <path
                  fill={K.ind}
                  d="M182 78H288C282 96 268 104 250 104H212C196 104 188 94 182 78Z"
                />
              </Cut>
            </Piece>
          </Pulled>
        </Hinge>
        <Hinge b={322} h={72} z={74} i={5}>
          <Piece x={-60} y={0} w={1120} h={72} cls="pb-rock pb-rock-b" dur="5.2s">
            <Cut>
              <path fill={K.sea} d={wave(26, 16, 14, 72)} />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={286} h={64} z={104} i={6}>
          <Piece x={-60} y={0} w={1120} h={64} cls="pb-rock" dur="6.1s">
            <Cut>
              <path fill={K.ind} d={wave(24, 16, 12, 64)} />
            </Cut>
          </Piece>
        </Hinge>
      </>
    ),
  },

  /* The bushveld: an acacia that sways, a herd that walks when pulled. */
  kruger: {
    Print: () => (
      <Sky color={K.corP}>
        <circle cx="800" cy="175" r="88" fill={K.cor} />
        <path fill={K.corL} d="M60 120H330V132H60ZM500 60H740V70H500ZM120 200H270V208H120Z" />
      </Sky>
    ),
    Layers: ({ port }) => (
      <>
        <Hinge b={392} h={130} z={0} i={0}>
          <Piece x={0} y={0} w={1000} h={130}>
            <Cut>
              <path
                fill={K.och}
                d="M-20 130C40 96 90 92 140 62L240 56C290 60 330 96 400 100C520 110 640 80 720 88C810 96 900 70 1020 110V130Z"
              />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={392} h={340} z={8} i={1}>
          <Piece x={150} y={160} w={230} h={180}>
            <Cut>
              <path fill={K.ochD} d="M246 170H272L280 340H238Z" />
            </Cut>
          </Piece>
          {port(172, 2, 176)}
        </Hinge>
        <Hinge b={366} h={440} z={28} i={2}>
          <Piece x={380} y={0} w={520} h={440} cls="pb-sway-soft" o="51% 100%" dur="6.4s">
            <Cut>
              <path
                fill={K.ink}
                d="M610 440C618 370 622 310 606 262C574 226 520 190 470 170L478 158C530 176 582 204 620 238C624 200 620 160 610 120L624 116C638 164 644 206 640 244C676 206 730 172 790 156L796 170C740 190 684 226 652 266C640 320 646 380 658 440Z"
              />
            </Cut>
            <Cut>
              <path
                fill={K.seaD}
                d="M400 158C420 120 480 104 540 98C590 60 700 56 760 94C820 100 878 124 888 158C850 178 780 164 730 176C680 186 620 164 570 176C510 188 440 186 400 158Z"
              />
            </Cut>
            <Cut>
              <path
                fill={K.sea}
                d="M470 124C510 90 570 92 610 72C650 52 720 66 740 96C700 120 650 106 610 118C570 130 510 136 470 124Z"
              />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={346} h={60} z={50} i={3}>
          <Piece x={-60} y={0} w={1120} h={60}>
            <Cut>
              <path fill={K.ochL} d={wave(20, 8, 10, 60)} />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={322} h={240} z={78} i={4}>
          <Pulled dx={330}>
            <div className="pb-trudge">
              <Piece x={70} y={90} w={170} h={150} cls="pb-sway-soft" o="50% 100%" dur="3.1s">
                <Cut>
                  <Elephant x={78} y={110} s={0.72} body={K.indM} ear={K.indL} />
                </Cut>
              </Piece>
              <Piece x={200} y={0} w={340} h={240} cls="pb-sway-soft" o="50% 100%" dur="3.7s">
                <Cut>
                  <Elephant x={208} y={10} s={1.34} body={K.ind} ear={K.indM} />
                </Cut>
              </Piece>
            </div>
          </Pulled>
        </Hinge>
        <Hinge b={286} h={90} z={110} i={5}>
          <Piece x={-60} y={0} w={1120} h={90} cls="pb-sway-soft" o="50% 100%" dur="5s">
            <Cut>
              <path fill={K.ochD} d={wave(58, 8, 14, 90)} />
              {(
                [
                  [40, 58],
                  [150, 42],
                  [300, 50],
                  [480, 36],
                  [620, 54],
                  [790, 44],
                  [930, 60],
                ] as const
              ).map(([x, h], i) => (
                <Tuft key={x} x={x} y={72} h={h} fill={i % 2 ? K.seaD : K.cor} />
              ))}
            </Cut>
          </Piece>
        </Hinge>
      </>
    ),
  },

  /* The falls: strips of paper pour for ever, and the pull-tab raises a rainbow out of the spray. */
  "victoria-falls": {
    Print: () => (
      <Sky color={K.indP}>
        <circle cx="510" cy="86" r="58" fill={K.ochL} />
        <Cloud x={700} y={60} s={1.2} />
        <Cloud x={110} y={30} s={0.8} />
      </Sky>
    ),
    Layers: ({ port }) => (
      <>
        <Hinge b={392} h={330} z={0} i={0}>
          <Piece x={260} y={40} w={480} h={290}>
            <path fill={K.indM} d="M260 40H740V330H260Z" />
          </Piece>
          <div
            className="pb-falls"
            style={{ left: u(290), top: u(64), width: u(420), height: u(266) }}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((n) => {
              const fill = [K.wht, K.seaL, K.cre, K.indP][n % 4];
              return (
                <Piece
                  key={n}
                  x={n * 60}
                  y={0}
                  w={60}
                  h={532}
                  cls="pb-pour"
                  dur={`${1.5 + ((n * 37) % 11) / 11}s`}
                >
                  {[0, 133, 266, 399].map((y, k) => (
                    <path
                      key={y}
                      fill={fill}
                      d={`M${n * 60 + 1} ${y + ((n * 41) % 90) - 8}q28 ${10 + (k % 2) * 8} 58 0v124q-29 ${14 + ((n + k) % 3) * 6} -58 0Z`}
                    />
                  ))}
                </Piece>
              );
            })}
          </div>
        </Hinge>
        <Hinge b={392} h={330} z={18} i={1}>
          <Piece x={-20} y={0} w={1040} h={330}>
            <Cut>
              <path
                fill={K.seaD}
                d="M0 330V70C40 56 90 70 140 50C200 28 250 44 310 52L298 84L322 120L292 170L316 220L286 268L304 330Z"
              />
              <path
                fill={K.seaD}
                d="M1000 330V60C960 44 900 66 840 48C790 34 740 44 690 54L704 90L680 130L708 176L686 226L712 280L694 330Z"
              />
            </Cut>
            <Cut>
              <path
                fill={K.sea}
                d="M0 74C30 58 70 60 120 46C170 32 240 30 312 52L298 70C230 54 170 66 120 76C70 88 30 86 0 96Z"
              />
              <path
                fill={K.ind}
                opacity=".28"
                d="M40 330L90 170L150 240L210 130L250 330ZM760 330L800 150L860 250L920 140L970 330Z"
              />
              <path
                fill={K.sea}
                d="M1000 66C960 48 910 60 850 44C790 30 740 36 690 54L706 72C760 54 800 62 860 72C910 84 960 76 1000 92Z"
              />
            </Cut>
          </Piece>
          {port(166, 96, 150)}
        </Hinge>
        <Hinge b={372} h={300} z={34} i={2}>
          <div className="pb-rainbow">
            <Piece x={310} y={40} w={460} h={260}>
              <Cut>
                <path fill={K.cor} d="M320 300A220 220 0 0 1 760 300H722A182 182 0 0 0 358 300Z" />
              </Cut>
              <Cut>
                <path fill={K.och} d="M358 300A182 182 0 0 1 722 300H686A146 146 0 0 0 394 300Z" />
              </Cut>
              <Cut>
                <path fill={K.sea} d="M394 300A146 146 0 0 1 686 300H652A112 112 0 0 0 428 300Z" />
              </Cut>
            </Piece>
          </div>
        </Hinge>
        <Hinge b={346} h={120} z={56} i={3}>
          <Piece x={230} y={0} w={540} h={120} cls="pb-bob" o="50% 100%" dur="3.8s">
            <Cut>
              <Cloud x={250} y={40} s={1.4} />
              <Cloud x={450} y={22} s={1.7} fill={K.cre} />
              <Cloud x={370} y={56} s={1.1} fill={K.indP} />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={318} h={70} z={82} i={4}>
          <Piece x={-60} y={0} w={1120} h={70} cls="pb-rock" dur="4.6s">
            <Cut>
              <path fill={K.indM} d={wave(24, 14, 16, 70)} />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={284} h={150} z={112} i={5}>
          <Piece x={-60} y={0} w={330} h={150} cls="pb-sway" o="10% 100%" dur="5.6s">
            <Cut>
              <path
                d={frond(250, 60, 11)}
                transform="translate(-40 150) rotate(-38)"
                fill={K.seaD}
              />
              <path d={frond(210, 40, 9)} transform="translate(0 150) rotate(-18)" fill={K.sea} />
            </Cut>
          </Piece>
          <Piece x={730} y={0} w={330} h={150} cls="pb-sway" o="90% 100%" dur="6.3s">
            <Cut>
              <path
                d={frond(250, 60, 11)}
                transform="translate(1040 150) scale(-1 1) rotate(-38)"
                fill={K.seaD}
              />
              <path
                d={frond(210, 40, 9)}
                transform="translate(1000 150) scale(-1 1) rotate(-18)"
                fill={K.sea}
              />
            </Cut>
          </Piece>
        </Hinge>
      </>
    ),
  },

  /* Table Mountain: the tablecloth drifts, and the cable car climbs its thread when pulled. */
  "cape-town": {
    Print: () => (
      <Sky color={K.seaP}>
        <circle cx="180" cy="110" r="62" fill={K.och} />
        <Cloud x={820} y={60} s={1.1} />
      </Sky>
    ),
    Layers: ({ port }) => (
      <>
        <Hinge b={392} h={330} z={0} i={0}>
          <Piece x={-20} y={0} w={1040} h={330}>
            <Cut>
              <path
                fill={K.ind}
                d="M0 330L50 256L130 122L176 172L240 160L296 78L340 62L718 56L762 80L806 166L852 204L890 142L930 186L1000 330Z"
              />
            </Cut>
            <path
              fill={K.indM}
              d="M340 62L400 60L382 150L412 240L360 330H250L300 230L330 150ZM560 58L620 58L606 170L640 250L600 330H530L560 240L540 150ZM130 122L176 172L150 250L90 330H30L100 230Z"
            />
            <path fill={K.indM} d="M718 56L762 80L780 180L750 330H690L720 200Z" />
          </Piece>
          <Piece x={300} y={20} w={460} h={100} cls="pb-drift" dur="9s">
            <Cut>
              <path
                fill={K.wht}
                d="M316 44C340 26 380 32 410 28C460 18 520 30 570 26C620 22 690 26 744 44C746 66 724 62 712 74C700 92 680 66 660 72C640 80 628 104 604 92C584 80 570 64 546 72C524 82 508 104 482 90C464 78 446 64 424 74C404 84 386 96 370 80C356 66 330 70 316 44Z"
              />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={392} h={340} z={12} i={1}>
          <Piece x={380} y={40} w={280} h={300}>
            <path d="M420 316L622 66" stroke={K.cre} strokeWidth="2.4" fill="none" />
            <Cut>
              <path fill={K.cre} d="M402 310H440V338H402Z" />
              <path fill={K.cor} d="M396 302H446L440 312H402Z" />
            </Cut>
            <Cut>
              <path fill={K.cre} d="M606 58H640V78H606Z" />
              <path fill={K.cor} d="M600 50H646L640 60H606Z" />
            </Cut>
          </Piece>
          <Pulled dx={148} dy={-182}>
            <div className="pb-car-start">
              <Piece x={402} y={252} w={80} h={84} cls="pb-swing" o="42% 0%" dur="2.6s">
                <Cut>
                  <path d="M436 254V272" stroke={K.ink} strokeWidth="3" />
                  <circle cx="436" cy="255" r="4" fill={K.ink} />
                  <path
                    fill={K.cor}
                    d="M412 272H460C466 272 468 276 468 282V314C468 322 462 326 456 326H416C410 326 406 322 406 314V282C406 276 408 272 412 272Z"
                  />
                  <path fill={K.wht} d="M414 280H432V300H414ZM440 280H460V300H440Z" />
                  <path fill={K.ochL} d="M406 306H468V312H406Z" />
                </Cut>
              </Piece>
            </div>
          </Pulled>
          {port(662, 120, 150)}
        </Hinge>
        <Hinge b={350} h={120} z={46} i={2}>
          <Piece x={-20} y={0} w={1040} h={120}>
            <Cut>
              {[
                [0, 24, 72, K.cor],
                [24, 64, 96, K.ochL],
                [88, 54, 64, K.sea],
                [142, 70, 88, K.wht],
                [212, 52, 56, K.och],
                [264, 64, 80, K.corL],
                [328, 56, 104, K.seaM],
                [384, 72, 72, K.cor],
                [456, 54, 90, K.ochL],
                [510, 66, 60, K.sea],
                [576, 60, 84, K.wht],
                [636, 70, 104, K.och],
                [706, 52, 66, K.cor],
                [758, 68, 88, K.seaM],
                [826, 56, 60, K.ochL],
                [882, 66, 92, K.corL],
                [948, 52, 70, K.sea],
              ].map(([x, w, h, fill], i) => (
                <g key={i}>
                  <path
                    fill={fill as string}
                    d={`M${x} 120V${120 - (h as number)}H${(x as number) + (w as number)}V120Z`}
                  />
                  <path
                    fill={K.ind}
                    d={`M${(x as number) + 12} ${132 - (h as number)}h12v16h-12zM${(x as number) + (w as number) - 24} ${132 - (h as number)}h12v16h-12z`}
                  />
                </g>
              ))}
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={322} h={70} z={72} i={3}>
          <Piece x={-60} y={0} w={1120} h={70} cls="pb-rock" dur="5.6s">
            <Cut>
              <path fill={K.sea} d={wave(28, 12, 14, 70)} />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={332} h={100} z={66} i={4}>
          <Piece x={640} y={0} w={130} h={100} cls="pb-bob" o="50% 90%" dur="3.2s">
            <Cut>
              <path fill={K.wht} d="M700 4V66H750Z" />
              <path fill={K.och} d="M694 16V66H660Z" />
              <path fill={K.ind} d="M652 72H758C750 88 736 94 720 94H684C670 94 658 86 652 72Z" />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={286} h={60} z={104} i={5}>
          <Piece x={-60} y={0} w={1120} h={60} cls="pb-rock pb-rock-b" dur="6.6s">
            <Cut>
              <path fill={K.ind} d={wave(22, 14, 12, 60)} />
            </Cut>
          </Piece>
        </Hinge>
      </>
    ),
  },

  /* Santorini: white steps, blue doors, one cat, a windmill and a sun that spins when pulled. */
  santorini: {
    Print: () => (
      <Sky color={K.ochL}>
        <path fill={K.corP} d="M-5 230H1005V300H-5Z" />
        <path fill={K.corL} d="M-5 300H1005V350H-5Z" opacity=".65" />
      </Sky>
    ),
    Layers: ({ port }) => (
      <>
        <Hinge b={392} h={340} z={0} i={0}>
          <div
            className="pb-sun"
            style={{ left: u(630), top: u(26), width: u(230), height: u(230) }}
          >
            <Piece x={0} y={0} w={230} h={230}>
              <Cut>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
                  <path
                    key={n}
                    fill={n % 2 ? K.och : K.cor}
                    d="M104 40L115 0L126 40Z"
                    transform={`rotate(${n * 30} 115 115)`}
                  />
                ))}
                <circle cx="115" cy="115" r="76" fill={K.cor} />
                <circle cx="115" cy="115" r="54" fill={K.och} />
              </Cut>
            </Piece>
          </div>
        </Hinge>
        <Hinge b={392} h={90} z={6} i={1}>
          <Piece x={-20} y={0} w={1040} h={90}>
            <Cut>
              <path fill={K.ind} d="M0 30H1000V90H0Z" />
            </Cut>
            <Cut>
              <path
                fill={K.indM}
                d="M560 34C600 16 640 6 690 16C740 26 780 8 830 18C870 24 900 26 930 34Z"
              />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={376} h={380} z={30} i={2}>
          <Piece x={-20} y={0} w={880} h={380}>
            <Cut>
              <path
                fill={K.cor}
                d="M0 380V70C100 52 230 76 330 136C430 196 520 268 640 310C720 340 790 356 860 380Z"
              />
            </Cut>
            <path
              fill={K.och}
              d="M0 170C110 150 230 180 330 240C410 286 500 330 610 380H470C390 330 300 276 210 250C130 228 60 226 0 232Z"
            />
            <path fill={K.corD} d="M0 280C70 262 170 280 250 320C290 340 320 360 360 380H0Z" />
          </Piece>
        </Hinge>
        <Hinge b={352} h={440} z={56} i={3}>
          <Piece x={0} y={40} w={620} h={400}>
            <Cut>
              <path fill={K.wht} d="M150 440V120H420V210H520V290H610V440Z" />
            </Cut>
            <Cut>
              <path fill={K.indP} d="M420 210H470V440H420ZM520 290H560V440H520Z" />
            </Cut>
            <Cut>
              <path fill={K.ind} d="M450 330C450 306 490 306 490 330V400H450Z" />
              <path fill={K.ind} d="M548 350H588V392H548Z" />
            </Cut>
            <Cut>
              <path fill={K.ind} d="M196 120C198 66 298 66 300 120Z" />
              <path d="M248 78V50M238 60H258" stroke={K.ind} strokeWidth="5" fill="none" />
            </Cut>
          </Piece>
          <Piece x={330} y={50} w={110} h={150}>
            <Cut>
              <path fill={K.wht} d="M352 190L362 92H410L420 190Z" />
              <path fill={K.ind} d="M354 96L386 56L418 96Z" />
              <path fill={K.och} d="M376 150H396V190H376Z" />
            </Cut>
          </Piece>
          <Piece x={296} y={8} w={180} h={180} cls="pb-sails" o="50% 50%">
            <Cut>
              {[0, 90, 180, 270].map((r) => (
                <g key={r} transform={`rotate(${r} 386 98)`}>
                  <path stroke={K.ink} strokeWidth="3.4" d="M386 98V14" />
                  <path fill={K.cre} d="M386 20L420 26L412 80L386 86Z" />
                </g>
              ))}
              <circle cx="386" cy="98" r="7" fill={K.cor} />
            </Cut>
          </Piece>
          {port(170, 210, 150)}
        </Hinge>
        <Hinge b={318} h={230} z={88} i={4}>
          <Piece x={-20} y={0} w={1040} h={230}>
            <Cut>
              <path
                fill={K.wht}
                d="M300 230V206H360V182H420V158H480V134H540V110H600V86H660V62H720V38H880C910 38 924 70 930 110C936 160 950 200 985 230Z"
              />
            </Cut>
            <path
              fill={K.indP}
              d="M300 206H360V212H300ZM360 182H420V188H360ZM420 158H480V164H420ZM480 134H540V140H480ZM540 110H600V116H540ZM600 86H660V92H600ZM660 62H720V68H660Z"
            />
            <Cut>
              <path fill={K.ind} d="M800 142C800 112 852 112 852 142V230H800Z" />
            </Cut>
            <path d="M740 38V12H884V38" stroke={K.ind} strokeWidth="6" fill="none" />
            <Cut>
              {(
                [
                  [744, 34, 15],
                  [768, 16, 18],
                  [796, 32, 15],
                  [824, 14, 19],
                  [852, 30, 16],
                  [880, 16, 17],
                  [900, 44, 14],
                ] as const
              ).map(([x, y, r]) => (
                <circle key={x} cx={x} cy={y} r={r} fill={x % 3 ? K.cor : K.corL} />
              ))}
            </Cut>
            <Cut>
              <path
                fill={K.ink}
                d="M596 86V62C592 56 592 46 596 42L600 48H608L612 42C616 48 616 56 612 60C630 60 638 72 638 86Z"
              />
              <path
                d="M638 82C650 82 650 66 644 60"
                stroke={K.ink}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </Cut>
          </Piece>
        </Hinge>
      </>
    ),
  },

  /* The dhow: a low sun, rocking seas, an old patched sail that crosses when pulled. */
  zanzibar: {
    Print: () => (
      <Sky color={K.corL}>
        <path
          fill={K.ochL}
          d="M-5 96H420V112H-5ZM560 54H1005V66H560ZM-5 210H280V222H-5ZM620 190H1005V206H620ZM170 300H840V316H170Z"
        />
        <path fill={K.cor} d="M-5 340H1005V396H-5Z" opacity=".55" />
      </Sky>
    ),
    Layers: ({ port }) => (
      <>
        <Hinge b={392} h={300} z={0} i={0}>
          <div className="pb-sinker">
            <Piece x={380} y={40} w={300} h={300}>
              <circle cx="530" cy="190" r="136" fill={K.ochL} />
              <Cut>
                <circle cx="530" cy="190" r="110" fill={K.och} />
              </Cut>
            </Piece>
          </div>
        </Hinge>
        <Hinge b={388} h={350} z={10} i={1}>
          <Piece x={-20} y={190} w={1040} h={160}>
            <Cut>
              <path
                fill={K.ink}
                d="M0 350V300H70V272H118V290H160V258H210V300H286C330 320 390 330 440 350ZM700 350C760 330 820 320 860 300H900V270H950V290H1000V350Z"
              />
            </Cut>
          </Piece>
          <Piece x={80} y={110} w={200} h={190} cls="pb-sway" o="50% 50%" dur="6s">
            <Cut>
              <Crown x={112} y={210} s={0.5} a={K.ink} b={K.ind} />
            </Cut>
          </Piece>
          <Piece x={100} y={190} w={40} h={100}>
            <path fill={K.ink} d="M108 204L116 206L124 290H112Z" />
          </Piece>
          {port(166, 80, 150)}
        </Hinge>
        <Hinge b={366} h={66} z={26} i={2}>
          <Piece x={-60} y={0} w={1120} h={66} cls="pb-rock" dur="6.4s">
            <Cut>
              <path fill={K.corD} d={wave(24, 11, 18, 66)} />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={332} h={350} z={48} i={3}>
          <Pulled dx={-170}>
            <Piece x={390} y={0} w={400} h={350} cls="pb-boat" o="50% 90%" dur="4.2s">
              <path d="M566 306V42" stroke={K.ink} strokeWidth="9" fill="none" />
              <Cut>
                <path
                  fill={K.wht}
                  d="M736 10C712 80 664 190 602 276C552 282 480 284 424 276C540 226 650 120 736 10Z"
                />
              </Cut>
              <path fill={K.ochL} d="M590 170L640 138L662 176L612 210Z" />
              <path fill={K.corL} d="M510 244L556 222L574 256L526 270Z" />
              <path
                d="M424 276C540 226 650 120 736 10"
                stroke={K.ink}
                strokeWidth="7"
                fill="none"
              />
              <Cut>
                <path
                  fill={K.ink}
                  d="M398 262C450 292 620 298 762 256L748 292C726 330 690 342 640 342H520C470 342 430 322 398 262Z"
                />
                <path
                  fill={K.och}
                  d="M418 296C480 316 640 318 738 290L734 300C640 328 490 326 426 306Z"
                />
              </Cut>
            </Piece>
          </Pulled>
        </Hinge>
        <Hinge b={322} h={66} z={70} i={4}>
          <Piece x={-60} y={0} w={1120} h={66} cls="pb-rock pb-rock-b" dur="4.8s">
            <Cut>
              <path fill={K.indM} d={wave(24, 14, 14, 66)} />
            </Cut>
          </Piece>
        </Hinge>
        <Hinge b={286} h={62} z={104} i={5}>
          <Piece x={-60} y={0} w={1120} h={62} cls="pb-rock" dur="5.8s">
            <Cut>
              <path fill={K.ind} d={wave(22, 15, 11, 62)} />
            </Cut>
          </Piece>
        </Hinge>
      </>
    ),
  },
};

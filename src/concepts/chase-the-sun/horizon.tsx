// The six places, cut out of the horizon. Same colour as the ground; their lamps come on after dusk.
import type { ReactNode } from "react";

function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M0 0Q5-18-3-38"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M-3-38Q-16-45-27-31Q-15-38-3-36Z" />
      <path d="M-3-38Q9-48 23-34Q9-41-3-36Z" />
      <path d="M-3-38Q-11-53-25-48Q-13-48-3-37Z" />
      <path d="M-3-38Q4-55 18-51Q6-50-3-37Z" />
      <path d="M-3-38Q-9-41-13-22Q-8-33-2-36Z" />
      <path d="M-3-38Q5-41 11-23Q5-33-3-36Z" />
    </g>
  );
}

const lamp = (x: number, y: number, r = 1.1) => <circle cx={x} cy={y} r={r} className="h-lamp" />;

const MAURITIUS = (
  <>
    <path d="M0 100V88Q24 78 44 80L70 56Q82 42 92 56L116 84Q140 90 160 86V100Z" />
    <Palm x={22} y={86} s={0.95} />
    <Palm x={38} y={84} s={0.66} />
    <path d="M122 90L122 66L139 90Z" />
    <path d="M115 91H142L137 95H120Z" />
    {lamp(122, 66, 1.3)}
    {lamp(62, 90)}
    {lamp(84, 92)}
    {lamp(98, 90)}
  </>
);

const ZANZIBAR = (
  <>
    <path d="M0 100V92Q40 88 80 92T160 90V100Z" />
    <path d="M36 80Q72 91 116 76L110 88Q76 95 46 88Z" />
    <path
      d="M77 82L84 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path d="M56 30L124 72Q96 72 76 80Q77 54 56 30Z" />
    <Palm x={140} y={92} s={0.9} />
    {lamp(84, 30, 1.5)}
    {lamp(50, 85, 1.3)}
    {lamp(102, 84, 1.3)}
  </>
);

const KRUGER = (
  <>
    <path d="M0 100V92Q50 86 90 91T160 90V100Z" />
    <path
      d="M58 94V70M58 74L38 56M58 76L80 54M58 70L58 54"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path d="M14 56Q30 40 58 42Q90 38 106 54Q86 60 60 58Q34 62 14 56Z" />
    <ellipse cx="130" cy="74" rx="13" ry="6" />
    <path
      d="M121 76L119 94M126 78L125 94M136 78L137 94M141 75L144 94"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M140 74L150 44"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
    />
    <path d="M148 42L158 45L157 48L149 47Z" />
    <path d="M149 42L148 37M152 42L152 37" fill="none" stroke="currentColor" strokeWidth="1" />
    <circle cx="20" cy="89" r="2.2" className="h-lamp" />
    {lamp(30, 91)}
  </>
);

const FALLS = (
  <>
    <g className="h-plume">
      <circle cx="80" cy="60" r="17" />
      <circle cx="68" cy="44" r="12" />
      <circle cx="92" cy="40" r="14" />
      <circle cx="79" cy="24" r="10" />
      <circle cx="90" cy="16" r="6" />
    </g>
    <path d="M0 100V72H60L66 100Z" />
    <path d="M160 100V70H100L94 100Z" />
    <path d="M6 72Q2 58 12 56Q14 46 25 50Q36 46 38 58Q46 62 40 72Z" />
    <path d="M128 70Q122 60 132 56Q136 46 146 52Q156 52 154 70Z" />
    {lamp(22, 84)}
    {lamp(138, 82)}
  </>
);

const SANTORINI = (
  <>
    <path d="M0 100V62Q18 58 38 60L66 56L96 60L122 68L142 82L160 88V100Z" />
    <path d="M30 62V46A13 13 0 0 1 56 46V60Z" />
    <path d="M43 33V24M39 28H47" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <rect x="64" y="38" width="13" height="22" />
    <path d="M64 38L70.5 32L77 38Z" />
    <rect x="84" y="50" width="16" height="14" />
    <path d="M104 62V54A7 7 0 0 1 118 54V66Z" />
    <rect x="8" y="50" width="16" height="14" />
    <rect x="68" y="42" width="5" height="7" rx="2.5" className="h-lamp" />
    {lamp(14, 70)}
    {lamp(26, 76)}
    {lamp(38, 70)}
    {lamp(52, 78)}
    {lamp(64, 70)}
    {lamp(78, 76)}
    {lamp(92, 72)}
    {lamp(106, 80)}
    {lamp(44, 88)}
    {lamp(72, 88)}
    {lamp(20, 88)}
  </>
);

const CAPE_TOWN = (
  <>
    <path d="M0 100V84L12 70L22 52L28 58L34 46L112 44L122 62L134 78L143 64L150 60L156 72L160 82V100Z" />
    <rect x="30" y="80" width="7" height="20" />
    <rect x="40" y="72" width="8" height="28" />
    <rect x="52" y="78" width="6" height="22" />
    <rect x="62" y="68" width="9" height="32" />
    <rect x="76" y="76" width="7" height="24" />
    {lamp(33, 86, 0.9)}
    {lamp(44, 77, 0.9)}
    {lamp(44, 86, 0.9)}
    {lamp(55, 84, 0.9)}
    {lamp(66, 73, 0.9)}
    {lamp(66, 82, 0.9)}
    {lamp(66, 91, 0.9)}
    {lamp(79, 82, 0.9)}
    {lamp(92, 88)}
    {lamp(104, 92)}
    {lamp(116, 88)}
    {lamp(130, 92)}
    {lamp(16, 90)}
  </>
);

export const SILHOUETTES: Record<string, ReactNode> = {
  mauritius: MAURITIUS,
  zanzibar: ZANZIBAR,
  kruger: KRUGER,
  "victoria-falls": FALLS,
  santorini: SANTORINI,
  "cape-town": CAPE_TOWN,
};

export function Silhouette({ slug, className }: { slug: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 160 100"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      {SILHOUETTES[slug]}
    </svg>
  );
}

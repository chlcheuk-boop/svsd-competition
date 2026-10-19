import type { Accent } from '../../types';

export const YARN_HEX: Record<Accent, { base: string; deep: string; light: string }> = {
  tangerine: { base: '#E1442A', deep: '#A32E18', light: '#F38A6F' },
  peach: { base: '#E9B98F', deep: '#B9875C', light: '#F8DFC8' },
  lime: { base: '#EBBE26', deep: '#A9850F', light: '#F7DE84' },
  sky: { base: '#7FA4E0', deep: '#3F68B4', light: '#C9DAF5' },
  pink: { base: '#E8678A', deep: '#B13F60', light: '#F5B1C3' },
  ink: { base: '#2A2622', deep: '#0E0C0A', light: '#7D746B' },
};

/** A strand of yarn: base fiber, dark twist marks and a light highlight so it reads as twisted fiber. */
export function YarnStrand({
  d, color, width = 3, opacity = 1, mask, className,
}: { d: string; color: Accent; width?: number; opacity?: number; mask?: string; className?: string }) {
  const c = YARN_HEX[color] ?? YARN_HEX.tangerine;
  return (
    <g opacity={opacity} mask={mask} className={className} style={{ pointerEvents: 'none' }}>
      <path d={d} fill="none" style={{ stroke: 'rgba(46,44,42,.13)' }} strokeWidth={width + 1.4} strokeLinecap="round" transform="translate(0 2.2)" />
      <path d={d} fill="none" style={{ stroke: c.base }} strokeWidth={width} strokeLinecap="round" />
      <path d={d} fill="none" style={{ stroke: c.deep }} strokeWidth={width} strokeLinecap="butt" strokeDasharray="1.1 3.1" opacity={0.42} />
      <path d={d} fill="none" style={{ stroke: c.light }} strokeWidth={width * 0.36} strokeLinecap="round" strokeDasharray="2.4 2" opacity={0.85} transform="translate(-0.3 -0.7)" />
    </g>
  );
}

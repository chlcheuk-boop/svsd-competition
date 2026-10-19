import type { Accent } from '../../types';

export const YARN_HEX: Record<Accent, { base: string; deep: string; light: string }> = {
  tangerine: { base: '#E14429', deep: '#A42C16', light: '#F2876F' },
  peach: { base: '#7F8C2F', deep: '#535D17', light: '#B9C46A' },
  lime: { base: '#F1C52E', deep: '#B08A0D', light: '#F8E187' },
  sky: { base: '#7DC6EB', deep: '#3A8DB8', light: '#C4E7F8' },
  pink: { base: '#FF8FA3', deep: '#D45C74', light: '#FFC6D0' },
  ink: { base: '#432005', deep: '#220F01', light: '#8B6A52' },
};

/** A strand of yarn: base fiber, dark twist marks and a light highlight so it reads as twisted fiber. */
export function YarnStrand({
  d, color, width = 3, opacity = 1, mask, className,
}: { d: string; color: Accent; width?: number; opacity?: number; mask?: string; className?: string }) {
  const c = YARN_HEX[color] ?? YARN_HEX.tangerine;
  return (
    <g opacity={opacity} mask={mask} className={className} style={{ pointerEvents: 'none' }}>
      <path d={d} fill="none" style={{ stroke: 'rgba(67,32,5,.13)' }} strokeWidth={width + 1.4} strokeLinecap="round" transform="translate(0 2.2)" />
      <path d={d} fill="none" style={{ stroke: c.base }} strokeWidth={width} strokeLinecap="round" />
      <path d={d} fill="none" style={{ stroke: c.deep }} strokeWidth={width} strokeLinecap="butt" strokeDasharray="1.1 3.1" opacity={0.42} />
      <path d={d} fill="none" style={{ stroke: c.light }} strokeWidth={width * 0.36} strokeLinecap="round" strokeDasharray="2.4 2" opacity={0.85} transform="translate(-0.3 -0.7)" />
    </g>
  );
}

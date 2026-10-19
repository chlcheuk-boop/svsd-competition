import type { Accent } from '../../types';
import { person } from '../../data/people';

export const accentVar = (c: Accent | string) => (c === 'ink' ? 'var(--ink)' : `var(--${c})`);
export const accentDeep = (c: Accent | string) =>
  c === 'ink' ? 'var(--ink)' : c === 'tangerine' ? 'var(--tangerine-deep)' : `var(--${c}-deep)`;

/** Tiny perforated impact stamp: a person's initial in their color. */
export function MiniStamp({ personId, size = 22, title }: { personId: string; size?: number; title?: string }) {
  const p = person(personId);
  if (!p) return null;
  const teeth = 14;
  const R = 10.4;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const a1 = ((i + 0.5) / teeth) * Math.PI * 2;
    const p0 = [12 + R * Math.cos(a0), 12 + R * Math.sin(a0)];
    const p1 = [12 + R * Math.cos(a1), 12 + R * Math.sin(a1)];
    d += `${i === 0 ? 'M' : 'L'}${p0[0].toFixed(2)},${p0[1].toFixed(2)} Q${(12 + (R - 1.6) * Math.cos((a0 + a1) / 2)).toFixed(2)},${(12 + (R - 1.6) * Math.sin((a0 + a1) / 2)).toFixed(2)} ${p1[0].toFixed(2)},${p1[1].toFixed(2)} `;
  }
  d += 'Z';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={title ?? `stamp from ${p.name}`}>
      <path d={d} fill={accentVar(p.color)} />
      <circle cx="12" cy="12" r="7" fill="none" stroke="#fff" strokeWidth="0.8" strokeDasharray="1 1.3" opacity=".9" />
      <text x="12" y="15.3" textAnchor="middle" fontFamily="Big Caslon Swash, Georgia, serif" fontSize="10" fill={p.color === 'tangerine' || p.color === 'pink' ? '#fff' : '#432005'}>
        {p.initial}
      </text>
    </svg>
  );
}

import type { Accent, Connection, Media } from '../types';
import { sizeOf } from './geometry';

/**
 * One color rule from the style sheet: olive green never sits next to the red or the brown.
 * (`peach` is the olive slot, `tangerine` the red, `ink` the brown.)
 */
export const clashes = (a: Accent, b: Accent) =>
  (a === 'peach' && (b === 'tangerine' || b === 'ink')) || (b === 'peach' && (a === 'tangerine' || a === 'ink'));

const SAFE_FOR_OLIVE: Accent[] = ['lime', 'sky', 'pink'];

/** The color each string is drawn in: an olive string that meets a red or brown one at a card is redrawn in a neighbor-safe color. */
export function yarnColors(connections: Connection[]): Map<string, Accent> {
  const at = new Map<string, Connection[]>();
  for (const c of connections) {
    for (const end of [c.from, c.to]) at.set(end, [...(at.get(end) ?? []), c]);
  }
  const out = new Map<string, Accent>();
  for (const c of connections) {
    if (c.color !== 'peach') {
      out.set(c.id, c.color);
      continue;
    }
    const near = [...(at.get(c.from) ?? []), ...(at.get(c.to) ?? [])].filter((x) => x.id !== c.id).map((x) => x.color);
    if (!near.some((n) => clashes('peach', n))) {
      out.set(c.id, 'peach');
      continue;
    }
    out.set(c.id, SAFE_FOR_OLIVE.find((s) => !near.includes(s)) ?? 'sky');
  }
  return out;
}

const REASON_ORDER: Accent[] = ['pink', 'sky', 'lime', 'tangerine', 'peach'];
const hash = (s: string) => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);

/** Outline color for every card's reason tab: varied, never the same as a neighbor's, and never olive beside red. */
export function reasonColors(media: Media[], reach = 340): Map<string, Accent> {
  const out = new Map<string, Accent>();
  const centers = media.map((m) => {
    const { w, h } = sizeOf(m);
    return { m, x: m.x + w / 2, y: m.y + h / 2 };
  });
  const order = [...centers].sort((a, b) => a.y - b.y || a.x - b.x);
  for (const c of order) {
    const near = order
      .filter((o) => o !== c && out.has(o.m.id) && Math.abs(o.x - c.x) < reach && Math.abs(o.y - c.y) < reach)
      .map((o) => out.get(o.m.id)!);
    const start = hash(c.m.id) % REASON_ORDER.length;
    let pick: Accent = 'pink';
    for (let i = 0; i < REASON_ORDER.length; i++) {
      const cand = REASON_ORDER[(start + i) % REASON_ORDER.length];
      if (!near.includes(cand) && !near.some((n) => clashes(cand, n))) {
        pick = cand;
        break;
      }
    }
    out.set(c.m.id, pick);
  }
  return out;
}

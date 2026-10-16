import type { Media } from '../types';
import { sizeOf } from '../lib/geometry';

/**
 * Maya's desk is laid out in loose rings rather than a grid: one principle at the center,
 * the core references around it, and each neighborhood fanning out on the outer rings
 * (print and color up and to the right, sound and film below, the streets on the left).
 * Angles are clockwise from 12 o'clock.
 */
const CENTER = 'm5';

const RINGS: { r: number; items: [string, number][] }[] = [
  {
    r: 390,
    items: [['m2', 15], ['m14', 75], ['m12', 135], ['m4', 190], ['m7', 255], ['m1', 315]],
  },
  {
    r: 780,
    items: [
      ['m17', 0], ['m19', 21], ['m18', 39], ['m22', 65], ['m21', 84], ['m20', 104], ['m16', 120], ['m24', 149],
      ['m3', 164], ['m9', 184], ['m23', 204], ['m13', 226], ['m11', 250], ['m10', 274], ['m6', 297], ['m8', 318], ['m15', 339],
    ],
  },
  {
    r: 1170,
    items: [
      'm25', 'm27', 'm28', 'm26', 'm48', 'm46', 'm43', 'm44', 'm42', 'm41', 'm45', 'm47',
      'm35', 'm37', 'm40', 'm38', 'm32', 'm30', 'm31', 'm36', 'm29', 'm39', 'm33', 'm34',
    ].map((id, i) => [id, ({ m36: 285, m29: 307 } as Record<string, number>)[id] ?? i * 15 + 4] as [string, number]),
  },
];

// The desk is a little wider than tall, like the screen it sits on.
const SX = 1.28;
const SY = 0.86;

const hash = (s: string) => s.split('').reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 10007, 17);

const POSITIONS = new Map<string, { cx: number; cy: number }>();
POSITIONS.set(CENTER, { cx: 0, cy: 0 });
for (const ring of RINGS) {
  for (const [id, deg] of ring.items) {
    const h = hash(id);
    const r = ring.r + ((h % 61) - 30); // a little in or out of the ring
    const a = ((deg + ((h >> 3) % 7) - 3) * Math.PI) / 180;
    POSITIONS.set(id, { cx: Math.sin(a) * r * SX, cy: -Math.cos(a) * r * SY });
  }
}

export const isDeskId = (id: string) => POSITIONS.has(id);

/** Move the example references onto the rings. Anything else keeps its place. */
export function arrangeDesk(media: Media[]): Media[] {
  return media.map((m) => {
    const p = POSITIONS.get(m.id);
    if (!p) return m;
    const { w, h } = sizeOf(m);
    return { ...m, x: Math.round(p.cx - w / 2), y: Math.round(p.cy - h / 2) };
  });
}

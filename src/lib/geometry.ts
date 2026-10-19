import type { CardShape, Media } from '../types';

export interface Pt {
  x: number;
  y: number;
}

export const CARD_SIZE: Record<CardShape, { w: number; h: number }> = {
  // every kind now shares one stamp card
  punched: { w: 196, h: 236 },
  sticky: { w: 196, h: 236 },
  folded: { w: 196, h: 236 },
  polaroid: { w: 196, h: 236 },
};

export const sizeOf = (m: Pick<Media, 'shape'>) => CARD_SIZE[m.shape];
export const centerOf = (m: Media): Pt => {
  const { w, h } = sizeOf(m);
  return { x: m.x + w / 2, y: m.y + h / 2 };
};

const rad = (d: number) => (d * Math.PI) / 180;
const rotate = (p: Pt, r: number): Pt => ({
  x: p.x * Math.cos(r) - p.y * Math.sin(r),
  y: p.x * Math.sin(r) + p.y * Math.cos(r),
});

/**
 * Two stitch holes on card `m`, on the edge facing `toward`.
 * `outer` sits near the edge (the yarn surfaces here after passing under the card edge),
 * `inner` is deeper in (the yarn dives back down here).
 */
export function holesFor(m: Media, toward: Pt, rotDeg = m.rot) {
  const { w, h } = sizeOf(m);
  const c = centerOf(m);
  const r = rad(rotDeg);
  const local = rotate({ x: toward.x - c.x, y: toward.y - c.y }, -r);
  const len = Math.hypot(local.x, local.y) || 1;
  const ux = local.x / len;
  const uy = local.y / len;
  const hw = w / 2 - 15;
  const hh = h / 2 - 15;
  const t = 1 / Math.max(Math.abs(ux) / hw, Math.abs(uy) / hh);
  const outerL = { x: ux * t, y: uy * t };
  // the title and date sit in a band across the bottom of the card; the sewing stays off them
  const cap = { x0: -w / 2 + 12, x1: w / 2 - 12, y0: h / 2 - 74, y1: h / 2 - 15 };
  const inCap = (p: Pt) => p.x > cap.x0 && p.x < cap.x1 && p.y > cap.y0 && p.y < cap.y1;
  // on a side edge beside the caption, come in higher up, beside the image
  if (Math.abs(outerL.x) > hw - 1 && outerL.y > cap.y0 - 8) outerL.y = cap.y0 - 8;
  let innerL = { x: outerL.x - ux * 16 - uy * 5, y: outerL.y - uy * 16 + ux * 5 };
  // on the bottom edge, run along the margin instead of diving into the date
  if (inCap(innerL)) {
    const dir = outerL.x > 0 ? -1 : 1;
    innerL = { x: outerL.x + dir * 16, y: outerL.y };
  }
  const toWorld = (p: Pt) => {
    const q = rotate(p, r);
    return { x: q.x + c.x, y: q.y + c.y };
  };
  return { outer: toWorld(outerL), inner: toWorld(innerL) };
}

export interface Bezier {
  p1: Pt;
  c1: Pt;
  c2: Pt;
  p2: Pt;
}

export function sagCurve(p1: Pt, p2: Pt, sagOverride?: number, sway = 0): Bezier {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const d = Math.hypot(dx, dy);
  const sag = sagOverride ?? Math.min(70, 14 + d * 0.12);
  return {
    p1,
    c1: { x: p1.x + dx / 3 + sway, y: p1.y + dy / 3 + sag },
    c2: { x: p1.x + (2 * dx) / 3 + sway, y: p1.y + (2 * dy) / 3 + sag },
    p2,
  };
}

export const bezierPath = (b: Bezier) =>
  `M${b.p1.x.toFixed(1)},${b.p1.y.toFixed(1)} C${b.c1.x.toFixed(1)},${b.c1.y.toFixed(1)} ${b.c2.x.toFixed(1)},${b.c2.y.toFixed(1)} ${b.p2.x.toFixed(1)},${b.p2.y.toFixed(1)}`;

export function pointAt(b: Bezier, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * b.p1.x + 3 * u * u * t * b.c1.x + 3 * u * t * t * b.c2.x + t * t * t * b.p2.x,
    y: u * u * u * b.p1.y + 3 * u * u * t * b.c1.y + 3 * u * t * t * b.c2.y + t * t * t * b.p2.y,
  };
}

/** Closest t on a bezier to point p (coarse sampling is plenty for UI). */
export function closestT(b: Bezier, p: Pt) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const q = pointAt(b, t);
    const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  return best;
}

/** Geometry for one connection between two cards. */
export function connectionGeometry(a: Media, b: Media, rotA = a.rot, rotB = b.rot) {
  const ca = centerOf(a);
  const cb = centerOf(b);
  const ha = holesFor(a, cb, rotA);
  const hb = holesFor(b, ca, rotB);
  const curve = sagCurve(ha.outer, hb.outer);
  return { ha, hb, curve };
}

/** Seeded random, stable per item. */
export function seeded(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const randomRot = () => Math.round((Math.random() * 8 - 4) * 10) / 10;

export function boundsOf(media: Media[]) {
  if (!media.length) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const m of media) {
    const { w, h } = sizeOf(m);
    minX = Math.min(minX, m.x);
    minY = Math.min(minY, m.y);
    maxX = Math.max(maxX, m.x + w);
    maxY = Math.max(maxY, m.y + h);
  }
  return { minX, minY, maxX, maxY };
}

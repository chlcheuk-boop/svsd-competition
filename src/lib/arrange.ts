import type { Media, MediaType } from '../types';
import { sizeOf } from './geometry';

/**
 * Tidy views of the desk. The stored x/y is the person's own layout ("free");
 * "kind" and "theme" lay the same cards out on a straight grid, in labeled sections,
 * so the only loose, hand-drawn thing left on screen is the yarn.
 */
export type Arrange = 'free' | 'kind' | 'theme';

export interface Section {
  key: string;
  label: string;
  group?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  count: number;
  /** width from the first card's left edge to the right edge of the widest row of cards */
  contentW: number;
}

const CELL_W = 280;
const CELL_H = 300;
const PER_ROW = 4;
const LABEL_H = 84;
const SECTION_GAP = 72;
const COLUMN_GAP = 150;
const COLUMNS = 3;

const KIND_SECTIONS: { key: string; label: string; group: string; types: MediaType[] }[] = [
  { key: 'place', label: 'Places', group: 'from your life', types: ['place'] },
  { key: 'photo', label: 'Photos & images', group: 'from your life', types: ['photo'] },
  { key: 'event', label: 'Events', group: 'from your life', types: ['event'] },
  { key: 'moment', label: 'Things I noticed', group: 'from your life', types: ['moment'] },
  { key: 'object', label: 'Objects', group: 'media', types: ['object'] },
  { key: 'music', label: 'Music', group: 'media', types: ['music'] },
  { key: 'video', label: 'Film & video', group: 'media', types: ['video'] },
  { key: 'text', label: 'Quotes', group: 'media', types: ['text'] },
  { key: 'link', label: 'Links', group: 'media', types: ['link'] },
];

const THEMES: { key: string; label: string; tags: string[]; types?: MediaType[] }[] = [
  { key: 'print', label: 'Print & type', tags: ['poster', 'print', 'risograph', 'type', 'bauhaus', '70s', 'japan'] },
  { key: 'streets', label: 'Signs & streets', tags: ['signage', 'street', 'philly', 'transit', 'wayfinding', 'map', 'brutalist', 'cities', 'architecture'] },
  { key: 'color', label: 'Color & light', tags: ['color', 'light', 'own work', 'grid'] },
  { key: 'film', label: 'Film & time', tags: ['film', 'time', 'longing'], types: ['video'] },
  { key: 'sound', label: 'Sound & quiet', tags: ['quiet', 'jazz', 'piano', 'ambient', 'soul', 'sound'], types: ['music'] },
  { key: 'rules', label: 'Rules & notes', tags: ['principle', 'quote'], types: ['text', 'moment'] },
];

export function themeOf(m: Media) {
  let best: string | null = null;
  let bestScore = 0;
  for (const t of THEMES) {
    const score = m.tags.filter((tag) => t.tags.includes(tag)).length;
    if (score > bestScore) {
      best = t.key;
      bestScore = score;
    }
  }
  if (best) return best;
  return THEMES.find((t) => t.types?.includes(m.type))?.key ?? 'other';
}

function groupsFor(mode: Exclude<Arrange, 'free'>, media: Media[]) {
  if (mode === 'kind') {
    return KIND_SECTIONS.map((s) => ({ key: s.key, label: s.label, group: s.group, items: media.filter((m) => s.types.includes(m.type)) }));
  }
  const all = [...THEMES.map((t) => ({ key: t.key, label: t.label, group: undefined as string | undefined })), { key: 'other', label: 'Everything else', group: undefined }];
  return all.map((t) => ({ ...t, items: media.filter((m) => themeOf(m) === t.key) }));
}

/** Lay the cards out on a grid. Returns positioned copies (stored layout untouched) and the section frames. */
export function arrange(mode: Arrange, media: Media[]): { media: Media[]; sections: Section[] } {
  if (mode === 'free') return { media, sections: [] };

  // oldest first inside each section, so a section reads like a timeline
  const sorted = [...media].sort((a, b) => (a.addedAt < b.addedAt ? -1 : a.addedAt > b.addedAt ? 1 : 0));
  const groups = groupsFor(mode, sorted).filter((g) => g.items.length);

  const heightOf = (n: number) => LABEL_H + Math.ceil(n / PER_ROW) * CELL_H;
  const total = groups.reduce((h, g) => h + heightOf(g.items.length) + SECTION_GAP, 0);
  const target = total / COLUMNS;

  const placed = new Map<string, { x: number; y: number }>();
  const sections: Section[] = [];
  let col = 0;
  let y = 0;
  let lastGroup: string | undefined;
  const colW = PER_ROW * CELL_W;
  for (const g of groups) {
    const h = heightOf(g.items.length);
    // move to the next column once this one is full (keep reading order top-to-bottom, left-to-right)
    if (y > 0 && y + h / 2 > target && col < COLUMNS - 1) {
      col += 1;
      y = 0;
    }
    const x0 = col * (colW + COLUMN_GAP);
    // name a group ("from your life", "media") once, on its first section
    const groupLabel = g.group !== lastGroup ? g.group : undefined;
    lastGroup = g.group;
    // the label, the rule and the first card all start on the same left edge
    const inset = (CELL_W - sizeOf(g.items[0]).w) / 2;
    const cardW = sizeOf(g.items[0]).w;
    const contentW = (Math.min(g.items.length, PER_ROW) - 1) * CELL_W + cardW;
    sections.push({ key: g.key, label: g.label, group: groupLabel, x: x0 + inset, y: y - 10, w: colW - inset * 2, h: h + 20, count: g.items.length, contentW });
    g.items.forEach((m, i) => {
      const { w, h: ch } = sizeOf(m);
      const cx = x0 + (i % PER_ROW) * CELL_W + CELL_W / 2;
      const cy = y + LABEL_H + Math.floor(i / PER_ROW) * CELL_H + CELL_H / 2;
      placed.set(m.id, { x: Math.round(cx - w / 2), y: Math.round(cy - ch / 2) });
    });
    y += h + SECTION_GAP;
  }

  return {
    media: media.map((m) => {
      const p = placed.get(m.id);
      return p ? { ...m, x: p.x, y: p.y, rot: 0 } : m;
    }),
    sections,
  };
}

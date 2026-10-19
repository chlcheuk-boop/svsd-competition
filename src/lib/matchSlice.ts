import type { Connection, Media, Quadrant } from '../types';

/**
 * A match never sees someone's whole board. They see a slice, chosen for how their two boards meet:
 *   I   Mirror   (similar collection, similar connections): things you both have, tied the way you'd tie them
 *   II  Lens     (similar collection, different connections): a thing you share, and where they took it instead
 *   III Parallel (different collection, similar connections): different things, tied for the same reasons
 *   IV  Stranger (different, different): one small corner of their desk, to start
 * No performing a whole board for strangers; just the overlap that's worth a conversation.
 */

export interface Slice {
  media: Media[];
  connections: Connection[];
  /** short note under each card: why it's in the slice */
  notes: Map<string, string>;
  /** ids of their cards that match one of yours */
  shared: Set<string>;
  summary: string;
  total: number;
  /** grid columns the slice was laid out in, so later cards can line up */
  cols: number;
}

const STOP = new Set(('a an and the of to in on at for with is it its this that these those i my me you your both same just like be are was from by as or but not so too than into one only out up all what when where who why how ' +
  'every long still more most thing things been being have has had made make makes them they their there here then because about after before over under some each other again never ever always would could should').split(' '));
const words = (s?: string) =>
  (s ?? '').toLowerCase().replace(/[^a-z\s'’]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w));

const MAX = 7;
const CELL_W = 280;
const CELL_H = 300;

export function sliceFor(
  quadrant: Quadrant,
  mine: { media: Media[]; connections: Connection[] },
  theirs: { media: Media[]; connections: Connection[] },
): Slice {
  const myIds = new Set(mine.media.map((m) => m.id));
  const myTags = new Set(mine.media.flatMap((m) => m.tags));
  const byId = new Map(theirs.media.map((m) => [m.id, m]));
  const degree = (id: string) => theirs.connections.filter((c) => c.from === id || c.to === id).length;
  const tagOverlap = (m: Media) => m.tags.filter((t) => myTags.has(t)).length;

  // exact (the same reference) or close (shares two or more of your tags)
  const exact = new Set(theirs.media.filter((m) => m.ref && myIds.has(m.ref)).map((m) => m.id));
  const close = new Set(theirs.media.filter((m) => !exact.has(m.id) && tagOverlap(m) >= 2).map((m) => m.id));
  const shared = new Set([...exact, ...close]);
  const isShared = (id: string) => shared.has(id);

  const pickedC: Connection[] = [];
  const pickedM: string[] = [];
  const notes = new Map<string, string>();
  const addM = (id: string, note?: string) => {
    if (!pickedM.includes(id) && pickedM.length < MAX) pickedM.push(id);
    if (note && !notes.has(id)) notes.set(id, note);
  };
  const addC = (c: Connection) => {
    if (pickedC.some((x) => x.id === c.id)) return;
    if (!pickedM.includes(c.from) && !pickedM.includes(c.to) && pickedM.length > MAX - 2) return;
    pickedC.push(c);
  };
  const sharedNote = (id: string) => (exact.has(id) ? 'you both have this' : 'close to one of yours');

  let summary = '';
  if (quadrant === 1) {
    // strings between two things you both collect
    const both = theirs.connections.filter((c) => isShared(c.from) && isShared(c.to));
    for (const c of both.slice(0, 3)) {
      addM(c.from, sharedNote(c.from)); addM(c.to, sharedNote(c.to)); addC(c);
    }
    for (const id of shared) addM(id, sharedNote(id));
    summary = 'similar media, similar connections';
  } else if (quadrant === 2) {
    // a shared thing, then the different strings they ran from it
    // exact matches lead; a "different string" is any string to something you don't have exactly
    const byDegree = (a: string, b: string) => degree(b) - degree(a);
    const hubs = [...[...exact].sort(byDegree), ...[...close].sort(byDegree)].slice(0, 3);
    for (const h of hubs) {
      addM(h, sharedNote(h));
      const away = theirs.connections.filter((c) => (c.from === h && !exact.has(c.to)) || (c.to === h && !exact.has(c.from)));
      for (const c of away.slice(0, 2)) {
        const other = c.from === h ? c.to : c.from;
        addM(other, 'where they took it'); addC(c);
      }
    }
    summary = 'similar media, dissimilar connections';
  } else if (quadrant === 3) {
    // strings whose whys use your words
    const myWords = new Set(mine.connections.flatMap((c) => words(c.why)).concat(mine.media.flatMap((m) => words(m.why))));
    const scored = theirs.connections
      .map((c) => {
        const hit = words(c.why).filter((w) => myWords.has(w));
        const ends = [byId.get(c.from), byId.get(c.to)].filter(Boolean) as Media[];
        return { c, hit, score: hit.length * 2 + ends.reduce((n, m) => n + tagOverlap(m), 0) * 0.5 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    for (const { c, hit } of scored) {
      const note = hit.length ? `tied for your reason: “${hit[0]}”` : 'tied the way you tie things';
      addM(c.from, note); addM(c.to, note); addC(c);
    }
    summary = 'dissimilar media, similar connections';
  } else {
    // one corner of their desk: their most-tied card and its neighbors
    const hub = [...theirs.media].sort((a, b) => degree(b.id) - degree(a.id))[0];
    if (hub) {
      addM(hub.id, 'the center of one corner of their desk');
      for (const c of theirs.connections.filter((x) => x.from === hub.id || x.to === hub.id).slice(0, 4)) {
        addM(c.from === hub.id ? c.to : c.from); addC(c);
      }
    }
    summary = 'dissimilar media, dissimilar connections';
  }

  // only keep strings whose both ends made it in
  const inSlice = new Set(pickedM);
  const connections = pickedC.filter((c) => inSlice.has(c.from) && inSlice.has(c.to));

  // lay the slice out as a tidy grid, in the order it was chosen
  const cols = Math.min(4, Math.max(2, Math.ceil(pickedM.length / 2)));
  const media = pickedM.map((id, i) => {
    const m = byId.get(id)!;
    return { ...m, x: (i % cols) * CELL_W, y: Math.floor(i / cols) * CELL_H, rot: 0 };
  });

  return { media, connections, notes, shared, summary, total: theirs.media.length, cols };
}

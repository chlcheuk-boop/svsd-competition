import type { Connection, Media, PassportStamp } from '../types';
import { ART } from './maya';

export const PASSPORT_STAMPS: PassportStamp[] = [
  { id: 's1', personId: 'theo', date: '2025-08-14', quadrant: 1, shape: 'circle', color: 'sky', kind: 'critique',
    excerpt: 'the type is doing the shouting',
    full: 'On “poster type that shouts”: Fantômas is hand-lettered and still louder than most fonts. Collect more hand-painted type and you have a thread.',
    target: { kind: 'connection', id: 'mc-f4-f2' } },
  { id: 's2', personId: 'june', date: '2025-09-02', quadrant: 1, shape: 'rounded', color: 'pink', kind: 'stamp',
    excerpt: 'a frame from a dream',
    full: 'Mulholland Drive is a dream that won’t hold still. Your purple airplane window looks like a frame cut out of it.',
    target: { kind: 'media', id: 'f1' } },
  { id: 's3', personId: 'theo', date: '2025-11-20', quadrant: 1, shape: 'hexagon', color: 'tangerine', kind: 'stamp',
    excerpt: 'lettering nobody designed',
    full: 'Mr. Batrez on the whiteboard is my favorite card on your board. Lettering nobody designed, by people who meant every line.',
    target: { kind: 'media', id: 'p4' } },
  { id: 's4', personId: 'rafa', date: '2026-01-08', quadrant: 4, shape: 'oval', color: 'lime', kind: 'stamp',
    excerpt: 'chopsticks like glaze tiles',
    full: 'Your chopsticks are lined up like glaze test tiles: every color sitting next to the one it almost is.',
    target: { kind: 'media', id: 'p3' } },
  { id: 's5', personId: 'rafa', date: '2026-01-19', quadrant: 4, shape: 'triangle', color: 'pink', kind: 'critique',
    excerpt: 'more mess, please',
    full: 'On “museums where the building is the best piece”: beautiful, but so composed. More mess, please. Where is the thing that embarrasses you?',
    target: { kind: 'connection', id: 'mc-p10-p27' } },
  { id: 's6', personId: 'june', date: '2026-02-27', quadrant: 1, shape: 'perforated', color: 'sky', kind: 'crossing',
    excerpt: 'lit up like it knows',
    full: 'Crossing with June: “Stouffer at night and the rooftop cinema are the same shot: a building lit up like it knows you’re watching.”',
    target: { kind: 'connection', id: 'mc-f3-pl3' } },
  { id: 's7', personId: 'ines', date: '2026-05-21', quadrant: 3, shape: 'perforated', color: 'pink', kind: 'crossing',
    excerpt: 'detail is patience',
    full: 'Crossing with Inés: “The beading on the bebe top and the lace-up front are both hours of handwork. Pink with too much detail is patience you can wear.”',
    target: { kind: 'connection', id: 'mc-o4-o3' } },
  { id: 's8', personId: 'ines', date: '2026-05-30', quadrant: 3, shape: 'circle', color: 'tangerine', kind: 'stamp',
    excerpt: 'woven, not printed',
    full: 'Look closely at your Coach bag: the stripes are woven, not printed. Somebody set up a loom for that pink.',
    target: { kind: 'media', id: 'o11' } },
  { id: 's9', personId: 'saskia', date: '2026-07-02', quadrant: 2, shape: 'perforated', color: 'lime', kind: 'crossing',
    excerpt: 'a room you walk through',
    full: 'Crossing with Saskia: “The gallery in Bulgaria and the hallway beside it are one idea: a room you’re meant to walk through slowly, not stand in.”',
    target: { kind: 'connection', id: 'mc-p9-p10' } },
  { id: 's10', personId: 'saskia', date: '2026-07-11', quadrant: 2, shape: 'hexagon', color: 'sky', kind: 'critique',
    excerpt: 'architecture without the building',
    full: 'Your Miami shadows are the best architecture on your board, and the building isn’t even in the photo. Find more buildings that only show up as shadows.',
    target: { kind: 'media', id: 'p18' } },
  { id: 's11', personId: 'rafa', date: '2026-08-03', quadrant: 4, shape: 'rounded', color: 'tangerine', kind: 'stamp',
    excerpt: 'red to green, like a kiln',
    full: 'That watermelon is the exact red-to-green I spend months trying to get out of a kiln.',
    target: { kind: 'media', id: 'p23' } },
  { id: 's12', personId: 'theo', date: '2026-09-18', quadrant: 1, shape: 'oval', color: 'pink', kind: 'critique',
    excerpt: 'a manifesto for line',
    full: 'The Santana lion next to Mr. Batrez is a manifesto for line drawing. Publish that as a thread before someone else does.',
    target: { kind: 'connection', id: 'mc-a4-p4' } },
];

/** What Kenji ties onto Maya's board when the Crossing completes: one string between two of her own cards. */
export const KENJI_GIFT_WHY =
  'you’re holding flowers in a pink dress. That’s my walk to work and the set we both saved, in one picture.';

export const KENJI_GIFT_CONNECTION: Connection = {
  id: 'ck1', from: 'p1', to: 'o13', color: 'tangerine', addedAt: '2026-10-15', via: 'kenji',
  why: `Kenji: ${KENJI_GIFT_WHY}`,
};

export const KENJI_PASSPORT_STAMP: PassportStamp = {
  id: 'sk1', personId: 'kenji', date: '2026-10-15', quadrant: 2, shape: 'circle', color: 'tangerine', kind: 'crossing',
  excerpt: 'flowers in a pink dress',
  full: `Crossing with Kenji: “${KENJI_GIFT_WHY}”`,
  target: { kind: 'connection', id: 'ck1' }, fresh: true,
};

/**
 * Maya's side of past exchanges: which of her things she brought to each person's board,
 * and the strings she tied there. (Their side lives on her board as `via` media and strings.)
 */
export const PAST_GIVEN: Record<string, { mediaIds: string[]; strings: { a: string; b: string; why: string; date: string }[] }> = {};

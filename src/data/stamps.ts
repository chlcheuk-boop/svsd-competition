import type { Connection, Media, PassportStamp } from '../types';
import { ART } from './maya';

export const PASSPORT_STAMPS: PassportStamp[] = [
  { id: 's1', personId: 'theo', date: '2025-08-14', quadrant: 1, shape: 'circle', color: 'sky', kind: 'critique',
    excerpt: 'the grid is doing the talking',
    full: 'On “Two colors and a grid”: the grid is doing the talking here, and I love that you let it. Try a thread where the grid breaks.',
    target: { kind: 'connection', id: 'c2' } },
  { id: 's2', personId: 'june', date: '2025-09-02', quadrant: 1, shape: 'rounded', color: 'pink', kind: 'stamp',
    excerpt: 'the corridor moves like a dolly shot',
    full: 'Your corridor-to-gouache string made me rewatch the scene. The camera moves like it is ashamed to look. You painted that shame in pink.',
    target: { kind: 'connection', id: 'c5' } },
  { id: 's3', personId: 'theo', date: '2025-11-20', quadrant: 1, shape: 'hexagon', color: 'tangerine', kind: 'stamp',
    excerpt: 'letters with tools still in them',
    full: 'The stencil R is the best thing on your board. Letters with the tools still in them. Look up road-stencil kits from Lagos, you would lose a week.',
    target: { kind: 'media', id: 'm10' } },
  { id: 's4', personId: 'rafa', date: '2026-01-08', quadrant: 4, shape: 'oval', color: 'lime', kind: 'stamp',
    excerpt: 'glaze does what riso does',
    full: 'Glaze does what riso does: you never get the color you asked for, only the one the kiln agreed to. I think you would like making something by hand that disobeys.',
    target: { kind: 'media', id: 'm8' } },
  { id: 's5', personId: 'rafa', date: '2026-01-19', quadrant: 4, shape: 'triangle', color: 'pink', kind: 'critique',
    excerpt: 'more mess, please',
    full: 'On “Quiet tension”: it is beautiful, but everything is so composed. More mess, please. Where is the thing that embarrasses you?',
    target: { kind: 'connection', id: 'c6' } },
  { id: 's6', personId: 'june', date: '2026-02-27', quadrant: 1, shape: 'perforated', color: 'sky', kind: 'crossing',
    excerpt: 'speed it up and it breathes',
    full: 'Crossing with June: “Koyaanisqatsi is what your signage photos would look like at 40× speed. Speed it up and the concrete breathes.”',
    target: { kind: 'connection', id: 'c11' } },
  { id: 's7', personId: 'ines', date: '2026-05-21', quadrant: 3, shape: 'perforated', color: 'pink', kind: 'crossing',
    excerpt: 'misregistration is a dialect',
    full: 'Crossing with Inés: “Misregistration is a dialect, not a mistake. Every lotería card in my grandmother’s deck is slightly off, and that is how you know it is real.”',
    target: { kind: 'connection', id: 'c12' } },
  { id: 's8', personId: 'ines', date: '2026-05-30', quadrant: 3, shape: 'circle', color: 'tangerine', kind: 'stamp',
    excerpt: 'El Sol belongs next to Expo',
    full: 'El Sol belongs next to your Expo poster. Two suns, two countries, both selling something.',
    target: { kind: 'media', id: 'm15' } },
  { id: 's9', personId: 'saskia', date: '2026-07-02', quadrant: 2, shape: 'perforated', color: 'lime', kind: 'crossing',
    excerpt: 'a corridor that decided to climb',
    full: 'Crossing with Saskia: “A ramp is a corridor that decided to climb. Your WKW corridor and the Kunsthal ramp are the same idea at different speeds.”',
    target: { kind: 'connection', id: 'c13' } },
  { id: 's10', personId: 'saskia', date: '2026-07-11', quadrant: 2, shape: 'hexagon', color: 'sky', kind: 'critique',
    excerpt: 'you read buildings like posters',
    full: 'You read buildings like posters: front-on, flat, two colors. Try walking around one. The back of a brutalist building is where the honesty is.',
    target: { kind: 'media', id: 'm7' } },
  { id: 's11', personId: 'rafa', date: '2026-08-03', quadrant: 4, shape: 'rounded', color: 'tangerine', kind: 'stamp',
    excerpt: 'the token is a tiny sculpture',
    full: 'Your SEPTA token is a tiny sculpture. Someone designed the hole in the middle. Someone decided its weight.',
    target: { kind: 'media', id: 'm6' } },
  { id: 's12', personId: 'theo', date: '2026-09-18', quadrant: 1, shape: 'oval', color: 'pink', kind: 'critique',
    excerpt: 'Gibson + stencil = a manifesto',
    full: 'Gibson next to the stencil is a manifesto. Publish that as a thread before someone else does.',
    target: { kind: 'connection', id: 'c10' } },
];

/** What Kenji ties onto Maya's board when the Crossing completes. */
export const KENJI_GIFT_MEDIA: Media = {
  id: 'mk1', type: 'object', title: 'Shinjuku handbill, 1969', subtitle: 'from Kenji’s board',
  origin: 'Kenji tied this in during our Crossing', tags: ['protest', 'print', '70s'],
  x: -190, y: 300, rot: -3, shape: 'punched', tint: 'white',
  art: { kind: 'stencil', colors: [ART.cream, ART.red, ART.ink], seed: 21 },
  addedAt: '2026-10-15', via: 'kenji',
};

export const KENJI_GIFT_WHY =
  'printed in Shinjuku in 1969. It belongs on the wall of that thrift store you found in Japan, old paper sold back as decor.';

export const KENJI_GIFT_CONNECTION: Connection = {
  id: 'ck1', from: 'mk1', to: 'p6', color: 'tangerine', addedAt: '2026-10-15', via: 'kenji',
  why: `Kenji: ${KENJI_GIFT_WHY}`,
};

export const KENJI_PASSPORT_STAMP: PassportStamp = {
  id: 'sk1', personId: 'kenji', date: '2026-10-15', quadrant: 2, shape: 'circle', color: 'tangerine', kind: 'crossing',
  excerpt: 'old paper sold back as decor',
  full: `Crossing with Kenji: “The Shinjuku handbill was ${KENJI_GIFT_WHY}”`,
  target: { kind: 'connection', id: 'ck1' }, fresh: true,
};

/**
 * Maya's side of past exchanges: which of her things she brought to each person's board,
 * and the strings she tied there. (Their side lives on her board as `via` media and strings.)
 */
export const PAST_GIVEN: Record<string, { mediaIds: string[]; strings: { a: string; b: string; why: string; date: string }[] }> = {
  ines: {
    mediaIds: ['m8'],
    strings: [{ a: 'Talavera tile, Puebla', b: 'Riso ink color chart', why: 'the glaze bleeds the way riso does', date: '2026-05-20' }],
  },
  saskia: {
    mediaIds: ['m7'],
    strings: [{ a: 'Kunsthal ramp', b: 'Garage signage, 13th St', why: 'concrete that tells you where to go', date: '2026-07-01' }],
  },
  june: {
    mediaIds: ['m13'],
    strings: [{ a: 'Night bus timelapse', b: 'Koyaanisqatsi', why: 'the same city at forty times the speed', date: '2026-02-26' }],
  },
  rafa: {
    mediaIds: [],
    strings: [{ a: 'Kiln-cracked bowl', b: 'Riso ink color chart', why: 'you never get the color you asked for', date: '2026-01-07' }],
  },
  theo: { mediaIds: [], strings: [] },
};

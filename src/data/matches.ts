import type { ArtSpec, CardShape, CardTint, Connection, MatchProfile, Media, MediaType, Thread } from '../types';
import { ART } from './maya';
import { SHAPE_FOR } from '../lib/mediaKinds';

type Opts = Partial<Pick<Media, 'origin' | 'tags' | 'rot' | 'shape' | 'tint' | 'quote' | 'ref' | 'url'>>;


function mk(
  id: string, type: MediaType, title: string, subtitle: string, art: ArtSpec | undefined,
  x: number, y: number, o: Opts = {},
): Media {
  return {
    id, type, title, subtitle, art, x, y,
    rot: o.rot ?? ((id.charCodeAt(id.length - 1) * 37) % 8) - 4,
    shape: o.shape ?? SHAPE_FOR[type],
    tint: (o.tint ?? (type === 'text' ? 'peach' : 'white')) as CardTint,
    origin: o.origin, tags: o.tags ?? [], quote: o.quote ?? (type === 'text' ? title : undefined),
    ref: o.ref, url: o.url, addedAt: '2026-01-01',
  };
}
const c = (id: string, from: string, to: string, why: string, color: Connection['color'] = 'tangerine'): Connection =>
  ({ id, from, to, why, color, addedAt: '2026-01-02' });
const a = (kind: ArtSpec['kind'], colors: string[], seed: number): ArtSpec => ({ kind, colors, seed });

/* ---------------- II · Pearl · Kenji ---------------- */
const img = (m: Media, src: string): Media => ({ ...m, imageData: src });
const kenjiMedia: Media[] = [
  img(mk('k12', 'object', 'Pink two-piece set', 'two-piece', undefined, 140, 140,
    { ref: 'o13', tags: ['fashion', 'pink'], origin: 'a shop window in Namba' }), '/objects/pink-set.jpg'),
  img(mk('k13', 'photo', 'Flowers on my walk to work', 'my photo', undefined, 430, 140,
    { tags: ['pink', 'flowers'], origin: 'the corner by the station, 8:10am' }), '/demo/kenji-flowers.jpg'),
  img(mk('k14', 'object', 'Vintage Coach bag', 'vintage Coach', undefined, 140, 440,
    { ref: 'o11', tags: ['vintage', 'bags'], origin: 'a resale app, saved at 1am' }), '/objects/coach-bag.jpg'),
  img(mk('k15', 'photo', 'Friday poke bowl', 'my photo', undefined, 430, 440,
    { tags: ['food', 'lunch'], origin: 'the place downstairs from the office' }), '/demo/kenji-poke.jpg'),
  img(mk('k16', 'photo', 'Dinner after a long week', 'my photo', undefined, 720, 440,
    { tags: ['dinner'], origin: 'the counter seat, 9pm' }), '/demo/kenji-sushi.jpg'),
  mk('k17', 'text', 'I keep saving things that look like spring.', 'my notebook', undefined, 720, 140,
    { tint: 'sky', origin: 'written on the train home' }),
];
const kenjiConn: Connection[] = [
  c('kc1', 'k12', 'k13', 'it reminds me of the flowers I pass on my way to work', 'pink'),
  c('kc2', 'k14', 'k15', 'pink and green, like the salmon and cucumber I order every Friday', 'lime'),
  c('kc3', 'k15', 'k16', 'how a week starts to taste good again', 'tangerine'),
  c('kc4', 'k17', 'k15', 'even lunch counts', 'sky'),
];
const kenjiThreads: Thread[] = [
  { id: 'kt1', owner: 'kenji', title: 'Pink on the way to work', intro: 'Everything I pass before nine.',
    mediaIds: ['k12', 'k13'], publishedAt: '2026-08-01', isPublic: true },
  { id: 'kt2', owner: 'kenji', title: 'Fridays', mediaIds: ['k14', 'k15', 'k16'], publishedAt: '2026-09-12', isPublic: true },
];

/* ---------------- I · Rock · Lena ---------------- */
const lenaMedia: Media[] = [
  img(mk('l1', 'video', 'Fantômas', 'Louis Feuillade, 1913', undefined, 160, 120,
    { ref: 'f4', tags: ['film', 'poster'], origin: 'a poster shop in Prenzlauer Berg' }), '/film/fantomas.jpg'),
  img(mk('l2', 'video', 'Forbidden Planet', 'Fred McLeod Wilcox, 1956', undefined, 460, 120,
    { ref: 'f2', tags: ['film', 'poster'], origin: 'the lobby of a cinema in Neukölln' }), '/film/forbidden-planet.jpg'),
  img(mk('l3', 'video', 'Mulholland Drive', 'David Lynch, 2001', undefined, 760, 120,
    { ref: 'f1', tags: ['film'], origin: 'watched it twice in one night' }), '/film/mulholland-drive.jpg'),
  mk('l4', 'photo', 'Hand-painted Kino sign', 'Kreuzberg', a('stencil', [ART.cream, ART.red, ART.ink], 31), 160, 440,
    { tags: ['berlin'], origin: 'bike ride home in January' }),
  mk('l5', 'photo', 'Akzidenz-Grotesk specimen', 'type', a('grid', [ART.cream, ART.ink, ART.ink, ART.ink, ART.cream], 32), 460, 440,
    { shape: 'punched', tags: ['specimen'], origin: 'a flea market at Mauerpark' }),
  mk('l6', 'music', 'Autobahn', 'Kraftwerk', a('stripes', [ART.ink, ART.cream, ART.sky, ART.cream, ART.ink], 35), 760, 440,
    { tags: ['krautrock'], origin: 'my mom’s cassette' }),
  mk('l7', 'text', 'If the title isn’t shouting, it isn’t a poster.', 'my notebook', undefined, 1060, 140,
    { tint: 'lime', origin: 'written on a tram' }),
  mk('l8', 'link', 'East German film posters', 'archive', a('dots', [ART.cream, ART.navy, ART.red], 37), 1060, 440,
    { tags: ['archive'], origin: 'a professor’s reading list' }),
];
const lenaConn: Connection[] = [
  c('lc1', 'l1', 'l2', 'two posters that shout their titles at you', 'sky'),
  c('lc2', 'l3', 'l1', 'films I understood less the longer I looked', 'pink'),
  c('lc3', 'l4', 'l5', 'letters painted by hand next to letters cut in metal'),
  c('lc4', 'l7', 'l1', 'this is what I mean', 'lime'),
  c('lc5', 'l8', 'l2', 'where I go to find posters this loud', 'sky'),
  c('lc6', 'l6', 'l4', 'what I listen to riding past it', 'lime'),
];
const lenaThreads: Thread[] = [
  { id: 'lt1', owner: 'lena', title: 'Titles that shout', mediaIds: ['l7', 'l1', 'l2'], publishedAt: '2026-07-20', isPublic: true },
];

/* ---------------- III · Shell · Marcus ---------------- */
const marcusMedia: Media[] = [
  mk('r1', 'music', 'Kind of Blue', 'Miles Davis', a('waves', [ART.navy, ART.sky, ART.cream], 4), 160, 140,
    { tags: ['jazz'], origin: 'the first record I owned' }),
  mk('r2', 'photo', 'Green Mill, 1am', 'my photo', a('neon', [ART.navy, ART.forest, ART.mustard], 44), 460, 120,
    { tags: ['chicago'], origin: 'Uptown, after my set' }),
  mk('r3', 'video', 'Brushes on a snare', 'my practice clip', a('waves', [ART.mustard, ART.cream, ART.ink], 42), 760, 140,
    { tags: ['drums'], origin: 'recorded on my phone' }),
  mk('r4', 'photo', 'Rehearsal room blinds', 'my photo', a('stripes', [ART.cream, ART.ink, ART.cream, ART.ink, ART.cream], 43), 180, 440,
    { tags: ['rehearsal'], origin: 'the basement on Halsted' }),
  mk('r5', 'text', 'The note you don’t play.', 'a teacher', undefined, 480, 420, { tint: 'lime', origin: 'Thursday lessons, Hyde Park' }),
  mk('r6', 'photo', 'Lake Michigan in fog', 'my photo', a('gradient', [ART.sky, ART.cream, '#8F8A83'], 48), 790, 440,
    { tags: ['lake'], origin: 'January, no horizon at all' }),
  mk('r7', 'object', 'Cracked ride cymbal', 'object', a('token', [ART.mustard, '#A7802F', ART.cream], 46), 1080, 160,
    { tags: ['drums'], origin: 'bought used from a retired drummer' }),
  mk('r8', 'music', 'Spiegel im Spiegel', 'Arvo Pärt', a('dots', [ART.cream, ART.navy, ART.sky], 45), 1080, 440,
    { tags: ['minimal'], origin: 'a friend’s memorial' }),
];
const marcusConn: Connection[] = [
  c('rc1', 'r4', 'r3', 'light coming through the blinds while I practice', 'sky'),
  c('rc2', 'r2', 'r1', 'a club I only notice after midnight', 'lime'),
  c('rc3', 'r5', 'r3', 'a drum part with nothing filled in'),
  c('rc4', 'r6', 'r8', 'the hour the whole lake goes quiet', 'sky'),
  c('rc5', 'r7', 'r2', 'someone played it for years before me', 'pink'),
];
const marcusThreads: Thread[] = [
  { id: 'rt1', owner: 'marcus', title: 'The note you don’t play', mediaIds: ['r5', 'r3', 'r4'], publishedAt: '2026-05-01', isPublic: true },
];

/* ---------------- IV · Ocean · Ama ---------------- */
const amaMedia: Media[] = [
  mk('a1', 'photo', 'Jamestown harbor, 5am', 'my photo', a('gradient', [ART.sky, ART.cream, ART.ink], 51), 460, 120,
    { origin: 'the boats come in before the sun' }),
  mk('a2', 'music', 'Rain on a tin roof', 'field recording', a('waves', [ART.sky, ART.cream, ART.ink], 52), 160, 140,
    { origin: 'my aunt’s house in Kumasi' }),
  mk('a3', 'music', 'Highlife on cassette', 'unknown band', a('dots', [ART.mustard, ART.red, ART.cream], 53), 1080, 160,
    { origin: 'a trotro driver’s glovebox' }),
  mk('a4', 'photo', 'Contact mic on a fishing boat', 'my photo', a('stencil', [ART.cream, ART.ink, ART.mustard], 54), 760, 140,
    { origin: 'taped under the hull' }),
  mk('a5', 'text', 'Every place hums in its own key.', 'my notebook', undefined, 180, 440, { tint: 'peach', origin: 'written on the harbor wall' }),
  mk('a6', 'object', 'Field recorder, taped up', 'tool', a('token', [ART.ink, '#5E5A55', ART.cream], 56), 790, 440,
    { origin: 'second-hand, still works' }),
  mk('a7', 'link', 'Sound map of Accra', 'my project', a('grid', [ART.cream, ART.forest, ART.mustard, ART.red, ART.cream], 57), 1080, 440,
    { origin: 'three years of mornings' }),
  mk('a8', 'video', 'Trotro station at rush hour', 'clip', a('neon', [ART.mustard, ART.forest, ART.red], 55), 480, 420,
    { origin: 'Circle station, 6pm' }),
];
const amaConn: Connection[] = [
  c('ac1', 'a1', 'a2', 'the same morning, ten minutes later', 'sky'),
  c('ac2', 'a1', 'a4', 'where I hid the microphone'),
  c('ac3', 'a5', 'a1', 'this is where I wrote it', 'pink'),
  c('ac4', 'a1', 'a8', 'the quietest and loudest places I know', 'lime'),
  c('ac5', 'a3', 'a8', 'what the drivers play'),
  c('ac6', 'a6', 'a4', 'the recorder I used', 'sky'),
  c('ac7', 'a7', 'a2', 'pinned at my aunt’s street', 'pink'),
];
const amaThreads: Thread[] = [
  { id: 'at1', owner: 'ama', title: 'Five in the morning', mediaIds: ['a2', 'a1', 'a4'], publishedAt: '2026-08-22', isPublic: true },
];

export const MATCHES: MatchProfile[] = [
  {
    personId: 'lena', quadrant: 1,
    intro: "You both saved Fantômas and Forbidden Planet, and you tie them for the same reason: the type shouts.",
    overlap: ['l1', 'l2', 'l3'], split: ['l4', 'l6'],
    experience: { title: 'a vintage film-poster fair', where: 'Lightbox Film Center, Philly', when: 'Sun 11am' },
    board: { media: lenaMedia, connections: lenaConn }, threads: lenaThreads,
    bio: 'Posters, signage and the occasional Kraftwerk record.',
  },
  {
    personId: 'kenji', quadrant: 2,
    intro: "You both saved the same pink set, and tied it to different things.",
    overlap: ['k12', 'k14'], split: ['k13', 'k15'],
    experience: { title: 'an early walk through the flower market', where: 'Reading Terminal, Philly', when: 'Sat 8am' },
    board: { media: kenjiMedia, connections: kenjiConn }, threads: kenjiThreads,
    bio: 'I notice colors on my commute.',
  },
  {
    personId: 'marcus', quadrant: 3,
    intro: "He gets to ‘after midnight’ through jazz. You get there through quiet rooms.",
    overlap: [], split: ['r1', 'r3', 'r6'],
    experience: { title: 'a late jazz set', where: 'Chris’ Jazz Café, Philly', when: 'Thu 10pm' },
    board: { media: marcusMedia, connections: marcusConn }, threads: marcusThreads,
    bio: 'Drummer. I collect silences.',
  },
  {
    personId: 'ama', quadrant: 4,
    intro: "Your maps don't overlap yet. Trade one thread and see what happens.",
    overlap: [], split: ['a1', 'a2', 'a8'],
    experience: { title: 'a sound walk along the river', where: 'Schuylkill River Trail, Philly', when: 'Sun 7am' },
    board: { media: amaMedia, connections: amaConn }, threads: amaThreads,
    bio: 'I record what places sound like.',
  },
];

export const matchFor = (personId?: string) => MATCHES.find((m) => m.personId === personId);
export const ALL_MATCH_THREADS = MATCHES.flatMap((m) => m.threads);

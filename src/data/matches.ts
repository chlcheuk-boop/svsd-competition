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
const kenjiMedia: Media[] = [
  mk('k1', 'photo', "Expo '70 poster", 'Osaka, 1970', a('sun', [ART.red, ART.cream, ART.ink], 3), 140, 140,
    { ref: 'm1', origin: "my grandfather's, rolled in a tube", tags: ['poster', '70s'] }),
  mk('k2', 'photo', 'Bauhaus exhibition, 1923', 'reprint', a('bauhaus', [ART.red, ART.navy, ART.mustard, ART.cream], 7), 430, 90,
    { ref: 'm2', shape: 'punched', origin: 'art school library photocopy' }),
  mk('k3', 'photo', 'Subway diagram, 1972', 'NYC', a('grid', [ART.red, ART.forest, ART.navy, ART.mustard, ART.cream], 11), 720, 140,
    { ref: 'm14', shape: 'punched', origin: 'a postcard from a friend in Queens' }),
  mk('k4', 'photo', 'Shinjuku handbill, 1969', 'anonymous', a('stencil', [ART.cream, ART.red, ART.ink], 21), 160, 450,
    { origin: 'Kyoto flea market, folded in eighths', tags: ['protest', 'print'] }),
  mk('k5', 'photo', 'Rail strike timetable', '1974', a('grid', [ART.cream, ART.ink, ART.ink, ART.red, ART.cream], 22), 460, 420,
    { shape: 'punched', origin: 'my uncle kept every strike notice' }),
  mk('k6', 'video', 'Minamata', 'photo-essay, 1975', a('gradient', [ART.ink, '#5E5A55', ART.cream], 23), 760, 440,
    { origin: 'seminar on photography and blame' }),
  mk('k7', 'music', 'Kazemachi Roman', 'Happy End', a('waves', [ART.forest, ART.cream, ART.mustard], 24), 1060, 160,
    { origin: 'a record shop that only plays one album a day' }),
  mk('k8', 'text', 'A poster is an argument you can glue to a wall.', 'my notebook', undefined, 1060, 440,
    { tint: 'sky', origin: 'written during a deadline at 4am' }),
  mk('k9', 'object', 'Brush-pen, worn flat', 'tool', a('stencil', [ART.cream, ART.ink, ART.ink], 25), 420, 720,
    { origin: 'my first year at Kyoto Seika' }),
  mk('k10', 'photo', 'Chimneys at Amagasaki', 'my photo', a('stripes', ['#8F8A83', ART.ink, ART.cream, '#B4AEA6', ART.red], 26), 740, 720,
    { origin: 'train window, 6:40am' }),
  mk('k11', 'link', 'Archive of student newspapers', 'zine-archive.jp', a('dots', [ART.cream, ART.red, ART.ink], 27), 1060, 730,
    { url: 'https://zine-archive.jp', origin: 'a librarian slipped me the URL' }),
];
const kenjiConn: Connection[] = [
  c('kc1', 'k1', 'k4', 'the Expo sold the future; the handbill asked who paid for it', 'tangerine'),
  c('kc2', 'k4', 'k5', 'same red, same week, different printers', 'pink'),
  c('kc3', 'k2', 'k3', 'the grid was a promise of order for everyone', 'sky'),
  c('kc4', 'k5', 'k6', 'both are records nobody wanted kept'),
  c('kc5', 'k8', 'k4', 'this is what I mean', 'pink'),
  c('kc6', 'k6', 'k10', 'the same sky, twenty years apart', 'sky'),
  c('kc7', 'k7', 'k8', 'a quiet record made during a loud year', 'lime'),
  c('kc8', 'k9', 'k4', 'someone held a brush like mine to write this'),
  c('kc9', 'k11', 'k5', 'where I go when I want the other side of a story', 'sky'),
];
const kenjiThreads: Thread[] = [
  { id: 'kt1', owner: 'kenji', title: 'Posters were arguments', intro: 'Before they were nostalgia, they were demands.',
    mediaIds: ['k1', 'k4', 'k5', 'k6'], publishedAt: '2026-08-01', isPublic: true },
  { id: 'kt2', owner: 'kenji', title: 'Quiet records, loud years', mediaIds: ['k7', 'k8', 'k4'], publishedAt: '2026-09-12', isPublic: true },
];

/* ---------------- I · Rock · Lena ---------------- */
const lenaMedia: Media[] = [
  mk('l1', 'photo', 'Bauhaus exhibition, 1923', 'reprint', a('bauhaus', [ART.red, ART.navy, ART.mustard, ART.cream], 7), 160, 120,
    { ref: 'm2', shape: 'punched', origin: 'Dessau gift shop, age 12', tags: ['grid', 'color', 'architecture'] }),
  mk('l2', 'photo', 'Subway diagram, 1972', 'NYC', a('grid', [ART.red, ART.forest, ART.navy, ART.mustard, ART.cream], 11), 460, 120,
    { ref: 'm14', shape: 'punched', origin: 'my first design-history slide', tags: ['grid', 'cities', 'transit'] }),
  mk('l3', 'photo', 'Parkhaus sign, Kreuzberg', 'my photo', a('stencil', ['#9B9690', ART.mustard, ART.ink], 31), 760, 140,
    { origin: 'bike ride home in January', tags: ['brutalist', 'signage'] }),
  mk('l4', 'text', 'Less, but better.', 'Dieter Rams', undefined, 200, 440, { ref: 'm5', tint: 'lime', origin: 'Braun museum wall' }),
  mk('l5', 'photo', 'DIN 1451 specimen', 'type', a('grid', [ART.cream, ART.ink, ART.ink, ART.ink, ART.cream], 32), 480, 420,
    { shape: 'punched', origin: 'TypeCon tote bag', tags: ['type', 'grid', 'pattern'] }),
  mk('l6', 'photo', 'Plattenbau facade', 'Marzahn', a('grid', ['#B4AEA6', '#8F8A83', ART.sky, '#B4AEA6', ART.cream], 33), 790, 430,
    { origin: 'walked there on purpose', tags: ['architecture', 'grid', 'light'] }),
  mk('l7', 'video', 'Playtime', 'Jacques Tati', a('grid', [ART.sky, '#8F8A83', ART.cream, ART.sky, ART.cream], 34), 1080, 160,
    { origin: 'a cinema with twelve seats' }),
  mk('l8', 'music', 'Autobahn', 'Kraftwerk', a('stripes', [ART.ink, ART.cream, ART.sky, ART.cream, ART.ink], 35), 1080, 440,
    { origin: 'my mom’s cassette' }),
  mk('l9', 'object', 'U-Bahn ticket stub', 'BVG', a('token', [ART.mustard, '#A7802F', ART.cream], 36), 480, 720,
    { origin: 'coat pocket, 2019' }),
  mk('l10', 'link', 'Otl Aicher pictograms', 'archive', a('dots', [ART.cream, ART.navy, ART.ink], 37), 800, 730,
    { origin: 'professor’s reading list' }),
];
const lenaConn: Connection[] = [
  c('lc1', 'l1', 'l2', 'the grid walking out of the museum', 'sky'),
  c('lc2', 'l2', 'l3', 'wayfinding stripped to the wire', 'sky'),
  c('lc3', 'l4', 'l5', 'a typeface that agrees with Rams'),
  c('lc4', 'l3', 'l6', 'concrete that tells you where to go'),
  c('lc5', 'l7', 'l6', 'Tati would have loved Marzahn', 'lime'),
  c('lc6', 'l8', 'l7', 'both are about motorways and loneliness', 'pink'),
  c('lc7', 'l10', 'l5', 'systems you can read at 60 km/h'),
  c('lc8', 'l9', 'l2', 'the map in my pocket'),
];
const lenaThreads: Thread[] = [
  { id: 'lt1', owner: 'lena', title: 'Signs that forgot to be pretty', mediaIds: ['l1', 'l2', 'l3', 'l6'], publishedAt: '2026-07-20', isPublic: true },
];

/* ---------------- III · Shell · Marcus ---------------- */
const marcusMedia: Media[] = [
  mk('r1', 'music', 'Kind of Blue', 'Miles Davis', a('waves', [ART.navy, ART.sky, ART.cream], 4), 160, 140,
    { ref: 'm3', origin: 'the first record I owned' }),
  mk('r2', 'music', 'A Love Supreme', 'John Coltrane', a('gradient', [ART.ink, ART.mustard, ART.oxblood], 41), 460, 120,
    { origin: 'taped from the radio, 1998' }),
  mk('r3', 'text', 'The note you don’t play.', 'a teacher', undefined, 760, 140, { tint: 'lime', origin: 'Thursday lessons, Hyde Park' }),
  mk('r4', 'video', 'Brushes on a snare', 'my practice clip', a('waves', [ART.mustard, ART.cream, ART.ink], 42), 180, 440,
    { origin: 'recorded on my phone at 1am' }),
  mk('r5', 'photo', 'Robie House', 'Frank Lloyd Wright', a('stripes', [ART.oxblood, ART.cream, ART.mustard, ART.oxblood, ART.cream], 43), 480, 420,
    { origin: 'walked past it every day for school' }),
  mk('r6', 'photo', 'Train platform at 3am', 'my photo', a('neon', [ART.navy, ART.forest, ART.mustard], 44), 790, 440,
    { origin: 'Garfield Red Line stop' }),
  mk('r7', 'music', 'Spiegel im Spiegel', 'Arvo Pärt', a('dots', [ART.cream, ART.navy, ART.sky], 45), 1080, 160,
    { origin: 'a friend’s memorial' }),
  mk('r8', 'object', 'Cracked ride cymbal', 'object', a('token', [ART.mustard, '#A7802F', ART.cream], 46), 1080, 440,
    { origin: 'my first gig, lost a bet' }),
  mk('r9', 'link', 'Rehearsal room acoustics', 'notes', a('grid', [ART.cream, ART.ink, ART.sky, ART.cream, ART.ink], 47), 480, 720,
    { origin: 'forum post from 2008' }),
  mk('r10', 'photo', 'Lake Michigan in fog', 'my photo', a('gradient', [ART.sky, ART.cream, '#8F8A83'], 48), 790, 720,
    { origin: 'January, no horizon at all' }),
];
const marcusConn: Connection[] = [
  c('rc1', 'r1', 'r3', 'Miles proves the teacher right', 'sky'),
  c('rc2', 'r3', 'r4', 'what I practice every night'),
  c('rc3', 'r1', 'r7', 'quiet tension, played by different instruments', 'sky'),
  c('rc4', 'r5', 'r6', 'long horizontal lines that make you wait', 'lime'),
  c('rc5', 'r6', 'r10', 'the city holding its breath', 'sky'),
  c('rc6', 'r2', 'r8', 'both are about devotion and damage', 'pink'),
  c('rc7', 'r9', 'r4', 'the room is half the instrument'),
  c('rc8', 'r7', 'r10', 'empty on purpose', 'sky'),
];
const marcusThreads: Thread[] = [
  { id: 'rt1', owner: 'marcus', title: 'The note you don’t play', mediaIds: ['r1', 'r3', 'r4', 'r7'], publishedAt: '2026-05-01', isPublic: true },
];

/* ---------------- IV · Ocean · Ama ---------------- */
const amaMedia: Media[] = [
  mk('a1', 'photo', 'Kente strip, Bonwire', 'woven', a('stripes', [ART.mustard, ART.forest, ART.red, ART.ink, ART.mustard], 51), 160, 140,
    { origin: 'my grandmother’s cloth', tags: ['textile'] }),
  mk('a2', 'photo', 'Studio portrait, 1960s', 'Accra', a('gradient', ['#8F8A83', ART.cream, ART.ink], 52), 460, 120,
    { origin: 'family album, back page' }),
  mk('a3', 'music', 'Highlife on cassette', 'unknown band', a('dots', [ART.mustard, ART.red, ART.cream], 53), 760, 140,
    { origin: 'a trotro driver’s glovebox' }),
  mk('a4', 'photo', 'Makola market, noon', 'my photo', a('bauhaus', [ART.pink, ART.mustard, ART.sky, ART.cream], 54), 180, 440,
    { origin: 'shooting for a brand that never paid' }),
  mk('a5', 'text', 'Wear the archive.', 'my mood board', undefined, 480, 420, { tint: 'peach', origin: 'scribbled on a test print' }),
  mk('a6', 'video', 'Runway at Lagos fashion week', 'clip', a('neon', [ART.pink, ART.forest, ART.mustard], 55), 790, 440,
    { origin: 'shot on a borrowed camera' }),
  mk('a7', 'object', 'Wax-print offcut', 'fabric', a('waves', [ART.sky, ART.tangerine, ART.cream], 56), 1080, 160,
    { origin: 'tailor’s floor, Osu' }),
  mk('a8', 'photo', 'Contact sheet #14', 'my film', a('grid', [ART.ink, '#8F8A83', ART.cream, ART.ink, '#8F8A83'], 57), 1080, 440,
    { origin: 'darkroom at the university' }),
  mk('a9', 'link', 'Seydou Keïta archive', 'archive', a('gradient', [ART.ink, ART.cream, '#8F8A83'], 58), 480, 720,
    { origin: 'a photographer I assisted' }),
  mk('a10', 'object', 'Hand-painted barber sign', 'sign', a('sun', [ART.sky, ART.red, ART.cream], 59), 790, 720,
    { origin: 'bought it off the wall, Jamestown' }),
];
const amaConn: Connection[] = [
  c('ac1', 'a1', 'a7', 'the cloth remembers the pattern even when I don’t', 'pink'),
  c('ac2', 'a2', 'a8', 'my contact sheets are talking to that studio', 'sky'),
  c('ac3', 'a4', 'a6', 'the market is the real runway', 'pink'),
  c('ac4', 'a5', 'a1', 'this is the brief'),
  c('ac5', 'a9', 'a2', 'posing as a kind of authorship', 'sky'),
  c('ac6', 'a3', 'a4', 'what the market sounds like', 'lime'),
  c('ac7', 'a10', 'a4', 'type that was never designed, only painted'),
];
const amaThreads: Thread[] = [
  { id: 'at1', owner: 'ama', title: 'Wear the archive', mediaIds: ['a5', 'a1', 'a7', 'a2'], publishedAt: '2026-08-22', isPublic: true },
];

export const MATCHES: MatchProfile[] = [
  {
    personId: 'lena', quadrant: 1,
    intro: "You've both been walking from Bauhaus posters toward brutalist signage.",
    overlap: ['l1', 'l2', 'l4'], split: ['l7', 'l8'],
    experience: { title: 'a ghost-sign walk through Center City', where: 'Philadelphia', when: 'Sun 10am' },
    board: { media: lenaMedia, connections: lenaConn }, threads: lenaThreads,
    bio: 'Systems, signage and the occasional Kraftwerk record.',
  },
  {
    personId: 'kenji', quadrant: 2,
    intro: "You both started at the Expo '70 posters. You went toward nostalgia; he went toward protest.",
    overlap: ['k1', 'k2', 'k3'], split: ['k4', 'k5', 'k6'],
    experience: { title: 'a risograph protest-poster workshop', where: 'Fishtown, Philly', when: 'Sat 2pm' },
    board: { media: kenjiMedia, connections: kenjiConn }, threads: kenjiThreads,
    bio: 'I draw the posters people should have made.',
  },
  {
    personId: 'marcus', quadrant: 3,
    intro: "He gets to 'quiet tension' through jazz. You get there through architecture.",
    overlap: ['r1'], split: ['r4', 'r5', 'r8'],
    experience: { title: 'a late set in a concrete room', where: 'Old City, Philly', when: 'Thu 10pm' },
    board: { media: marcusMedia, connections: marcusConn }, threads: marcusThreads,
    bio: 'Drummer. I collect silences.',
  },
  {
    personId: 'ama', quadrant: 4,
    intro: "Your maps don't overlap yet. Trade one thread and see what happens.",
    overlap: [], split: ['a1', 'a4', 'a10'],
    experience: { title: 'a textile weaving demo', where: 'Penn Museum', when: 'Sun 1pm' },
    board: { media: amaMedia, connections: amaConn }, threads: amaThreads,
    bio: 'Portraits, cloth, and what people wear to be seen.',
  },
];

export const matchFor = (personId?: string) => MATCHES.find((m) => m.personId === personId);
export const ALL_MATCH_THREADS = MATCHES.flatMap((m) => m.threads);

import type { Connection, Media, Thread } from '../types';

// A shared palette for generated placeholder art.
export const ART = {
  navy: '#1F3A5F',
  mustard: '#D9A441',
  oxblood: '#8A2E2E',
  forest: '#2F6B4F',
  cream: '#EFE6D6',
  ink: '#2E2C2A',
  tangerine: '#E05E31',
  peach: '#F6D3BD',
  lime: '#C9D671',
  sky: '#B5D6F3',
  pink: '#EE7A93',
  teal: '#2C7A7B',
  red: '#C8372D',
  green: '#3E8E5A',
  violet: '#5B4B8A',
};

export const MAYA_MEDIA: Media[] = [
  {
    id: 'm1', type: 'image', title: "Expo '70 poster", subtitle: 'Osaka, 1970',
    origin: 'found in a Tokyo bookstore, 2025', tags: ['poster', '70s', 'japan'],
    x: 120, y: 120, rot: -3, shape: 'polaroid', tint: 'white',
    art: { kind: 'sun', colors: [ART.red, ART.cream, ART.ink], seed: 3 }, addedAt: '2025-02-11',
  },
  {
    id: 'm2', type: 'image', title: 'Bauhaus exhibition, 1923', subtitle: 'reprint',
    origin: "my aunt's studio wall, every summer", tags: ['poster', 'bauhaus', 'grid'],
    x: 400, y: 70, rot: 2.5, shape: 'punched', tint: 'white',
    art: { kind: 'bauhaus', colors: [ART.red, ART.navy, ART.mustard, ART.cream], seed: 7 }, addedAt: '2025-02-11',
  },
  {
    id: 'm14', type: 'image', title: 'Subway diagram, 1972', subtitle: 'thrift print',
    origin: 'thrift print, $4, South Street', tags: ['wayfinding', 'map', '70s'],
    x: 690, y: 110, rot: -1.5, shape: 'punched', tint: 'white',
    art: { kind: 'grid', colors: [ART.red, ART.forest, ART.navy, ART.mustard, ART.cream], seed: 11 }, addedAt: '2025-03-02',
  },
  {
    id: 'm7', type: 'image', title: 'Garage signage, 13th St', subtitle: 'my photo',
    origin: 'walking to studio at 7am', tags: ['brutalist', 'signage', 'philly'],
    x: 640, y: 380, rot: 3.5, shape: 'polaroid', tint: 'white',
    art: { kind: 'stencil', colors: ['#9B9690', ART.mustard, ART.ink], seed: 2 }, addedAt: '2025-04-19',
  },
  {
    id: 'm5', type: 'text', title: 'Less, but better.', subtitle: 'Dieter Rams',
    quote: 'Less, but better.', origin: 'written on the studio whiteboard',
    tags: ['principle'], x: 380, y: 330, rot: -2, shape: 'sticky', tint: 'lime', addedAt: '2025-03-14',
  },
  {
    id: 'm4', type: 'video', title: 'In the Mood for Love', subtitle: 'the corridor scene',
    origin: 'film club, freshman fall', tags: ['film', 'color', 'longing'],
    x: 1010, y: 160, rot: 2, shape: 'folded', tint: 'white',
    art: { kind: 'neon', colors: [ART.oxblood, ART.forest, ART.mustard], seed: 5 }, addedAt: '2025-02-20',
  },
  {
    id: 'm12', type: 'image', title: 'Chungking neon study', subtitle: 'gouache, my sketchbook',
    origin: 'my sketchbook, after the WKW marathon', tags: ['color', 'own work'],
    x: 1300, y: 90, rot: -3.5, shape: 'polaroid', tint: 'white',
    art: { kind: 'gradient', colors: [ART.pink, ART.teal, ART.mustard], seed: 9 }, addedAt: '2025-05-03',
  },
  {
    id: 'm3', type: 'music', title: 'Kind of Blue', subtitle: 'Miles Davis',
    origin: "dad's car, long drives to Harrisburg", tags: ['jazz', 'quiet'],
    x: 1080, y: 420, rot: -2.5, shape: 'punched', tint: 'white',
    art: { kind: 'waves', colors: [ART.navy, ART.sky, ART.cream], seed: 4 }, addedAt: '2025-02-25',
  },
  {
    id: 'm9', type: 'music', title: 'Merry Christmas Mr. Lawrence', subtitle: 'Ryuichi Sakamoto',
    origin: 'headphones in the print lab', tags: ['piano', 'quiet'],
    x: 1360, y: 420, rot: 1.5, shape: 'punched', tint: 'white',
    art: { kind: 'dots', colors: [ART.cream, ART.ink, ART.red], seed: 13 }, addedAt: '2025-06-08',
  },
  {
    id: 'm8', type: 'link', title: 'Riso ink color chart', subtitle: 'riso-library.org',
    url: 'https://riso-library.org/colors', origin: 'sent by Priya at 2am',
    tags: ['risograph', 'print'], x: 140, y: 450, rot: 2, shape: 'folded', tint: 'peach',
    art: { kind: 'stripes', colors: [ART.pink, ART.sky, ART.mustard, ART.forest, ART.tangerine], seed: 6 }, addedAt: '2025-09-30',
  },
  {
    id: 'm6', type: 'object', title: 'SEPTA token', subtitle: 'brass, 2000s',
    origin: 'pocket of a thrifted coat, 2024', tags: ['philly', 'object', 'transit'],
    x: 420, y: 600, rot: 4, shape: 'sticky', tint: 'sky',
    art: { kind: 'token', colors: [ART.mustard, '#A7802F', ART.cream], seed: 1 }, addedAt: '2025-04-02',
  },
  {
    id: 'm10', type: 'object', title: "Stencil letter 'R'", subtitle: 'zinc, hand-cut',
    origin: 'flea market, Headhouse Square', tags: ['type', 'object'],
    x: 700, y: 690, rot: -3, shape: 'polaroid', tint: 'white',
    art: { kind: 'stencil', colors: [ART.cream, ART.ink, ART.tangerine], seed: 8 }, addedAt: '2025-10-12',
  },
  {
    id: 'm11', type: 'text', title: 'The street finds its own uses for things.', subtitle: 'William Gibson',
    quote: 'The street finds its own uses for things.', origin: 'a sticker on a lamppost on Baltimore Ave',
    tags: ['street', 'quote'], x: 960, y: 700, rot: 2.5, shape: 'sticky', tint: 'peach', addedAt: '2026-01-15',
  },
  {
    id: 'm13', type: 'video', title: 'Koyaanisqatsi', subtitle: 'opening sequence',
    origin: 'a projection at the Barnes', tags: ['film', 'cities', 'time'],
    x: 1240, y: 700, rot: -1.5, shape: 'folded', tint: 'white',
    art: { kind: 'arch', colors: [ART.tangerine, ART.navy, ART.mustard], seed: 12 }, addedAt: '2026-03-08',
  },
  // added because of past crossings
  {
    id: 'm15', type: 'object', title: 'Lotería card, El Sol', subtitle: 'printed card',
    origin: 'Inés mailed it after our Crossing', tags: ['print', 'mexico', 'object'],
    x: 120, y: 760, rot: -4, shape: 'punched', tint: 'white',
    art: { kind: 'sun', colors: [ART.mustard, ART.pink, ART.ink], seed: 15 }, addedAt: '2026-05-21', via: 'ines',
  },
  {
    id: 'm16', type: 'image', title: 'Kunsthal ramp', subtitle: 'Rotterdam',
    origin: "Saskia's photo from the ramp, 2026", tags: ['architecture', 'brutalist'],
    x: 1560, y: 260, rot: 3, shape: 'polaroid', tint: 'white',
    art: { kind: 'arch', colors: [ART.cream, '#8F8A83', ART.lime], seed: 16 }, addedAt: '2026-07-02', via: 'saskia',
  },
];

export const MAYA_CONNECTIONS: Connection[] = [
  { id: 'c1', from: 'm1', to: 'm2', color: 'tangerine', addedAt: '2025-02-12',
    why: 'both shout in two colors and a circle, fifty years apart' },
  { id: 'c2', from: 'm2', to: 'm14', color: 'tangerine', addedAt: '2025-03-03',
    why: 'the grid moved off the wall and onto the subway' },
  { id: 'c3', from: 'm14', to: 'm7', color: 'sky', addedAt: '2025-04-20',
    why: 'I found this one because of that one: wayfinding that forgot to be pretty' },
  { id: 'c4', from: 'm5', to: 'm7', color: 'lime', addedAt: '2025-04-21',
    why: 'both feel like they were argued down to the minimum' },
  { id: 'c5', from: 'm4', to: 'm12', color: 'pink', addedAt: '2025-05-04',
    why: 'I painted the corridor until it was only the color left' },
  { id: 'c6', from: 'm4', to: 'm3', color: 'tangerine', addedAt: '2025-06-01',
    why: 'quiet tension: everyone waiting for something that never quite happens' },
  { id: 'c7', from: 'm3', to: 'm9', color: 'sky', addedAt: '2025-06-09',
    why: 'the space between notes is doing all the work' },
  { id: 'c8', from: 'm6', to: 'm7', color: 'tangerine', addedAt: '2025-04-22' },
  { id: 'c9', from: 'm8', to: 'm1', color: 'pink', addedAt: '2025-10-01',
    why: 'riso pink is the 70s red, just younger' },
  { id: 'c10', from: 'm10', to: 'm11', color: 'tangerine', addedAt: '2026-01-16',
    why: "someone's tool, someone else's letterform" },
  { id: 'c11', from: 'm13', to: 'm7', color: 'sky', addedAt: '2026-03-09',
    why: 'a city sped up until the concrete starts breathing' },
  { id: 'c12', from: 'm15', to: 'm8', color: 'pink', addedAt: '2026-05-22', via: 'ines',
    why: 'Inés: misregistration is a dialect, not a mistake' },
  { id: 'c13', from: 'm16', to: 'm12', color: 'lime', addedAt: '2026-07-03', via: 'saskia',
    why: 'Saskia: a ramp is a corridor that decided to climb' },
];

export const MAYA_THREADS: Thread[] = [
  {
    id: 't1', owner: 'maya', title: 'Two colors and a grid',
    intro: 'How a poster on my aunt’s wall turned into a walk to studio.',
    mediaIds: ['m1', 'm2', 'm14', 'm7'], publishedAt: '2026-02-02', isPublic: true,
  },
  {
    id: 't2', owner: 'maya', title: 'Quiet tension',
    intro: 'Everything I love is waiting for something.',
    mediaIds: ['m12', 'm4', 'm3', 'm9'], publishedAt: '2026-06-14', isPublic: true,
  },
];

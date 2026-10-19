import type { Media } from '../types';

/**
 * Real photos for the photo / image category. Files live in /public/photos (resized, metadata removed).
 * No "why" on purpose: the reason each one matters is the owner's to write.
 */
const P = (id: string, file: string, title: string, origin: string, tags: string[]): Media => ({
  id,
  type: 'photo',
  title,
  subtitle: 'my photo',
  origin,
  tags,
  imageData: `/photos/${file}.jpg`,
  x: 0,
  y: 0,
  rot: 0,
  shape: 'polaroid',
  tint: 'white',
  addedAt: '2026-10-19',
});

export const MY_PHOTOS: Media[] = [
  P('p1', 'prom', 'Prom with Yuechee', 'prom night', ['friends', 'color', 'light']),
  P('p2', 'bio-farm', 'Penn bio farm', 'Philadelphia', ['nature', 'light', 'philly']),
  P('p3', 'chopsticks', 'Chopsticks, arranged', 'on the dining table', ['color', 'grid', 'objects']),
  P('p4', 'batrez', 'Mr. Batrez on the whiteboard', 'AP Stats', ['type', 'drawing', 'school']),
  P('p5', 'late-kitchen', 'Kitchen, late at night', 'home', ['light', 'quiet', 'home']),
  P('p6', 'japan-thrift', 'Thrift store in Japan', 'Japan', ['japan', 'thrift', 'color']),
  P('p7', 'china-restaurant', 'Over-the-top restaurant in China', 'China', ['travel', 'water', 'color']),
  P('p8', 'plane-window', 'Purple light, airplane window', 'somewhere over the ocean', ['light', 'travel', 'color']),
  P('p9', 'bulgaria-gallery', 'Archaeological gallery, Bulgaria', 'Bulgaria', ['architecture', 'travel', 'color']),
  P('p10', 'bulgaria-hallway', 'Museum hallway, Bulgaria', 'Bulgaria', ['architecture', 'light', 'travel']),
  P('p11', 'sand-drawing', 'Sand drawing, San Sebastián', 'San Sebastián', ['drawing', 'travel', 'time']),
  P('p12', 'galveston', 'Galveston beach', 'Galveston, Texas', ['travel', 'ocean', 'street']),
  P('p13', 'rooftop-cinema', 'Rooftop cinema, Houston', 'Houston', ['film', 'cities', 'light']),
  P('p14', 'san-sebastian-window', 'View from the hotel room, Spain', 'San Sebastián', ['travel', 'ocean', 'light']),
  P('p15', 'stormy-table', 'Restaurant in Biarritz', 'Biarritz', ['travel', 'ocean', 'quiet']),
  P('p16', 'wing-sunset', 'Airplane window view', 'above the clouds', ['light', 'travel', 'color']),
  P('p17', 'florida-selfie', 'Selfie in Florida', 'Florida', ['friends', 'color', 'pattern']),
  P('p18', 'miami-shadow', 'Shadows of the Miami apartments', 'Miami', ['architecture', 'ocean', 'light']),
  P('p19', 'carpaccio', 'Beef carpaccio', 'dinner out', ['food', 'color', 'light']),
  P('p20', 'soap-shop', 'Organic soap shop', 'San Diego', ['shops', 'pattern', 'objects']),
  P('p21', 'riverwalk', 'San Antonio River Walk', 'San Antonio', ['nature', 'water', 'cities']),
  P('p22', 'guest-room', 'Guest room, late at night', 'home', ['light', 'quiet', 'home']),
  P('p23', 'watermelon', 'The juiciest watermelon', 'kitchen counter', ['food', 'color', 'home']),
  P('p24', 'galleria', 'Upper level of the Galleria', 'Houston', ['architecture', 'grid', 'light']),
  P('p25', 'raw-beef', 'Raw beef night', 'dinner out', ['food', 'color']),
  P('p26', 'ikebana', 'Ikebana at the ICA', 'ICA, Philadelphia', ['flowers', 'color', 'philly']),
  P('p27', 'glass-installation', 'Glass installation', 'museum stairwell', ['light', 'objects', 'quiet']),
  P('p28', 'philly-museum', 'Museum in Philly', 'Philadelphia', ['painting', 'color', 'philly']),
  P('p29', 'anthro-ceiling', 'Anthropologie ceiling, Rittenhouse', 'Rittenhouse, Philadelphia', ['light', 'pattern', 'philly']),
  P('p30', 'biopond', 'More of the biopond', 'Penn, Philadelphia', ['nature', 'water', 'philly']),
  P('p31', 'window-shadows', 'Window shadows', 'my room', ['light', 'pattern', 'quiet']),
  P('p32', 'photo-booth', 'First real photo booth shoot', 'my room', ['friends', 'color', 'time']),
];

/** Things you own or want, pictured. Files live in /public/objects. */
const O = (id: string, file: string, title: string, subtitle: string, tags: string[]): Media => ({
  id, type: 'object', title, subtitle, tags, imageData: `/objects/${file}.jpg`,
  x: 0, y: 0, rot: 0, shape: 'polaroid', tint: 'white', addedAt: '2026-10-19',
});

export const MY_OBJECTS: Media[] = [
  O('o1', 'cavalli-dress', 'Roberto Cavalli dress', 'Roberto Cavalli', ['fashion', 'color', 'pattern']),
  O('o2', 'bloombowtique-top', 'Striped top', 'Bloombowtique', ['fashion', 'color', 'pattern']),
  O('o3', 'ebay-lace-top', 'Vintage lace-up top', 'vintage, eBay', ['fashion', 'vintage', 'thrift']),
  O('o4', 'bebe-top', 'Beaded top', 'vintage bebe', ['fashion', 'vintage', 'pink']),
  O('o5', 'hermes-bolide', 'Seafoam croc Bolide', 'Hermès', ['fashion', 'objects', 'color']),
  O('o6', 'market-shoes', 'Lucky Girl Market shoes', 'Lucky Girl Market', ['fashion', 'thrift', 'objects']),
  O('o7', 'fruitpunch-tank', 'Tank top', 'Fruitpunch', ['fashion', 'color']),
  O('o8', 'viet-top', 'Purple ribbon top', 'Vietnamese brand', ['fashion', 'color']),
  O('o9', 'viet-two-piece', 'Two-piece set', 'Vietnamese brand', ['fashion', 'pink', 'color']),
  O('o10', 'huelley-dress', 'Huelley Huelley dress', 'Huelley Huelley', ['fashion', 'pink']),
  O('o11', 'coach-bag', 'Vintage Coach bag', 'vintage Coach', ['fashion', 'vintage', 'pink']),
  O('o12', 'fuchsia-dress', 'Vintage fuchsia dress', 'vintage', ['fashion', 'vintage', 'color']),
  O('o13', 'pink-set', 'Pink two-piece set', 'two-piece', ['fashion', 'pink']),
];

/** Albums, named from their covers. Files live in /public/music. */
const A = (id: string, file: string, title: string, artist: string, tags: string[]): Media => ({
  id, type: 'music', title, subtitle: artist, tags, imageData: `/music/${file}.jpg`,
  x: 0, y: 0, rot: 0, shape: 'punched', tint: 'white', addedAt: '2026-10-19',
});

export const MY_MUSIC: Media[] = [
  A('a1', 'hotel-california', 'Hotel California', 'Eagles', ['70s', 'rock', 'light']),
  A('a2', 'news-of-the-world', 'News of the World', 'Queen', ['70s', 'rock']),
  A('a3', 'whiplash-smile', 'Whiplash Smile', 'Billy Idol', ['80s', 'rock', 'color']),
  A('a4', 'santana', 'Santana', 'Santana', ['60s', 'rock', 'drawing']),
  A('a5', 'vanilla-fudge', 'Vanilla Fudge', 'Vanilla Fudge', ['60s', 'rock', 'color']),
  A('a6', 'slice', 'Slice', 'Yella', ['80s', 'rap', 'drawing']),
];

/** Events you went to (or saved), with their date. Files live in /public/events. */
const E = (id: string, file: string, title: string, where: string, when: string, tags: string[]): Media => ({
  id, type: 'event', title, subtitle: where, when, tags, imageData: `/events/${file}.jpg`,
  x: 0, y: 0, rot: 0, shape: 'punched', tint: 'white', addedAt: when,
});

export const MY_EVENTS: Media[] = [
  E('e1', 'turkish-tea-time', 'Turkish Tea Time', 'Williams Hall 440', '2026-09-17', ['food', 'color', 'friends']),
  E('e2', 'chinatown-festival', 'Philly Chinatown festival', 'Chinatown, Philadelphia', '2026-10-08', ['philly', 'cities', 'friends']),
  E('e3', 'philly-concerts', 'Concerts in Philly', 'Philadelphia', '2026-09-16', ['music', 'philly', 'light']),
];

/** Places you go. Files live in /public/places. */
const L = (id: string, file: string, title: string, where: string, tags: string[]): Media => ({
  id, type: 'place', title, subtitle: where, tags, imageData: `/places/${file}.jpg`,
  x: 0, y: 0, rot: 0, shape: 'polaroid', tint: 'white', addedAt: '2026-10-19',
});

export const MY_PLACES: Media[] = [
  L('pl1', 'love-statue', 'LOVE statue', 'LOVE Park, Philadelphia', ['philly', 'friends', 'type']),
  L('pl2', 'schuylkill-river', 'Schuylkill River trail', 'Philadelphia', ['philly', 'nature', 'water']),
  L('pl3', 'stouffer-night', 'Stouffer at night', 'Penn, Philadelphia', ['philly', 'light', 'quiet']),
];

/** everything real, in the order it joins a board */
export const MY_THINGS: Media[] = [...MY_PHOTOS, ...MY_OBJECTS, ...MY_MUSIC, ...MY_EVENTS, ...MY_PLACES];

/** Lay new cards out on a tidy grid beside the cards already on the desk, in "my layout". */
export function placeBeside(existing: Media[], fresh: Media[], cols = 4, cellW = 280, cellH = 300): Media[] {
  const maxX = existing.length ? Math.max(...existing.map((m) => m.x)) : 0;
  const minY = existing.length ? Math.min(...existing.map((m) => m.y)) : 0;
  const x0 = maxX + cellW + 120;
  return fresh.map((m, i) => ({ ...m, x: x0 + (i % cols) * cellW, y: minY + Math.floor(i / cols) * cellH }));
}

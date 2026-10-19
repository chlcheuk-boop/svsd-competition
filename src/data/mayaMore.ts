import type { Accent, ArtSpec, CardShape, CardTint, Connection, Media, MediaType } from '../types';
import { ART } from './maya';
import { SHAPE_FOR, isWords } from '../lib/mediaKinds';

/**
 * The rest of Maya's desk: three more neighborhoods around the original board.
 * Right: Japanese print and color theory. Below: Philly streets and type. Bottom-right: slow sound and film.
 */


function n(
  id: string, type: MediaType, title: string, subtitle: string, origin: string, x: number, y: number, addedAt: string,
  art?: ArtSpec, o: { tags?: string[]; tint?: CardTint; shape?: CardShape; rot?: number; url?: string; why?: string; when?: string } = {},
): Media {
  const seed = Number(id.replace(/\D/g, ''));
  return {
    id, type, title, subtitle, origin, x, y, addedAt, art,
    tags: o.tags ?? [],
    rot: o.rot ?? ((seed * 37) % 80) / 10 - 4,
    shape: o.shape ?? SHAPE_FOR[type],
    tint: o.tint ?? (isWords(type) ? 'peach' : 'white'),
    quote: isWords(type) ? title : undefined,
    url: o.url,
    why: o.why,
    when: o.when,
  };
}
const a = (kind: ArtSpec['kind'], colors: string[], seed: number): ArtSpec => ({ kind, colors, seed });
const c = (id: string, from: string, to: string, why: string | undefined, color: Accent, addedAt: string, via?: string): Connection =>
  ({ id, from, to, why, color, addedAt, via });

export const MORE_MEDIA: Media[] = [
  /* ---- right: Japanese print and color ---- */
  n('m17', 'photo', 'Great wave, museum postcard', 'woodblock reprint', 'postcard rack at the art museum', 1880, 80, '2025-07-04',
    a('waves', [ART.navy, ART.cream, ART.sky], 17), { tags: ['print', 'japan'] }),
  n('m18', 'link', 'Tokyo riso zine fair', 'zinefair.jp', 'an Instagram story from a stranger', 2170, 110, '2025-11-02',
    a('stripes', [ART.pink, ART.sky, ART.mustard, ART.lime, ART.tangerine], 18), { tags: ['risograph', 'japan'], url: 'https://zinefair.jp' }),
  n('m19', 'photo', 'Matchbox labels, 1960s', 'found set', 'a tin at an antique mall in Lancaster', 2450, 70, '2025-08-16',
    a('bauhaus', [ART.red, ART.navy, ART.mustard, ART.cream], 19), { shape: 'punched', tags: ['print', 'japan', '70s'] }),
  n('m20', 'text', 'Color is the most relative medium in art.', 'Josef Albers', 'library copy of Interaction of Color', 2740, 110, '2025-09-12',
    undefined, { tint: 'sky', tags: ['color', 'quote'] }),
  n('m21', 'photo', 'Albers squares, my homework', 'gouache', 'first color theory assignment', 1890, 410, '2025-09-20',
    a('arch', [ART.tangerine, ART.peach, ART.oxblood], 21), { tags: ['color', 'own work'] }),
  n('m22', 'object', 'Pantone chip 1788 C', 'swatch', 'the chip that matched the Expo red', 2160, 430, '2025-10-05',
    a('swatch', [ART.red], 22), { shape: 'sticky', tint: 'peach', tags: ['color'] }),
  n('m23', 'music', 'Music for Airports', 'Brian Eno', 'an empty terminal at PHL, 6am', 2450, 400, '2025-12-14',
    a('waves', [ART.cream, ART.sky, ART.ink], 23), { tags: ['ambient', 'quiet'] }),
  n('m24', 'video', 'Fallen Angels', 'Wong Kar-wai', 'the second WKW I ever saw', 2740, 420, '2025-06-21',
    a('neon', [ART.forest, ART.pink, ART.sky], 24), { tags: ['film', 'color', 'longing'] }),
  n('m25', 'photo', 'Osaka metro map', 'download', 'saved before a trip I never took', 1880, 730, '2026-02-11',
    a('grid', [ART.red, ART.navy, ART.forest, ART.mustard, ART.cream], 25), { shape: 'punched', tags: ['wayfinding', 'map', 'japan'] }),
  n('m26', 'text', 'Make the invisible visible.', 'a professor’s door', 'taped up in the design building', 2170, 750, '2025-10-22',
    undefined, { tint: 'lime', tags: ['principle'] }),
  n('m27', 'object', 'Wood type “A”', 'letterpress', 'the print shop’s drawer of strays', 2450, 720, '2026-04-03',
    a('stencil', [ART.cream, '#8A6A4A', ART.ink], 27), { tags: ['type', 'object'] }),
  n('m28', 'photo', 'Neon repair shop, Kensington', 'my photo', 'walking home late from studio', 2740, 740, '2026-05-17',
    a('neon', [ART.oxblood, ART.pink, ART.mustard], 28), { tags: ['signage', 'philly', 'color'] }),

  /* ---- below: Philly streets and type ---- */
  n('m29', 'photo', 'Ghost sign, “SHOES”', 'my photo', 'brick wall on Girard Ave', -100, 1090, '2025-05-25',
    a('stencil', ['#A4573F', ART.cream, ART.cream], 29), { tags: ['signage', 'philly', 'type'] }),
  n('m30', 'photo', 'Rowhouse doors, Fishtown', 'photo grid', 'counted fourteen colors on one block', 200, 1120, '2025-07-30',
    a('stripes', [ART.sky, ART.oxblood, ART.mustard, ART.forest, ART.pink], 30), { shape: 'punched', tags: ['philly', 'color'] }),
  n('m31', 'object', 'SEPTA transfer slip', 'paper', 'the lining of my backpack', 500, 1080, '2025-08-02',
    a('grid', [ART.cream, ART.navy, ART.red, ART.cream, ART.ink], 31), { shape: 'sticky', tint: 'sky', tags: ['philly', 'transit'] }),
  n('m32', 'text', 'Ugly is a kind of honest.', 'me, 2am crit', 'said it out loud in crit and kept it', 800, 1110, '2026-03-19',
    undefined, { tint: 'peach', tags: ['principle'] }),
  n('m33', 'photo', 'Hand-painted barber sign', 'West Philly', 'faded from red to pink', 1100, 1090, '2025-11-15',
    a('sun', [ART.pink, ART.cream, ART.navy], 33), { tags: ['signage', 'type', 'philly'] }),
  n('m34', 'link', 'Zine fest flyer archive', 'phillyzines.org', 'a table at the zine fest', 1400, 1120, '2026-04-27',
    a('dots', [ART.pink, ART.ink, ART.mustard], 34), { tags: ['risograph', 'print'], url: 'https://phillyzines.org' }),
  n('m35', 'photo', 'Market neon at lunch', 'my photo', 'lunch with mom, looking up', -80, 1430, '2025-12-27',
    a('neon', [ART.red, ART.mustard, ART.sky], 35), { tags: ['signage', 'philly'] }),
  n('m36', 'object', 'Bent bus stop flag', 'sign', 'a sign that had been hit by a truck', 220, 1450, '2026-01-30',
    a('stencil', [ART.cream, ART.navy, ART.red], 36), { shape: 'punched', tags: ['transit', 'type', 'philly'] }),
  n('m37', 'music', 'Philly soul compilation', 'various', 'thrift store crate, two dollars', 520, 1420, '2025-08-24',
    a('gradient', [ART.mustard, ART.oxblood, ART.ink], 37), { tags: ['soul', '70s'] }),
  n('m38', 'photo', 'Scraped mural layers', 'my photo', 'construction fence on Spring Garden', 820, 1440, '2026-06-09',
    a('gradient', [ART.lime, ART.pink, ART.sky], 38), { tags: ['street', 'color'] }),
  n('m39', 'text', 'Signs are a city talking to itself.', 'my notebook', 'written on the 15 trolley', 1120, 1420, '2026-02-02',
    undefined, { tint: 'lime', tags: ['signage', 'quote'] }),
  n('m40', 'video', 'Home movies, 1974', 'digitized reels', 'a neighbor’s attic', 1420, 1450, '2026-07-21',
    a('sun', [ART.mustard, ART.cream, ART.oxblood], 40), { tags: ['film', '70s', 'philly'] }),

  /* ---- bottom right: slow sound and film ---- */
  n('m41', 'video', 'Chungking Express', 'Wong Kar-wai', 'film club, again, by request', 1880, 1090, '2025-06-28',
    a('neon', [ART.mustard, ART.forest, ART.pink], 41), { tags: ['film', 'color'] }),
  n('m42', 'music', 'Journey in Satchidananda', 'Alice Coltrane', 'a friend’s turntable, a long night', 2170, 1110, '2026-01-10',
    a('waves', [ART.oxblood, ART.mustard, ART.cream], 42), { tags: ['jazz', 'quiet'] }),
  n('m43', 'video', 'Stalker, the long track', 'Tarkovsky', 'watched it in three sittings', 2450, 1080, '2026-03-28',
    a('gradient', ['#6B6A55', ART.forest, ART.ink], 43), { tags: ['film', 'time'] }),
  n('m44', 'text', 'Time is the material.', 'Tarkovsky, paraphrased', 'film history notes, margin', 2740, 1100, '2026-03-29',
    undefined, { tint: 'sky', tags: ['time', 'quote'] }),
  n('m45', 'object', 'Unlabeled cassette', 'tape', 'a box at the flea market', 1890, 1430, '2026-05-02',
    a('grid', [ART.ink, ART.cream, ART.tangerine, ART.ink, ART.cream], 45), { tags: ['sound', 'object'] }),
  n('m46', 'video', 'Tokyo Story', 'Ozu', 'with my grandmother, no subtitles needed', 2170, 1450, '2026-08-08',
    a('arch', [ART.cream, '#8F8A83', ART.ink], 46), { tags: ['film', 'quiet', 'japan'] }),
  n('m47', 'music', 'Field recording: 30th St', 'my phone', 'under the departure board', 2450, 1420, '2026-09-03',
    a('dots', [ART.cream, ART.ink, ART.sky], 47), { tags: ['sound', 'transit', 'philly'] }),
  n('m48', 'photo', 'Cinema seat 47', 'auction lot', 'a closed theater’s auction', 2740, 1440, '2026-09-14',
    a('stencil', [ART.oxblood, ART.mustard, ART.cream], 48), { tags: ['object', 'film'] }),
];

export const MORE_CONNECTIONS: Connection[] = [
  c('c14', 'm1', 'm17', 'both are Japan selling a picture of itself', 'tangerine', '2025-07-05'),
  c('c15', 'm17', 'm19', 'printed fast for people who would throw them away', 'sky', '2025-08-17'),
  c('c16', 'm19', 'm18', 'matchbox labels were the zines of their day', 'tangerine', '2025-11-03'),
  c('c17', 'm20', 'm21', 'I tried to prove Albers wrong. he wasn’t.', 'sky', '2025-09-21'),
  c('c18', 'm21', 'm12', 'the neon study started as a homework square', 'pink', '2025-09-22'),
  c('c19', 'm22', 'm19', 'the exact matchbox red, finally named', 'tangerine', '2025-10-06'),
  c('c20', 'm22', 'm20', 'a number for a color that never stays still', 'peach', '2025-10-07'),
  c('c21', 'm23', 'm9', 'music that doesn’t ask you to listen', 'sky', '2025-12-15'),
  c('c23', 'm24', 'm20', 'WKW proves Albers: every color depends on its neighbor', 'pink', '2025-09-13'),
  c('c24', 'm24', 'm41', 'two halves of one night', 'pink', '2025-06-29'),
  c('c25', 'm25', 'm14', 'two transit maps, two languages, same grammar', 'sky', '2026-02-12'),
  c('c26', 'm26', 'm21', 'the homework that made the invisible visible', 'lime', '2025-10-23'),
  c('c27', 'm27', 'm28', 'letters waiting for a sign, and the shop that fixes signs', 'tangerine', '2026-05-18'),
  c('c29', 'm28', 'm24', 'neon that’s still on, and neon on film', 'tangerine', '2026-05-19'),
  c('c30', 'm29', 'm7', 'signs that outlived their shops', 'tangerine', '2025-05-26'),
  c('c31', 'm29', 'm35', 'Theo: hand-lettering nobody signed, everybody read', 'sky', '2025-12-28', 'theo'),
  c('c32', 'm30', 'm38', 'a block doing Albers by accident, a wall doing it in layers', 'lime', '2026-06-10'),
  c('c33', 'm31', 'm6', 'two ways to pay for the same ride', 'sky', '2025-08-03'),
  c('c34', 'm31', 'm36', 'SEPTA design is mostly tape and patience, and I love it', 'tangerine', '2026-01-31'),
  c('c35', 'm32', 'm5', 'the opposite rule, also true', 'pink', '2026-03-20'),
  c('c36', 'm32', 'm38', 'the mural got better when it got scraped', 'peach', '2026-06-10'),
  c('c37', 'm33', 'm11', 'the street made its own typography', 'tangerine', '2025-11-17'),
  c('c38', 'm34', 'm33', 'flyers and barber signs: the street’s own print shop', 'pink', '2026-04-28'),
  c('c39', 'm35', 'm37', 'what the market sounds like at noon', 'lime', '2025-12-28'),
  c('c40', 'm36', 'm10', 'letterforms that took a hit and kept working', 'ink', '2026-02-01'),
  c('c41', 'm37', 'm3', 'dad’s car, again', 'sky', '2025-08-25'),
  c('c42', 'm38', 'm13', 'a wall, sped up through time', 'lime', '2026-06-11'),
  c('c43', 'm39', 'm33', 'the city talking, just more quietly now', 'tangerine', '2026-02-03'),
  c('c44', 'm39', 'm11', 'Gibson said it better', 'peach', '2026-02-04'),
  c('c45', 'm40', 'm37', 'a 1974 soundtrack for 1974 footage', 'tangerine', '2026-07-22'),
  c('c46', 'm40', 'm46', 'home movies of other people’s families', 'sky', '2026-08-09'),
  c('c48', 'm41', 'm43', 'both are about waiting in the wrong place', 'ink', '2026-03-30'),
  c('c49', 'm42', 'm23', 'music as a room you can stand in', 'lime', '2026-01-11'),
  c('c50', 'm43', 'm44', 'Rafa: the film is the quote, you don’t need both', 'pink', '2026-03-31', 'rafa'),
  c('c51', 'm44', 'm42', 'Coltrane makes time the material too', 'sky', '2026-04-01'),
  c('c52', 'm45', 'm47', 'tapes of places nobody recorded on purpose', 'tangerine', '2026-09-04'),
  c('c53', 'm46', 'm43', 'two long films that trust you to wait', 'sky', '2026-08-10'),
  c('c54', 'm47', 'm41', 'train stations and snack bars: rooms full of strangers', 'lime', '2026-09-05'),
  c('c55', 'm48', 'm46', 'the seat I would have sat in', 'pink', '2026-09-15'),
  c('c56', 'm48', 'm27', 'numbers and letters that lost their buildings', 'tangerine', '2026-09-16'),
];


/* ---- above: Maya's own life, not references ---- */
const MAP = (seed: number): ArtSpec => ({ kind: 'map', colors: ['#E9E2D3', ART.sky, ART.peach, ART.tangerine], seed });

export const LIFE_MEDIA: Media[] = [
  n('m49', 'place', 'Rittenhouse Square, north bench', 'Rittenhouse', 'where I read between classes', 120, -330, '2025-03-08',
    MAP(49), { tags: ['philly', 'quiet'], why: 'the one place in the city that makes me slow down' }),
  n('m50', 'photo', 'Shadow of the El on Market St', 'my phone, 5pm', 'waiting for the light to change', 430, -360, '2025-10-14',
    a('stripes', ['#8F8A83', ART.cream, '#5E5A55', ART.cream, '#8F8A83'], 50), { tags: ['philly', 'grid', 'light'], why: 'the city drew a grid on the sidewalk for me' }),
  n('m51', 'event', 'First Friday, Old City', 'galleries on 2nd St', 'went alone, stayed till close', 740, -320, '2026-10-02',
    undefined, { when: '2026-10-02', tags: ['philly', 'art'], why: 'the first time I went somewhere alone and didn’t feel alone' }),
  n('m52', 'moment', 'Someone hand-lettered “WET PAINT” better than any font I own.', 'Fitler Square, a Tuesday', 'walking to the bus', 1050, -350, '2026-05-12',
    undefined, { tint: 'lime', tags: ['type', 'street'], why: 'proof that care beats tools' }),
  n('m53', 'place', 'Paper Jam riso studio', 'Fishtown', 'Priya took me for my birthday', 1360, -330, '2025-09-29',
    MAP(53), { tags: ['risograph', 'philly'], why: 'where I learned colors misbehave on purpose' }),
  n('m54', 'photo', 'Mom’s handwriting on a grocery list', 'kitchen counter', 'stuck to the fridge for a month', 1880, -330, '2025-12-24',
    a('gradient', [ART.cream, '#E9E2D3', ART.peach], 54), { tags: ['type', 'family'], why: 'the first typeface I ever learned to read' }),
  n('m55', 'event', 'Zine fest, table 14', 'Philly Zine Fest', 'traded three of mine', 2190, -320, '2026-04-26',
    undefined, { when: '2026-04-26', tags: ['risograph', 'print', 'philly'], why: 'I traded three zines and came home with a whole new palette' }),
  n('m56', 'moment', 'The 6am El sounds like one long held note.', 'platform at 46th St', 'every weekday this fall', 2500, -350, '2026-09-08',
    undefined, { tint: 'sky', tags: ['sound', 'transit', 'quiet'], why: 'my alarm clock and my metronome' }),
];

export const LIFE_CONNECTIONS: Connection[] = [
  c('c57', 'm49', 'm5', 'both tell me to do less, better', 'lime', '2025-03-15'),
  c('c58', 'm50', 'm14', 'the grid I draw on paper is already on the street', 'sky', '2025-10-15'),
  c('c59', 'm50', 'm7', 'the same walk, two kinds of shadow', 'tangerine', '2025-10-16'),
  c('c60', 'm51', 'm2', 'a whole street of two-color energy', 'tangerine', '2026-10-03'),
  c('c61', 'm52', 'm11', 'the street finds its own uses for paint', 'pink', '2026-05-13'),
  c('c62', 'm53', 'm55', 'the studio, then the table where it all went', 'pink', '2026-04-27'),
  c('c63', 'm55', 'm18', 'Philly’s zine fest, Tokyo’s zine fair: same tables, different ink', 'pink', '2026-04-28'),
  c('c64', 'm54', 'm17', 'two things that lived on our fridge', 'peach', '2025-12-25'),
  c('c65', 'm56', 'm23', 'ambient music, except it’s a train', 'sky', '2026-09-09'),
];

/** Maya's own reasons for her references, separate from any string. */
export const MEDIA_WHYS: Record<string, string> = {
  m1: 'the reason I started collecting at all',
  m2: 'my aunt’s wall is where I learned a poster could be a room',
  m3: 'the sound of being driven somewhere safe',
  m4: 'it taught me that color can hold a feeling for you',
  m5: 'my rule for crits, and for packing',
  m6: 'proof that design can fit in a pocket',
  m7: 'my 7am meditation',
  m12: 'the first thing I made that felt like mine',
  m14: 'I learned the city through this map before I learned it on foot',
  m29: 'a shop that’s gone and a sign that refuses to be',
  m31: 'I keep it because it expired the day I moved here',
  m35: 'lunch with mom, every December',
  m46: 'my grandmother laughed at the same moments I did',
};

export const withWhys = (media: Media[]) => media.map((m) => (m.why || !MEDIA_WHYS[m.id] ? m : { ...m, why: MEDIA_WHYS[m.id] }));

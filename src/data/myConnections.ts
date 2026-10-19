import type { Accent, Connection } from '../types';

/**
 * Starter strings and reasons for the real cards. Written as starting points to edit or snip:
 * about three quarters of the cards sit on a string, about half the strings carry a why,
 * and about half the cards carry their own reason.
 */
const COLORS: Accent[] = ['tangerine', 'sky', 'pink', 'lime', 'peach'];
let n = 0;
const s = (from: string, to: string, why?: string): Connection => {
  const i = n++;
  return {
    id: `mc-${from}-${to}`,
    from,
    to,
    why,
    color: COLORS[i % COLORS.length],
    addedAt: `2026-${i % 2 ? '10' : '09'}-${String(1 + ((i * 7) % 27)).padStart(2, '0')}`,
  };
};

export const MY_CONNECTIONS: Connection[] = [
  s('p31', 'p18', 'light coming through slats, twice'),
  s('p18', 'p17'),
  s('p8', 'p16', 'the same window at two different hours'),
  s('p16', 'a1'),
  s('a1', 'p13', 'palm-tree sunsets I’ve only seen from far away'),
  s('p13', 'f3'),
  s('f3', 'pl3', 'a city at night looks like a movie set'),
  s('pl3', 'p22'),
  s('p22', 'p5', 'rooms I only notice after midnight'),
  s('p5', 'p23'),
  s('p23', 'o7'),
  s('p25', 'p7'),
  s('p7', 'p29', 'too much, and that’s why I loved it'),
  s('p29', 'p9'),
  s('p9', 'p10'),
  s('p10', 'p27', 'museums where the building is the best piece'),
  s('p27', 'p26'),
  s('p26', 'o10', 'soft purple with one hard edge'),
  s('o10', 'o13'),
  s('o13', 'o4'),
  s('o4', 'o3', 'pink with way too much detail'),
  s('o12', 'o1'),
  s('o1', 'f1', 'a dress that already looks like a film still'),
  s('f1', 'f4'),
  s('f4', 'f2', 'poster type that shouts'),
  s('f2', 'a2', 'a giant robot carrying someone, twice'),
  s('a4', 'p4', 'drawn in black line, nothing filled in'),
  s('o11', 'o9', 'pink and green, the pair I keep picking'),
  s('pl2', 'p30', 'green water ten minutes from campus'),
  s('e2', 'e1', 'free food and strangers talking'),
  s('e3', 'pl1'),
  s('pl1', 'p1'),
  s('p12', 'p14'),
  s('p11', 'm44', 'a drawing the tide will finish'),
];

/** A reason for about half of the real cards. */
export const MY_REASONS: Record<string, string> = {
  p1: 'the night everyone looked like a better version of themselves',
  p4: 'a teacher, drawn by the people he taught',
  p5: 'the only hour the kitchen is quiet',
  p6: 'every shelf was someone else’s favorite thing',
  p8: 'I didn’t know a sky could go that purple',
  p10: 'a hallway that made me walk slower',
  p11: 'someone made this knowing the tide would erase it',
  p13: 'a movie with the whole city behind the screen',
  p16: 'this is why I always ask for the window seat',
  p18: 'the building drew itself on the street',
  p22: 'late nights in a room that isn’t mine',
  p23: 'I still think about this watermelon',
  p26: 'three flowers can be a whole composition',
  p29: 'I stood under this longer than I shopped',
  p30: 'it doesn’t feel like the middle of a city',
  p31: 'the sun printed stripes on my face',
  p32: 'my first real photo booth strip',
  o1: 'the dress for a premiere I’m not invited to',
  o5: 'the color of sea glass, in leather',
  o6: 'someone wore these for years before me',
  o11: 'pink, green and a little ridiculous, which is why I like it',
  o12: 'one color, all the way down',
  a1: 'the cover looks like the last hour of a road trip',
  a2: 'a cover painting I can’t stop looking at',
  a4: 'the lion is made of a thousand small lines',
  e1: 'tea in tiny glasses with people I’d just met',
  e2: 'the whole street turned into one long table',
  pl1: 'the photo everyone takes, and I’m glad we took it',
  pl3: 'my favorite place to study once everyone leaves',
  f1: 'a movie I understood less the second time',
  f4: 'a poster from 1913 that still looks loud',
};

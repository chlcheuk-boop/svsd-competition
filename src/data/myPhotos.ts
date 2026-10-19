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
];

/** Lay new cards out on a tidy grid beside the cards already on the desk, in "my layout". */
export function placeBeside(existing: Media[], fresh: Media[], cols = 4, cellW = 280, cellH = 300): Media[] {
  const maxX = existing.length ? Math.max(...existing.map((m) => m.x)) : 0;
  const minY = existing.length ? Math.min(...existing.map((m) => m.y)) : 0;
  const x0 = maxX + cellW + 120;
  return fresh.map((m, i) => ({ ...m, x: x0 + (i % cols) * cellW, y: minY + Math.floor(i / cols) * cellH }));
}

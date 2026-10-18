import type { CardShape, MediaType } from '../types';

export const SHAPE_FOR: Record<MediaType, CardShape> = {
  photo: 'polaroid', place: 'polaroid', event: 'punched', moment: 'sticky',
  image: 'polaroid', object: 'polaroid', music: 'punched', text: 'sticky', video: 'folded', link: 'folded',
};

export const TYPE_LABEL: Record<MediaType, string> = {
  photo: 'photo', place: 'place', event: 'event', moment: 'noticed',
  image: 'image', music: 'music', text: 'quote', video: 'film', object: 'object', link: 'link',
};

/** Entries that are mostly words: rendered as written notes, not pictures. */
export const isWords = (t: MediaType) => t === 'text' || t === 'moment';

export const LIFE_TYPES: MediaType[] = ['photo', 'place', 'event', 'moment'];
export const MEDIA_TYPES: MediaType[] = ['image', 'music', 'video', 'text', 'link', 'object'];

export const fmtEventDate = (iso?: string) => {
  if (!iso) return { month: '', day: '' };
  const d = new Date(iso + 'T12:00:00');
  return { month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(), day: String(d.getDate()) };
};

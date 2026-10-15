export type MediaType = 'image' | 'music' | 'text' | 'video' | 'object' | 'link';
export type CardShape = 'punched' | 'sticky' | 'folded' | 'polaroid';
export type Accent = 'tangerine' | 'peach' | 'lime' | 'sky' | 'pink' | 'ink';
export type CardTint = 'white' | 'peach' | 'lime' | 'sky' | 'deep';
export type Quadrant = 1 | 2 | 3 | 4;

/** Generated placeholder art. Swap for `imageData` when a real upload exists. */
export interface ArtSpec {
  kind: 'bauhaus' | 'gradient' | 'stripes' | 'sun' | 'grid' | 'arch' | 'waves' | 'neon' | 'swatch' | 'token' | 'stencil' | 'dots';
  colors: string[];
  seed: number;
}

export interface Media {
  id: string;
  type: MediaType;
  title: string;
  /** artist / author / domain / label depending on type */
  subtitle?: string;
  origin?: string;
  tags: string[];
  x: number;
  y: number;
  rot: number;
  shape: CardShape;
  tint: CardTint;
  art?: ArtSpec;
  imageData?: string;
  quote?: string;
  url?: string;
  addedAt: string;
  /** person id when this was added because of a match */
  via?: string;
  /** id of the matching item on another board (used for overlay "shared" glow) */
  ref?: string;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  why?: string;
  color: Accent;
  addedAt: string;
  via?: string;
}

export interface Thread {
  id: string;
  owner: string; // 'maya' or a person id
  coAuthor?: string;
  title: string;
  intro?: string;
  mediaIds: string[];
  publishedAt: string;
  isPublic: boolean;
}

export interface Person {
  id: string;
  name: string;
  city: string;
  craft: string;
  color: Accent;
  initial: string;
}

export type StampShape = 'circle' | 'rounded' | 'oval' | 'hexagon' | 'perforated' | 'triangle';

export interface PassportStamp {
  id: string;
  personId: string;
  date: string;
  excerpt: string;
  full: string;
  quadrant: Quadrant;
  shape: StampShape;
  color: Accent;
  kind: 'crossing' | 'stamp' | 'critique';
  target?: { kind: 'connection' | 'media'; id: string };
  fresh?: boolean;
}

export interface Board {
  media: Media[];
  connections: Connection[];
}

export interface MatchProfile {
  personId: string;
  quadrant: Quadrant;
  intro: string;
  overlap: string[]; // media ids on their board
  split: string[];
  experience?: { title: string; where: string; when: string };
  board: Board;
  threads: Thread[];
  bio: string;
}

export interface Settings {
  boardPrivate: boolean;
  matchable: boolean;
  shareMode: 'fingerprint' | 'threads';
  frequency: 'weekly' | 'biweekly' | 'monthly';
  quadrants: Record<Quadrant, boolean>;
  imports: { arena: boolean; pinterest: boolean; folder: boolean };
  defaultYarn: Accent;
  reduceMotion: boolean;
}

export interface MatchState {
  flipped: boolean;
  status: 'new' | 'saved' | 'passed' | 'crossed';
}

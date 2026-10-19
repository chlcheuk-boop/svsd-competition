import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type { Arrange } from '../lib/arrange';
import type { Accent, Board, Connection, MatchState, Media, PassportStamp, Settings, Thread } from '../types';
import { MAYA_CONNECTIONS, MAYA_MEDIA, MAYA_THREADS } from '../data/maya';
import { KENJI_GIFT_CONNECTION, KENJI_PASSPORT_STAMP, PASSPORT_STAMPS } from '../data/stamps';
import { LIFE_CONNECTIONS, LIFE_MEDIA, MORE_CONNECTIONS, MORE_MEDIA, withWhys } from '../data/mayaMore';
import { MATCHES } from '../data/matches';
import { MY_THINGS, placeBeside } from '../data/myPhotos';

const KEY = 'purl.state.v1';
/** where boards were saved before the app was renamed Purl; read once, then moved */
const OLD_KEY = 'rhyme.state.v1';

export interface AppState {
  version: 1;
  onboarded: boolean;
  arrowSeen: boolean;
  tutorialSeen: boolean;
  /** saved boards from before the desk grew get the new references merged in once */
  boardEdition: number;
  /** how the personal board is laid out: your own placement, or a tidy grid by kind or theme */
  arrange: Arrange;
  matchesSeen: boolean;
  matchesDealt: boolean;
  media: Media[];
  connections: Connection[];
  threads: Thread[];
  stamps: PassportStamp[];
  matchState: Record<string, MatchState>;
  /** what Maya added to other people's boards */
  contributions: Record<string, Board>;
  crossings: Record<string, 'started' | 'sent' | 'complete'>;
  settings: Settings;
  yarnColor: Accent;
}

/** the desk plus the real photos, placed on a grid beside it */
const withBeside = (media: Media[]) => [...media, ...placeBeside(media, MY_THINGS)];

/**
 * The drawn stand-ins that used to fill the photo / image, object, music, place, event and film categories. Real images
 * replaced them, so they, and any string tied to them, leave every board (new and saved).
 * Kenji's old handbill gift (mk1) goes too; his Crossing now ties a string between two real cards.
 */
const DRAWN_PLACES_AND_EVENTS = ['m49', 'm53', 'm51', 'm55'];
const DRAWN_FILMS = ['m4', 'm13', 'm24', 'm40', 'm41', 'm43', 'm46'];
const DRAWN_OBJECTS_AND_MUSIC = [...DRAWN_PLACES_AND_EVENTS, ...DRAWN_FILMS, 'm3', 'm9', 'm6', 'm10', 'm15', 'm22', 'm23', 'm27', 'm31', 'm36', 'm37', 'm42', 'm45', 'm47'];
const DRAWN_PHOTOS = new Set([...DRAWN_OBJECTS_AND_MUSIC, 'mk1', 'm1', 'm2', 'm14', 'm7', 'm12', 'm16', 'm17', 'm19', 'm21', 'm25', 'm28', 'm29', 'm30', 'm33', 'm35', 'm38', 'm48', 'm50', 'm54']);

function dropDrawnPhotos(s: AppState): AppState {
  const media = s.media
    .filter((m) => !DRAWN_PHOTOS.has(m.id))
    // places briefly saved as l1–l3 (Lena's card ids) get their own ids
    .map((m) => (m.type === 'place' && /^l[123]$/.test(m.id) && m.imageData?.startsWith('/places/') ? { ...m, id: `p${m.id}` } : m));
  let connections = s.connections.filter((c) => !DRAWN_PHOTOS.has(c.from) && !DRAWN_PHOTOS.has(c.to));
  // a finished Crossing keeps Kenji's string, now tied to a real photo
  if (s.crossings.kenji === 'complete' && !connections.some((c) => c.id === KENJI_GIFT_CONNECTION.id)) {
    connections = [...connections, KENJI_GIFT_CONNECTION];
  }
  const mediaIds = new Set(media.map((m) => m.id));
  const connIds = new Set(connections.map((c) => c.id));
  // a seed thread that lost any card comes back as rebuilt from real ones; anything else under two cards goes
  const seedThreads = new Map(MAYA_THREADS.map((t) => [t.id, t]));
  const threads = s.threads
    .map((t) => {
      const mediaIds = t.mediaIds.filter((id) => !DRAWN_PHOTOS.has(id));
      const lost = mediaIds.length < t.mediaIds.length;
      return lost && seedThreads.has(t.id) ? seedThreads.get(t.id)! : { ...t, mediaIds };
    })
    .filter((t) => t.mediaIds.length >= 2 && !t.mediaIds.some((id) => DRAWN_PHOTOS.has(id)));
  // a stamp whose card or string is gone keeps its note, just without "show on my board"
  const stamps = s.stamps.map((old) => (old.id === KENJI_PASSPORT_STAMP.id ? { ...old, excerpt: KENJI_PASSPORT_STAMP.excerpt, full: KENJI_PASSPORT_STAMP.full } : old)).map((st) =>
    st.target && !(st.target.kind === 'media' ? mediaIds.has(st.target.id) : connIds.has(st.target.id)) ? { ...st, target: undefined } : st,
  );
  return { ...s, media, connections, threads, stamps };
}

export function initialState(): AppState {
  return dropDrawnPhotos({
    version: 1,
    onboarded: false,
    arrowSeen: false,
    tutorialSeen: false,
    matchesSeen: false,
    matchesDealt: false,
    media: withBeside(withWhys([...MAYA_MEDIA, ...MORE_MEDIA, ...LIFE_MEDIA])),
    connections: [...MAYA_CONNECTIONS, ...MORE_CONNECTIONS, ...LIFE_CONNECTIONS],
    boardEdition: 11,
    arrange: 'kind',
    threads: MAYA_THREADS,
    stamps: PASSPORT_STAMPS,
    matchState: Object.fromEntries(MATCHES.map((m) => [m.personId, { flipped: false, status: 'new' } as MatchState])),
    contributions: {},
    crossings: {},
    settings: {
      boardPrivate: true,
      matchable: true,
      shareMode: 'threads',
      frequency: 'weekly',
      quadrants: { 1: true, 2: true, 3: true, 4: true },
      capture: { camera: true, library: true, location: false },
      defaultYarn: 'tangerine',
      reduceMotion: false,
      shareProfile: { username: true, demographic: false, origin: true, creative: true },
    },
    yarnColor: 'tangerine',
  });
}

function load(): AppState {
  try {
    let raw = localStorage.getItem(KEY);
    if (!raw) {
      raw = localStorage.getItem(OLD_KEY);
      if (raw) {
        localStorage.setItem(KEY, raw);
        localStorage.removeItem(OLD_KEY);
      }
    }
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== 1) return initialState();
    const merged = { ...initialState(), ...parsed };
    merged.settings = { ...initialState().settings, ...parsed.settings };
    if ((parsed.boardEdition ?? 0) < 2) {
      const haveM = new Set(merged.media.map((m) => m.id));
      const moreConn = /^c(1[4-9]|[2-5]\d)$/; // the example strings, replaced wholesale with the current set
      merged.media = [...merged.media, ...MORE_MEDIA.filter((m) => !haveM.has(m.id))];
      merged.connections = [...merged.connections.filter((c) => !moreConn.test(c.id)), ...MORE_CONNECTIONS];
      merged.boardEdition = 2;
    }
    if (merged.boardEdition === 3) {
      // edition 3 briefly laid the desk out in rings; put the example cards back on the grid
      const home = new Map([...MAYA_MEDIA, ...MORE_MEDIA].map((m) => [m.id, m]));
      merged.media = merged.media.map((m) => {
        const h = home.get(m.id);
        return h ? { ...m, x: h.x, y: h.y } : m;
      });
    }
    if (merged.boardEdition < 5) {
      // her own life joins the desk: places, photos, events, things she noticed, and her reasons
      const haveM = new Set(merged.media.map((m) => m.id));
      const haveC = new Set(merged.connections.map((c) => c.id));
      merged.media = withWhys([...merged.media, ...LIFE_MEDIA.filter((m) => !haveM.has(m.id))]);
      merged.connections = [...merged.connections, ...LIFE_CONNECTIONS.filter((c) => !haveC.has(c.id))];
    }
    if (merged.boardEdition < 11) {
      // real photos, objects, albums, events and places
      const haveM = new Set(merged.media.map((m) => m.id));
      merged.media = [...merged.media, ...placeBeside(merged.media, MY_THINGS.filter((m) => !haveM.has(m.id)))];
    }
    merged.boardEdition = 11;
    // photos and images are one category now: anything saved as an image becomes a photo
    const asPhoto = (m: Media): Media => ((m.type as string) === 'image' ? { ...m, type: 'photo' } : m);
    merged.media = merged.media.map(asPhoto);
    merged.contributions = Object.fromEntries(
      Object.entries(merged.contributions).map(([k, b]) => [k, { ...b, media: b.media.map(asPhoto) }]),
    );
    return dropDrawnPhotos(merged);
  } catch {
    return initialState();
  }
}

type Action =
  | { type: 'patch'; patch: Partial<AppState> }
  | { type: 'moveMedia'; id: string; x: number; y: number }
  | { type: 'addMedia'; media: Media }
  | { type: 'updateMedia'; id: string; patch: Partial<Media> }
  | { type: 'removeMedia'; id: string }
  | { type: 'addConnection'; connection: Connection }
  | { type: 'updateConnection'; id: string; patch: Partial<Connection> }
  | { type: 'removeConnections'; ids: string[] }
  | { type: 'restoreConnections'; connections: Connection[] }
  | { type: 'addThread'; thread: Thread }
  | { type: 'updateThread'; id: string; patch: Partial<Thread> }
  | { type: 'setMatch'; id: string; patch: Partial<MatchState> }
  | { type: 'addContribution'; personId: string; media?: Media; connection?: Connection }
  | { type: 'addStamp'; stamp: PassportStamp }
  | { type: 'updateStamp'; id: string; patch: Partial<PassportStamp> }
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'reset'; onboarded?: boolean };

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'patch':
      return { ...s, ...a.patch };
    case 'moveMedia':
      return { ...s, media: s.media.map((m) => (m.id === a.id ? { ...m, x: a.x, y: a.y } : m)) };
    case 'addMedia':
      return { ...s, media: [...s.media, a.media] };
    case 'updateMedia':
      return { ...s, media: s.media.map((m) => (m.id === a.id ? { ...m, ...a.patch } : m)) };
    case 'removeMedia':
      return {
        ...s,
        media: s.media.filter((m) => m.id !== a.id),
        connections: s.connections.filter((c) => c.from !== a.id && c.to !== a.id),
      };
    case 'addConnection':
      return { ...s, connections: [...s.connections, a.connection] };
    case 'updateConnection':
      return { ...s, connections: s.connections.map((c) => (c.id === a.id ? { ...c, ...a.patch } : c)) };
    case 'removeConnections':
      return { ...s, connections: s.connections.filter((c) => !a.ids.includes(c.id)) };
    case 'restoreConnections':
      return { ...s, connections: [...s.connections, ...a.connections.filter((c) => !s.connections.some((x) => x.id === c.id))] };
    case 'addThread':
      return { ...s, threads: [...s.threads.filter((t) => t.id !== a.thread.id), a.thread] };
    case 'updateThread':
      return { ...s, threads: s.threads.map((t) => (t.id === a.id ? { ...t, ...a.patch } : t)) };
    case 'setMatch':
      return { ...s, matchState: { ...s.matchState, [a.id]: { ...s.matchState[a.id], ...a.patch } } };
    case 'addContribution': {
      const prev = s.contributions[a.personId] ?? { media: [], connections: [] };
      return {
        ...s,
        contributions: {
          ...s.contributions,
          [a.personId]: {
            media: a.media ? [...prev.media, a.media] : prev.media,
            connections: a.connection ? [...prev.connections, a.connection] : prev.connections,
          },
        },
      };
    }
    case 'addStamp':
      return { ...s, stamps: [...s.stamps.filter((x) => x.id !== a.stamp.id), a.stamp] };
    case 'updateStamp':
      return { ...s, stamps: s.stamps.map((x) => (x.id === a.id ? { ...x, ...a.patch } : x)) };
    case 'settings':
      return { ...s, settings: { ...s.settings, ...a.patch } };
    case 'reset': {
      const fresh = initialState();
      return { ...fresh, onboarded: a.onboarded ?? false };
    }
  }
}

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}
const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const timer = useRef<number>();

  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {
        /* storage full or blocked: the demo keeps working in memory */
      }
    }, 250);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside provider');
  return ctx;
}

export const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`;
export const today = () => new Date().toISOString().slice(0, 10);

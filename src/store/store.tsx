import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type { Arrange } from '../lib/arrange';
import type { Accent, Board, Connection, MatchState, Media, PassportStamp, Settings, Thread } from '../types';
import { MAYA_CONNECTIONS, MAYA_MEDIA, MAYA_THREADS } from '../data/maya';
import { KENJI_GIFT_MEDIA, PASSPORT_STAMPS } from '../data/stamps';
import { LIFE_CONNECTIONS, LIFE_MEDIA, MORE_CONNECTIONS, MORE_MEDIA, withWhys } from '../data/mayaMore';
import { MATCHES } from '../data/matches';
import { MY_PHOTOS, placeBeside } from '../data/myPhotos';

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
const withBeside = (media: Media[]) => [...media, ...placeBeside(media, MY_PHOTOS)];

export function initialState(): AppState {
  return {
    version: 1,
    onboarded: false,
    arrowSeen: false,
    tutorialSeen: false,
    matchesSeen: false,
    matchesDealt: false,
    media: withBeside(withWhys([...MAYA_MEDIA, ...MORE_MEDIA, ...LIFE_MEDIA])),
    connections: [...MAYA_CONNECTIONS, ...MORE_CONNECTIONS, ...LIFE_CONNECTIONS],
    boardEdition: 7,
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
  };
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
      const home = new Map([...MAYA_MEDIA, ...MORE_MEDIA, KENJI_GIFT_MEDIA].map((m) => [m.id, m]));
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
    if (merged.boardEdition < 7) {
      // real photos for the photo / image category
      const haveM = new Set(merged.media.map((m) => m.id));
      merged.media = [...merged.media, ...placeBeside(merged.media, MY_PHOTOS.filter((m) => !haveM.has(m.id)))];
    }
    merged.boardEdition = 7;
    // photos and images are one category now: anything saved as an image becomes a photo
    const asPhoto = (m: Media): Media => ((m.type as string) === 'image' ? { ...m, type: 'photo' } : m);
    merged.media = merged.media.map(asPhoto);
    merged.contributions = Object.fromEntries(
      Object.entries(merged.contributions).map(([k, b]) => [k, { ...b, media: b.media.map(asPhoto) }]),
    );
    return merged;
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

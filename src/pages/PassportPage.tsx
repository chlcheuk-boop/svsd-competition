import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Avatar, Toolbar } from '../components/ui/Frame';
import { IconArrowLeft, IconArrowRight, IconClock, IconClose, IconPerson, IconThread } from '../components/ui/icons';
import { Toggle } from '../components/ui/Toggle';
import { Logo } from '../components/ui/Logo';
import { Fingerprint } from '../components/passport/Fingerprint';
import { fmtMonth } from '../components/board/BoardView';
import { Stamp, stampSize } from '../components/passport/Stamp';
import { MiniStamp, accentVar } from '../components/ui/MiniStamp';
import { MAYA, person } from '../data/people';
import { QUADRANT_INFO } from '../components/tarot/TarotArt';
import type { Media, PassportStamp } from '../types';
import { universe } from '../lib/lookup';
import { Thumb } from '../components/ui/Thumb';
import { PAST_GIVEN } from '../data/stamps';
import { useViewport } from '../lib/useViewport';
import './passport.css';

const PER_PAGE = 5;
const SLOTS = [
  { x: 6, y: 5 },
  { x: 50, y: 9 },
  { x: 10, y: 37 },
  { x: 52, y: 42 },
  { x: 22, y: 69 },
];
const hash = (s: string) => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);

function Guilloche() {
  return (
    <svg className="guilloche" viewBox="0 0 400 520" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: 22 }).map((_, i) => (
        <path
          key={i}
          d={`M0 ${20 + i * 24} ${Array.from({ length: 9 }).map((__, k) => `Q ${k * 50 + 25} ${20 + i * 24 + (k % 2 ? 14 : -14) * Math.sin(i / 3)} ${(k + 1) * 50} ${20 + i * 24}`).join(' ')}`}
          fill="none"
          stroke="var(--rule)"
          strokeWidth="0.7"
        />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <ellipse key={`e${i}`} cx="200" cy="260" rx={40 + i * 16} ry={70 + i * 20} fill="none" stroke="var(--rule)" strokeWidth="0.5" opacity=".7" />
      ))}
    </svg>
  );
}

type PageSpec =
  | { kind: 'id' }
  | { kind: 'threads' }
  | { kind: 'stamps'; stamps: PassportStamp[]; n: number }
  | { kind: 'blank' };

export default function PassportPage() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const [spread, setSpread] = useState(0);
  // a turn goes to a target spread: the next one, or any spread a side tab points at
  const [target, setTarget] = useState<number | null>(null);
  const turning: null | 'next' | 'prev' = target === null ? null : target > spread ? 'next' : 'prev';
  const [expanded, setExpanded] = useState<PassportStamp | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  // phones read the passport one page at a time
  const { phone } = useViewport();
  const [page, setPage] = useState(0);
  const [pdir, setPdir] = useState(1);
  const swipe = useRef<number | null>(null);

  const stamps = useMemo(() => [...state.stamps].sort((a, b) => (a.date < b.date ? 1 : -1)), [state.stamps]);
  const people = useMemo(() => Array.from(new Set(stamps.map((s) => s.personId))), [stamps]);

  const pages: PageSpec[] = useMemo(() => {
    // first spread: you (ID + profile) | your threads and visibility; stamps start on the next spread
    const ps: PageSpec[] = [{ kind: 'id' }, { kind: 'threads' }];
    for (let i = 0; i < stamps.length; i += PER_PAGE) ps.push({ kind: 'stamps', stamps: stamps.slice(i, i + PER_PAGE), n: i / PER_PAGE + 1 });
    if (ps.length % 2 === 1) ps.push({ kind: 'blank' });
    return ps;
  }, [stamps]);
  const spreads = pages.length / 2;

  // index tabs down the edge of the book, one per section
  const tabs = useMemo(() => {
    const at = (k: PageSpec['kind']) => pages.findIndex((x) => x.kind === k);
    const t = [
      { id: 'id', label: 'ID', page: 0, accent: 'tangerine' },
      { id: 'threads', label: 'threads', page: at('threads'), accent: 'lime' },
      { id: 'stamps', label: 'stamps', page: at('stamps'), accent: 'pink' },
    ].filter((x) => x.page >= 0);
    return t.map((x, i) => ({ ...x, end: (t[i + 1]?.page ?? pages.length) - 1 }));
  }, [pages, phone]);

  // a fresh stamp stays marked "new" until it is opened
  const openStamp = (st: PassportStamp) => {
    setExpanded(st);
    if (st.fresh) dispatch({ type: 'updateStamp', id: st.id, patch: { fresh: false } });
  };

  const turn = (dir: 'next' | 'prev') => {
    if (phone) {
      if (!open) return dir === 'next' && setOpen(true);
      const n = page + (dir === 'next' ? 1 : -1);
      if (n < 0 || n >= pages.length) return;
      setPdir(dir === 'next' ? 1 : -1);
      setPage(n);
      return;
    }
    if (turning || !open) return;
    if (dir === 'next' && spread >= spreads - 1) return;
    if (dir === 'prev' && spread <= 0) return;
    setTarget(spread + (dir === 'next' ? 1 : -1));
  };

  const jumpTo = (pageIndex: number) => {
    if (phone) {
      if (!open) setOpen(true);
      setPdir(pageIndex >= page ? 1 : -1);
      setPage(pageIndex);
      return;
    }
    const sp = Math.floor(pageIndex / 2);
    if (!open) {
      // open straight onto that spread
      if (opening) return;
      setSpread(sp);
      setOpening(true);
      return;
    }
    if (turning || sp === spread) return;
    setTarget(sp);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') open ? turn('next') : openBook();
      if (e.key === 'ArrowLeft') turn('prev');
      if (e.key === 'Escape') setExpanded(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const openBook = () => {
    if (open || opening) return;
    if (phone) return setOpen(true);
    setOpening(true);
  };

  const renderPage = (spec: PageSpec | undefined, side: 'left' | 'right', freshPress = true): ReactNode => {
    if (!spec) return null;
    return (
      <div className={`pp-page ${side} pp-${spec.kind}-page`}>
        <Guilloche />
        <PageContent spec={spec} filter={filter} onStamp={openStamp} freshPress={freshPress} state={state} />
        <span className="pp-folio mono">{pages.indexOf(spec) + 1}</span>
      </div>
    );
  };

  const coverFace = (
    <>
      <Logo variant="stack" size={92} className="cover-logo" />
      <span className="cover-title mono">P A S S P O R T</span>
      <span className="cover-hint mono">{phone ? 'tap to open' : 'click to open'}</span>
    </>
  );

  const current = phone ? [page] : [spread * 2, spread * 2 + 1];
  const tabBar = (
    <nav className={`pp-tabs ${phone ? 'phone' : ''}`} aria-label="Passport sections">
      {tabs.map((t) => {
        const on = open && current.some((pg) => pg >= t.page && pg <= t.end);
        return (
          <button
            key={t.id}
            className={`pp-tab ${on ? 'on' : ''}`}
            style={{ ['--tab' as string]: accentVar(t.accent as never) }}
            aria-current={on ? 'page' : undefined}
            onClick={() => jumpTo(t.page)}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );

  const atStart = phone ? page === 0 : spread === 0;
  const atEnd = phone ? page >= pages.length - 1 : spread >= spreads - 1;

  const modal = (
    <AnimatePresence>
      {expanded && (
        <PersonRecap
          s={expanded}
          state={state}
          onClose={() => setExpanded(null)}
          onShow={(t) => nav(`/?focus=${t.kind}:${t.id}`)}
          onPick={openStamp}
        />
      )}
    </AnimatePresence>
  );

  const toolbar = (
    <Toolbar
      tools={[
        { id: 'prev', label: 'previous', icon: <IconArrowLeft />, disabled: !open || atStart, onClick: () => turn('prev') },
        { id: 'next', label: open ? 'next' : 'open', icon: <IconArrowRight />, disabled: open && atEnd, onClick: () => (open ? turn('next') : openBook()) },
        { id: 'filter', label: filter ? person(filter)!.name.split(' ')[0].toLowerCase() : 'by person', icon: <IconPerson />, active: filterOpen || !!filter, onClick: () => setFilterOpen((o) => !o) },
      ]}
    >
      {filterOpen && (
        <motion.div key="pf" className="tool-popover pp-filter" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>
          <button className="chip" aria-pressed={!filter} onClick={() => setFilter(null)}>everyone</button>
          {people.map((pid) => (
            <button key={pid} className="chip" aria-pressed={filter === pid} onClick={() => {
              setFilter(pid);
              if (!open) openBook();
            }}>
              <MiniStamp personId={pid} size={16} /> {person(pid)!.name.split(' ')[0]}
            </button>
          ))}
        </motion.div>
      )}
    </Toolbar>
  );

  if (phone) {
    return (
      <div className="passport-page">
        <div
          className="book phone-book"
          onPointerDown={(e) => (swipe.current = e.clientX)}
          onPointerUp={(e) => {
            if (swipe.current === null) return;
            const dx = e.clientX - swipe.current;
            swipe.current = null;
            if (Math.abs(dx) > 50) turn(dx < 0 ? 'next' : 'prev');
          }}
        >
          <AnimatePresence initial={false} custom={pdir}>
            {!open ? (
              <motion.button
                key="cover"
                className="cover phone-cover"
                onClick={() => setOpen(true)}
                exit={{ rotateY: -100, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.45, 0.05, 0.25, 1] }}
                style={{ originX: 0 }}
                aria-label="Open passport"
              >
                {coverFace}
              </motion.button>
            ) : (
              <motion.div
                key={page}
                className="phone-leaf"
                initial={{ rotateY: pdir > 0 ? 70 : -70, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: pdir > 0 ? -70 : 70, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.45, 0.05, 0.25, 1] }}
                style={{ originX: pdir > 0 ? 0 : 1 }}
              >
                {renderPage(pages[page], page % 2 ? 'right' : 'left')}
              </motion.div>
            )}
          </AnimatePresence>
          {open && <span className="phone-pager mono">{page + 1} / {pages.length} · swipe to turn</span>}
          {tabBar}
        </div>
        {modal}
        {toolbar}
      </div>
    );
  }

  const L = pages[spread * 2];
  const R = pages[spread * 2 + 1];
  const toL = target === null ? undefined : pages[target * 2];
  const toR = target === null ? undefined : pages[target * 2 + 1];

  return (
    <div className="passport-page">
      <div className={`book ${open ? 'is-open' : opening ? 'is-opening' : 'is-closed'}`}>
        {/* static halves */}
        <div className="half left">
          {open && (turning === 'prev' ? renderPage(toL, 'left') : renderPage(L, 'left'))}
        </div>
        <div className="half right">
          {(open || opening) && (turning === 'next' ? renderPage(toR, 'right') : renderPage(R, 'right'))}
        </div>
        {open && <div className="spine" aria-hidden="true" />}

        {/* the cover: front is cloth, back is the ID page */}
        {!open && (
          <motion.div
            className="leaf cover-leaf"
            initial={false}
            animate={{ rotateY: opening ? -180 : 0 }}
            transition={{ duration: 1.1, ease: [0.45, 0.05, 0.25, 1] }}
            onAnimationComplete={() => {
              if (opening) {
                setOpen(true);
                setOpening(false);
              }
            }}
          >
            <button className="leaf-face front cover" onClick={openBook} aria-label="Open passport">
              {coverFace}
            </button>
            <div className="leaf-face back">{renderPage(L, 'left')}</div>
          </motion.div>
        )}

        {/* page turning leaf */}
        <AnimatePresence>
          {turning && (
            <motion.div
              key={`${spread}-${target}`}
              className={`leaf turn-leaf ${turning}`}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: turning === 'next' ? -180 : 180 }}
              transition={{ duration: 0.85, ease: [0.45, 0.05, 0.25, 1] }}
              onAnimationComplete={() => {
                setSpread(target!);
                setTarget(null);
              }}
            >
              <div className="leaf-face front">{turning === 'next' ? renderPage(R, 'right', false) : renderPage(L, 'left', false)}</div>
              <div className="leaf-face back">{turning === 'next' ? renderPage(toL, 'left', false) : renderPage(toR, 'right', false)}</div>
            </motion.div>
          )}
        </AnimatePresence>
        {tabBar}
      </div>

      {modal}
      {toolbar}
    </div>
  );
}

function PageContent({ spec, filter, onStamp, freshPress, state }: {
  spec: PageSpec; filter: string | null; onStamp: (s: PassportStamp) => void; freshPress: boolean;
  state: State;
}) {
  if (spec.kind === 'blank') return <p className="pp-blank serif">space for the next people who change your mind</p>;

  if (spec.kind === 'id') return <IdPage state={state} />;
  if (spec.kind === 'threads') return <ThreadsPage state={state} />;

  if (spec.kind === 'stamps') {
    return (
      <div className="pp-stamps">
        {spec.stamps.map((s, i) => {
          const h = hash(s.id);
          const slot = SLOTS[i % SLOTS.length];
          const rot = (h % 28) - 14;
          const faded = filter && filter !== s.personId;
          const { w } = stampSize(s.shape);
          return (
            <motion.button
              key={s.id}
              className={`pp-stamp ${faded ? 'faded' : ''} ${s.fresh ? 'fresh' : ''}`}
              style={{ left: `${slot.x + ((h >> 3) % 6) - 3}%`, top: `${slot.y + ((h >> 5) % 5) - 2}%`, width: w }}
              initial={s.fresh && freshPress ? { scale: 1.9, opacity: 0, rotate: rot - 10 } : false}
              animate={{ scale: 1, opacity: faded ? 0.14 : 1, rotate: rot }}
              transition={s.fresh ? { type: 'spring', stiffness: 420, damping: 13, delay: 1.05 } : { duration: 0.3 }}
              whileHover={{ scale: 1.05, rotate: rot * 0.6 }}
              onClick={() => onStamp(s)}
            >
              <Stamp s={s} />
              {s.fresh && <span className="fresh-tag mono">new</span>}
            </motion.button>
          );
        })}
      </div>
    );
  }

  return null;
}

type State = ReturnType<typeof useStore>['state'];

/** The data page: who you are, like the photo page of a passport, with your profile beneath. Photo opens settings. */
function IdPage({ state }: { state: State }) {
  const nav = useNavigate();
  const share = state.settings.shareProfile ?? { username: true, demographic: false, origin: true, creative: true };
  const parts = MAYA.name.split(' ');
  const surname = parts.slice(1).join(' ');
  const given = parts[0];
  const fields: { label: string; value: string; shared?: boolean; wide?: boolean }[] = [
    { label: 'surname', value: surname },
    { label: 'given name', value: given },
    { label: 'username', value: MAYA.username, shared: share.username },
    { label: 'demographic', value: MAYA.demographic, shared: share.demographic },
    { label: 'place of origin', value: MAYA.origin, shared: share.origin, wide: true },
    { label: 'kind of creative', value: MAYA.creative, shared: share.creative, wide: true },
    { label: 'occupation', value: MAYA.craft, wide: true },
    { label: 'home', value: MAYA.city },
    { label: 'member since', value: MAYA.memberSince },
  ];
  const mrzName = `${surname.toUpperCase().replace(/[^A-Z]/g, '<')}<<${given.toUpperCase()}`.padEnd(32, '<');
  return (
    <div className="pp-leaf pp-id">
      <div className="pp-sec pp-id-head">
        <span className="mono-label">passport · no. PRL2025021</span>
        <span className="mono pp-legend"><span className="pp-shared" aria-hidden="true" /> shown to matches</span>
      </div>
      <div className="pp-sec pp-id-row">
        <button className="pp-photo" onClick={() => nav('/settings')} aria-label="Edit your details in settings">
          <Avatar size={64} />
          <span className="pp-photo-hint mono">edit in settings</span>
        </button>
        <dl className="pp-fields">
          {fields.map((f) => (
            <div key={f.label} className={f.wide ? 'wide' : ''}>
              <dt className="mono">
                {f.label}
                {f.shared && <span className="pp-shared" title="your matches see this" aria-label="shown to matches" />}
              </dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="pp-sec">
        <span className="mono-label">profile</span>
        <p className="pp-bio">{MAYA.bio}</p>
        <p className="mono pp-stats">
          {state.media.length} references · {state.connections.length} strings · {state.stamps.length} stamps
        </p>
      </div>
      <div className="pp-sec">
        <span className="mono-label">taste fingerprint · the themes matching reads</span>
        <Fingerprint media={state.media} />
      </div>
      <div className="pp-mrz mono" aria-hidden="true">
        {`P<PRL${mrzName}`}
        <br />
        {`PRL2025021<6PHL<<${String(state.stamps.length).padStart(2, '0')}STAMPS<<${state.media.length}REFS<<`}
      </div>
    </div>
  );
}

/** Published threads (how other people meet you), then who can find you. */
function ThreadsPage({ state }: { state: State }) {
  const { dispatch } = useStore();
  const nav = useNavigate();
  const u = universe(state);
  const mine = state.threads.filter((t) => t.owner === 'maya');
  return (
    <div className="pp-leaf pp-threads">
      <div className="pp-sec">
        <span className="mono-label">threads · what other people see</span>
        <ul>
          {mine.map((t) => (
            <li key={t.id}>
              <Link to={`/thread/${t.id}`} className="pp-thread-link">
                <span className="pp-thread-stack">
                  {t.mediaIds.slice(0, 3).map((id) => {
                    const m = u.media.get(id);
                    return m ? <Thumb key={id} m={m} size={32} title={false} /> : null;
                  })}
                </span>
                <span>
                  <span className="pp-thread-title">{t.title}</span>
                  <span className="mono">{t.coAuthor ? 'shared thread' : 'thread'} · {t.mediaIds.length} refs · {fmtMonth(t.publishedAt)}</span>
                </span>
              </Link>
              <Toggle
                label={t.isPublic ? 'public' : 'private'}
                checked={t.isPublic}
                onChange={(v) => dispatch({ type: 'updateThread', id: t.id, patch: { isPublic: v } })}
              />
            </li>
          ))}
        </ul>
        <p className="mono pp-thread-empty">
          <IconThread size={14} /> shift-click a chain of tied cards on your board to make a new thread
        </p>
      </div>
      <div className="pp-sec">
        <span className="mono-label">visibility</span>
        <div className="pp-controls">
          <Toggle label="Matchable this week" hint="you appear in other people’s four cards" checked={state.settings.matchable}
            onChange={(v) => dispatch({ type: 'settings', patch: { matchable: v } })} />
        </div>
      </div>
      <div className="pp-sec pp-actions">
        <button className="pf-replay" onClick={() => nav('/?replay=1')}>
          <IconClock size={18} />
          <span>
            <span className="pp-replay-title">Time replay</span>
            <span className="mono">watch your board grow from feb 2025 to now</span>
          </span>
        </button>
        <button className="btn btn-ghost pp-settings-link" onClick={() => nav('/settings')}>all settings</button>
      </div>
    </div>
  );
}

const fmtDay = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const KIND_LABEL: Record<PassportStamp['kind'], string> = {
  crossing: 'a why from a Crossing',
  critique: 'a critique on a thread',
  stamp: 'a note left on your board',
};

/** Clicking a stamp opens the whole history with that person: notes, media and strings, both ways. */
function PersonRecap({ s, state, onClose, onShow, onPick }: {
  s: PassportStamp;
  state: ReturnType<typeof useStore>['state'];
  onClose: () => void;
  onShow: (target: NonNullable<PassportStamp['target']>) => void;
  onPick: (s: PassportStamp) => void;
}) {
  const p = person(s.personId)!;
  const first = p.name.split(' ')[0];
  const u = universe(state);
  const title = (id: string) => u.media.get(id)?.title ?? 'a card';

  const notes = state.stamps.filter((x) => x.personId === p.id).sort((a, b) => (a.date < b.date ? -1 : 1));
  const theirMedia = state.media.filter((m) => m.via === p.id);
  const theirStrings = state.connections.filter((c) => c.via === p.id);
  const contrib = state.contributions[p.id];
  const past = PAST_GIVEN[p.id];
  const myMedia = [
    ...(past?.mediaIds.map((id) => state.media.find((m) => m.id === id)).filter(Boolean) as Media[] ?? []),
    ...(contrib?.media ?? []),
  ];
  const myStrings = [
    ...(past?.strings ?? []).map((x) => ({ a: x.a, b: x.b, why: x.why, date: x.date })),
    ...(contrib?.connections ?? []).map((c) => ({ a: title(c.from), b: title(c.to), why: c.why ?? '', date: c.addedAt })),
  ];
  const since = notes[0]?.date;
  const counts = [
    `${notes.length} note${notes.length === 1 ? '' : 's'}`,
    `${theirStrings.length + myStrings.length} strings`,
    `${theirMedia.length + myMedia.length} things traded`,
  ];

  return (
    <>
      <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="person-recap"
        role="dialog"
        aria-label={`Your history with ${p.name}`}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
      >
        <button className="sp-close" onClick={onClose} aria-label="Close">
          <IconClose size={18} />
        </button>

        <aside className="pr-side">
          <motion.div key={s.id} className="se-stamp" initial={{ scale: 1.4, rotate: -14 }} animate={{ scale: 1, rotate: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
            <Stamp s={s} />
          </motion.div>
          <div className="pr-who">
            <Avatar size={44} label={p.initial} color={accentVar(p.color)} ink={p.color === 'tangerine' || p.color === 'pink' ? '#fff' : 'var(--ink)'} />
            <div>
              <h2 className="serif">{p.name}</h2>
              <span className="mono">{p.craft} · {p.city} · {QUADRANT_INFO[s.quadrant].numeral} {QUADRANT_INFO[s.quadrant].name}</span>
            </div>
          </div>
          {since && <p className="mono pr-since">crossing paths since {fmtDay(since)}</p>}
          <p className="mono pr-counts">{counts.join(' · ')}</p>
        </aside>

        <div className="pr-main">
          <section className="pr-this">
            <span className="mono-label">{KIND_LABEL[s.kind]} · {fmtDay(s.date)}</span>
            <p className="serif">{s.full}</p>
            {s.target && (
              <button className="btn btn-primary" onClick={() => onShow(s.target!)}>show on my board</button>
            )}
          </section>

          <section>
            <h3 className="mono-label">every note from {first}</h3>
            <ol className="pr-notes">
              {notes.map((n) => (
                <li key={n.id}>
                  <button className={n.id === s.id ? 'on' : ''} onClick={() => onPick(n)}>
                    <span className="mono">{fmtDay(n.date)} · {n.kind}</span>
                    <span className="serif">“{n.excerpt}”</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section className="pr-two">
            <div>
              <h3 className="mono-label">{first} brought you</h3>
              {theirMedia.length === 0 && theirStrings.length === 0 && <p className="pr-empty serif">notes so far, nothing traded</p>}
              <ul className="pr-media">
                {theirMedia.map((m) => (
                  <li key={m.id}>
                    <Thumb m={m} size={44} />
                    <span><strong>{m.title}</strong>{m.origin && <em className="serif">{m.origin}</em>}</span>
                  </li>
                ))}
              </ul>
              <ul className="pr-strings">
                {theirStrings.map((c) => (
                  <li key={c.id}>
                    <span className="mono">{title(c.from)} ⟶ {title(c.to)}</span>
                    {c.why && <span className="serif">{c.why.replace(new RegExp(`^${first}: `), '')}</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mono-label">you brought {first}</h3>
              {myMedia.length === 0 && myStrings.length === 0 && <p className="pr-empty serif">nothing yet. start a Crossing to trade a string.</p>}
              <ul className="pr-media">
                {myMedia.map((m) => (
                  <li key={m.id}>
                    <Thumb m={m} size={44} />
                    <span><strong>{m.title}</strong><em className="serif">from your board</em></span>
                  </li>
                ))}
              </ul>
              <ul className="pr-strings">
                {myStrings.map((x, i) => (
                  <li key={i}>
                    <span className="mono">{x.a} ⟶ {x.b}</span>
                    {x.why && <span className="serif">{x.why}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </motion.div>
    </>
  );
}

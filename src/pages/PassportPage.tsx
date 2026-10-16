import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Avatar, Toolbar } from '../components/ui/Frame';
import { IconArrowLeft, IconArrowRight, IconClose, IconPerson } from '../components/ui/icons';
import { Stamp, stampSize } from '../components/passport/Stamp';
import { MiniStamp, accentVar } from '../components/ui/MiniStamp';
import { MAYA, person } from '../data/people';
import { QUADRANT_INFO } from '../components/tarot/TarotArt';
import type { PassportStamp } from '../types';
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
  | { kind: 'stamps'; stamps: PassportStamp[]; n: number }
  | { kind: 'who-story' }
  | { kind: 'who-people' }
  | { kind: 'blank' };

export default function PassportPage() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const [spread, setSpread] = useState(0);
  const [turning, setTurning] = useState<null | 'next' | 'prev'>(null);
  const [expanded, setExpanded] = useState<PassportStamp | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  const stamps = useMemo(() => [...state.stamps].sort((a, b) => (a.date < b.date ? 1 : -1)), [state.stamps]);
  const people = useMemo(() => Array.from(new Set(stamps.map((s) => s.personId))), [stamps]);

  const pages: PageSpec[] = useMemo(() => {
    const ps: PageSpec[] = [{ kind: 'id' }];
    for (let i = 0; i < stamps.length; i += PER_PAGE) ps.push({ kind: 'stamps', stamps: stamps.slice(i, i + PER_PAGE), n: i / PER_PAGE + 1 });
    if (ps.length % 2 === 1) ps.push({ kind: 'blank' });
    ps.push({ kind: 'who-story' }, { kind: 'who-people' });
    return ps;
  }, [stamps]);
  const spreads = pages.length / 2;

  // a fresh stamp stays marked "new" until it is opened
  const openStamp = (st: PassportStamp) => {
    setExpanded(st);
    if (st.fresh) dispatch({ type: 'updateStamp', id: st.id, patch: { fresh: false } });
  };

  const turn = (dir: 'next' | 'prev') => {
    if (turning || !open) return;
    if (dir === 'next' && spread >= spreads - 1) return;
    if (dir === 'prev' && spread <= 0) return;
    setTurning(dir);
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
    setOpening(true);
  };

  const renderPage = (spec: PageSpec | undefined, side: 'left' | 'right', freshPress = true): ReactNode => {
    if (!spec) return null;
    return (
      <div className={`pp-page ${side}`}>
        <Guilloche />
        <PageContent spec={spec} filter={filter} onStamp={openStamp} freshPress={freshPress} state={state} />
        <span className="pp-folio mono">{pages.indexOf(spec) + 1}</span>
      </div>
    );
  };

  const L = pages[spread * 2];
  const R = pages[spread * 2 + 1];
  const nextL = pages[(spread + 1) * 2];
  const nextR = pages[(spread + 1) * 2 + 1];
  const prevL = pages[(spread - 1) * 2];
  const prevR = pages[(spread - 1) * 2 + 1];

  return (
    <div className="passport-page">
      <div className={`book ${open ? 'is-open' : opening ? 'is-opening' : 'is-closed'}`}>
        {/* static halves */}
        <div className="half left">
          {open && (turning === 'prev' ? renderPage(prevL, 'left') : renderPage(L, 'left'))}
        </div>
        <div className="half right">
          {(open || opening) && (turning === 'next' ? renderPage(nextR, 'right') : renderPage(R, 'right'))}
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
              <span className="cover-name serif">Rhyme</span>
              <svg className="cover-emblem" width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
                <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="48" cy="48" r="33" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
                <path d="M22 54 C 34 30, 46 70, 58 44 S 74 40, 76 46" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="22" cy="54" r="2.5" fill="currentColor" />
                <circle cx="76" cy="46" r="2.5" fill="currentColor" />
              </svg>
              <span className="cover-title mono">P A S S P O R T</span>
              <span className="cover-hint mono">click to open</span>
            </button>
            <div className="leaf-face back">{renderPage(pages[0], 'left')}</div>
          </motion.div>
        )}

        {/* page turning leaf */}
        <AnimatePresence>
          {turning && (
            <motion.div
              key={`${turning}-${spread}`}
              className={`leaf turn-leaf ${turning}`}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: turning === 'next' ? -180 : 180 }}
              transition={{ duration: 0.85, ease: [0.45, 0.05, 0.25, 1] }}
              onAnimationComplete={() => {
                setSpread((s) => s + (turning === 'next' ? 1 : -1));
                setTurning(null);
              }}
            >
              <div className="leaf-face front">{turning === 'next' ? renderPage(R, 'right', false) : renderPage(L, 'left', false)}</div>
              <div className="leaf-face back">{turning === 'next' ? renderPage(nextL, 'left', false) : renderPage(prevR, 'right', false)}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {expanded && (
          <ExpandedStamp
            s={expanded}
            onClose={() => setExpanded(null)}
            onShow={() => expanded.target && nav(`/?focus=${expanded.target.kind}:${expanded.target.id}`)}
          />
        )}
      </AnimatePresence>

      <Toolbar
        tools={[
          { id: 'prev', label: 'previous page', icon: <IconArrowLeft />, disabled: !open || spread === 0, onClick: () => turn('prev') },
          { id: 'next', label: open ? 'next page' : 'open', icon: <IconArrowRight />, disabled: open && spread >= spreads - 1, onClick: () => (open ? turn('next') : openBook()) },
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
    </div>
  );
}

function PageContent({ spec, filter, onStamp, freshPress, state }: {
  spec: PageSpec; filter: string | null; onStamp: (s: PassportStamp) => void; freshPress: boolean;
  state: ReturnType<typeof useStore>['state'];
}) {
  if (spec.kind === 'blank') return <p className="pp-blank serif">space for the next people who change your mind</p>;

  if (spec.kind === 'id') {
    const themes = ['two-color print', 'quiet tension', 'wayfinding'];
    return (
      <div className="pp-id">
        <span className="mono-label">rhyme · passport · id</span>
        <div className="pp-id-row">
          <div className="pp-photo">
            <Avatar size={112} />
          </div>
          <dl>
            <dt className="mono">name</dt>
            <dd>{MAYA.name}</dd>
            <dt className="mono">home</dt>
            <dd>{MAYA.city}</dd>
            <dt className="mono">craft</dt>
            <dd>{MAYA.craft}</dd>
            <dt className="mono">member since</dt>
            <dd>{MAYA.memberSince}</dd>
          </dl>
        </div>
        <span className="mono-label">taste fingerprint</span>
        <ol className="pp-themes serif">
          {themes.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
        <div className="pp-mrz mono" aria-hidden="true">
          P&lt;RHY&lt;LIN&lt;OKAFOR&lt;&lt;MAYA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
          <br />
          RHY2025021ML&lt;6PHL&lt;&lt;{state.stamps.length}STAMPS&lt;&lt;&lt;&lt;
        </div>
      </div>
    );
  }

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

  if (spec.kind === 'who-story') return <WhoStory state={state} />;
  return <WhoPeople state={state} />;
}

function WhoStory({ state }: { state: ReturnType<typeof useStore>['state'] }) {
  const months = ['2025-02', '2025-05', '2025-08', '2025-11', '2026-02', '2026-05', '2026-08', '2026-10'];
  const counts = months.map((m) => state.media.filter((x) => x.addedAt.slice(0, 7) <= m).length);
  const max = Math.max(...counts, 1);
  const pts = counts.map((c, i) => [16 + i * 46, 96 - (c / max) * 80]);
  const d = pts.map(([x, y], i) => (i ? `S ${x - 20},${y} ${x},${y}` : `M ${x},${y}`)).join(' ');
  const viaCount = state.media.filter((m) => m.via).length + state.connections.filter((c) => c.via).length;
  return (
    <div className="pp-who">
      <span className="mono-label">who changed you · 2026</span>
      <h2 className="serif">You started with posters that looked back. This year they started arguing.</h2>
      <p className="serif">
        In February 2025 your board was two posters and a film. Now it holds {state.media.length} references and {state.connections.length} strings,
        and {viaCount} of them only exist because someone else tied them.
      </p>
      <svg className="pp-spark" viewBox="0 0 360 110" aria-label="References over time">
        <path d={d} fill="none" stroke="var(--tangerine)" strokeWidth="3" strokeLinecap="round" />
        <path d={d} fill="none" stroke="#A9411C" strokeWidth="3" strokeDasharray="1.1 3.1" opacity=".45" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.6" fill="var(--paper-deep)" stroke="var(--ink)" strokeWidth="1" />
        ))}
        <text x="16" y="108" className="mono" fontSize="9" fill="var(--ink-soft)">feb ’25</text>
        <text x="338" y="108" textAnchor="end" className="mono" fontSize="9" fill="var(--ink-soft)">oct ’26</text>
      </svg>
      <p className="serif pp-shift">
        Your taste moved from <em>nostalgia</em> toward <em>evidence</em>: fewer things kept because they were beautiful,
        more kept because of who made them and why.
      </p>
    </div>
  );
}

function WhoPeople({ state }: { state: ReturnType<typeof useStore>['state'] }) {
  const rows = Array.from(new Set(state.stamps.map((s) => s.personId)))
    .map((pid) => ({
      pid,
      stamps: state.stamps.filter((s) => s.personId === pid),
      led: state.connections.filter((c) => c.via === pid).length + state.media.filter((m) => m.via === pid).length,
    }))
    .sort((a, b) => b.led - a.led || b.stamps.length - a.stamps.length);
  return (
    <div className="pp-who">
      <span className="mono-label">whose stamps led somewhere</span>
      <ol className="pp-people">
        {rows.map(({ pid, stamps, led }) => {
          const p = person(pid)!;
          const best = stamps[stamps.length - 1];
          return (
            <li key={pid}>
              <MiniStamp personId={pid} size={30} />
              <div>
                <strong>{p.name}</strong> <span className="mono">{p.craft} · {p.city}</span>
                <p className="serif">“{best.excerpt}”</p>
                <span className="mono pp-count" style={{ color: led ? accentVar('tangerine') : undefined }}>
                  {stamps.length} stamp{stamps.length > 1 ? 's' : ''} → {led} new {led === 1 ? 'thing' : 'things'} on your board
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ExpandedStamp({ s, onClose, onShow }: { s: PassportStamp; onClose: () => void; onShow: () => void }) {
  const p = person(s.personId)!;
  const kind = s.kind === 'crossing' ? 'a why from a Crossing' : s.kind === 'critique' ? 'a critique on a thread' : 'a stamp left on your board';
  return (
    <>
      <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="stamp-expanded"
        role="dialog"
        aria-label={`Stamp from ${p.name}`}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
      >
        <button className="sp-close" onClick={onClose} aria-label="Close">
          <IconClose size={18} />
        </button>
        <motion.div className="se-stamp" initial={{ scale: 1.4, rotate: -14 }} animate={{ scale: 1, rotate: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
          <Stamp s={s} scale={1.25} />
        </motion.div>
        <div className="se-body">
          <span className="mono-label">{kind} · {QUADRANT_INFO[s.quadrant].numeral} {QUADRANT_INFO[s.quadrant].name}</span>
          <p className="serif se-full">{s.full}</p>
          <span className="mono se-who">{p.name} · {p.craft} · {p.city}</span>
          {s.target && (
            <button className="btn btn-primary" onClick={onShow}>
              show on my board
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}

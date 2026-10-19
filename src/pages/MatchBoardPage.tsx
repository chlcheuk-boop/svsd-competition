import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import BoardView, { connectionMidpoint, type BoardTool } from '../components/board/BoardView';
import { WhyEditor } from '../components/board/WhyEditor';
import { SidePanel } from '../components/board/SidePanel';
import { findLink } from '../components/board/BoardExtras';
import { Avatar, Toolbar, useToast } from '../components/ui/Frame';
import { IconClose, IconOverlay, IconStamp, IconYarn } from '../components/ui/icons';
import { accentVar } from '../components/ui/MiniStamp';
import { Thumb } from '../components/ui/Thumb';
import { QUADRANT_INFO } from '../components/tarot/TarotArt';
import { AnimalMark } from '../components/tarot/Animals';
import { YarnSwatches } from './BoardPage';
import { matchFor } from '../data/matches';
import { person } from '../data/people';
import { KENJI_GIFT_CONNECTION, KENJI_GIFT_MEDIA, KENJI_PASSPORT_STAMP } from '../data/stamps';
import { today, uid, useStore } from '../store/store';
import type { Connection, Media } from '../types';
import type { Pt } from '../lib/geometry';
import { sliceFor } from '../lib/matchSlice';
import './match-board.css';

type Phase = 'idle' | 'waiting' | 'arrived';

export default function MatchBoardPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const mp = matchFor(id);

  const [overlay, setOverlay] = useState(false);
  const [tool, setTool] = useState<BoardTool>(params.get('crossing') ? 'yarn' : 'select');
  const [crossing, setCrossing] = useState(!!params.get('crossing') || state.crossings[id] === 'started');
  const [whyFor, setWhyFor] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [tray, setTray] = useState(false);
  const [stampOpen, setStampOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [drawer, setDrawer] = useState(window.innerWidth > 900);
  // A connection drawn on someone else's board stays pending until its why is written.
  const [pending, setPending] = useState<Connection | null>(null);

  const crossingParam = params.get('crossing');
  useEffect(() => {
    if (crossingParam && state.crossings[id] !== 'complete') {
      setCrossing(true);
      setTool('yarn');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crossingParam, id]);

  const contrib = state.contributions[id] ?? { media: [], connections: [] };

  // you never see their whole board: only the slice where your two boards meet
  const slice = useMemo(
    () => (mp ? sliceFor(mp.quadrant, { media: state.media, connections: state.connections }, mp.board) : null),
    [mp, state.media, state.connections],
  );
  const media = useMemo(() => {
    if (!mp || !slice) return [];
    const list = [...slice.media];
    const have = new Set(list.map((m) => m.id));
    // anything you added in a Crossing stays visible, with the cards your string is tied to
    const pool = [...mp.board.media, ...contrib.media];
    const extraIds = [...contrib.media.map((m) => m.id), ...contrib.connections.flatMap((c) => [c.from, c.to])];
    for (const xid of extraIds) {
      if (have.has(xid)) continue;
      const m = pool.find((x) => x.id === xid);
      if (!m) continue;
      const i = list.length;
      list.push({ ...m, x: (i % slice.cols) * 300, y: Math.floor(i / slice.cols) * 320, rot: 0 });
      have.add(xid);
    }
    return list;
  }, [mp, slice, contrib.media, contrib.connections]);
  const connections = useMemo(() => {
    const ids = new Set(media.map((m) => m.id));
    return [...(slice?.connections ?? []), ...contrib.connections].filter((c) => ids.has(c.from) && ids.has(c.to));
  }, [slice, contrib.connections, media]);
  const byId = useMemo(() => new Map(media.map((m) => [m.id, m])), [media]);

  // only threads that run through the slice are shown
  const sliceThreads = useMemo(
    () => (mp ? mp.threads.filter((t) => t.mediaIds.filter((x) => byId.has(x)).length >= 2) : []),
    [mp, byId],
  );

  const glow = useMemo(() => {
    if (!overlay || !slice) return undefined;
    const g = new Set([...slice.shared].filter((x) => byId.has(x)));
    connections.forEach((c) => g.has(c.from) && g.has(c.to) && g.add(c.id));
    return g;
  }, [overlay, slice, connections, byId]);

  const screenOverlay = useCallback(
    (toScreen: (p: Pt) => Pt) => {
      const c = pending && whyFor === pending.id ? pending : undefined;
      if (!c) return null;
      const mid = connectionMidpoint(c, byId);
      if (!mid) return null;
      return (
        <WhyEditor
          key={c.id}
          at={toScreen(mid)}
          required={crossing}
          title={crossing ? `why, for ${person(id)?.name.split(' ')[0]}?` : undefined}
          onSave={(text) => {
            dispatch({
              type: 'addContribution',
              personId: id,
              connection: { ...c, why: text },
            });
            setWhyFor(null);
            setPending(null);
            setTool('select');
            if (crossing) {
              dispatch({ type: 'patch', patch: { crossings: { ...state.crossings, [id]: 'sent' } } });
              setPhase('waiting');
              window.setTimeout(() => setPhase('arrived'), 2600);
            }
          }}
          onSkip={() => {
            setWhyFor(null);
            setPending(null);
          }}
        />
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [whyFor, pending, byId, crossing, id, state.crossings],
  );

  const shownConnections = useMemo(() => (pending ? [...connections, pending] : connections), [connections, pending]);

  if (!mp) return <Navigate to="/matches" replace />;
  const p = person(id)!;
  const info = QUADRANT_INFO[mp.quadrant];
  const first = p.name.split(' ')[0];
  const crossingDone = state.crossings[id] === 'complete';
  const alreadyTied = contrib.connections.length > 0;

  const onConnect = (from: string, to: string) => {
    if (findLink(connections, from, to)) return toast({ text: 'these two are already tied' });
    if (crossing && alreadyTied) return toast({ text: 'one string per Crossing. make it count.' });
    const c: Connection = { id: uid('x'), from, to, color: state.yarnColor, addedAt: today(), via: 'maya' };
    setPending(c);
    setWhyFor(c.id);
  };

  const bringOne = (m: Media) => {
    const copy: Media = {
      ...m, id: uid('mm'), x: 1360, y: 300, rot: -2.5, via: 'maya',
      origin: m.origin ? `from Maya’s board: ${m.origin}` : 'from Maya’s board', addedAt: today(),
    };
    dispatch({ type: 'addContribution', personId: id, media: copy });
    setTray(false);
    setTool('yarn');
    toast({ text: `placed on ${first}’s board · now tie it in` });
  };

  const receiveGift = () => {
    if (id === 'kenji') {
      if (!state.media.some((m) => m.id === KENJI_GIFT_MEDIA.id)) dispatch({ type: 'addMedia', media: KENJI_GIFT_MEDIA });
      if (!state.connections.some((c) => c.id === KENJI_GIFT_CONNECTION.id)) dispatch({ type: 'addConnection', connection: KENJI_GIFT_CONNECTION });
      dispatch({ type: 'addStamp', stamp: KENJI_PASSPORT_STAMP });
    }
    const mine = contrib.connections[0];
    dispatch({
      type: 'addThread',
      thread: {
        id: `jt-${id}`, owner: 'maya', coAuthor: id, title: `Crossing with ${first}`,
        intro: 'A shared thread space. Keep building it together.',
        mediaIds: mine ? [mine.from, mine.to, 'm1', 'mk1'] : ['m1', 'mk1'],
        publishedAt: today(), isPublic: false,
      },
    });
    dispatch({ type: 'patch', patch: { crossings: { ...state.crossings, [id]: 'complete' } } });
    dispatch({ type: 'setMatch', id, patch: { status: 'crossed' } });
    nav(id === 'kenji' ? `/?focus=connection:${KENJI_GIFT_CONNECTION.id}` : '/');
  };

  const selectedMedia = selected ? byId.get(selected) : undefined;

  return (
    <>
      <BoardView
        key={id}
        maskPrefix={`m-${id}`}
        media={media}
        connections={shownConnections}
        tool={tool}
        yarnColor={state.yarnColor}
        editable={false}
        onConnect={onConnect}
        onCardClick={(cid) => setSelected((s) => (s === cid ? null : cid))}
        onBackgroundClick={() => setSelected(null)}
        selectedId={selected}
        glow={glow}
        badges={slice?.notes}
        screenOverlay={screenOverlay}
      />

      <div className="mb-header">
        <Avatar size={36} label={p.initial} color={accentVar(p.color)} ink={p.color === 'tangerine' || p.color === 'pink' ? '#fff' : 'var(--ink)'} />
        <div>
          <strong>Where you meet {first}</strong>
          <span className="mono">{p.craft} · {p.city} · {info.numeral} {info.name}</span>
          <span className="mono mb-slice">
            {slice?.media.length} of {slice?.total} references · {slice?.summary}
          </span>
        </div>
        <span className="mb-animal" style={{ background: accentVar(info.accent) }}>
          <AnimalMark q={mp.quadrant} size={26} color="var(--ink)" cut={accentVar(info.accent)} />
        </span>
      </div>

      <AnimatePresence>
        {crossing && !crossingDone && (
          <motion.div className="crossing-banner" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}>
            <span className="mono-label">crossing with {first}</span>
            <p className="serif">
              Add <em>one</em> string to {first}’s board. Tie two of their cards, or bring one of yours. A why is required.
            </p>
            <div className="crossing-steps mono">
              <span className={alreadyTied ? 'done' : 'now'}>1 · your string</span>
              <span className={phase === 'arrived' ? 'done' : alreadyTied ? 'now' : ''}>2 · {first}’s string</span>
            </div>
            {!alreadyTied && (
              <button className="btn btn-ghost" onClick={() => setTray((t) => !t)}>
                bring one of yours
              </button>
            )}
            <AnimatePresence>
              {tray && (
                <motion.div className="tray" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  {state.media.filter((m) => !m.via).slice(0, 12).map((m) => (
                    <button key={m.id} className="tray-item" onClick={() => bringOne(m)} title={m.title}>
                      <Thumb m={m} size={54} title={false} />
                      <span className="mono">{m.title}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawer && (
          <motion.aside className="threads-drawer" initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 320 }}>
            <button className="sp-close" onClick={() => setDrawer(false)} aria-label="Close threads">
              <IconClose size={16} />
            </button>
            <span className="mono-label">{first}’s threads</span>
            {sliceThreads.length === 0 && <p className="mono drawer-bio">{first}’s threads stay private until a thread runs through where you meet.</p>}
            {sliceThreads.map((t) => (
              <Link key={t.id} to={`/thread/${t.id}`} className="drawer-thread">
                <div className="drawer-thumbs">
                  {t.mediaIds.slice(0, 4).map((mid) => byId.get(mid) && <Thumb key={mid} m={byId.get(mid)!} size={40} title={false} />)}
                </div>
                <strong className="serif">{t.title}</strong>
                {t.intro && <span className="serif drawer-intro">{t.intro}</span>}
                <span className="mono">{t.mediaIds.length} references · read →</span>
              </Link>
            ))}
            <p className="mono drawer-bio">“{mp.bio}”</p>
          </motion.aside>
        )}
      </AnimatePresence>
      {!drawer && (
        <button className="drawer-tab mono" onClick={() => setDrawer(true)}>
          threads ({sliceThreads.length})
        </button>
      )}

      <AnimatePresence>
        {selectedMedia && (
          <SidePanel
            key={selectedMedia.id}
            m={selectedMedia}
            media={media}
            connections={connections}
            stamps={[]}
            ripplePerson={null}
            onClose={() => setSelected(null)}
            onJump={setSelected}
            onRipple={() => {}}
            readOnly
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stampOpen && <StampComposer name={first} onClose={() => setStampOpen(false)} onPress={(text) => {
          setStampOpen(false);
          toast({ text: `stamp pressed onto ${first}’s board · “${text.slice(0, 32)}${text.length > 32 ? '…' : ''}”` }, 4000);
        }} />}
      </AnimatePresence>

      <AnimatePresence>
        {phase !== 'idle' && (
          <CrossingModal
            phase={phase}
            personId={id}
            onSee={receiveGift}
            onStay={() => {
              setPhase('idle');
              setCrossing(false);
            }}
          />
        )}
      </AnimatePresence>

      <Toolbar
        tools={[
          { id: 'overlay', label: 'what’s shared', icon: <IconOverlay />, active: overlay, onClick: () => setOverlay((o) => !o) },
          {
            id: 'yarn', label: crossing ? 'yarn · crossing' : 'yarn', icon: <IconYarn />, active: tool === 'yarn',
            onClick: () => {
              if (!crossing && !crossingDone) {
                setCrossing(true);
                toast({ text: `starting a Crossing with ${first}` });
              }
              setTool((t) => (t === 'yarn' ? 'select' : 'yarn'));
            },
          },
          { id: 'stamp', label: 'leave a stamp', icon: <IconStamp />, active: stampOpen, onClick: () => setStampOpen((o) => !o) },
        ]}
      >
        {tool === 'yarn' && <YarnSwatches key="sw" value={state.yarnColor} onChange={(c) => dispatch({ type: 'patch', patch: { yarnColor: c } })} />}
      </Toolbar>
    </>
  );
}

function StampComposer({ name, onClose, onPress }: { name: string; onClose: () => void; onPress: (t: string) => void }) {
  const [text, setText] = useState('');
  const [pressing, setPressing] = useState(false);
  return (
    <>
      <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="stamp-composer"
        role="dialog"
        aria-label={`Leave a stamp for ${name}`}
        initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
        animate={pressing ? { scale: [1, 1.12, 0.94, 1], rotate: [-4, -4, -6, -5] } : { scale: 1, opacity: 1, rotate: -4 }}
        exit={{ scale: 0.6, opacity: 0, y: -40 }}
        transition={{ duration: pressing ? 0.45 : 0.35 }}
      >
        <span className="mono stamp-ring-label">a note for {name.toLowerCase()} · lands in their passport</span>
        <textarea
          autoFocus
          className="serif"
          placeholder="what did their board make you see?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={160}
        />
        <button
          className="btn btn-primary"
          disabled={!text.trim()}
          onClick={() => {
            setPressing(true);
            window.setTimeout(() => onPress(text.trim()), 460);
          }}
        >
          press the stamp
        </button>
      </motion.div>
    </>
  );
}

function CrossingModal({ phase, personId, onSee, onStay }: { phase: Phase; personId: string; onSee: () => void; onStay: () => void }) {
  const p = person(personId)!;
  const first = p.name.split(' ')[0];
  return (
    <>
      <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div className="crossing-modal" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} role="dialog" aria-live="polite">
        {phase === 'waiting' ? (
          <>
            <svg width="160" height="60" viewBox="0 0 160 60" aria-hidden="true">
              <motion.path
                d="M10 30 C 40 0, 60 60, 80 30 S 120 0, 150 30"
                fill="none"
                stroke="var(--tangerine)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 1], pathOffset: [0, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
            <p className="serif">Your string is on {first}’s board.</p>
            <span className="mono">{first} is tying one onto yours…</span>
          </>
        ) : (
          <>
            <Avatar size={56} label={p.initial} color={accentVar(p.color)} ink="#fff" />
            <span className="mono-label">crossing complete</span>
            <p className="serif">{first} tied a string on your board.</p>
            {personId === 'kenji' && <blockquote className="serif">“{KENJI_GIFT_CONNECTION.why?.replace('Kenji: ', '')}”</blockquote>}
            <span className="mono">a shared thread space is open for you both · his why is now a passport stamp</span>
            <div className="crossing-actions">
              <button className="btn btn-primary" onClick={onSee}>see it on your board</button>
              <button className="btn btn-quiet" onClick={onStay}>stay here</button>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BoardView, { connectionMidpoint, type BoardTool, type FocusRequest } from '../components/board/BoardView';
import { WhyEditor } from '../components/board/WhyEditor';
import { NoteComposer } from '../components/board/NoteComposer';
import { SidePanel } from '../components/board/SidePanel';
import { FirstArrow, ReplayBar, ThreadComposer, findLink, useReplay } from '../components/board/BoardExtras';
import { Toolbar, useToast } from '../components/ui/Frame';
import { IconNote, IconScissors, IconThread, IconYarn } from '../components/ui/icons';
import { ThreadsDrawer, THREAD_COLORS } from '../components/board/ThreadsDrawer';
import { Tutorial } from '../components/board/Tutorial';
import { accentVar } from '../components/ui/MiniStamp';
import { today, uid, useStore } from '../store/store';
import { sizeOf, type Pt } from '../lib/geometry';
import type { Accent, Connection, Media } from '../types';

export const YARN_COLORS: Accent[] = ['tangerine', 'pink', 'lime', 'sky', 'peach', 'ink'];

export function YarnSwatches({ value, onChange }: { value: Accent; onChange: (c: Accent) => void }) {
  return (
    <motion.div
      className="tool-popover"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 10, opacity: 0 }}
      role="radiogroup"
      aria-label="Yarn color"
    >
      <span className="mono-label">yarn</span>
      {YARN_COLORS.map((c) => (
        <button
          key={c}
          className="swatch"
          style={{ background: accentVar(c) }}
          aria-pressed={value === c}
          aria-label={c}
          onClick={() => onChange(c)}
        />
      ))}
    </motion.div>
  );
}

type Mode = BoardTool | 'note';

export default function BoardPage() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();

  const [mode, setMode] = useState<Mode>('select');
  const [whyFor, setWhyFor] = useState<{ id: string; isNew: boolean } | null>(null);
  const [draft, setDraft] = useState<Media | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [composeThread, setComposeThread] = useState(false);
  const [ripple, setRipple] = useState<string | null>(null);
  const [replayIdx, setReplayIdx] = useState<number | null>(null);
  const [focus, setFocus] = useState<FocusRequest | null>(null);
  const [threadsView, setThreadsView] = useState(false);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [frame, setFrame] = useState<{ ids: string[]; nonce: number } | null>(null);

  const dates = useReplay(state.media, state.connections);

  /* deep links: ?focus=connection:id, ?replay=1 */
  useEffect(() => {
    const f = params.get('focus');
    const r = params.get('replay');
    if (f) {
      const [kind, id] = f.split(':') as ['connection' | 'media', string];
      setFocus({ kind, id, nonce: Date.now() });
    }
    if (r) setReplayIdx(0);
    if (f || r) setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* undo history for strings: what Ctrl+Z walks back */
  const history = useRef<Array<{ kind: 'add'; id: string } | { kind: 'snip'; connections: Connection[] }>>([]);

  const undo = () => {
    const last = history.current.pop();
    if (!last) return toast({ text: 'nothing to undo' });
    if (last.kind === 'add') {
      dispatch({ type: 'removeConnections', ids: [last.id] });
      if (whyFor?.id === last.id) setWhyFor(null);
      toast({ text: 'undid · string removed' });
    } else {
      dispatch({ type: 'restoreConnections', connections: last.connections });
      toast({ text: 'undid · string tied back' });
    }
  };

  /* keyboard tool shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (target.closest?.('input, textarea')) {
        // an empty why tag means the string itself is what you want to undo
        const emptyWhy = target.id === 'why-input' && !(target as HTMLTextAreaElement).value;
        if (!(mod && key === 'z' && !e.shiftKey && emptyWhy)) return;
      }
      if (mod) {
        if (key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (key === 's') {
          e.preventDefault();
          pickTool('scissors', true);
        } else if (key === 'y') {
          e.preventDefault();
          pickTool('yarn', true);
        } else if (key === 'n') {
          e.preventDefault();
          pickTool('note', true);
        }
        return;
      }
      if (key === 'y') pickTool('yarn');
      if (key === 'x') pickTool('scissors');
      if (key === 'n') pickTool('note');
      if (key === 't') toggleThreads();
      if (e.key === 'Escape') {
        setMode('select');
        setDraft(null);
        setPath([]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const dismissArrow = () => !state.arrowSeen && dispatch({ type: 'patch', patch: { arrowSeen: true } });

  const pickTool = (t: Mode, force = false) => {
    dismissArrow();
    setWhyFor(null);
    setDraft(null);
    setMode((m) => (m === t && !force ? 'select' : t));
  };

  /* replay filtering */
  const replayDate = replayIdx !== null ? dates[replayIdx] : null;
  const visibleMedia = useMemo(
    () => (replayDate ? state.media.filter((m) => m.addedAt <= replayDate) : state.media),
    [state.media, replayDate],
  );
  const visibleConns = useMemo(() => {
    if (!replayDate) return state.connections;
    const ids = new Set(visibleMedia.map((m) => m.id));
    return state.connections.filter((c) => c.addedAt <= replayDate && ids.has(c.from) && ids.has(c.to));
  }, [state.connections, visibleMedia, replayDate]);

  /* threads view: each of Maya's threads traced in its own color */
  const myThreads = useMemo(() => state.threads.filter((t) => t.owner === 'maya'), [state.threads]);
  const threadParts = useMemo(
    () =>
      myThreads.map((t, i) => {
        const ids = t.mediaIds.filter((id) => state.media.some((m) => m.id === id));
        const connectionIds = ids
          .slice(1)
          .map((id, k) => findLink(state.connections, ids[k], id)?.id)
          .filter(Boolean) as string[];
        return { thread: t, ids, connectionIds, color: THREAD_COLORS[i % THREAD_COLORS.length] };
      }),
    [myThreads, state.media, state.connections],
  );
  const shownParts = threadsView ? threadParts.filter((p) => !activeThread || p.thread.id === activeThread) : [];
  const traces = shownParts.map((p) => ({ connectionIds: p.connectionIds, color: p.color }));

  function toggleThreads() {
    dismissArrow();
    setActiveThread(null);
    if (!threadsView) setFrame({ ids: threadParts.flatMap((p) => p.ids), nonce: Date.now() });
    setThreadsView(!threadsView);
  }

  const pickThread = (id: string | null) => {
    setActiveThread(id);
    const part = threadParts.find((p) => p.thread.id === id);
    setFrame({ ids: part ? part.ids : threadParts.flatMap((p) => p.ids), nonce: Date.now() });
  };

  /* ripple emphasis */
  const emphasis = useMemo(() => {
    if (!ripple && threadsView) {
      const s = new Set<string>();
      shownParts.forEach((p) => {
        p.ids.forEach((id) => s.add(id));
        p.connectionIds.forEach((id) => s.add(id));
      });
      return s;
    }
    if (!ripple) return null;
    const s = new Set<string>();
    state.media.forEach((m) => m.via === ripple && s.add(m.id));
    state.connections.forEach((c) => {
      if (c.via === ripple) {
        s.add(c.id);
        s.add(c.from);
        s.add(c.to);
      }
    });
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ripple, state.media, state.connections, threadsView, activeThread, threadParts]);

  /* actions */
  const onConnect = (from: string, to: string) => {
    if (findLink(state.connections, from, to)) {
      toast({ text: 'these two are already tied' });
      return;
    }
    const c: Connection = { id: uid('c'), from, to, color: state.yarnColor, addedAt: today() };
    dispatch({ type: 'addConnection', connection: c });
    history.current.push({ kind: 'add', id: c.id });
    setWhyFor({ id: c.id, isNew: true });
  };

  const onSnip = (ids: string[]) => {
    const removed = state.connections.filter((c) => ids.includes(c.id));
    dispatch({ type: 'removeConnections', ids });
    history.current.push({ kind: 'snip', connections: removed });
    if (whyFor && ids.includes(whyFor.id)) setWhyFor(null);
    toast(
      { text: 'snipped', action: { label: 'undo', run: () => dispatch({ type: 'restoreConnections', connections: removed }) } },
      5000,
    );
  };

  const onPlace = (pt: Pt) => {
    if (!draft) return;
    const { w, h } = sizeOf(draft);
    const m = { ...draft, x: Math.round(pt.x - w / 2), y: Math.round(pt.y - h / 2) };
    dispatch({ type: 'addMedia', media: m });
    setDraft(null);
    setMode('select');
    toast({ text: 'placed · now tie it to something with yarn' });
  };

  const onCardClick = (id: string, { shift }: { shift: boolean }) => {
    if (shift) {
      setSelected(null);
      setPath((p) => (p.includes(id) ? p.slice(0, p.indexOf(id)) : [...p, id]));
      return;
    }
    setPath([]);
    setSelected((s) => (s === id ? null : id));
  };

  const autoThreadFrom = (start: string) => {
    const seq = [start];
    let cur = start;
    for (;;) {
      const next = state.connections
        .filter((c) => c.from === cur || c.to === cur)
        .map((c) => ({ id: c.from === cur ? c.to : c.from, why: !!c.why }))
        .filter((n) => !seq.includes(n.id))
        .sort((a, b) => Number(b.why) - Number(a.why))[0];
      if (!next) break;
      seq.push(next.id);
      cur = next.id;
    }
    if (seq.length < 2) {
      toast({ text: 'tie this card to something first: a thread just needs a string' });
      return;
    }
    setPath(seq);
    setSelected(null);
    setComposeThread(true);
  };

  const pathBroken = path.findIndex((id, i) => i > 0 && !findLink(state.connections, path[i - 1], id));

  const publishThread = (title: string, intro: string) => {
    const id = uid('t');
    dispatch({
      type: 'addThread',
      thread: { id, owner: 'maya', title, intro: intro || undefined, mediaIds: path, publishedAt: today(), isPublic: true },
    });
    setComposeThread(false);
    setPath([]);
    nav(`/thread/${id}`);
  };

  const whyConn = whyFor ? state.connections.find((c) => c.id === whyFor.id) : undefined;
  const byId = useMemo(() => new Map(state.media.map((m) => [m.id, m])), [state.media]);
  const selectedMedia = selected ? byId.get(selected) : undefined;

  const screenOverlay = useCallback(
    (toScreen: (p: Pt) => Pt) => {
      if (!whyConn || !whyFor) return null;
      const mid = connectionMidpoint(whyConn, byId);
      if (!mid) return null;
      return (
        <AnimatePresence>
          <WhyEditor
            key={whyConn.id}
            at={toScreen(mid)}
            initial={whyConn.why}
            onSave={(text) => {
              dispatch({ type: 'updateConnection', id: whyConn.id, patch: { why: text } });
              setWhyFor(null);
              if (whyFor.isNew) toast({ text: 'tied · the tag is hanging on the string' });
            }}
            onSkip={() => setWhyFor(null)}
            onRemove={!whyFor.isNew && whyConn.why ? () => {
              dispatch({ type: 'updateConnection', id: whyConn.id, patch: { why: undefined } });
              setWhyFor(null);
            } : undefined}
          />
        </AnimatePresence>
      );
    },
    [whyConn, whyFor, byId, dispatch, toast],
  );

  const boardTool: BoardTool = mode === 'note' ? 'select' : mode;

  return (
    <>
      <BoardView
        maskPrefix="mine"
        media={visibleMedia}
        connections={visibleConns}
        tool={boardTool}
        yarnColor={state.yarnColor}
        onMove={(id, x, y) => dispatch({ type: 'moveMedia', id, x, y })}
        onConnect={onConnect}
        onSnip={onSnip}
        onCardClick={onCardClick}
        onPlace={onPlace}
        onTagClick={(id) => setWhyFor({ id, isNew: false })}
        onBackgroundClick={() => {
          setSelected(null);
          setWhyFor(null);
        }}
        selectedId={selected}
        pathSelection={threadsView && activeThread && !path.length ? shownParts[0]?.ids ?? [] : path}
        emphasis={emphasis}
        focus={focus}
        frame={frame}
        traces={traces}
        placeGhost={mode === 'place' ? draft : null}
        screenOverlay={screenOverlay}
      />

      {mode === 'yarn' && !whyFor && <div className="board-hint mono">click a card, then another, to tie them · esc to drop the thread</div>}
      {mode === 'scissors' && <div className="board-hint mono">click a string to snip it · drag across several</div>}
      {mode === 'place' && <div className="board-hint mono">click anywhere to drop your reference</div>}

      <AnimatePresence>
        {path.length > 0 && !composeThread && (
          <motion.div className="path-bar" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
            <span>
              {path.length} in a row{' '}
              <span className="mono">
                {pathBroken > 0 ? `· ${pathBroken} and ${pathBroken + 1} aren't tied` : path.length < 2 ? '· shift-click a card tied to this one' : '· ready'}
              </span>
            </span>
            <button className="btn btn-quiet" onClick={() => setPath([])}>clear</button>
            <button className="btn btn-primary" disabled={path.length < 2 || pathBroken > 0} onClick={() => setComposeThread(true)}>
              make a thread
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMedia && (
          <SidePanel
            key={selectedMedia.id}
            m={selectedMedia}
            media={state.media}
            connections={state.connections}
            stamps={state.stamps}
            ripplePerson={ripple}
            onClose={() => {
              setSelected(null);
              setRipple(null);
            }}
            onJump={(id) => {
              setSelected(id);
              setFocus({ kind: 'media', id, nonce: Date.now() });
            }}
            onRipple={setRipple}
            onMakeThread={() => autoThreadFrom(selectedMedia.id)}
            onReplay={() => {
              setSelected(null);
              setReplayIdx(0);
            }}
            onWhy={(text) => dispatch({ type: 'updateMedia', id: selectedMedia.id, patch: { why: text || undefined } })}
            onRemove={() => {
              dispatch({ type: 'removeMedia', id: selectedMedia.id });
              setSelected(null);
              toast({ text: 'removed from board' });
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {composeThread && (
          <ThreadComposer
            path={path}
            media={state.media}
            connections={state.connections}
            onPublish={publishThread}
            onCancel={() => setComposeThread(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mode === 'note' && (
          <NoteComposer
            onCancel={() => setMode('select')}
            onDone={(d) => {
              setDraft(d);
              setMode('place');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {replayIdx !== null && (
          <ReplayBar
            dates={dates}
            index={replayIdx}
            onIndex={setReplayIdx}
            onClose={() => setReplayIdx(null)}
            counts={{ media: visibleMedia.length, strings: visibleConns.length }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {threadsView && (
          <ThreadsDrawer
            parts={threadParts}
            active={activeThread}
            onPick={pickThread}
            onOpen={(id) => nav(`/thread/${id}`)}
            onClose={toggleThreads}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{state.tutorialSeen && !state.arrowSeen && <FirstArrow onDismiss={dismissArrow} />}</AnimatePresence>
      {!state.tutorialSeen && (
        <Tutorial onDone={() => dispatch({ type: 'patch', patch: { tutorialSeen: true, arrowSeen: true } })} />
      )}

      <Toolbar
        tools={[
          { id: 'yarn', label: 'yarn', icon: <IconYarn />, active: mode === 'yarn', onClick: () => pickTool('yarn') },
          { id: 'scissors', label: 'scissors', icon: <IconScissors />, active: mode === 'scissors', onClick: () => pickTool('scissors') },
          { id: 'note', label: 'note', icon: <IconNote />, active: mode === 'note' || mode === 'place', onClick: () => pickTool('note') },
          { id: 'threads', label: 'threads', icon: <IconThread />, active: threadsView, onClick: toggleThreads },
        ]}
      >
        {mode === 'yarn' && (
          <YarnSwatches key="sw" value={state.yarnColor} onChange={(c) => dispatch({ type: 'patch', patch: { yarnColor: c } })} />
        )}
      </Toolbar>
    </>
  );
}

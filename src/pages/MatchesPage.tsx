import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MATCHES } from '../data/matches';
import { person } from '../data/people';
import { useStore } from '../store/store';
import { Avatar, Toolbar, useToast } from '../components/ui/Frame';
import { IconBookmark, IconClose, IconQuadrants, IconShuffle, IconTicket } from '../components/ui/icons';
import { QUADRANT_INFO, TarotBack, TarotIllustration } from '../components/tarot/TarotArt';
import { Thumb } from '../components/ui/Thumb';
import { AnimalMark, ANIMAL_NAME } from '../components/tarot/Animals';
import { accentVar } from '../components/ui/MiniStamp';
import type { MatchProfile, Quadrant } from '../types';
import { useViewport } from '../lib/useViewport';
import './matches.css';

const CARD_W = 172;
const illoColor = (q: Quadrant) => (q === 2 ? 'var(--tangerine)' : 'var(--ink)');

function SmallFace({ mp }: { mp: MatchProfile }) {
  const p = person(mp.personId)!;
  const info = QUADRANT_INFO[mp.quadrant];
  return (
    <div className="tarot-face small">
      <span className="tarot-numeral">{info.numeral}</span>
      <div className="tarot-art">
        <TarotIllustration q={mp.quadrant} color={illoColor(mp.quadrant)} size={0.9} />
      </div>
      <div className="tarot-who">
        <Avatar size={30} label={p.initial} color={accentVar(p.color)} ink={p.color === 'tangerine' || p.color === 'pink' ? '#fff' : 'var(--ink)'} />
        <div>
          <strong>{p.name.split(' ')[0]}</strong>
          <span className="mono">{p.craft} · {p.city}</span>
        </div>
      </div>
      <span className="tarot-name">{info.name}</span>
    </div>
  );
}

function TarotCard({
  cardW, mp, flipped, dimmed, index, dealt, onClick, passed,
}: {
  cardW: number; mp: MatchProfile; flipped: boolean; dimmed: boolean; index: number; dealt: boolean; onClick: () => void; passed: boolean;
}) {
  const info = QUADRANT_INFO[mp.quadrant];
  const p = person(mp.personId)!;
  return (
    <motion.button
      className={`tarot ${dimmed ? 'dimmed' : ''} ${passed ? 'passed' : ''}`}
      style={{ width: cardW, height: Math.round(cardW * 1.75) }}
      initial={dealt ? false : { x: (1.5 - index) * 60, y: 520, rotate: -20 + index * 12, opacity: 0 }}
      animate={{ x: 0, y: 0, rotate: [-1.5, 1, -0.5, 1.2][index], opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 17, delay: dealt ? 0 : 0.25 + index * 0.18 }}
      whileHover={{ y: -6, rotate: 0 }}
      onClick={onClick}
      aria-label={flipped ? `${info.numeral} ${info.name}: ${p.name}. Open` : `${info.numeral}: face-down card. Flip`}
    >
      <motion.div
        className="tarot-inner"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
      >
        <div className="tarot-side back">
          <TarotBack q={mp.quadrant} />
        </div>
        <div className="tarot-side front">
          <SmallFace mp={mp} />
        </div>
      </motion.div>
      {passed && <span className="passed-stamp mono">passed</span>}
    </motion.button>
  );
}

function FocusCard({ mp, onClose, onPass, onCross, onView }: {
  mp: MatchProfile; onClose: () => void; onPass: () => void; onCross: () => void; onView: () => void;
}) {
  const p = person(mp.personId)!;
  const info = QUADRANT_INFO[mp.quadrant];
  const byId = new Map(mp.board.media.map((m) => [m.id, m]));
  const phone = window.innerWidth < 640;
  const fitH = Math.min(800, window.innerHeight - (phone ? 120 : 190), (window.innerWidth - 24) * 1.75);
  const h = phone ? fitH : Math.max(520, fitH);
  const w = Math.round(h / 1.75);
  const scale = h / 800;
  return (
    <motion.div
      className="focus-layer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.article
        className="tarot-focus"
        style={{ width: w, height: h }}
        initial={{ scale: 0.6, rotate: -6, y: 60 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        exit={{ scale: 0.7, rotate: 4, y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`${info.name}: ${p.name}`}
      >
        <div className="focus-inner" style={{ transform: `scale(${scale})`, width: 457, height: 800 }}>
          <button className="focus-close" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
          <span className="tarot-numeral big">{info.numeral}</span>
          <div className="focus-art">
            <TarotIllustration q={mp.quadrant} color={illoColor(mp.quadrant)} size={1.05} />
          </div>
          <div className="focus-who">
            <Avatar size={48} label={p.initial} color={accentVar(p.color)} ink={p.color === 'tangerine' || p.color === 'pink' ? '#fff' : 'var(--ink)'} />
            <div>
              <h2 className="serif">{p.name}</h2>
              <span className="mono">{p.craft} · {p.city}</span>
            </div>
          </div>
          <p className="focus-intro serif">{mp.intro}</p>
          <span className="mono focus-shape">story shape: {info.story}</span>

          <div className="focus-overlap">
            <div>
              <span className="mono-label">where you overlap</span>
              <div className="thumbs">
                {mp.overlap.length ? mp.overlap.map((id) => <Thumb key={id} m={byId.get(id)!} size={60} />) : (
                  <span className="serif empty-overlap">nothing yet, and that’s the point</span>
                )}
              </div>
            </div>
            <div>
              <span className="mono-label">where you split</span>
              <div className="thumbs">
                {mp.split.map((id) => <Thumb key={id} m={byId.get(id)!} size={60} />)}
              </div>
            </div>
          </div>

          {mp.experience && (
            <div className="ticket">
              <IconTicket size={18} />
              <div>
                <span className="mono">try together</span>
                <p className="serif">{mp.experience.title}</p>
                <span className="mono">{mp.experience.where} · {mp.experience.when}</span>
              </div>
              <span className="ticket-stub mono">admit<br />two</span>
            </div>
          )}

          <div className="focus-actions">
            <button className="btn btn-primary" onClick={onCross}>Start a Crossing</button>
            <button className="btn btn-ghost" onClick={onView}>See where you meet</button>
            <button className="btn btn-quiet" onClick={onPass}>Pass</button>
          </div>
          <span className="tarot-name big">{info.name}</span>
        </div>
      </motion.article>
    </motion.div>
  );
}

export default function MatchesPage() {
  const vp = useViewport();
  const cardW = vp.phone ? Math.min(CARD_W, Math.floor((vp.w - 24) / 2 - 22)) : CARD_W;
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [focus, setFocus] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<Record<Quadrant, boolean>>({ 1: true, 2: true, 3: true, 4: true });
  const [dealt] = useState(state.matchesDealt);
  const [dealKey, setDealKey] = useState(0);

  useEffect(() => {
    dispatch({ type: 'patch', patch: { matchesSeen: true, matchesDealt: true } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ordered = [...MATCHES].sort((a, b) => a.quadrant - b.quadrant);
  const allFlipped = ordered.every((m) => state.matchState[m.personId]?.flipped);
  const focused = ordered.find((m) => m.personId === focus);

  const flipAll = () => {
    if (allFlipped) {
      ordered.forEach((m) => dispatch({ type: 'setMatch', id: m.personId, patch: { flipped: false } }));
      setDealKey((k) => k + 1);
      return;
    }
    ordered.forEach((m, i) =>
      window.setTimeout(() => dispatch({ type: 'setMatch', id: m.personId, patch: { flipped: true } }), i * 160),
    );
  };

  return (
    <div className="matches-page paper-grain">
      <header className="matches-head">
        <span className="mono-label">week of oct 12 · 2026</span>
        <h1 className="serif">Matches of the week</h1>
        <p className="serif">
          Not a feed. Four people, picked from a small circle, each here to add something to your life. Read from what you <em>collect</em> and how you <em>connect</em> it.
        </p>
        <ul className="legend">
          {ordered.map((m) => {
            const info = QUADRANT_INFO[m.quadrant];
            return (
              <li key={m.quadrant}>
                <span className="legend-badge" style={{ background: accentVar(info.accent) }}>
                  <AnimalMark q={m.quadrant} size={20} color="var(--ink)" cut={accentVar(info.accent)} />
                </span>
                <span className="mono">{info.numeral}</span> {info.name} <span className="mono legend-axis">{ANIMAL_NAME[m.quadrant]} · {info.story}</span>
              </li>
            );
          })}
        </ul>
      </header>

      <div className="tarot-field" style={vp.phone ? { height: 2 * (Math.round(cardW * 1.75) + 44) } : undefined}>
        <div className="axis axis-x" aria-hidden="true">
          <span className="mono axis-end left">similar</span>
          <span className="mono axis-title">how you connect →</span>
          <span className="mono axis-end right">different</span>
        </div>
        <div className="axis axis-y" aria-hidden="true">
          <span className="mono axis-end top">similar</span>
          <span className="mono axis-title">what you collect →</span>
          <span className="mono axis-end bottom">different</span>
        </div>
        <div className="tarot-grid" key={dealKey}>
          {ordered.map((mp, i) => {
            const st = state.matchState[mp.personId] ?? { flipped: false, status: 'new' };
            return (
              <div key={mp.personId} className={`tarot-cell q${mp.quadrant}`}>
                <TarotCard
                  cardW={cardW}
                  mp={mp}
                  index={i}
                  dealt={dealt && dealKey === 0}
                  flipped={st.flipped}
                  passed={st.status === 'passed'}
                  dimmed={!filter[mp.quadrant] || (!!focus && focus !== mp.personId)}
                  onClick={() => {
                    if (!filter[mp.quadrant]) return;
                    if (!st.flipped) dispatch({ type: 'setMatch', id: mp.personId, patch: { flipped: true } });
                    else setFocus(mp.personId);
                  }}
                />
                {st.status === 'saved' && <span className="saved-flag mono">saved</span>}
                {st.status === 'crossed' && <span className="saved-flag mono crossed">crossed</span>}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {focused && (
          <FocusCard
            key={focused.personId}
            mp={focused}
            onClose={() => setFocus(null)}
            onPass={() => {
              dispatch({ type: 'setMatch', id: focused.personId, patch: { status: 'passed' } });
              setFocus(null);
              toast({ text: `passed on ${person(focused.personId)!.name.split(' ')[0]}`, action: { label: 'undo', run: () => dispatch({ type: 'setMatch', id: focused.personId, patch: { status: 'new' } }) } });
            }}
            onCross={() => nav(`/match/${focused.personId}?crossing=1`)}
            onView={() => nav(`/match/${focused.personId}`)}
          />
        )}
      </AnimatePresence>

      <Toolbar
        tools={[
          { id: 'reveal', label: allFlipped ? 'shuffle' : 'reveal all', icon: <IconShuffle />, onClick: flipAll },
          { id: 'filter', label: 'quadrants', icon: <IconQuadrants />, active: filterOpen, onClick: () => setFilterOpen((o) => !o) },
          {
            id: 'save', label: 'save for later', icon: <IconBookmark />, disabled: !focused,
            onClick: () => {
              if (!focused) return;
              dispatch({ type: 'setMatch', id: focused.personId, patch: { status: 'saved' } });
              toast({ text: `saved ${person(focused.personId)!.name.split(' ')[0]} for later` });
              setFocus(null);
            },
          },
        ]}
      >
        {filterOpen && (
          <motion.div key="f" className="tool-popover" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>
            <span className="mono-label">show</span>
            {([1, 2, 3, 4] as Quadrant[]).map((q) => (
              <button
                key={q}
                className="chip"
                aria-pressed={filter[q]}
                onClick={() => setFilter((f) => ({ ...f, [q]: !f[q] }))}
                style={filter[q] ? { background: accentVar(QUADRANT_INFO[q].accent), color: 'var(--ink)', borderColor: 'transparent' } : undefined}
              >
                {QUADRANT_INFO[q].numeral} · {QUADRANT_INFO[q].name.replace('The ', '')}
              </button>
            ))}
          </motion.div>
        )}
      </Toolbar>
    </div>
  );
}

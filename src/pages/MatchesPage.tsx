import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MATCHES } from '../data/matches';
import { person } from '../data/people';
import { useStore } from '../store/store';
import { Avatar, useToast } from '../components/ui/Frame';
import { IconClose, IconTicket } from '../components/ui/icons';
import { QUADRANT_INFO, TarotBack, TarotIllustration } from '../components/tarot/TarotArt';
import { Thumb } from '../components/ui/Thumb';
import { AnimalMark } from '../components/tarot/Animals';
import { accentVar } from '../components/ui/MiniStamp';
import type { MatchProfile, Quadrant } from '../types';
import { useViewport } from '../lib/useViewport';
import './matches.css';

const CARD_W = 172;
// every quadrant's mark prints in the same brown ink
const illoColor = (_q: Quadrant) => 'var(--ink)';

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
          <span className="mono focus-shape">{info.axis}</span>

          <div className="focus-overlap">
            <div>
              <span className="mono-label">where you overlap</span>
              <div className="thumbs">
                {mp.overlap.length ? mp.overlap.map((id) => <Thumb key={id} m={byId.get(id)!} size={60} />) : (
                  <span className="serif empty-overlap">no overlap yet</span>
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
  // side by side on desktop: shrink the 740x820 card field so the whole page fits without scrolling
  // (80px above and 40px below; the intro column takes 360px plus the 64px gap)
  const fieldFit = vp.w > 1100
    ? { zoom: Math.min(1, (vp.h - 120) / 820, (vp.w - 96 - 360 - 64) / 740) }
    : undefined;
  const cardW = vp.phone ? Math.min(CARD_W, Math.floor((vp.w - 24) / 2 - 34)) : CARD_W;
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const [focus, setFocus] = useState<string | null>(null);
  const [dealt] = useState(state.matchesDealt);

  useEffect(() => {
    dispatch({ type: 'patch', patch: { matchesSeen: true, matchesDealt: true } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ordered = [...MATCHES].sort((a, b) => a.quadrant - b.quadrant);
  const focused = ordered.find((m) => m.personId === focus);

  return (
    <div className="matches-page paper-grain">
      <header className="matches-head">
        <span className="mono-label">week of oct 12 · 2026</span>
        <h1 className="serif">Matches of the week</h1>
        <p className="serif">
          Four people this week, picked from a small circle. The cards sort them by two questions: is their media similar to yours, and are their connections?
        </p>
        <ul className="legend">
          {ordered.map((m) => {
            const info = QUADRANT_INFO[m.quadrant];
            return (
              <li key={m.quadrant}>
                <span className="legend-badge" style={{ background: accentVar(info.accent) }}>
                  <AnimalMark q={m.quadrant} size={22} color={info.accent === 'tangerine' ? 'var(--card-white)' : 'var(--ink)'} />
                </span>
                <span className="mono">{info.numeral}</span> {info.name} <span className="mono legend-axis">{info.axis}</span>
              </li>
            );
          })}
        </ul>
      </header>

      <div className="tarot-field" style={vp.phone ? { height: 2 * (Math.round(cardW * 1.75) + 76) } : fieldFit}>
        <div className="axis axis-x" aria-hidden="true">
          <span className="mono axis-end left">similar connections</span>
          <span className="mono axis-title">connections →</span>
          <span className="mono axis-end right">dissimilar connections</span>
        </div>
        <div className="axis axis-y" aria-hidden="true">
          <span className="mono axis-end top">similar media</span>
          <span className="mono axis-title">media →</span>
          <span className="mono axis-end bottom">dissimilar media</span>
        </div>
        <div className="tarot-grid">
          {ordered.map((mp, i) => {
            const st = state.matchState[mp.personId] ?? { flipped: false, status: 'new' };
            return (
              <div key={mp.personId} className={`tarot-cell q${mp.quadrant}`} style={{ ['--card-h' as string]: `${Math.round(cardW * 1.75)}px` }}>
                <TarotCard
                  cardW={cardW}
                  mp={mp}
                  index={i}
                  dealt={dealt}
                  flipped={st.flipped}
                  passed={st.status === 'passed'}
                  dimmed={!!focus && focus !== mp.personId}
                  onClick={() => {
                    if (!st.flipped) dispatch({ type: 'setMatch', id: mp.personId, patch: { flipped: true } });
                    else setFocus(mp.personId);
                  }}
                />
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

    </div>
  );
}

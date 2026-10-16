import { AnimatePresence, animate, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, today, uid } from '../store/store';
import { MediaCard } from '../components/board/MediaCard';
import { YarnStrand } from '../components/board/Yarn';
import { IconScissors, IconUpload } from '../components/ui/icons';
import { bezierPath, sagCurve, sizeOf, type Pt } from '../lib/geometry';
import { MAYA_MEDIA } from '../data/maya';
import type { Media } from '../types';
import './onboarding.css';

const PAIRS: [string, string][] = [
  ['m9', 'm12'],
  ['m10', 'm14'],
  ['m5', 'm2'],
  ['m11', 'm7'],
  ['m13', 'm3'],
  ['m6', 'm10'],
];
const byId = new Map(MAYA_MEDIA.map((m) => [m.id, m]));
const STARTERS = ['this reminds me of… because…', 'both of these feel…', 'I found this one because of that one…'];

type Step = 'welcome' | 'import' | 'game' | 'done';

export default function Onboarding() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>('welcome');
  const [ties, setTies] = useState(0);

  const finish = () => {
    dispatch({ type: 'patch', patch: { onboarded: true, arrowSeen: false } });
    nav('/');
  };

  return (
    <div className="onboarding paper-grain">
      <button className="ob-skip mono" onClick={finish}>skip intro →</button>
      <div className="ob-progress" aria-hidden="true">
        {(['welcome', 'import', 'game', 'done'] as Step[]).map((s) => (
          <span key={s} className={s === step ? 'on' : ''} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.section key="w" className="ob-step ob-welcome" exit={{ opacity: 0, y: -20 }}>
            <svg width="420" height="80" viewBox="0 0 420 80" aria-hidden="true">
              <motion.path
                d="M10 50 C 70 0, 110 90, 180 40 S 300 10, 330 44 S 400 60, 410 30"
                fill="none"
                stroke="var(--tangerine)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
              />
            </svg>
            <motion.h1 className="serif" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
              Your taste is a story. Let’s start telling it.
            </motion.h1>
            <motion.p className="mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
              rhyme · a desk for the things you love and the strings between them
            </motion.p>
            <motion.button className="btn btn-primary ob-cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} onClick={() => setStep('import')}>
              begin
            </motion.button>
          </motion.section>
        )}

        {step === 'import' && (
          <motion.section key="i" className="ob-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <span className="mono-label">step one</span>
            <h2 className="serif">Bring what you’ve already collected.</h2>
            <ImportCards onNext={() => setStep('game')} />
          </motion.section>
        )}

        {step === 'game' && (
          <motion.section key="g" className="ob-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Game
              onTie={(a, b, why) => {
                if (!state.connections.some((c) => (c.from === a && c.to === b) || (c.from === b && c.to === a))) {
                  dispatch({ type: 'addConnection', connection: { id: uid('c'), from: a, to: b, why: why || undefined, color: state.yarnColor, addedAt: today() } });
                }
                setTies((t) => t + 1);
              }}
              onDone={() => setStep('done')}
            />
          </motion.section>
        )}

        {step === 'done' && (
          <motion.section key="d" className="ob-step ob-done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="mono-label">your starter board is seeded</span>
            <h2 className="serif">
              {state.media.length} references, {state.connections.length} strings.
              <br />
              <em>{ties ? `${ties} of them are brand new.` : 'Some things don’t rhyme, and that’s fine.'}</em>
            </h2>
            <p className="serif">Every why you write is what matching reads. On Sunday, four people arrive.</p>
            <button className="btn btn-primary ob-cta" onClick={finish}>open my board</button>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImportCards({ onNext }: { onNext: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const sources = [
    { id: 'arena', name: 'Are.na', count: 38, note: 'channels become clusters' },
    { id: 'pinterest', name: 'Pinterest', count: 112, note: 'boards come in as loose cards' },
    { id: 'folder', name: 'A local folder', count: 24, note: 'images, scans, screenshots' },
  ];
  return (
    <>
      <div className="ob-imports">
        {sources.map((s, i) => {
          const isDone = done.includes(s.id);
          return (
            <motion.button
              key={s.id}
              className={`ob-import ${isDone ? 'done' : ''}`}
              style={{ rotate: [-2, 1.5, -1][i] }}
              whileHover={{ y: -4, rotate: 0 }}
              onClick={() => {
                if (isDone || busy) return;
                setBusy(s.id);
                window.setTimeout(() => {
                  setBusy(null);
                  setDone((d) => [...d, s.id]);
                }, 1300);
              }}
            >
              <IconUpload size={22} />
              <strong className="serif">{s.name}</strong>
              <span className="mono">{busy === s.id ? 'reading…' : isDone ? `${s.count} found · we picked 16 to start` : s.note}</span>
              {busy === s.id && <motion.span className="ob-bar" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.2 }} />}
            </motion.button>
          );
        })}
      </div>
      <p className="mono ob-note">imports are mocked in this prototype. you’ll start with Maya’s desk.</p>
      <button className="btn btn-primary ob-cta" onClick={onNext}>
        {done.length ? 'next: tie a few things together' : 'I’ll add as I go'}
      </button>
    </>
  );
}

function Game({ onTie, onDone }: { onTie: (a: string, b: string, why: string) => void; onDone: () => void }) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'dragging' | 'tied' | 'snipping'>('idle');
  const [cursor, setCursor] = useState<Pt | null>(null);
  const [why, setWhy] = useState('');
  const [snipT, setSnipT] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const [a, b] = PAIRS[round].map((id) => byId.get(id)!) as [Media, Media];

  const W = 860;
  const left: Pt = { x: 40, y: 40 };
  const right: Pt = { x: W - 40 - sizeOf(b).w, y: 60 };
  const anchorA: Pt = { x: left.x + sizeOf(a).w - 18, y: left.y + sizeOf(a).h / 2 };
  const anchorB: Pt = { x: right.x + 18, y: right.y + sizeOf(b).h / 2 };

  useEffect(() => {
    setPhase('idle');
    setWhy('');
    setCursor(null);
  }, [round]);

  const next = () => (round >= PAIRS.length - 1 ? onDone() : setRound((r) => r + 1));

  const toLocal = (e: { clientX: number; clientY: number }): Pt => {
    const r = stage.current!.getBoundingClientRect();
    const k = r.width / W;
    return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
  };

  const startDrag = (e: React.PointerEvent) => {
    if (phase !== 'idle') return;
    setPhase('dragging');
    setCursor(toLocal(e));
    const move = (ev: PointerEvent) => setCursor(toLocal(ev));
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const p = toLocal(ev);
      const hit = p.x > right.x - 20 && p.y > right.y - 20 && p.y < right.y + sizeOf(b).h + 20;
      setPhase(hit ? 'tied' : 'idle');
      setCursor(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const tieByButton = () => setPhase('tied');
  const snip = () => {
    setPhase('snipping');
    animate(0, 1, { duration: 0.9, onUpdate: setSnipT, onComplete: () => {
      setSnipT(0);
      next();
    } });
  };

  let yarn: JSX.Element | null = null;
  if (phase === 'dragging' && cursor) {
    yarn = <YarnStrand d={bezierPath(sagCurve(anchorA, cursor, 40))} color="tangerine" />;
  } else if (phase === 'tied') {
    yarn = <YarnStrand d={bezierPath(sagCurve(anchorA, anchorB, 46))} color="tangerine" />;
  } else if (phase === 'snipping') {
    const mid = { x: (anchorA.x + anchorB.x) / 2, y: (anchorA.y + anchorB.y) / 2 + 40 };
    const fallA = { x: mid.x + (anchorA.x - mid.x) * 0.6 * snipT, y: mid.y + 80 * snipT };
    const fallB = { x: mid.x + (anchorB.x - mid.x) * 0.6 * snipT, y: mid.y + 80 * snipT };
    yarn = (
      <g opacity={1 - snipT}>
        <YarnStrand d={bezierPath(sagCurve(anchorA, fallA, 20))} color="tangerine" />
        <YarnStrand d={bezierPath(sagCurve(anchorB, fallB, 20))} color="tangerine" />
      </g>
    );
  }

  return (
    <div className="ob-game">
      <span className="mono-label">connect these two · {round + 1} of {PAIRS.length}</span>
      <h2 className="serif">Do these rhyme for you?</h2>
      <p className="mono ob-note">drag the thread from the left card to the right one, or snip if they don’t connect.</p>

      <div className="ob-stage" ref={stage} style={{ aspectRatio: `${W} / 340` }}>
        <svg viewBox={`0 0 ${W} 340`} className="ob-stage-svg">
          <foreignObject x={left.x} y={left.y} width={sizeOf(a).w + 10} height={sizeOf(a).h + 10}>
            <div style={{ transform: `rotate(${a.rot}deg)`, margin: 4 }}><MediaCard m={a} /></div>
          </foreignObject>
          <foreignObject x={right.x} y={right.y} width={sizeOf(b).w + 10} height={sizeOf(b).h + 10}>
            <div style={{ transform: `rotate(${b.rot}deg)`, margin: 4 }} className={phase === 'dragging' ? 'ob-target' : ''}><MediaCard m={b} /></div>
          </foreignObject>
          {yarn}
          <g className={`ob-needle ${phase === 'idle' ? 'pulse' : ''}`} onPointerDown={startDrag} style={{ cursor: phase === 'idle' ? 'grab' : 'default' }}>
            <circle cx={anchorA.x} cy={anchorA.y} r="18" fill="var(--tangerine)" opacity={phase === 'idle' ? 0.18 : 0} />
            <circle cx={anchorA.x} cy={anchorA.y} r="6" fill="var(--tangerine)" />
          </g>
          {phase === 'tied' && <circle cx={anchorB.x} cy={anchorB.y} r="5" fill="var(--tangerine)" />}
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'tied' ? (
          <motion.div key="why" className="ob-why" initial={{ rotate: -14, y: -20, opacity: 0 }} animate={{ rotate: -1, y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 170, damping: 12 }}>
            <label className="mono" htmlFor="ob-why-input">why?</label>
            <input
              id="ob-why-input"
              autoFocus
              className="serif"
              value={why}
              placeholder={STARTERS[round % STARTERS.length]}
              onChange={(e) => setWhy(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onTie(a.id, b.id, why.trim());
                  next();
                }
              }}
            />
            <button className="btn btn-primary" onClick={() => {
              onTie(a.id, b.id, why.trim());
              next();
            }}>tie it</button>
          </motion.div>
        ) : (
          <motion.div key="acts" className="ob-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="btn btn-ghost" onClick={tieByButton} disabled={phase !== 'idle'}>they rhyme</button>
            <button className="btn btn-ghost" onClick={snip} disabled={phase !== 'idle'}>
              <IconScissors size={16} /> no connection
            </button>
            {round >= 4 && <button className="btn btn-quiet" onClick={onDone}>that’s enough for now →</button>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

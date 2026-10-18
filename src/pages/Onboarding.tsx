import { AnimatePresence, animate, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, today, uid } from '../store/store';
import { MediaCard } from '../components/board/MediaCard';
import { YarnStrand } from '../components/board/Yarn';
import { IconScissors } from '../components/ui/icons';
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
              Your life is a story. Let’s start telling it.
            </motion.h1>
            <motion.p className="mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
              rhyme · a desk for the places, things and moments that make you you
            </motion.p>
            <motion.button className="btn btn-primary ob-cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} onClick={() => setStep('import')}>
              begin
            </motion.button>
          </motion.section>
        )}

        {step === 'import' && (
          <motion.section key="i" className="ob-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <span className="mono-label">step one</span>
            <h2 className="serif">Not the whole internet. Just your life.</h2>
            <LifePrompts onNext={() => setStep('game')} />
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
            <p className="serif">Every why you write is what matching reads. On Sunday, four people arrive: chosen for you, not everyone.</p>
            <button className="btn btn-primary ob-cta" onClick={finish}>open my board</button>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function LifePrompts({ onNext }: { onNext: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const prompts = [
    { id: 'place', kind: 'a place', prompt: 'somewhere you keep going back to', example: 'Rittenhouse Square, north bench' },
    { id: 'photo', kind: 'a photo', prompt: 'something from your camera roll you can’t delete', example: 'the shadow of the El on Market St' },
    { id: 'moment', kind: 'something you noticed', prompt: 'a sound, a sign, a stranger, this week', example: 'the 6am El sounds like one long held note' },
  ];
  return (
    <>
      <p className="serif ob-lede">
        Other boards fill up with what everyone else is posting. Yours starts with what you actually live: places, photos, events, the small things you notice. Each one gets its own <em>why</em>.
      </p>
      <div className="ob-imports">
        {prompts.map((p, i) => {
          const on = picked.includes(p.id);
          return (
            <motion.button
              key={p.id}
              className={`ob-import ${on ? 'done' : ''}`}
              style={{ rotate: [-2, 1.5, -1][i] }}
              whileHover={{ y: -4, rotate: 0 }}
              aria-pressed={on}
              onClick={() => setPicked((x) => (on ? x.filter((y) => y !== p.id) : [...x, p.id]))}
            >
              <span className="mono">{p.kind}</span>
              <strong className="serif">{p.prompt}</strong>
              <span className="mono ob-example">{on ? 'noted · add it with the note tool' : `like: ${p.example}`}</span>
            </motion.button>
          );
        })}
      </div>
      <p className="mono ob-note">nothing is pulled from a public feed. you’ll start with Maya’s desk in this prototype.</p>
      <button className="btn btn-primary ob-cta" onClick={onNext}>
        next: tie a few things together
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

  // side by side on wide screens; stacked on phones so the cards stay full size
  const stacked = window.innerWidth < 640;
  const W = stacked ? 360 : 860;
  const H = stacked ? 520 : 340;
  const left: Pt = stacked ? { x: 16, y: 10 } : { x: 40, y: 40 };
  const right: Pt = stacked ? { x: W - 16 - sizeOf(b).w, y: H - 10 - sizeOf(b).h } : { x: W - 40 - sizeOf(b).w, y: 60 };
  const anchorA: Pt = stacked
    ? { x: left.x + sizeOf(a).w / 2, y: left.y + sizeOf(a).h - 18 }
    : { x: left.x + sizeOf(a).w - 18, y: left.y + sizeOf(a).h / 2 };
  const anchorB: Pt = stacked
    ? { x: right.x + sizeOf(b).w / 2, y: right.y + 18 }
    : { x: right.x + 18, y: right.y + sizeOf(b).h / 2 };

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
      const hit = p.x > right.x - 20 && p.x < right.x + sizeOf(b).w + 20 && p.y > right.y - 20 && p.y < right.y + sizeOf(b).h + 20;
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
      <p className="mono ob-note">drag the thread from the {stacked ? 'top' : 'left'} card to the {stacked ? 'bottom' : 'right'} one, or snip if they don’t connect.</p>

      <div className="ob-stage" ref={stage} style={{ aspectRatio: `${W} / ${H}`, maxWidth: stacked ? 360 : undefined }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="ob-stage-svg">
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

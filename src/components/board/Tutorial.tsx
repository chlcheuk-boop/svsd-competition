import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { YarnStrand } from './Yarn';
import { TarotBack } from '../tarot/TarotArt';
import './tutorial.css';

interface Step {
  target: string | null;
  kicker: string;
  title: string;
  body: ReactNode;
  why?: ReactNode;
  art: ReactNode;
}

/* ---------- tiny illustrations, drawn in the same line language as the app ---------- */
const MiniCard = ({ x, y, fill = 'var(--card-white)', rot = 0 }: { x: number; y: number; fill?: string; rot?: number }) => (
  <g transform={`rotate(${rot} ${x + 22} ${y + 26})`}>
    <rect x={x} y={y} width="44" height="52" fill={fill} stroke="var(--rule)" />
    <rect x={x + 5} y={y + 5} width="34" height="26" fill="var(--paper-deep)" />
    <path d={`M${x + 6} ${y + 38} h24 M${x + 6} ${y + 44} h16`} stroke="var(--ink-soft)" strokeWidth="1.5" strokeLinecap="round" />
  </g>
);

const ArtTie = () => (
  <svg viewBox="0 0 220 90" aria-hidden="true">
    <MiniCard x={14} y={14} rot={-4} />
    <MiniCard x={160} y={20} rot={3} fill="var(--sky)" />
    <YarnStrand d="M50 40 C 90 78, 130 78, 168 46" color="tangerine" />
    <g transform="translate(108 64) rotate(6)">
      <path d="M0 0 v6" stroke="var(--ink-soft)" />
      <path d="M-8 6 h16 v18 h-16z" fill="var(--blush)" />
      <path d="M-5 13 h10 M-5 18 h7" stroke="var(--tangerine-deep)" strokeLinecap="round" />
    </g>
  </svg>
);

const ArtSnip = () => (
  <svg viewBox="0 0 220 90" aria-hidden="true">
    <MiniCard x={14} y={14} rot={-4} />
    <MiniCard x={160} y={20} rot={3} />
    <YarnStrand d="M50 40 C 70 70, 88 78, 100 84" color="tangerine" />
    <YarnStrand d="M168 46 C 150 74, 130 80, 120 86" color="tangerine" />
    <g transform="translate(110 46) rotate(90)" stroke="var(--ink)" strokeWidth="1.5" fill="none" strokeLinecap="round">
      <circle cx="-10" cy="-5" r="5" />
      <circle cx="-10" cy="5" r="5" fill="var(--card-white)" stroke="var(--tangerine)" />
      <path d="M-6 -3 L14 6 M-6 3 L14 -6" />
    </g>
  </svg>
);

const ArtNote = () => (
  <svg viewBox="0 0 220 90" aria-hidden="true">
    <g transform="rotate(-3 110 45)">
      <path d="M62 10 h84 l14 14 v58 h-98z" fill="var(--blush)" />
      <path d="M146 10 v14 h14" fill="var(--blush-deep)" />
      <rect x="72" y="22" width="34" height="34" fill="var(--card-white)" />
      <path d="M80 44 l8 -10 l8 8 l4 -4 l6 6" stroke="var(--tangerine)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M114 28 h34 M114 38 h26 M72 66 h70 M72 74 h46" stroke="var(--tangerine-deep)" strokeWidth="1.3" strokeLinecap="round" opacity=".7" />
    </g>
  </svg>
);

const ArtThread = () => (
  <svg viewBox="0 0 220 90" aria-hidden="true">
    <YarnStrand d="M30 46 C 50 10, 70 10, 86 40 S 120 80, 136 46 S 170 10, 190 44" color="sky" />
    {[[18, 30], [74, 26], [124, 34], [178, 28]].map(([x, y], i) => (
      <g key={i}>
        <rect x={x} y={y} width="26" height="30" fill="var(--card-white)" stroke="var(--rule)" transform={`rotate(${i % 2 ? 4 : -4} ${x + 13} ${y + 15})`} />
        <circle cx={x + 2} cy={y + 1} r="7" fill="var(--tangerine)" />
        <text x={x + 2} y={y + 4.5} textAnchor="middle" fontSize="9" fill="#fff" fontFamily="General Sans">{i + 1}</text>
      </g>
    ))}
  </svg>
);

const ArtMatches = () => (
  <svg viewBox="0 0 220 90" aria-hidden="true">
    <path d="M110 4 v82 M40 45 h140" stroke="var(--rule)" />
    {(
      [
        [1, 70, 6],
        [2, 118, 6],
        [3, 70, 48],
        [4, 118, 48],
      ] as const
    ).map(([q, x, y]) => (
      <foreignObject key={q} x={x} y={y} width="32" height="38">
        <div style={{ width: 32, height: 38, borderRadius: 3, overflow: 'hidden', transform: `rotate(${q % 2 ? -3 : 3}deg)` }}>
          <TarotBack q={q} />
        </div>
      </foreignObject>
    ))}
    <text x="214" y="54" fontSize="8" fill="var(--ink-soft)" fontFamily="General Sans" textAnchor="end">connections →</text>
    <text x="156" y="88" fontSize="8" fill="var(--ink-soft)" fontFamily="General Sans">media ↓</text>
  </svg>
);

const ArtPassport = () => (
  <svg viewBox="0 0 220 90" aria-hidden="true">
    <rect x="44" y="6" width="132" height="80" rx="4" fill="var(--paper-deep)" stroke="var(--rule)" />
    <path d="M110 6 v80" stroke="rgba(67, 32, 5,.12)" />
    <g filter="url(#ink-bleed)">
      <circle cx="78" cy="44" r="22" fill="none" stroke="#D2552A" strokeWidth="2.5" />
      <circle cx="78" cy="44" r="17" fill="none" stroke="#D2552A" strokeWidth="1" />
      <rect x="122" y="18" width="40" height="28" rx="6" fill="none" stroke="#3F78AD" strokeWidth="2.5" transform="rotate(8 142 32)" />
      <path d="M126 56 h36 v24 h-36z" fill="none" stroke="#6F7C22" strokeWidth="2" strokeDasharray="3 2" transform="rotate(-6 144 68)" />
    </g>
    <text x="78" y="47" textAnchor="middle" fontSize="8" fill="#D2552A" fontFamily="KoPub Batang" fontStyle="italic">K · II</text>
  </svg>
);

const Key = ({ x, w = 30, label, hot }: { x: number; w?: number; label: string; hot?: boolean }) => (
  <g>
    <rect x={x} y="30" width={w} height="30" rx="5" fill={hot ? 'var(--blush)' : 'var(--card-white)'} stroke="var(--rule)" />
    <rect x={x} y="56" width={w} height="4" rx="2" fill="rgba(67, 32, 5,.08)" />
    <text x={x + w / 2} y="50" textAnchor="middle" fontSize="11" fontFamily="General Sans" fill={hot ? 'var(--tangerine-deep)' : 'var(--ink)'}>{label}</text>
  </g>
);

const ArtKeys = () => (
  <svg viewBox="0 0 220 90" aria-hidden="true">
    <Key x={14} w={46} label="ctrl" hot />
    <text x="68" y="50" fontSize="14" fill="var(--ink-soft)">+</text>
    <Key x={82} label="Y" />
    <Key x={116} label="S" />
    <Key x={150} label="N" />
    <Key x={184} label="Z" hot />
  </svg>
);

const ArtDone = () => (
  <svg viewBox="0 0 220 90" aria-hidden="true">
    <YarnStrand d="M20 60 C 60 10, 90 90, 130 40 S 180 30, 200 50" color="tangerine" />
  </svg>
);

const STEPS: Step[] = [
  {
    target: '[data-tool="yarn"]',
    kicker: '1 · connections',
    title: 'Tie two things together',
    body: <>Pick up the <b>yarn</b> (<kbd>Ctrl</kbd>+<kbd>Y</kbd>), click one card, then another. A paper tag swings onto the string: write <em>why</em> they belong together. Click a tag later to edit it. Tied the wrong pair? <kbd>Ctrl</kbd>+<kbd>Z</kbd>.</>,
    why: <>Matching reads these strings. You and a stranger might keep the same poster; <em>what you tie it to</em> makes it yours.</>,
    art: <ArtTie />,
  },
  {
    target: '[data-tool="scissors"]',
    kicker: '2 · breaking connections',
    title: 'Snip what no longer fits',
    body: <>Take the <b>scissors</b> (<kbd>Ctrl</kbd>+<kbd>S</kbd>) and click a string to cut it, or drag across several at once. Changed your mind? <kbd>Ctrl</kbd>+<kbd>Z</kbd> ties it back.</>,
    why: <>Matching reads your board as it stands today, so a snip can change who you meet next week.</>,
    art: <ArtSnip />,
  },
  {
    target: '[data-tool="note"]',
    kicker: '3 · adding to your life',
    title: 'Add something from your life',
    body: <>Open a <b>note</b> (<kbd>Ctrl</kbd>+<kbd>N</kbd>) and pick what it is: a <b>photo or image</b> (take one or upload it), a <b>place</b>, an <b>event</b>, <b>something you noticed</b>, or media you’re into. Add an origin line (where, when, who showed you), then tap the board to drop it.</>,
    why: <>Give it its own <em>why</em> before you tie it to anything. You can open any card later to read or change it.</>,
    art: <ArtNote />,
  },
  {
    target: '[data-tool="threads"]',
    kicker: '4 · threads',
    title: 'What is a thread?',
    body: <>A thread is a chain of tied cards with the whys between them, read top to bottom like a story. <b>Shift-click</b> any chain of tied cards to make one: any length, as long as each pair has a string. The <b>threads</b> view (<kbd>t</kbd>) traces each one on your board.</>,
    why: <>Your board stays private. Other people meet you through the threads you publish.</>,
    art: <ArtThread />,
  },
  {
    target: '[data-nav="matches"]',
    kicker: '5 · matching',
    title: 'Four people a week',
    body: <>Each week you’re dealt four tarot cards, one for each answer to two questions: is your <em>media</em> similar or dissimilar, and are your <em>connections</em>? Each card is named after its drawing: Rock, Pearl, Shell and Ocean. You see the part of their board that meets yours. Start a <b>Crossing</b> and you each add one string, with a why, to the other’s board.</>,
    art: <ArtMatches />,
  },
  {
    target: '[data-nav="passport"]',
    kicker: '6 · the passport',
    title: 'Notes from people you’ve met',
    body: <>When someone you’ve matched with leaves you a why, a note on your board or a critique on a thread, it lands in your passport as a stamp. Click a stamp to see your history with that person: their notes, your strings and anything you traded. Your ID and profile come first (tap your photo to edit them in settings), and the tabs down the side jump between sections.</>,
    art: <ArtPassport />,
  },
  {
    target: '.toolbar',
    kicker: '7 · keyboard shortcuts',
    title: 'Keyboard shortcuts',
    body: (
      <span className="tut-keys">
        <span><kbd>Ctrl</kbd>+<kbd>Y</kbd></span><span>pick up the yarn</span>
        <span><kbd>Ctrl</kbd>+<kbd>S</kbd></span><span>pick up the scissors</span>
        <span><kbd>Ctrl</kbd>+<kbd>N</kbd></span><span>write a new note</span>
        <span><kbd>Ctrl</kbd>+<kbd>Z</kbd></span><span>undo the last string you tied or snipped</span>
        <span><kbd>T</kbd></span><span>show or hide your threads</span>
        <span><kbd>Esc</kbd></span><span>put the tool down</span>
        <span>scroll</span><span>pan around the board (<kbd>Shift</kbd> to go sideways)</span>
        <span><kbd>Space</kbd> + drag</span><span>pan around the board</span>
        <span><kbd>Ctrl</kbd> + scroll</span><span>zoom in and out (or pinch)</span>
        <span><kbd>Shift</kbd>+<kbd>1</kbd></span><span>fit the whole board</span>
      </span>
    ),
    why: <>On a Mac, use <em>⌘</em> instead of Ctrl. Press Ctrl+Z again to keep stepping back.</>,
    art: <ArtKeys />,
  },
  {
    target: null,
    kicker: 'that’s the desk',
    title: 'Start by tying something.',
    body: <>You can replay this tour any time from Settings.</>,
    art: <ArtDone />,
  },
];

const PAD = 8;

export function Tutorial({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  useLayoutEffect(() => {
    const measure = () => {
      const el = step.target ? document.querySelector(step.target) : null;
      setRect(el ? el.getBoundingClientRect() : null);
    };
    measure();
    const t = window.setTimeout(measure, 450); // toolbar springs in
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [step.target]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'ArrowRight' || e.key === 'Enter') (last ? onDone() : setI((n) => n + 1));
      if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1));
      if (e.key === 'Escape') onDone();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [last, onDone]);

  // place the card next to its target: above things at the bottom, below things at the top
  const W = Math.min(400, window.innerWidth - 32);
  let style: React.CSSProperties;
  if (!rect) {
    style = { left: '50%', top: '50%', marginLeft: -W / 2, transform: 'translateY(-50%)' };
  } else {
    const left = Math.min(Math.max(16, rect.left + rect.width / 2 - W / 2), window.innerWidth - W - 16);
    style = rect.top > window.innerHeight / 2
      ? { left, bottom: window.innerHeight - rect.top + PAD + 18, maxHeight: rect.top - PAD - 18 - 16 }
      : { left: Math.max(16, Math.min(rect.left - 8, window.innerWidth - W - 16)), top: rect.bottom + PAD + 18, maxHeight: window.innerHeight - rect.bottom - PAD - 18 - 16 };
  }

  return (
    <div className="tutorial" role="dialog" aria-modal="true" aria-label="Board tour">
      <div className="tut-catcher" onPointerDown={(e) => e.stopPropagation()} />
      <motion.div
        className={`tut-spot ${rect ? '' : 'none'}`}
        initial={false}
        animate={rect ? { left: rect.left - PAD, top: rect.top - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2, opacity: 1 } : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          className="tut-card"
          style={{ ...style, width: W }}
          initial={{ opacity: 0, y: 14, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -0.6 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
          <span className="tut-pin" aria-hidden="true" />
          <div className="tut-art">{step.art}</div>
          <span className="mono tut-kicker">{step.kicker}</span>
          <h2 className="serif">{step.title}</h2>
          <p className="tut-body">{step.body}</p>
          {step.why && (
            <p className="tut-why serif">
              <span className="mono">why it matters</span>
              {step.why}
            </p>
          )}
          <div className="tut-foot">
            <div className="tut-dots" aria-label={`step ${i + 1} of ${STEPS.length}`}>
              {STEPS.map((_, k) => (
                <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`go to step ${k + 1}`} />
              ))}
            </div>
            {!last && <button className="btn btn-quiet" onClick={onDone}>skip tour</button>}
            {i > 0 && <button className="btn btn-ghost" onClick={() => setI(i - 1)}>back</button>}
            <button className="btn btn-primary" onClick={() => (last ? onDone() : setI(i + 1))} autoFocus>
              {last ? 'start' : 'next'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

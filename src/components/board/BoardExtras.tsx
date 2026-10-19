import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import type { Connection, Media } from '../../types';
import { MediaArt } from './MediaArt';
import { isWords } from '../../lib/mediaKinds';
import { IconClose, IconPause, IconPlay } from '../ui/icons';
import { fmtMonth } from './BoardView';
import './board-extras.css';

/* ---------- thread composer ---------- */
export function findLink(connections: Connection[], a: string, b: string) {
  return connections.find((c) => (c.from === a && c.to === b) || (c.from === b && c.to === a));
}

export function ThreadComposer({
  path, media, connections, onPublish, onCancel,
}: {
  path: string[];
  media: Media[];
  connections: Connection[];
  onPublish: (title: string, intro: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [intro, setIntro] = useState('');
  const byId = new Map(media.map((m) => [m.id, m]));
  return (
    <>
      <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} />
      <motion.div
        className="thread-composer"
        role="dialog"
        aria-label="Publish a thread"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
      >
        <button className="nc-close tc-close" onClick={onCancel} aria-label="Close">
          <IconClose size={18} />
        </button>
        <span className="mono-label">new thread · {path.length} references</span>
        <input className="tc-title serif" placeholder="Name this thread" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        <input className="line-input tc-intro serif" placeholder="one line to set it up (optional)" value={intro} onChange={(e) => setIntro(e.target.value)} />
        <ol className="tc-seq">
          {path.map((id, i) => {
            const m = byId.get(id)!;
            const link = i < path.length - 1 ? findLink(connections, id, path[i + 1]) : undefined;
            return (
              <li key={id}>
                <div className="tc-item">
                  <div className="tc-thumb">
                    {isWords(m.type) || m.type === 'event' ? <span className="serif">{m.type === 'text' ? `“${m.title}”` : m.title}</span> : <MediaArt art={m.art} imageData={m.imageData} />}
                  </div>
                  <span className="tc-name">{m.title}</span>
                </div>
                {i < path.length - 1 && (
                  <p className={`tc-why serif ${link?.why ? '' : 'missing'}`}>{link?.why ?? 'no why on this string yet'}</p>
                )}
              </li>
            );
          })}
        </ol>
        <div className="nc-actions">
          <span className="mono nc-hint" style={{ color: 'var(--ink-soft)' }}>other people meet you through your threads</span>
          <button className="btn btn-ghost" onClick={onCancel}>cancel</button>
          <button className="btn btn-primary" disabled={!title.trim()} onClick={() => onPublish(title.trim(), intro.trim())}>
            publish thread
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ---------- time replay ---------- */
export function useReplay(media: Media[], connections: Connection[]) {
  const dates = useMemo(
    () => Array.from(new Set([...media.map((m) => m.addedAt), ...connections.map((c) => c.addedAt)])).sort(),
    [media, connections],
  );
  return dates;
}

export function ReplayBar({
  dates, index, onIndex, onClose, counts,
}: {
  dates: string[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  counts: { media: number; strings: number };
}) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (index >= dates.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => onIndex(index + 1), 420);
    return () => window.clearTimeout(t);
  }, [playing, index, dates.length, onIndex]);

  return (
    <motion.div
      className="replay-bar"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        className="replay-play"
        onClick={() => {
          if (index >= dates.length - 1) onIndex(0);
          setPlaying((p) => !p);
        }}
        aria-label={playing ? 'Pause replay' : 'Play replay'}
      >
        {playing ? <IconPause size={18} /> : <IconPlay size={18} />}
      </button>
      <div className="replay-track">
        <input
          type="range"
          min={0}
          max={dates.length - 1}
          value={index}
          onChange={(e) => {
            setPlaying(false);
            onIndex(Number(e.target.value));
          }}
          aria-label="Board history"
        />
        <div className="replay-meta mono">
          <span className="replay-date">{fmtMonth(dates[index])}</span>
          <span>{counts.media} references · {counts.strings} strings</span>
        </div>
      </div>
      <button className="replay-close" onClick={onClose} aria-label="Close replay">
        <IconClose size={16} />
      </button>
    </motion.div>
  );
}

/* ---------- first-visit arrow ---------- */
export function FirstArrow({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      className="first-arrow"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.8 }}
      onClick={onDismiss}
    >
      <p className="serif">
        your tools live down here: <em>tie</em> with yarn, <em>snip</em> with scissors, <em>add</em> with a note.
      </p>
      <svg width="170" height="120" viewBox="0 0 170 120" aria-hidden="true">
        <motion.path
          d="M12 8 C 40 10, 92 4, 118 40 C 136 64, 128 86, 140 108"
          fill="none"
          stroke="var(--tangerine)"
          strokeWidth="1.8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.1, duration: 0.9, ease: 'easeInOut' }}
        />
        <motion.path
          d="M128 98 L140 110 L148 94"
          fill="none"
          stroke="var(--tangerine)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.95, duration: 0.3 }}
        />
      </svg>
      <span className="mono">got it ×</span>
    </motion.div>
  );
}

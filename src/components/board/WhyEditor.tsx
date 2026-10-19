import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { Pt } from '../../lib/geometry';
import './why-editor.css';

const STARTERS = [
  'this reminds me of… because…',
  'both of these feel…',
  'I found this one because of that one…',
];

interface Props {
  at: Pt;
  initial?: string;
  required?: boolean;
  title?: string;
  onSave: (text: string) => void;
  onSkip: () => void;
  onRemove?: () => void;
}

/** A paper tag that swings onto the string and asks for the "why". */
export function WhyEditor({ at, initial = '', required, title, onSave, onSkip, onRemove }: Props) {
  const [text, setText] = useState(initial);
  const [starter, setStarter] = useState(0);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => ref.current?.focus(), 350);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (text) return;
    const i = window.setInterval(() => setStarter((s) => (s + 1) % STARTERS.length), 2600);
    return () => window.clearInterval(i);
  }, [text]);

  const save = () => {
    if (!text.trim()) return required ? ref.current?.focus() : onSkip();
    onSave(text.trim());
  };

  // keep the tag on screen
  const left = Math.min(Math.max(at.x, 40), window.innerWidth - 360);
  const top = Math.min(Math.max(at.y, 80), window.innerHeight - 330);

  return (
    <div className="why-editor-anchor" style={{ left, top }} onPointerDown={(e) => e.stopPropagation()}>
      <svg className="why-editor-thread" width="40" height="34" viewBox="0 0 40 34" aria-hidden="true">
        <path d="M6 0 C 2 12, 22 14, 26 34" fill="none" stroke="var(--ink-soft)" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <motion.div
        className="why-editor"
        role="dialog"
        aria-label="Why this connection?"
        initial={{ rotate: -38, y: -30, opacity: 0 }}
        animate={{ rotate: -1.5, y: 0, opacity: 1 }}
        exit={{ rotate: 20, y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 170, damping: 11, mass: 0.8 }}
        style={{ originX: 0.12, originY: 0 }}
      >
        <span className="why-hole" aria-hidden="true" />
        <label className="mono why-label" htmlFor="why-input">
          {title ?? 'why this connection?'}
        </label>
        <textarea
          id="why-input"
          ref={ref}
          className="why-input lined"
          rows={3}
          value={text}
          placeholder={STARTERS[starter]}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              save();
            }
            if (e.key === 'Escape' && !required) onSkip();
          }}
        />
        <div className="why-actions">
          <button className="btn btn-primary" onClick={save} disabled={required && !text.trim()}>
            tie the tag
          </button>
          {!required && (
            <button className="btn btn-quiet" onClick={onSkip}>
              skip
            </button>
          )}
          {onRemove && (
            <button className="btn btn-quiet" onClick={onRemove}>
              remove why
            </button>
          )}
        </div>
        <p className="why-hint mono">
          {required ? 'a Crossing needs a why: it goes into their passport as a stamp.' : 'matching reads the whys on your strings.'}
        </p>
      </motion.div>
    </div>
  );
}

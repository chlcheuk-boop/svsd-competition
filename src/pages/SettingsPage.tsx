import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Toolbar, useToast } from '../components/ui/Frame';
import { Toggle } from '../components/ui/Toggle';
import { IconArrowLeft } from '../components/ui/icons';
import { accentVar } from '../components/ui/MiniStamp';
import { QUADRANT_INFO } from '../components/tarot/TarotArt';
import { YARN_COLORS } from './BoardPage';
import type { Quadrant, Settings } from '../types';
import './settings.css';

const IMPORTS: { id: keyof Settings['imports']; name: string; note: string }[] = [
  { id: 'arena', name: 'Are.na', note: 'channels become clusters; connections stay yours to tie' },
  { id: 'pinterest', name: 'Pinterest', note: 'boards come in as loose cards, no strings attached' },
  { id: 'folder', name: 'Local folder', note: 'drop a folder of images; origin lines left blank for you' },
];

export default function SettingsPage() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const s = state.settings;
  const set = (patch: Partial<Settings>) => dispatch({ type: 'settings', patch });
  const [importing, setImporting] = useState<string | null>(null);

  return (
    <div className="page settings-page">
      <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
        <span className="mono-label">settings</span>
        <h1 className="serif">How Rhyme treats your taste</h1>

        <fieldset>
          <legend className="serif">Privacy</legend>
          <Toggle label="Keep my board private" hint="default · only you see the whole desk" checked={s.boardPrivate} onChange={(v) => set({ boardPrivate: v })} />
          <Toggle label="Matchable" hint="appear in other people’s weekly four" checked={s.matchable} onChange={(v) => set({ matchable: v })} />
          <div className="radio-group" role="radiogroup" aria-label="What matches can see">
            <span className="field-label">what matches can see</span>
            {([
              ['fingerprint', 'Only my taste fingerprint', 'themes and how you connect, no images'],
              ['threads', 'My fingerprint and public threads', 'threads are how people meet you'],
            ] as const).map(([v, label, hint]) => (
              <label key={v} className={`radio ${s.shareMode === v ? 'on' : ''}`}>
                <input type="radio" name="share" checked={s.shareMode === v} onChange={() => set({ shareMode: v })} />
                <span>
                  {label}
                  <span className="mono">{hint}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="settings-threads">
            <span className="field-label">public threads</span>
            {state.threads.filter((t) => t.owner === 'maya').map((t) => (
              <Toggle key={t.id} label={t.title} checked={t.isPublic} onChange={(v) => dispatch({ type: 'updateThread', id: t.id, patch: { isPublic: v } })} />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="serif">Matching</legend>
          <div className="segmented" role="radiogroup" aria-label="How often">
            {(['weekly', 'biweekly', 'monthly'] as const).map((f) => (
              <button key={f} type="button" className="chip" aria-pressed={s.frequency === f} onClick={() => set({ frequency: f })}>
                {f === 'weekly' ? 'weekly (default)' : f === 'biweekly' ? 'every two weeks' : 'monthly'}
              </button>
            ))}
          </div>
          <span className="field-label">quadrants to include</span>
          <div className="quad-grid">
            {([1, 2, 3, 4] as Quadrant[]).map((q) => (
              <label key={q} className={`quad ${s.quadrants[q] ? 'on' : ''}`} style={{ ['--q' as string]: accentVar(QUADRANT_INFO[q].accent) }}>
                <input type="checkbox" checked={s.quadrants[q]} onChange={(e) => set({ quadrants: { ...s.quadrants, [q]: e.target.checked } })} />
                <span className="serif">{QUADRANT_INFO[q].numeral} · {QUADRANT_INFO[q].name}</span>
                <span className="mono">{QUADRANT_INFO[q].axis}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="serif">Imports</legend>
          <p className="mono helper">mocked in this prototype · nothing leaves your machine</p>
          {IMPORTS.map((imp) => (
            <div key={imp.id} className="import-row">
              <div>
                <strong>{imp.name}</strong>
                <span className="mono">{imp.note}</span>
              </div>
              <button
                type="button"
                className={`btn ${s.imports[imp.id] ? 'btn-ghost' : 'btn-primary'}`}
                onClick={() => {
                  if (s.imports[imp.id]) return set({ imports: { ...s.imports, [imp.id]: false } });
                  setImporting(imp.id);
                  window.setTimeout(() => {
                    setImporting(null);
                    set({ imports: { ...s.imports, [imp.id]: true } });
                    toast({ text: `${imp.name} connected · 0 new cards (demo)` });
                  }, 1200);
                }}
              >
                {importing === imp.id ? 'connecting…' : s.imports[imp.id] ? 'disconnect' : 'connect'}
              </button>
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend className="serif">Appearance</legend>
          <span className="field-label">default yarn</span>
          <div className="swatch-row">
            {YARN_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className="swatch"
                style={{ background: accentVar(c), width: 28, height: 28 }}
                aria-pressed={s.defaultYarn === c}
                aria-label={c}
                onClick={() => {
                  set({ defaultYarn: c });
                  dispatch({ type: 'patch', patch: { yarnColor: c } });
                }}
              />
            ))}
          </div>
          <Toggle label="Reduce motion" hint="cards stop swinging; flips become fades. also follows your system setting" checked={s.reduceMotion} onChange={(v) => set({ reduceMotion: v })} />
        </fieldset>

        <fieldset>
          <legend className="serif">Demo</legend>
          <p className="mono helper">for presenting: start fresh or replay the first-run story</p>
          <div className="demo-row">
            <button type="button" className="btn btn-ghost" onClick={() => {
              dispatch({ type: 'reset', onboarded: true });
              toast({ text: 'demo data reset' });
              nav('/');
            }}>reset board &amp; matches</button>
            <button type="button" className="btn btn-ghost" onClick={() => {
              dispatch({ type: 'reset', onboarded: false });
              nav('/welcome');
            }}>replay onboarding</button>
          </div>
        </fieldset>
      </form>
      <Toolbar tools={[{ id: 'back', label: 'back to board', icon: <IconArrowLeft />, onClick: () => nav('/') }]} />
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Toolbar, useToast } from '../components/ui/Frame';
import { Toggle } from '../components/ui/Toggle';
import { IconArrowLeft } from '../components/ui/icons';
import { accentVar } from '../components/ui/MiniStamp';
import { QUADRANT_INFO } from '../components/tarot/TarotArt';
import { YARN_COLORS } from './BoardPage';
import { MAYA } from '../data/people';
import type { Quadrant, Settings } from '../types';
import './settings.css';

export default function SettingsPage() {
  const { state, dispatch } = useStore();
  const nav = useNavigate();
  const toast = useToast();
  const s = state.settings;
  const share = s.shareProfile ?? { username: true, demographic: false, origin: true, creative: true };
  const set = (patch: Partial<Settings>) => dispatch({ type: 'settings', patch });

  return (
    <div className="page settings-page">
      <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
        <span className="mono-label">settings</span>
        <h1 className="serif">How Purl treats your taste</h1>

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
          <legend className="serif">What your matches see</legend>
          <p className="mono helper">your four matches only see what you switch on here. everyone else sees nothing.</p>
          {([
            ['username', 'Username', MAYA.username],
            ['demographic', 'Demographic', MAYA.demographic],
            ['origin', 'Place of origin', MAYA.origin],
            ['creative', 'What kind of creative you are', MAYA.creative],
          ] as const).map(([key, label, value]) => (
            <Toggle
              key={key}
              label={label}
              hint={value}
              checked={share[key]}
              onChange={(v) => set({ shareProfile: { ...share, [key]: v } })}
            />
          ))}
          <div className="share-preview" aria-label="How you appear on a match’s card">
            <span className="mono share-preview-label">how you appear on their tarot card</span>
            <div className="share-card">
              <span className="share-avatar serif">{MAYA.initial}</span>
              <div>
                <strong>{share.username ? MAYA.username : 'a Purl member'}</strong>
                {share.creative && <span className="mono">{MAYA.creative}</span>}
                {share.origin && <span className="mono">{MAYA.origin}</span>}
                {share.demographic && <span className="chip">{MAYA.demographic}</span>}
                {!share.creative && !share.origin && !share.demographic && <span className="mono">only your board’s slice, no details</span>}
              </div>
            </div>
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
          <legend className="serif">Capture</legend>
          <p className="mono helper">Purl never fills your desk from a public feed. things come from your life, or from the few people you cross paths with.</p>
          <Toggle label="Camera" hint="take a photo straight onto your board" checked={s.capture?.camera ?? true}
            onChange={(v) => set({ capture: { ...s.capture, camera: v } })} />
          <Toggle label="Photo library" hint="pick from your camera roll" checked={s.capture?.library ?? true}
            onChange={(v) => set({ capture: { ...s.capture, library: v } })} />
          <Toggle label="Location" hint="fill in where you are when you add a place" checked={s.capture?.location ?? false}
            onChange={(v) => set({ capture: { ...s.capture, location: v } })} />
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
            <button type="button" className="btn btn-ghost" onClick={() => {
              dispatch({ type: 'patch', patch: { tutorialSeen: false } });
              nav('/');
            }}>replay board tour</button>
          </div>
        </fieldset>
      </form>
      <Toolbar tools={[{ id: 'back', label: 'back to board', icon: <IconArrowLeft />, onClick: () => nav('/') }]} />
    </div>
  );
}

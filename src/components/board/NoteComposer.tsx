import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import type { ArtSpec, CardTint, Media, MediaType } from '../../types';
import { IconClose, IconUpload } from '../ui/icons';
import { MediaArt } from './MediaArt';
import { ART } from '../../data/maya';
import { randomRot } from '../../lib/geometry';
import { SHAPE_FOR, fmtEventDate, isWords } from '../../lib/mediaKinds';
import { uid, today } from '../../store/store';
import './note-composer.css';

const LIFE: { id: MediaType; label: string }[] = [
  { id: 'photo', label: 'photo' },
  { id: 'place', label: 'place' },
  { id: 'event', label: 'event' },
  { id: 'moment', label: 'something I noticed' },
];
const MEDIA: { id: MediaType; label: string }[] = [
  { id: 'image', label: 'image' },
  { id: 'music', label: 'music' },
  { id: 'video', label: 'film / video' },
  { id: 'text', label: 'quote' },
  { id: 'link', label: 'link' },
  { id: 'object', label: 'object' },
];

const ART_KINDS: ArtSpec['kind'][] = ['bauhaus', 'gradient', 'stripes', 'sun', 'arch', 'waves', 'dots', 'neon'];
const PALETTES = [
  [ART.tangerine, ART.cream, ART.navy, ART.mustard],
  [ART.pink, ART.sky, ART.cream, ART.forest],
  [ART.lime, ART.ink, ART.cream, ART.red],
  [ART.mustard, ART.oxblood, ART.cream, ART.teal],
];
const MAP_ART = (seed: number): ArtSpec => ({ kind: 'map', colors: ['#E9E2D3', ART.sky, ART.peach, ART.tangerine], seed });

async function downscale(file: File, max = 640): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const domainOf = (u: string) => {
  try {
    return new URL(u.startsWith('http') ? u : `https://${u}`).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
};

const TITLE_HINT: Partial<Record<MediaType, string>> = {
  photo: 'what is it a photo of?',
  place: 'name of the place',
  event: 'what was it?',
  moment: '(optional) a short name',
  music: 'track or album',
  text: '(optional) a short name',
};
const SUB_LABEL: Partial<Record<MediaType, string>> = {
  place: 'neighborhood / address',
  event: 'where it was',
  music: 'artist',
  text: 'who said it',
  photo: 'who / where',
};

export function NoteComposer({ onDone, onCancel }: { onDone: (draft: Media) => void; onCancel: () => void }) {
  const [type, setType] = useState<MediaType>('photo');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [origin, setOrigin] = useState('');
  const [why, setWhy] = useState('');
  const [tags, setTags] = useState('');
  const [words, setWords] = useState('');
  const [url, setUrl] = useState('');
  const [when, setWhen] = useState(today());
  const [imageData, setImageData] = useState<string>();
  const [showLink, setShowLink] = useState(false);
  const [over, setOver] = useState(false);
  const [locating, setLocating] = useState(false);
  const [art] = useState<ArtSpec>(() => ({
    kind: ART_KINDS[Math.floor(Math.random() * ART_KINDS.length)],
    colors: PALETTES[Math.floor(Math.random() * PALETTES.length)],
    seed: Math.floor(Math.random() * 1000),
  }));
  const [mapArt] = useState(() => MAP_ART(Math.floor(Math.random() * 1000)));
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const takeFile = async (f?: File) => {
    if (!f || !f.type.startsWith('image/')) return;
    try {
      setImageData(await downscale(f));
      if (!title && type !== 'photo') setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    } catch {
      /* unreadable image: keep generated art */
    }
  };

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocating(false);
        if (!subtitle) setSubtitle(`near ${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)}`);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const file = Array.from(e.clipboardData.files)[0];
    if (file) return takeFile(file);
    const text = e.clipboardData.getData('text');
    if (/^https?:\/\//.test(text) && !(e.target as HTMLElement).closest('input, textarea')) {
      setType('link');
      setUrl(text);
    }
  };

  const wordy = isWords(type);
  const linkableType = type === 'music' || type === 'video';
  const effectiveTitle = wordy ? (title || words.slice(0, 60)) : title;
  const canPlace = !!effectiveTitle.trim();

  const place = () => {
    if (!canPlace) return;
    const tints: CardTint[] = ['peach', 'lime', 'sky'];
    const draft: Media = {
      id: uid('m'),
      type,
      title: effectiveTitle.trim(),
      subtitle: type === 'link' ? domainOf(url) : subtitle.trim() || undefined,
      origin: origin.trim() || undefined,
      why: why.trim() || undefined,
      when: type === 'event' ? when : undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      x: 0, y: 0, rot: randomRot(),
      shape: SHAPE_FOR[type],
      tint: wordy ? tints[Math.floor(Math.random() * 3)] : 'white',
      art: wordy || type === 'event' ? undefined : type === 'place' ? mapArt : art,
      imageData,
      quote: wordy ? words.trim() || title.trim() : undefined,
      url: type === 'link' || (linkableType && url.trim()) ? url.trim() : undefined,
      addedAt: today(),
    };
    onDone(draft);
  };

  const showUpload = type === 'image' || type === 'object' || type === 'video' || type === 'music';

  const chip = (t: { id: MediaType; label: string }) => (
    <button key={t.id} className="chip" role="radio" aria-checked={type === t.id} aria-pressed={type === t.id} onClick={() => setType(t.id)}>
      {t.label}
    </button>
  );

  return (
    <>
      <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} />
      <motion.div
        className="note-composer"
        role="dialog"
        aria-label="Add something"
        initial={{ y: 60, rotate: 4, opacity: 0 }}
        animate={{ y: 0, rotate: -0.8, opacity: 1 }}
        exit={{ y: 40, rotate: 3, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        onPaste={onPaste}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files[0];
          if (f) takeFile(f);
          else {
            const t = e.dataTransfer.getData('text');
            if (/^https?:\/\//.test(t)) {
              setType('link');
              setUrl(t);
            }
          }
        }}
      >
        <span className="nc-fold" aria-hidden="true" />
        <button className="nc-close" onClick={onCancel} aria-label="Close">
          <IconClose size={18} />
        </button>
        <h2 className="nc-title serif">Add something from your life</h2>
        <p className="mono nc-sub">a place you go, a photo you took, an event, a thing you noticed, or something you’re into</p>

        <div className="nc-type-groups" role="radiogroup" aria-label="Type">
          <div className="nc-types">
            <span className="mono nc-group">from your life</span>
            {LIFE.map(chip)}
          </div>
          <div className="nc-types">
            <span className="mono nc-group">media</span>
            {MEDIA.map(chip)}
          </div>
        </div>

        <div className="nc-grid">
          <div>
            {type === 'photo' && (
              <div className="nc-drop static">
                <div className="nc-preview">
                  <MediaArt art={art} imageData={imageData} />
                </div>
                <div className="nc-photo-actions">
                  <button className="btn btn-ghost" onClick={() => cameraRef.current?.click()}>take a photo</button>
                  <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>upload an image</button>
                </div>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => takeFile(e.target.files?.[0])} />
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => takeFile(e.target.files?.[0])} />
              </div>
            )}
            {type === 'place' && (
              <div className="nc-drop static">
                <div className="nc-preview">
                  <MediaArt art={mapArt} imageData={imageData} />
                </div>
                <div className="nc-photo-actions">
                  <button className="btn btn-ghost" onClick={locate} disabled={locating}>{locating ? 'finding you…' : 'use where I am'}</button>
                  <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>add a photo</button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => takeFile(e.target.files?.[0])} />
              </div>
            )}
            {type === 'event' && (
              <div className="nc-drop static nc-event">
                <div className="nc-event-date">
                  <span className="mono">{fmtEventDate(when).month}</span>
                  <span className="serif">{fmtEventDate(when).day}</span>
                </div>
                <label className="field-label" htmlFor="nc-when">when</label>
                <input id="nc-when" type="date" className="nc-box" value={when} onChange={(e) => setWhen(e.target.value)} />
              </div>
            )}
            {showUpload && (
              <div className={`nc-drop static ${over ? 'over' : ''}`}>
                <button className="nc-preview" onClick={() => fileRef.current?.click()} aria-label="Upload an image">
                  <MediaArt art={art} imageData={imageData} />
                </button>
                <div className="nc-photo-actions">
                  <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
                    <IconUpload size={14} /> {imageData ? 'replace image' : 'upload an image'}
                  </button>
                  {linkableType && (
                    <button className="btn btn-ghost" aria-pressed={showLink} onClick={() => setShowLink((v) => !v)}>
                      {type === 'music' ? 'add a link to listen' : 'add a link to watch'}
                    </button>
                  )}
                </div>
                {linkableType && showLink && (
                  <input className="nc-box" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} aria-label="Link" autoFocus />
                )}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => takeFile(e.target.files?.[0])} />
              </div>
            )}
            {wordy && (
              <textarea
                className="nc-box nc-quote"
                placeholder={type === 'moment' ? 'what did you notice? the light on the bus, a sign, a sound…' : 'type the quote or passage…'}
                value={words}
                onChange={(e) => setWords(e.target.value)}
                rows={5}
              />
            )}
            {type === 'link' && (
              <div className="nc-link">
                <label className="field-label" htmlFor="nc-url">link</label>
                <input id="nc-url" className="nc-box" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
                <div className="nc-preview small">
                  <MediaArt art={art} />
                </div>
              </div>
            )}
          </div>

          <div className="nc-fields">
            <div>
              <label className="field-label" htmlFor="nc-title">title</label>
              <input id="nc-title" className="nc-box" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder={TITLE_HINT[type] ?? 'what is it?'} />
            </div>
            {type !== 'link' && type !== 'moment' && (
              <div>
                <label className="field-label" htmlFor="nc-sub">{SUB_LABEL[type] ?? 'maker / detail'}</label>
                <input id="nc-sub" className="nc-box" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </div>
            )}
            <div>
              <label className="field-label" htmlFor="nc-origin">origin line</label>
              <input id="nc-origin" className="nc-box" value={origin} onChange={(e) => setOrigin(e.target.value)}
                placeholder="where / when / who showed you?" />
            </div>
            <div>
              <label className="field-label" htmlFor="nc-why">why it matters to you</label>
              <textarea id="nc-why" className="nc-box nc-why" rows={2} value={why} onChange={(e) => setWhy(e.target.value)}
                placeholder="this one matters because…" />
            </div>
            <div>
              <label className="field-label" htmlFor="nc-tags">tags</label>
              <input id="nc-tags" className="nc-box" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="quiet, philly, 70s" />
            </div>
          </div>
        </div>

        <div className="nc-actions">
          <span className="mono nc-hint">{canPlace ? 'then tap anywhere on your board to drop it' : 'give it a title to continue'}</span>
          <button className="btn btn-ghost" onClick={onCancel}>cancel</button>
          <button className="btn btn-primary" disabled={!canPlace} onClick={place}>
            place on board
          </button>
        </div>
      </motion.div>
    </>
  );
}

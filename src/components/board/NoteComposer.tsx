import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import type { ArtSpec, CardShape, CardTint, Media, MediaType } from '../../types';
import { IconClose, IconUpload } from '../ui/icons';
import { MediaArt } from './MediaArt';
import { ART } from '../../data/maya';
import { randomRot } from '../../lib/geometry';
import { uid, today } from '../../store/store';
import './note-composer.css';

const TYPES: { id: MediaType; label: string }[] = [
  { id: 'image', label: 'image' },
  { id: 'music', label: 'music' },
  { id: 'text', label: 'quote / text' },
  { id: 'video', label: 'video' },
  { id: 'object', label: 'object' },
  { id: 'link', label: 'link' },
];
const SHAPE: Record<MediaType, CardShape> = {
  image: 'polaroid', object: 'polaroid', music: 'punched', text: 'sticky', video: 'folded', link: 'folded',
};
const ART_KINDS: ArtSpec['kind'][] = ['bauhaus', 'gradient', 'stripes', 'sun', 'arch', 'waves', 'dots', 'neon'];
const PALETTES = [
  [ART.tangerine, ART.cream, ART.navy, ART.mustard],
  [ART.pink, ART.sky, ART.cream, ART.forest],
  [ART.lime, ART.ink, ART.cream, ART.red],
  [ART.mustard, ART.oxblood, ART.cream, ART.teal],
];

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

export function NoteComposer({ onDone, onCancel }: { onDone: (draft: Media) => void; onCancel: () => void }) {
  const [type, setType] = useState<MediaType>('image');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [origin, setOrigin] = useState('');
  const [tags, setTags] = useState('');
  const [quote, setQuote] = useState('');
  const [url, setUrl] = useState('');
  const [imageData, setImageData] = useState<string>();
  const [over, setOver] = useState(false);
  const [art] = useState<ArtSpec>(() => ({
    kind: ART_KINDS[Math.floor(Math.random() * ART_KINDS.length)],
    colors: PALETTES[Math.floor(Math.random() * PALETTES.length)],
    seed: Math.floor(Math.random() * 1000),
  }));
  const fileRef = useRef<HTMLInputElement>(null);

  const takeFile = async (f?: File) => {
    if (!f || !f.type.startsWith('image/')) return;
    try {
      setImageData(await downscale(f));
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    } catch {
      /* unreadable image: keep generated art */
    }
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

  const effectiveTitle = type === 'text' ? (title || quote.slice(0, 60)) : title;
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
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      x: 0, y: 0, rot: randomRot(),
      shape: SHAPE[type],
      tint: type === 'text' ? tints[Math.floor(Math.random() * 3)] : 'white',
      art: type === 'text' ? undefined : art,
      imageData,
      quote: type === 'text' ? quote.trim() || title.trim() : undefined,
      url: type === 'link' ? url : undefined,
      addedAt: today(),
    };
    onDone(draft);
  };

  const showUpload = type === 'image' || type === 'object' || type === 'video' || type === 'music';

  return (
    <>
      <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} />
      <motion.div
        className="note-composer"
        role="dialog"
        aria-label="Add a reference"
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
        <h2 className="nc-title serif">Add a reference</h2>
        <p className="mono nc-sub">drop a file, paste a link, or type it in</p>

        <div className="nc-types" role="radiogroup" aria-label="Type">
          {TYPES.map((t) => (
            <button key={t.id} className="chip" role="radio" aria-checked={type === t.id} aria-pressed={type === t.id} onClick={() => setType(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="nc-grid">
          <div>
            {showUpload && (
              <button className={`nc-drop ${over ? 'over' : ''}`} onClick={() => fileRef.current?.click()}>
                <div className="nc-preview">
                  <MediaArt art={art} imageData={imageData} />
                </div>
                <span className="mono">
                  <IconUpload size={14} /> {imageData ? 'replace image' : 'upload or drop (optional)'}
                </span>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => takeFile(e.target.files?.[0])} />
              </button>
            )}
            {type === 'text' && (
              <textarea
                className="nc-quote lined"
                placeholder="type the quote or passage…"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={5}
              />
            )}
            {type === 'link' && (
              <div className="nc-link">
                <label className="field-label" htmlFor="nc-url">link</label>
                <input id="nc-url" className="line-input mono" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
                <div className="nc-preview small">
                  <MediaArt art={art} />
                </div>
              </div>
            )}
          </div>

          <div className="nc-fields">
            <div>
              <label className="field-label" htmlFor="nc-title">title</label>
              <input id="nc-title" className="line-input" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder={type === 'music' ? 'track or album' : type === 'text' ? '(optional) a short name' : 'what is it?'} />
            </div>
            {type !== 'link' && (
              <div>
                <label className="field-label" htmlFor="nc-sub">{type === 'music' ? 'artist' : type === 'text' ? 'who said it' : 'maker / detail'}</label>
                <input id="nc-sub" className="line-input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </div>
            )}
            <div>
              <label className="field-label" htmlFor="nc-origin">origin line</label>
              <input id="nc-origin" className="line-input nc-origin" value={origin} onChange={(e) => setOrigin(e.target.value)}
                placeholder="where / when / who showed you?" />
            </div>
            <div>
              <label className="field-label" htmlFor="nc-tags">tags</label>
              <input id="nc-tags" className="line-input mono" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="poster, 70s, quiet" />
            </div>
          </div>
        </div>

        <div className="nc-actions">
          <span className="mono nc-hint">{canPlace ? 'then click anywhere on your board to drop it' : 'give it a title to continue'}</span>
          <button className="btn btn-ghost" onClick={onCancel}>cancel</button>
          <button className="btn btn-primary" disabled={!canPlace} onClick={place}>
            place on board
          </button>
        </div>
      </motion.div>
    </>
  );
}

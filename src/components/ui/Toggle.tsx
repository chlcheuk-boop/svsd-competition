import { useId } from 'react';
import './toggle.css';

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <label className="toggle-row" htmlFor={id}>
      <span className="toggle-text">
        <span>{label}</span>
        {hint && <span className="mono toggle-hint">{hint}</span>}
      </span>
      <input id={id} type="checkbox" role="switch" className="visually-hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`toggle ${checked ? 'on' : ''}`} aria-hidden="true">
        <span className="knob" />
      </span>
    </label>
  );
}

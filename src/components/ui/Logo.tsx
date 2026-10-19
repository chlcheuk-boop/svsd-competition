import './logo.css';

/**
 * Purl: the inked clam with its pearl, and the swash wordmark.
 *   mark   the clam alone
 *   row    clam, then the word, sharing a baseline with the clam's foot
 *   stack  clam over the word, both on one center line
 */
export function Logo({ variant = 'row', size = 34, className = '' }: { variant?: 'mark' | 'row' | 'stack'; size?: number; className?: string }) {
  return (
    <span className={`logo logo-${variant} ${className}`} style={{ ['--logo' as string]: `${size}px` }} aria-label="Purl" role="img">
      <span className="logo-mark" aria-hidden="true" />
      {variant !== 'mark' && <span className="logo-word" aria-hidden="true">Purl</span>}
    </span>
  );
}

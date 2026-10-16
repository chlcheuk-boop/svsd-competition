import type { AppState } from '../store/store';
import type { Connection, Media, Thread } from '../types';
import { MATCHES } from '../data/matches';

/** Everything visible to Maya: her board, her matches' boards, and what she added to theirs. */
export function universe(state: AppState) {
  const media: Media[] = [...state.media];
  const connections: Connection[] = [...state.connections];
  const threads: Thread[] = [...state.threads];
  for (const m of MATCHES) {
    media.push(...m.board.media);
    connections.push(...m.board.connections);
    threads.push(...m.threads);
    const c = state.contributions[m.personId];
    if (c) {
      media.push(...c.media);
      connections.push(...c.connections);
    }
  }
  return { media: new Map(media.map((x) => [x.id, x])), connections, threads };
}

export function linkBetween(connections: Connection[], a: string, b: string) {
  return connections.find((c) => (c.from === a && c.to === b) || (c.from === b && c.to === a));
}

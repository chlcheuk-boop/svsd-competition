import BoardView from '../components/board/BoardView';
import { useStore } from '../store/store';

export default function BoardPage() {
  const { state, dispatch } = useStore();
  return (
    <BoardView
      maskPrefix="mine"
      media={state.media}
      connections={state.connections}
      tool="select"
      yarnColor={state.yarnColor}
      onMove={(id, x, y) => dispatch({ type: 'moveMedia', id, x, y })}
    />
  );
}

import { Sheet } from './components/sheet/Sheet';
import { usePressedKeys } from './hooks/useKeyEvents';
import { useMouseEvents } from './hooks/useMouseEvents';

function App() {
  useMouseEvents();
  usePressedKeys();

  return (
    <main>
      <Sheet />
    </main>
  );
}

export default App;

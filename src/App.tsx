
import { ImageViewer } from './components/ImageViewer';
import { Sidebar } from './components/Sidebar';

function App() {
  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden font-sans">
      <ImageViewer />
      <Sidebar />
    </div>
  );
}

export default App;

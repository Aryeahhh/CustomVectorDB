import { useState, useEffect } from 'react';
import ThreeViewport from './ThreeViewport';
import Sidebar from './Sidebar';
import LoadingScreen from './LoadingScreen';
import { useVectorStore } from './store/store';
import { useVDBData } from './hooks/useVDBData';
import './App.css';

function App() {
  const graphData = useVectorStore((state) => state.graphData);
  const isSearching = useVectorStore((state) => state.isSearching);
  const executeSearch = useVectorStore((state) => state.executeSearch);
  const deployIndex = useVectorStore((state) => state.deployIndex);
  const fetchSensors = useVectorStore((state) => state.fetchSensors);
  const fetchMemory = useVectorStore((state) => state.fetchMemory);
  const clearSearchState = useVectorStore((state) => state.clearSearchState);
  const insertVector = useVectorStore((state) => state.insertVector);
  const searchQuery = useVectorStore((state) => state.searchQuery);
  const setSearchQuery = useVectorStore((state) => state.setSearchQuery);

  const [isLoading, setIsLoading] = useState(true);
  const [activePanel, setActivePanel] = useState('nearest');
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [isRightMenuOpen, setIsRightMenuOpen] = useState(false);

  useVDBData();

  useEffect(() => {
    if (!isLoading) {
      fetchSensors();
      fetchMemory();
      const interval = setInterval(() => { fetchSensors(); fetchMemory(); }, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoading, fetchSensors, fetchMemory]);

  const handleSearch = () => {
    const floats = searchQuery.split(',').map(s => parseFloat(s.trim())).filter(f => !isNaN(f));
    if (floats.length === 3) {
      executeSearch(floats);
    } else {
      executeSearch();
    }
    setActivePanel('nearest');
  };

  const handleDeploy = async () => {
    setIsLoading(true);
    await deployIndex();
    window.location.reload();
  };

  const handleSettings = () => {
    clearSearchState();
  };

  useEffect(() => {
    if (graphData && graphData.length > 0) {
      const t = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(t);
    }
  }, [graphData]);

  if (isLoading) return <LoadingScreen />;

  const nodeCount = graphData.length;
  const layerCount = graphData.reduce((max, n) => Math.max(max, n.layer), 0) + 1;

  return (
    <div className="flex flex-col min-h-screen border-box overflow-hidden bg-blueprint-bg text-on-surface font-body">

      <nav className="bg-blueprint-bg flex justify-between items-center w-full px-4 h-12 fixed top-0 border-b border-blueprint-border z-50">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden text-blueprint-accent p-1 flex items-center justify-center hover:bg-blueprint-accent hover:text-blueprint-bg transition-colors"
            onClick={() => setIsLeftMenuOpen(!isLeftMenuOpen)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="text-sm md:text-lg font-bold tracking-widest text-[#f2dfd3] uppercase font-data-lg whitespace-nowrap">VECTORCORE v3.0</span>
          <span className="font-data-sm text-[10px] text-blueprint-border tracking-widest hidden md:block">{nodeCount} NODES / {layerCount} LAYERS</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex border border-blueprint-border h-8 items-center px-2">
            <span
              className="material-symbols-outlined text-blueprint-border text-sm mr-2 cursor-pointer hover:text-blueprint-accent"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              onClick={handleSearch}
            >search</span>
            <input
              className="bg-transparent border-none text-on-surface font-data-sm text-data-sm focus:ring-0 p-0 w-48 placeholder:text-blueprint-border outline-none"
              placeholder="QUERY (e.g. 0.5, -0.2, 0.8)..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="flex items-center gap-1 text-blueprint-accent">
            <button onClick={() => { fetchSensors(); setActivePanel('sensors'); setIsRightMenuOpen(true); setIsLeftMenuOpen(false); }} className="hidden md:flex hover:bg-blueprint-accent hover:text-blueprint-bg transition-colors duration-75 p-1 items-center justify-center border border-transparent" title="Sensors">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>sensors</span>
            </button>
            <button onClick={() => { fetchMemory(); setActivePanel('memory'); setIsRightMenuOpen(true); setIsLeftMenuOpen(false); }} className="hidden md:flex hover:bg-blueprint-accent hover:text-blueprint-bg transition-colors duration-75 p-1 items-center justify-center border border-transparent" title="Memory">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>memory</span>
            </button>
            <button onClick={handleSettings} className="hover:bg-blueprint-accent hover:text-blueprint-bg transition-colors duration-75 p-1 flex items-center justify-center border border-transparent" title="Clear Trace">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>settings_input_component</span>
            </button>
            <button 
              className="md:hidden hover:bg-blueprint-accent hover:text-blueprint-bg transition-colors duration-75 p-1 flex items-center justify-center border border-transparent" 
              onClick={() => setIsRightMenuOpen(!isRightMenuOpen)}
              title="Toggle Info Panel"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>info</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 pt-12">
        {/* Backdrop for mobile menus */}
        {(isLeftMenuOpen || isRightMenuOpen) && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => { setIsLeftMenuOpen(false); setIsRightMenuOpen(false); }}
          ></div>
        )}

        <aside className={`bg-blueprint-bg flex flex-col h-[calc(100vh-3rem)] fixed left-0 top-12 z-40 w-72 border-r border-blueprint-border transform transition-transform duration-200 ease-in-out ${isLeftMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <div className="p-4 border-b border-blueprint-border">
            <h2 className="font-h3 text-[16px] font-bold text-on-surface tracking-wide">ENGINEERING_CONSOLE</h2>
            <p className="font-label text-label text-blueprint-border mt-unit tracking-widest">VECTOR_DB_CORE</p>
          </div>

          <nav className="flex-1 flex flex-col pt-4 font-data-sm text-xs uppercase tracking-widest">
            {[
              { id: 'nearest', icon: 'radar', label: 'Nearest Neighbor' },
              { id: 'metrics', icon: 'query_stats', label: 'Big O Metrics' },
              { id: 'hnsw', icon: 'layers', label: 'HNSW Controls' },
              { id: 'sensors', icon: 'sensors', label: 'Sensor Readout' },
              { id: 'memory', icon: 'memory', label: 'Memory Map' },
              { id: 'benchmarking', icon: 'speed', label: 'Benchmarking' },
            ].map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => { 
                  setActivePanel(id); 
                  if (id === 'sensors') fetchSensors(); 
                  if (id === 'memory') fetchMemory(); 
                  setIsLeftMenuOpen(false);
                  setIsRightMenuOpen(true);
                }}
                className={`p-3 w-full flex items-center gap-2 border-b transition-colors duration-75 text-left ${
                  activePanel === id
                    ? 'bg-blueprint-accent text-blueprint-bg font-bold border-blueprint-accent opacity-90'
                    : 'text-slate-400 border-blueprint-border hover:bg-blueprint-accent hover:text-blueprint-bg cursor-crosshair'
                }`}
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{icon}</span>
                {label}
              </button>
            ))}
          </nav>

          <div className="p-4 pb-20 border-t border-blueprint-border flex flex-col gap-2">
            <button
              className="w-full border border-blueprint-accent text-blueprint-accent hover:bg-blueprint-accent hover:text-blueprint-bg font-data-sm text-data-sm py-2 uppercase transition-colors duration-75 cursor-crosshair"
              onClick={() => insertVector()}
            >
              INJECT RANDOM NODE
            </button>
            <button
              className={`w-full border border-blueprint-accent ${isSearching ? 'bg-blueprint-accent text-blueprint-bg animate-pulse' : 'text-blueprint-accent hover:bg-blueprint-accent hover:text-blueprint-bg'} font-data-sm text-data-sm py-2 uppercase transition-colors duration-75 cursor-crosshair`}
              disabled={isSearching}
              onClick={handleDeploy}
            >
              {isSearching ? 'TRACING_LAYERS...' : 'DEPLOY_INDEX'}
            </button>
          </div>
        </aside>

        <main className="flex-1 md:ml-72 ml-0 flex h-[calc(100vh-3rem)] relative">
          <div className="flex-1 relative flex items-center justify-center overflow-hidden border-r border-blueprint-border">
            <div className="absolute top-4 left-4 font-data-sm text-data-sm text-blueprint-border tracking-wider pointer-events-none z-10">
              PROJECTION [ORTHOGRAPHIC / SIDE ELEVATION]
            </div>
            <div className="absolute bottom-4 right-4 font-data-sm text-data-sm text-blueprint-border tracking-wider pointer-events-none z-10">
              DIM: 3 / METRIC: EUCLIDEAN / LAYERS: {layerCount}
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2 border border-blueprint-border p-1 bg-blueprint-bg z-10">
              <span className={`w-2 h-2 ${isSearching ? 'bg-[#00f2ff] animate-pulse' : 'bg-blueprint-accent animate-pulse'} block`}></span>
              <span className="font-data-sm text-data-sm text-on-surface tracking-widest">{isSearching ? 'TRACE_ACTIVE' : 'LIVE_FEED'}</span>
            </div>
            <div className="absolute inset-0 w-full h-full" style={{
              backgroundImage: 'linear-gradient(to right, rgba(74, 85, 104, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(74, 85, 104, 0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}>
              <ThreeViewport />
            </div>
          </div>
          <Sidebar activePanel={activePanel} isOpen={isRightMenuOpen} onClose={() => setIsRightMenuOpen(false)} />
        </main>
      </div>
    </div>
  );
}

export default App;

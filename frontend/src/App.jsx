import { useState, useEffect } from 'react';
import ThreeViewport from './ThreeViewport';
import Sidebar from './Sidebar';
import LoadingScreen from './LoadingScreen';
import { useVectorStore } from './store/store';
import './App.css';

function App() {
  const graphData = useVectorStore((state) => state.graphData);
  const [isLoading, setIsLoading] = useState(true);

  // Artificial hook simulating the API wait time for the design showcase
  // When hooked up to Render.com, we replace this timeout with `await fetch()`
  useEffect(() => {
    if (graphData && graphData.length > 0) {
        setTimeout(() => {
          setIsLoading(false);
        }, 3000); // 3 second demo delay to physically show the UI Loading Screen
    }
  }, [graphData]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>QUANT-LAB INFRASTRUCTURE</h1>
        <div className="status-chip">
          STATUS: <span className="active-tag">ONLINE</span>
        </div>
      </header>
      
      <main className="main-content">
        <Sidebar />
        <div className="canvas-wrapper">
          <ThreeViewport />
        </div>
      </main>
    </div>
  );
}

export default App;

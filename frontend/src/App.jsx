import ThreeViewport from './ThreeViewport';
import './App.css';

function App() {
  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>QUANT-LAB INFRASTRUCTURE</h1>
        <div className="status-chip">
          STATUS: <span className="active-tag">ONLINE</span>
        </div>
      </header>
      
      <main className="canvas-wrapper">
        <ThreeViewport />
      </main>
    </div>
  );
}

export default App;

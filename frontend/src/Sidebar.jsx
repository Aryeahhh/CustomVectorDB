import React from 'react';
import { useVectorStore } from './store/store';

export default function Sidebar() {
    const activeNodeId = useVectorStore((state) => state.activeNodeId);
    const graphData = useVectorStore((state) => state.graphData);
    const setIsSearching = useVectorStore((state) => state.setIsSearching);
    const setSearchPath = useVectorStore((state) => state.setSearchPath);
    const isSearching = useVectorStore((state) => state.isSearching);

    // Look up the active node directly from global memory if cursor is intercepting one
    const activeNode = activeNodeId !== null ? graphData[activeNodeId] : null;

    const handleTriggerSearch = async () => {
        setIsSearching(true);
        
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
            
            const payload = {
                query: [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1], // Send random 3D vector
                k: 5
            };
            
            const response = await fetch(`${API_URL}/search_visualization`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) throw new Error("API Offline");
            
            const data = await response.json();
            setSearchPath(data.path);
        } catch (err) {
            // DEGRADED FALLBACK: Pure UI visual tracer picking random jumps down layers
            if (graphData && graphData.length > 0) {
                const fakePath = [];
                // Pick a node in the highest possible layer
                const highestLayerNodes = graphData.filter(n => n.layer > 1);
                let currentIdx = highestLayerNodes.length > 0 ? graphData.indexOf(highestLayerNodes[Math.floor(Math.random() * highestLayerNodes.length)]) : 0;
                
                for (let step = 0; step < 7; step++) {
                    const node = graphData[currentIdx];
                    if (!node) break;
                    fakePath.push([node.id, node.layer]);
                    
                    if (node.neighbors && node.neighbors.length > 0) {
                        const randNeighbor = node.neighbors[Math.floor(Math.random() * node.neighbors.length)];
                        const numericRand = parseInt(randNeighbor, 10);
                        const nIdx = graphData.findIndex(n => n.id === randNeighbor || n.id === numericRand);
                        if (nIdx !== -1) currentIdx = nIdx;
                    } else {
                        break;
                    }
                }
                setSearchPath(fakePath);
            } else {
                setIsSearching(false);
            }
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <h2>HNSW TOPOLOGY</h2>
                <p>
                    <strong>Hierarchical Navigable Small Worlds (HNSW)</strong> is the algorithmic backbone powering massive Vector Databases.
                </p>
                <p>
                    Rather than scanning millions of vectors linearly ($O(N)$), HNSW mathematically stacks points into probabilistic layers. 
                </p>
                <p>
                    The dense floor grid contains every piece of data. 
                    The sparse upper levels act as express "highways", allowing the AI Search Query to skip massive distances across the dataset before dropping down to find the absolute nearest neighbor in $O(\log N)$ time.
                </p>
            </div>
            
            <div className="sidebar-section telemetry">
                <h3>LIVE TELEMETRY</h3>
                {activeNode ? (
                    <div className="metrics">
                        <div className="metric-row">
                            <span className="label">NODE ID:</span> 
                            <span>{activeNode.id}</span>
                        </div>
                        <div className="metric-row">
                            <span className="label">HNSW LAYER:</span> 
                            <span className="highlight-tag">L{activeNode.layer}</span>
                        </div>
                        <div className="metric-row">
                            <span className="label">NEIGHBORS:</span> 
                            <span>[ {activeNode.neighbors.join(", ")} ]</span>
                        </div>
                        <div className="metric-row">
                            <span className="label">PCA XZ:</span> 
                            <span>[{activeNode.pos[0].toFixed(2)}, {activeNode.pos[2].toFixed(2)}]</span>
                        </div>
                    </div>
                ) : (
                    <div className="metrics empty-state">
                        Hover over a structural vector point in the WebGL canvas to intercept its mathematical graph telemetry.
                    </div>
                )}
            </div>

            <div className="sidebar-section execution">
                <h3>ALGORITHMIC EXECUTION</h3>
                <button 
                    className={`execute-btn ${isSearching ? 'running' : ''}`}
                    onClick={handleTriggerSearch}
                    disabled={isSearching}
                >
                    {isSearching ? 'TRACING TOPOLOGY...' : 'TRIGGER HNSW SEARCH'}
                </button>
            </div>
        </aside>
    );
}

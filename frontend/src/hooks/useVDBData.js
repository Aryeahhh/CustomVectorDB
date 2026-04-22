import { useEffect } from 'react';
import { useVectorStore } from '../store/store';
import mockGraph from '../assets/mock_graph.json'; // The guaranteed offline fallback

// Preserving our geometric probabilistic distribution math (for mock logic only)
const getMockLayer = (index, m_L = 1.0) => {
    const rand = Math.abs(Math.sin(index * 12.9898 + 78.233)) % 1;
    let layer = Math.floor(-Math.log(1 - rand) * m_L);
    return Math.min(layer, 3);
};

export const useVDBData = () => {
    const setGraphData = useVectorStore((state) => state.setGraphData);

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                // If VITE_API_URL is supplied via Render.com / Vercel hooks, we hit the true python database natively
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
                
                const response = await fetch(`${API_URL}/graph`);
                
                if (!response.ok) throw new Error("API Offline");
                
                const data = await response.json();
                
                if (!data.nodes || data.nodes.length === 0) {
                    console.warn("Database empty. Falling back to dimensional JSON mock array.");
                    throw new Error("Empty Database");
                }

                const mappedData = data.nodes.map((node) => {
                    const layer = node.layer;
                    const yOffset = layer * 1.0;
                    return {
                        id: node.id,
                        layer: layer,
                        pos: [node.pos[0], yOffset, node.pos[2]],
                        neighbors: node.neighbors
                    };
                });
                
                setGraphData(mappedData);
                
            } catch (err) {
                // FALLBACK: Massive static geometric serialization if Python drops off the network
                const mappedData = mockGraph.nodes.map((node, index) => {
                    const layer = node.layer !== undefined ? node.layer : getMockLayer(index, 1.5);
                    const yOffset = layer * 1.0;

                    const neighbors = [];
                    for (let i = 0; i < 4; i++) {
                        neighbors.push((index + Math.floor(Math.random() * 20)) % mockGraph.nodes.length);
                    }

                    return {
                        id: node.id,
                        layer: layer,
                        pos: [node.x, yOffset, node.y], 
                        neighbors: neighbors
                    };
                });
                setGraphData(mappedData);
            }
        };

        fetchGraphData();
    }, [setGraphData]);
};

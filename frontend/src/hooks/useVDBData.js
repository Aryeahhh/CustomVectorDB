import { useEffect } from 'react';
import { useVectorStore } from '../store/store';
import mockGraph from '../assets/mock_graph.json';

// Preserving our geometric probabilistic distribution math
const getMockLayer = (index, m_L = 1.0) => {
    const rand = Math.abs(Math.sin(index * 12.9898 + 78.233)) % 1;
    let layer = Math.floor(-Math.log(1 - rand) * m_L);
    return Math.min(layer, 3);
};

export const useVDBData = () => {
    const setGraphData = useVectorStore((state) => state.setGraphData);

    useEffect(() => {
        // In production, this would be `await fetch('/api/search')` hitting FastAPI.
        // For the static build, we map the bundled JSON data struct natively.
        const mappedData = mockGraph.nodes.map((node, index) => {
            const layer = node.layer !== undefined ? node.layer : getMockLayer(index, 1.5);
            const yOffset = layer * 2.0;

            // Generate HNSW topology proxies
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

        // Mutate global Zustand store state
        setGraphData(mappedData);
    }, [setGraphData]);
};

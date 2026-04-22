import { useEffect } from 'react';
import { useVectorStore } from '../store/store';
import mockGraph from '../assets/mock_graph.json';
import { LAYER_GAP } from '../HNSWMaster';

const getMockLayer = (index, m_L = 1.0) => {
    const rand = Math.abs(Math.sin(index * 12.9898 + 78.233)) % 1;
    return Math.min(Math.floor(-Math.log(1 - rand) * m_L), 5);
};

export const useVDBData = () => {
    const setGraphData = useVectorStore((state) => state.setGraphData);
    const initLayerFilters = useVectorStore((state) => state.initLayerFilters);

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
                const response = await fetch(`${API_URL}/graph`);
                if (!response.ok) throw new Error("API Offline");

                const data = await response.json();
                if (!data.nodes || data.nodes.length === 0) throw new Error("Empty");

                const mapped = data.nodes.map((node) => ({
                    id: node.id,
                    layer: node.layer,
                    pos: [node.pos[0], node.layer * LAYER_GAP, node.pos[2]],
                    neighbors: node.neighbors
                }));
                const maxL = mapped.reduce((m, n) => Math.max(m, n.layer), 0);
                initLayerFilters(maxL);
                setGraphData(mapped);
            } catch {
                setGraphData(mockGraph.nodes.map((node, index) => {
                    const layer = node.layer !== undefined ? node.layer : getMockLayer(index, 1.5);
                    const neighbors = [];
                    for (let i = 0; i < 4; i++) {
                        neighbors.push((index + Math.floor(Math.random() * 20)) % mockGraph.nodes.length);
                    }
                    return {
                        id: node.id,
                        layer,
                        pos: [node.x, layer * LAYER_GAP, node.y],
                        neighbors
                    };
                }));
            }
        };

        fetchGraphData();
    }, [setGraphData]);
};

import { useEffect } from 'react';
import { useVectorStore } from '../store/store';
import mockGraph from '../assets/mock_graph.json';
import { LAYER_GAP } from '../HNSWMaster';

const getMockLayer = (index, m_L = 1.0) => {
    const rand = Math.abs(Math.sin(index * 12.9898 + 78.233)) % 1;
    return Math.min(Math.floor(-Math.log(1 - rand) * m_L), 5);
};

export const useVDBData = () => {
    const fetchGraph = useVectorStore((state) => state.fetchGraph);

    useEffect(() => {
        fetchGraph();
    }, [fetchGraph]);
};

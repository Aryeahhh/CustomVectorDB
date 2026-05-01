import { useEffect } from 'react';
import { useVectorStore } from '../store/store';

export const useVDBData = () => {
    const fetchGraph = useVectorStore((state) => state.fetchGraph);
    const pingBackend = useVectorStore((state) => state.pingBackend);

    useEffect(() => {
        const init = async () => {
            const awake = await pingBackend();
            if (awake) {
                fetchGraph();
            }
        };
        init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};


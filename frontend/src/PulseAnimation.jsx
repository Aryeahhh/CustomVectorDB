import { useMemo } from 'react';
import * as THREE from 'three';
import { useVectorStore } from './store/store';

export default function PulseAnimation() {
    const searchPath = useVectorStore((state) => state.searchPath);
    const graphData = useVectorStore((state) => state.graphData);

    const lineGeometry = useMemo(() => {
        if (!searchPath || searchPath.length < 2 || !graphData.length) return null;

        const nodeMap = {};
        graphData.forEach(n => { nodeMap[n.id] = n.pos; });

        const pts = [];
        let prevPos = null;

        for (const trace of searchPath) {
            const pos = nodeMap[trace[0]];
            if (!pos) continue;
            if (prevPos) {
                pts.push(prevPos[0], prevPos[1], prevPos[2]);
                pts.push(pos[0], pos[1], pos[2]);
            }
            prevPos = pos;
        }

        if (pts.length === 0) return null;

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        return geo;
    }, [searchPath, graphData]);

    if (!lineGeometry) return null;

    return (
        <lineSegments geometry={lineGeometry}>
            <lineBasicMaterial color="#ffea00" transparent opacity={0.7} />
        </lineSegments>
    );
}

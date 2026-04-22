import React, { useMemo } from 'react';
import * as THREE from 'three';

export default function Connections({ positions, hoveredIdx, adjacencyList }) {
    const lineGeometry = useMemo(() => {
        if (hoveredIdx === null || hoveredIdx === undefined) return null;
        
        const neighbors = adjacencyList[hoveredIdx] || [];
        const pts = [];
        
        const baseX = positions[hoveredIdx * 3];
        const baseY = positions[hoveredIdx * 3 + 1];
        const baseZ = positions[hoveredIdx * 3 + 2];
        
        neighbors.forEach(nIdx => {
            // Push start point
            pts.push(baseX, baseY, baseZ);
            // Push end point
            pts.push(positions[nIdx * 3], positions[nIdx * 3 + 1], positions[nIdx * 3 + 2]);
        });
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        return geometry;
    }, [hoveredIdx, positions, adjacencyList]);

    if (!lineGeometry || lineGeometry.attributes.position.count === 0) return null;

    return (
        <lineSegments 
            geometry={lineGeometry} 
            onUpdate={(line) => line.computeLineDistances()}
        >
            <lineDashedMaterial 
                color="#4A5568" 
                dashSize={0.2}
                gapSize={0.2}
                transparent={true} 
                opacity={0.3} 
            />
        </lineSegments>
    );
}

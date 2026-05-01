import React, { useMemo } from 'react';
import { useVectorStore } from './store/store';

export default function PointsComponent({ nodes, hoveredIdx, setHoveredIdx }) {
    const lockedNodeId = useVectorStore((state) => state.lockedNodeId);
    const setLockedNodeId = useVectorStore((state) => state.setLockedNodeId);

    const positions = useMemo(() => {
        const arr = new Float32Array(nodes.length * 3);
        nodes.forEach((node, idx) => {
            arr[idx * 3] = node.pos[0];
            arr[idx * 3 + 1] = node.pos[1];
            arr[idx * 3 + 2] = node.pos[2];
        });
        return arr;
    }, [nodes]);

    const handlePointerOver = (e) => {
        e.stopPropagation();
        document.body.style.cursor = 'crosshair';
        if (e.index !== undefined && lockedNodeId === null) {
            setHoveredIdx(e.index);
        }
    };

    const handlePointerOut = (e) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
        if (lockedNodeId === null) {
            setHoveredIdx(null);
        }
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (e.index !== undefined) {
            if (lockedNodeId === e.index) {
                setLockedNodeId(null);
            } else {
                setLockedNodeId(e.index);
                setHoveredIdx(e.index);
            }
        }
    };

    return (
        <points
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            <bufferGeometry key={nodes.length}>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={4}
                sizeAttenuation={false}
                color="#ffb77d"
            />
        </points>
    );
}

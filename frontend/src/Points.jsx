import React, { useMemo } from 'react';

export default function PointsComponent({ nodes, hoveredIdx, setHoveredIdx }) {

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
        if (e.index !== undefined) {
            setHoveredIdx(e.index);
            document.body.style.cursor = 'crosshair';
        }
    };

    const handlePointerOut = (e) => {
        e.stopPropagation();
        setHoveredIdx(null);
        document.body.style.cursor = 'default';
    };

    return (
        <points
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

import React, { useMemo } from 'react';

export default function PointsComponent({ nodes, hoveredIdx, setHoveredIdx }) {
    
    // Flatten graph data directly into a high-performance attribute buffer
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
        // Native THREE.Points uses 'index' rather than Mesh 'instanceId'
        if (e.index !== undefined) {
            setHoveredIdx(e.index);
            document.body.style.cursor = 'crosshair'; // More technical cursor
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
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>

            {/* 
                Fulfilling User Directives:
                Switching to PointsMaterial natively enables sizeAttenuation: false.
                This prevents perspective scaling so points render strictly as flat 2D pixels,
                providing an authentic "Blueprint / Technical Architecture" look regardless of camera depth.
            */}
            <pointsMaterial 
                size={4}  // 4 flat pixels
                sizeAttenuation={false} 
                color="#ffb77d"
            />
        </points>
    );
}

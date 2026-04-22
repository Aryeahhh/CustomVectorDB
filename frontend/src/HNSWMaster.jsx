import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import mockGraph from './assets/mock_graph.json';
import Connections from './Connections';

// Utility for layer assignment
const getMockLayer = (index, m_L = 1.0) => {
    const rand = Math.abs(Math.sin(index * 12.9898 + 78.233)) % 1;
    let layer = Math.floor(-Math.log(1 - rand) * m_L);
    return Math.min(layer, 3);
};

export default function HNSWMaster() {
    const meshRef = useRef();
    const groupRef = useRef();
    const [hoveredIdx, setHoveredIdx] = useState(null);

    // Calculate positions and mock adjacency
    const { positions, maxLayer, adjacencyList } = useMemo(() => {
        const nodes = mockGraph.nodes;
        const posArray = new Float32Array(nodes.length * 3);
        const adj = [];
        
        let highestLayer = 0;

        nodes.forEach((node, idx) => {
            const layer = node.layer !== undefined ? node.layer : getMockLayer(idx, 1.5);
            highestLayer = Math.max(highestLayer, layer);
            const yOffset = layer * 2.0;
            
            posArray[idx * 3] = node.x;
            posArray[idx * 3 + 1] = yOffset;
            posArray[idx * 3 + 2] = node.y;

            // Generate mock HNSW neighbors (finding nearest vectors simply via index math for demonstration)
            // Real engine uses actual Skiplist routing logic
            const neighbors = [];
            for(let i=0; i < 4; i++) {
                // Probabilistic links typical of Navigable Small Worlds
                neighbors.push((idx + Math.floor(Math.random() * 20)) % nodes.length);
            }
            adj.push(neighbors);
        });

        return { positions: posArray, maxLayer: highestLayer, adjacencyList: adj };
    }, []);

    // Initial matrix application for InstancedMesh
    useMemo(() => {
        if (!meshRef.current) return;
        
        const tempObject = new THREE.Object3D();
        for (let i = 0; i < mockGraph.nodes.length; i++) {
            tempObject.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            // Increase scale slightly on hover if needed, or leave pure
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObject.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [positions]);

    const grids = [];
    const gridColor = new THREE.Color("#4A5568"); 
    const gridCenterColor = new THREE.Color("#D97706"); 

    for (let l = 0; l <= maxLayer; l++) {
        grids.push(
            <gridHelper
                key={`grid-${l}`}
                position={[0, l * 2.0, 0]}
                args={[20, 20, gridCenterColor, gridColor]}
                material-opacity={0.3}
                material-transparent={true}
            />
        );
    }

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.05;
        }
    });

    const handlePointerOver = (e) => {
        e.stopPropagation();
        setHoveredIdx(e.instanceId);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = (e) => {
        e.stopPropagation();
        setHoveredIdx(null);
        document.body.style.cursor = 'default';
    };

    return (
        <group ref={groupRef}>
            {grids}
            
            <Connections 
                positions={positions} 
                hoveredIdx={hoveredIdx} 
                adjacencyList={adjacencyList} 
            />

            <instancedMesh
                ref={meshRef}
                args={[null, null, mockGraph.nodes.length]}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <boxGeometry args={[0.08, 0.08, 0.08]} />
                <meshStandardMaterial 
                    color={hoveredIdx !== null ? "#00f2ff" : "#ffb77d"} 
                    emissive={hoveredIdx !== null ? "#00f2ff" : "#904d00"} 
                    emissiveIntensity={hoveredIdx !== null ? 0.8 : 0.5} 
                />
            </instancedMesh>
        </group>
    );
}

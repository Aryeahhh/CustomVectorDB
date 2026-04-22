import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVectorStore } from './store/store';
import { useVDBData } from './hooks/useVDBData';
import Connections from './Connections';
import PointsComponent from './Points';

export default function HNSWMaster() {
    const groupRef = useRef();
    
    // Boot up the global Python API parser 
    useVDBData();

    // Consume global Zustand stores
    const graphData = useVectorStore((state) => state.graphData);
    const activeNodeId = useVectorStore((state) => state.activeNodeId);
    const setActiveNodeId = useVectorStore((state) => state.setActiveNodeId);

    // If API is still fetching/parsing, return empty tree
    if (!graphData || graphData.length === 0) return null;

    // Isolate adjacency list and continuous pos matrix identically for 3D engine props
    const positions = new Float32Array(graphData.length * 3);
    const adjacencyList = [];
    
    let maxLayer = 0;
    
    graphData.forEach((node, idx) => {
        maxLayer = Math.max(maxLayer, node.layer);
        positions[idx * 3] = node.pos[0];
        positions[idx * 3 + 1] = node.pos[1];
        positions[idx * 3 + 2] = node.pos[2];
        adjacencyList.push(node.neighbors);
    });

    const grids = [];
    for (let l = 0; l <= maxLayer; l++) {
        grids.push(
            <gridHelper
                key={`grid-${l}`}
                position={[0, l * 1.0, 0]}
                args={[20, 20, '#D97706', '#4A5568']}
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

    return (
        <group ref={groupRef}>
            {grids}
            
            <Connections 
                positions={positions} 
                hoveredIdx={activeNodeId} 
                adjacencyList={adjacencyList} 
            />

            <PointsComponent 
                nodes={graphData} 
                hoveredIdx={activeNodeId} 
                setHoveredIdx={setActiveNodeId} 
            />
        </group>
    );
}

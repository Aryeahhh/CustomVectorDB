import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVectorStore } from './store/store';
import Connections from './Connections';
import PointsComponent from './Points';
import PulseAnimation from './PulseAnimation';

const LAYER_GAP = 3.5;

export default function HNSWMaster() {
    const groupRef = useRef();

    const graphData = useVectorStore((state) => state.graphData);
    const activeNodeId = useVectorStore((state) => state.activeNodeId);
    const setActiveNodeId = useVectorStore((state) => state.setActiveNodeId);
    const activeLayerFilters = useVectorStore((state) => state.activeLayerFilters);

    if (!graphData || graphData.length === 0) return null;

    const idToIndex = {};
    graphData.forEach((node, idx) => { idToIndex[node.id] = idx; });

    const positions = new Float32Array(graphData.length * 3);
    const adjacencyList = [];
    let maxLayer = 0;

    graphData.forEach((node, idx) => {
        maxLayer = Math.max(maxLayer, node.layer);
        const isVisible = activeLayerFilters[node.layer] !== false;

        positions[idx * 3] = node.pos[0];
        positions[idx * 3 + 1] = isVisible ? node.pos[1] : -99999;
        positions[idx * 3 + 2] = node.pos[2];

        if (isVisible) {
            adjacencyList.push(
                node.neighbors
                    .map(nId => idToIndex[nId])
                    .filter(i => i !== undefined)
            );
        } else {
            adjacencyList.push([]);
        }
    });

    const grids = [];
    const layerColors = ['#D97706', '#00f2ff', '#ff6b6b', '#4ade80', '#a78bfa', '#f472b6'];
    for (let l = 0; l <= maxLayer; l++) {
        grids.push(
            <gridHelper
                key={`grid-${l}`}
                position={[0, l * LAYER_GAP, 0]}
                args={[20, 20, layerColors[l % layerColors.length], '#1a1d23']}
                material-opacity={0.25}
                material-transparent={true}
            />
        );
    }

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.03;
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
            <PulseAnimation />
        </group>
    );
}

export { LAYER_GAP };

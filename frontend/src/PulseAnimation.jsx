import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVectorStore } from './store/store';

export default function PulseAnimation() {
    const searchPath = useVectorStore((state) => state.searchPath);
    const graphData = useVectorStore((state) => state.graphData);
    const setIsSearching = useVectorStore((state) => state.setIsSearching);
    
    const [pathVectors, setPathVectors] = useState([]);
    const meshRef = useRef();
    const trailRef = useRef();
    const targetIndex = useRef(0);
    
    // Map algorithmic string arrays to physical 3D mathematical constraints
    useEffect(() => {
        if (!searchPath || searchPath.length === 0) {
            setPathVectors([]);
            return;
        }
        
        // Reset execution state
        targetIndex.current = 0;
        
        // Format of Trace array out of Python: [[Node_ID, Layer], [Node_ID, Layer]...]
        const vecs = searchPath.map(trace => {
            const nodeId = trace[0];
            const node = graphData.find(n => n.id === nodeId);
            return node ? new THREE.Vector3(...node.pos) : null;
        }).filter(v => v !== null);
        
        setPathVectors(vecs);
        
    }, [searchPath, graphData]);

    const trailGeometry = useRef(new THREE.BufferGeometry());

    useFrame((state, delta) => {
        if (pathVectors.length < 2 || !meshRef.current) return;
        
        const currentPos = meshRef.current.position;
        const targetPos = pathVectors[targetIndex.current];
        
        // WebGL physics math interpolating movement exponentially jumping between vectors
        currentPos.lerp(targetPos, 8 * delta);
        
        // Update physical trail geometry line
        if (targetIndex.current > 0) {
            const points = pathVectors.slice(0, targetIndex.current).map(p => p.clone());
            points.push(currentPos.clone());
            trailGeometry.current.setFromPoints(points);
        }
        
        // If the sphere physics hit the threshold radius, pop to the next vector ID in sequence
        if (currentPos.distanceTo(targetPos) < 0.15) {
            if (targetIndex.current < pathVectors.length - 1) {
                targetIndex.current++;
            } else {
                // Done searching, unlock constraints
                setIsSearching(false);
            }
        }
    });

    if (pathVectors.length === 0) return null;

    return (
        <group>
            {/* The laser trail leaving the HNSW graph jumps structurally visible */}
            <lineSegments>
                 <primitive object={trailGeometry.current} attach="geometry" />
                 <lineBasicMaterial color="#ffea00" transparent opacity={0.6} linewidth={3} />
            </lineSegments>
            
            {/* The primary pulse reading the node vectors */}
            <mesh ref={meshRef} position={pathVectors[0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="#ffea00" transparent opacity={1} />
            </mesh>
        </group>
    );
}

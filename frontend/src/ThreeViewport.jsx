import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import HNSWMaster from './HNSWMaster';
import { useVectorStore } from './store/store';

export default function ThreeViewport() {
    const setLockedNodeId = useVectorStore((state) => state.setLockedNodeId);
    const setActiveNodeId = useVectorStore((state) => state.setActiveNodeId);

    const handlePointerMissed = () => {
        setLockedNodeId(null);
        setActiveNodeId(null);
    };

    return (
        <Canvas
            shadows
            raycaster={{ params: { Points: { threshold: 0.3 } } }}
            onPointerMissed={handlePointerMissed}
        >
            <color attach="background" args={['#0F1115']} />

            <OrthographicCamera
                makeDefault
                position={[25, 8, 5]}
                zoom={32}
                near={0.1}
                far={1000}
            />

            <ambientLight intensity={0.5} />
            <directionalLight position={[15, 25, 10]} intensity={1.0} />
            <pointLight position={[-10, 15, -10]} intensity={0.4} color="#00f2ff" />

            <HNSWMaster />

            <OrbitControls
                enableRotate={true}
                enableDamping={true}
                dampingFactor={0.05}
                screenSpacePanning={true}
                maxPolarAngle={Math.PI * 0.85}
                minPolarAngle={Math.PI * 0.1}
            />
        </Canvas>
    );
}

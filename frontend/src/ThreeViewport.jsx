import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import HNSWMaster from './HNSWMaster';

export default function ThreeViewport() {
    return (
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
            {/* Matte Black Background */}
            <color attach="background" args={['#0A0A0A']} />
            
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            {/* Floor GridHelper explicitly locked at y=0 */}
            <gridHelper
                position={[0, 0, 0]}
                args={[20, 20, '#D97706', '#4A5568']}
                material-opacity={0.15}
                material-transparent={true}
            />

            <HNSWMaster />
            
            {/* Professional Camera Controls */}
            <OrbitControls 
                makeDefault 
                enableDamping={true} 
                dampingFactor={0.05} 
                maxPolarAngle={Math.PI / 2} // Blocks the camera from dipping below the floor surface
            />
        </Canvas>
    );
}

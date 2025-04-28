import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box } from './components/Box';
import VersionDisplay from './components/VersionDisplay';

function App() {
  return (
    <div className="h-screen w-full bg-gray-900">
      <Canvas className="w-full h-full">
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        <OrbitControls />
      </Canvas>
      <VersionDisplay />
    </div>
  );
}

export default App; 
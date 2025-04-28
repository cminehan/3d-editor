import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function Box(props) {
  const mesh = useRef();

  useFrame((state, delta) => {
    mesh.current.rotation.x += delta;
    mesh.current.rotation.y += delta;
  });

  return (
    <mesh {...props} ref={mesh}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
} 
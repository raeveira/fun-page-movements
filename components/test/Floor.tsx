// components/Floor.tsx
import React from 'react';
import { MeshProps } from '@react-three/fiber';
import * as THREE from 'three';

interface FloorProps extends MeshProps {
  size?: number;
}

const Floor: React.FC<FloorProps> = ({ size = 1000 }) => {
  return (
    <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="lightgreen" />
    </mesh>
  );
};

export default Floor;

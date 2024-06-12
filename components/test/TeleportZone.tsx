// components/TeleportZone.tsx
import React, { useRef } from 'react';
import { MeshProps } from '@react-three/fiber';
import { Mesh, Object3DEventMap } from 'three';
import { useBox } from '@react-three/cannon';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface TeleportZoneProps extends MeshProps {
  position: THREE.Vector3;
  size: THREE.Vector3;
  url: string;
  title: string;
  rotation?: THREE.Euler | [number, number, number]; // Updated rotation type
  onTeleport: () => void;
}

const TeleportZone: React.FC<TeleportZoneProps> = ({
  position,
  size,
  title,
  rotation = new THREE.Euler(0, 0, 0), // Default rotation is Euler(0, 0, 0)
  onTeleport,
}) => {
  const frontRef = useRef<Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], Object3DEventMap>>(null);
  const backRef = useRef<Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[], Object3DEventMap>>(null);

  const [frontApi] = useBox(() => ({
    args: [size.x, size.y, 0.1],
    position: [position.x, position.y, position.z + size.z / 50],
    rotation: rotation instanceof THREE.Euler ? [rotation.x, rotation.y, rotation.z] : rotation,
    collisionFilterGroup: 1,
    onCollide: (e) => {
      const { body } = e;
      if (body) {
        onTeleport();
      }
    },
  }));

  const [backApi] = useBox(() => ({
    args: [size.x, size.y, 0.1],
    position: [position.x, position.y, position.z - size.z / 50],
    rotation: rotation instanceof THREE.Euler ? [rotation.x, rotation.y, rotation.z] : rotation,
    collisionFilterGroup: 2,
  }));

  return (
    <>
      {/* Front face */}
      <mesh ref={frontRef} position={[position.x, position.y, position.z + size.z / 50]} rotation={rotation}>
        <boxGeometry args={[size.x, size.y, 0.1]} />
        <meshStandardMaterial attach="material" color="red" opacity={0.5} transparent />
      </mesh>

      {/* Back face */}
      <mesh ref={backRef} position={[position.x, position.y, position.z - size.z / 50]} rotation={rotation}>
        <boxGeometry args={[size.x, size.y, 0.1]} />
        <meshStandardMaterial attach="material" color="green" opacity={0.5} transparent />
      </mesh>

      {/* Hover text */}
      <Html position={[position.x, position.y + size.y, position.z]}>
        <div style={{ color: 'white', backgroundColor: 'black', padding: '3px', borderRadius: '3px', width: '125px', textAlign: 'center', }}>
          {title}
        </div>
      </Html>
    </>
  );
};

export default TeleportZone;

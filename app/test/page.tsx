// components/Home.tsx
'use client'
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, PointerLockControls } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import PlayerControls from '@/components/test/PlayerControls'; // Adjust import path as per your project structure
import TeleportZone from '@/components/test/TeleportZone'; // Adjust import path as per your project structure
import Skybox from '@/components/test/Skybox'; // Adjust import path as per your project structure
import * as THREE from 'three';
import Floor from '@/components/test/Floor'; // Adjust import path as per your project structure

const Home: React.FC = () => {
  const [showPopup, setShowPopup] = useState(true);
  const speed = 5; // Movement speed

  const teleportZones: {
    position: THREE.Vector3;
    size: THREE.Vector3;
    url: string;
    title: string;
    rotation?: THREE.Euler; // Optional rotation
  }[] = [
    {
      position: new THREE.Vector3(10, 0, 10),
      size: new THREE.Vector3(2, 4, 4),
      url: '#',
      title: 'Example Link 1',
      rotation: new THREE.Euler(0, Math.PI / 4, 0), // Example rotation (45 degrees around Y axis)
    },
    {
      position: new THREE.Vector3(-10, 0, -10),
      size: new THREE.Vector3(2, 4, 4),
      url: '#',
      title: 'Example Link 2',
      rotation: new THREE.Euler(0, -Math.PI / 4, 0), // Example rotation (-45 degrees around Y axis)
    },
  ];

  const handleTeleport = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-gray-100">
      {showPopup && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 text-white z-50">
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-lg font-bold mb-2">Controls</h2>
            <p>Use W, A, S, D keys to move. Use your mouse to look around.</p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 px-4 py-2 bg-blue-500 rounded hover:bg-blue-700"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        {/* Add the Skybox component */}
        <Skybox />

        {/* Add the Floor component */}
        <Floor position={new THREE.Vector3(0, -1, 0)} size={1000} />
        <Physics>
          <PlayerControls initialSpeed={speed} teleportZones={teleportZones} onTeleport={handleTeleport} />
          {teleportZones.map((zone, index) => (
            <TeleportZone
              key={index}
              position={zone.position}
              size={zone.size}
              url={zone.url}
              title={zone.title}
              rotation={zone.rotation}
              onTeleport={() => handleTeleport(zone.url)} // Ensure to pass a function
            />
          ))}
          <PointerLockControls />
        </Physics>
      </Canvas>

      {/* Add a crosshair */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '10px',
          height: '10px',
          backgroundColor: 'red',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
        }}
      />
    </div>
  );
};

export default Home;

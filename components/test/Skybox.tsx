// components/Skybox.tsx
import React from 'react';
import { CubeTextureLoader, CubeCamera, WebGLCubeRenderTarget } from 'three';
import { useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';

const Skybox: React.FC = () => {
  const { scene } = useThree();

  // Load the textures for the skybox
  const loader = new CubeTextureLoader();
  const texture = loader.load([
    '/skybox/px.jpg', // right
    '/skybox/nx.jpg', // left
    '/skybox/py.jpg', // top
    '/skybox/ny.jpg', // bottom
    '/skybox/pz.jpg', // back
    '/skybox/nz.jpg'  // front
  ]);

  // Create a cube camera to render the scene to the skybox
  const cubeRenderTarget = new WebGLCubeRenderTarget(1024);
  const cubeCamera = new CubeCamera(1, 1000, cubeRenderTarget);

  // Update the scene to use the cube camera for reflections
  scene.background = texture;
  scene.environment = cubeRenderTarget.texture;

  return (
    <>
      <primitive object={cubeCamera} attach="camera" />
      <Sky />
    </>
  );
};

export default Skybox;

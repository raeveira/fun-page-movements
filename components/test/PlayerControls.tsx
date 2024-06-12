import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerControlsProps {
  initialSpeed: number; // Use initialSpeed prop to set initial speed
  teleportZones: {
    position: THREE.Vector3;
    size: THREE.Vector3;
    url: string;
    title: string;
  }[];
  onTeleport: (url: string) => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ initialSpeed, teleportZones, onTeleport }) => {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const [speed, setSpeed] = useState(initialSpeed); // State to hold the current speed
  const [originalY, setOriginalY] = useState(camera.position.y); // State to hold the original y position
  const [isCrouching, setIsCrouching] = useState(false); // State to track crouching status
  const [isJumping, setIsJumping] = useState(false); // State to track jumping status
  const crouchHeight = 0.5; // Amount to crouch down
  const jumpHeight = 30; // Height of the jump (adjusted for smoother feel)
  const gravity = 1; // Gravity strength
  const terminalVelocity = -2; // Maximum downward speed

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          moveForward.current = true;
          break;
        case 'KeyS':
          moveBackward.current = true;
          break;
        case 'KeyA':
          moveLeft.current = true;
          break;
        case 'KeyD':
          moveRight.current = true;
          break;
        case 'ShiftLeft':
          setSpeed(10); // Update speed state
          break;
        case 'KeyC':
          if (!isCrouching) {
            setIsCrouching(true);
            setOriginalY(originalY - crouchHeight);
          }
          break;
        case 'Space':
          if (!isJumping && !isCrouching) {
            setIsJumping(true);
            // Apply initial jump velocity (adjusted for smoother feel)
            velocity.current.y = Math.sqrt(2 * jumpHeight * gravity);
          }
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          moveForward.current = false;
          break;
        case 'KeyS':
          moveBackward.current = false;
          break;
        case 'KeyA':
          moveLeft.current = false;
          break;
        case 'KeyD':
          moveRight.current = false;
          break;
        case 'ShiftLeft':
          setSpeed(initialSpeed); // Reset speed state to initial speed
          break;
        case 'KeyC':
          if (isCrouching) {
            setIsCrouching(false);
            setOriginalY(originalY + crouchHeight);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [initialSpeed, isCrouching, originalY, isJumping]); // Ensure dependencies are included

  useFrame(({ clock }, delta) => {
    velocity.current.set(0, 0, 0);

    // Calculate movement direction based on current state and speed
    const moveSpeed = isCrouching ? speed / 2 : speed; // Reduce speed when crouching

    // Determine movement direction based on pressed keys
    const movementVector = new THREE.Vector3();
    if (moveForward.current) movementVector.z = -1;
    if (moveBackward.current) movementVector.z = 1;
    if (moveLeft.current) movementVector.x = -1;
    if (moveRight.current) movementVector.x = 1;

    // Normalize vector to ensure consistent speed in all directions
    movementVector.normalize().multiplyScalar(moveSpeed * delta);

    // Apply movement relative to camera orientation
    velocity.current.add(movementVector.applyQuaternion(camera.quaternion));

    // Apply vertical movement (jumping and gravity)
    if (isJumping) {
      // Apply initial jump velocity (only upward)
      velocity.current.y += jumpHeight * gravity * delta;

      // Apply gravity
      velocity.current.y -= gravity * delta;

      // Limit maximum descent speed
      velocity.current.y = Math.max(velocity.current.y, terminalVelocity);
    } else {
      // Apply normal gravity when not jumping
      velocity.current.y -= gravity * delta;
    }

    // Smoothly move the camera up/down for crouching
    const targetY = isCrouching ? originalY - crouchHeight : originalY;
    const deltaY = targetY - camera.position.y;
    camera.position.y += deltaY * 5 * delta; // Adjust speed as needed for smoothness

    // Ensure vertical movement is within bounds
    if (camera.position.y < originalY - crouchHeight) {
      camera.position.y = originalY - crouchHeight;
    } else if (camera.position.y > originalY) {
      camera.position.y = originalY;
      setIsJumping(false); // Reset jumping state when landing
    }

    // Update camera position
    camera.position.add(velocity.current);

    // Check for collisions with teleport zones
    teleportZones.forEach((zone) => {
      if (
        camera.position.x > zone.position.x - zone.size.x / 2 &&
        camera.position.x < zone.position.x + zone.size.x / 2 &&
        camera.position.z > zone.position.z - zone.size.z / 2 &&
        camera.position.z < zone.position.z + zone.size.z / 2
      ) {
        onTeleport(zone.url);
      }
    });
  });

  return null;
};

export default PlayerControls;

import React, { useRef, useState } from "react";
import { RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

export const ObstacleFlipper = ({ position = [0, 0, 0], scale = [0.35, 0.35, 0.35] }) => {
  const obstacle = useRef();
  const { scene } = useGLTF("/models/obstacle_flipper.glb");

  // Willekeurige snelheid voor variatie
  const [speed] = useState(() => (Math.random() + 0.3) * (Math.random() > 0.5 ? 1 : -1));

  // Rotatie-update via useFrame
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const rotation = new THREE.Quaternion();
    rotation.setFromEuler(new THREE.Euler(0, time * speed, 0));
    if (obstacle.current) {
      obstacle.current.setNextKinematicRotation(rotation);
    }
  });

  return (
    <group position={position} scale={scale}>
      <RigidBody
        ref={obstacle}
        type="kinematicPosition"
        colliders="trimesh"
        friction={0}
        restitution={0.2}
      >
        <primitive object={scene} scale={scale} />
      </RigidBody>
    </group>
  );
};

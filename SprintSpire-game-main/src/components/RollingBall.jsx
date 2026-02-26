import { RigidBody } from "@react-three/rapier";
import React, { useRef, useState, useEffect } from "react";

export const RollingBall = ({ position, radius, removeDistance }) => {
  const ballRef = useRef();

  // Effect om de bal voortdurend te controleren
  useEffect(() => {
    const checkPosition = () => {
      if (ballRef.current) {
        const { z } = ballRef.current.translation(); // Haal de Z-positie van de bal op

        // Controleer of de bal verder dan de removeDistance is gezakt
        if (z <= removeDistance) {
          resetBallPosition(); // Reset de bal als deze onder de drempel is
        }
      }
    };

    const interval = setInterval(checkPosition, 100); // Controleer elke 100ms

    // Opruimen van de interval bij component unmount
    return () => clearInterval(interval);
  }, [removeDistance]);

  // Functie om de positie van de bal te resetten
  const resetBallPosition = () => {
    if (ballRef.current) {
      ballRef.current.setTranslation({ x: position[0], y: position[1], z: position[2] }, false); // Reset de positie
      ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true); // Reset de snelheid naar 0
    }
  };

  return (
    <RigidBody
      ref={ballRef}
      type="dynamic"
      colliders="ball"
      position={position} // Gebruik de initiële positie
      restitution={0.5}
      friction={0.8}
    >
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </RigidBody>
  );
};

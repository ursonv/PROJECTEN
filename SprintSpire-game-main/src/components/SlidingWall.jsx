import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useRef, useState } from "react";

export const SlidingWall = ({ position, size, range, speed }) => {
  const wallRef = useRef();
  const [direction, setDirection] = useState(1); // 1 = vooruit, -1 = achteruit
  const initialZ = position[2]; // Beginpositie op de Z-as

  useFrame((state, delta) => {
    if (wallRef.current) {
      // Haal de huidige positie van de muur op
      const currentPosition = wallRef.current.translation();
      const newZ = currentPosition.z + direction * speed * delta;

      // Controleer of de muur de grenzen bereikt
      if (newZ > initialZ + range) {
        setDirection(-1);
      } else if (newZ < initialZ - range) {
        setDirection(1);
      }

      // Werk de positie bij
      wallRef.current.setTranslation({ x: currentPosition.x, y: currentPosition.y, z: newZ }, true);
    }
  });

  return (
    <RigidBody
      ref={wallRef}
      type="kinematicPosition" // Kinematisch object
      position={position}
      restitution={0.2} // Stuiterbaarheid
      friction={1} // Wrijving
      colliders="cuboid"
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="red" />
      </mesh>
    </RigidBody>
  );
};

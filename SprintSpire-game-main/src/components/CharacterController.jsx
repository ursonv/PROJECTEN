import { useState, useRef, useEffect } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, CuboidCollider, RigidBody } from "@react-three/rapier";
import * as THREE from 'three'; 
import { MathUtils } from 'three'; // Import MathUtils van Three.js
import { degToRad } from "three/src/math/MathUtils.js";
import { Character } from "./Character";

const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

const lerpAngle = (start, end, t) => {
  start = normalizeAngle(start);
  end = normalizeAngle(end);

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += 2 * Math.PI;
    } else {
      end += 2 * Math.PI;
    }
  }

  return normalizeAngle(start + (end - start) * t);
};

export const CharacterController = ({ startPosition = [0, 0, 0], finishPosition = [5, 0, 5] }) => {
  // Vervang de useControls door lokale useState hooks voor de instellingen
  const [walkSpeed, setWalkSpeed] = useState(0.8); // Standaard waarde voor WALK_SPEED
  const [runSpeed, setRunSpeed] = useState(1.6);   // Standaard waarde voor RUN_SPEED
  const [rotationSpeed, setRotationSpeed] = useState(degToRad(0.5)); // Standaard waarde voor ROTATION_SPEED

  const rb = useRef();
  const container = useRef();
  const character = useRef();
  const cameraTarget = useRef(); // Toegevoegd: referentie voor camera target
  const cameraPosition = useRef(); // Toegevoegd: referentie voor camera positie
  const cameraLookAt = useRef(new THREE.Vector3()); // Toegevoegd: doel voor camera
  const cameraWorldPosition = useRef(new THREE.Vector3()); // Toegevoegd: wereldpositie van de camera

  const [animation, setAnimation] = useState("idle");
  const [canMove, setCanMove] = useState(false); // Controleer of de speler mag bewegen
  const [timer, setTimer] = useState(3); // Timer voor beweging (3 seconden)
  const characterRotationTarget = useRef(0);
  const rotationTarget = useRef(0);

  const [, get] = useKeyboardControls();
  const isClicking = useRef(false);

  useEffect(() => {
    // Start de timer bij de eerste render
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanMove(true); // Zet canMove op true wanneer timer op 0 komt
          clearInterval(interval); // Stop de timer
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup interval bij unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Stel de initiële startpositie van de RigidBody in
    if (rb.current) {
      rb.current.setTranslation(
        { x: startPosition[0], y: startPosition[1], z: startPosition[2] },
        true
      );
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    // Event handlers voor muis en touch
    const onMouseDown = () => {
      isClicking.current = true;
    };
    const onMouseUp = () => {
      isClicking.current = false;
    };

    // Voeg event listeners toe
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchstart", onMouseDown);
    document.addEventListener("touchend", onMouseUp);

    // Cleanup: Verwijder event listeners bij unmount
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchstart", onMouseDown);
      document.removeEventListener("touchend", onMouseUp);
    };
  }, [startPosition]);

  useFrame(({ camera, mouse }) => {
    if (!canMove) return; // Controleer of de speler mag bewegen
  
    if (rb.current) {
      const vel = rb.current.linvel();
      const movement = { x: 0, z: 0 };
  
      if (get().forward) movement.z = 1;
      if (get().backward) movement.z = -1;
  
      let speed = get().run ? runSpeed : walkSpeed;
  
      if (isClicking.current) {
        if (Math.abs(mouse.x) > 0.1) movement.x = -mouse.x;
        movement.z = mouse.y + 0.4;
        if (Math.abs(movement.x) > 0.5 || Math.abs(movement.z) > 0.5) speed = runSpeed;
      }
  
      if (get().left) movement.x = 1;
      if (get().right) movement.x = -1;
  
      if (movement.x !== 0) {
        rotationTarget.current += rotationSpeed * movement.x;
      }
  
      if (movement.x !== 0 || movement.z !== 0) {
        characterRotationTarget.current = Math.atan2(movement.x, movement.z);
        vel.x = Math.sin(rotationTarget.current + characterRotationTarget.current) * speed;
        vel.z = Math.cos(rotationTarget.current + characterRotationTarget.current) * speed;
  
        if (speed === runSpeed) setAnimation("run");
        else setAnimation("walk");
      } else {
        setAnimation("idle");
      }
  
      character.current.rotation.y = lerpAngle(character.current.rotation.y, characterRotationTarget.current, 0.1);
      rb.current.setLinvel(vel, true);
    }

    // Controleer of de speler de finish heeft bereikt
    if (rb.current) {
      const position = rb.current.translation();
      // Vergelijk de positie van de speler met de finishpositie
      if (
        Math.abs(position.x - finishPosition[0]) < 1 &&
        Math.abs(position.z - finishPosition[2]) < 1
      ) {
        // Teleporteer de speler terug naar de startpositie
        rb.current.setTranslation(
          { x: startPosition[0], y: startPosition[1], z: startPosition[2] },
          true
        );
      }
    }
  
    // CAMERA logica
    container.current.rotation.y = MathUtils.lerp(container.current.rotation.y, rotationTarget.current, 0.5);
  
    if (cameraPosition.current) {
      cameraPosition.current.getWorldPosition(cameraWorldPosition.current); // Nu cameraWorldPosition is gedefinieerd
      camera.position.lerp(cameraWorldPosition.current, 0.1);
    }

    // Voer de check uit voor cameraTarget voordat je toegang krijgt tot het object
    if (cameraTarget.current) {
      cameraTarget.current.getWorldPosition(cameraLookAt.current);
      cameraLookAt.current.lerp(cameraLookAt.current, 0.1);
  
      camera.lookAt(cameraLookAt.current);
    }
  });
  

  return (
    <RigidBody colliders={false} lockRotations ref={rb}>
      <group ref={container} position={startPosition}>
        <group ref={cameraTarget} position-z={1.5} />
        <group ref={cameraPosition} position-y={4} position-z={-4} />
        <group ref={character}>
          <Character scale={0.2} animation={animation} />
          <CuboidCollider position={[0, 0.2, 0]} args={[0.2, 0.2, 0.2]} />
          <CapsuleCollider args={[0.08, 0.15]} />
        </group>
      </group>

    </RigidBody>
  );
};

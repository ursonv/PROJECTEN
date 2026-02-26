import { Environment, OrthographicCamera } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useRef, useState } from "react";
import { CharacterController } from "./CharacterController";
import { Map } from "./Map";
import { FinishZone } from "./FinishZone";
import { SlidingWall } from "./SlidingWall";
import { RollingBall } from "./RollingBall";
import { ObstacleFlipper } from "./ObstacleFlipper";

const mapConfig = {
  scale: 20,
  position: [-15, -1, 10],
  model: "models/map.glb",
};

export const Experience = ({ canMove, startCountdown, onFinishReached }) => {
  const shadowCameraRef = useRef();
  const [startPosition, setStartPosition] = useState([12.5, 0, -5]);

  const handleFinishReached = () => {
    setStartPosition([12.5, 0, -5]); // Reset de speler naar de startpositie
    startCountdown(); // Begin de countdown opnieuw bij respawn
    onFinishReached();
  };

  return (
    <>
      <Environment preset="sunset" />
      <directionalLight
        intensity={0.65}
        castShadow
        position={[-15, 10, 15]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00005}
      >
        <OrthographicCamera
          left={-22}
          right={15}
          top={10}
          bottom={-20}
          ref={shadowCameraRef}
          attach={"shadow-camera"}
        />
      </directionalLight>
      <Physics gravity={[0, -9.81, 0]} >

        <Map 
          scale={mapConfig.scale}
          position={mapConfig.position}
          model={mapConfig.model}
        />
        <FinishZone position={[-4, -0.5, 6.3]} scale={[.5, 1, 3]} onReachFinish={handleFinishReached} />
        <CharacterController startPosition={startPosition} canMove={canMove} />

        <ObstacleFlipper position={[5, -1.5, 6.6]} scale={[.48, .48, .48]} />

        <SlidingWall
          position={[22, 1.5, 6.2]} 
          size={[.5, 1, 1.5]}       
          range={.6}                
          speed={2}                
        />

        <SlidingWall
          position={[18, 1.5, 6.2]} 
          size={[.5, 1, 1.5]}       
          range={.6}                
          speed={1.5}                
        />

        <SlidingWall
          position={[20, 1.5, 8]} 
          size={[.5, 1, 1]}       
          range={.6}               
          speed={1}                
        />

        <RollingBall position={[24.5, 6, 4]} radius={0.5} removeDistance={-2} />
      </Physics>
    </>
  );
};

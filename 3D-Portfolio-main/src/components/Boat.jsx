import { useEffect, useRef } from 'react';

import { useGLTF, useAnimations } from '@react-three/drei';

const Boat = ({ currentStage, ...props }) => {
    const Boatref = useRef();

    const { scene, animations } = useGLTF('/models/Boat.glb');
    const { actions } = useAnimations(animations, Boatref);

    const audioRef = useRef(new Audio('/audio/Boat.mp3'));
    audioRef.current.volume = 0.02;

    useEffect(() => {
        if (currentStage === 4) {
          actions["boat|boat bodyAction"].play();


          audioRef.current.play();
        } else {
          actions["boat|boat bodyAction"].stop();
          audioRef.current.pause();
          audioRef.current.currentTime = 0; 
        }
      }, [actions, currentStage]);

    //console.log(animations);


    return (
        <mesh { ...props} ref={Boatref}>
            <primitive object={scene}/>
        </mesh>
    )
}

export default Boat;
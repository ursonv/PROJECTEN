import { useEffect, useRef } from 'react';

import { useGLTF, useAnimations } from '@react-three/drei';

const Chest = ({ currentStage, ...props }) => {
    const Chestref = useRef();

    const { scene, animations } = useGLTF('/models/Chest.glb');
    const { actions } = useAnimations(animations, Chestref);

    const audioRef = useRef(new Audio('/audio/Chest.mp3'));

    useEffect(() => {
        if (currentStage === 3) {
          actions["Chest_Open"].play().timeScale = 0.5;

          setTimeout(() => {
            audioRef.current.play();
        }, 1000);

        } else {
          actions["Chest_Open"].stop();
          audioRef.current.pause();
          audioRef.current.currentTime = 0; 
        }
      }, [actions, currentStage]);

    //console.log(animations);


    return (
        <mesh { ...props} ref={Chestref}>
            <primitive object={scene}/>
        </mesh>
    )
}

export default Chest;
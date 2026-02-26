import { useEffect, useRef } from 'react';

import { useGLTF, useAnimations } from '@react-three/drei';

const Character = ({ currentStage, ...props }) => {
    const Characterref = useRef();

    const { scene, animations } = useGLTF('/models/Character.glb');
    const { actions } = useAnimations(animations, Characterref);

    useEffect(() => {
        if (currentStage === 1) {
          actions["CharacterArmature|Wave"].play();
        } else {
          actions["CharacterArmature|Wave"].stop();
        }
      }, [actions, currentStage]);

    //console.log(animations);


    return (
        <mesh { ...props} ref={Characterref}>
            <primitive object={scene}/>
        </mesh>
    )
}

export default Character;
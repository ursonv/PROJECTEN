import { useEffect, useRef } from 'react';

import { useGLTF, useAnimations } from '@react-three/drei';

const Shark = ({ isRotating, ...props }) => {
    const Sharkref = useRef();

    const { scene, animations } = useGLTF('/models/Shark.glb');
    const { actions } = useAnimations(animations, Sharkref);

    useEffect(() => {
        if (isRotating) {
          actions["Armature|Swim"].play();
        } else {
          actions["Armature|Swim"].stop();
        }
      }, [actions, isRotating]);


    return (
        <mesh { ...props} ref={Sharkref}>
            <primitive object={scene}/>
        </mesh>
    )
}

export default Shark;
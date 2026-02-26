import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { a } from '@react-spring/three';
import Boat from './Boat'; 
import Chest from './Chest'; 

import Character from './Character'; 


// {World 3D model from: https://sketchfab.com/3d-models/island-3dd8d58630ff4d5e913b1ea045d3fe48}
const World = ({ isRotating, setIsRotating, setCurrentStage, currentStage, ...props}) => {
    const worldRef = useRef();

    const { gl, viewport } = useThree();
    const { nodes, materials } = useGLTF('/models/world.glb');

    const lastx = useRef(0);
    const rotationSpeed = useRef(0);
    const dampingFactor = 0.95;

    const handlePointerDown = (event) => {
        event.stopPropagation();
        event.preventDefault();
        setIsRotating(true);

        const clientx = event.touches ? event.touches[0].clientX : event.clientX;

        lastx.current = clientx;
    }
    const handlePointerUp = (event) => {
        event.stopPropagation();
        event.preventDefault();
        setIsRotating(false);


    }
    const handlePointermove = (event) => {
        event.stopPropagation();
        event.preventDefault();

        if (isRotating) {
            const clientx = event.touches ? event.touches[0].clientX : event.clientX;
            const delta = (clientx - lastx.current) / viewport.width;
    
            worldRef.current.rotation.y += delta * Math.PI * 0.01;
            lastx.current = clientx;
    
            rotationSpeed.current = delta * 0.01 * Math.PI;
        }

    }

    useFrame(() => {
        if (!isRotating) {
            rotationSpeed.current *= dampingFactor;
            
            if (Math.abs(rotationSpeed.current) < 0.001) {
                rotationSpeed.current = 0;
            }

            worldRef.current.rotation.y += rotationSpeed.current;
        } else {
          const rotation = worldRef.current.rotation.y;
  
          const normalizedRotation = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

          if (normalizedRotation >= 4.45 && normalizedRotation <= 5.2) {
              setCurrentStage(4);
          } else if (
              (normalizedRotation >= 6 && normalizedRotation <= 2 * Math.PI) ||
              (normalizedRotation >= 0 && normalizedRotation <= 0.3)
          ) {
              setCurrentStage(3);
          } else if (normalizedRotation >= 1.2 && normalizedRotation <= 1.8) {
              setCurrentStage(2);
          } else if (normalizedRotation >= 2.5 && normalizedRotation <= 3.75) {
              setCurrentStage(1);
          } else {
              setCurrentStage(null);
          }
  
          //console.log(normalizedRotation);
        }
    });

    useEffect(() => {
        const canvas = gl.domElement;
        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointermove', handlePointermove);
        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointermove', handlePointermove);
        }   
    }, [gl, handlePointerDown, handlePointerUp, handlePointermove]);

    return (
      <a.group ref={worldRef} {...props}>
      <group position={[0, 8.717, 0]} rotation={[0, 0.708, 0]} scale={4.061}>
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh'].geometry}
          material={materials.lighthouse_baked}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_1'].geometry}
          material={materials['Material.001']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_2'].geometry}
          material={materials['01_-_Default']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_3'].geometry}
          material={materials['01_-_Default.001']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_4'].geometry}
          material={materials['08_-_Default']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_5'].geometry}
          material={materials.Wood}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_6'].geometry}
          material={materials.Stone}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_7'].geometry}
          material={materials['02_-_Default']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_8'].geometry}
          material={materials['03_-_Default']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_9'].geometry}
          material={materials['02_-_Default.001']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_10'].geometry}
          material={materials['03_-_Default.001']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_11'].geometry}
          material={materials.mat20}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_12'].geometry}
          material={materials.mat10}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_13'].geometry}
          material={materials.mat17}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_14'].geometry}
          material={materials.mat11}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_15'].geometry}
          material={materials.mat5}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_16'].geometry}
          material={materials.mat12}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_17'].geometry}
          material={materials.mat13}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_18'].geometry}
          material={materials.mat9}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_19'].geometry}
          material={materials.mat15}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_20'].geometry}
          material={materials.mat16}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_21'].geometry}
          material={materials['05_-_Default.001']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_22'].geometry}
          material={materials['05_-_Default.002']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_23'].geometry}
          material={materials['05_-_Default']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_24'].geometry}
          material={materials.mat23}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_25'].geometry}
          material={materials.mat22}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_26'].geometry}
          material={materials['Material.003']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_27'].geometry}
          material={materials.Path}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_28'].geometry}
          material={materials['mat10.001']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_29'].geometry}
          material={materials['mat10.002']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_30'].geometry}
          material={materials['mat10.003']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_31'].geometry}
          material={materials['mat10.004']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_32'].geometry}
          material={materials['mat10.005']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_33'].geometry}
          material={materials['mat10.006']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_34'].geometry}
          material={materials['mat10.007']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_35'].geometry}
          material={materials['mat10.008']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_36'].geometry}
          material={materials['mat10.009']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_37'].geometry}
          material={materials['mat10.010']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_38'].geometry}
          material={materials['mat10.011']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_39'].geometry}
          material={materials['mat10.012']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_40'].geometry}
          material={materials['mat10.013']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_41'].geometry}
          material={materials['mat10.014']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_42'].geometry}
          material={materials['mat10.015']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_43'].geometry}
          material={materials['mat10.016']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_44'].geometry}
          material={materials['mat10.017']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_45'].geometry}
          material={materials['mat10.018']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_46'].geometry}
          material={materials.lambert3SG}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_47'].geometry}
          material={materials.lambert5SG}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_48'].geometry}
          material={materials['Material.007']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_49'].geometry}
          material={materials['Stone.002']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_50'].geometry}
          material={materials['Stone.003']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_51'].geometry}
          material={materials['Stone.004']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_52'].geometry}
          material={materials['Stone.005']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_53'].geometry}
          material={materials['Stone.006']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_54'].geometry}
          material={materials['Stone.007']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_55'].geometry}
          material={materials['mat10.020']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_56'].geometry}
          material={materials['mat10.021']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_57'].geometry}
          material={materials['mat22.011']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_58'].geometry}
          material={materials['mat22.012']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_59'].geometry}
          material={materials['mat22.013']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_60'].geometry}
          material={materials['mat22.014']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_61'].geometry}
          material={materials['mat22.015']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_62'].geometry}
          material={materials['mat22.016']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_63'].geometry}
          material={materials['mat22.017']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_64'].geometry}
          material={materials['mat22.018']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_65'].geometry}
          material={materials['mat13.001']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_66'].geometry}
          material={materials['mat22.019']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_67'].geometry}
          material={materials['mat13.002']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_68'].geometry}
          material={materials['mat22.020']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_69'].geometry}
          material={materials.Atlas}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_70'].geometry}
          material={materials.wood}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_71'].geometry}
          material={materials.Metal}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_72'].geometry}
          material={materials.Black}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_73'].geometry}
          material={materials.mat21}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_74'].geometry}
          material={materials['mat12.001']}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_75'].geometry}
          material={materials.mat8}
        />
        <mesh
          geometry={nodes['lighthouse_Icosphere029-Mesh_76'].geometry}
          material={materials['mat5.002']}
        />
      </group>
      <group position={[5.569, 0.961, -7.997]}>
        <mesh
          geometry={nodes.Flower_4_Group003_1.geometry}
          material={materials['Leaves.008']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_2.geometry}
          material={materials['Flowers.008']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_3.geometry}
          material={materials['Leaves.007']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_4.geometry}
          material={materials['Flowers.007']}
        />
        <mesh
  
          geometry={nodes.Flower_4_Group003_5.geometry}
          material={materials['Flowers.001']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_6.geometry}
          material={materials['Leaves.001']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_7.geometry}
          material={materials['Flowers.002']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_8.geometry}
          material={materials['Leaves.002']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_9.geometry}
          material={materials['Flowers.003']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_10.geometry}
          material={materials['Leaves.003']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_11.geometry}
          material={materials['Flowers.004']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_12.geometry}
          material={materials['Leaves.004']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_13.geometry}
          material={materials['Leaves.005']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_14.geometry}
          material={materials['Flowers.005']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_15.geometry}
          material={materials['Leaves.006']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_16.geometry}
          material={materials['Flowers.006']}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_17.geometry}
          material={materials.Flowers}
        />
        <mesh
          geometry={nodes.Flower_4_Group003_18.geometry}
          material={materials.Leaves}
        />
      </group>
      <mesh
        receiveShadow
        geometry={nodes.Urson_text.geometry}
        material={materials['Material.008']}
        position={[-1.826, 1.076, -9.533]}
        rotation={[1.608, -0.032, 2.735]}
      />
      <mesh

        receiveShadow
        geometry={nodes.portfolio_text.geometry}
        material={materials['Material.004']}
        position={[-1.721, 0.268, -9.636]}
        rotation={[1.608, -0.032, 2.735]}
      />

      <Boat 
        position={[18, -.1, 0]} 
        rotation={[0, 1.2, 0]} 
        scale={[1, 1, 1]} 
        currentStage={currentStage}
      />


      <Chest 
        position={[.9, -.2, 20]} 
        rotation={[0, 0, 0]} 
        scale={[.8, .8, .8]} 
        currentStage={currentStage}
      />

      <Character 
        position={[3, -.1, -15]} 
        rotation={[0, 3, 0]} 
        scale={[1.75, 1.75, 1.75]} 
        currentStage={currentStage}
      />
      </a.group>
    )
}

export default World;

import { Suspense, useRef, useState, useEffect } from "react"; 
import { Canvas } from '@react-three/fiber';
import Loader from "./helpers/Loader";
import World from "./components/World";
import Shark from "./components/Shark";
import Popup from "./Popup";

const Home = () => {
 const musicRef = useRef(new Audio('/audio/Caribean.mp3'));
 musicRef.current.volume = 0.01;
 musicRef.current.loop = true;

 const [isPlaying, setIsPlaying] = useState(false);

 const [isRotating, setIsRotating] = useState(false);
 const [currentStage, setCurrentStage] = useState(1);

 useEffect(() => {
    if (isPlaying) {
      musicRef.current.play();
    }

    return () => {
      musicRef.current.pause();
    }
 }, [isPlaying]);

  return (
    <section className='w-full h-screen relative backgroundColor'>
      <div className="absolute top-10 left-0 right-0 z-10 flex items-center justify-center">
        {currentStage && <Popup currentStage={currentStage}/>}
      </div>
        <Canvas className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`} camera={{ near: 0.2, far: 800 }}>
            <Suspense fallback={<Loader />}>
            <directionalLight position={[1, 1, 1]} intensity={2} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 5, 10]} intensity={2} />


            <World 
            position={[0, -5, -43.4]}
            rotation={[0.1, 3.25, 0]}

            scale={[1.2, 1.2, 1.2]}
            isRotating={isRotating}
            setIsRotating={setIsRotating}
            setCurrentStage={setCurrentStage}
            currentStage={currentStage}
            />

            <Shark 
            position={[0, -8.5, -16]}
            scale={[0.5, 0.5, 0.5]}
            rotation={[0, 20.5, 0]}
            isRotating={isRotating}

            />
            </Suspense>
        </Canvas>

        <div className="absolute top-2 right-2">
          <img src={!isPlaying ? "/img/sound-off.svg" : "/img/sound-on.svg" } alt="musicicon" className="w-10 h-10 cursor-pointer object-contain" onClick={() => setIsPlaying(!isPlaying)} />
        </div>
        <div className="absolute bottom-2 left-2">
          <a href="mailto:ursonvermeersch@hotmail.com">
            <img src="/img/mail.svg" alt="mail" className="w-10 h-10 cursor-pointer object-contain"/>
          </a>
        </div>
        <div className="absolute bottom-2 left-16">
          <a href="https://github.com/ursonv">
            <img src="/img/github.svg" alt="github" className="w-10 h-10 cursor-pointer object-contain"/>
          </a>
        </div>
        <div className="absolute top-2 left-2">
          <a href="/references">
            <img src="/img/references.svg" alt="references" className="w-10 h-10 cursor-pointer object-contain"/>
          </a>
        </div>

        <div className="absolute bottom-2 right-2">
            <img src="/img/drag-right.svg" alt="drag-right" className="w-10 h-10 object-contain"/>
        </div>
        <div className="absolute bottom-2 right-12">
            <img src="/img/drag-left.svg" alt="drag-left" className="w-10 h-10 object-contain"/>
        </div>
    </section>
  );
};

export default Home;

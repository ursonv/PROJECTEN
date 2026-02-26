import { useRef, useEffect } from "react";
import { Box } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export const FinishZone = ({ position, scale = [1, 0.1, 5], onReachFinish }) => {
  const finishZoneRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    const checkFinishZone = () => {
      if (!finishZoneRef.current) return;

      const finishZonePosition = finishZoneRef.current.position;
      const distance = camera.position.distanceTo(finishZonePosition);

      // Check if the player is close enough to the finish zone
      if (distance < 5) {  // 5 is the threshold for how close the player needs to be
        onReachFinish(); // Trigger reset
      }
    };

    const interval = setInterval(checkFinishZone, 100); // Check every 100 ms

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [camera.position, onReachFinish]);

  return (
    <Box
      ref={finishZoneRef}
      position={position}
      scale={scale}
    >
      <meshStandardMaterial color="yellow" transparent opacity={0} />
    </Box>
  );
};

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Room from "./Room";
import AxesWithTicks from "./AxesWithTicks";

const RotatingCubeWrapper = ({ length, width, height }) => {
  return (
    <div className="room-canvas-shell">
      <Canvas camera={{ position: [0, Math.max(height / 2, 1.6), Math.max(width * 2.4, 4.5)], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[length / 2, height * 1.25, width]} intensity={1} />

        <OrbitControls />
        <AxesWithTicks />
        <Room length={length} width={width} height={height} />
      </Canvas>
    </div>
  );
};

export default RotatingCubeWrapper;

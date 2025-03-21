import React, { useState, useEffect, useRef, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber"; // Importing the Canvas component from @react-three/fiber
import { OrbitControls } from "@react-three/drei"; // Import OrbitControls from @react-three/drei
import Room from "./Room";
import AxesWithTicks from "./AxesWithTicks";
import handleMouseMove from "./mouseRaycastHandler";

import * as THREE from "three";

const RotatingCube = () => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
};

const SmallCube = () => {
  return (
    <mesh>
      <boxGeometry args={[0.01, 0.01, 0.01]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

const RotatingCubeWrapper = ({ raycastingEnabled, placeNewCupBoard }) => {
  const length = 3;
  const width = 2;
  const height = 3;

  return (
    <div style={{ height: "100vh", width: "100vh", margin: 0 }}>
      {/* Canvas for 3D scene */}
      <Canvas camera={{ position: [0, height / 2, 2 * width] }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[length / 2, height, width / 2]} intensity={1} />

        <OrbitControls />

        <AxesWithTicks />

        <Room
          length={length}
          width={width}
          height={height}
          raycastingEnabled={raycastingEnabled}
          placeNewCupBoard={placeNewCupBoard}
        />
        {/* <RotatingCube /> */}
      </Canvas>
    </div>
  );
};

export default RotatingCubeWrapper;

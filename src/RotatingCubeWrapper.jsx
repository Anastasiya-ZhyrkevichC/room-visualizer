import React, { useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';  // Importing the Canvas component from @react-three/fiber
import { OrbitControls } from '@react-three/drei'; // Import OrbitControls from @react-three/drei
import Room from './Room';


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
}

const RotatingCubeWrapper = () => {
  return (
    <div style={{ height: '100vh', margin: 0 }}>
      {/* Canvas for 3D scene */}
      <Canvas camera={{ position: [0, 0, 5] }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />

        <OrbitControls/>

        {/* Rotating Cube */}
        {/* <RotatingCube/> */}
        <Room  length={3} width={2} height={3} />

      </Canvas>
    </div>
  );
};

export default RotatingCubeWrapper;

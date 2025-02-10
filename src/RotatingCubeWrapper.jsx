import React from 'react';
import { Canvas } from '@react-three/fiber';  // Importing the Canvas component from @react-three/fiber
import { useFrame } from '@react-three/fiber'; // Importing useFrame hook for animation
import { OrbitControls } from '@react-three/drei'; // Import OrbitControls from @react-three/drei



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
      <Canvas>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />

        <OrbitControls/>

        {/* Rotating Cube */}
        <RotatingCube/>

      </Canvas>
    </div>
  );
};

export default RotatingCubeWrapper;

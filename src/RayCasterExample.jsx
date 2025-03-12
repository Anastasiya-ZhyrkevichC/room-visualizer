import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// In order to use this Component, You need to have the following code within App.js
//
//
// function App() {
//   return <RaycastExample />;
// }

// export default App;


const RaycastLogic = () => {
  const [intersectedObject, setIntersectedObject] = useState(null);
  const boxRef = useRef();
  const sphereRef = useRef();

  // The useThree hook should be used inside the Canvas
  const { camera, gl } = useThree();

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const canvas = gl.domElement; // Get the canvas element

    const onClick = (event) => {
      // Get bounding rect of the canvas
      const rect = canvas.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the raycaster with camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Get the intersected objects
      const intersects = raycaster.intersectObjects([boxRef.current, sphereRef.current]);

      console.log(intersects.length);

      if (intersects.length > 0) {
        // Set the intersected object
        setIntersectedObject(intersects[0].object);
      } else {
        setIntersectedObject(null);
      }
    };

    gl.domElement.addEventListener("click", onClick);

    return () => {
      gl.domElement.removeEventListener("click", onClick);
    };
  }, [camera, gl]);

  return (
    <>
      {/* Box with a reference */}
      <mesh ref={boxRef} position={[-1.2, 0, 0]} onClick={() => console.log("Box clicked")}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={intersectedObject === boxRef.current ? "red" : "blue"} />
      </mesh>
      {/* Sphere with a reference */}
      <mesh ref={sphereRef} position={[1.2, 0, 0]} onClick={() => console.log("Sphere clicked")}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={intersectedObject === sphereRef.current ? "green" : "purple"} />
      </mesh>
    </>
  );
};

const RaycastExample = () => {
  return (
    <Canvas>
      <OrbitControls />
      {/* Box with a reference */}
      <RaycastLogic />
    </Canvas>
  );
};

export default RaycastExample;

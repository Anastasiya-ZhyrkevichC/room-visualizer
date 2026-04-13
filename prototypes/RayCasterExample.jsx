import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";

// Archived prototype kept outside src so it does not add noise to the production app path.

const RaycastLogic = () => {
  const [intersectedObject, setIntersectedObject] = useState(null);
  const boxRef = useRef();
  const sphereRef = useRef();
  const { camera, gl } = useThree();

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const canvas = gl.domElement;

    const onClick = (event) => {
      const rect = canvas.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects([boxRef.current, sphereRef.current]);

      if (intersects.length > 0) {
        setIntersectedObject(intersects[0].object);
      } else {
        setIntersectedObject(null);
      }
    };

    canvas.addEventListener("click", onClick);

    return () => {
      canvas.removeEventListener("click", onClick);
    };
  }, [camera, gl]);

  return (
    <>
      <mesh ref={boxRef} position={[-1.2, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={intersectedObject === boxRef.current ? "red" : "blue"} />
      </mesh>
      <mesh ref={sphereRef} position={[1.2, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={intersectedObject === sphereRef.current ? "green" : "purple"} />
      </mesh>
    </>
  );
};

const RayCasterExample = () => {
  return (
    <Canvas>
      <OrbitControls />
      <RaycastLogic />
    </Canvas>
  );
};

export default RayCasterExample;

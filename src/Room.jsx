import React, { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";

import { RoomProvider, useRoom, PositionAdjuster } from "./RoomProvider";
import handleMouseMove from "./mouseRaycastHandler";

import * as THREE from "three";

const RoomBox = forwardRef(({ position, size }, ref) => {
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="lightgray"
        transparent={true}  // Enable transparency
        opacity={0}    // Adjust transparency (0 = fully invisible, 1 = solid)
        depthWrite={false}
      />
    </mesh>
  );
});


const Wall = ({ position, rotation, size }) => {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial color="lightgray" />
    </mesh>
  );
};

const LeftVerticalWall = ({ position, size }) => {
  const rotation = [0, Math.PI / 2, 0];
  return <Wall position={position} rotation={rotation} size={size} />;
};

const RightVerticalWall = ({ position, size }) => {
  const rotation = [0, -Math.PI / 2, 0];
  return <Wall position={position} rotation={rotation} size={size} />;
};

const BackWall = ({ position, size }) => {
  const rotation = [0, 0, 0];
  return <Wall position={position} rotation={rotation} size={size} />;
};

const Floor = ({ position, size }) => {
  const rotation = [-Math.PI / 2, 0, 0];
  return <Wall position={position} rotation={rotation} size={size} />;
};

// Decided to have a room, left-below corner in (-length / 2, 0, 0) position.
// Later I can move that corner to any other place using `RoomProvider` and `PositionAdjuster`
// All objects have centers in the center of the object.
const Room = ({ length, width, height, raycastingEnabled }) => {

  const roomBoxRef = useRef();
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const [boxPosition, setBoxPosition] = useState(null);

  // Callback function to use the external handler
  const onMouseMove = useCallback(
    (event) => handleMouseMove(event, raycaster.current, mouse.current, camera, roomBoxRef, setBoxPosition, raycastingEnabled, gl),
    [raycastingEnabled, camera, gl]
  );

  // Enable/disable mousemove event listener
  useEffect(() => {
    if (raycastingEnabled) {
      gl.domElement.addEventListener("mousemove", onMouseMove);
    } else {
      gl.domElement.removeEventListener("mousemove", onMouseMove);
    }
    return () => gl.domElement.removeEventListener("mousemove", onMouseMove);
  }, [raycastingEnabled, gl.domElement, onMouseMove]);



  return (
    <>
      <RoomProvider length={length} width={width} height={height}>
        <PositionAdjuster>
          {/* Walls */}
          <LeftVerticalWall position={[0, height / 2, width / 2]} size={[width, height]} />
          <RightVerticalWall position={[length, height / 2, width / 2]} size={[width, height]} />
          <BackWall position={[length / 2, height / 2, 0]} size={[length, height]} />

          {/* Floor */}
          <Floor position={[length / 2, 0, width / 2]} size={[length, width]} />

          {/* Invisible Room */}
          <RoomBox ref={roomBoxRef} position={[length / 2, height / 2, width / 2]} size={[length, height, width]}/>

        </PositionAdjuster>
      </RoomProvider>
    </>
  );
};

export default Room;

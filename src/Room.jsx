import React, { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";

import { RoomProvider, useRoom, PositionAdjuster } from "./RoomProvider";
import { handleMouseMoveInRoom, applyRaycastIntersectionCallback } from "./mouseRaycastHandler";
import RoomRefStore from "./RoomRefStore";

import * as THREE from "three";
import { SolidCupboard } from "./CupBoard";
import { Vector3 } from "three";
import BoxPlacer from "./CupBoardPlacer";

const RoomBox = forwardRef(({ position, size, children }, ref) => {
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="lightgray"
        transparent={true} // Enable transparency
        opacity={0.3} // Adjust transparency (0 = fully invisible, 1 = solid)
        depthWrite={false}
      />
      {children}
    </mesh>
  );
});

const Wall = forwardRef(({ position, rotation, size }, ref) => {
  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial color="lightgray" />
    </mesh>
  );
});

const LeftVerticalWall = forwardRef(({ position, size }, ref) => {
  const rotation = [0, Math.PI / 2, 0];
  return <Wall ref={ref} position={position} rotation={rotation} size={size} />;
});

const RightVerticalWall = forwardRef(({ position, size }, ref) => {
  const rotation = [0, -Math.PI / 2, 0];
  return <Wall ref={ref} position={position} rotation={rotation} size={size} />;
});

const BackWall = forwardRef(({ position, size }, ref) => {
  const rotation = [0, 0, 0];
  return <Wall ref={ref} position={position} rotation={rotation} size={size} />;
});

const Floor = forwardRef(({ position, size }, ref) => {
  const rotation = [-Math.PI / 2, 0, 0];
  return <Wall ref={ref} position={position} rotation={rotation} size={size} />;
});

// Room component
const Room = ({ length, width, height, raycastingEnabled, placeNewCupBoard }) => {
  const roomBoxRef = useRef();
  const floorRef = useRef(null);
  const leftWallRef = useRef(null);
  const rightWallRef = useRef(null);
  const backWallRef = useRef(null);

  useEffect(() => {
    RoomRefStore.setFloor(floorRef);
    RoomRefStore.setLeftWall(leftWallRef);
    RoomRefStore.setRightWall(rightWallRef);
    RoomRefStore.setBackWall(backWallRef);
    RoomRefStore.setRoomCenter(new Vector3(0, height / 2, width / 2));
  }, []);

  return (
    <>
      <RoomProvider length={length} width={width} height={height}>
        \{/* Invisible Room */}
        <RoomBox ref={roomBoxRef} position={[0, height / 2, width / 2]} size={[length, height, width]}>
          {/* <RoomBox ref={roomBoxRef} position={[10, 5, 5]} size={[length, height, width]}> */}
          {/* Walls */}
          <LeftVerticalWall ref={leftWallRef} position={[-length / 2, 0, 0]} size={[width, height]} />
          <RightVerticalWall ref={rightWallRef} position={[length / 2, 0, 0]} size={[width, height]} />
          <BackWall ref={backWallRef} position={[0, 0, -width / 2]} size={[length, height]} />

          {/* Floor */}
          <Floor ref={floorRef} position={[0, -height / 2, 0]} size={[length, width]} />

          <BoxPlacer raycastingEnabled={raycastingEnabled} placeNewCupBoard={placeNewCupBoard} />
        </RoomBox>
      </RoomProvider>
    </>
  );
};

export default Room;

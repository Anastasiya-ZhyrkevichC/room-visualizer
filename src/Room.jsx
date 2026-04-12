import React, { useEffect, useRef, forwardRef } from "react";

import { RoomProvider } from "./RoomProvider";
import RoomRefStore from "./RoomRefStore";

import { Vector3 } from "three";
import CupBoardRenderer from "./CupBoardRenderer";

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
const Room = ({ length, width, height }) => {
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
  }, [height, width]);

  return (
    <>
      <RoomProvider length={length} width={width} height={height}>
        {/* Invisible Room */}
        <RoomBox ref={roomBoxRef} position={[0, height / 2, width / 2]} size={[length, height, width]}>
          {/* <RoomBox ref={roomBoxRef} position={[10, 5, 5]} size={[length, height, width]}> */}
          {/* Walls */}
          <LeftVerticalWall ref={leftWallRef} position={[-length / 2, 0, 0]} size={[width, height]} />
          <RightVerticalWall ref={rightWallRef} position={[length / 2, 0, 0]} size={[width, height]} />
          <BackWall ref={backWallRef} position={[0, 0, -width / 2]} size={[length, height]} />

          {/* Floor */}
          <Floor ref={floorRef} position={[0, -height / 2, 0]} size={[length, width]} />

          <CupBoardRenderer />
        </RoomBox>
      </RoomProvider>
    </>
  );
};

export default Room;

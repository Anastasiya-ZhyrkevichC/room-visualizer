import React from "react";

import CupboardRenderer from "../../cupboards/components/CupboardRenderer";
import { useRoomScene } from "../context/RoomSceneContext";
import FloorPlane from "./FloorPlane";
import RoomBox from "./RoomBox";
import WallPlane from "./WallPlane";

const RoomShell = () => {
  const { bounds, dimensions, roomPosition } = useRoomScene();

  return (
    <RoomBox
      position={[roomPosition.x, roomPosition.y, roomPosition.z]}
      size={[dimensions.length, dimensions.height, dimensions.width]}
    >
      <WallPlane
        position={[bounds.left, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        size={[dimensions.width, dimensions.height]}
      />
      <WallPlane
        position={[bounds.right, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        size={[dimensions.width, dimensions.height]}
      />
      <WallPlane position={[0, 0, bounds.back]} rotation={[0, 0, 0]} size={[dimensions.length, dimensions.height]} />
      <FloorPlane position={[0, bounds.floor, 0]} size={[dimensions.length, dimensions.width]} />
      <CupboardRenderer />
    </RoomBox>
  );
};

export default RoomShell;

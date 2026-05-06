import React from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { useCupboards } from "../../cupboards/state/CupboardProvider";
import CupboardMoveController from "./CupboardMoveController";
import CupboardResizeController from "./CupboardResizeController";
import { useRoomScene } from "../context/RoomSceneContext";
import PlacementPreviewController from "./PlacementPreviewController";
import RoomShell from "./RoomShell";
import SceneAxes from "./SceneAxes";

const RoomCanvas = () => {
  const { clearSelection, isMoveActive, isPlacementActive, isResizeActive } = useCupboards();
  const { dimensions } = useRoomScene();
  const longestRoomSide = Math.max(dimensions.length, dimensions.width);
  const cameraTarget = [0, dimensions.height / 2, dimensions.width / 2];
  const cameraPosition = [
    Math.max(dimensions.length * 0.55, 2.2),
    Math.max(dimensions.height * 0.85, 2.2),
    dimensions.width + Math.max(longestRoomSide * 1.45, 5.5),
  ];

  return (
    <div className="room-canvas-shell">
      <Canvas
        camera={{
          position: cameraPosition,
          fov: 45,
        }}
        onPointerMissed={() => {
          if (!isMoveActive && !isPlacementActive && !isResizeActive) {
            clearSelection();
          }
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[dimensions.length / 2, dimensions.height * 1.25, dimensions.width]}
          intensity={1}
        />

        <OrbitControls
          enabled={!isPlacementActive && !isMoveActive && !isResizeActive}
          target={cameraTarget}
        />
        <CupboardMoveController />
        <CupboardResizeController />
        <PlacementPreviewController />
        <SceneAxes />
        <RoomShell />
      </Canvas>
    </div>
  );
};

export default RoomCanvas;
